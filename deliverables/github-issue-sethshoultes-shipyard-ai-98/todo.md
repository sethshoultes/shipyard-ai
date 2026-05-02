# To-Do List: Deploy Verification — "Proof" (v1)

> Issue: sethshoultes/shipyard-ai#98
> Each task is atomic, verifiable, and completable in <5 minutes.

---

## Phase 1: Configuration Files

- [ ] Create `domains.json` with shipyard.company and www.shipyard.company — verify: `cat domains.json | jq '. | length'` returns 2
- [ ] Add `expected_origin` field to each domain entry — verify: `cat domains.json | jq '.[].expected_origin'` returns non-null values
- [ ] Validate `domains.json` is valid JSON — verify: `cat domains.json | jq .` exits 0

---

## Phase 2: Proof Verification Script

- [ ] Create `scripts/proof.js` file — verify: `test -f scripts/proof.js` exits 0
- [ ] Add Node.js shebang and strict mode — verify: `head -2 scripts/proof.js` contains `#!/usr/bin/env node` and `'use strict'`
- [ ] Implement domain list loader from `domains.json` — verify: script contains `fs.readFileSync` and `JSON.parse`
- [ ] Implement HTTPS GET function for domain verification — verify: script contains `https.get` or `fetch`
- [ ] Implement DNS origin resolution — verify: script contains `dns.resolve` or `resolveCname` or `resolve4`
- [ ] Implement origin validation (compare resolved vs expected) — verify: script compares resolved origin against `expected_origin`
- [ ] Implement exponential backoff retry logic — verify: script contains `setTimeout` and retry counter with max 60s
- [ ] Implement success output format (`Verified {domain} at {timestamp}`) — verify: `grep "Verified" scripts/proof.js` returns match
- [ ] Implement failure output (plain English sentence) — verify: script contains error message without stack traces
- [ ] Add parallel domain checking support — verify: script uses `Promise.all` or `Promise.allSettled`
- [ ] Add main entry point that exits 0 on success, 1 on failure — verify: script contains `process.exit(0)` and `process.exit(1)`
- [ ] Remove any TODO/FIXME/HACK/XXX comments — verify: `grep -iE 'TODO|FIXME|HACK|XXX' scripts/proof.js` returns nothing

---

## Phase 3: GitHub Actions Workflow

- [ ] Create `.github/workflows/` directory — verify: `test -d .github/workflows` exits 0
- [ ] Create `deploy-website.yml` workflow file — verify: `test -f .github/workflows/deploy-website.yml` exits 0
- [ ] Add workflow name and trigger on push to `website/**` — verify: `grep -q "on:" deploy-website.yml && grep -q "paths:" deploy-website.yml && grep -q "website/\*\*" deploy-website.yml`
- [ ] Add checkout step — verify: workflow contains `uses: actions/checkout`
- [ ] Add `npm ci` step in website directory — verify: `grep -q "npm ci" deploy-website.yml`
- [ ] Add `npm run build` step in website directory — verify: `grep -q "npm run build" deploy-website.yml`
- [ ] Add `wrangler pages deploy` step with project name — verify: `grep -q "wrangler pages deploy" deploy-website.yml && grep -q "shipyard-ai" deploy-website.yml`
- [ ] Add Cloudflare secrets references — verify: `grep -q "CLOUDFLARE_API_TOKEN" deploy-website.yml && grep -q "CLOUDFLARE_ACCOUNT_ID" deploy-website.yml`
- [ ] Add Proof verification step that runs `node scripts/proof.js` — verify: `grep -q "proof.js" deploy-website.yml`
- [ ] Validate workflow YAML syntax — verify: `cat deploy-website.yml | yq .` exits 0 (or manual visual inspection)

---

## Phase 4: Structural Validation

- [ ] Verify no subdirectories beyond allowed paths — verify: `find . -mindepth 1 -type d | grep -v -E '\.github|scripts|tests'` returns nothing
- [ ] Verify no spec.md or todo.md in deliverables root (test-as-spec pattern) — verify: `test ! -f spec.md` is false since we created it per instructions
- [ ] Verify no README.md or CHANGELOG.md — verify: `test ! -f README.md && test ! -f CHANGELOG.md` exits 0
- [ ] Verify no barrel files (index.js, index.ts) — verify: `test ! -f index.js && test ! -f index.ts` exits 0
- [ ] Run full placeholder scan — verify: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' .` returns nothing

---

## Phase 5: Functional Testing

- [ ] Run proof.js syntax check — verify: `node --check scripts/proof.js` exits 0
- [ ] Test proof.js with mock domains.json (dry run) — verify: script loads without errors
- [ ] Run all test scripts in `tests/` directory — verify: each test script exits 0

---

## Summary Checklist

| Phase | Tasks | Status |
|-------|-------|--------|
| Configuration | 3 | [ ] |
| Proof Script | 12 | [ ] |
| Workflow | 10 | [ ] |
| Structural | 5 | [ ] |
| Functional | 3 | [ ] |
| **Total** | **33** | |
