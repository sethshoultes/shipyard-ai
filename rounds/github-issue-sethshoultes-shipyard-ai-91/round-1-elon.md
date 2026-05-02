# Round 1 — Elon Musk, Chief Product & Growth Officer

## Architecture
WordPress plugin is the correct substrate. But the simplest system is not a theme—it's one custom post type (`prompt`), one shortcode `[promptfolio]`, and a flat CSS file. Don't fight Gutenberg. Render server-side and cache the output. No React frontend. No block editor integration. 500 lines of PHP, 300 lines of CSS.

## Performance
Bottleneck is not rendering. It's import. A Claude export JSON can hit 10 MB. Parsing that in shared-hosting PHP will timeout 90% of the time. The 10x path is client-side parsing: upload the file, parse in browser JS, POST structured chunks to WP REST API. Offload the CPU from the server.

## Distribution
WordPress plugin directory + ProductHunt is a hope, not a strategy. 60,000 plugins exist; organic discovery is noise. The 10,000-user path is the portfolio itself as billboard. Mandatory "Made with Promptfolio" badge on free tier. "Try this prompt" must generate an embeddable iframe so every visitor becomes a potential installer. Long-tail SEO on individual prompt pages is the real engine.

## What to CUT
- **One-click Claude/ChatGPT import.** Their schemas change without warning. This is voodoo. V1: manual paste + structured fields.
- **Live "Try this prompt" execution.** Building an AI backend with rate-limiting, abuse prevention, and API key management is a separate product. V1: copy-to-clipboard only.
- **"Apple-esque" perfectionism.** Clean typography with CSS variables is 80% of the value for 10% of the effort. Diminishing returns on pixel-polishing kill velocity.

## Technical Feasibility
One agent session can absolutely ship the scoped version: custom post type, archive template, client-side JSON chunker, flat CSS, copy-to-clipboard. One session cannot build a reliable conversation parser + AI inference gateway + design system. Scope dictates feasibility.

## Scaling
At 100×, two things break. First, shared-hosting PHP chokes on bulk imports. Fix: hard 2 MB upload limit and chunked client-side processing. Second, if we actually executed prompts server-side, API costs scale linearly and spam/abuse becomes a denial-of-wallet attack. The static-only v1 architecture is the scaling moat.
