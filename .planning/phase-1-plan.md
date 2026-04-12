# Phase 1 Plan — Wardrobe Theme Marketplace Deployment

**Generated**: April 12, 2026
**Project Slug**: emdash-marketplace
**Product Name**: Wardrobe
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 13
**Waves**: 4
**Status**: READY FOR DEPLOYMENT
**Estimated Time**: 2.5-3 hours (sequential), 1.5 hours (parallelized)

---

## The Essence

> **What it's really about:** One command transforms your site into something beautiful.

> **What it evokes:** "That's me."

> **What must be perfect:** The reveal. The instant your site becomes dignified.

> **Creative direction:** Instant dignity.

---

## Build Status

**Technical MVP:** 100% COMPLETE (code is done)
**Deployment:** 0% (infrastructure blockers)
**Board Verdict:** PROCEED (Conditional) — 9 P0 blockers must be resolved

### Locked Decisions

| Decision | Winner | Rationale |
|----------|--------|-----------|
| Product Name: **Wardrobe** | Steve Jobs | `npx wardrobe install ember` is tweetable |
| Theme Count: **5** | Steve Jobs | Five feels like a collection, not a test |
| Preview: **Screenshots** | Elon Musk | Ships in one session; live preview is V2 |
| Architecture: **CLI-First** | Elon Musk | The CLI IS the product |
| Infrastructure: **Static** | Elon Musk | R2 + CDN scales infinitely with zero ops |
| Install Speed: **Sub-3-Second** | Both | Transformation must feel instant |

### P0 Blockers (Must Resolve in This Plan)

| # | Blocker | Status |
|---|---------|--------|
| 1 | KV namespace IDs are placeholders | NOT DONE |
| 2 | R2 bucket not created | NOT DONE |
| 3 | Theme tarballs not uploaded | NOT DONE |
| 4 | Workers not deployed | NOT DONE |
| 5 | Showcase not deployed | NOT DONE |
| 6 | Demo sites not deployed | NOT DONE |
| 7 | Screenshots are SVG placeholders | NOT DONE |
| 8 | R2 upload script has bug | NOT DONE |
| 9 | Uncommitted files | NOT DONE |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| P0-001, P0-002, P0-003: KV namespaces | phase-1-task-1 | 1 |
| P0-004: R2 bucket | phase-1-task-2 | 1 |
| RISK-001: R2 upload script fix | phase-1-task-3 | 1 |
| P0-005: Upload tarballs | phase-1-task-4 | 2 |
| P0-006, T1-005: Analytics worker | phase-1-task-5 | 2 |
| P0-007, T1-004: Email worker | phase-1-task-6 | 2 |
| T1-001: Demo sites (ember) | phase-1-task-7 | 3 |
| T1-001: Demo sites (forge, slate) | phase-1-task-8 | 3 |
| T1-001: Demo sites (drift, bloom) | phase-1-task-9 | 3 |
| T1-002: Screenshots | phase-1-task-10 | 4 |
| P0-008: Showcase deploy | phase-1-task-11 | 4 |
| P0-009: Git commit | phase-1-task-12 | 4 |
| QA Pass 2 | phase-1-task-13 | 4 |

---

## Documentation References

This plan cites specific sections from source documents:

- **decisions.md**: P0 Launch Blockers (lines 334-361), Board Conditions (lines 366-395)
- **docs/EMDASH-GUIDE.md Section 5**: Cloudflare deployment (wrangler.jsonc, D1, R2)
- **docs/EMDASH-GUIDE.md Section 7**: Theme structure, seed files
- **docs/DEPLOYMENT-RUNBOOK.md**: Step-by-step infrastructure guide
- **qa-pass-1.md**: 9 P0 blockers, verification evidence

---

## Wave Execution Order

### Wave 1 (Parallel) — Infrastructure Foundation

