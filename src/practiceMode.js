const CONNECT_TIMEOUT_MS = 10_000;
const STALL_TIMEOUT_MS = 15_000;

// Practice replies are structured with machine-readable markers (see
// buildPracticeSystemPrompt() in worker/src/index.js):
//   first turn:   §Q§\n<greeting + first question>
//   normal turn:  §COACH§\n<coaching>\n§Q§\n<next question>
//   final turn:   §COACH§\n<final evaluation>          (no §Q§ → interview over)
// The stream is split on these markers into separate bubbles, reusing the
// buffered-header technique from aiMode.js. If no marker shows up within the
// first DETECT_MAX_WAIT chars, the reply degrades to a single plain bubble.
const MARKERS = ["§COACH§", "§Q§"];
const DETECT_MAX_WAIT = 40;
const START_TOKEN = "[START_INTERVIEW]";

function findMarker(text) {
  let best = null;
  for (const marker of MARKERS) {
    const index = text.indexOf(marker);
    if (index !== -1 && (!best || index < best.index)) best = { index, marker };
  }
  return best;
}

// Length of the trailing substring that could still turn out to be the start
// of a marker once the next chunk arrives — held back instead of rendered.
function partialMarkerTailLength(text) {
  const max = Math.max(...MARKERS.map((m) => m.length)) - 1;
  for (let len = Math.min(max, text.length); len > 0; len--) {
    const tail = text.slice(-len);
    if (MARKERS.some((m) => m.startsWith(tail))) return len;
  }
  return 0;
}

/**
 * Interview-practice client for the same Worker endpoint as aiMode.js, with
 * `mode: "practice"` and a `persona` ("hr" | "manager") added to the body.
 * History keeps the assistant's raw text including markers, so the model sees
 * its own output format in-context and stays consistent with it.
 */
export function createPracticeMode({ chat, endpoint, lang, resume, story, persona }) {
  const history = [];

  function start() {
    return exchange(START_TOKEN, { render: false });
  }

  function send(userText) {
    return exchange(userText, { render: true });
  }

  async function exchange(userText, { render }) {
    if (render) chat.addUserMessage(userText);
    history.push({ role: "user", content: userText });

    const controller = new AbortController();
    let timer = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);

    const segments = [];
    let current = null;
    let sawMarker = false;
    let sawQuestion = false;
    let trimLeadingNewlines = false;
    let full = "";
    let pending = "";

    function openSegment(kind) {
      if (current) current.finish();
      current = kind === "coach" ? chat.streamCoachMessage() : chat.streamBotMessage();
      segments.push(current);
      trimLeadingNewlines = true;
    }

    function emitText(text) {
      if (!current) openSegment("question");
      if (trimLeadingNewlines) {
        text = text.replace(/^\n+/, "");
        if (!text) return;
        trimLeadingNewlines = false;
      }
      current.append(text);
    }

    function process(chunk, isFinal) {
      full += chunk;
      pending += chunk;

      while (true) {
        const hit = findMarker(pending);
        if (hit) {
          sawMarker = true;
          if (hit.index > 0) emitText(pending.slice(0, hit.index));
          pending = pending.slice(hit.index + hit.marker.length);
          openSegment(hit.marker === "§COACH§" ? "coach" : "question");
          if (hit.marker === "§Q§") sawQuestion = true;
          continue;
        }

        if (isFinal) {
          if (pending) emitText(pending);
          pending = "";
          return;
        }

        // Keep buffering until we either see a marker or give up on the
        // format (degrade to one plain bubble). Either way, never emit a
        // trailing fragment that could still complete into a marker.
        if (!sawMarker && pending.length < DETECT_MAX_WAIT) return;
        const hold = partialMarkerTailLength(pending);
        const emit = pending.slice(0, pending.length - hold);
        if (emit) {
          emitText(emit);
          pending = pending.slice(emit.length);
        }
        return;
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, resume, story, messages: history, mode: "practice", persona }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok || !res.body) {
        const error = new Error(`AI backend responded with ${res.status}`);
        error.status = res.status;
        throw error;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        timer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
        const { done, value } = await reader.read();
        clearTimeout(timer);
        if (done) break;
        process(decoder.decode(value, { stream: true }), false);
      }
      process(decoder.decode(), true);

      if (current) current.finish();

      if (!full.trim()) {
        throw new Error("AI backend returned an empty response");
      }

      history.push({ role: "assistant", content: full });
      // A structured reply without a §Q§ section is the final evaluation.
      return { ok: true, ended: sawMarker && !sawQuestion };
    } catch (error) {
      clearTimeout(timer);
      for (const segment of segments) segment.cancel();
      history.pop();
      return { ok: false, error };
    }
  }

  return { start, send };
}
