# Wardrobe Deployment Runbook

**Product:** Theme marketplace for Emdash CMS
**Date:** April 11, 2026
**Status:** Ready for Infrastructure Deployment

---

## Overview

This runbook documents the step-by-step process to deploy Wardrobe's infrastructure on Cloudflare. All code is complete; this document guides the operator through provisioning and deployment.

---

## Prerequisites

- Cloudflare account with Workers, R2, KV, and Pages enabled
- `wrangler` CLI installed (`npm install -g wrangler`)
- Logged into Cloudflare: `wrangler login`
- Environment variables ready (see `.env.example`)

---

## Phase 1: Infrastructure Foundation

### Task 1: Upload Theme Tarballs to R2

**Goal:** Make theme tarballs downloadable via CDN for CLI installs.

```bash
# 1. Create the R2 bucket
wrangler r2 bucket create emdash-themes

# 2. Enable public access (via Cloudflare dashboard)
# Navigate to: R2 > emdash-themes > Settings > Public access > Enable

# 3. Note the public URL: https://pub-xxxxx.r2.dev or configure custom domain

# 4. Set environment variables
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export R2_ACCESS_KEY_ID="your-access-key"
export R2_SECRET_ACCESS_KEY="your-secret-key"
export R2_BUCKET_NAME="emdash-themes"

# 5. Upload tarballs
cd /path/to/wardrobe
npm run upload:themes

# 6. Verify upload
curl -I https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz
# Should return HTTP 200
```

**Verification Checklist:**
- [ ] R2 bucket created
- [ ] Public access enabled
- [ ] All 5 tarballs uploaded (ember, forge, slate, drift, bloom)
- [ ] Each tarball returns HTTP 200 on GET

---

### Task 3: Deploy Email Capture Worker

**Goal:** Enable email signups from the showcase website.

```bash
cd workers/email-capture

# 1. Create KV namespaces
wrangler kv:namespace create EMAILS
# Output: { binding = "EMAILS", id = "xxxxx" }

wrangler kv:namespace create RATE_LIMITS
# Output: { binding = "RATE_LIMITS", id = "xxxxx" }

# 2. Update wrangler.toml with the namespace IDs
# Replace placeholder IDs with actual IDs from step 1

# 3. Set environment variables
wrangler secret put CORS_ORIGIN
# Enter: https://wardrobe.emdash.dev

# 4. Deploy
wrangler deploy

# 5. Note the deployed URL (e.g., wardrobe-email-capture.emdash.workers.dev)

# 6. Update showcase/script.js with real endpoint URL if different
```

**Verification Checklist:**
- [ ] KV namespaces created (EMAILS, RATE_LIMITS)
- [ ] wrangler.toml updated with namespace IDs
- [ ] Worker deployed
- [ ] CORS_ORIGIN secret set
- [ ] Test: `curl -X POST https://wardrobe-email-capture.emdash.workers.dev/subscribe -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`

---

### Task 4: Deploy Analytics Worker

**Goal:** Track anonymous theme installation metrics.

```bash
cd workers/analytics

# 1. Create KV namespace
wrangler kv:namespace create ANALYTICS
# Output: { binding = "ANALYTICS", id = "xxxxx" }

# 2. Update wrangler.toml with the namespace ID

# 3. Generate and set API key for stats endpoint
openssl rand -hex 32
# Copy output

wrangler secret put API_KEY
# Paste the generated key

# 4. Deploy
wrangler deploy

# 5. Verify
curl https://wardrobe-analytics.emdash.workers.dev/health
# Should return: {"status":"ok"}

# 6. Test track endpoint
curl -X POST https://wardrobe-analytics.emdash.workers.dev/track \
  -H "Content-Type: application/json" \
  -d '{"theme":"ember","os":"darwin","timestamp":1712844000000,"cliVersion":"1.0.0"}'
# Should return: {"success":true}
```

**Verification Checklist:**
- [ ] KV namespace created (ANALYTICS)
- [ ] wrangler.toml updated
- [ ] API_KEY secret set
- [ ] Worker deployed
- [ ] Health endpoint returns 200
- [ ] Track endpoint accepts events

---

## Phase 2: Demo Sites & Showcase

### Task 5: Deploy Live Demo Sites

**Goal:** Deploy 5 live demo sites, one per theme.

For each theme (ember, forge, slate, drift, bloom):

```bash
# 1. Create new Emdash site
npm create emdash@latest -- --template @emdash-cms/template-blog-cloudflare
# Name: wardrobe-demo-{theme}

cd wardrobe-demo-{theme}

# 2. Copy theme src/ over starter
cp -r /path/to/wardrobe/themes/{theme}/src/* ./src/

# 3. Create D1 database
wrangler d1 create wardrobe-demo-{theme}
# Note the database_id

# 4. Create R2 bucket
wrangler r2 bucket create wardrobe-demo-{theme}-media

# 5. Update wrangler.jsonc with database_id and bucket name

# 6. Run migrations
wrangler d1 migrations apply wardrobe-demo-{theme}

# 7. Seed demo content (uses Emdash seed command)
npx emdash seed

# 8. Set auth secret
npx emdash auth secret
wrangler secret put EMDASH_AUTH_SECRET

# 9. Deploy
wrangler deploy

# 10. Configure custom domain: {theme}.wardrobe.emdash.dev
# In Cloudflare dashboard: Workers & Pages > wardrobe-demo-{theme} > Custom Domains
```

