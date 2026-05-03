# Elon — Round 1 Review: Promptfolio

## Architecture
WordPress plugin is a valid constraint, but don't pretend it's optimal. Portfolios are read-heavy, write-once. The simplest system: one Custom Post Type (`promptfolio`), one front-end template, one admin page. No Gutenberg blocks, no React build pipeline, no REST API endpoints you don't need. If the architecture can't be drawn on a napkin, it's wrong. PHP parses JSON, saves posts, renders HTML. Three moving parts.

## Performance
Real bottlenecks:
1. **JSON parsing:** Claude exports hit 10–50 MB. PHP's `json_decode` on cheap shared hosting dies at 128 MB memory limits. 10x path: stream-parse or cap file size at 5 MB for v1.
2. **Image extraction:** Base64 images in exports bloat everything. Decode and hand off to WordPress's native `media_handle_upload` pipeline. Don't reinvent image crunching.
3. **The widget:** If you ship a live "Try this prompt" feature, every pageview becomes an API call. At 1,000 visits/day × $0.002/prompt, that's $60/month per user in inference spend. That's not a feature; it's a denial-of-wallet attack on your users.

## Distribution
WordPress plugin directory has 60,000 plugins — organic discovery rounds to zero. ProductHunt is a 48-hour sugar spike then flatline. The only zero-cost lever to 10,000 users is built-in shareability. Every portfolio must generate a stunning Open Graph card. Add a "Made with Promptfolio" footer link. AI practitioners live on X and LinkedIn; they don't browse wp-admin menus. Distribution = viral coefficient. If you can't write the loop as an equation, you don't have one.

## What to CUT
- **"Try this prompt" widget:** Full chat UI inside a portfolio. Needs API keys, rate limits, abuse detection, CORS proxy. That's a second startup. Cut. Replace with "Copy to Clipboard."
- **Multi-format import:** Anthropic and OpenAI change JSON schemas quarterly. "One-click" becomes "one-click breakage" in 90 days. Ship Claude-only JSON import for v1.
- **Theme builder / customizer:** One exquisite template. Two themes = 2× CSS debt + infinite edge cases.
- **Workflows & case studies taxonomies:** v1 is prompts. Full stop. Adding taxonomies before you have 100 users is schema theater.
- **Dark mode toggle:** Build one beautiful dark template. A toggle means state management, cookies, FOUC bugs. One mode ships faster.
- **Built-in analytics:** Requires DB writes and privacy headaches. Use Plausible or Fathom via one-line embed.

## Technical Feasibility
Can one agent session build this? Yes — if scoped ruthlessly. The cut-down version (custom post type, single template, Claude JSON import, copy button) is ~4 hours of focused work. The full PRD is a 3-week project masquerading as a weekend hack. If it doesn't ship in one session, it doesn't ship.

## Scaling
At 100× usage, three things break:
1. **Shared-hosting parsers:** 50 MB JSON uploads die on 30-second PHP timeouts. Cap uploads or provide chunked parsing.
2. **LLM widget costs:** If you ignore me and ship the widget, users will be financially ruined by API abuse. Never proxy inference from a plugin.
3. **Support tickets:** WordPress plugins don't scale with code; they scale with humans. Every install is a unique snowflake of janky hosting, plugin conflicts, and PHP 7.4. Static sites scale horizontally at $0 marginal cost. WP plugins scale as a people problem.

## Verdict
Build the cut version. It ships. The full PRD is a feature list for a team of five, not one agent session. Ship structure first, aesthetic polish second, widgets never. Optimize for the first user, not the dream.