Three independent tasks provisioning Cloudflare resources. **Estimated time: 10 minutes**

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create KV namespaces for workers</title>
  <requirement>P0-001, P0-002, P0-003: Create KV namespaces (ANALYTICS, EMAILS, RATE_LIMITS)</requirement>
  <description>
    Per qa-pass-1.md P0 blockers #1-2:
    Create three KV namespaces required by analytics and email-capture workers.
    Update wrangler.toml files with real namespace IDs.

    Current placeholder IDs (workers/analytics/wrangler.toml lines 8-9):
    - id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" (PLACEHOLDER)
    - preview_id = "p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1" (PLACEHOLDER)

    Current placeholder IDs (workers/email-capture/wrangler.toml lines 14-20):
    - EMAILS id = "e1m2a3i4l5s6k7v8n9a0m1e2s3p4a5c6" (PLACEHOLDER)
    - RATE_LIMITS id = "r1a2t3e4l5i6m7i8t9s0k1v2n3a4m5e6" (PLACEHOLDER)
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/wrangler.toml" reason="Contains placeholder ANALYTICS KV ID" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/wrangler.toml" reason="Contains placeholder EMAILS and RATE_LIMITS IDs" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/qa-pass-1.md" reason="Documents P0 blockers 1-2" />
  </context>

  <steps>
    <step order="1">Run: wrangler kv:namespace create ANALYTICS</step>
    <step order="2">Copy the returned namespace ID</step>
    <step order="3">Run: wrangler kv:namespace create ANALYTICS --preview (for preview_id)</step>
    <step order="4">Update workers/analytics/wrangler.toml lines 8-9 with real IDs</step>
    <step order="5">Update workers/analytics/wrangler.toml line 20 (env.production) with real ID</step>
    <step order="6">Run: wrangler kv:namespace create EMAILS</step>
    <step order="7">Run: wrangler kv:namespace create EMAILS --preview</step>
    <step order="8">Run: wrangler kv:namespace create RATE_LIMITS</step>
    <step order="9">Run: wrangler kv:namespace create RATE_LIMITS --preview</step>
    <step order="10">Update workers/email-capture/wrangler.toml lines 14-20 with real IDs</step>
  </steps>

  <verification>
    <check type="bash">grep -v "a1b2c3d4\|e1m2a3i4\|r1a2t3e4" /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/wrangler.toml</check>
    <check type="bash">grep -v "PLACEHOLDER\|placeholder" /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/wrangler.toml</check>
    <check type="manual">All 6 KV namespace IDs are valid 32-character hex strings</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>chore(wardrobe): configure KV namespace IDs

Replace placeholder KV namespace IDs with real IDs from wrangler:
- ANALYTICS namespace for install telemetry
- EMAILS namespace for email capture
- RATE_LIMITS namespace for request throttling

Resolves P0 blockers #1-2 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create R2 bucket for theme distribution</title>
  <requirement>P0-004: Create R2 bucket for theme tarballs</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #4 and DEPLOYMENT-RUNBOOK.md Task 1:
    Create the R2 bucket that will host theme tarballs for CLI downloads.
    Enable public access for CDN distribution.

    Target bucket: emdash-themes
    Expected URL format: https://pub-{id}.r2.dev/{theme}@1.0.0.tar.gz
    Or custom domain: https://cdn.emdash.dev/themes/{theme}@1.0.0.tar.gz
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 1: R2 bucket creation steps" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Open Question #1: R2 bucket name confirmation" />
  </context>

  <steps>
    <step order="1">Run: wrangler r2 bucket create emdash-themes</step>
    <step order="2">Navigate to Cloudflare dashboard > R2 > emdash-themes > Settings</step>
    <step order="3">Enable public access (Settings > Public access > Enable)</step>
    <step order="4">Note the public URL: https://pub-{bucketId}.r2.dev</step>
    <step order="5">Optionally configure custom domain (cdn.emdash.dev) for prettier URLs</step>
    <step order="6">Test access: curl -I https://pub-{bucketId}.r2.dev (should return 200 or 404)</step>
  </steps>

  <verification>
    <check type="bash">wrangler r2 bucket list | grep emdash-themes</check>
    <check type="manual">Public access enabled in Cloudflare dashboard</check>
    <check type="manual">Public URL accessible (even if empty bucket)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>chore(wardrobe): document R2 bucket creation

R2 bucket 'emdash-themes' created with public access enabled.
CLI will download theme tarballs from this bucket.

