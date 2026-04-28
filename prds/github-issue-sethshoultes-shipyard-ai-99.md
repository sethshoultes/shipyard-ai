# PRD: CF Pages: shipyard-ai project has no GitHub auto-deploy; pushes to main never deploy

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#99
> https://github.com/sethshoultes/shipyard-ai/issues/99

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #99
- **Author:** sethshoultes
- **Labels:** bug, p1
- **Created:** 2026-04-28T03:23:01Z

## Problem
## What happened

The CF Pages project `shipyard-ai` has `Git Provider = No` — pushes to GitHub do **not** trigger deploys. Every deploy to date has been a manual `wrangler pages deploy out/` from someone's local machine.

Between 2026-04-21 and 2026-04-27, five commits were pushed to `main` (`5a9aea4`, `9f597d8`, `93baabc`, `2287ca2`, `4469869`) — **none of them deployed**. The site at `shipyard-ai.pages.dev` served a 6-day-old build until I manually ran wrangler.

## Why this matters

Shipyard's pipeline architecture (per README, STATUS.md, and SOUL.md) assumes **"push to main → auto-deploy."** The actual deploy is manual. This means:

- New marketing pages, copy fixes, bug fixes pushed by anyone (or any agent) silently never reach production
- The gap is invisible until someone hits the production URL and notices it's stale
- Worse: a fresh agent reading STATUS.md will assume their push has deployed and move on

Combined with the production-domain-verification gap (#98), this is how stale builds shipped invisibly for 6+ days.

## Expected behavior

One of:

**Option A — Connect GitHub via CF Pages dashboard.** Pages → shipyard-ai → Settings → Builds & deployments → Connect to Git. Pushes to main auto-build and auto-deploy. Simplest path; no workflow files needed.

**Option B — GitHub Actions workflow.** Add `.github/workflows/deploy-website.yml` that runs `next build && wrangler pages deploy out/` on every push to main with paths under `website/**`. More flexible — easy to gate on Margaret QA passing first, easy to deploy PR previews, easy to add notification steps.

The existing `.github/workflows/auto-pipeline.yml` already uses `wrangler pages deploy` for customer projects. Same `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in the repo.

## Suggested fix

Recommend Option B (Actions). Skeleton:

```yaml
name: Deploy website to CF Pages
on:
  push:
    branches: [main]
    paths: ['website/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd website && npm ci && npm run build
      - run: npm install -g wrangler
      - run: cd website && wrangler pages deploy out --project-name=shipyard-ai --branch=main --commit-dirty=true
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

After deploy, add the verification step from #98.

Owner: Phil Jackson (orchestrator) decides A vs B; Elon (engineering) implements.

---

Discovered 2026-04-27. Hand-fixed the immediate stale-deploy in commit 44e4b0e + manual `wrangler pages deploy`. This issue tracks the structural fix.

## Success Criteria
- Issue sethshoultes/shipyard-ai#99 requirements are met
- All tests pass
