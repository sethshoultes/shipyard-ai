# Wardrobe Deployment Runbook

**Project:** Wardrobe Theme Marketplace
**Version:** 1.0.0
**Last Updated:** April 11, 2026
**Audience:** Engineering, DevOps, Platform Team

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Requirements

- [ ] Node.js 22.x installed
- [ ] Cloudflare account with Workers and R2 enabled
- [ ] `wrangler` CLI installed: `npm install -g wrangler`
- [ ] GitHub repository access with secrets configuration
- [ ] Access to Cloudflare dashboard (https://dash.cloudflare.com)
- [ ] Access to create/manage KV namespaces
- [ ] Approximately 30 minutes for full deployment

### Credentials and Configuration

- [ ] Cloudflare Account ID (32-character hex)
- [ ] Cloudflare API Token (with Workers and R2 permissions)
- [ ] R2 API Token (access key + secret key)
- [ ] Email for AWS SES or equivalent (for future email sending)

### Code Status

- [ ] All code committed and tested locally
- [ ] CI/CD pipeline passing: `npm run build` succeeds
- [ ] Theme tarballs built: `npm run build:tarballs` complete
- [ ] All tarball SHA256 hashes verified
- [ ] Showcase static assets optimized (CSS, JS minified)

---

## Infrastructure Setup

### Step 1: Create Cloudflare KV Namespaces

**Purpose:** KV namespaces store email subscriptions, telemetry data, and rate limit counters.

```bash
# Authenticate with Cloudflare
wrangler login

# Create Email Capture KV namespaces
wrangler kv:namespace create "wardrobe-emails"
wrangler kv:namespace create "wardrobe-emails-preview"
wrangler kv:namespace create "wardrobe-rate-limits"
wrangler kv:namespace create "wardrobe-rate-limits-preview"

# Create Analytics KV namespaces
wrangler kv:namespace create "wardrobe-analytics"
wrangler kv:namespace create "wardrobe-analytics-preview"
wrangler kv:namespace create "wardrobe-analytics-staging"
```

**Expected Output:**
```
✓ Created namespace with ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "EMAILS"
id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
preview_id = "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a"
```

### Step 2: Update Email Capture Worker Configuration

**File:** `/wardrobe/workers/email-capture/wrangler.toml`

Replace placeholder namespace IDs:

```toml
name = "wardrobe-email-capture"
main = "src/index.ts"
compatibility_date = "2026-04-01"

[vars]
CORS_ORIGIN = "https://wardrobe.emdash.dev"

[[kv_namespaces]]
binding = "EMAILS"
id = "YOUR_EMAILS_KV_ID"
preview_id = "YOUR_EMAILS_PREVIEW_ID"

[[kv_namespaces]]
binding = "RATE_LIMITS"
id = "YOUR_RATE_LIMITS_KV_ID"
preview_id = "YOUR_RATE_LIMITS_PREVIEW_ID"

[env.production]
name = "wardrobe-email-capture-production"
route = "wardrobe-email-capture.emdash.dev/*"
zone_id = "YOUR_ZONE_ID"

[[env.production.kv_namespaces]]
binding = "EMAILS"
id = "YOUR_EMAILS_KV_ID"

[[env.production.kv_namespaces]]
binding = "RATE_LIMITS"
id = "YOUR_RATE_LIMITS_KV_ID"
```

### Step 3: Update Analytics Worker Configuration

**File:** `/wardrobe/workers/analytics/wrangler.toml`

Replace placeholder namespace IDs:

```toml
name = "wardrobe-analytics"
main = "src/index.ts"
compatibility_date = "2026-04-01"

[[kv_namespaces]]
binding = "ANALYTICS"
id = "YOUR_ANALYTICS_KV_ID"
preview_id = "YOUR_ANALYTICS_PREVIEW_ID"

[vars]
CORS_ORIGIN = "https://emdash.dev"

[env.production]
name = "wardrobe-analytics"
[[env.production.kv_namespaces]]
binding = "ANALYTICS"
id = "YOUR_ANALYTICS_KV_ID"

[env.staging]
name = "wardrobe-analytics-staging"
[[env.staging.kv_namespaces]]
binding = "ANALYTICS"
id = "YOUR_ANALYTICS_STAGING_KV_ID"
```

### Step 4: Set Worker Secrets

```bash
# Set API key for analytics endpoint authentication
wrangler secret put API_KEY --path workers/analytics

# Enter a strong random secret when prompted (e.g., 32-char hex)
# Example: a7f3e2c8d1b9f4a6e8c3d2f1b9a7e5c3
```

### Step 5: Configure Cloudflare R2

```bash
# Create R2 bucket
wrangler r2 bucket create emdash-themes

# Enable public access (via Cloudflare dashboard)
# 1. Go to https://dash.cloudflare.com/account/storage/r2
# 2. Select bucket "emdash-themes"
# 3. Go to Settings > Public access
# 4. Enable "Allow public access"
# 5. Note the public URL: https://pub-{ACCOUNT_ID}.r2.dev
```

**R2 Environment Variables:**

Create `.env` file (or set in CI/CD secrets):

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=emdash-themes
```

### Step 6: Build and Upload Theme Tarballs

```bash
cd /wardrobe

# Build tarballs
npm run build:tarballs

# Upload to R2
npm run upload:themes

# Output should show:
# ✓ Uploaded ember@1.0.0.tar.gz (6.27 KB)
# ✓ Uploaded forge@1.0.0.tar.gz (5.08 KB)
# ✓ Uploaded slate@1.0.0.tar.gz (5.18 KB)
# ✓ Uploaded drift@1.0.0.tar.gz (5.32 KB)
# ✓ Uploaded bloom@1.0.0.tar.gz (5.45 KB)
```

### Step 7: Update Registry with R2 URLs

**File:** `/wardrobe/registry/themes.json`

Update `tarballUrl` and `previewUrl` for each theme:

```json
{
  "cdnBaseUrl": "https://pub-{ACCOUNT_ID}.r2.dev/themes",
  "themes": [
    {
      "name": "ember",
      "description": "Bold. Editorial. For people with something to say.",
      "personality": "Magazine-style, serif headings, dark navy + burnt orange",
      "version": "1.0.0",
      "tarballUrl": "https://pub-{ACCOUNT_ID}.r2.dev/ember@1.0.0.tar.gz",
      "sha256": "c1d24f686f79fb29a11c1312d3c70cf121410e54ef7465c8ccedd98a06bf2d49",
      "previewUrl": "https://wardrobe.emdash.dev#ember"
    }
    // ... repeat for forge, slate, drift, bloom
  ]
}
```

**Replace `{ACCOUNT_ID}` with your actual Cloudflare Account ID.**

---

## Step-by-Step Deployment

### Phase 1: Deploy Email Capture Worker

```bash
cd /wardrobe/workers/email-capture

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to production
wrangler deploy --env production

# Expected output:
# Uploaded wardrobe-email-capture (1.2 MB)
# ✓ Deployment complete!
# ✓ Deployed URL: https://wardrobe-email-capture.emdash.dev
```

### Phase 2: Deploy Analytics Worker

```bash
cd /wardrobe/workers/analytics

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to production
wrangler deploy --env production

# Also deploy staging for testing
wrangler deploy --env staging

# Expected output:
# Uploaded wardrobe-analytics (1.3 MB)
# ✓ Deployment complete!
# ✓ Deployed URL: https://wardrobe-analytics.emdash.dev
```

### Phase 3: Update Showcase with Real URLs

**File:** `/wardrobe/showcase/index.html`

Update form action and endpoint references:

```html
<!-- Update email form -->
<form id="email-form" class="email-form" action="https://wardrobe-email-capture.emdash.dev/subscribe" method="POST">
  <input type="email" name="email" placeholder="you@example.com" required>
  <button type="submit">Get Updates</button>
</form>

<!-- Update scripts if any reference analytics -->
<script>
  const ANALYTICS_ENDPOINT = 'https://wardrobe-analytics.emdash.dev/track';
</script>
```

### Phase 4: Update CLI with Real Endpoints

**File:** `/wardrobe/cli/commands/install.ts` (line 20)

```typescript
const ANALYTICS_URL = 'https://wardrobe-analytics.emdash.dev/track';
```

### Phase 5: Deploy Showcase to Cloudflare Pages

```bash
cd /wardrobe/showcase

# Install dependencies (if not already done)
npm install

# Test locally
python -m http.server 8000
# Visit http://localhost:8000 and verify:
# - Forms render correctly
# - No broken links
# - Screenshots load
# - Copy buttons work

# Deploy to Cloudflare Pages
wrangler pages deploy . --project-name wardrobe-showcase --production

# Expected output:
# ✓ Deployment successful!
# ✓ URL: https://wardrobe-showcase.pages.dev
```

### Phase 6: Configure Custom Domain (Optional)

```bash
# In Cloudflare dashboard:
# 1. Go to Pages > wardrobe-showcase
# 2. Click Custom domains
# 3. Add "wardrobe.emdash.dev" (requires DNS CNAME setup)
# 4. Verify domain after DNS propagates
```

---

## Post-Deployment Verification

### Test 1: Verify All Workers Are Live

```bash
# Test Email Capture Worker
curl -X OPTIONS https://wardrobe-email-capture.emdash.dev/subscribe \
  -H "Origin: https://wardrobe.emdash.dev"

# Expected: 200 OK with CORS headers

# Test Analytics Worker
curl https://wardrobe-analytics.emdash.dev/health

# Expected: 200 OK or 401 (if auth required)
```

### Test 2: Verify Theme Downloads

```bash
# Test each theme tarball
for theme in ember forge slate drift bloom; do
  echo "Testing $theme..."
  curl -I "https://pub-{ACCOUNT_ID}.r2.dev/${theme}@1.0.0.tar.gz"
done

# Expected: All return 200 OK with Content-Length header
```

### Test 3: Verify Showcase Website

```bash
# Check showcase loads
curl -I https://wardrobe.emdash.dev

# Expected: 200 OK with HTML content

# Verify no broken assets
curl -I https://wardrobe.emdash.dev/styles.css
curl -I https://wardrobe.emdash.dev/script.js
curl -I https://wardrobe.emdash.dev/screenshots/ember.png

# Expected: All return 200 OK
```

### Test 4: End-to-End CLI Install Test

```bash
# Create test site
npm create emdash@latest -- --template blank

cd my-emdash-site

# Test wardrobe list
npx wardrobe list
# Expected: Lists all 5 themes with descriptions

# Test wardrobe preview (opens browser)
npx wardrobe preview ember

# Test wardrobe install
npm run dev &
npx wardrobe install forge

# Expected:
# - Backup created (src.backup/)
# - Theme installed in <3 seconds
# - Success message printed
# - Browser opens to http://localhost:4321
# - Theme applied to site
```

### Test 5: Email Capture Flow

```bash
# Test email submission via form
curl -X POST https://wardrobe-email-capture.emdash.dev/subscribe \
  -H "Content-Type: application/json" \
  -H "Origin: https://wardrobe.emdash.dev" \
  -d '{"email": "test@example.com", "source": "showcase"}'

# Expected: 200 OK with JSON response

# Verify email stored in KV
wrangler kv:key list wardrobe-emails

# Expected: Key with email address appears
```

### Test 6: Analytics Telemetry

```bash
# Test analytics endpoint
curl -X POST https://wardrobe-analytics.emdash.dev/track \
  -H "Content-Type: application/json" \
  -d '{"theme": "ember", "os": "darwin", "timestamp": 1234567890, "cliVersion": "1.0.0"}'

# Expected: 200 OK with JSON response

# Get stats (requires API key)
curl https://wardrobe-analytics.emdash.dev/stats \
  -H "X-API-Key: YOUR_API_KEY"

# Expected: JSON with aggregated metrics
```

### Test 7: Load Testing (Optional)

```bash
# Use Apache Bench or similar
ab -n 1000 -c 10 https://wardrobe.emdash.dev/

# Expected:
# - ~1000 requests completed
# - Response time <100ms average
# - No errors

# Test worker concurrency
ab -n 100 -c 50 https://wardrobe-analytics.emdash.dev/track

# Expected: All requests succeed
```

---

## Rollback Procedures

### Rollback Showcase Website

```bash
# If showcase has broken, rollback to previous version
wrangler pages rollback --project-name wardrobe-showcase

# Or redeploy specific commit
git checkout previous-commit-hash
wrangler pages deploy . --project-name wardrobe-showcase --production
```

### Rollback Email Capture Worker

```bash
cd /wardrobe/workers/email-capture

# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rollback due to issue"
```

### Rollback Analytics Worker

```bash
cd /wardrobe/workers/analytics

# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production --message "Rollback due to issue"
```

### Data Preservation

**Important:** Rolling back Workers does NOT delete data in KV storage.

- Email submissions in KV will persist even if Worker is rolled back
- Analytics data will persist
- No data loss on rollback

If you need to clear KV data:

```bash
# WARNING: This deletes all data
wrangler kv:key delete --all wardrobe-emails
wrangler kv:key delete --all wardrobe-analytics

# To selectively delete:
wrangler kv:key delete <key-name> --namespace-id <id>
```

---

## Troubleshooting

### Issue: "Namespace not found" during Worker deployment

**Cause:** KV namespace ID in `wrangler.toml` is incorrect or namespace doesn't exist

**Solution:**
```bash
# List all KV namespaces
wrangler kv:namespace list

# If missing, recreate:
wrangler kv:namespace create "wardrobe-emails"

# Update wrangler.toml with correct ID
```

### Issue: Email form submission returns 404

**Cause:** Email Worker not deployed or CORS misconfigured

**Solution:**
```bash
# Verify Worker is deployed
wrangler deployments list --path workers/email-capture

# Check CORS headers
curl -v -X OPTIONS https://wardrobe-email-capture.emdash.dev/subscribe \
  -H "Origin: https://wardrobe.emdash.dev"

# Should include:
# Access-Control-Allow-Origin: https://wardrobe.emdash.dev
```

### Issue: Theme tarball downloads fail (404)

**Cause:** R2 bucket not configured, tarball not uploaded, or URL incorrect

**Solution:**
```bash
# Verify tarball exists in R2
aws s3 ls s3://emdash-themes/ --endpoint-url https://r2.cloudflarestorage.com

# Re-upload tarballs
npm run upload:themes

# Verify URL works
curl -I "https://pub-{ACCOUNT_ID}.r2.dev/ember@1.0.0.tar.gz"
```

### Issue: Install command fails with "Invalid theme tarball"

**Cause:** Theme tarball corrupted or missing `src/` directory

**Solution:**
```bash
# Verify tarball locally
tar -tzf dist/themes/ember@1.0.0.tar.gz | head

# Should show: src/pages/index.astro, src/live.config.ts, etc.

# If missing, rebuild:
npm run build:tarballs
npm run upload:themes
```

### Issue: Analytics not recording installs

**Cause:** Analytics Worker not deployed, endpoint URL wrong, or telemetry disabled

**Solution:**
```bash
# Verify Worker endpoint
curl https://wardrobe-analytics.emdash.dev/stats \
  -H "X-API-Key: YOUR_API_KEY"

# Check if telemetry disabled in CLI
echo $WARDROBE_TELEMETRY_DISABLED  # Should be unset

# Test telemetry manually
curl -X POST https://wardrobe-analytics.emdash.dev/track \
  -H "Content-Type: application/json" \
  -d '{"theme": "ember", "os": "darwin", "timestamp": 1234567890, "cliVersion": "1.0.0"}'
```

### Issue: Browser doesn't open after install

**Cause:** `open` package not installed or dev server not running

**Solution:**
```bash
# Ensure npm dev server is running
npm run dev

# Install `open` package
npm install open

# Rebuild and test
npm run build
npx wardrobe install forge
```

### Issue: Showcase CSS/JS not loading

**Cause:** Assets not deployed to Cloudflare Pages or path issues

**Solution:**
```bash
# Verify assets in build output
ls -la showcase/

# Check CSS and JS file sizes
wc -l showcase/styles.css showcase/script.js

# Re-deploy showcase
wrangler pages deploy showcase/ --project-name wardrobe-showcase --production

# Test asset URLs
curl -I https://wardrobe.emdash.dev/styles.css
curl -I https://wardrobe.emdash.dev/script.js
```

---

## Monitoring and Observability

### Set Up Monitoring

```bash
# Enable Cloudflare Analytics for Workers
# In Cloudflare Dashboard:
# 1. Workers > wardrobe-analytics
# 2. Analytics > Enable Analytics
# 3. View metrics in real-time

# Set up alerts
# 1. Workers > wardrobe-analytics
# 2. Settings > Alerting
# 3. Create alert for:
#    - Error rate > 5%
#    - Request latency > 1s
#    - CPU time > 10ms
```

### Monitor KV Namespace Usage

```bash
# Check KV storage usage
wrangler kv:namespace describe wardrobe-emails

# Expected output:
# {
#   "id": "...",
#   "title": "wardrobe-emails",
#   "supports": ["read", "write", "delete", "list"],
#   "billing_read_requests": 0,
#   "billing_write_requests": 5000
# }
```

### View Logs

```bash
# Real-time logs from Workers
wrangler tail workers/email-capture

# Logs will stream as requests come in:
# 2026-04-11T10:30:45.123Z  log  [email-capture] POST /subscribe
# 2026-04-11T10:30:45.456Z  log  [email-capture] Email validated: user@example.com
```

---

## Post-Deployment Checklist

- [ ] All KV namespaces created and IDs updated in `wrangler.toml`
- [ ] Email Capture Worker deployed to production
- [ ] Analytics Worker deployed to production and staging
- [ ] Theme tarballs uploaded to R2 and URLs verified
- [ ] Showcase website deployed to Cloudflare Pages
- [ ] CLI updated with real endpoint URLs
- [ ] All post-deployment tests passing
- [ ] Email form submission working end-to-end
- [ ] Theme install command working end-to-end
- [ ] Telemetry recording analytics events
- [ ] Screenshots loading in showcase
- [ ] Browser opens after install
- [ ] Monitoring and alerts configured
- [ ] Team trained on troubleshooting procedures
- [ ] Runbook documented and shared
- [ ] Rollback procedures tested
- [ ] Ready for board re-review

---

## Support Contact

For deployment issues, contact:
- **Engineering Lead:** [Name]
- **DevOps/Platform:** [Name]
- **Product Manager:** [Name]

---

**Last Updated:** April 11, 2026
**Next Review:** April 18, 2026
