# Phase 1 Plan — Wardrobe Launch (Tier 1 Blockers)

**Generated:** April 11, 2026
**Project Slug:** emdash-marketplace
**Product Name:** Wardrobe (Theme Marketplace for Emdash)
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 10
**Waves:** 3
**Status:** READY FOR BUILD

---

## The Essence

> **What it is:** One command transforms your site into something beautiful — your content stays, only the skin changes.

> **The feeling:** "I can't believe I just did that."

> **The one thing that must be perfect:** Seeing YOUR content wearing a new theme.

> **Creative direction:** Instant dignity.

---

## Build Status

**Technical MVP:** Feature-complete (CLI, 5 themes, showcase, workers all built)
**Board Verdict:** PROCEED (Conditional) — 6/10 aggregate score
**Current State:** Code exists but infrastructure not deployed; 0/5 Tier 1 conditions met

| Component | Lines | Status | Gap |
|-----------|-------|--------|-----|
| CLI (install.ts) | 262 | Complete | Post-install reveal missing |
| 5 Themes | ~150 each | Complete | None |
| Showcase HTML | 341 | Complete | SVG placeholders, not deployed |
| Email Worker | ~300 | Complete | Not deployed, KV not provisioned |
| Analytics Worker | ~389 | Complete | Not deployed, KV not provisioned |
| Theme Tarballs | 5 files | Complete | Not uploaded to R2 |
| Demo Sites | 0 | NOT STARTED | Board blocker #1 |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-T1-007: R2 Theme Upload | phase-1-task-1 | 1 |
| REQ-T1-003: Post-Install Reveal | phase-1-task-2 | 1 |
| REQ-T1-004: Email Worker Deployment | phase-1-task-3 | 1 |
| REQ-T1-005: Analytics Worker Deployment | phase-1-task-4 | 1 |
| REQ-T1-001: Live Demo Sites | phase-1-task-5 | 2 |
| REQ-T1-002: Real Screenshots | phase-1-task-6 | 2 |
| REQ-T1-006: Showcase Deployment | phase-1-task-7 | 2 |
| Install Speed Benchmark | phase-1-task-8 | 3 |
| QA Pass | phase-1-task-9 | 3 |
| Sara Blakely Review | phase-1-task-10 | 3 |

---

## Documentation References

This plan cites specific sections from the source documents:

- **decisions.md Section "Board Conditions for Launch":** Tier 1 conditions #1-5
- **decisions.md Section "MVP Feature Set":** CLI commands, install experience
- **decisions.md Section "File Structure":** Theme and worker paths
- **decisions.md Section "Risk Register":** Screenshot quality, install speed
- **docs/EMDASH-GUIDE.md Section 1:** Getting Started, port 4321
- **docs/EMDASH-GUIDE.md Section 5:** Cloudflare deployment (D1, R2, Workers)
- **docs/EMDASH-GUIDE.md Section 7:** Theming, seed files, theme structure

---

## Wave Execution Order

### Wave 1 (Parallel) — Infrastructure Foundation

Four independent tasks deploying infrastructure. No dependencies on each other.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Upload theme tarballs to Cloudflare R2</title>
  <requirement>REQ-T1-007: R2 Theme Upload (P0-Blocker)</requirement>
  <description>
    Per decisions.md Decision #4: CLI downloads tarball from R2.
    Tarballs are built but not uploaded. Without R2 hosting,
    `npx wardrobe install ember` fails immediately.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/" reason="Built tarballs to upload" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/registry/themes.json" reason="CDN URLs to verify" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/upload-tarballs.ts" reason="Upload script" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/.env.example" reason="Required env vars" />
  </context>

  <steps>
    <step order="1">Create R2 bucket: `wrangler r2 bucket create emdash-themes`</step>
    <step order="2">Enable public access on bucket via Cloudflare dashboard or wrangler</step>
    <step order="3">Create R2 API token with Object Read/Write permissions</step>
    <step order="4">Set environment variables: CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY</step>
    <step order="5">Run upload script: `npm run upload:themes` (in wardrobe directory)</step>
    <step order="6">Verify each tarball accessible: curl https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz</step>
    <step order="7">If using custom domain, configure R2 custom domain in Cloudflare dashboard</step>
    <step order="8">Update themes.json if CDN URL differs from placeholder</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz | grep "200 OK"</check>
    <check type="bash">curl -I https://cdn.emdash.dev/themes/forge@1.0.0.tar.gz | grep "200 OK"</check>
    <check type="bash">curl -I https://cdn.emdash.dev/themes/slate@1.0.0.tar.gz | grep "200 OK"</check>
    <check type="bash">curl -I https://cdn.emdash.dev/themes/drift@1.0.0.tar.gz | grep "200 OK"</check>
    <check type="bash">curl -I https://cdn.emdash.dev/themes/bloom@1.0.0.tar.gz | grep "200 OK"</check>
    <check type="test">All 5 tarballs return HTTP 200</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>infra(wardrobe): upload theme tarballs to R2

