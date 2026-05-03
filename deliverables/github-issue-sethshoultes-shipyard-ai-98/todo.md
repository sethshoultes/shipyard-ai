# TODO: Proof — Production Domain Verification Pipeline

**Issue**: sethshoultes/shipyard-ai#98
**Slug**: `github-issue-sethshoultes-shipyard-ai-98`
**Status**: Not Started

---

## Phase 1: Pipeline Workflow

- [ ] Create `.github/workflows/deploy-website.yml` with proper header — verify: file exists, `yq` or manual check shows `on.push.paths: ['website/**']`
- [ ] Add trigger for push to `main` branch — verify: `on.push.branches` includes `main`
- [ ] Add build step with `npm ci` in `website/` directory — verify: step contains `working-directory: ./website` and `npm ci`
- [ ] Add build step with `npm run build` — verify: step runs `npm run build` and outputs to `website/out/`
- [ ] Add deploy step with `wrangler pages deploy` — verify: command includes `website/out/` and project name `shipyard-ai`
- [ ] Configure deploy step with CF secrets — verify: uses `${{ secrets.CLOUDFLARE_API_TOKEN }}` and `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
- [ ] Add Proof step after deploy — verify: step has `needs: deploy` or runs sequentially after deploy
- [ ] Ensure Proof step is NOT optional — verify: no `continue-on-error: true` in Proof step
- [ ] Add Proof step runs `node scripts/proof.js` — verify: `run: node scripts/proof.js` or equivalent

---

## Phase 2: Proof Script

- [ ] Create `scripts/proof.js` with Node.js shebang — verify: file starts with `#!/usr/bin/env node` or is valid JS
- [ ] Implement domains.json loader — verify: script reads `domains.json` or `PROOF_DOMAINS` env var
- [ ] Implement origin config loader — verify: script reads `expected_origin` from config or `PROOF_EXPECTED_ORIGIN` env
- [ ] Implement HTTP GET function — verify: uses `https.get` or `fetch` to request `https://{domain}/`
- [ ] Implement origin validation — verify: checks `server` header or resolved hostname against expected origin
- [ ] Implement retry loop with 5 attempts — verify: code has loop with max 5 iterations
- [ ] Implement exponential backoff — verify: delays follow pattern (1s, 2s, 4s, 8s, 15s or similar)
- [ ] Implement success output format — verify: prints `✓ Verified {domain} at {ISO8601 timestamp}`
- [ ] Implement failure output format — verify: prints single sentence ≤140 chars, no stack traces
- [ ] Implement exit code 0 on success — verify: `process.exit(0)` on verification pass
- [ ] Implement exit code 1 on failure — verify: `process.exit(1)` on verification fail or origin mismatch

---

## Phase 3: Domain Configuration

- [ ] Create `domains.json` with valid JSON structure — verify: `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` succeeds
- [ ] Add `shipyard.company` domain entry — verify: JSON array contains object with `"domain": "shipyard.company"`
- [ ] Add `expected_origin` for each domain — verify: each entry has `"expected_origin"` key with value
- [ ] Set expected origin to `pages.cloudflare.com` — verify: origin matches Cloudflare Pages CNAME

---

## Phase 4: Validation

- [ ] Run YAML lint on workflow file — verify: `yamllint .github/workflows/deploy-website.yml` passes (or GitHub UI shows no errors)
- [ ] Run Node.js syntax check on proof.js — verify: `node --check scripts/proof.js` exits 0
- [ ] Run JSON validation on domains.json — verify: `node -e "JSON.parse(...)"` succeeds
- [ ] Run test script `tests/verify-workflow.sh` — verify: exits 0
- [ ] Run test script `tests/verify-proof-script.sh` — verify: exits 0
- [ ] Run test script `tests/verify-domains-config.sh` — verify: exits 0
- [ ] Run test script `tests/verify-no-banned-patterns.sh` — verify: exits 0, no dashboards/knobs/grep found
- [ ] Verify slug matches requirements — verify: directory name is exactly `github-issue-sethshoultes-shipyard-ai-98`

---

## Phase 5: QA Handoff

- [ ] All test scripts pass — verify: `for t in tests/*.sh; do $t; done` all exit 0
- [ ] No excluded features present — verify: grep for `dashboard`, `knob`, `wrangler pages project list`, `grep.*html` returns nothing
- [ ] spec.md complete — verify: file contains Goals, Implementation, Verification Criteria, Files list
- [ ] todo.md complete — verify: all checkboxes present with verify steps
- [ ] tests/ directory has ≥1 script — verify: `ls tests/*.sh` shows at least one file
- [ ] All scripts executable — verify: `ls -la tests/` shows `x` permission

---

## Notes

- **Timebox**: Each task should take <5 minutes
- **Verification**: Every task has a "verify:" step — do not mark complete without verifying
- **Slug discipline**: Directory must be `github-issue-sethshoultes-shipyard-ai-98` (match PRD filename)
- **Default-on**: No feature flags, no opt-in toggles
- **One breath**: Success = one line; failure = one sentence ≤140 chars
- **Retry**: 5 attempts with exponential backoff is REQUIRED (Decision 1.3)