Resolves P0 blocker #4 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Fix R2 upload script endpoint bug</title>
  <requirement>RISK-001: R2 upload script uses incorrect endpoint (googleapis.com)</requirement>
  <description>
    Risk Scanner identified critical bug in scripts/upload-tarballs.ts line 33:

    Current (WRONG): endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.googleapis.com`
    Correct: endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`

    The script incorrectly uses googleapis.com instead of Cloudflare's R2 endpoint.
    This will cause all upload attempts to fail with 403 or connection refused.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/upload-tarballs.ts" reason="Contains bug on line 33" />
  </context>

  <steps>
    <step order="1">Open scripts/upload-tarballs.ts</step>
    <step order="2">Line 33: Change "r2.googleapis.com" to "r2.cloudflarestorage.com"</step>
    <step order="3">Save file</step>
    <step order="4">Verify fix: grep "r2.cloudflarestorage.com" scripts/upload-tarballs.ts</step>
  </steps>

  <verification>
    <check type="bash">grep "r2.cloudflarestorage.com" /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/upload-tarballs.ts</check>
    <check type="bash">grep -v "r2.googleapis.com" /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/upload-tarballs.ts | grep -q "endpoint"</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>fix(wardrobe): correct R2 endpoint URL in upload script

Change R2 endpoint from googleapis.com to cloudflarestorage.com.
The previous endpoint was incorrect and would cause upload failures.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Workers & Uploads

