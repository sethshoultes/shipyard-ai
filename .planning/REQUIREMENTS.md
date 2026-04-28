# Requirements Traceability Matrix
# GitHub Issue #99 — CF Pages Auto-Deploy

**Generated**: 2026-04-28
**Source Documents**:
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-99.md` (PRIMARY)

**Project Status**: No prior decisions document found for this round.
**Project Slug**: `github-issue-sethshoultes-shipyard-ai-99`
**Total Requirements**: 4

---

## Requirements Summary

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| DEPLOY-001 | Add GitHub Actions workflow `.github/workflows/deploy-website.yml` | P1 | PRD "Suggested fix" |
| DEPLOY-002 | Trigger workflow on push to `main` when paths under `website/**` change | P1 | PRD skeleton |
| DEPLOY-003 | Build Next.js site (`npm ci && npm run build`) and deploy `out/` to CF Pages project `shipyard-ai` | P1 | PRD skeleton + `website/next.config.ts` |
| DEPLOY-004 | Use existing repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` | P1 | PRD + `.github/workflows/auto-pipeline.yml` |

---

## Technical Context (Verified)

### Build Pipeline
- **Framework**: Next.js 16.2.2 with static export (`output: "export"` in `website/next.config.ts`)
- **Build output**: `website/out/` (confirmed by Next.js export config)
- **Node version**: 22 (matches `auto-pipeline.yml` and `package.json` engines implication)
- **Install command**: `npm ci` (lockfile present at `website/package-lock.json`)
- **Build command**: `npm run build` (defined in `website/package.json`)

### Deployment Pipeline
- **Target**: Cloudflare Pages project `shipyard-ai`
- **Tool**: `wrangler` CLI (already used in `auto-pipeline.yml` and `deploy-showcase.yml`)
- **Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (already configured in repo)
- **Deploy command**: `wrangler pages deploy out --project-name=shipyard-ai --branch=main --commit-dirty=true`

### Existing Workflow Patterns
- `auto-pipeline.yml` uses `actions/checkout@v4`, `actions/setup-node@v4`, `npm install -g wrangler`
- `deploy-showcase.yml` uses path-filtered triggers (`paths: ['deliverables/...']`)

---

## Notes

- **No hindsight report available** (`/home/agent/shipyard-ai/.great-minds/hindsight.md` does not exist). No high-churn or bug-prone files to flag.
- **No decisions.md available** for this round; requirements derived directly from PRD.
- This is a structural fix (infrastructure-only). No application code changes.
- The task is atomic and independent — no dependencies on other in-flight work.
