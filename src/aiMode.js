const CONNECT_TIMEOUT_MS = 10_000;
const STALL_TIMEOUT_MS = 15_000;

// The Worker's system prompt requires every reply to start with a
// §SRC:key1,key2§ citation header before the human-readable text (see
// buildSystemPrompt() in worker/src/index.js). We buffer the start of the
// stream until we can match/strip it, so it never flashes on screen.
const SOURCE_HEADER_RE = /^§SRC:([^§]*)§\n*/;
const SOURCE_HEADER_MAX_WAIT = 120;

/**
 * Talks to the Cloudflare Worker proxy. Request contract:
 *   POST endpoint
 *   body: { lang, resume, story, messages: [{ role: "user" | "assistant", content }] }
 *   response: streamed plain-text chunks (the Worker owns the system prompt,
 *   guardrails, and upstream LLM's SSE framing — the client only ever sees text).
 *   `story` is optional narrative content (see STORY_GUIDE.md); omit or pass
 *   null/undefined if content/<lang>/story.json isn't used.
 *   Each reply's text begins with a §SRC:key1,key2§ citation header, stripped
 *   client-side and surfaced as `sourceKeys` on chat.streamBotMessage().finish().
 */
export function createAiMode({ chat, endpoint, lang, resume, story }) {
  const history = [];

  async function send(userText) {
    chat.addUserMessage(userText);
    history.push({ role: "user", content: userText });

    const controller = new AbortController();
    let timer = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
    const stream = chat.streamBotMessage();

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, resume, story, messages: history }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok || !res.body) {
        throw new Error(`AI backend responded with ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let preHeaderBuffer = "";
      let headerResolved = false;
      let sourceKeys = null;
      // The blank line the model leaves after the header sometimes lands in a
      // separate chunk from the header itself — keep swallowing leading
      // newlines until real content shows up, so it never renders as a gap.
      let trimLeadingNewlines = false;

      function emit(text) {
        if (trimLeadingNewlines) {
          text = text.replace(/^\n+/, "");
          if (!text) return;
          trimLeadingNewlines = false;
        }
        full += text;
        stream.append(text);
      }

      while (true) {
        timer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
        const { done, value } = await reader.read();
        clearTimeout(timer);
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (headerResolved) {
          emit(chunk);
          continue;
        }

        preHeaderBuffer += chunk;
        const match = preHeaderBuffer.match(SOURCE_HEADER_RE);
        if (match) {
          sourceKeys = match[1]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
          headerResolved = true;
          trimLeadingNewlines = true;
          emit(preHeaderBuffer.slice(match[0].length));
        } else if (preHeaderBuffer.length >= SOURCE_HEADER_MAX_WAIT) {
          // Model didn't emit the header format — degrade gracefully, no badge.
          headerResolved = true;
          sourceKeys = null;
          emit(preHeaderBuffer);
        }
      }

      if (!headerResolved && preHeaderBuffer) {
        full += preHeaderBuffer;
        stream.append(preHeaderBuffer);
      }

      stream.finish(sourceKeys);

      if (!full.trim()) {
        throw new Error("AI backend returned an empty response");
      }

      history.push({ role: "assistant", content: full });
      return { ok: true };
    } catch (error) {
      clearTimeout(timer);
      stream.cancel();
      history.pop();
      return { ok: false, error };
    }
  }

  return { send };
}