Per decisions.md Decision #4:
- R2 bucket created: emdash-themes
- 5 theme tarballs uploaded
- Public CDN access verified
- CLI installs now functional

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Add post-install reveal to CLI</title>
  <requirement>REQ-T1-003: Post-Install Reveal (P0-Blocker, Shonda)</requirement>
  <description>
    Per Board Condition Tier 1 #3: "CLI offers to open transformed site
    or prints clear localhost URL." Current install.ts shows success
    message but no dev server hint. Per docs/EMDASH-GUIDE.md Section 1,
    Emdash runs on port 4321.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="File to modify (lines 197-202)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Port 4321 reference (Section 1)" />
  </context>

  <steps>
    <step order="1">Read install.ts and locate success message block (lines 197-202)</step>
    <step order="2">Add line after "Installed in X.XXs": "Run `npm run dev` to see your transformed site"</step>
    <step order="3">Add line: "Then open http://localhost:4321"</step>
    <step order="4">Add line: "Admin panel: http://localhost:4321/_emdash/admin"</step>
    <step order="5">Maintain Steve Jobs voice style (short sentences, no jargon)</step>
    <step order="6">Run TypeScript compile: `npm run build` in wardrobe directory</step>
    <step order="7">Test: Run `npx wardrobe install ember` in a test Emdash project</step>
    <step order="8">Verify new lines appear in success output</step>
  </steps>

  <verification>
    <check type="bash">grep -q "npm run dev" cli/commands/install.ts</check>
    <check type="bash">grep -q "localhost:4321" cli/commands/install.ts</check>
    <check type="bash">grep -q "_emdash/admin" cli/commands/install.ts</check>
    <check type="manual">Success message shows dev server hint</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(cli): add post-install reveal with dev server hint

Per Board Condition Tier 1 #3 (Shonda):
- Show "Run npm run dev to see your transformed site"
- Print localhost:4321 URL
- Print admin panel URL
- Maintains Steve Jobs voice style

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Deploy email capture worker to Cloudflare</title>
  <requirement>REQ-T1-004: Wire Email Capture Worker (P0-Blocker, Shonda/Oprah)</requirement>
  <description>
    Per Board Condition Tier 1 #4: "Wire worker before launch.
    Placeholder URLs are lies dressed as features." Worker code is
    complete but KV namespaces not provisioned.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/src/index.ts" reason="Worker code to deploy" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/email-capture/wrangler.toml" reason="Config to update with KV IDs" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/script.js" reason="Update with real endpoint URL" />
  </context>

  <steps>
    <step order="1">cd to workers/email-capture/ directory</step>
    <step order="2">Create KV namespace for emails: `wrangler kv:namespace create EMAILS`</step>
    <step order="3">Create KV namespace for rate limits: `wrangler kv:namespace create RATE_LIMITS`</step>
    <step order="4">Note the namespace IDs from command output</step>
    <step order="5">Update wrangler.toml with real namespace IDs (replace placeholders)</step>
    <step order="6">Deploy worker: `wrangler deploy`</step>
    <step order="7">Note deployed URL (wardrobe-email.emdash.workers.dev or similar)</step>
    <step order="8">Update showcase/script.js with real endpoint URL</step>
    <step order="9">Test: Submit email via curl to POST /subscribe endpoint</step>
    <step order="10">Verify email stored: `wrangler kv:key list --namespace-id=EMAILS_ID`</step>
  </steps>

  <verification>
    <check type="bash">curl -X POST https://wardrobe-email.emdash.workers.dev/subscribe -H "Content-Type: application/json" -d '{"email":"test@example.com"}'</check>
    <check type="test">Response is 200 with success message</check>
    <check type="test">Email appears in KV namespace</check>
    <check type="manual">Showcase form submits successfully</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>infra(wardrobe): deploy email capture worker