Three tasks deploying workers and uploading tarballs. **Estimated time: 15 minutes**

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Upload theme tarballs to R2</title>
  <requirement>P0-005: Upload 5 theme tarballs to R2 CDN</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #5 and DEPLOYMENT-RUNBOOK.md Task 1:
    Upload all 5 pre-built theme tarballs to the R2 bucket.

    Tarballs exist locally at:
    - dist/themes/ember@1.0.0.tar.gz (6.3 KB)
    - dist/themes/forge@1.0.0.tar.gz (5.1 KB)
    - dist/themes/slate@1.0.0.tar.gz (5.2 KB)
    - dist/themes/drift@1.0.0.tar.gz (5.4 KB)
    - dist/themes/bloom@1.0.0.tar.gz (5.5 KB)

    Requires: R2 bucket created (task-2), upload script fixed (task-3)
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/upload-tarballs.ts" reason="Upload script (must be fixed first)" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/.env.example" reason="Required environment variables" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 1 upload steps" />
  </context>

  <steps>
    <step order="1">Copy .env.example to .env</step>
    <step order="2">Set CLOUDFLARE_ACCOUNT_ID (from Cloudflare dashboard)</step>
    <step order="3">Generate R2 API token: Cloudflare dashboard > R2 > API Tokens > Create API Token</step>
    <step order="4">Set R2_ACCESS_KEY_ID (from API token)</step>
    <step order="5">Set R2_SECRET_ACCESS_KEY (from API token)</step>
    <step order="6">Set R2_BUCKET_NAME=emdash-themes</step>
    <step order="7">Verify tarballs exist: ls dist/themes/*.tar.gz</step>
    <step order="8">Run: npm run upload:themes</step>
    <step order="9">Verify each tarball accessible: curl -I https://pub-{id}.r2.dev/ember@1.0.0.tar.gz</step>
  </steps>

  <verification>
    <check type="bash">cd /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe && ls dist/themes/*.tar.gz | wc -l</check>
    <check type="manual">curl -I for each of 5 tarballs returns HTTP 200</check>
    <check type="manual">Script output shows "All tarballs uploaded successfully!"</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="R2 bucket must exist" />
    <depends-on task-id="phase-1-task-3" reason="Upload script bug must be fixed" />
  </dependencies>

  <commit-message>chore(wardrobe): upload theme tarballs to R2

5 theme tarballs uploaded to emdash-themes R2 bucket:
- ember@1.0.0.tar.gz
- forge@1.0.0.tar.gz
- slate@1.0.0.tar.gz
- drift@1.0.0.tar.gz
- bloom@1.0.0.tar.gz

CLI installs now functional.

Resolves P0 blocker #5 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Deploy analytics worker</title>
  <requirement>P0-006: Deploy analytics worker; T1-005: Anonymous install telemetry</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #6 and DEPLOYMENT-RUNBOOK.md Task 4:
    Deploy the analytics worker that tracks anonymous theme installs.

    Worker: workers/analytics/
    Endpoints: POST /track, GET /stats, GET /health
    Requires: KV namespace IDs configured (task-1)
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/src/index.ts" reason="Analytics worker implementation (389 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/wrangler.toml" reason="Worker configuration" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 4 deployment steps" />
  </context>

  <steps>
    <step order="1">cd workers/analytics</step>
    <step order="2">Verify wrangler.toml has real KV namespace IDs (from task-1)</step>
    <step order="3">Generate API key: openssl rand -hex 32</step>
    <step order="4">Set secret: wrangler secret put API_KEY (paste generated key)</step>
    <step order="5">Deploy: wrangler deploy</step>
    <step order="6">Note deployed URL: wardrobe-analytics.{subdomain}.workers.dev</step>
    <step order="7">Verify health: curl https://wardrobe-analytics.{subdomain}.workers.dev/health</step>
    <step order="8">Test track endpoint: curl -X POST -H "Content-Type: application/json" -d '{"theme":"ember","os":"darwin","timestamp":1712844000000,"cliVersion":"1.0.0"}' https://wardrobe-analytics.{subdomain}.workers.dev/track</step>
  </steps>

  <verification>
    <check type="bash">curl https://wardrobe-analytics.{subdomain}.workers.dev/health</check>
    <check type="manual">/health returns {"status":"ok"}</check>
    <check type="manual">/track accepts POST and returns {"success":true}</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="KV namespace IDs must be configured" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy analytics worker

Analytics worker deployed to Cloudflare Workers:
- POST /track: Record anonymous install events
- GET /stats: Aggregated statistics (API key protected)
- GET /health: Health check endpoint

Resolves P0 blocker #6 and T1-005 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Deploy email-capture worker</title>
  <requirement>P0-007: Deploy email-capture worker; T1-004: Wire email capture endpoint</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #7 and DEPLOYMENT-RUNBOOK.md Task 3:
    Deploy the email capture worker for showcase email signups.

    Worker: workers/email-capture/
    Endpoints: POST /subscribe
    Requires: KV namespace IDs configured (task-1)
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/src/index.ts" reason="Email capture implementation (305 lines)" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/wrangler.toml" reason="Worker configuration with CORS_ORIGIN" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 3 deployment steps" />
  </context>

  <steps>
    <step order="1">cd workers/email-capture</step>
    <step order="2">Verify wrangler.toml has real KV namespace IDs (from task-1)</step>
    <step order="3">Verify CORS_ORIGIN matches target showcase domain (wardrobe.emdash.dev)</step>
    <step order="4">Deploy: wrangler deploy</step>
    <step order="5">Note deployed URL: wardrobe-email-capture.{subdomain}.workers.dev</step>
    <step order="6">Test subscribe endpoint: curl -X POST -H "Content-Type: application/json" -H "Origin: https://wardrobe.emdash.dev" -d '{"email":"test@example.com"}' https://wardrobe-email-capture.{subdomain}.workers.dev/subscribe</step>
    <step order="7">Verify showcase script.js has correct endpoint URL (update if different)</step>
  </steps>

  <verification>
    <check type="bash">curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com"}' https://wardrobe-email-capture.{subdomain}.workers.dev/subscribe</check>
    <check type="manual">POST /subscribe returns success response</check>
    <check type="manual">CORS headers present in response</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="KV namespace IDs must be configured" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy email-capture worker

Email capture worker deployed to Cloudflare Workers:
- POST /subscribe: Capture email signups with rate limiting
- Email validation (RFC 5322)
- Duplicate detection
- CORS configured for showcase domain

Resolves P0 blocker #7 and T1-004 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Demo Sites

Three parallel tracks deploying 5 demo sites (longest task). **Estimated time: 60-90 minutes**

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Deploy Ember demo site</title>
  <requirement>T1-001: Deploy live demo sites (1 of 5)</requirement>
  <description>
    Per DEPLOYMENT-RUNBOOK.md Task 5 and Board Condition T1-001:
    Deploy the Ember theme as a live Emdash demo site.

    This is the first demo site and establishes the pattern for others.

    Target: ember.wardrobe.emdash.dev
    Theme: Ember ("Bold. Editorial. For people with something to say.")

    Reference: docs/EMDASH-GUIDE.md Section 5 for Cloudflare deployment
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/ember/src/" reason="Ember theme source files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 5: Demo site deployment steps" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Cloudflare deployment patterns" />
  </context>

  <steps>
    <step order="1">Create new Emdash site: npm create emdash@latest -- --template @emdash-cms/template-blog-cloudflare</step>
    <step order="2">Name: wardrobe-demo-ember</step>
    <step order="3">cd wardrobe-demo-ember</step>
    <step order="4">Copy theme: cp -r /path/to/wardrobe/themes/ember/src/* ./src/</step>
    <step order="5">Create D1 database: wrangler d1 create wardrobe-demo-ember</step>
    <step order="6">Note database_id from output</step>
    <step order="7">Create R2 bucket: wrangler r2 bucket create wardrobe-demo-ember-media</step>
    <step order="8">Update wrangler.jsonc with database_id and bucket name (per EMDASH-GUIDE.md Section 5)</step>
    <step order="9">Run migrations: wrangler d1 migrations apply wardrobe-demo-ember</step>
    <step order="10">Seed demo content: npx emdash seed</step>
    <step order="11">Generate auth secret: npx emdash auth secret</step>
    <step order="12">Set secret: wrangler secret put EMDASH_AUTH_SECRET</step>
    <step order="13">Deploy: wrangler deploy</step>
    <step order="14">Configure custom domain: ember.wardrobe.emdash.dev (Cloudflare dashboard)</step>
    <step order="15">Verify site loads: curl -I https://ember.wardrobe.emdash.dev</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://ember.wardrobe.emdash.dev</check>
    <check type="manual">Site renders with Ember theme styling</check>
    <check type="manual">Demo content visible on homepage</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Theme distribution must be working" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy ember demo site

Ember demo site deployed to ember.wardrobe.emdash.dev
- D1 database: wardrobe-demo-ember
- R2 bucket: wardrobe-demo-ember-media
- Demo content seeded

Part of T1-001 (1/5 demo sites)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Deploy Forge and Slate demo sites</title>
  <requirement>T1-001: Deploy live demo sites (2-3 of 5)</requirement>
  <description>
    Per DEPLOYMENT-RUNBOOK.md Task 5 and Board Condition T1-001:
    Deploy Forge and Slate themes as live Emdash demo sites.

    Follow the same pattern as Ember (task-7).

    Targets:
    - forge.wardrobe.emdash.dev ("Dark and technical. Built for builders.")
    - slate.wardrobe.emdash.dev ("Trust at first glance.")
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/forge/src/" reason="Forge theme source files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/slate/src/" reason="Slate theme source files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 5 pattern" />
  </context>

  <steps>
    <step order="1">Deploy Forge: Repeat steps from task-7 for themes/forge/</step>
    <step order="2">D1 database: wardrobe-demo-forge</step>
    <step order="3">R2 bucket: wardrobe-demo-forge-media</step>
    <step order="4">Domain: forge.wardrobe.emdash.dev</step>
    <step order="5">Verify: curl -I https://forge.wardrobe.emdash.dev</step>
    <step order="6">Deploy Slate: Repeat steps from task-7 for themes/slate/</step>
    <step order="7">D1 database: wardrobe-demo-slate</step>
    <step order="8">R2 bucket: wardrobe-demo-slate-media</step>
    <step order="9">Domain: slate.wardrobe.emdash.dev</step>
    <step order="10">Verify: curl -I https://slate.wardrobe.emdash.dev</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://forge.wardrobe.emdash.dev</check>
    <check type="bash">curl -I https://slate.wardrobe.emdash.dev</check>
    <check type="manual">Both sites render with correct theme styling</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Theme distribution must be working" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy forge and slate demo sites

Demo sites deployed:
- forge.wardrobe.emdash.dev (dark, technical)
- slate.wardrobe.emdash.dev (clean, professional)

Part of T1-001 (3/5 demo sites)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Deploy Drift and Bloom demo sites</title>
  <requirement>T1-001: Deploy live demo sites (4-5 of 5)</requirement>
  <description>
    Per DEPLOYMENT-RUNBOOK.md Task 5 and Board Condition T1-001:
    Deploy Drift and Bloom themes as live Emdash demo sites.

    Follow the same pattern as Ember (task-7).

    Targets:
    - drift.wardrobe.emdash.dev ("Let your content breathe.")
    - bloom.wardrobe.emdash.dev ("Where community feels at home.")
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/drift/src/" reason="Drift theme source files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/bloom/src/" reason="Bloom theme source files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 5 pattern" />
  </context>

  <steps>
    <step order="1">Deploy Drift: Repeat steps from task-7 for themes/drift/</step>
    <step order="2">D1 database: wardrobe-demo-drift</step>
    <step order="3">R2 bucket: wardrobe-demo-drift-media</step>
    <step order="4">Domain: drift.wardrobe.emdash.dev</step>
    <step order="5">Verify: curl -I https://drift.wardrobe.emdash.dev</step>
    <step order="6">Deploy Bloom: Repeat steps from task-7 for themes/bloom/</step>
    <step order="7">D1 database: wardrobe-demo-bloom</step>
    <step order="8">R2 bucket: wardrobe-demo-bloom-media</step>
    <step order="9">Domain: bloom.wardrobe.emdash.dev</step>
    <step order="10">Verify: curl -I https://bloom.wardrobe.emdash.dev</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://drift.wardrobe.emdash.dev</check>
    <check type="bash">curl -I https://bloom.wardrobe.emdash.dev</check>
    <check type="manual">Both sites render with correct theme styling</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Theme distribution must be working" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy drift and bloom demo sites

Demo sites deployed:
- drift.wardrobe.emdash.dev (minimal, airy)
- bloom.wardrobe.emdash.dev (warm, organic)

Completes T1-001 (5/5 demo sites)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Screenshots, Showcase, QA

Four tasks completing deployment and validation. **Estimated time: 30 minutes**

```xml
<task-plan id="phase-1-task-10" wave="4">
  <title>Generate real PNG screenshots from demo sites</title>
  <requirement>T1-002: Replace SVG placeholders with real PNGs</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #3 and DEPLOYMENT-RUNBOOK.md Task 6:
    Generate real screenshots from the 5 live demo sites.

    Current: SVG placeholders at showcase/screenshots/*.svg
    Target: PNG screenshots at showcase/screenshots/*.png (< 200KB each)

    Uses Playwright for automated screenshot capture.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/generate-screenshots.ts" reason="Playwright screenshot script" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/screenshots/" reason="Output directory" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 6 screenshot steps" />
  </context>

  <steps>
    <step order="1">Install Playwright: npx playwright install chromium</step>
    <step order="2">Update scripts/generate-screenshots.ts with live demo URLs if needed</step>
    <step order="3">Verify all 5 demo sites are accessible</step>
    <step order="4">Run: npm run screenshots</step>
    <step order="5">Verify output: ls -la showcase/screenshots/*.png</step>
    <step order="6">Check file sizes: du -h showcase/screenshots/*.png (should be < 200KB each)</step>
    <step order="7">Spot-check visual quality of each screenshot</step>
    <step order="8">Remove old SVG files: rm showcase/screenshots/*.svg</step>
    <step order="9">Update showcase/index.html if referencing .svg extensions</step>
  </steps>

  <verification>
    <check type="bash">ls /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/screenshots/*.png | wc -l</check>
    <check type="bash">du -h /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/screenshots/*.png</check>
    <check type="manual">All 5 screenshots capture theme personality</check>
    <check type="manual">No SVG files remain</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Ember demo site must be live" />
    <depends-on task-id="phase-1-task-8" reason="Forge and Slate demo sites must be live" />
    <depends-on task-id="phase-1-task-9" reason="Drift and Bloom demo sites must be live" />
  </dependencies>

  <commit-message>feat(wardrobe): generate real PNG screenshots

Replace SVG placeholders with real screenshots from live demo sites:
- ember.png (bold, editorial)
- forge.png (dark, technical)
- slate.png (clean, professional)
- drift.png (minimal, airy)
- bloom.png (warm, organic)

All screenshots < 200KB per Board requirement.

Resolves T1-002 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Deploy showcase website to Cloudflare Pages</title>
  <requirement>P0-008: Deploy showcase website to Cloudflare Pages</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #7 and DEPLOYMENT-RUNBOOK.md Task 7:
    Deploy the marketing showcase website with real screenshots.

    Target: wardrobe.emdash.dev
    Content: Theme cards, copy buttons, email capture form
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/" reason="Showcase website files" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/script.js" reason="May need endpoint URL update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 7 deployment steps" />
  </context>

  <steps>
    <step order="1">cd showcase</step>
    <step order="2">Verify screenshots use .png extensions in index.html</step>
    <step order="3">Verify email endpoint URL in script.js matches deployed worker</step>
    <step order="4">Create Pages project: wrangler pages project create wardrobe-showcase</step>
    <step order="5">Deploy: wrangler pages deploy . --project-name wardrobe-showcase</step>
    <step order="6">Note deployment URL: wardrobe-showcase.pages.dev</step>
    <step order="7">Configure custom domain: wardrobe.emdash.dev (Cloudflare dashboard)</step>
    <step order="8">Verify HTTPS: curl -I https://wardrobe.emdash.dev</step>
    <step order="9">Test email form: submit test email, verify worker receives</step>
    <step order="10">Test copy buttons: verify clipboard functionality</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://wardrobe.emdash.dev</check>
    <check type="manual">All 5 theme cards visible</check>
    <check type="manual">Copy buttons functional</check>
    <check type="manual">Email form submits successfully</check>
    <check type="manual">Mobile responsive at 375px width</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Real screenshots must be generated" />
    <depends-on task-id="phase-1-task-6" reason="Email capture worker must be deployed" />
  </dependencies>

  <commit-message>feat(wardrobe): deploy showcase to Cloudflare Pages

Showcase website deployed to wardrobe.emdash.dev:
- 5 theme cards with real screenshots
- Email capture form (wired to worker)
- Copy buttons for install commands
- WCAG 2.1 AA accessible
- Mobile responsive

Resolves P0 blocker #7 from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Commit all changes to git</title>
  <requirement>P0-009: Commit uncommitted files</requirement>
  <description>
    Per qa-pass-1.md P0 blocker #9:
    Commit all modified and untracked files in the wardrobe project.

    Uncommitted per QA:
    - cli/commands/install.ts (Modified - contains T1-003 fix)
    - dist/cli/commands/install.js (Modified - built output)
    - docs/ (Untracked - DEPLOYMENT-RUNBOOK.md)

    Plus all changes from this deployment plan.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/" reason="Project root" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/qa-pass-1.md" reason="Documents uncommitted files" />
  </context>

  <steps>
    <step order="1">cd /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe</step>
    <step order="2">git status (review all changes)</step>
    <step order="3">git add .</step>
    <step order="4">Create commit with all deployment changes</step>
    <step order="5">git status (verify clean working tree)</step>
  </steps>

  <verification>
    <check type="bash">cd /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe && git status --porcelain</check>
    <check type="manual">git status shows clean working tree</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Upload script fix must be committed" />
    <depends-on task-id="phase-1-task-1" reason="KV namespace updates must be committed" />
    <depends-on task-id="phase-1-task-10" reason="Screenshots must be committed" />
  </dependencies>

  <commit-message>chore(wardrobe): complete Phase 1 deployment

Phase 1 deployment complete:
- KV namespace IDs configured
- R2 upload script fixed
- Workers deployed (analytics, email-capture)
- 5 demo sites deployed
- Real PNG screenshots generated
- Showcase deployed to Cloudflare Pages

Resolves all 9 P0 blockers from qa-pass-1.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Run QA Pass 2 verification</title>
  <requirement>QA validation before launch</requirement>
  <description>
    Per DEPLOYMENT-RUNBOOK.md Task 9:
    Execute comprehensive QA verification of all deployed components.

    All 9 P0 blockers must be resolved.
    All 5 Tier 1 conditions must pass.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/qa-pass-1.md" reason="QA checklist to re-verify" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/docs/DEPLOYMENT-RUNBOOK.md" reason="Task 9 verification steps" />
  </context>

  <steps>
    <step order="1">Verify P0-001/002/003: All KV namespace IDs are real (not placeholders)</step>
    <step order="2">Verify P0-004: R2 bucket exists and has public access</step>
    <step order="3">Verify P0-005: All 5 tarballs return HTTP 200</step>
    <step order="4">Verify P0-006: Analytics worker /health returns 200</step>
    <step order="5">Verify P0-007: Email-capture worker accepts POST /subscribe</step>
    <step order="6">Verify P0-008: Showcase loads at wardrobe.emdash.dev</step>
    <step order="7">Verify P0-009: git status shows clean working tree</step>
    <step order="8">Verify T1-001: All 5 demo sites load</step>
    <step order="9">Verify T1-002: All screenshots are PNG (not SVG)</step>
    <step order="10">Verify T1-003: CLI shows post-install reveal</step>
    <step order="11">Verify T1-004: Email form submits successfully</step>
    <step order="12">Verify T1-005: Analytics receives test event</step>
    <step order="13">Benchmark install speed: npx wardrobe install ember (< 3 seconds)</step>
    <step order="14">Document QA Pass 2 results</step>
  </steps>

  <verification>
    <check type="manual">All 9 P0 blockers: PASS</check>
    <check type="manual">All 5 T1 conditions: PASS</check>
    <check type="manual">Install speed < 3 seconds</check>
    <check type="manual">Overall verdict: PASS</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Showcase must be deployed" />
    <depends-on task-id="phase-1-task-12" reason="All changes must be committed" />
  </dependencies>

  <commit-message>docs(wardrobe): QA Pass 2 verification complete

All P0 blockers resolved. All Tier 1 conditions met.
Wardrobe Theme Marketplace ready for launch.

QA Director: Margaret Hamilton
Verdict: PASS

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism | Est. Time |
|------|-------|-------------|-------------|-----------|
| 1 | 3 | Infrastructure: KV namespaces, R2 bucket, script fix | 3 parallel | 10 min |
| 2 | 3 | Workers: Upload tarballs, analytics worker, email worker | 3 parallel (after Wave 1) | 15 min |
| 3 | 3 | Demo Sites: Ember, Forge+Slate, Drift+Bloom | 3 parallel (after Wave 2) | 60-90 min |
| 4 | 4 | Finalize: Screenshots, showcase, git, QA | Sequential (after Wave 3) | 30 min |

**Total Tasks:** 13
**Maximum Parallelism:** Wave 3 (3 concurrent demo site deployments)
**Total Time (Sequential):** ~2.5-3 hours
**Total Time (Parallelized):** ~1.5-2 hours

---

## Dependencies Diagram

```
Wave 1:  [task-1: KV Namespaces] ─────────────────────────────────────────>
         [task-2: R2 Bucket] ─────────────────────────────────────────────>
         [task-3: Script Fix] ────────────────────────────────────────────>

Wave 2:  [task-4: Upload Tarballs] ────> (depends on 2,3) ────────────────>
         [task-5: Analytics Worker] ───> (depends on 1) ──────────────────>
         [task-6: Email Worker] ───────> (depends on 1) ──────────────────>

Wave 3:  [task-7: Ember Demo] ─────────> (depends on 4) ──────────────────>
         [task-8: Forge+Slate Demos] ──> (depends on 4) ──────────────────>
         [task-9: Drift+Bloom Demos] ──> (depends on 4) ──────────────────>

Wave 4:  [task-10: Screenshots] ───────> (depends on 7,8,9) ──────────────>
         [task-11: Showcase Deploy] ───> (depends on 10,6) ───────────────>
         [task-12: Git Commit] ────────> (depends on 1,3,10) ─────────────>
         [task-13: QA Pass 2] ─────────> (depends on 11,12) ──────────────>
```

---

## Risk Notes

### Mitigated in This Plan

| Risk | Mitigation | Task |
|------|------------|------|
| R2 upload script bug | Fix endpoint URL before upload | task-3 |
| Placeholder KV IDs | Replace with real IDs | task-1 |
| Demo sites are longest task | Parallelize 3 deployment tracks | tasks 7-9 |
| Screenshot dependencies | Wait for all demo sites | task-10 |
| CORS_ORIGIN mismatch | Verify domain consistency | task-6 |

### Remaining Risks (Monitor)

| Risk | Impact | Notes |
|------|--------|-------|
| DNS propagation delay | Medium | May need to wait for custom domains |
| Playwright browser download | Low | Requires internet access |
| R2 public URL format | Medium | May need CLI update if URL differs |

---

## Verification Checklist

- [x] All 9 P0 blockers have task coverage
- [x] All 5 Tier 1 conditions have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed
- [x] docs/EMDASH-GUIDE.md cited (Section 5, 7)
- [x] DEPLOYMENT-RUNBOOK.md referenced throughout
- [x] Critical path identified (demo sites)

---

## Ship Test

> Does `npx wardrobe install ember` transform the site in under 3 seconds?

> Does the showcase make you want to try a theme?

> Do the screenshots capture the personality of each theme?

> Would you share wardrobe.emdash.dev with a friend?

> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/emdash-marketplace/decisions.md, docs/EMDASH-GUIDE.md, qa-pass-1.md*
*Project Slug: emdash-marketplace*
*Product Name: Wardrobe*
