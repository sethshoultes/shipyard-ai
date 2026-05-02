# Requirements Traceability Matrix
# Slug — Deploy Verification ("Proof") for Cloudflare Pages

**Generated**: 2026-05-02
**Source Documents**:
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-98.md` (PRIMARY — intake PRD)
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-98/decisions.md` (LOCKED — overrides PRD where in conflict)
- `/home/agent/shipyard-ai/CLAUDE.md` (PROJECT RULES)
- `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` §5 Deployment (TECHNICAL REFERENCE — Cloudflare deployment patterns)

**Project Slug**: `github-issue-sethshoultes-shipyard-ai-98`
**Product Name**: Proof (locked per decisions.md §2.1)
**Total Requirements**: 14
**Status**: Phase 1 — v1 MVP Build

---

## CRITICAL: Decisions.md Overrides PRD on Scope & Architecture

The debate-locked `decisions.md` is the load-bearing source of truth. Where the PRD and decisions conflict, decisions win:

| PRD Requirement | Locked Decision | Winner |
|-----------------|-----------------|--------|
| Multi-route verification (`/pricing`, `/checkout`) | Check `/` only for v1 | **decisions.md §1.4** |
| Build-ID body grep / meta-tag injection | Do not pollute pages with verification fodder | **decisions.md §3.2** |
| `wrangler pages project list` runtime API | Machine-readable inputs only; no CLI dependency | **decisions.md §1.2** |
| Retry loops / propagation windows | No retry loops in v1. Fail fast. | **decisions.md §1.3** |
| Standalone microservice or post-deploy stage | Inline pipeline step only | **decisions.md §1.1** |
| Slack/Discord/PagerDuty integrations | v1 is terminal-only | **decisions.md §2.4** |

---

## Requirements Summary

