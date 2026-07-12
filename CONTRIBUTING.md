# Contributing to Signal Sifter

Thanks for your interest! Contributions of every size are welcome — bug
reports, translations, docs fixes, and features.

## Quick start for contributors

```bash
git clone https://github.com/<you>/resume-signal-sifter
cd resume-signal-sifter
npm install
npm run dev        # static mode, no keys needed
npm run mock       # optional: fake AI backend on :8788 (zero tokens)
```

To develop against the mock AI backend, run Vite with the endpoint override
(config.json stays untouched):

```bash
VITE_AI_ENDPOINT=http://127.0.0.1:8788 npm run dev
```

Worker code lives in `worker/` (`cd worker && npm install && npm run dev`
runs it locally with wrangler — needs a `.dev.vars` file with a
`GROQ_API_KEY`, or any OpenAI-compatible key via the `LLM_*` vars).

## Guidelines

- **Bugs / ideas:** open an issue with the matching template. For questions
  and show-and-tell, use Discussions.
- **Pull requests:** keep them focused. Before submitting, run
  `npm run build` (must pass) and, if you touched the UI, `npm run shots`
  and eyeball the regenerated screenshots.
- **Languages:** TR and EN must stay in parity — every new `uiStrings` key
  needs both. Adding a whole new language = new `content/<lang>/` folder +
  `supportedLanguages` entry; PRs for new languages are very welcome.
- **Zero-cost principle:** the default stack must stay free (GitHub Pages +
  Cloudflare Workers free tier + Groq free tier). Features that require paid
  services must be optional.
- **No secrets in the repo:** keys live in `worker/.dev.vars` (gitignored)
  or Worker secrets — never in code, config, or fixtures.

## Code style

Vanilla JS (ES modules), no framework, no runtime dependencies on the
frontend. Match the existing style of the file you're editing; comments only
where the code can't speak for itself.
