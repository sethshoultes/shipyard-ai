# Spec: Deploy Verification — "Proof" (v1)

> Issue: sethshoultes/shipyard-ai#98
> PRD: Deploy verification: production custom domain not validated, 404s shipped silently
> Status: Blueprint for Build Phase

---

## 1. Goals (from PRD)

### Problem Statement
After deploying to Cloudflare Pages, the production custom domain (`shipyard.company`) continued pointing at Vercel IPs (`216.150.1.65`) from a previous deployment. The Vercel project no longer existed — every request returned `DEPLOYMENT_NOT_FOUND` 404. The CF Pages project served correctly at `.pages.dev`, but this mismatch went unnoticed for **6+ days**. No verification step ensured the production custom domain actually served the deployed build.

### Expected Behavior
After every deploy, the pipeline must:
1. Fetch `/` for each custom domain attached to the CF Pages project
2. Verify status 200 AND that the response comes from the expected Cloudflare origin
3. Fail the deploy and alert the operator if mismatch detected

### Success Criteria
- Issue sethshoultes/shipyard-ai#98 requirements are met
- All tests pass
- Verification runs automatically as part of the deploy pipeline (default-on)
- No human gate required

---

## 2. Implementation Approach (from Plan + Decisions)

### Architecture Decisions (Locked)

| Decision | Rationale |
|----------|-----------|
| **Inline pipeline check** | Verification runs as a step inside the existing deploy pipeline, not as a separate microservice. Accountability in 5 seconds. |
| **Origin-validated health check** | Validate response CNAME/A record against expected Cloudflare Pages origin, not merely HTTP 200. DNS caches old A records. |
| **Parallelize + exponential backoff (60s max)** | Bottleneck is DNS propagation, not CPU. Serial curls timeout at 100 domains. |
| **Cut `wrangler pages project list`** | Hardcode domains in `domains.json`. Runtime API calls are fragile, slow, and hit rate limits. |
| **No human owner gate** | Automation owns verification. Human gates cause 6-day outages. |
| **Name: "Proof"** | One word. One screen. One truth. |
| **One word, one screen, one truth** | Success: `Verified` + domain + timestamp. Failure: one plain-English sentence. No stack traces. |
| **No dashboards, knobs, or thresholds** | This is a moment of truth, not a monitoring platform. |
| **Default-on in deploy template** | Every customer deployment runs this automatically. Opt-in = off. |
| **Cut build-ID body grep** | Status 200 + origin validation is the v1 signal. |
| **Cut "key routes" verification** | Ship `/` only in v1. Multi-route is v1.1. |

### v1 MVP Scope

**Core Deliverables:**
1. GitHub Actions workflow `.github/workflows/deploy-website.yml`
2. Build step: `npm ci && npm run build` in `website/`
3. Deploy step: `wrangler pages deploy website/out/` to CF Pages project `shipyard-ai`
4. Proof verification step: inline post-deploy check

**Verification Behavior:**
- Target: Root path `/` via HTTPS
- Method: HTTP GET with origin validation (expected CF Pages IP/CNAME)
- Retry: Exponential backoff up to 60 seconds
- Parallel: Architecture supports parallel domain checks
- Success output: `Verified` + domain + timestamp
- Failure output: One plain-English sentence

**Explicitly NOT in v1:**
- Slack/Discord/PagerDuty integrations
- Multi-route verification
- Build-ID body grep
- `wrangler pages project list` API calls
- Human approval gate
- Configurable retry policies or thresholds

---

## 3. Verification Criteria

### DEPLOY-001: Workflow Trigger
- **Verify**: `.github/workflows/deploy-website.yml` contains `on.push.paths: ['website/**']`
- **Check**: `grep -q "on:" deploy-website.yml && grep -q "push:" deploy-website.yml && grep -q "paths:" deploy-website.yml && grep -q "website/\*\*" deploy-website.yml`
- **Exit 0**: Workflow triggers on push to `website/**`

### DEPLOY-002: Build Step
- **Verify**: Workflow contains `npm ci` and `npm run build` in `website/` directory
- **Check**: `grep -q "npm ci" deploy-website.yml && grep -q "npm run build" deploy-website.yml`
- **Exit 0**: Build step exists

