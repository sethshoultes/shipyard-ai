# Round 1: Elon — Promptfolio

This PRD describes a feeling, not a product. Let me apply first principles and challenge every assumption with actual numbers.

## Architecture

A portfolio displays mostly static content. WordPress is a dynamic CMS built for bloggers in 2003. That is a fundamental mismatch — you are paying PHP/MySQL complexity tax for pages that change monthly. The simplest system that could work: a CLI tool or lightweight web UI that ingests a JSON export and emits a static HTML/CSS/JS bundle. One directory, zero databases, host anywhere including GitHub Pages or Cloudflare for free. If you absolutely must WordPress, the only sane path is a single shortcode plus one Custom Post Type. No Gutenberg blocks, no customizer, no theme engine dependencies. But honestly, a static site generator is the correct physics here. Anything with a database is overengineered for read-heavy portfolios that update quarterly. The database is not an asset; it is a liability. Static sites are faster, cheaper, and immune to SQL injection. You do not need a server to serve text. Complexity is the enemy of execution.
Start with the physics, not the platform.

## Performance

Two real bottlenecks. First, conversation exports from ChatGPT and Claude can be 10MB+ JSON blobs with nested arrays and markdown strings. Parsing that server-side on cheap shared WordPress hosting is a timeout factory — you will hit 30-second PHP limits instantly and memory will cap at 128MB, killing half your imports before they start. Second, the "Try this prompt" widget converts every visitor into marginal API cost. At 1,000 visits per day and even $0.01 per prompt, that is $300/month per user in inference spend. That is not a feature; it is a bankruptcy mechanism. The 10× path: client-side parsing with Web Workers plus static site generation. Let the browser do the heavy lifting. Every portfolio should be flat HTML on a CDN. Sub-2-second load or do not ship. A slow portfolio is a bounced visitor, and bounced visitors do not share. Speed is a feature, not a luxury. Performance equals conversion.

## Distribution

The WordPress plugin directory is a swamp — 60,000 plugins and organic discovery is a rounding error. You will get maybe 50 downloads a month if you are lucky. ProductHunt is a sugar high decaying to zero in 72 hours. Reaching 10,000 users without paid ads requires a viral coefficient greater than one. The only free lever: every generated portfolio must carry a "Made with Promptfolio" footer and generate stunning Open Graph cards when shared. AI practitioners live on X and LinkedIn, not wp-admin. Distribution is the product of shareability, not directory placement. If you cannot articulate the viral loop, you do not have distribution — you have hope. And hope is not a strategy. Beautiful output is the only marketing channel you can afford at zero budget. People share what makes them look good. Your growth engine is the portfolio itself. Build for the feed, not the directory.

## What to CUT

- **"Try this prompt" widget.** This is a chat application inside a portfolio plugin. It demands API key management, rate limiting, abuse detection, and a billing model. That is a second startup. Cut immediately.
- **Multi-format one-click import.** OpenAI, Anthropic, and Perplexity change their JSON schemas quarterly without warning. "One-click import" becomes "one-click breakage" within months. Ship a manual paste box with smart auto-formatting for v1. Robust parsers are a maintenance tax you cannot afford.
- **Theme builder / customizer / multiple themes.** Ship one exquisite dark template. Two themes equals twice the CSS debt and infinite support edge cases. Customizers are scope creep pretending to be flexibility.
- **Workflows and case studies taxonomies.** v1 is prompts. Full stop. Adding "workflows" and "case studies" as separate taxonomies is v2 taxonomy theater that balloons the schema before you have users.
- **Dark mode toggle.** Build one dark template that actually looks good. A toggle means state management, cookie storage, and flash-of-unstyled-content bugs. One beautiful mode is enough. Indecision is not a feature.
- **Built-in analytics or view counters.** These require databases, writes, and infrastructure. Use Google Analytics or Plausible via embed. Do not build your own metrics. Vanity metrics are not worth servers.
- **User authentication or accounts.** Promptfolios are public by default. Adding auth means password resets, email verification, and GDPR headaches. Skip it for v1.

## Technical Feasibility

Can one agent session build this? Yes — but only if scoped ruthlessly. A static portfolio generator with one import parser, one beautiful template, and a paste interface is a single session. A WordPress plugin with multi-format importers, live inference widgets, theme customizers, and cross-theme CSS resilience is a week of debugging, not a session. Scope must drop by roughly 70% to ship in one sitting. The "beautiful" part requires CSS iteration cycles, not logic. Ship the structure first; aesthetic polish is session two. Do not try to build the entire vision in one pass — that is how you ship nothing. One session equals one core feature, not five half-baked ones. Define done as "generates a single beautiful page from pasted text," not "replaces Dribbble." Done means working and shippable, not complete. If it does not ship today, it does not count. Shipping beats perfect.

## Scaling

At 100× usage, WordPress support tickets scale linearly because every install is a unique snowflake of janky hosting, plugin conflicts, and outdated PHP versions. You are not scaling compute — you are scaling a customer service burden. If you host the inference widget, API costs scale directly with traffic and you financially melt down. If you do not, your users' $5/month shared hosting melts under any real traffic. Static sites scale horizontally at near-zero marginal cost. WordPress plugins scale as a people problem. Choose your physics wisely. Engineering time is the real bottleneck at scale, and every WordPress install is a time vampire. Support does not scale with code; it scales with humans. That is the math that matters. Avoid problems that require hiring support reps before you have revenue.

## Verdict

Kill the WordPress plugin angle entirely. Build a static site generator. Cut the live prompt widget and multi-format importers. Ship one exceptional template with manual paste import. Make the output so visually compelling that users share it organically. Distribution comes from beauty and shareability, not directories. Everything else is scope creep disguised as ambition. Build less, ship faster, iterate with real users. That is how you get to 10,000.
Stop optimizing for the dream and start optimizing for the first user.
Start small. Think big. Ship now.
