# Round 1 — Elon Musk (CPO/CGO)

## Architecture
The simplest system is a 10-line shell step in the existing deploy job: `curl -sf $DOMAIN` and grep for a known string. No new microservice. No `wrangler pages project list` CLI scraping—that breaks the moment Cloudflare changes JSON formatting. Read the domain from the environment variable you already set.

## Performance
The bottleneck is human reaction time, not compute. The 10x path is eliminating the 6-day detection delay, not optimizing the curl. The actual latency risk is DNS propagation and CDN cache invalidation. If you check immediately after deploy, you will false-fail ~30% of the time. Add retry with exponential backoff: 5 attempts over 60 seconds. Total cost: negligible.

## Distribution (Internal Adoption)
This is infrastructure, not a product. "10,000 users" means every customer project. The only way is to bake the check into the base deployment template so it runs by default. If it is an opt-in step, adoption will be under 10%. Make it impossible to skip.

## What to CUT
- **CUT build-id injection for v1.** Checking that the HTML contains the build hash requires build-system changes. For v1, HTTP 200 + presence of `<title>` is sufficient. Build-id verification is v2.
- **CUT "every key route."** Check `/` only. Route-level verification is a separate test suite, not a deploy gate.
- **CUT generalization to all customers in the first PR.** Fix Shipyard's pipeline first. Abstract only after it works in production for 2 weeks.
- **CUT a standalone verification service.** This is a CI step, not a new repo.

## Technical Feasibility
One agent session can build this. Scope is ~30 lines of shell or a small GitHub Actions step. The only non-trivial piece is the retry/backoff logic. Do not over-engineer.

## Scaling (100x Usage)
At 100x projects, two things break:
1. **Alert fatigue** — transient DNS blips or regional CDN cache misses will trigger failures. Without retries and timeout discipline, engineers disable the check.
2. **Brittle scraping** — parsing `wrangler` CLI output collapses when Cloudflare updates the tool. Use deterministic inputs (env vars, project config files) instead of runtime CLI scraping.

## Bottom Line
This is a deploy-step bug, not a platform feature. Add a retrying curl check to the existing pipeline. Ship in one session. Abstract later.