| ID | Requirement | Priority | Source | Kill Switch |
|----|-------------|----------|--------|-------------|
| R-DEPLOY-001 | Workflow triggers on `push` to `main` when `website/**` changes | P0 | PRD §Expected, decisions.md §Core Deliverables #1 | **Non-negotiable** |
| R-DEPLOY-002 | Build step runs `npm ci && npm run build` in `website/` producing `website/out/` | P0 | PRD §Expected, decisions.md §Core Deliverables #2 | **Non-negotiable** |
| R-DEPLOY-003 | Deploy step runs `wrangler pages deploy website/out/` to project `shipyard-ai` on `main` | P0 | PRD §Expected, decisions.md §Core Deliverables #3 | **Non-negotiable** |
| R-DEPLOY-004 | Workflow references secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` | P0 | PRD §Expected, decisions.md §Core Deliverables #3 | **Non-negotiable** |
| R-PROOF-001 | Inline post-deploy verification step runs automatically (default-on, zero opt-in) | P0 | decisions.md §Core Deliverables #4, §3.1 | **Non-negotiable** |
| R-PROOF-002 | Verification targets root path `/` via HTTPS | P0 | decisions.md §1.4, §Verification Behavior | **Non-negotiable** |
| R-PROOF-003 | Method: HTTP GET with origin validation (expected CF Pages CNAME/A record) | P0 | decisions.md §1.5, §Risk 5.1 | **Non-negotiable — Essence** |
| R-PROOF-004 | No retry loops in v1. Fail fast and alert via exit code. | P0 | decisions.md §1.3 | **Non-negotiable** |
| R-PROOF-005 | Success output: exactly `Verified` + domain + timestamp (one line, one breath) | P0 | decisions.md §2.2 | **Non-negotiable** |
| R-PROOF-006 | Failure output: exactly one plain-English sentence. No stack traces. No log vomit. | P0 | decisions.md §2.2, §2.5 | **Non-negotiable** |
| R-PROOF-007 | No `wrangler` CLI or HTML-grep dependencies in verification logic | P0 | decisions.md §1.2, §3.2 | **Non-negotiable** |
| R-PROOF-008 | Architecture supports parallel domain checks (single domain now, multi-domain ready) | P1 | decisions.md §Verification Behavior "Parallel" | Scoped v1 |
| R-PROOF-009 | `domains.json` replaces runtime wrangler API for domain + expected origin config | P0 | decisions.md §4.5, §File Rationale | **Non-negotiable** |
| R-PROOF-010 | `scripts/proof.js` is separate from YAML for testability and readability | P0 | decisions.md §File Rationale | **Non-negotiable** |

---

## Atomic Requirements

### R-DEPLOY-001: Workflow Trigger Filter
**Type**: Pipeline Constraint
**Priority**: P0
**Scope**: `.github/workflows/deploy-website.yml`

The workflow MUST trigger only on `push` to `main` branch and only when paths under `website/**` or the workflow file itself change. This prevents unnecessary builds on unrelated repo changes.

**Acceptance**:
- `on.push.branches` contains `main`
- `on.push.paths` contains `website/**` and `.github/workflows/deploy-website.yml`

---

### R-DEPLOY-002: Build Step
**Type**: Pipeline Step
**Priority**: P0
**Scope**: `.github/workflows/deploy-website.yml`

The workflow MUST install Node.js dependencies with `npm ci` and run `npm run build` inside the `website/` directory. The build MUST produce static output in `website/out/` because `next.config.ts` declares `output: "export"`.

**Acceptance**:
- `npm ci` runs with cache key `website/package-lock.json`
- `npm run build` runs in `website/` directory
- Output directory `website/out/` exists after build

---

### R-DEPLOY-003: Deploy Step
**Type**: Pipeline Step
**Priority**: P0
**Scope**: `.github/workflows/deploy-website.yml`

The workflow MUST deploy the `website/out/` directory to Cloudflare Pages project `shipyard-ai` using `wrangler pages deploy`. The step MUST only run on `refs/heads/main`.

**Acceptance**:
- Command: `wrangler pages deploy out --project-name=shipyard-ai --branch=main --commit-dirty=true`
- Guarded by `if: github.ref == 'refs/heads/main'`

---

### R-DEPLOY-004: Secrets References
**Type**: Pipeline Constraint
**Priority**: P0
**Scope**: `.github/workflows/deploy-website.yml`

The deploy step MUST receive `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from GitHub repository secrets.

**Acceptance**:
- `secrets.CLOUDFLARE_API_TOKEN` is referenced in workflow env
- `secrets.CLOUDFLARE_ACCOUNT_ID` is referenced in workflow env

---

### R-PROOF-001: Inline Verification Step (Default-On)
**Type**: Pipeline Step
**Priority**: P0
**Scope**: `.github/workflows/deploy-website.yml`

A verification step MUST run automatically and inline immediately after the deploy step. Zero configuration required by users. It MUST NOT be a separate workflow, a standalone microservice, or an opt-in feature.

**Acceptance**:
- Step appears in the same `deploy` job, after the "Deploy to Cloudflare Pages" step
- No `if:` conditions that require manual enablement
- No input parameters or environment variables required for basic operation

---

### R-PROOF-002: Target Root Path Only
**Type**: Verification Behavior
**Priority**: P0
**Scope**: `scripts/proof.js`, `domains.json`

The v1 verification MUST check `https://{domain}/` only. Deep-route smoke tests (`/pricing`, `/checkout`, etc.) are explicitly deferred to v1.1 or later.

**Acceptance**:
- Proof script fetches `/` for each configured domain
- No hard-coded or configurable additional routes in v1
- `domains.json` schema reserves a `routes` array for future use (commented or empty)

---

### R-PROOF-003: Origin Validation
**Type**: Verification Behavior
**Priority**: P0
**Scope**: `scripts/proof.js`

The verification MUST validate that the response originates from the expected Cloudflare Pages origin, not merely that HTTP returns 200. HTTP 200 from the wrong server (e.g., Vercel returning a cached 404 page) MUST be treated as a failure.

**Acceptance**:
- Script performs a DNS CNAME lookup for the domain and verifies it resolves to the `expected_origin` value from `domains.json` (e.g., `pages.cloudflare.com`)
- If CNAME resolution fails (e.g., apex domains using A records), the script MUST fall back to checking that the HTTP response contains Cloudflare-specific headers (`CF-RAY` or `Server: cloudflare`) as a secondary origin signal
- If neither CNAME match nor Cloudflare headers are present, verification fails
- Essence decision: "Origin validation ships, or nothing ships."

**Technical Reference**:
- Node.js built-in `dns` module (`dns.resolveCname`, `dns.resolve4`)
- Node.js built-in `https` module for HTTP GET
- Cloudflare response headers documented at https://developers.cloudflare.com/fundamentals/reference/http-request-headers/

---

### R-PROOF-004: Fail Fast — No Retry
**Type**: Verification Behavior
**Priority**: P0
**Scope**: `scripts/proof.js`

The verification MUST NOT implement retry loops, exponential backoff, or propagation windows. If the check fails once, the deploy is marked failed immediately.

**Acceptance**:
- Script makes exactly one request per domain per run
- No `setTimeout`, `sleep`, or loop constructs for retry
- Exit code is `0` on success, `1` on any failure

---

### R-PROOF-005: Success Output Format
**Type**: UX Constraint
**Priority**: P0
**Scope**: `scripts/proof.js`

On success, the script MUST output exactly one green signal per domain: `Verified {domain} {ISO8601_timestamp}`. The output MUST fit in a single line and be suitable for a push notification or terminal screen.

**Acceptance**:
- Example: `Verified shipyard.company 2026-05-02T21:45:00Z`
- No additional lines, no JSON, no emoji unless requested
- One breath, one answer

---

### R-PROOF-006: Failure Output Format
**Type**: UX Constraint
**Priority**: P0
**Scope**: `scripts/proof.js`

On failure, the script MUST output exactly one plain-English sentence explaining what is wrong. No stack traces. No log dumps. No Jira-style error codes.

**Acceptance**:
- Example failures:
  - "Your domain isn't pointing here."
  - "shipyard.company returned 404 from Vercel, not Cloudflare Pages."
  - "DNS for shipyard.company does not resolve to pages.cloudflare.com."
- Sentence MUST be ≤ 140 characters
- Exit code 1

---

### R-PROOF-007: No Wrangler or HTML Grep
**Type**: Architecture Constraint
**Priority**: P0
**Scope**: `scripts/proof.js`

The verification script MUST NOT shell out to `wrangler pages project list` or `grep` HTML response bodies for build IDs. It MUST use machine-readable inputs only (`domains.json`) and standard HTTP/DNS APIs.

**Acceptance**:
- No `child_process.exec` calls to `wrangler`
- No `String.prototype.includes` checks against HTML body for build metadata
- Only Node.js built-in modules (`https`, `dns`, `fs`, `url`) plus `domains.json`

---

### R-PROOF-008: Parallel-Ready Architecture
**Type**: Architecture Constraint
**Priority**: P1
**Scope**: `scripts/proof.js`, `domains.json`

The script architecture MUST support checking multiple domains in parallel, even though v1 ships with a single domain. The `domains.json` schema MUST accept an array of domain objects.

**Acceptance**:
- `domains.json` is an array: `[{ "domain": "...", "expected_origin": "..." }]`
- Script iterates over all entries in the array
- Checks run concurrently (e.g., `Promise.all`) rather than sequentially
- v1 ships with exactly one domain in the array

---

### R-PROOF-009: domains.json Configuration
**Type**: Configuration
**Priority**: P0
**Scope**: `domains.json`

A human-readable, version-controlled JSON file MUST replace any runtime API calls to wrangler for domain discovery. It defines the domains to verify and their expected Cloudflare origins.

**Acceptance**:
- File located at repo root: `./domains.json`
- Schema (minimum):
  ```json
  [
    {
      "domain": "shipyard.company",
      "expected_origin": "pages.cloudflare.com",
      "routes": ["/"]
    }
  ]
  ```
- `routes` field is reserved for v1.1 (may contain `["/"]` in v1)
- File is valid JSON and committed to git

---

### R-PROOF-010: Script Separated from YAML
**Type**: Architecture Constraint
**Priority**: P0
**Scope**: `scripts/proof.js`

The verification logic MUST live in a standalone Node.js script, not inline shell inside the GitHub Actions YAML. This enables local testing, readability, and platform portability.

**Acceptance**:
- Script located at `scripts/proof.js`
- Workflow step calls `node scripts/proof.js` (or similar)
- Script can be executed locally for testing: `node scripts/proof.js`
- Script exits 0 when run locally against valid domains

---

## Hindsight Risk Flags

From `/home/agent/shipyard-ai/.great-minds/hindsight-report.md`:

- **`.github/workflows/deploy-website.yml`** is relatively new (created 2026-04-29) and not flagged as high-churn. Low risk for modification.
- **`website/src/app/layout.tsx`** and **`website/src/app/page.tsx`** are moderate-churn files (11 and 8 changes). **Our deliverables do NOT touch these files** — the Proof feature is pure CI/infrastructure.
- **No uncommitted changes** in the build surface area. Uncommitted files are all in `rounds/github-issue-sethshoultes-shipyard-ai-98/` (debate transcripts) and do not affect the workflow or scripts.
- **No bug-associated files** in the scope of this build. The bug-associated files from hindsight are plugin sandbox entries and daemon deliverables — outside this project's surface area.

---

## Verified Technical Context

1. **Platform Lock**: The website is a Next.js static-export site (`output: "export"` in `next.config.ts`). Build produces `website/out/`.
2. **Deploy Target**: Cloudflare Pages via `wrangler pages deploy` (not Cloudflare Workers + D1 + R2 like Emdash sites). The `docs/EMDASH-GUIDE.md` §5 Deployment describes Workers deployment, which is NOT our target here. We are deploying a static Next.js site to Cloudflare Pages.
3. **Runtime**: GitHub Actions `ubuntu-latest` with Node.js 22. The runner has `node` by default.
4. **Secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are already configured in the existing workflow.
5. **Project Name**: `shipyard-ai` (confirmed in existing workflow).
6. **Slug Alignment**: Decisions.md Open Question 4.3 notes the requirements reference `github-issue-sethshoultes-shipyard-ai-99` but the round directory is `-98`. The PRD at `prds/github-issue-sethshoultes-shipyard-ai-98.md` matches the round directory. **We use `-98` as canonical** per the existing file paths.
