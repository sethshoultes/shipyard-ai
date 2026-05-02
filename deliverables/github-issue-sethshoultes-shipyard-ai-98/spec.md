# Specification — Proof: Deploy Verification v1

**Project:** github-issue-sethshoultes-shipyard-ai-98
**PRD:** Deploy verification: production custom domain not validated, 404s shipped silently
**Phase:** 1
**Generated:** 2026-05-02

---

## 1. Goals (from PRD)

### Problem Statement
DNS misconfiguration caused `shipyard.company` to point at Vercel IPs (`216.150.1.65`) returning `DEPLOYMENT_NOT_FOUND` 404s for 6+ days. The CF Pages deploy succeeded and `.pages.dev` preview worked, but no one verified the production custom domain actually served the deployed build.

### Expected Behavior
After every deploy, the pipeline must:
1. Fetch `/` for each custom domain attached to the CF Pages project
2. Verify status 200 AND that the response originates from Cloudflare Pages (not Vercel or any other host)
3. Fail the deploy and alert the operator if mismatch

### Success Criteria
- Issue sethshoultes/shipyard-ai#98 requirements are met
- All tests pass
- Origin validation prevents false positives from cached/wrong servers
- Fail-fast behavior: no retry loops, no dashboards, no knobs

---

## 2. Implementation Approach (from Plan + Decisions)

### Locked Architecture Decisions

| Decision | Source | Rationale |
|----------|--------|-----------|
| **Inline pipeline step** | Decision 1.1 | Verification runs as job step inside existing deploy workflow, not standalone microservice |
| **No wrangler/grep dependencies** | Decision 1.2 | Use only Node.js built-ins (`https`, `dns`, `fs`); no `wrangler pages project list`, no HTML body grep |
| **No retry loops in v1** | Decision 1.3 | Fail fast. The 404s lasted 6 days because nobody got paged, not because the check lacked patience |
| **Root path `/` only** | Decision 1.4 | v1 scope: if `/` 404s, the launch is dead. Deep routes are v1.1 |
| **Origin validation required** | Decision 1.5 | Validate response originates from expected Cloudflare Pages CNAME/A record, not merely HTTP 200 |
| **Default-on** | Decision 3.1 | Zero opt-in. Every customer deployment runs this automatically |
| **One breath, one answer** | Decision 2.2 | Success: single green signal + domain + timestamp. Failure: exactly one plain-English sentence |
| **Name: "Proof"** | Decision 2.1 | One word. Five letters. Hard consonant. |

### Wave 1: Foundation (Parallel)

1. **Create `domains.json`** — Version-controlled domain configuration
   - Schema: `[{ domain: string, expected_origin: string, routes: string[] }]`
   - Replaces runtime `wrangler` API dependency
   - v1: single domain, root path only (`["/"]`)

2. **Create `scripts/proof.js`** — Node.js verification engine
   - Reads `domains.json` (or `PROOF_DOMAINS_PATH` env var)
   - For each domain, performs in parallel:
     - DNS CNAME check against `expected_origin`
     - HTTPS GET to `https://{domain}/` with Cloudflare header validation (`CF-RAY` or `Server: cloudflare`)
   - Fail fast: exit 1 on first failure
   - Success output: `Verified {domain} {ISO8601_timestamp}`
   - Failure output: One plain-English sentence ≤140 chars, no stack traces

### Wave 2: Pipeline Integration (Parallel)

3. **Modify `.github/workflows/deploy-website.yml`**
   - Add Proof step immediately after "Deploy to Cloudflare Pages"
   - Guard: `if: github.ref == 'refs/heads/main'`
   - Run: `node scripts/proof.js`
   - Env: `PROOF_DOMAINS_PATH: ./domains.json`

### Wave 3: Verification (Sequential)

4. **Local dry-run** — Validate success/failure output, origin validation, fail-fast timing

---

## 3. Verification Criteria

### R-DEPLOY-001 (Workflow Trigger)
- **Verify:** `.github/workflows/deploy-website.yml` contains `on.push.branches: [main]` and `on.push.paths: ['website/**', '.github/workflows/deploy-website.yml']`
- **Test:** `grep -A5 "^on:" .github/workflows/deploy-website.yml` shows correct triggers

### R-DEPLOY-002 (Build Step)
- **Verify:** Workflow contains `npm ci` and `npm run build` in `website/` directory
- **Test:** `grep -A10 "npm ci" .github/workflows/deploy-website.yml` shows build commands

### R-DEPLOY-003 (Deploy Step)
- **Verify:** Workflow contains `wrangler pages deploy out --project-name=shipyard-ai`
- **Test:** `grep "wrangler pages deploy" .github/workflows/deploy-website.yml` returns non-empty

