# Signal Sifter Worker

A Cloudflare Worker that proxies chat requests to Groq's free-tier Llama 3.3
70B API. It owns the system prompt, the CV-grounding guardrails, CORS, and a
best-effort per-IP rate limit — the frontend never talks to Groq directly.

This is optional. If you don't deploy it (or leave `aiMode.enabled: false` in
`content/config.json`), the site works fully in static mode with zero backend.

## Request contract

```
POST <your-worker-url>
Content-Type: application/json

{
  "lang": "tr" | "en",
  "resume": { ...content/<lang>/resume.json... },
  "story": { ...content/<lang>/story.json... },        // optional
  "messages": [{ "role": "user" | "assistant", "content": "..." }],
  "mode": "represent" | "practice",                     // optional, default "represent"
  "persona": "hr" | "manager"                           // optional, practice only, default "hr"
}
```

Response: `200` with a streamed `text/plain` body (plain text chunks, not
SSE — the Worker already unwraps Groq's event stream). Non-2xx on error; the
frontend falls back to static mode automatically when that happens.

### Response format per mode

**`represent`** (default — the AI speaks *as* the candidate to visitors):
every reply starts with a machine-readable citation header on its own first
line, `§SRC:key1,key2§`, listing which résumé/story fields the answer drew
on (closed key list built from the data; `none` for greetings/refusals). The
client strips it and renders source badges.

**`practice`** (the AI plays the *interviewer* and coaches the candidate):
no `§SRC` header. Replies are structured with markers the client splits into
separate bubbles:

```
first turn ([START_INTERVIEW]):   §Q§\n<greeting + first question>
after each candidate answer:      §COACH§\n<coaching, ≤4 sentences>\n§Q§\n<next question>
final evaluation (~question 6):   §COACH§\n<2 strengths, 2 growth priorities, hiring signal>
```

A structured reply without a `§Q§` section ends the interview. Practice runs
at `temperature 0.5, max_tokens 700` (represent: `0.4/600`).

### Practice-mode security & cost notes

- Practice mode exposes **no new data**: the client already sends the résumé
  and story JSON on every request in both modes, and `sanitizeMessages`
  strips injected `system`-role messages identically.
- The `?practice=1` entrance is hidden, not secret (the code is public). The
  worst case is rate-limited token spend on your Groq key.
- Token budget: a full practice session (~6 questions with coaching) costs
  roughly 35–50k tokens, so Groq's free tier (100k tokens/day) covers about
  two sessions a day plus normal visitor traffic.

## Deploy

1. [Sign up for Groq](https://console.groq.com/) and grab a free API key.
2. `cd worker && npm install`
3. `npx wrangler login`
4. `npx wrangler secret put GROQ_API_KEY` and paste your Groq key when prompted.
5. Deploy the site (GitHub Pages) first so you know its URL, then edit
   `wrangler.toml`'s `ALLOWED_ORIGIN` to that exact origin (e.g.
   `https://username.github.io`). Leaving it as `"*"` works but lets any site
   call your Worker.
6. `npm run deploy` — prints your Worker's URL
   (`https://signal-sifter-worker.<your-subdomain>.workers.dev`).
7. Back in the site repo, set `content/config.json`:
   ```json
   "aiMode": { "enabled": true, "endpoint": "https://signal-sifter-worker.<your-subdomain>.workers.dev" }
   ```
   and redeploy the site.

## Local development

`npm run dev` runs the Worker locally via `wrangler dev` (needs the
`GROQ_API_KEY` secret set, or `wrangler dev --local` with a `.dev.vars` file
containing `GROQ_API_KEY=...` for local-only testing). Point the site's
`content/config.json` `aiMode.endpoint` at the printed local URL
(typically `http://localhost:8787`) while testing.

## Notes

- `RATE_LIMIT_PER_MINUTE` (default `10`) is enforced with an in-memory map
  scoped to the Worker isolate. Cloudflare recycles isolates, so this blunts
  casual abuse rather than guaranteeing an exact global limit — good enough
  for a personal site on the free tier without paying for KV/Durable Objects.
- The résumé JSON is sent by the client on every request and embedded
  directly in the system prompt (no vector DB / RAG — a résumé comfortably
  fits in an LLM context window).
- Any `system`-role message the client sends is stripped before it reaches
  Groq, so the guardrails can't be overridden from the browser.
