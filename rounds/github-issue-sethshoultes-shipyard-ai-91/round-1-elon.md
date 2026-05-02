# Elon — Round 1

## Architecture
First principles: a portfolio displays static text. WordPress is a dynamic CMS for bloggers. That’s a fundamental mismatch—you’re paying PHP/MySQL complexity tax for pages that change monthly. The simplest system: a CLI or web UI that ingests a JSON export and emits a static HTML/CSS bundle. One file, zero databases, host anywhere. If you insist on WordPress, the only sane path is a single shortcode + Custom Post Type. No theme. No Gutenberg blocks. No customizer.

## Performance
Two bottlenecks. First, conversation exports from ChatGPT/Claude can hit 10MB+ of JSON. Parsing that in cheap shared hosting is a timeout factory. Second, the "Try this prompt" widget converts every visitor into a marginal API cost. At 1,000 visits/day and $0.02/prompt, that’s $600/month per user in inference spend. That’s a feature that bankrupts you. The 10× path: client-side parsing + static site generation. Every portfolio should be a flat HTML file on a CDN. Sub-2-second load or don’t ship.

## Distribution
WordPress plugin directory is a swamp. 60,000 plugins; organic discovery is a rounding error. ProductHunt is a sugar high that decays to zero in 72 hours. Reaching 10,000 users without ad spend requires a viral coefficient >1. The only free lever: every portfolio must carry a "Made with Promptfolio" footer link and generate beautiful Open Graph cards when shared. Distribution is the product of shareability, not directory placement. AI practitioners live on X and LinkedIn, not wp-admin.

## What to CUT
- **"Try this prompt" widget.** This is a chat app inside a portfolio. It needs API keys, rate limits, abuse detection, and a billing model. That’s a second startup. Cut.
- **Multi-format import.** OpenAI, Anthropic, and Perplexity change their JSON schemas every quarter. "One-click import" becomes "one-click breakage." Ship a paste box with auto-formatting for v1.
- **Theme builder / customizer / dark mode toggle.** One exquisite dark template. That’s it. Two themes equals twice the design debt. Customizers are scope creep pretending to be flexibility.
- **Workflows and case studies.** v1 is prompts. Full stop. Adding taxonomies for "workflows" is v2 taxonomy theater.

## Technical Feasibility
Can one agent session build this? Yes—a static portfolio generator with one import parser and one clean template. No, a WordPress plugin with multi-format importers, live widgets, theme customizers, and cross-theme CSS resilience is a week of debugging, not a session. Scope must drop by 70% to ship in one sitting. The "beautiful" part requires CSS iteration, not logic. Ship the structure first; polish is session two.

## Scaling
At 100× usage, WordPress support tickets scale linearly because every install is a unique snowflake of janky hosting, plugin conflicts, and outdated PHP. If you host the inference widget, API costs scale with traffic and you melt down. If you don’t, your users’ shared hosting melts under traffic. Static sites scale horizontally at zero marginal cost; WordPress plugins scale as a customer service burden.
