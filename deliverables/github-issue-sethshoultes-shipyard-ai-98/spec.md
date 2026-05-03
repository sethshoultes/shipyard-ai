# Spec: Deploy verification: production custom domain not validated, 404s shipped silently

**Issue**: sethshoultes/shipyard-ai#98
**Name**: Proof
**Status**: Ready for Build
**Owner**: Build Lead
**QA**: Margaret Hamilton

---

## 1. Goals

### Problem
Production custom domain `shipyard.company` DNS pointed at Vercel IPs from a previous deployment. Vercel project no longer exists — every request returned `DEPLOYMENT_NOT_FOUND` 404. CF Pages project had the domain attached and served correctly at `.pages.dev`. The mismatch went unnoticed for 6+ days. Pipeline never verified the production custom domain.

### Expected Behavior
After every deploy, the pipeline must:
1. For each custom domain attached to the CF Pages project, fetch `/` and verify status 200
2. Verify that the body matches the just-deployed build (contains build-id or unique string from new release)
3. Fail the deploy as failed and alert the operator if mismatch
4. Handle DNS propagation with retry logic

### Success Criteria
- Issue #98 requirements met
- All tests pass
- Default-on for every deploy (zero opt-in)
- Pipeline halts on verification failure
- Clear terminal output (no dashboards, no knobs)

---

## 2. Implementation Approach

### Architecture Decisions (from decisions.md)
| Decision | Resolution |
|----------|------------|
| 1.1 | Pipeline-native verification — verification runs as post-deploy step inside `.github/workflows/deploy-website.yml` |
| 1.2 | Header-based verification — inject and assert `X-Shipyard-Build` header against commit SHA (no HTML body parsing) |
| 1.3 | Default-on for every deploy — zero opt-in, zero toggles |
| 1.4 | Pipeline halts on verification failure — failed check fails the deploy, CI badge is the alert |
| 1.5 | Retry with exponential backoff — handle DNS propagation physics (5 attempts, ~30s total) |
| 1.6 | Redirect following — handle apex → www redirects (max 5 hops) |
| 1.7 | Parallel domain checks — use concurrency cap (10) to avoid pipeline bottlenecks |
| 1.8 | Check `/` only for v1 — root path verification only (deep routes deferred) |
| 1.9 | No HTML body matching — do not scrape HTML for build hashes in v1 |
| 1.10 | No QA handoff gate — Margaret does not manually curl domains |
| 2.1 | Name: "Proof" |
| 2.2 | Verdict output, not dashboards — one authoritative signal: Confirmed or Failed |
| 2.3 | No dashboards, no knobs, no configurable thresholds |
| 2.4 | Primary experience is the CI terminal in v1 |
| 2.5 | Human voice, not sysadmin prose — one sentence, plain English, no jargon |
| 3.1 | Proof is pipeline conscience, not a SKU — infrastructure hygiene |

### File Structure
```
github-issue-sethshoultes-shipyard-ai-98/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # Build + deploy + Proof step (MODIFY/CREATE)
├── website/                        # EXISTING — Next.js site (build context)
│   ├── package.json
│   └── ...
└── rounds/github-issue-sethshoultes-shipyard-ai-98/
    ├── decisions.md                # This document
    └── ...                         # Other debate artifacts
```

### Pipeline Flow (deploy-website.yml)
1. **Trigger**: `push` to `main` when `website/**` changes
2. **Build**: `npm ci && npm run build` in `website/` → `website/out/`
3. **Deploy**: `wrangler pages deploy website/out/` to project `shipyard-ai`
4. **Proof**: Post-deploy verification step (inline or invoked script)

### Proof Verification Step
- **Domain Detection**: Read custom domains from `wrangler pages project get --json`
- **Target**: Root path `/` via HTTPS
- **Redirect Handling**: Follow 301/302 redirects (max 5 hops)
- **Build Validation**: Validate `X-Shipyard-Build` header matches `$CF_PAGES_COMMIT_SHA`
- **Retry**: Up to 5 times with exponential backoff (~30s total)
- **Parallelization**: Parallel domain checks with concurrency cap (10)
- **Success Output**: `Proof: <domain> confirmed.`
- **Failure Output**: One plain-English sentence explaining specific failure
- **Exit Code**: 0 on success, 1 on failure

---

## 3. Verification Criteria

