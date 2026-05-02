# Spec: Proof — Post-Deploy Domain Verification

**Project:** `daemon-fix-watcher-skip-loop`
**Generated:** 2026-05-02
**Source PRD:** `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-98.md`
**Source Plan:** `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
**Decisions:** `/home/agent/shipyard-ai/rounds/daemon-fix-watcher-skip-loop/decisions.md`

---

## Goals (from PRD)

### Primary Goal
Add post-deploy verification to catch DNS misconfigurations before they cause silent 404s. The pipeline must verify that production custom domains actually serve the deployed build.

### Problem Statement (from PRD #98)
- `shipyard.company` DNS pointed at Vercel IPs (`216.150.1.65`) from a previous deployment
- Vercel project no longer existed — every request returned `DEPLOYMENT_NOT_FOUND` 404
- CF Pages project `shipyard-ai` had the domain attached and served correctly at `shipyard-ai.pages.dev`
- Mismatch went unnoticed for **6+ days**
- No verification that production custom domain actually serves the deployed build

### Expected Behavior
After every deploy, the pipeline should:
1. For each custom domain attached to the CF Pages project, fetch `/` and verify status 200
2. Verify DNS origin matches expected Cloudflare origin (CNAME or CF headers)
3. Fail the deploy and alert the operator if mismatch

### Non-Goals (Explicitly Cut)
- No monitoring dashboards (v2 scope)
- No retry loops (fail-fast per PRD)
- No Slack webhooks (terminal-only output)
- No HTML body parsing for build IDs (DNS + header validation is sufficient)

---

## Implementation Approach (from Plan)

### Wave 1: Configuration + Verification Engine

#### Task 1: Create `domains.json`
- **Location:** `/home/agent/shipyard-ai/domains.json`
- **Schema:** Array of objects:
  ```json
  [
    {
      "domain": "shipyard.company",
      "expected_origin": "pages.cloudflare.com",
      "routes": ["/"]
    }
  ]
  ```
- **Purpose:** Version-controlled domain configuration for Proof verification
- **Replaces:** Runtime `wrangler` CLI calls (Decision 1.2)
- **Validation:** `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` exits 0

#### Task 2: Create `scripts/proof.js`
- **Location:** `/home/agent/shipyard-ai/scripts/proof.js`
- **Dependencies:** Node.js built-ins only (`https`, `dns`, `fs`, `path`, `url`)
- **Checks per domain (in parallel):**
  - **DNS CNAME check:** `dns.resolveCname(domain)` — pass if any record matches `expected_origin`
  - **Fallback DNS:** If CNAME fails, `dns.resolve4(domain)` + HTTPS header check
  - **HTTPS GET check:** `https.get` with `User-Agent: Shipyard-Proof/1.0` — accept only status 200
  - **Cloudflare header validation:** Check for `CF-RAY` or `Server: cloudflare` headers
- **Output:**
  - Success: `Verified {domain} {ISO8601_timestamp}` per domain, exit 0
  - Failure: One plain-English sentence ≤140 chars, exit 1, no stack traces
- **Config:** Reads `./domains.json` by default; override via `PROOF_DOMAINS_PATH` env var

### Wave 2: Workflow Integration

#### Task 3: Modify `.github/workflows/deploy-website.yml`
- Add Proof step immediately after "Deploy to Cloudflare Pages" step
- Guard: `if: github.ref == 'refs/heads/main'` (matches deploy step guard)
- Run: `node scripts/proof.js` from repo root
- Env: `PROOF_DOMAINS_PATH: ./domains.json`
- No additional secrets required

### Wave 3: Local Verification

#### Task 4: Dry-run Tests
- Test success path with real domain
- Test failure path with nonsense domain (e.g., `this-is-not-a-real-domain-12345.test`)
- Test origin validation with wrong-CNAME domain (e.g., `vercel.com` expecting `pages.cloudflare.com`)
- Verify elapsed time <10s (fail-fast guarantee)

---

## Verification Criteria

### V1: `domains.json` exists and is valid
| Check | Command | Expected |
|-------|---------|----------|
| Valid JSON syntax | `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` | Exit 0 |
| Valid JSON (pretty) | `python3 -m json.tool domains.json` | Pretty-prints without error |
| Schema correct | Manual inspection | Array with objects containing `domain`, `expected_origin`, `routes` |

### V2: `scripts/proof.js` runs without syntax errors
| Check | Command | Expected |
|-------|---------|----------|
| No syntax errors | `node scripts/proof.js` | Executes (may fail verification legitimately) |
| Module loads | `node -e "require('./scripts/proof.js')"` | No syntax error thrown |
| No banned patterns | `grep -E 'child_process|wrangler|require\(".*"\)' scripts/proof.js` | No matches (only built-ins) |

### V3: Failure output is correct
| Check | Command | Expected |
|-------|---------|----------|
| Exit code 1 | `PROOF_DOMAINS_PATH=./domains-test-fail.json node scripts/proof.js; echo $?` | Exit code 1 |
| One sentence | Output line count | Exactly 1 line |
| ≤140 chars | `wc -c` on output | ≤140 characters |
| No stack trace | Visual inspection | No `Error:` or `at ` lines |

### V4: Success output is correct
| Check | Command | Expected |
|-------|---------|----------|
| Exit code 0 | `node scripts/proof.js; echo $?` (with valid domain) | Exit code 0 |
| Format correct | Output matches regex | `^Verified .+ \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}` |

### V5: Workflow integration is correct
| Check | Command | Expected |
|-------|---------|----------|
| Valid YAML | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"` | No error |
| Proof step position | Manual inspection | Appears AFTER deploy step |
| Guard matches | `grep -A2 "Proof" .github/workflows/deploy-website.yml` | `if: github.ref == 'refs/heads/main'` |
| Script call | `grep "node scripts/proof.js" .github/workflows/deploy-website.yml` | Present |

