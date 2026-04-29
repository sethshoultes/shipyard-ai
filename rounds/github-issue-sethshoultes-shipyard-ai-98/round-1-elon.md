# Round 1 — Elon (CPO)

## Architecture
The simplest system is a post-deploy health check. Not a new microservice, not an alerting platform — a single `curl` with retry. If it fails, the deploy fails. That's it. The PRD's bash script is directionally correct but hand-wavy: `wrangler pages project list ... | grep custom-domains` is not a real command. First principles: use the Cloudflare API to list custom domains for the project, then probe each one.

## Performance
Bottleneck is DNS propagation, not compute. A single `curl` without backoff will flake. The 10x path is exponential retry (3x, 5s backoff) not parallel probes. Better yet: CF Pages already tracks custom-domain validation status via API. Query that instead of HTTP from CI — it's the source of truth and avoids DNS cache poisoning on the runner.

## Distribution
This isn't a user-facing feature; it's infrastructure. "Distribution" means every customer deploy runs this by default. If it requires opt-in or per-project config, it won't reach 10,000 sites. Bake it into the shared deploy action/template so no human remembers to enable it.

## What to CUT
- **Build-ID body matching** — scope creep. Checking status 200 proves DNS and routing are correct. Build-ID injection requires touching every build tool (Vite, Next, etc.) and parsing HTML. v2.
- **"Few key routes"** — cut. Check `/` only. If the domain is misconfigured, `/` 404s just like `/about`.
- **Alerting infrastructure** — cut. The deploy should fail loudly in CI. Adding PagerDuty/Slack complexity is a separate project.

## Technical Feasibility
Yes, one agent session can build this — but only if we keep it to status checks. The moment we add build-ID extraction and HTML parsing, we need build-system changes across the monorepo. That crosses into multi-session territory. Stick to CF API + curl + retry.

## Scaling
At 100x usage, a CI runner curling N customer domains serially becomes the bottleneck. 50 domains × 3 retries × 5s = 750s. Also, egress from CI and rate limits on customer origins. Fix: query CF's domain status API in bulk (one authenticated call), or run probes in parallel with a 10s global timeout. What breaks first is the runner, not the sites.
