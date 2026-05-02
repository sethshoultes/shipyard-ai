# To-Do List — Proof: Deploy Verification v1

**Project:** github-issue-sethshoultes-shipyard-ai-98
**Phase:** 1
**Total Tasks:** 33 (all <5 minutes each)

---

## Wave 1: Foundation

### domains.json Configuration

- [x] Create `/home/agent/shipyard-ai/domains.json` file — verify: `test -f domains.json` exits 0
- [x] Add JSON array structure with `_comment` field explaining purpose — verify: `grep "_comment" domains.json` returns non-empty
- [x] Add domain entry for `shipyard.company` — verify: `grep "shipyard.company" domains.json` returns non-empty
- [x] Add `expected_origin: "pages.cloudflare.com"` — verify: `grep "pages.cloudflare.com" domains.json` returns non-empty
- [x] Add `routes: ["/"]` array (v1 root path only) — verify: `grep 'routes.*"/"' domains.json` returns non-empty
- [x] Validate JSON syntax with Node.js — verify: `node -e "JSON.parse(require('fs').readFileSync('domains.json'))"` exits 0
- [x] Validate JSON syntax with python — verify: `python3 -m json.tool domains.json > /dev/null` exits 0

### scripts/proof.js Verification Engine

- [x] Create `/home/agent/shipyard-ai/scripts/` directory — verify: `test -d scripts` exits 0
- [x] Create `scripts/proof.js` with shebang `#!/usr/bin/env node` — verify: `head -1 scripts/proof.js` shows shebang
- [x] Import only Node.js built-ins: `https`, `dns`, `fs`, `path` — verify: `grep "require\|import" scripts/proof.js` shows only built-in modules
- [x] Add code to read `domains.json` from CWD or `PROOF_DOMAINS_PATH` env var — verify: `grep "PROOF_DOMAINS_PATH" scripts/proof.js` returns non-empty
- [x] Add JSON parse error handling with `process.exit(1)` — verify: code contains exit on parse failure
- [x] Implement DNS CNAME resolver using `dns.resolveCname(domain)` — verify: `grep "resolveCname" scripts/proof.js` returns non-empty
- [x] Compare CNAME result against `expected_origin` from config — verify: code contains string comparison
- [x] Add A record fallback using `dns.resolve4(domain)` for apex domains — verify: `grep "resolve4" scripts/proof.js` returns non-empty
- [x] Implement HTTPS GET using `https.get` with `User-Agent: Shipyard-Proof/1.0` — verify: `grep "User-Agent" scripts/proof.js` returns non-empty
- [x] Accept only HTTP 200 status code — verify: code contains `statusCode === 200` check
- [x] Check for Cloudflare headers (`CF-RAY` or `Server: cloudflare`) — verify: `grep -E "(CF-RAY|cloudflare)" scripts/proof.js` returns non-empty
- [x] Use `Promise.all` for parallel domain checks — verify: `grep "Promise.all" scripts/proof.js` returns non-empty
- [x] Print `Verified {domain} {ISO8601_timestamp}` on success — verify: `grep "Verified" scripts/proof.js` returns non-empty
- [x] Print one plain-English sentence ≤140 chars on failure — verify: code contains single error message before exit
- [x] Exit with code 1 on failure, code 0 on success — verify: `grep "process.exit" scripts/proof.js` shows both codes
- [x] Make script executable with `chmod +x` — verify: `ls -la scripts/proof.js` shows execute permission

---

## Wave 2: Pipeline Integration

### Workflow Verification (Read Existing)

- [x] Open `.github/workflows/deploy-website.yml` and identify structure — verify: can locate trigger, build, deploy, secrets sections
- [x] Verify R-DEPLOY-001: `on.push.branches` includes `main` — verify: `grep -A5 "^on:" .github/workflows/deploy-website.yml` shows `main`
- [x] Verify R-DEPLOY-001: `on.push.paths` includes `website/**` — verify: `grep "website/\*\*" .github/workflows/deploy-website.yml` returns non-empty
- [x] Verify R-DEPLOY-002: `npm ci` exists — verify: `grep "npm ci" .github/workflows/deploy-website.yml` returns non-empty
- [x] Verify R-DEPLOY-002: `npm run build` exists — verify: `grep "npm run build" .github/workflows/deploy-website.yml` returns non-empty
- [x] Verify R-DEPLOY-003: `wrangler pages deploy` with `--project-name=shipyard-ai` — verify: `grep "wrangler pages deploy" .github/workflows/deploy-website.yml` returns non-empty
- [x] Verify R-DEPLOY-004: `CLOUDFLARE_API_TOKEN` referenced — verify: `grep "CLOUDFLARE_API_TOKEN" .github/workflows/deploy-website.yml` returns non-empty
- [x] Verify R-DEPLOY-004: `CLOUDFLARE_ACCOUNT_ID` referenced — verify: `grep "CLOUDFLARE_ACCOUNT_ID" .github/workflows/deploy-website.yml` returns non-empty

### Workflow Modification (Add Proof Step)

- [x] Add Proof step named "Proof — verify production domain" after deploy step — verify: workflow contains step with "Proof" in name
- [x] Add `run: node scripts/proof.js` to Proof step — verify: `grep "node scripts/proof.js" .github/workflows/deploy-website.yml` returns non-empty
- [x] Add `if: github.ref == 'refs/heads/main'` guard to Proof step — verify: `grep "github.ref.*main" .github/workflows/deploy-website.yml` returns non-empty
- [x] Add `env: PROOF_DOMAINS_PATH: ./domains.json` to Proof step — verify: `grep "PROOF_DOMAINS_PATH" .github/workflows/deploy-website.yml` returns non-empty
- [x] Validate workflow YAML syntax — verify: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"` exits 0

---

## Wave 3: Verification Tests

### Test Scripts

- [x] Create `/home/agent/shipyard-ai/deliverables/github-issue-sethshoultes-shipyard-ai-98/tests/` directory — verify: `test -d deliverables/github-issue-sethshoultes-shipyard-ai-98/tests` exits 0
- [x] Create `tests/verify-domains-json.sh` — verify: `test -f tests/verify-domains-json.sh` exits 0
- [x] Create `tests/verify-proof-script.sh` — verify: `test -f tests/verify-proof-script.sh` exits 0
- [x] Create `tests/verify-workflow.sh` — verify: `test -f tests/verify-workflow.sh` exits 0
- [x] Make all test scripts executable — verify: `ls -la tests/*.sh` shows execute permissions
- [x] Run `tests/verify-domains-json.sh` — verify: script exits 0
- [x] Run `tests/verify-proof-script.sh` — verify: script exits 0
- [x] Run `tests/verify-workflow.sh` — verify: script exits 0

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 | 7 + 16 = 23 | domains.json + proof.js |
| Wave 2 | 8 + 5 = 13 | Workflow verification + modification |
| Wave 3 | 8 | Test scripts + execution |
| **Total** | **33** | All atomic, all <5 minutes |
