# Elon — Round 1: Relay AI Form Handler

## Architecture
A Cloudflare Worker between WordPress and Claude is unnecessary indirection. Simplest system: WordPress PHP calls Claude API directly via `wp_remote_post`. One less network hop, one less deployment target, one less failure mode. If the Worker is "for security," that's theater — the API key lives in the Worker, but the plugin still needs to authenticate to the Worker. You're just moving secrets sideways, not protecting them.

## Performance
Every form submission triggers a synchronous Claude API call. At 2–3s latency, the user stares at a spinner after hitting "Submit." That's a conversion killer. The 10x path: store the submission instantly, return 200 OK in <100ms, then classify asynchronously via WP Cron or a background job. User experience beats AI theater every time.

## Distribution
"Freemium on WP.org drives volume" is magical thinking. There are 60,000+ plugins. Zero distribution without leverage. The 10,000-user path: target WordPress agencies with a 2-minute install video, not SMBs directly. One agency installs on 50 client sites. 200 agencies = 10,000 users. Build for the installer, not the end user. Distribution is the product.

## What to CUT
- **Gutenberg block**: Scope creep. Contact Form 7 and Gravity Forms exist.
- **AI Reply Draft**: v2 feature. Nobody asked for this.
- **CSV export**: v2. Copy-paste the table.
- **Cloudflare Worker**: Cut it. Call Claude from PHP. Saves 75K tokens and a deployment step.
- **React admin inbox**: Replace with native `WP_List_Table`. Saves 100K tokens and eliminates a build step.

## Technical Feasibility
One session? Barely. 775K tokens assumes zero debugging. The React admin inbox alone will eat 150K+ and require Webpack/wp-scripts, which always breaks. High probability of shipping a broken MVP. Strip to PHP-rendered admin tables and direct API calls and you actually have a shot.

## Scaling
At 100x usage, two things die: **Claude API billing** and **shared-hosting MySQL**. 10K sites × 20 forms/day = 200K classifications/day. Claude 3.5 Sonnet at $3/M tokens ≈ $600/day in inference costs. You need tiered caching (don't re-classify "unsubscribe" 10,000 times) and a SaaS pricing model that charges per classification. Otherwise you're running a charity with Anthropic's margin.