### V6: Fail-fast timing
| Check | Command | Expected |
|-------|---------|----------|
| Elapsed time | `time node scripts/proof.js` | <10 seconds |

---

## Files to Create or Modify

### New Files
| File | Purpose |
|------|---------|
| `/home/agent/shipyard-ai/domains.json` | Domain configuration for Proof verification |
| `/home/agent/shipyard-ai/scripts/proof.js` | Node.js verification engine |
| `/home/agent/shipyard-ai/deliverables/daemon-fix-watcher-skip-loop/spec.md` | This specification |
| `/home/agent/shipyard-ai/deliverables/daemon-fix-watcher-skip-loop/todo.md` | Running task list |
| `/home/agent/shipyard-ai/deliverables/daemon-fix-watcher-skip-loop/tests/*.sh` | Verification test scripts |

### Modified Files
| File | Change |
|------|--------|
| `/home/agent/shipyard-ai/.github/workflows/deploy-website.yml` | Add Proof verification step after deploy |

### Test Files (Temporary, for Task 4)
| File | Purpose | Cleanup |
|------|---------|---------|
| `domains-test-fail.json` | Test failure output | Delete after test |
| `domains-test-cname.json` | Test origin validation | Delete after test |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Runner                        │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  Deploy to  │    │    Proof    │    │   Mark Complete     │ │
│  │  CF Pages   │───▶│ Verification│───▶│   (if all pass)     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│                   ┌─────────────┐                               │
│                   │ domains.json│                               │
│                   └─────────────┘                               │
│                          │                                      │
│                          ▼                                      │
│                   ┌─────────────┐                               │
│                   │  proof.js   │                               │
│                   └─────────────┘                               │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              ▼                       ▼                          │
│       ┌─────────────┐         ┌─────────────┐                   │
│       │ DNS CNAME   │         │ HTTPS GET   │                   │
│       │ Check       │         │ Check       │                   │
│       └─────────────┘         └─────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Risk Notes

1. **DNS CNAME for apex domains** — Apex domains may use A records rather than CNAME due to RFC constraints. The `proof.js` fallback to CF-RAY header detection handles this.
2. **False positive from cached pages** — HTTP 200 alone could pass for parked/catch-all pages. Origin validation (CNAME + CF headers) prevents this per R-PROOF-003.
3. **GitHub Actions network access** — Runner must reach public internet for DNS/HTTPS checks. Standard for `ubuntu-latest` runners.
4. **Scope creep** — Any PR adding dashboards, retry loops, or webhooks must be rejected without explicit Open Question resolution.

---

## Commit Messages

1. `feat(proof): add domains.json for post-deploy verification config`
2. `feat(proof): add verification engine with origin validation`
3. `ci(deploy): add Proof verification step inline after CF Pages deploy`
4. `test(proof): local dry-run verification passed`

---

## Acceptance Criteria (from PRD #98)

- [ ] Pipeline verifies production custom domain after deploy
- [ ] DNS misconfiguration caught before marking deploy complete
- [ ] Verification fails fast (no retry loops)
- [ ] Output is terminal-only (no dashboards, no webhooks)
- [ ] All tests pass
- [ ] No new npm dependencies
