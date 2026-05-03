# Round 1 — Elon Musk, Chief Product & Growth Officer

## Architecture
The PRD says "WordPress plugin." That's a feeling, not a physics analysis. Portfolios are read-heavy, write-rarely. WordPress is a dynamic CMS for bloggers. Mismatch. The simplest system is a CLI or web UI that ingests a JSON export and emits static HTML/CSS/JS. Host on GitHub Pages or Cloudflare for $0. No database, no PHP, no shared-hosting roulette. If you must WordPress, it's one Custom Post Type, one shortcode, zero Gutenberg blocks. But honestly? Static sites are faster, cheaper, and immune to SQL injection. Complexity is the enemy of execution.

## Performance
Two real bottlenecks. First, ChatGPT/Claude exports are 10MB+ JSON blobs. Parsing server-side on $5/month shared hosting hits 30-second PHP timeouts and 128MB memory limits instantly. Second, the "Try this prompt" widget turns every visitor into marginal API cost. At 1,000 daily visits × $0.01/prompt, that's $300/month per user in inference spend. That's not a feature; it's bankruptcy. The 10× path: client-side parsing with Web Workers + static generation. Sub-2-second load or don't ship.

## Distribution
WordPress plugin directory has 60,000 plugins — organic discovery is a rounding error. ProductHunt is a 72-hour sugar high decaying to zero. Reaching 10,000 users without paid ads requires a viral coefficient >1. The only free lever: every portfolio carries a "Made with Promptfolio" footer and generates stunning Open Graph cards. AI practitioners live on X and LinkedIn, not wp-admin. Distribution is the product of shareability. If you can't articulate the viral loop, you don't have distribution — you have hope.

## What to CUT
- **"Try this prompt" widget.** This is a chat app inside a portfolio. Demands API key management, rate limiting, abuse detection, billing. That's a second startup. Cut.
- **One-click multi-format import.** OpenAI/Anthropic change JSON schemas quarterly. "One-click" becomes "one-click breakage" in months. Ship manual paste + smart formatting for v1.
- **Theme builder / customizer.** Ship one exquisite template. Two themes = twice the CSS debt + infinite support edge cases.
- **Workflows and case studies taxonomies.** v1 is prompts. Full stop. Adding taxonomies before you have users is schema theater.
- **Dark mode toggle.** Build one beautiful dark template. A toggle means state, cookies, FOUC bugs. One mode is enough.
- **Built-in analytics.** Requires DB writes and infrastructure. Use Plausible via embed. Vanity metrics aren't worth servers.
- **User auth.** Promptfolios are public. Auth means password resets, GDPR, email verification. Skip it.

## Technical Feasibility
Can one agent session build this? Yes — if scoped ruthlessly. A static generator with one import parser, one template, and a paste interface is a single session. A WordPress plugin with multi-format importers, live inference widgets, theme customizers, and cross-theme CSS resilience is a week of debugging. Scope must drop 70% to ship in one sitting. Ship the structure first; aesthetic polish is session two. Done means "generates a beautiful page from pasted text," not "replaces Dribbble." If it doesn't ship today, it doesn't count.

## Scaling
At 100× usage, WordPress support tickets scale linearly — every install is a unique snowflake of janky hosting, plugin conflicts, and outdated PHP. You're not scaling compute; you're scaling customer service. If you host the inference widget, API costs scale with traffic and you financially melt down. Static sites scale horizontally at near-zero marginal cost. WordPress plugins scale as a people problem. Engineering time is the real bottleneck, and every WP install is a time vampire. Support doesn't scale with code; it scales with humans. Choose your physics wisely.

## Verdict
Kill the WordPress angle. Build a static site generator. Cut the live widget and multi-format importers. Ship one exceptional template with manual paste import. Make output so visually compelling users share it. Distribution comes from beauty, not directories. Build less, ship faster, iterate with real users. Stop optimizing for the dream; optimize for the first user. Start small. Think big. Ship now.
