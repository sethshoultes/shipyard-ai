# Round 1 — Elon Musk

## Architecture
The simplest system is already 80% built. `scripts/proof.js` exists and `deploy-website.yml` already calls it. The real gap is `pipeline/deploy/deploy.sh` — the script that ships every customer site — which deploys, prints a green banner, and exits with **zero verification**. Don't build a new abstraction. Reuse the Node script. The PRD's suggested bash `curl | grep` is brittle trash: no retry, no timeout, no JSON config, no parallelization, and it scrapes `wrangler` CLI output which breaks the moment Cloudflare changes formatting. Kill it. Read the domain from the environment variable or config file you already set for the project. If the CI runner can deploy, it can verify.

## Performance
Bottleneck isn't request throughput; it's **DNS propagation latency**. Cloudflare DNS can take 30–90 seconds to globally converge after a deploy. The deliverable's 5-attempt exponential backoff (1s → 2s → 4s → 8s → 15s ≈ 30s wall time) is the right physics. The 10x path is **redirect following** — the current `https.get` doesn't follow 301/302s. Apex → `www` redirects will false-negative and burn retries. Add `maxRedirects: 5`. Body reading for BUILD_ID adds ~100–300ms per domain; acceptable only for `/`. Deep route checks are waste — they multiply noise without catching the core failure mode (domain points at wrong origin).

## Distribution
This isn't a user-facing product; it's a pipeline gate. Nobody signs up for a "deploy verification tool." Distribution means **every customer deploy runs it automatically without opt-in**. The `deploy-website.yml` has it. `deploy.sh` does not. One post-deploy line in `deploy.sh` — `node ../../scripts/proof.js` — covers 100% of customer launches. If it's opt-in, adoption will be under 10%. Make it impossible to skip. Trust compounds faster than marketing spend.

## What to CUT
- **BUILD_ID body matching**: V2 masquerading as V1. The bug was a Vercel 404 caused by DNS pointing at the wrong origin. Catching that requires only **DNS origin + HTTPS 200 + Cloudflare headers**. Injecting a build hash into every Astro/Next.js build output is a cross-cutting build-system change. Cut it from v1.
- **"A few key routes"**: Cut to `/` only. The homepage 404ing is the failure mode. More routes = more noise, same signal.
- **"Alert the operator"**: GitHub already emails on workflow failure. A red pipeline *is* the alert. Don't build a pager.
- **The bash snippet in the PRD**: Delete it. No retry, no DNS validation, will false-positive on cached error pages.
- **Generalization to all customers in the first PR**: Fix Shipyard's own pipeline first. Wire it into `deploy.sh`, run it for 2 weeks without flaking, then abstract. Premature abstraction is the enemy.
- **A standalone verification service**: If you build a new microservice to check HTTP, you now have two things to deploy and one of them will break.

## Technical Feasibility
Trivial. One agent session. The proof script, workflow hook, and `domains.json` config already exist. The delta is ~3 lines in `deploy.sh` and redirect handling in `proof.js`. If an agent can't add a post-deploy verification call to a bash script, the agency has a hiring problem. Scope tightly: curl the domain, expect 200, retry with backoff, fail the pipeline. If the agent spends more than 20 minutes on this, the requirements are too broad. Ship.

## Scaling
At 100× (1,000 customers × 3 domains each), a single GitHub Actions runner doing 3,000 HTTPS checks + DNS lookups via `Promise.all` will hit OS file-descriptor limits. Deploys will hang for minutes. The break point is roughly **50 domains**. Fix: move verification to a fire-and-forget async worker, or consume Cloudflare's API for domain validation status instead of HTTP polling. For v1, add a hard `Promise.all` concurrency limit of `10`. Otherwise this becomes a deploy-time DOS of itself. Without disciplined retry jitter, a Cloudflare edge hiccup could fail 100 pipelines simultaneously. Retry logic with jitter is not optional at scale; it is required. Human QA does not scale — "Margaret should have caught this" breaks at 10 projects. The pipeline either catches it automatically, or the failure goes live.
