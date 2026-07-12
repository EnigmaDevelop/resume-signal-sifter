# Branding — logo generation

`public/favicon.svg` and the header logo mark (`iconLogo` in `src/icons.js`) are
already hand-drawn in code — nothing to generate for those. This file is for the
larger `public/logo.png` app icon / social-preview mark, which the project owner
generates themselves with an image model (Flux Pro or similar).

## Prompts

1. **Main mark:**
   > Minimal flat vector-style logo mark for 'Signal Sifter', an interactive chat resume: a rounded speech bubble containing three ascending signal bars, geometric and bold, single solid indigo color #4F5EFF on a plain white background, no text, no gradients, no shadows, centered with generous margins, crisp clean edges, modern app icon style

2. **Variant** (concept note from the plan, not a full prompt — expand as needed):
   > balon + eleme hunisi silueti, duotone #4F5EFF/#6F7BFF
   > (bubble + sifting-funnel silhouette, duotone #4F5EFF/#6F7BFF)

3. **Favicon-focused:**
   > Ultra-minimal favicon glyph, extreme simplicity legible at 16 pixels: one bold rounded speech bubble with three thick vertical bars inside, flat solid indigo, plain white background, no outlines, no fine detail

## Where generated files go

Generate at 1024×1024 on a white background, then save the chosen result as
`public/logo.png` — it's already wired as the favicon fallback and general app
icon in `index.html`. Downscale to ~512×512 before committing so it doesn't
weigh the deploy down. No other integration step is needed.

## Status (2026-07-12)

Done — both assets were generated with Flux Pro and integrated:

- `public/logo.png` (512×512, flat mark on white) — favicon fallback / app icon.
- `docs/logo-glow.png` (800×800, glow-on-dark variant) — README hero image.
