# Round 1 — Elon Musk

## Architecture
This is a static brochure with ~15 links. Do not build a CMS. `products.ts` should be a 60-line hardcoded TypeScript array, not a recursive parser for `prds/completed/`. Directory scanning is a v2 feature masquerading as infrastructure. The Cloudflare Worker for OG images already exists; you are just deploying it. Everything else is Next.js static export to Pages. The simplest system that works: one data file, two React components, `wrangler pages deploy`. Complexity is the enemy. If you find yourself writing a CLI tool to scan markdown frontmatter, you have already lost.

## Performance
Lighthouse 85/70 is an embarrassingly low bar — aim for 95+. The bottleneck is not Next.js, it is unoptimized PNGs and third-party embeds. A raw screenshot from the Poster Child Worker could be 300KB+. Multiply by 15 cards and you have a 4.5MB page. The 10x path: generate WebP/AVIF at build time, cap each card image at 50KB, lazy-load below the fold, and zero runtime data fetching. The page should be <150KB of critical HTML and render in <800ms on 4G. Cut the live embed if it blocks the main thread.

## Distribution
The PRD fundamentally confuses conversion with acquisition. A `/work` page does not reach 10,000 users — it converts the 500 who already arrived. The *shipped products themselves* are the distribution channel. Every tool (Poster Child, WP-Agent, AgentBench) should carry Shipyard branding and a backlink. The showcase page is proof for prospects already inbound, not a viral engine. If you want organic growth, make the products shareable, not the portfolio.

## What to CUT
1. **Auto-generating product index from `prds/completed/`** — Pure scope creep. You have 12 products, not 12,000. Hand-curate. A directory scanner adds parsing logic, error handling, and rebuild coupling for zero user benefit.
2. **Cypress/Playwright automation** — Massive overkill for a static page. Manual click-through + `curl` smoke tests are 10x faster and sufficient at this stage.
3. **"Warm cache" scripts for top repos** — Premature optimization. The Worker serves one demo repo. If cache warming is not one `curl` command, skip it.
4. **Dynamic "rotating" hero** — Hardcode the latest 3 products in source. Rebuild and redeploy when you ship something new. A build hook is simpler than client-side state.
5. **Emdash Plugins individual detail pages** — Group them in one card or a single section. Seven near-identical plugin cards dilute the message.

## Technical Feasibility
Trivial. One agent session, 2–3 hours of focused work. The Worker is already built in `deliverables/`. The site scaffold exists. You are writing one data manifest and two React components. Risk is not feasibility; it is over-engineering. If this takes a full day, you are architecting for a problem you do not have.

## Scaling
At 100x traffic, the static site scales infinitely — Cloudflare Pages handles it. The Poster Child Worker is the single point of failure. GitHub API rate limits are the hard constraint: authenticated tokens get 5,000–15,000 requests/hour. A popular HN post could burn that in minutes. Fix: aggressive Cloudflare Cache API with `Cache-Control: max-age=86400` for identical repo requests. GitHub metadata does not change hourly. Stateless Worker + cache-first is the only viable architecture. Without this, the Worker is a denial-of-service suicide button.