### R-DEPLOY-004 (Secrets References)
- **Verify:** Workflow references `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets
- **Test:** `grep "CLOUDFLARE_" .github/workflows/deploy-website.yml` shows both secrets

### R-PROOF-001 (Inline Default-On)
- **Verify:** Proof step appears AFTER deploy step, no opt-in required
- **Test:** Open workflow, confirm step ordering and no `if` condition that gates on user input

### R-PROOF-002 (Root Path Only)
- **Verify:** `scripts/proof.js` only checks `/` (root path)
- **Test:** `grep "routes" scripts/proof.js` or review code for path iteration

### R-PROOF-003 (Origin Validation)
- **Verify:** Script performs DNS CNAME check AND Cloudflare header validation
- **Test:** Code review confirms `dns.resolveCname()` and `CF-RAY`/`Server: cloudflare` header checks

### R-PROOF-004 (Fail Fast, No Retry)
- **Verify:** No `setTimeout`, no retry loops, no exponential backoff in code
- **Test:** `grep -E "(retry|setTimeout|backoff)" scripts/proof.js` returns empty

### R-PROOF-005 (Success Output)
- **Verify:** Success prints `Verified {domain} {ISO8601_timestamp}` per domain
- **Test:** Run with valid domain, confirm output format matches

### R-PROOF-006 (Failure Output)
- **Verify:** Failure prints exactly one sentence ≤140 chars, no stack traces
- **Test:** Run with invalid domain, confirm single-sentence output and exit code 1

### R-PROOF-007 (No wrangler/grep)
- **Verify:** No `child_process`, no `wrangler` calls, no HTML body grep
- **Test:** `grep -E "(child_process|wrangler|grep)" scripts/proof.js` returns empty

### R-PROOF-008 (Parallel-Ready)
- **Verify:** Domain checks run via `Promise.all` for concurrency
- **Test:** Code review confirms `Promise.all` usage

### R-PROOF-009 (domains.json Schema)
- **Verify:** File is valid JSON array with `domain`, `expected_origin`, `routes` keys
- **Test:** `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` exits 0

### R-PROOF-010 (Script Separated)
- **Verify:** `scripts/proof.js` exists as separate file, invoked via `node scripts/proof.js` in workflow
- **Test:** File exists and workflow contains `node scripts/proof.js`

---

## 4. Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `/home/agent/shipyard-ai/domains.json` | CREATE | Domain configuration with expected Cloudflare origin |
| `/home/agent/shipyard-ai/scripts/proof.js` | CREATE | Verification engine (DNS + HTTPS + origin validation) |
| `/home/agent/shipyard-ai/.github/workflows/deploy-website.yml` | MODIFY | Add Proof step after deploy |
| `/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/verify-domains-json.sh` | CREATE | Test: validate domains.json schema |
| `/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/verify-proof-script.sh` | CREATE | Test: verify proof.js structure and constraints |
| `/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/verify-workflow.sh` | CREATE | Test: verify workflow structure and Proof step |

---

## 5. Out of Scope (v1)

- Slack/Discord/PagerDuty notifications (v1.1)
- Multi-route verification beyond `/` (v1.1)
- Build-ID body grep or meta-tag injection (explicitly cut)
- `wrangler pages project list` runtime API calls (explicitly cut)
- Human approval gate
- Configurable retry policies, alert thresholds, propagation windows
- Cron syntax or scheduled checks
- DNS ownership migration (v2)

---

## 6. Requirements Traceability

| Requirement | Task(s) | Wave | Status |
|-------------|---------|------|--------|
| R-DEPLOY-001 (workflow trigger) | phase-1-task-3 | 2 | Pending |
| R-DEPLOY-002 (build step) | phase-1-task-3 | 2 | Pending |
| R-DEPLOY-003 (deploy step) | phase-1-task-3 | 2 | Pending |
| R-DEPLOY-004 (secrets refs) | phase-1-task-3 | 2 | Pending |
| R-PROOF-001 (inline default-on) | phase-1-task-3 | 2 | Pending |
| R-PROOF-002 (root path only) | phase-1-task-1, phase-1-task-2 | 1 | Pending |
| R-PROOF-003 (origin validation) | phase-1-task-2 | 1 | Pending |
| R-PROOF-004 (fail fast, no retry) | phase-1-task-2 | 1 | Pending |
| R-PROOF-005 (success output) | phase-1-task-2 | 1 | Pending |
| R-PROOF-006 (failure output) | phase-1-task-2 | 1 | Pending |
| R-PROOF-007 (no wrangler/grep) | phase-1-task-2 | 1 | Pending |
| R-PROOF-008 (parallel-ready) | phase-1-task-1, phase-1-task-2 | 1 | Pending |
| R-PROOF-009 (domains.json) | phase-1-task-1 | 1 | Pending |
| R-PROOF-010 (script separated) | phase-1-task-2, phase-1-task-3 | 1, 2 | Pending |