### V1 — Pipeline Trigger (DEPLOY-001)
- **Check**: Workflow file exists at `.github/workflows/deploy-website.yml`
- **Check**: `on.push.paths` includes `['website/**']`
- **Check**: Workflow triggers on push to `main` branch

### V2 — Build Step (DEPLOY-002)
- **Check**: Workflow contains `npm ci` step in `website/` directory
- **Check**: Workflow contains `npm run build` step
- **Check**: Build output directory is `website/out/`

### V3 — Deploy Step (DEPLOY-003)
- **Check**: Workflow contains `wrangler pages deploy website/out/` command
- **Check**: Deploy targets Cloudflare Pages project `shipyard-ai`
- **Check**: Uses repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

### V4 — Proof Inline Step (DEPLOY-004)
- **Check**: Proof step runs AFTER deploy step (depends on deploy success)
- **Check**: Proof step is NOT optional (no `continue-on-error: true`)
- **Check**: Proof step runs `node scripts/proof.js` or equivalent

### V5 — Proof Script Existence
- **Check**: `scripts/proof.js` exists and is valid Node.js
- **Check**: Script has shebang or is runnable via `node`
- **Check**: Script reads `domains.json` or env var `PROOF_DOMAINS`

### V6 — Origin Validation
- **Check**: Script performs origin validation (not just HTTP 200)
- **Check**: Origin check validates against `expected_origin` from config
- **Check**: Script exits 1 if origin mismatch, even on HTTP 200

### V7 — Retry Logic
- **Check**: Script implements 5 retry attempts
- **Check**: Backoff is exponential (delays: 1s, 2s, 4s, 8s, 15s or similar)
- **Check**: Total retry window is ~60 seconds

### V8 — Output Format
- **Check**: Success output matches: `✓ Verified {domain} at {ISO8601 timestamp}`
- **Check**: Failure output is single sentence ≤140 characters
- **Check**: No stack traces, no log dumps in failure output

### V9 — Exit Codes
- **Check**: Script exits 0 on successful verification
- **Check**: Script exits 1 on verification failure
- **Check**: Script exits 1 on configuration error (missing domain, missing origin)

### V10 — Default-On
- **Check**: No feature flag, no opt-in toggle in workflow
- **Check**: Proof step runs unconditionally after deploy

---

## 4. Files to Create/Modify

### Modified Files
| File | Purpose |
|------|---------|
| `.github/workflows/deploy-website.yml` | Add build, deploy, and Proof verification steps |

### New Files (Optional)
| File | Purpose |
|------|---------|
| `scripts/proof.js` | Verification engine (if inline workflow exceeds ~50 lines) |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/spec.md` | This specification |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/todo.md` | Task breakdown |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/*.sh` | Verification test scripts |

---

## 5. Out of Scope (v1)

| Feature | Deferred To |
|---------|-------------|
| Multi-route verification (`/about`, `/pricing`, etc.) | v1.1 or v2 |
| BUILD_ID body grep or HTML meta-tag scraping | v2 |
| Slack/Discord/PagerDuty/alerting integrations | v1.1 |
| Monitoring dashboards, latency percentile graphs, or health matrices | Never |
| Configurable retry policies, alert thresholds, or propagation windows | Never |
| Cron syntax or scheduled checks outside the deploy pipeline | Never |
| Human approval gate or QA handoff step | Never |
| Standalone microservice, container, or queue | Never |
| Multi-region validation for v1 vs later | v1.1 or v2 |

---

## 6. Risk Notes

| Risk | Mitigation |
|------|------------|
| False negative from DNS cache / wrong origin | Origin validation is non-negotiable; HTTP 200 alone fails |
| Green on `/`, 404 on sub-routes | Accepted for v1; document in comments |
| Retry timeout too short for slow DNS | 60s is baseline; adjust to 90s in v1.1 if telemetry proves need |
| Scope creep into monitoring platform | Cultural guardrail: "Proof is the verdict, not the courtroom" |

---

## 7. Definition of Done

- [ ] All 10 verification criteria pass
- [ ] Test scripts in `tests/` exit 0
- [ ] Workflow file is valid YAML (passes `yamllint` or GitHub validation)
- [ ] Proof script is valid Node.js (passes `node --check`)
- [ ] `domains.json` is valid JSON
- [ ] No excluded features present (no dashboards, no knobs, no build-ID grep)
- [ ] Slug matches requirements: `github-issue-sethshoultes-shipyard-ai-98`