Per Board Condition Tier 1 #4 (Shonda/Oprah):
- KV namespaces created: EMAILS, RATE_LIMITS
- Worker deployed to production
- Showcase form wired to real endpoint
- Email persistence verified

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Deploy analytics telemetry worker to Cloudflare</title>
  <requirement>REQ-T1-005: Deploy Analytics Worker (P0-Blocker, Buffett)</requirement>
  <description>
    Per Board Condition Tier 1 #5: "Track which themes are installed."
    CLI already calls telemetry endpoint (install.ts line 34) but worker
    not deployed. Analytics enable data-driven decisions.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/src/index.ts" reason="Worker code to deploy" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/workers/analytics/wrangler.toml" reason="Config to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="Telemetry call at line 34" />
  </context>

  <steps>
    <step order="1">cd to workers/analytics/ directory</step>
    <step order="2">Create KV namespace: `wrangler kv:namespace create ANALYTICS`</step>
    <step order="3">Note the namespace ID from command output</step>
    <step order="4">Update wrangler.toml with real namespace ID</step>
    <step order="5">Generate API key for stats endpoint: `openssl rand -hex 32`</step>
    <step order="6">Set API key secret: `wrangler secret put API_KEY`</step>
    <step order="7">Deploy worker: `wrangler deploy`</step>
    <step order="8">Verify deployment URL matches CLI constant (line 20 in install.ts)</step>
    <step order="9">Test track endpoint: curl POST /track with theme payload</step>
    <step order="10">Test stats endpoint: curl GET /stats with X-API-Key header</step>
    <step order="11">Document telemetry opt-out: WARDROBE_TELEMETRY_DISABLED=1</step>
  </steps>

  <verification>
    <check type="bash">curl -X POST https://wardrobe-analytics.emdash.workers.dev/track -H "Content-Type: application/json" -d '{"theme":"ember","os":"darwin","timestamp":1234567890,"cliVersion":"1.0.0"}'</check>
    <check type="bash">curl https://wardrobe-analytics.emdash.workers.dev/health</check>
    <check type="test">Track endpoint returns 200</check>
    <check type="test">Health endpoint returns 200</check>
    <check type="test">Stats endpoint works with API key</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>infra(wardrobe): deploy analytics telemetry worker

Per Board Condition Tier 1 #5 (Buffett):
- KV namespace created: ANALYTICS
- API key secret configured
- Worker deployed to production
- CLI telemetry now functional
- Opt-out documented: WARDROBE_TELEMETRY_DISABLED=1

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Demo Sites & Showcase

Three tasks for demo sites, screenshots, and showcase deployment.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Deploy 5 live demo sites to Cloudflare</title>
  <requirement>REQ-T1-001: Deploy Live Demo Sites (P0-Blocker, Oprah/Shonda)</requirement>
  <description>
    Per Board Condition Tier 1 #1: "Each theme must have a working preview URL."
    This is the highest-impact blocker. Per docs/EMDASH-GUIDE.md Section 5,
    each site needs D1 database and R2 bucket.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/" reason="Theme source files" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Cloudflare deployment, Section 7: Seed files" />
  </context>

  <steps>
    <step order="1">For each theme (ember, forge, slate, drift, bloom), create new Emdash site:</step>
    <step order="2">  `npm create emdash@latest` → name: wardrobe-demo-{theme}</step>
    <step order="3">  Copy theme's src/ directory over the starter src/</step>
    <step order="4">  Create D1 database: `wrangler d1 create wardrobe-demo-{theme}`</step>
    <step order="5">  Create R2 bucket: `wrangler r2 bucket create wardrobe-demo-{theme}-media`</step>
    <step order="6">  Configure wrangler.jsonc with binding names</step>
    <step order="7">  Run migrations: `wrangler d1 migrations apply wardrobe-demo-{theme}`</step>
    <step order="8">  Seed demo content: `npx emdash seed` (or import sample posts)</step>
    <step order="9">  Deploy: `wrangler deploy`</step>
    <step order="10">  Configure custom domain: {theme}.wardrobe.emdash.dev</step>
    <step order="11">Repeat for all 5 themes</step>
    <step order="12">Update showcase index.html with live demo URLs</step>
    <step order="13">Update themes.json previewUrl fields if needed</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://ember.wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="bash">curl -I https://forge.wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="bash">curl -I https://slate.wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="bash">curl -I https://drift.wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="bash">curl -I https://bloom.wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="manual">Each demo site renders with sample content</check>
    <check type="manual">Each demo site reflects its theme's personality</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="R2 must be working for theme downloads" />
  </dependencies>

  <commit-message>infra(wardrobe): deploy 5 live demo sites

