# Round 1: First Principles — Deploy Verification

## Architecture

The simplest system is a 15-line shell script in the deploy pipeline, not a new service. After `wrangler pages deploy`, run `curl -H "Host: shipyard.company"` against the CF Pages origin and validate status == 200 plus a build identifier. That's it. No microservices, no queues, no "verification engine." If it doesn't fit in the existing CI step, it's over-engineered.

## Performance

The bottleneck isn't speed — it's **false confidence**. A single curl from GitHub Actions in Virginia tells you nothing about global DNS resolution. The 10x path: inject a custom HTTP header (`X-Shipyard-Build: $BUILD_ID`) and check it, instead of brittle `grep` against HTML body that breaks with minification. DNS propagation takes 0–300 seconds; add retries with exponential backoff, not a fixed sleep.

## Distribution

Wrong question. This isn't a consumer feature you market — it's **infrastructure hygiene**. You don't "distribute" a smoke test; you wire it into every customer deploy by default. The growth effect is retention: when a customer's launch doesn't 404, they don't churn. Word of mouth among developers whose DNS doesn't silently break is your distribution.

## What to CUT

- **Multi-route checking.** Start with `/`. Checking `/about` and `/pricing` is v2 theater.
- **"Alert the operator."** If the check fails, fail the deploy. A red CI badge is the alert. Building a paging system is scope creep.
- **Body parsing.** `grep "$BUILD_ID"` breaks on every framework update. Use an HTTP header or a `<meta>` tag you control.
- **QA handoff gate.** Margaret should not be manually curling domains. This is automation, not human process.

## Technical Feasibility

Trivial. One agent session, ~30 minutes. The script is:
1. Read custom domains from `wrangler pages project get --json`.
2. `curl -sfI https://$domain/` and assert `X-Shipyard-Build` matches `$CF_PAGES_COMMIT_SHA`.
3. Retry 5× with 10s backoff.

The only dependency is ensuring the build injects that header.

## Scaling

At 100× usage — 1,000 customers, multiple domains each — what breaks?

1. **Sequential checks in CI.** 10 domains × 5 retries × 10s = 500s added to every deploy. Parallelize with `xargs -P` or it becomes the pipeline bottleneck.
2. **Single-point DNS.** Your CI runner's resolver might cache stale records. At scale you need distributed checks (even just 2–3 regions) or you're verifying Virginia, not the internet.
3. **False positives from DNS TTL edge cases.** A domain can be "up" for 80% of users and down for 20%. At 100×, partial outages become certainties. You need to validate from multiple resolvers, not one.

## Bottom Line

This is a smoke test, not a product. Build it in the pipeline in one session. Cut everything that doesn't fit in `.github/workflows/deploy.yml`. If it takes longer than 50 lines of shell, you're doing it wrong.
