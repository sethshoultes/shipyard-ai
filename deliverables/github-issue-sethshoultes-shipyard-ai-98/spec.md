# Spec: Proof — Production Domain Verification Pipeline

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
1. Fetch `/` at each custom domain attached to the CF Pages project
2. Verify HTTP 200 status AND that response originates from expected Cloudflare Pages origin
3. Retry with exponential backoff (5 attempts over 60 seconds) to accommodate DNS propagation
4. Fail the deploy and alert the operator if verification fails

### Success Criteria
- Issue #98 requirements met
- All tests pass
- Default-on, zero opt-in
- Terminal output only (no dashboards, no knobs)
- One breath, one answer: success = `Verified` + domain + timestamp; failure = one plain-English sentence ≤140 chars

---

## 2. Implementation Approach

### Architecture Decisions (from decisions.md)
| Decision | Resolution |
|----------|------------|
| 1.1 | Inline pipeline step — verification runs as job step inside existing deploy pipeline |
| 1.2 | No `wrangler` CLI or HTML-grep — machine-readable inputs only (env vars, config files) |
| 1.3 | Retry with exponential backoff — 5 attempts over 60 seconds (Elon + Steve consensus) |
| 1.4 | Check `/` only for v1 — root path is the v1 signal |
| 1.5 | Origin validation ships, or nothing ships — validate response from expected CF Pages origin |
| 1.6 | Cut build-ID body grep for v1 — no HTML meta-tag injection |
| 2.1 | Name: "Proof" |
| 2.2 | One breath, one answer — binary output |
| 2.3 | No dashboards, no knobs, no configurable thresholds |
| 2.4 | Terminal screen is primary experience in v1 |
| 3.1 | Default-on in deploy template — zero opt-in |

### File Structure
```
github-issue-sethshoultes-shipyard-ai-98/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # Build + deploy + Proof (inline step)
├── scripts/
│   └── proof.js                    # Verification engine
├── domains.json                    # Domain list + expected CF origins
└── decisions.md                    # Debate record
```

### Pipeline Flow (deploy-website.yml)
1. **Trigger**: `push` to `main` when `website/**` changes
2. **Build**: `npm ci && npm run build` in `website/` → `website/out/`
3. **Deploy**: `wrangler pages deploy website/out/` to project `shipyard-ai`
4. **Proof**: Run `scripts/proof.js` — inline post-deploy check

### Proof Script Behavior (proof.js)
- **Input**: `domains.json` + env vars (`PROOF_DOMAINS`, `PROOF_EXPECTED_ORIGIN`)
- **Method**: HTTP GET to `https://{domain}/` with origin validation
- **Retry**: 5 attempts, exponential backoff (1s, 2s, 4s, 8s, 15s = ~30s total + overhead)
- **Origin Check**: Validate `server` header or resolved CNAME matches expected Cloudflare Pages origin
- **Success Output**: `✓ Verified shipyard.company at 2026-05-03T12:34:56Z`
- **Failure Output**: `Your domain isn't pointing here.` (or similar, ≤140 chars)
- **Exit Code**: 0 on success, 1 on failure

### domains.json Schema
```json
[
  {
    "domain": "shipyard.company",
    "expected_origin": "pages.cloudflare.com"
  },
  {
    "domain": "www.shipyard.company",
    "expected_origin": "pages.cloudflare.com"
  }
]
```

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

### New Files
| File | Purpose |
|------|---------|
| `.github/workflows/deploy-website.yml` | GitHub Actions pipeline with Proof step |
| `scripts/proof.js` | Verification engine (origin check, retry, output) |
| `domains.json` | Domain configuration with expected origins |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/spec.md` | This specification |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/todo.md` | Task breakdown |
| `deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/*.sh` | Verification test scripts |

### Modified Files
- None (this is net-new infrastructure)

---

## 5. Out of Scope (v1)

| Feature | Deferred To |
|---------|-------------|
| Multi-route verification (`/pricing`, `/checkout`) | v1.1 |
| Slack/Discord/PagerDuty notifications | v1.1 |
| Build-ID body grep / meta-tag verification | v2 |
| `wrangler pages project list` runtime API calls | Never (use `domains.json`) |
| Human approval gate | Never |
| Configurable retry policies / thresholds | Never |
| Dashboards, charts, knobs | Never |
| DNS ownership migration | v2 |

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