Per Board Condition Tier 1 #1 (Oprah/Shonda):
- ember.wardrobe.emdash.dev deployed
- forge.wardrobe.emdash.dev deployed
- slate.wardrobe.emdash.dev deployed
- drift.wardrobe.emdash.dev deployed
- bloom.wardrobe.emdash.dev deployed
- Each site has D1 database and R2 storage
- Sample content seeded for fair comparison

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Generate real screenshots from live demo sites</title>
  <requirement>REQ-T1-002: Replace SVG Placeholders (P0-Blocker, Oprah)</requirement>
  <description>
    Per Board Condition Tier 1 #2: "People can't see themselves in placeholders."
    Currently showcase has SVG files. Generate real screenshots using Playwright
    script that exists at scripts/generate-screenshots.ts.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/scripts/generate-screenshots.ts" reason="Screenshot generation script" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/screenshots/" reason="Output directory (currently SVGs)" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="Update img src if format changes" />
  </context>

  <steps>
    <step order="1">Verify demo sites are deployed and accessible (depends on task-5)</step>
    <step order="2">Install Playwright if needed: `npx playwright install`</step>
    <step order="3">Update generate-screenshots.ts with live demo URLs if hardcoded differently</step>
    <step order="4">Run screenshot script: `npm run screenshots`</step>
    <step order="5">Verify output files exist: ember.png, forge.png, slate.png, drift.png, bloom.png</step>
    <step order="6">Optimize images with Sharp if not done by script (< 100KB each)</step>
    <step order="7">Remove old SVG files from screenshots/ directory</step>
    <step order="8">Update showcase/index.html img src to use .png instead of .svg</step>
    <step order="9">Review screenshots for quality - must "capture the magic"</step>
    <step order="10">Consider GIFs showing transformation (optional per Risk Register)</step>
  </steps>

  <verification>
    <check type="bash">ls -la showcase/screenshots/*.png</check>
    <check type="bash">file showcase/screenshots/ember.png | grep "PNG image"</check>
    <check type="test">All 5 PNG files exist and are valid images</check>
    <check type="test">Each image is under 200KB</check>
    <check type="manual">Screenshots convey theme personality</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Need live demo sites to capture screenshots" />
  </dependencies>

  <commit-message>feat(showcase): replace SVG placeholders with real screenshots

Per Board Condition Tier 1 #2 (Oprah):
- Generated 1200x800 PNG screenshots for all 5 themes
- Captured from live demo sites with sample content
- Optimized for web (< 200KB each)
- Removed placeholder SVGs
- Screenshots show actual Emdash content

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Deploy showcase website to Cloudflare Pages</title>
  <requirement>REQ-T1-006: Deploy Showcase Website (P0-Blocker)</requirement>
  <description>
    Per decisions.md Decision #8 and Board Override: "All four board members
    require a deployed showcase website before launch." Showcase code is
    complete but not deployed. Must wire to email worker endpoint.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/" reason="Static files to deploy" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/wrangler.toml" reason="Pages config" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/script.js" reason="Email endpoint URL" />
  </context>

  <steps>
    <step order="1">Verify showcase/script.js has correct email worker endpoint (from task-3)</step>
    <step order="2">Verify showcase/index.html uses .png screenshots (from task-6)</step>
    <step order="3">Create Pages project: `wrangler pages project create wardrobe-showcase`</step>
    <step order="4">Deploy: `wrangler pages deploy showcase/ --project-name wardrobe-showcase`</step>
    <step order="5">Note deployment URL (wardrobe-showcase.pages.dev)</step>
    <step order="6">Configure custom domain: wardrobe.emdash.dev (or wardrobe.emdash.app)</step>
    <step order="7">Verify HTTPS working on custom domain</step>
    <step order="8">Test all theme cards render with screenshots</step>
    <step order="9">Test copy-to-clipboard buttons work</step>
    <step order="10">Test email capture form submits successfully</step>
    <step order="11">Test mobile responsiveness (iPhone, Android viewports)</step>
    <step order="12">Run accessibility check (WCAG 2.1 AA)</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://wardrobe.emdash.dev | grep "200 OK"</check>
    <check type="manual">All 5 theme cards visible with real screenshots</check>
    <check type="manual">Copy buttons work (click and verify clipboard)</check>
    <check type="manual">Email form submits without error</check>
    <check type="manual">Mobile layout correct at 375px width</check>
    <check type="test">Page loads in under 3 seconds on 4G</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Email worker must be deployed first" />
    <depends-on task-id="phase-1-task-6" reason="Real screenshots must be generated first" />
  </dependencies>

  <commit-message>infra(wardrobe): deploy showcase to Cloudflare Pages

Per decisions.md Decision #8 and Board Override:
- Showcase deployed to wardrobe.emdash.dev
- All 5 theme cards with real screenshots
- Email capture wired to production worker
- Mobile-responsive verified
- WCAG 2.1 AA accessible

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Validation & Review

Three tasks for benchmarking, QA, and customer review.

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Benchmark install speed (sub-3-second target)</title>
  <requirement>decisions.md Decision #5: Install Speed Target</requirement>
  <description>
    Per Decision #5: "30-second install kills the magic. The transformation
    must feel instant." Target is sub-3-second install. Now that R2 is live,
    benchmark actual install time.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="Install timing code" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/" reason="Tarball sizes" />
  </context>

  <steps>
    <step order="1">Create fresh Emdash test project: `npm create emdash@latest` → test-benchmark</step>
    <step order="2">Install wardrobe CLI in test project</step>
    <step order="3">Run timed install: `time npx wardrobe install ember`</step>
    <step order="4">Record: download time, extraction time, total time</step>
    <step order="5">Repeat for all 5 themes</step>
    <step order="6">Test on simulated slow connection (throttle to 4G)</step>
    <step order="7">Document results in benchmark report</step>
    <step order="8">If any theme exceeds 3 seconds, investigate tarball size optimization</step>
    <step order="9">Verify tarball sizes are reasonable (< 100KB each)</step>
  </steps>

  <verification>
    <check type="bash">ls -lh dist/themes/*.tar.gz</check>
    <check type="test">All tarballs under 100KB</check>
    <check type="test">Ember install < 3 seconds on broadband</check>
    <check type="test">All themes install < 3 seconds on broadband</check>
    <check type="test">All themes install < 5 seconds on 4G</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="R2 must be live for real benchmarks" />
    <depends-on task-id="phase-1-task-5" reason="Demo sites confirm themes work" />
  </dependencies>

  <commit-message>test(wardrobe): benchmark install speed - all themes sub-3s

Per decisions.md Decision #5:
- Ember: X.XXs
- Forge: X.XXs
- Slate: X.XXs
- Drift: X.XXs
- Bloom: X.XXs
- All themes meet sub-3-second target on broadband
- 4G performance acceptable (< 5s)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>QA Pass - Verify all Tier 1 conditions met</title>
  <requirement>All Tier 1 Board Conditions (P0-Blockers)</requirement>
  <description>
    Final verification that all 5 Tier 1 launch conditions are met.
    This is the gate before board re-review.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Full requirements list" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board conditions source" />
  </context>

  <steps>
    <step order="1">Tier 1 #1: Verify all 5 demo sites accessible and content-rich</step>
    <step order="2">Tier 1 #2: Verify all screenshots are real PNGs (not SVGs)</step>
    <step order="3">Tier 1 #3: Verify CLI shows dev server hint after install</step>
    <step order="4">Tier 1 #4: Verify email capture works end-to-end (submit, store, no errors)</step>
    <step order="5">Tier 1 #5: Verify analytics telemetry records install events</step>
    <step order="6">Verify showcase deployed and functional</step>
    <step order="7">Verify R2 tarballs downloadable</step>
    <step order="8">Verify full install flow: `npx wardrobe install ember` in fresh project</step>
    <step order="9">Verify `npm run dev` starts site successfully after install</step>
    <step order="10">Document any issues found</step>
    <step order="11">Create QA report: wardrobe-qa-report.md</step>
    <step order="12">Pass/Fail verdict for each Tier 1 condition</step>
  </steps>

  <verification>
    <check type="manual">Tier 1 #1: Demo sites PASS/FAIL</check>
    <check type="manual">Tier 1 #2: Screenshots PASS/FAIL</check>
    <check type="manual">Tier 1 #3: Post-install reveal PASS/FAIL</check>
    <check type="manual">Tier 1 #4: Email capture PASS/FAIL</check>
    <check type="manual">Tier 1 #5: Analytics telemetry PASS/FAIL</check>
    <check type="manual">All 5 conditions PASS = LAUNCH READY</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Showcase must be deployed" />
    <depends-on task-id="phase-1-task-8" reason="Install speed must be verified" />
  </dependencies>

  <commit-message>qa(wardrobe): verify all Tier 1 board conditions

QA Pass Results:
- Tier 1 #1 Demo Sites: PASS
- Tier 1 #2 Screenshots: PASS
- Tier 1 #3 Post-Install Reveal: PASS
- Tier 1 #4 Email Capture: PASS
- Tier 1 #5 Analytics: PASS

VERDICT: LAUNCH READY for board re-review

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    Wardrobe customers are developers and site owners using Emdash.
    "Would they pay for this? What feels like engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board decisions and essence" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/README.md" reason="Product documentation" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and Wardrobe showcase</step>
    <step order="3">Answer: Would a developer actually use Wardrobe?</step>
    <step order="4">Answer: What would make them say "I can't believe I just did that"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. real value?</step>
    <step order="6">Answer: Is "instant dignity" delivered or just promised?</step>
    <step order="7">Answer: Does the 3-second install actually feel instant?</step>
    <step order="8">Answer: Would they tell a friend about it?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Review after QA pass" />
  </dependencies>

  <commit-message>docs(wardrobe): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would developers choose Wardrobe?
Engineering vanity vs. real value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 4 | Infrastructure foundation (R2, CLI, workers) | 4 parallel |
| 2 | 3 | Demo sites, screenshots, showcase | 3 parallel (after Wave 1) |
| 3 | 3 | Validation (benchmark, QA, Sara review) | Sequential (after Wave 2) |

**Total Tasks:** 10
**Maximum Parallelism:** Wave 1 (4 concurrent tasks)
**Timeline:** 5-7 days (infrastructure focus, minimal code changes)

---

## Dependencies Diagram

```
Wave 1:  [task-1: R2 Upload] ──────────────────────────────────────────────>
         [task-2: CLI Reveal] ─────────────────────────────────────────────>
         [task-3: Email Worker] ───────────────────────────────────────────>
         [task-4: Analytics Worker] ───────────────────────────────────────>

Wave 2:  [task-5: Demo Sites] ───> (depends on task-1) ────────────────────>
         [task-6: Screenshots] ───> (depends on task-5) ───────────────────>
         [task-7: Showcase] ───> (depends on tasks 3,6) ───────────────────>

Wave 3:  [task-8: Benchmark] ───> (depends on tasks 1,5) ──────────────────>
         [task-9: QA Pass] ───> (depends on tasks 7,8) ────────────────────>
         [task-10: Sara] ───> (depends on task-9) ─────────────────────────>
```

---

## Risk Notes

### Addressed in This Phase

| Risk | Mitigation | Task |
|------|------------|------|
| R2 CDN not configured | Create bucket, upload tarballs, verify access | task-1 |
| Email endpoint not wired | Deploy worker, provision KV, update showcase | task-3 |
| No post-install reveal | Add dev server hint to CLI | task-2 |
| Screenshots are placeholders | Generate from live demo sites | task-6 |
| No analytics | Deploy telemetry worker | task-4 |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| 5 themes shipped at once | Medium | Board acknowledged, mitigation not followed |
| No version pinning | Low | V2 feature per decisions.md |
| CLI-only excludes non-technical users | Medium | V2 web install flow planned |
| No Emdash core integration | Low | Open question, not blocking launch |

---

## Verification Checklist

- [x] All P0 requirements have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed (R2, workers, screenshots)
- [x] Board conditions mapped to tasks
- [x] Emdash docs cited for technical accuracy (Section 1, 5, 7)
- [x] 5-7 day timeline achievable
- [x] Ship test defined: "I can't believe I just did that"
- [x] Sara Blakely customer gut-check scheduled (task-10)

---

## Ship Test

> Does `npx wardrobe install ember` transform a site in under 3 seconds?
>
> Does seeing the transformed site make the user feel "I can't believe I just did that"?
>
> Does the showcase make you want to try it immediately?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/emdash-marketplace/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: emdash-marketplace*
