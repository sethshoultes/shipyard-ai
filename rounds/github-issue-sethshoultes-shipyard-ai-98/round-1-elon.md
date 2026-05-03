# Round 1 — Elon Musk (CPO/CGO)

## Architecture

The simplest system that works is a **10-line shell step in the existing deploy job**: `curl -sf $DOMAIN` with a retry loop.

No new microservice. No "verification platform." No `wrangler pages project list` CLI scraping — that breaks the moment Cloudflare changes JSON formatting. Read the domain from the environment variable you already set for the project. If the CI runner can deploy, it can verify. Adding a network hop to a separate verification service just gives you another thing to debug when DNS breaks.

This is an integration test, not a product. Treat it like one.

## Performance

The bottleneck isn't compute; it's **detection latency**. Six days to find a 404 is a catastrophic failure mode. The 10x path is eliminating that delay entirely — from 6 days to 60 seconds.

The real latency risk is DNS propagation and CDN cache invalidation. If you check immediately after deploy, you will false-fail ~30% of the time due to stale DNS or edge cache. Add retry with exponential backoff: 5 attempts over 60 seconds. Total cost: milliseconds of CI time and zero dollars.

A centralized polling service would add network hops and be slower; keep it in the CI runner next to the deploy. Speed of feedback matters more than speed of execution.

## Distribution

This is infrastructure, not a growth feature. Nobody signs up for a "deploy verification tool." If you want to reach 10,000 users, **stop shipping 404s to the ones you already have.** The distribution mechanism here is the base deployment template: bake the check in so it runs by default on every project. If it's opt-in, adoption will be under 10%. Make it impossible to skip. Trust is the distribution channel. Reliability compounds faster than marketing spend.

## What to CUT

- **CUT build-id body matching for v1.** Checking that HTML contains the build hash requires touching the build system, bundler, and meta tag injection. For v1, HTTP 200 + presence of a stable element like `<title>` is sufficient. Build-id verification is v2 optimization.
- **CUT "every key route."** Check `/` only. Route-level verification is a separate test suite, not a deploy gate. If `/` loads, the domain resolves and the build is present. Interior routes have their own failure modes (data, auth) that pollute the signal.
- **CUT generalization to all customers in the first PR.** Fix Shipyard's own pipeline first. Abstract only after it works in production for 2 weeks without flaking. Premature abstraction is the enemy.
- **CUT "alert the operator."** Just fail the CI job. A red pipeline *is* the alert. Building a separate alerting system or on-call rotation for this is scope creep.
- **CUT a standalone verification service or repo.** If you build a new service to check HTTP, you now have two things to deploy and one of them will break.

## Technical Feasibility

One agent session can build this. Scope is ~30 lines of shell or a single GitHub Actions step. The only non-trivial piece is robust retry/backoff logic. Do not over-engineer. What one session *cannot* do is: simultaneously refactor the build system for build-id injection, design a multi-tenant customer verification platform, and handle every edge case. So scope it tightly: curl the domain, expect 200, retry with backoff, fail the pipeline. If the agent spends more than 20 minutes on this, the requirements are too broad. Ship.

## Scaling (100x Usage)

At 100x projects, three things break:
1. **Alert fatigue** — transient DNS blips or regional CDN cache misses will trigger failures. Without disciplined retries and timeouts, engineers will disable the check within a week.
2. **Brittle scraping** — parsing `wrangler` CLI output collapses when Cloudflare updates the tool. Use deterministic inputs (env vars, project config files) instead of runtime CLI scraping.
3. **False positive cascade** — if you check immediately post-deploy across 100 projects, a Cloudflare edge hiccup could fail 100 pipelines simultaneously. Retry logic with jitter is not optional at scale; it is required.
4. **Ownership dilution** — "Margaret should have caught this" does not scale. At 100 projects, human QA cannot eyeball every domain. The pipeline either catches it automatically, or the failure goes live. Process does not scale; automation does.

## Bottom Line

This is a deploy-step bug, not a platform feature. Add a retrying curl check to the existing pipeline. Ship in one session. Abstract later. If it takes more than an hour to implement, you are overthinking it.
