# PAID-TEMPLATE — Build To-Do

## Wave 1 — Foundation: Intake & Contract

- [ ] Create `intake/` directory — verify: `ls intake/` returns directory exists
- [ ] Create `intake/index.html` with 5 question fields — verify: `grep -cE '(question|input|textarea|select)' intake/index.html` returns ≥5
- [ ] Create `intake/questions.json` with question flow and branching logic — verify: `python3 -m json.tool intake/questions.json` parses without error
- [ ] Create `intake/mapper.js` that translates answers → schema.md — verify: `node --check intake/mapper.js` returns no syntax errors
- [ ] Create `schema/` directory — verify: `ls schema/` returns directory exists
- [ ] Create `schema/template.md` with 20-line max contract — verify: `wc -l schema/template.md | awk '{print $1}'` returns ≤20
- [ ] Create `prd/` directory — verify: `ls prd/` returns directory exists
- [ ] Create `prd/rules.md` with 50-line max and field blacklist — verify: `wc -l prd/rules.md | awk '{print $1}'` returns ≤50 and `grep -c "blacklist" prd/rules.md` returns ≥1
- [ ] Verify `mapper.js` output against `schema/template.md` shape — verify: `node intake/mapper.js --dry-run` produces markdown with expected headers

## Wave 2 — Agent System

- [ ] Create `agent/prompts/` directory — verify: `ls agent/prompts/` returns directory exists
- [ ] Create `agent/prompts/design.txt` with design agent system prompt — verify: `test -s agent/prompts/design.txt` returns true and file size <4KB (`stat -c%s agent/prompts/design.txt` < 4096)
- [ ] Create `agent/prompts/component.txt` with component agent system prompt — verify: `test -s agent/prompts/component.txt` returns true and file size <4KB
- [ ] Create `agent/prompts/deploy.txt` with deploy agent system prompt — verify: `test -s agent/prompts/deploy.txt` returns true and file size <4KB
- [ ] Create `agent/guardrails.json` with page-count limit and banned keywords — verify: `python3 -m json.tool agent/guardrails.json` parses and `grep -c "e-commerce\|auth\|i18n\|membership" agent/guardrails.json` returns ≥4
- [ ] Verify agent prompts reference `guardrails.json` — verify: `grep -c "guardrails" agent/prompts/*.txt` returns ≥3

## Wave 3 — Build Pipeline

- [ ] Create `build/` directory — verify: `ls build/` returns directory exists
- [ ] Create `build/index.js` orchestrator stub — verify: `node --check build/index.js` returns no syntax errors
- [ ] Add token-budget tracking to `build/index.js` — verify: `grep -c "budget\|burn\|token" build/index.js` returns ≥3
- [ ] Add retry policy (max 3 failures, human escalation) to `build/index.js` — verify: `grep -c "retry\|escalation\|blocked" build/index.js` returns ≥3
- [ ] Create `build/context-shard.js` — verify: `node --check build/context-shard.js` returns no syntax errors
- [ ] Verify orchestrator can read `schema/template.md` — verify: `node build/index.js --read-schema` exits 0 and prints schema headers
- [ ] Create `components/README.md` stating adaptable-primitives philosophy — verify: `grep -c "adaptable\|primitive\|rigid\|template" components/README.md` returns ≥2

## Wave 4 — Deploy System

- [ ] Create `deploy/` directory — verify: `ls deploy/` returns directory exists
- [ ] Create `deploy/preview.js` that exports a preview URL generator — verify: `grep -c "export\|module.exports\|function" deploy/preview.js` returns ≥1
- [ ] Create `deploy/badge-injector.js` with invisible signature only — verify: `grep -c "billboard\|visible badge\|Built by Shipyard" deploy/badge-injector.js` returns 0 and `grep -c "meta\|svg" deploy/badge-injector.js` returns ≥2
- [ ] Create `deploy/target-config.json` with default Vercel/Netlify config — verify: `python3 -m json.tool deploy/target-config.json` parses and `grep -c "vercel\|netlify\|local" deploy/target-config.json` returns ≥1
- [ ] Verify no CDN target is default — verify: `grep -c "cdn\|cloudfront\|fastly" deploy/target-config.json` returns 0

## Wave 5 — Ops Integration

- [ ] Create `ops/` directory — verify: `ls ops/` returns directory exists
- [ ] Create `ops/stripe-webhook.js` — verify: `node --check ops/stripe-webhook.js` returns no syntax errors
- [ ] Create `ops/hubspot-sync.js` — verify: `node --check ops/hubspot-sync.js` returns no syntax errors
- [ ] Verify zero commercial fields leak into `build/` or `schema/` — verify: `grep -r "stripe_payment_id\|deposit_paid\|balance_paid\|tos_signed" build/ schema/ prd/ 2>/dev/null | wc -l` returns 0

## Wave 6 — CI & Verification

- [ ] Create `.github/workflows/ci.yml` — verify: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` parses (or `grep -c "name:" .github/workflows/ci.yml` returns ≥1)
- [ ] Add PRD line-count lint job to CI — verify: `grep -c "wc -l\|line" .github/workflows/ci.yml` returns ≥1
- [ ] Add banned-pattern grep job to CI — verify: `grep -c "grep\|banned\|blacklist" .github/workflows/ci.yml` returns ≥1
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-structure.sh` — verify: exits 0
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-prd-compliance.sh` — verify: exits 0
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-banned-patterns.sh` — verify: exits 0
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-intake.sh` — verify: exits 0
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-agent-guardrails.sh` — verify: exits 0
- [ ] Run `deliverables/PAID-TEMPLATE/tests/test-deploy.sh` — verify: exits 0
