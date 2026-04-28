# Phase 1 Plan — CF Pages Auto-Deploy (Issue #99)

**Generated**: 2026-04-28
**Requirements**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-99.md`
**Total Tasks**: 1
**Waves**: 1

---

## Documentation Review

### Verified Technical Context

1. **Build Pipeline** (`website/next.config.ts`, `website/package.json`):
   - Next.js 16.2.2 with static export (`output: "export"`)
   - Build output directory: `website/out/`
   - Build command: `npm run build`
   - Dependency install: `npm ci` (lockfile present)

2. **Existing Workflow Patterns** (`.github/workflows/auto-pipeline.yml`, `.github/workflows/deploy-showcase.yml`):
   - `actions/checkout@v4`
   - `actions/setup-node@v4` with `node-version: '22'`
   - `npm install -g wrangler`
   - `wrangler pages deploy` with `--project-name`, `--branch`, `--commit-dirty=true`
   - Path-filtered triggers on `push` to `main`
   - Environment secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

3. **No Emdash-specific docs cited** — this is an infrastructure/CI task, not an Emdash site build.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| DEPLOY-001, DEPLOY-002, DEPLOY-003, DEPLOY-004 | phase-1-task-1 | 1 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Deploy Workflow
Tasks: 1 | Dependencies: None

---

## XML Task Plans

### Wave 1

<task-plan id="phase-1-task-1" wave="1">
  <title>Add GitHub Actions workflow for auto-deploying website to CF Pages</title>
  <requirement>DEPLOY-001, DEPLOY-002, DEPLOY-003, DEPLOY-004</requirement>
  <description>
    Create `.github/workflows/deploy-website.yml` that triggers on every push to `main`
    when files under `website/**` change. The workflow installs dependencies, builds the
    Next.js static site, and deploys the `out/` directory to the Cloudflare Pages project
    `shipyard-ai` using the existing repo secrets. This fixes the structural gap where
    pushes to main silently never reached production.
  </description>

  <context>
    <file path=".github/workflows/auto-pipeline.yml" reason="Existing wrangler deploy pattern and secret usage" />
    <file path=".github/workflows/deploy-showcase.yml" reason="Existing path-filtered push trigger pattern" />
    <file path="website/package.json" reason="Build script and dependency definitions" />
    <file path="website/next.config.ts" reason="Confirms static export to out/" />
    <file path="/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-99.md" reason="Original requirements spec" />
  </context>

  <steps>
    <step order="1">Create `.github/workflows/deploy-website.yml` with the following content, matching existing workflow patterns:

```yaml
name: Deploy website to CF Pages

on:
  push:
    branches: [main]
    paths:
      - 'website/**'
      - '.github/workflows/deploy-website.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: website/package-lock.json

      - name: Install dependencies
        run: cd website && npm ci

      - name: Build site
        run: cd website && npm run build

      - name: Install Wrangler CLI
        run: npm install -g wrangler

      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        run: |
          cd website
          wrangler pages deploy out \
            --project-name=shipyard-ai \
            --branch=main \
            --commit-dirty=true
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```
    </step>
    <step order="2">Validate YAML syntax by reading the file back and confirming indentation.</step>
    <step order="3">Confirm the workflow references the correct build output directory (`out`) per `website/next.config.ts` (`output: "export"`).</step>
    <step order="4">Confirm secrets names match those already used in `.github/workflows/auto-pipeline.yml`.</step>
  </steps>

  <verification>
    <check type="build">N/A — infrastructure-only change; no application build to verify locally</check>
    <check type="test">N/A — no runtime code changes</check>
    <check type="manual">Review `.github/workflows/deploy-website.yml` for:
- Correct `on.push.paths` filter (`website/**`)
- Node version 22
- `npm ci` runs in `website/` directory
- `npm run build` runs in `website/` directory
- Deploy step runs `wrangler pages deploy out` with `--project-name=shipyard-ai`
- Secrets reference `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- YAML indentation is valid (2-space standard)</check>
  </verification>

  <dependencies>
    <!-- Empty — task is independent (wave 1) -->
  </dependencies>

  <commit-message>ci: add auto-deploy workflow for website to CF Pages

Fixes github-issue-sethshoultes-shipyard-ai-99.
Pushes to main that touch website/** now automatically build and deploy
the Next.js static site to the shipyard-ai Cloudflare Pages project.</commit-message>
</task-plan>

---

## Risk Notes

- **No hindsight report available** — unable to flag high-churn or bug-associated files.
- **No uncommitted changes detected** in `.github/workflows/` (verified via git status context).
- **Low risk** — this is a pure infrastructure addition. No existing files are modified.
- **Secrets dependency** — assumes `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured at the repo/organization level. These are already in use by `auto-pipeline.yml`.
- **First-run risk** — the workflow will only be exercised on the next push to `main` that touches `website/**`. A manual test push or empty commit may be needed to verify end-to-end.