**Demo Sites to Deploy:**
| Theme | Domain | D1 Database | R2 Bucket |
|-------|--------|-------------|-----------|
| ember | ember.wardrobe.emdash.dev | wardrobe-demo-ember | wardrobe-demo-ember-media |
| forge | forge.wardrobe.emdash.dev | wardrobe-demo-forge | wardrobe-demo-forge-media |
| slate | slate.wardrobe.emdash.dev | wardrobe-demo-slate | wardrobe-demo-slate-media |
| drift | drift.wardrobe.emdash.dev | wardrobe-demo-drift | wardrobe-demo-drift-media |
| bloom | bloom.wardrobe.emdash.dev | wardrobe-demo-bloom | wardrobe-demo-bloom-media |

---

### Task 6: Generate Real Screenshots

**Goal:** Replace SVG placeholders with real PNG screenshots from live demo sites.

```bash
cd /path/to/wardrobe

# 1. Install Playwright browsers
npx playwright install chromium

# 2. Update scripts/generate-screenshots.ts with live demo URLs if needed

# 3. Run screenshot generation
npm run screenshots

# 4. Verify output
ls -la showcase/screenshots/*.png
# Should see 5 PNG files

# 5. Check file sizes (should be < 200KB each)
du -h showcase/screenshots/*.png

# 6. Remove old SVG files
rm showcase/screenshots/*.svg
```

**Verification Checklist:**
- [ ] All 5 PNG screenshots generated
- [ ] Each file < 200KB
- [ ] Screenshots capture theme personality
- [ ] SVG placeholders removed

---

### Task 7: Deploy Showcase Website

**Goal:** Deploy the marketing showcase to Cloudflare Pages.

```bash
cd /path/to/wardrobe/showcase

# 1. Verify email endpoint URL in script.js
grep "apiEndpoint" script.js
# Should show correct worker URL

# 2. Verify screenshots use .png (not .svg)
grep -E "\.svg|\.png" index.html

# 3. Create Pages project
wrangler pages project create wardrobe-showcase

# 4. Deploy
wrangler pages deploy . --project-name wardrobe-showcase

# 5. Note the deployment URL (wardrobe-showcase.pages.dev)

# 6. Configure custom domain
# In Cloudflare dashboard: Pages > wardrobe-showcase > Custom domains
# Add: wardrobe.emdash.dev

# 7. Verify HTTPS
curl -I https://wardrobe.emdash.dev
# Should return HTTP 200
```

**Verification Checklist:**
- [ ] Pages project created
- [ ] Showcase deployed
- [ ] Custom domain configured
- [ ] HTTPS working
- [ ] All 5 theme cards visible
- [ ] Copy buttons functional
- [ ] Email form submits successfully
- [ ] Mobile responsive (test at 375px width)

---

## Phase 3: Validation

### Task 8: Benchmark Install Speed

**Goal:** Verify sub-3-second install target.

```bash
# 1. Create test project
npm create emdash@latest -- --template @emdash-cms/template-blog
cd test-benchmark

# 2. Time installs
for theme in ember forge slate drift bloom; do
  echo "Testing $theme..."
  time npx wardrobe install $theme 2>&1 | tail -5
  echo "---"
done

# 3. Record results
# All themes should complete in < 3 seconds on broadband
# < 5 seconds on simulated 4G
```

---

### Task 9: QA Verification

Run through all Tier 1 board conditions:

| # | Condition | Test | Expected |
|---|-----------|------|----------|
| 1 | Live demo sites | Visit each URL | All 5 render with content |
| 2 | Real screenshots | Check showcase | PNG images, not SVG |
| 3 | Post-install reveal | Run `npx wardrobe install ember` | Shows dev server hint |
| 4 | Email capture | Submit form on showcase | Success message |
| 5 | Analytics telemetry | Check KV after install | Event recorded |

---

## Environment Variables Reference

### R2 Upload Script
```
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=emdash-themes
R2_PUBLIC_URL=https://cdn.emdash.dev/themes
```

### Email Capture Worker
```
CORS_ORIGIN=https://wardrobe.emdash.dev
```

### Analytics Worker
```
API_KEY=(generated 32-byte hex)
CORS_ORIGIN=https://wardrobe.emdash.dev
```

### Each Demo Site
```
EMDASH_AUTH_SECRET=(generated via `npx emdash auth secret`)
```

---

## Rollback Procedures

### Worker Rollback
```bash
wrangler deployments list
wrangler deployments rollback [deployment-id]
```

### Pages Rollback
```bash
wrangler pages deployments list --project-name wardrobe-showcase
wrangler pages deployments rollback [deployment-id] --project-name wardrobe-showcase
```

### R2 (Theme Tarballs)
Re-upload previous version tarballs and update themes.json.

---

## Monitoring

### Analytics Worker Stats
```bash
curl -H "X-API-Key: YOUR_API_KEY" https://wardrobe-analytics.emdash.workers.dev/stats
```

### Email Subscriber Count
```bash
wrangler kv:key list --namespace-id=EMAILS_NAMESPACE_ID | jq 'length'
```

---

## Support Contacts

- **Infrastructure:** Elon Musk (Product & Engineering Director)
- **Design/Branding:** Steve Jobs (Design & Brand Director)
- **QA:** Margaret Hamilton (Quality Assurance)

---

*Generated by Great Minds Agency — Shipyard AI*