### DEPLOY-003: Deploy Step
- **Verify**: Workflow contains `wrangler pages deploy` with correct project name and secrets
- **Check**: `grep -q "wrangler pages deploy" deploy-website.yml && grep -q "CLOUDFLARE_API_TOKEN" deploy-website.yml && grep -q "CLOUDFLARE_ACCOUNT_ID" deploy-website.yml`
- **Exit 0**: Deploy step with CF credentials exists

### DEPLOY-004: Proof Verification Step
- **Verify**: Workflow contains inline verification step post-deploy
- **Check**: `grep -q "proof" deploy-website.yml` or `grep -q "verify" deploy-website.yml`
- **Exit 0**: Verification step exists

### PROOF-001: Origin Validation
- **Verify**: `scripts/proof.js` validates origin (CNAME/A record), not just HTTP 200
- **Check**: `grep -q "origin" scripts/proof.js` or `grep -q "dns" scripts/proof.js` or `grep -q "resolve" scripts/proof.js`
- **Exit 0**: Origin validation logic exists

### PROOF-002: Retry Logic
- **Verify**: `scripts/proof.js` implements exponential backoff with 60s max
- **Check**: `grep -q "retry" scripts/proof.js && grep -q "backoff" scripts/proof.js`
- **Exit 0**: Retry logic exists

### PROOF-003: Output Format
- **Verify**: Success outputs `Verified` + domain + timestamp; failure outputs plain English
- **Check**: `grep -q "Verified" scripts/proof.js && grep -q "console.log" scripts/proof.js`
- **Exit 0**: Output formatting exists

### CONFIG-001: Domain Configuration
- **Verify**: `domains.json` exists with domain + expected_origin schema
- **Check**: `cat domains.json | jq '.[].domain'` and `cat domains.json | jq '.[].expected_origin'` return values
- **Exit 0**: Valid domain configuration

### STRUCT-001: File Existence
- **Verify**: All required files exist
- **Check**: Files exist at correct paths (see File List below)
- **Exit 0**: All files present

### STRUCT-002: No Banned Patterns
- **Verify**: No TODO, FIXME, HACK, XXX, placeholder comments
- **Check**: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder' .` returns nothing
- **Exit 0**: No placeholders

---

## 4. File List

### Files to Create

| Path | Purpose |
|------|---------|
| `.github/workflows/deploy-website.yml` | GitHub Actions workflow: build + deploy + Proof verification |
| `scripts/proof.js` | Verification engine: origin check, retry, output formatting |
| `domains.json` | Domain list + expected Cloudflare origins |

### Files Modified

| Path | Changes |
|------|---------|
| *(None)* | This is a new feature; no existing files are modified |

### Directory Structure

```
github-issue-sethshoultes-shipyard-ai-98/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # Build + deploy + Proof (verification step)
├── scripts/
│   └── proof.js                    # Verification engine: origin check, retry, output formatting
├── domains.json                    # Domain list + expected Cloudflare origins
└── decisions.md                    # Already exists (debate decisions)
```

---

## 5. Technical Details

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

### Proof Script Behavior

1. Read `domains.json` to get list of domains to verify
2. For each domain (in parallel):
   - Perform HTTPS GET to `https://{domain}/`
   - Resolve DNS and validate CNAME/A record matches `expected_origin`
   - Retry with exponential backoff (max 60s total)
3. On success: print `Verified {domain} at {timestamp}`
4. On failure: print plain-English error (e.g., "Your DNS points to the wrong place.")
5. Exit 0 if all domains verified, exit 1 if any failed

### Workflow Structure

```yaml
name: Deploy Website
on:
  push:
    paths:
      - 'website/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci
        working-directory: website

      - name: Build
        run: npm run build
        working-directory: website

      - name: Deploy to Cloudflare Pages
        run: wrangler pages deploy website/out/ --project-name=shipyard-ai
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Verify deployment (Proof)
        run: node scripts/proof.js
```

---

## 6. Quality Gates

Before marking complete, verify:
- [ ] All 3 files created at correct paths
- [ ] Workflow triggers on `website/**` push
- [ ] Workflow contains `npm ci`, `npm run build`, `wrangler pages deploy`
- [ ] Workflow references `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- [ ] Proof script validates origin (not just status 200)
- [ ] Proof script has retry logic with 60s max
- [ ] Proof script outputs plain English (no stack traces)
- [ ] `domains.json` has valid schema with `domain` and `expected_origin`
- [ ] No TODO/FIXME/HACK/XXX/placeholder comments
- [ ] No subdirectories beyond `.github/workflows/` and `scripts/`
