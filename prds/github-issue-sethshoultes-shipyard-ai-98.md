# PRD: Deploy verification: production custom domain not validated, 404s shipped silently

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#98
> https://github.com/sethshoultes/shipyard-ai/issues/98

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #98
- **Author:** sethshoultes
- **Labels:** bug, p0
- **Created:** 2026-04-28T03:22:39Z

## Problem
## What happened

`shipyard.company` DNS still points at Vercel IPs (`216.150.1.65`) from a previous deployment. The Vercel project no longer exists — every request to `shipyard.company` returns Vercel's `DEPLOYMENT_NOT_FOUND` 404.

Meanwhile, the CF Pages project `shipyard-ai` has `shipyard.company` and `www.shipyard.company` attached and serves correctly at `shipyard-ai.pages.dev`. The mismatch went unnoticed for **6+ days**. No one — agent, daemon, or operator — verifies that the production custom domain actually serves the deployed build.

## Why this matters

Every customer-facing change shipped to CF Pages was invisible at the production domain. Users hitting `shipyard.company` saw 404s, not the site.

A paying customer's launch could ship the same way: deploy succeeds, .pages.dev preview works, dashboard shows green — but the customer's actual domain is misconfigured and 404s. Customer hits "share the link" the next morning and is humiliated. Margaret should have caught this on day one.

## Expected behavior

After every deploy, the pipeline should:
1. For each custom domain attached to the CF Pages project, fetch `/` and a few key routes
2. Verify status 200 AND that the body matches the just-deployed build (e.g., contains a build-id or a unique string from the new release)
3. Fail the deploy as failed and alert the operator if mismatch

## Actual behavior

- Pipeline never verifies the production custom domain
- DNS misconfiguration → 404 in production was not caught for 6+ days
- The successful CF Pages `.pages.dev` URL was the only thing checked

## Suggested fix

Add post-deploy verification step in the pipeline:
```bash
for domain in $(wrangler pages project list ... | grep custom-domains); do
  curl -sf "https://$domain/" | grep "$BUILD_ID" || exit 1
done
```

This is generalizable beyond shipyard's own site: every customer launch should run this same check against the customer's domain before the project is marked Done.

Owner: Margaret Hamilton (QA) — production verification belongs in QA's pre-handoff gate.

---

Discovered 2026-04-27. The DNS misconfiguration itself is being addressed separately, but the *pipeline gap* is what matters here: a customer could hit this and we'd never know.

## Success Criteria
- Issue sethshoultes/shipyard-ai#98 requirements are met
- All tests pass
