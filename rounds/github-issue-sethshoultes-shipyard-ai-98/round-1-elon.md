## Architecture

Simplest system: after `pages publish`, query Cloudflare's API for the project's custom domains. Don't shell out to `wrangler` and `grep` — that's begging for breakage when CLI output formatting changes. Hit each domain with `curl -I`, assert `200 OK`. Done.

You don't need to grep the HTML body for a build ID. That's unnecessary complexity. If you must verify the revision, inject an `X-Build-Id` header. Parsing HTML with `grep` is amateur hour.

## Performance

Bottleneck is human latency, not compute. The 404s lasted **6 days** because nobody got paged. The 10x path is instant alerting (Slack/PagerDuty), not a dashboard.

Real 10x? Stop treating DNS as separate from deploy. The root cause is DNS pointing at a dead Vercel project. If the pipeline owned the DNS record update alongside the publish step, they could never drift. Verification is a band-aid; unified control is the cure.

## Distribution

This isn't a consumer feature. "Distribution" means baking it into the default deploy template. If it's an opt-in setting, adoption is <5%. Make it default-on for every customer project. Zero friction is the only way to reach 10,000 users without paid ads — they get the protection before they know they need it.

## What to CUT

- **HTML body build-id grep.** v2 masquerading as v1. Cut it.
- **"Verify a few key routes."** Check `/` first. Deep-route smoke tests are v2.
- **Retry loops with exponential backoff and dashboards.** Fail fast and alert. Pretty UIs don't fix 404s.
- **Standalone microservice.** This is a 30-line addition to the existing CI job, not a new service.

## Technical Feasibility

Yes. This is trivial code: fetch URLs, assert status. One agent session can write it in 20 minutes. The real time sink is archaeological: finding where the existing pipeline lives (GitHub Action? CF Worker? Bash script in a cron?). If the agent can locate the deploy orchestrator, the fix is trivial. If not, the session becomes a treasure hunt.

## Scaling

Three failure modes at 100x:

1. **Self-DoS.** 100 projects × N domains × deploy frequency = you're now load-testing your own origins. Keep checks async and rate-limited.
2. **DNS propagation flakiness.** At scale, TTL delays and geo-variance mean post-deploy checks flake. You'll false-alarm constantly unless you tolerate a propagation window.
3. **Alert fatigue.** 100x more transient failures = 100x more pages. The team will mute the channel. Build deduplication and auto-resolution before you scale, or the system becomes noise.

Bottom line: a basic health check would have caught this in 60 seconds instead of 6 days. Don't gold-plate it. Ship the simplest version now.
