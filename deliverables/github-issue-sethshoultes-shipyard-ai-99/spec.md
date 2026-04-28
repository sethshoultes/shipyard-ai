# Spec — CF Pages Auto-Deploy (Issue #99)

**Source PRD**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-99.md`
**Source Plan**: `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
**Generated**: 2026-04-28

---

## Goals

1. **Eliminate silent deploy failures** — Pushes to `main` that touch `website/**` must automatically build and deploy the Next.js static site to Cloudflare Pages.
2. **Match existing workflow patterns** — The new workflow must reuse the same Actions versions, Node version, Wrangler CLI install method, and secret names already used by `.github/workflows/auto-pipeline.yml` and `.github/workflows/deploy-showcase.yml`.
3. **Preserve manual deploy capability** — The workflow is additive only; no existing files are modified or removed.
4. **Enable fast feedback** — Use `npm ci` with lockfile caching and path-filtered triggers so unrelated pushes do not burn CI minutes.

---

## Implementation Approach

### Overview
Create a single GitHub Actions workflow file `.github/workflows/deploy-website.yml` that implements **Option B** (Actions-based deploy) from the PRD.

### Step-by-step

1. **Trigger configuration**
   - Event: `push` to `main`
   - Path filters: `website/**` and `.github/workflows/deploy-website.yml`
   - This ensures the workflow runs only when the site source or the workflow itself changes.

2. **Runner & permissions**
   - `runs-on: ubuntu-latest`
   - Permissions: `contents: read`, `deployments: write` (matches `deploy-showcase.yml`).

3. **Checkout & Node setup**
   - `actions/checkout@v4`
   - `actions/setup-node@v4` with `node-version: '22'`, `cache: 'npm'`, `cache-dependency-path: website/package-lock.json`

4. **Dependency install**
   - `cd website && npm ci` — uses the existing lockfile for reproducible installs.

5. **Build**
   - `cd website && npm run build` — Next.js 16.2.2 with `output: "export"` emits to `website/out/`.

6. **Wrangler install**
   - `npm install -g wrangler` — same pattern as `auto-pipeline.yml`.

7. **Deploy**
   - Conditional: `if: github.ref == 'refs/heads/main'`
   - Command: `wrangler pages deploy out --project-name=shipyard-ai --branch=main --commit-dirty=true`
   - Environment variables: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from repo secrets.

### Constraints
- No changes to `website/` source code.
- No changes to existing workflow files.
- No new secrets or tokens required (reuse existing).

---

## Verification Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | Workflow file exists at the correct path | `test -f .github/workflows/deploy-website.yml` |
| 2 | YAML is syntactically valid | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"` |
| 3 | No tabs in YAML (GitHub rejects tabs) | `grep -P '\t' .github/workflows/deploy-website.yml` → exit 1 |
| 4 | Trigger is `push` to `main` with path filter `website/**` | `grep -E "branches:\s*\[main\]"` and `grep "website/\*\*"` |
| 5 | Node version is exactly `'22'` | `grep "node-version: '22'"` |
| 6 | Cache points to `website/package-lock.json` | `grep "cache-dependency-path: website/package-lock.json"` |
| 7 | Install step runs `cd website && npm ci` | `grep "cd website && npm ci"` |
| 8 | Build step runs `cd website && npm run build` | `grep "cd website && npm run build"` |
| 9 | Wrangler install uses `npm install -g wrangler` | `grep "npm install -g wrangler"` |
| 10 | Deploy step references `--project-name=shipyard-ai` | `grep "project-name=shipyard-ai"` |
| 11 | Deploy step uses `--branch=main` | `grep "branch=main"` |
| 12 | Deploy step uses `--commit-dirty=true` | `grep "commit-dirty=true"` |
| 13 | Secrets are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` | `grep "CLOUDFLARE_API_TOKEN"` and `grep "CLOUDFLARE_ACCOUNT_ID"` |
| 14 | Build output directory matches Next.js config | `website/next.config.ts` contains `output: "export"` (already true) |
| 15 | Local build produces `website/out/` | `cd website && npm run build && test -d out` |

---

## Files Created or Modified

| File | Action | Reason |
|------|--------|--------|
| `.github/workflows/deploy-website.yml` | **Create** | New auto-deploy workflow |
| `website/next.config.ts` | Read-only verification | Confirm static export target (`out/`) |
| `website/package.json` | Read-only verification | Confirm build script and dependency definitions |
| `website/package-lock.json` | Read-only verification | Confirm lockfile exists for `npm ci` caching |
| `.github/workflows/auto-pipeline.yml` | Read-only reference | Match existing secret names and wrangler pattern |
| `.github/workflows/deploy-showcase.yml` | Read-only reference | Match existing trigger and permissions pattern |
