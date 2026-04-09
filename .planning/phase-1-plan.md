# Phase 1 Plan — WARDROBE (Emdash Theme Marketplace)

**Generated:** 2026-04-09
**Project Slug:** emdash-marketplace
**Product Name:** Wardrobe
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 20
**Waves:** 4
**Timeline:** 3 weeks (board re-review deadline)

---

## The Essence

> **What is this product REALLY about?**
> One command transforms your site into something beautiful — your content stays, only the skin changes.

> **What's the feeling it should evoke?**
> "I can't believe I just did that."

> **What's the one thing that must be perfect?**
> Seeing YOUR content wearing a new theme.

> **Creative direction:**
> Instant dignity.

---

## Build Status

**Technical MVP:** Complete (CLI works, 5 themes exist, tarballs built)
**Board Verdict:** HOLD (4.5/10)
**Blockers:** 3 board conditions must be met before launch

| Board Condition | Status | This Phase |
|-----------------|--------|------------|
| Showcase website deployed | NOT DONE | Yes |
| Basic analytics instrumented | NOT DONE | Yes |
| Coming Soon themes (3+) | NOT DONE | Yes |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Showcase website deployed | phase-1-task-1, phase-1-task-2, phase-1-task-3 | 1-2 |
| REQ-002: Anonymous install analytics | phase-1-task-10, phase-1-task-11 | 2-3 |
| REQ-003: Coming Soon themes (3+) | phase-1-task-6, phase-1-task-7 | 1-2 |
| REQ-016, REQ-018: R2 bucket, CDN | phase-1-task-4, phase-1-task-5 | 1-2 |
| REQ-017: themes.json registry | phase-1-task-6 | 1 |
| REQ-019: npm package publishing | phase-1-task-14 | 3 |
| REQ-020-024: Showcase features | phase-1-task-1, phase-1-task-2, phase-1-task-3 | 1-2 |
| REQ-037: Screenshot generation | phase-1-task-8 | 2 |
| REQ-039: CI/CD pipeline | phase-1-task-15 | 3 |
| REQ-043: Tarball integrity | phase-1-task-5 | 2 |
| REQ-054: Email capture | phase-1-task-9 | 2 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation: Infrastructure & Registry

Four independent foundational tasks setting up R2 bucket, registry, showcase skeleton, and documentation.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Deploy showcase website skeleton to Cloudflare Pages</title>
  <requirement>REQ-001, REQ-020, REQ-025: Showcase website deployed to Cloudflare Pages</requirement>
  <description>
    Deploy existing showcase/ directory to Cloudflare Pages.
    Per Board: Showcase website is a BLOCKER for launch.
    Start with existing HTML, enhance in subsequent tasks.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="Existing showcase HTML" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/styles.css" reason="Existing styles" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/script.js" reason="Copy button JS" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board blockers" />
  </context>

  <steps>
    <step order="1">Navigate to wardrobe/showcase/ directory</step>
    <step order="2">Create wrangler.toml for Cloudflare Pages deployment</step>
    <step order="3">Configure project name: "wardrobe-showcase"</step>
    <step order="4">Set compatibility_date to current date</step>
    <step order="5">Run wrangler pages deploy showcase/ --project-name=wardrobe-showcase</step>
    <step order="6">Note the deployed URL (*.pages.dev)</step>
    <step order="7">Verify site loads and displays 5 theme cards</step>
    <step order="8">Verify copy buttons work on deployed site</step>
    <step order="9">Document deployment URL in README.md</step>
    <step order="10">Create .github/workflows/deploy-showcase.yml for automatic deployment</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://wardrobe-showcase.pages.dev</check>
    <check type="manual">Site loads in browser</check>
    <check type="manual">5 theme cards visible</check>
    <check type="manual">Copy buttons functional</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(wardrobe): deploy showcase to Cloudflare Pages

Board blocker: Showcase website must be deployed.
Initial deployment with existing HTML/CSS/JS.
Auto-deploy workflow for future updates.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Add SEO and Open Graph meta tags to showcase</title>
  <requirement>REQ-024: SEO optimization with meta tags, Open Graph, semantic HTML</requirement>
  <description>
    Enhance showcase HTML with SEO-optimized meta tags.
    Per Board: SEO optimization required for discovery.
    Fast load time (&lt;2 seconds) target.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="HTML to enhance" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Brand voice requirements" />
  </context>

  <steps>
    <step order="1">Open showcase/index.html</step>
    <step order="2">Add comprehensive meta tags in head:</step>
    <step order="3">  - title: "Wardrobe — Theme Marketplace for Emdash"</step>
    <step order="4">  - description: "Install a new theme in one command. Your content stays untouched."</step>
    <step order="5">  - keywords: "emdash themes, astro themes, cms themes, wardrobe"</step>
    <step order="6">Add Open Graph tags:</step>
    <step order="7">  - og:title, og:description, og:image, og:url, og:type</step>
    <step order="8">Add Twitter Card tags:</step>
    <step order="9">  - twitter:card, twitter:title, twitter:description, twitter:image</step>
    <step order="10">Add canonical URL</step>
    <step order="11">Add JSON-LD structured data for SoftwareApplication</step>
    <step order="12">Ensure semantic HTML: header, main, section, footer</step>
    <step order="13">Add aria-labels for accessibility</step>
    <step order="14">Optimize CSS: inline critical, defer non-critical</step>
    <step order="15">Add preconnect for CDN fonts if any</step>
    <step order="16">Verify no render-blocking resources</step>
  </steps>

  <verification>
    <check type="bash">grep -c "og:" showcase/index.html</check>
    <check type="manual">Preview in social sharing debugger</check>
    <check type="manual">Lighthouse SEO score &gt; 90</check>
    <check type="manual">Page load &lt; 2 seconds</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(wardrobe): add SEO and Open Graph meta tags

Board requirement: SEO optimization for discovery.
Open Graph for social sharing previews.
JSON-LD structured data for search engines.
Target: Lighthouse SEO &gt; 90.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Verify mobile responsiveness of showcase</title>
  <requirement>REQ-023: Mobile-responsive showcase</requirement>
  <description>
    Ensure showcase works perfectly on mobile devices.
    Per Board: Must work on phones and tablets.
    Test at multiple breakpoints.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/styles.css" reason="CSS to verify/enhance" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="HTML structure" />
  </context>

  <steps>
    <step order="1">Review showcase/styles.css for mobile styles</step>
    <step order="2">Add viewport meta tag if missing</step>
    <step order="3">Test at breakpoints: 375px (iPhone), 768px (tablet), 1024px+</step>
    <step order="4">Ensure theme cards stack in single column on mobile</step>
    <step order="5">Verify copy buttons are touch-friendly (44px+ tap target)</step>
    <step order="6">Test text readability at all sizes</step>
    <step order="7">Ensure no horizontal scroll on any device</step>
    <step order="8">Add smooth scrolling for any anchor links</step>
    <step order="9">Test screenshots display correctly at all sizes</step>
    <step order="10">Verify install commands don't overflow on small screens</step>
    <step order="11">Add CSS media queries if missing</step>
    <step order="12">Test on actual mobile device or emulator</step>
  </steps>

  <verification>
    <check type="manual">Test at 375px width (iPhone SE)</check>
    <check type="manual">Test at 768px width (iPad)</check>
    <check type="manual">No horizontal scroll</check>
    <check type="manual">Tap targets &gt;= 44px</check>
    <check type="manual">Lighthouse Accessibility &gt; 90</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>style(wardrobe): verify mobile responsiveness

Board requirement: Mobile-responsive showcase.
Tested at 375px, 768px, 1024px breakpoints.
Touch-friendly tap targets (44px+).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Provision R2 bucket for theme tarballs</title>
  <requirement>REQ-016, REQ-018: R2 bucket for tarball distribution</requirement>
  <description>
    Create Cloudflare R2 bucket for hosting theme tarballs.
    Per Decisions: R2 tarballs recommended for V1.
    CDN-backed, fast downloads for sub-3-second install.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/" reason="Pre-built tarballs to upload" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/DISTRIBUTION.md" reason="Distribution strategy" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="R2 decision" />
  </context>

  <steps>
    <step order="1">Create R2 bucket via Cloudflare dashboard or wrangler</step>
    <step order="2">Bucket name: "wardrobe-themes"</step>
    <step order="3">Enable public read access</step>
    <step order="4">Configure CDN caching (Cache-Control: max-age=86400)</step>
    <step order="5">Create upload script: scripts/upload-tarballs.ts</step>
    <step order="6">Upload all 5 tarballs from dist/themes/</step>
    <step order="7">Verify each tarball accessible via R2 URL</step>
    <step order="8">Note R2 bucket URL format: https://wardrobe-themes.{account}.r2.cloudflarestorage.com</step>
    <step order="9">Document R2 credentials setup in .env.example</step>
    <step order="10">Add upload script to npm scripts in package.json</step>
    <step order="11">Test download speed from R2</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://wardrobe-themes.{account}.r2.cloudflarestorage.com/ember@1.0.0.tar.gz</check>
    <check type="manual">All 5 tarballs accessible</check>
    <check type="manual">Download speed acceptable</check>
    <check type="manual">Upload script works</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(wardrobe): provision R2 bucket for theme tarballs

Per decisions: R2 tarballs for distribution.
Bucket: wardrobe-themes with CDN caching.
Upload script for tarball deployment.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Features: Registry, Screenshots, Analytics, Email Capture

Seven tasks building the core functionality needed for board blockers.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Update registry with R2 URLs and sha256 hashes</title>
  <requirement>REQ-017, REQ-043: Registry with real URLs and integrity verification</requirement>
  <description>
    Update themes.json with production R2 URLs and sha256 hashes.
    Per Risk: Hardcoded CDN URLs are critical blocker.
    Add integrity verification for security.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/registry/themes.json" reason="Registry to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/utils/fetch-registry.ts" reason="Hardcoded URLs to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/" reason="Tarballs to hash" />
  </context>

  <steps>
    <step order="1">Generate sha256 hash for each tarball:</step>
    <step order="2">  - sha256sum dist/themes/ember@1.0.0.tar.gz</step>
    <step order="3">  - Repeat for forge, slate, drift, bloom</step>
    <step order="4">Update registry/themes.json:</step>
    <step order="5">  - Replace placeholder tarballUrl with actual R2 URLs</step>
    <step order="6">  - Add "sha256" field for each theme</step>
    <step order="7">  - Add "previewUrl" pointing to showcase deployment</step>
    <step order="8">Update cli/utils/fetch-registry.ts:</step>
    <step order="9">  - Update CDN URL to actual R2/CDN endpoint</step>
    <step order="10">  - Remove hardcoded fallback themes (use CDN only)</step>
    <step order="11">Add hash verification to cli/commands/install.ts:</step>
    <step order="12">  - After download, compute sha256</step>
    <step order="13">  - Compare to registry hash</step>
    <step order="14">  - Fail with error if mismatch</step>
    <step order="15">Test end-to-end: list + install with real URLs</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/registry/themes.json</check>
    <check type="bash">npx wardrobe list</check>
    <check type="test">Install with valid hash succeeds</check>
    <check type="test">Install with corrupted file fails</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Needs R2 bucket with uploaded tarballs" />
  </dependencies>

  <commit-message>feat(wardrobe): update registry with R2 URLs and sha256

Critical: Remove hardcoded placeholder URLs.
Add sha256 hash verification for security.
Registry now points to production R2 bucket.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Add Coming Soon themes to registry</title>
  <requirement>REQ-003: 3+ Coming Soon themes with teased personalities</requirement>
  <description>
    Add "Coming Soon" themes to registry for retention.
    Per Board (Shonda): Creates open loops for return visits.
    Required: 3+ teased themes with personalities.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/registry/themes.json" reason="Registry to update" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board blockers" />
  </context>

  <steps>
    <step order="1">Design 3+ Coming Soon theme concepts:</step>
    <step order="2">  - "Aurora" — Gradient, modern, colorful. "For brands that refuse to blend in."</step>
    <step order="3">  - "Chronicle" — Newspaper-inspired, classic serif. "Stories deserve dignity."</step>
    <step order="4">  - "Neon" — Cyberpunk, dark with bright accents. "The future is now."</step>
    <step order="5">  - "Haven" — Cozy, cottage-core aesthetic. "Home on the internet."</step>
    <step order="6">Add to registry/themes.json with comingSoon: true</step>
    <step order="7">Include teased release dates: "Coming Summer 2026", etc.</step>
    <step order="8">Schema: { name, description, personality, comingSoon: true, estimatedRelease }</step>
    <step order="9">Update CLI list command to show Coming Soon themes separately</step>
    <step order="10">Add "Coming Soon" label with distinct styling</step>
    <step order="11">Prevent install of Coming Soon themes with helpful message</step>
  </steps>

  <verification>
    <check type="bash">grep -c "comingSoon" registry/themes.json</check>
    <check type="bash">npx wardrobe list</check>
    <check type="manual">3+ Coming Soon themes visible</check>
    <check type="test">Install of Coming Soon theme fails gracefully</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>feat(wardrobe): add Coming Soon themes for retention

Board blocker: 3+ teased future themes.
Aurora, Chronicle, Neon, Haven announced.
Creates anticipation and return visits.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Add Coming Soon section to showcase website</title>
  <requirement>REQ-003: Coming Soon section visible on showcase</requirement>
  <description>
    Add Coming Soon section to showcase HTML.
    Per Shonda: Retention hook for repeat visits.
    Display teased themes with estimated dates.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="HTML to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/styles.css" reason="Styles to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/registry/themes.json" reason="Coming Soon themes data" />
  </context>

  <steps>
    <step order="1">Add "Coming Soon" section after main theme grid in index.html</step>
    <step order="2">Section heading: "Coming Soon" with warm copy</step>
    <step order="3">Display 3-4 Coming Soon theme cards:</step>
    <step order="4">  - Theme name and personality tagline</step>
    <step order="5">  - Placeholder image or silhouette</step>
    <step order="6">  - "Coming Summer 2026" badge</step>
    <step order="7">  - No install button (disabled or absent)</step>
    <step order="8">Add CSS for Coming Soon cards:</step>
    <step order="9">  - Slightly muted appearance vs. available themes</step>
    <step order="10">  - "Coming Soon" badge styling</step>
    <step order="11">  - Hover effect: "Get notified" prompt</step>
    <step order="12">Link Coming Soon cards to email capture section</step>
    <step order="13">Add smooth scroll anchor to Coming Soon section</step>
  </steps>

  <verification>
    <check type="manual">Coming Soon section visible on showcase</check>
    <check type="manual">3+ themes displayed</check>
    <check type="manual">Cards link to email capture</check>
    <check type="manual">Styling distinct from available themes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Needs Coming Soon themes in registry" />
  </dependencies>

  <commit-message>feat(wardrobe): add Coming Soon section to showcase

Board blocker: Visible retention hook.
Aurora, Chronicle, Neon, Haven teased.
Links to email capture for notifications.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Generate real theme screenshots with Playwright</title>
  <requirement>REQ-021, REQ-037: Screenshot generation with standardized demo content</requirement>
  <description>
    Create automated screenshot generation using Playwright.
    Per Decisions: Screenshots must "capture the magic."
    Replace placeholder SVGs with actual theme renders.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/screenshots/" reason="Current placeholder images" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/themes/" reason="5 themes to screenshot" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/starter/" reason="Astro + Emdash pattern" />
  </context>

  <steps>
    <step order="1">Install Playwright: npm install -D @playwright/test</step>
    <step order="2">Create scripts/generate-screenshots.ts</step>
    <step order="3">Create demo content fixture:</step>
    <step order="4">  - Standard blog posts</step>
    <step order="5">  - About page content</step>
    <step order="6">  - Contact page</step>
    <step order="7">For each theme (ember, forge, slate, drift, bloom):</step>
    <step order="8">  - Copy theme src/ to temporary Astro project</step>
    <step order="9">  - Inject demo content</step>
    <step order="10">  - Run astro build</step>
    <step order="11">  - Start preview server</step>
    <step order="12">  - Take screenshot at 1280x800 (desktop)</step>
    <step order="13">  - Take screenshot at 375x667 (mobile)</step>
    <step order="14">  - Save to showcase/screenshots/{theme}.png</step>
    <step order="15">Optimize images: compress to &lt; 100KB each</step>
    <step order="16">Update showcase/index.html to use new screenshots</step>
    <step order="17">Add npm script: "screenshots": "tsx scripts/generate-screenshots.ts"</step>
  </steps>

  <verification>
    <check type="bash">ls -la showcase/screenshots/*.png</check>
    <check type="manual">Each theme has actual screenshot (not placeholder)</check>
    <check type="manual">Screenshots show demo content</check>
    <check type="manual">Images &lt; 100KB each</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>feat(wardrobe): add Playwright screenshot generation

Per decisions: Screenshots must capture the magic.
Automated generation with standardized demo content.
Desktop (1280x800) and mobile (375x667) captures.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="2">
  <title>Add email capture form to showcase</title>
  <requirement>REQ-054: Email capture for new theme notifications</requirement>
  <description>
    Add email signup form for "Coming Soon" notifications.
    Per Shonda: Build owned audience for retention.
    Simple form, no user accounts required.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="HTML to update" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/script.js" reason="JS for form handling" />
  </context>

  <steps>
    <step order="1">Add email capture section to showcase/index.html:</step>
    <step order="2">  - Heading: "Get notified when new themes drop"</step>
    <step order="3">  - Email input field with placeholder</step>
    <step order="4">  - Submit button: "Notify Me"</step>
    <step order="5">  - Privacy note: "No spam. Just themes."</step>
    <step order="6">Add form styling to styles.css:</step>
    <step order="7">  - Warm, inviting design</step>
    <step order="8">  - Clear focus states</step>
    <step order="9">  - Success state styling</step>
    <step order="10">Create Cloudflare Worker for form submission:</step>
    <step order="11">  - Receive POST with email</step>
    <step order="12">  - Validate email format</step>
    <step order="13">  - Store in KV or D1 (simple list)</step>
    <step order="14">  - Return success response</step>
    <step order="15">Add form submission JS in script.js:</step>
    <step order="16">  - Prevent default form submission</step>
    <step order="17">  - POST to Worker endpoint</step>
    <step order="18">  - Show success message</step>
    <step order="19">  - Handle errors gracefully</step>
  </steps>

  <verification>
    <check type="manual">Email form visible on showcase</check>
    <check type="manual">Form submission works</check>
    <check type="manual">Success message displayed</check>
    <check type="manual">Emails stored in backend</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>feat(wardrobe): add email capture for theme notifications

Board recommendation: Build owned audience.
Simple form, Cloudflare Worker backend.
"No spam. Just themes." privacy note.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="2">
  <title>Create analytics endpoint for install tracking</title>
  <requirement>REQ-002, REQ-045: Anonymous install analytics endpoint</requirement>
  <description>
    Create Cloudflare Worker to receive install telemetry.
    Per Board: Basic analytics is a BLOCKER.
    Anonymous only — no PII collection.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Cloudflare Worker pattern" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board blockers" />
  </context>

  <steps>
    <step order="1">Create workers/wardrobe-analytics/ directory</step>
    <step order="2">Initialize Cloudflare Worker project</step>
    <step order="3">Create src/index.ts with POST handler</step>
    <step order="4">Accept JSON payload: { theme, os, timestamp, cliVersion }</step>
    <step order="5">Extract country from CF-IPCountry header (anonymous geo)</step>
    <step order="6">Validate payload schema</step>
    <step order="7">Create D1 database for analytics storage:</step>
    <step order="8">  - Table: installs (id, theme, os, country, timestamp, cli_version)</step>
    <step order="9">  - No user identity columns</step>
    <step order="10">Insert record to D1</step>
    <step order="11">Return 200 OK (fire-and-forget for CLI)</step>
    <step order="12">Add rate limiting (100 requests/minute per IP)</step>
    <step order="13">Create wrangler.toml with D1 binding</step>
    <step order="14">Deploy Worker to wardrobe-analytics.{domain}.workers.dev</step>
    <step order="15">Document endpoint URL for CLI integration</step>
  </steps>

  <verification>
    <check type="bash">curl -X POST https://wardrobe-analytics.workers.dev -d '{"theme":"ember","os":"darwin"}'</check>
    <check type="manual">Worker deployed and responding</check>
    <check type="manual">Data stored in D1</check>
    <check type="manual">No PII in database schema</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>feat(wardrobe): create analytics endpoint for install tracking

Board blocker: Basic anonymous analytics.
Cloudflare Worker + D1 for storage.
No PII: theme, OS, country, timestamp only.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="2">
  <title>Add telemetry to CLI install command</title>
  <requirement>REQ-002, REQ-045: CLI sends anonymous telemetry on install</requirement>
  <description>
    Add telemetry POST to CLI install command.
    Anonymous, fire-and-forget (doesn't block install).
    Opt-out capability via environment variable.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="Install command to update" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Analytics requirement" />
  </context>

  <steps>
    <step order="1">Open cli/commands/install.ts</step>
    <step order="2">Add ANALYTICS_URL constant pointing to Worker</step>
    <step order="3">Add function sendTelemetry(theme: string)</step>
    <step order="4">Collect: theme name, process.platform, Date.now(), CLI version</step>
    <step order="5">POST to analytics endpoint</step>
    <step order="6">Make telemetry non-blocking:</step>
    <step order="7">  - Don't await the POST</step>
    <step order="8">  - Catch and ignore errors silently</step>
    <step order="9">  - Never delay install for analytics</step>
    <step order="10">Add opt-out check:</step>
    <step order="11">  - Check process.env.WARDROBE_TELEMETRY_DISABLED</step>
    <step order="12">  - Skip telemetry if set to "1" or "true"</step>
    <step order="13">Call sendTelemetry after successful install</step>
    <step order="14">Document opt-out in README.md</step>
    <step order="15">Log nothing to console about telemetry (silent)</step>
  </steps>

  <verification>
    <check type="bash">grep -A5 "sendTelemetry" cli/commands/install.ts</check>
    <check type="test">Install still completes in &lt; 3 seconds with telemetry</check>
    <check type="test">Install works when analytics endpoint is down</check>
    <check type="test">Opt-out disables telemetry</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Needs analytics endpoint deployed" />
  </dependencies>

  <commit-message>feat(wardrobe): add anonymous telemetry to CLI

Board blocker: Track install metrics.
Fire-and-forget, never blocks install.
Opt-out via WARDROBE_TELEMETRY_DISABLED.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Polish: Documentation, Publish, CI/CD, Copy

Five tasks for final polish and npm publishing.

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Create simple analytics dashboard</title>
  <requirement>REQ-046: Dashboard showing install counts per theme</requirement>
  <description>
    Create simple analytics view for internal use.
    Show install counts per theme, trends, geo distribution.
    Internal tool, not public-facing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/wardrobe-analytics/" reason="Analytics Worker with D1" />
  </context>

  <steps>
    <step order="1">Add GET endpoint to analytics Worker for dashboard data</step>
    <step order="2">Query D1 for aggregated metrics:</step>
    <step order="3">  - Total installs</step>
    <step order="4">  - Installs per theme (ranked)</step>
    <step order="5">  - Installs per day (last 30 days)</step>
    <step order="6">  - Top countries</step>
    <step order="7">Create simple HTML dashboard at /dashboard path</step>
    <step order="8">Protect with basic auth or Cloudflare Access</step>
    <step order="9">Display metrics with simple charts (Chart.js or similar)</step>
    <step order="10">Add auto-refresh every 5 minutes</step>
    <step order="11">Mobile-responsive design</step>
    <step order="12">Document access credentials in internal docs</step>
  </steps>

  <verification>
    <check type="manual">Dashboard loads with auth</check>
    <check type="manual">Shows install counts per theme</check>
    <check type="manual">Shows geographic distribution</check>
    <check type="manual">Data updates with new installs</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Needs analytics Worker and data" />
    <depends-on task-id="phase-1-task-11" reason="Needs CLI sending telemetry" />
  </dependencies>

  <commit-message>feat(wardrobe): add simple analytics dashboard

Board requirement: Theme popularity metrics.
Shows installs per theme, geographic distribution.
Protected internal dashboard.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="3">
  <title>Update README with comprehensive documentation</title>
  <requirement>REQ-038: Documentation with CLI commands, theme structure, troubleshooting</requirement>
  <description>
    Write comprehensive README for Wardrobe.
    Per Decisions: README is fallback if showcase fails.
    Must be sufficient for discovery and usage.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/README.md" reason="README to update" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Brand voice requirements" />
  </context>

  <steps>
    <step order="1">Write README.md header with Wardrobe branding</step>
    <step order="2">Add hero description using approved copy:</step>
    <step order="3">  - "Install in one command. Your content stays untouched."</step>
    <step order="4">Add Quick Start section:</step>
    <step order="5">  - npx wardrobe list</step>
    <step order="6">  - npx wardrobe install ember</step>
    <step order="7">  - npx wardrobe preview ember</step>
    <step order="8">Add Themes section with all 5 themes:</step>
    <step order="9">  - Name, tagline, target users</step>
    <step order="10">  - Screenshot or GIF</step>
    <step order="11">  - Install command</step>
    <step order="12">Add How It Works section:</step>
    <step order="13">  - Downloads theme tarball</step>
    <step order="14">  - Backs up existing src/</step>
    <step order="15">  - Swaps in new theme</step>
    <step order="16">  - Your content is untouched</step>
    <step order="17">Add Troubleshooting FAQ:</step>
    <step order="18">  - "What if I don't like the theme?"</step>
    <step order="19">  - "Will I lose my content?"</step>
    <step order="20">  - "How do I rollback?"</step>
    <step order="21">Add Telemetry section explaining opt-out</step>
    <step order="22">Add Contributing section</step>
    <step order="23">Add License section</step>
  </steps>

  <verification>
    <check type="bash">cat README.md</check>
    <check type="manual">All CLI commands documented</check>
    <check type="manual">All 5 themes listed</check>
    <check type="manual">Brand voice consistent</check>
    <check type="manual">Troubleshooting FAQ present</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 3 task -->
  </dependencies>

  <commit-message>docs(wardrobe): add comprehensive README

CLI commands, all 5 themes, troubleshooting FAQ.
Brand voice: confident friend, zero jargon.
Telemetry disclosure with opt-out instructions.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="3">
  <title>Publish wardrobe CLI to npm</title>
  <requirement>REQ-019: CLI installable via npx wardrobe</requirement>
  <description>
    Publish Wardrobe CLI as npm package.
    Verify "wardrobe" name is available.
    Configure package.json for npm publishing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/package.json" reason="Package config" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/" reason="CLI source" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/bin/wardrobe" reason="CLI entry point" />
  </context>

  <steps>
    <step order="1">Check npm availability: npm view wardrobe</step>
    <step order="2">If taken, consider: @wardrobe/cli or wardrobe-themes</step>
    <step order="3">Update package.json:</step>
    <step order="4">  - name: "wardrobe" (or fallback)</step>
    <step order="5">  - version: "1.0.0"</step>
    <step order="6">  - description: "Theme marketplace for Emdash"</step>
    <step order="7">  - bin: { "wardrobe": "./bin/wardrobe" }</step>
    <step order="8">  - files: ["bin", "dist", "README.md"]</step>
    <step order="9">  - repository, author, license fields</step>
    <step order="10">Build TypeScript: npm run build</step>
    <step order="11">Test npx locally: npx . list</step>
    <step order="12">Authenticate: npm login</step>
    <step order="13">Publish: npm publish --access public</step>
    <step order="14">Verify: npx wardrobe list (from fresh directory)</step>
    <step order="15">Document version and publish date</step>
  </steps>

  <verification>
    <check type="bash">npm view wardrobe</check>
    <check type="bash">npx wardrobe list</check>
    <check type="manual">Package on npmjs.com</check>
    <check type="manual">npx wardrobe install ember works</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Needs registry with real URLs" />
    <depends-on task-id="phase-1-task-11" reason="Needs telemetry integrated" />
  </dependencies>

  <commit-message>feat(wardrobe): publish CLI to npm

Package: wardrobe@1.0.0
Installable via npx wardrobe [command].
All 5 themes installable from R2.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="3">
  <title>Add CI/CD pipeline for themes and showcase</title>
  <requirement>REQ-039: Automated testing and deployment</requirement>
  <description>
    Create GitHub Actions for CI/CD.
    Test theme builds, deploy showcase, rebuild tarballs.
    Automated quality assurance.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.github/workflows/auto-pipeline.yml" reason="Existing workflow pattern" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/" reason="Project to automate" />
  </context>

  <steps>
    <step order="1">Create .github/workflows/wardrobe-ci.yml</step>
    <step order="2">Trigger on push to wardrobe/ directory</step>
    <step order="3">Jobs:</step>
    <step order="4">  - lint: Run ESLint on CLI code</step>
    <step order="5">  - build: Run TypeScript build</step>
    <step order="6">  - test-themes: For each theme, run astro build</step>
    <step order="7">  - deploy-showcase: Deploy to Cloudflare Pages on main branch</step>
    <step order="8">Add theme build verification:</step>
    <step order="9">  - Create test project with demo content</step>
    <step order="10">  - Copy each theme's src/</step>
    <step order="11">  - Run astro build</step>
    <step order="12">  - Fail if any theme doesn't build</step>
    <step order="13">Add tarball integrity check:</step>
    <step order="14">  - Extract each tarball</step>
    <step order="15">  - Verify critical files exist</step>
    <step order="16">Set up secrets: CLOUDFLARE_API_TOKEN</step>
    <step order="17">Add status badge to README.md</step>
  </steps>

  <verification>
    <check type="bash">cat .github/workflows/wardrobe-ci.yml</check>
    <check type="manual">Workflow runs on push</check>
    <check type="manual">All themes build successfully</check>
    <check type="manual">Showcase deploys on merge to main</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs showcase deployment configured" />
  </dependencies>

  <commit-message>ci(wardrobe): add CI/CD pipeline

Theme build verification for all 5 themes.
Auto-deploy showcase to Cloudflare Pages.
Tarball integrity checks.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-16" wave="3">
  <title>Brand voice and copy review</title>
  <requirement>REQ-026: All copy uses Steve Jobs voice - confident friend, zero jargon</requirement>
  <description>
    Comprehensive copy review across all Wardrobe assets.
    Per Decisions: Copy style is Steve's — human, confident, no jargon.
    Per Maya Angelou: Specific revisions required.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/showcase/index.html" reason="Showcase copy" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/README.md" reason="README copy" />
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="CLI output messages" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Approved copy examples" />
  </context>

  <steps>
    <step order="1">Create COPY-AUDIT.md checklist</step>
    <step order="2">Review showcase copy:</step>
    <step order="3">  - Hero: Use approved copy from Maya Angelou review</step>
    <step order="4">  - Theme descriptions match approved taglines</step>
    <step order="5">  - No technical jargon visible</step>
    <step order="6">Review CLI output messages:</step>
    <step order="7">  - Success: "Your site is now wearing [theme-name]."</step>
    <step order="8">  - Errors: Helpful, not technical</step>
    <step order="9">  - List: Clean, readable format</step>
    <step order="10">Apply Maya Angelou revisions:</step>
    <step order="11">  - "Copy the command. Paste it. You're done before you finish your coffee."</step>
    <step order="12">  - Slate tagline revision applied</step>
    <step order="13">  - "Pick a theme. Watch your site remember what it was meant to be."</step>
    <step order="14">Remove any passive voice</step>
    <step order="15">Remove any corporate/marketing speak</step>
    <step order="16">Document voice guidelines for future copy</step>
  </steps>

  <verification>
    <check type="bash">cat COPY-AUDIT.md</check>
    <check type="manual">Approved taglines used for all 5 themes</check>
    <check type="manual">Maya Angelou revisions applied</check>
    <check type="manual">No passive voice</check>
    <check type="manual">No jargon</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Needs showcase content" />
    <depends-on task-id="phase-1-task-13" reason="Needs README content" />
  </dependencies>

  <commit-message>docs(wardrobe): complete brand voice audit

Maya Angelou revisions applied.
All taglines match approved copy.
Zero jargon, zero passive voice.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Launch: Verification, Sara Blakely Review

Four tasks for final verification and customer gut-check.

```xml
<task-plan id="phase-1-task-17" wave="4">
  <title>Performance benchmarks and sub-3-second verification</title>
  <requirement>REQ-008, REQ-049: Install completes in under 3 seconds</requirement>
  <description>
    Verify sub-3-second install target is met.
    Benchmark all 5 themes from production URLs.
    Document actual performance metrics.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/cli/commands/install.ts" reason="Install timing code" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="3-second target (Elon)" />
  </context>

  <steps>
    <step order="1">Create scripts/benchmark-install.ts</step>
    <step order="2">Measure install time for each theme (5 runs each)</step>
    <step order="3">Record: download time, extraction time, swap time, total time</step>
    <step order="4">Test from multiple locations if possible</step>
    <step order="5">Document results in PERFORMANCE.md:</step>
    <step order="6">  - Average install time per theme</step>
    <step order="7">  - P95 install time</step>
    <step order="8">  - Breakdown by phase</step>
    <step order="9">Verify all themes install in &lt; 3 seconds</step>
    <step order="10">If any exceed target:</step>
    <step order="11">  - Identify bottleneck</step>
    <step order="12">  - Optimize (smaller tarballs, better compression)</step>
    <step order="13">  - Re-benchmark</step>
    <step order="14">Add benchmark to CI pipeline (optional)</step>
    <step order="15">Document network conditions for benchmarks</step>
  </steps>

  <verification>
    <check type="bash">npm run benchmark</check>
    <check type="manual">All themes install in &lt; 3 seconds</check>
    <check type="manual">PERFORMANCE.md documents results</check>
    <check type="manual">No regressions from baseline</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-14" reason="Needs published npm package" />
    <depends-on task-id="phase-1-task-5" reason="Needs production R2 URLs" />
  </dependencies>

  <commit-message>test(wardrobe): verify sub-3-second install target

Benchmark all 5 themes from production.
Document: average time, P95, breakdown by phase.
All themes verified under 3 seconds.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-18" wave="4">
  <title>Launch readiness checklist</title>
  <requirement>Board conditions and launch verification</requirement>
  <description>
    Verify all board blockers and requirements met.
    Final checklist before board re-review.
    Document any remaining issues.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="All requirements" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Board conditions" />
  </context>

  <steps>
    <step order="1">Create LAUNCH-CHECKLIST.md</step>
    <step order="2">Verify Board Blockers:</step>
    <step order="3">  - [ ] Showcase website deployed and accessible</step>
    <step order="4">  - [ ] Analytics instrumented and receiving data</step>
    <step order="5">  - [ ] 3+ Coming Soon themes visible</step>
    <step order="6">Verify P1 Requirements:</step>
    <step order="7">  - [ ] All 5 themes installable</step>
    <step order="8">  - [ ] Install &lt; 3 seconds verified</step>
    <step order="9">  - [ ] CLI published to npm</step>
    <step order="10">  - [ ] Registry on CDN with real URLs</step>
    <step order="11">  - [ ] Screenshots are actual theme renders</step>
    <step order="12">Verify Decisions Compliance:</step>
    <step order="13">  - [ ] Product name is "Wardrobe"</step>
    <step order="14">  - [ ] Brand voice is human/confident</step>
    <step order="15">  - [ ] No live preview (V1)</step>
    <step order="16">  - [ ] Static architecture</step>
    <step order="17">Test end-to-end flow:</step>
    <step order="18">  - Visit showcase</step>
    <step order="19">  - Copy install command</step>
    <step order="20">  - Run npx wardrobe install ember</step>
    <step order="21">  - Verify theme installed</step>
    <step order="22">Document any known issues</step>
    <step order="23">Request stakeholder sign-off</step>
  </steps>

  <verification>
    <check type="bash">cat LAUNCH-CHECKLIST.md</check>
    <check type="manual">All board blockers verified</check>
    <check type="manual">End-to-end flow works</check>
    <check type="manual">Stakeholder sign-off obtained</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-17" reason="Needs performance verification" />
    <depends-on task-id="phase-1-task-16" reason="Needs copy audit complete" />
  </dependencies>

  <commit-message>docs(wardrobe): add launch readiness checklist

All board blockers verified.
End-to-end flow tested.
Ready for board re-review.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-19" wave="4">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    "Would a real customer pay for this? What feels like engineering vanity?"
    Gut-check from real user perspective.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This phase plan" />
    <file path="/home/agent/shipyard-ai/prds/emdash-marketplace.md" reason="Original PRD" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Build decisions" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely (growth-mindset entrepreneur)</step>
    <step order="2">Prompt: Read phase plan and deployed showcase</step>
    <step order="3">Answer: Would an Emdash user actually use Wardrobe?</step>
    <step order="4">Answer: What would make them say "shut up and take my money"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. customer value?</step>
    <step order="6">Answer: Are the themes differentiated enough?</step>
    <step order="7">Answer: Does the showcase convey the value proposition clearly?</step>
    <step order="8">Answer: Is the "instant dignity" promise delivered?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps before board re-review</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-18" reason="Review after launch checklist" />
  </dependencies>

  <commit-message>docs(wardrobe): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would users choose Wardrobe over building their own?
Engineering vanity vs. customer value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-20" wave="4">
  <title>Board re-review preparation</title>
  <requirement>Prepare for board re-review in 3 weeks</requirement>
  <description>
    Compile all deliverables and metrics for board re-review.
    Document what was built, what changed, what's still pending.
    Prepare presentation for Buffett and Rhimes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md" reason="Original verdict and conditions" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements status" />
    <file path="/home/agent/shipyard-ai/.planning/sara-blakely-review.md" reason="Customer gut-check" />
  </context>

  <steps>
    <step order="1">Create BOARD-RESUBMISSION.md</step>
    <step order="2">Document completed blockers:</step>
    <step order="3">  - Showcase website: [URL]</step>
    <step order="4">  - Analytics: [metrics from dashboard]</step>
    <step order="5">  - Coming Soon themes: [list]</step>
    <step order="6">Document key metrics:</step>
    <step order="7">  - Install count since deployment</step>
    <step order="8">  - Theme popularity ranking</step>
    <step order="9">  - Email signups</step>
    <step order="10">Document what's still pending:</step>
    <step order="11">  - Pricing page (P2)</step>
    <step order="12">  - Theme submission form (P2)</step>
    <step order="13">Address Buffett's concerns:</step>
    <step order="14">  - Unit economics (free themes, adoption focus)</step>
    <step order="15">  - Premium themes Q3 2026 roadmap</step>
    <step order="16">Address Rhimes' concerns:</step>
    <step order="17">  - Discovery path (showcase + SEO)</step>
    <step order="18">  - Retention hooks (Coming Soon + email)</step>
    <step order="19">Include Sara Blakely feedback</step>
    <step order="20">Request new board score</step>
  </steps>

  <verification>
    <check type="bash">cat BOARD-RESUBMISSION.md</check>
    <check type="manual">All blockers documented as complete</check>
    <check type="manual">Metrics included</check>
    <check type="manual">Pending items acknowledged</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-19" reason="Needs Sara Blakely feedback" />
    <depends-on task-id="phase-1-task-18" reason="Needs launch checklist" />
  </dependencies>

  <commit-message>docs(wardrobe): prepare board re-review submission

All blockers completed and documented.
Metrics: installs, theme popularity, email signups.
Ready for Buffett/Rhimes re-review.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 4 | Foundation: Deploy showcase, SEO, mobile, R2 bucket | 4 parallel |
| 2 | 7 | Core Features: Registry, Coming Soon, screenshots, analytics, email | 7 parallel (after Wave 1) |
| 3 | 5 | Polish: Dashboard, README, npm publish, CI/CD, copy | 5 parallel (after Wave 2) |
| 4 | 4 | Launch: Benchmarks, checklist, Sara review, board prep | Sequential (after Wave 3) |

**Total Tasks:** 20
**Maximum Parallelism:** Wave 2 (7 concurrent tasks)
**Timeline:** 3 weeks (board re-review deadline)

---

## Dependencies Diagram

```
Wave 1:  [task-1: Deploy]     ─────────────────────────────────────────────────>
         [task-2: SEO]        ─────────────────────────────────────────────────>
         [task-3: Mobile]     ─────────────────────────────────────────────────>
         [task-4: R2 Bucket]  ─────────────────────────────────────────────────>

Wave 2:  [task-5: Registry]   ───> (depends on task-4) ────────────────────────>
         [task-6: Coming Soon] ─────────────────────────────────────────────────>
         [task-7: CS Showcase] ───> (depends on task-6) ────────────────────────>
         [task-8: Screenshots] ─────────────────────────────────────────────────>
         [task-9: Email Form] ──────────────────────────────────────────────────>
         [task-10: Analytics] ──────────────────────────────────────────────────>
         [task-11: Telemetry] ───> (depends on task-10) ────────────────────────>

Wave 3:  [task-12: Dashboard]  ───> (depends on task-10,11) ────────────────────>
         [task-13: README]     ─────────────────────────────────────────────────>
         [task-14: npm publish] ───> (depends on task-5,11) ────────────────────>
         [task-15: CI/CD]      ───> (depends on task-1) ────────────────────────>
         [task-16: Copy]       ───> (depends on task-7,13) ─────────────────────>

Wave 4:  [task-17: Benchmarks] ───> (depends on task-14,5) ─────────────────────>
         [task-18: Checklist]  ───> (depends on task-17,16) ────────────────────>
         [task-19: Sara]       ───> (depends on task-18) ───────────────────────>
         [task-20: Board]      ───> (depends on task-19,18) ────────────────────>
```

---

## Risk Notes

### Critical (Address Before Wave 1)

1. **R2 Bucket Access** — Cloudflare credentials required
   - API token with R2 write scope
   - Account ID for bucket URL
   - Test upload before batch deployment

2. **npm Package Name** — "wardrobe" may be taken
   - Run `npm view wardrobe` first
   - Fallback: @wardrobe/cli or wardrobe-themes
   - Reserve immediately if available

3. **Cloudflare Pages** — Deployment setup
   - Project creation
   - API token with Pages deploy scope
   - Verify deployment works

### High (Monitor During Execution)

4. **Screenshot Generation** — Playwright setup
   - Requires working Astro build for each theme
   - Demo content must be created
   - May need debugging for 5 themes

5. **Analytics Worker** — D1 database setup
   - D1 in beta (verify stability)
   - Schema creation
   - Rate limiting configuration

6. **Sub-3-Second Target** — Network dependency
   - Benchmark from multiple locations
   - CDN caching must be configured
   - Tarball sizes already good (~5KB)

### Medium (Acceptable Risk)

7. **Email Capture** — Requires Worker
   - Simple implementation
   - Could use third-party (Mailchimp) if needed
   - Not blocking for MVP

8. **Theme Build Verification** — CI complexity
   - Each theme needs test with Emdash
   - May require mock database
   - Can be simplified if needed

---

## Blocking Issues

### Open Questions Requiring Resolution

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | npm package name availability | Engineering | Before Wave 3 |
| 2 | R2 bucket credentials | Infrastructure | Before Wave 1 |
| 3 | Cloudflare Pages project name | Infrastructure | Before Wave 1 |
| 4 | Analytics D1 database provisioning | Infrastructure | Before Wave 2 |
| 5 | Emdash core integration spec | Emdash team | Post-Phase 1 |

---

## Verification Checklist

- [x] All board blockers have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] Decisions compliance verified (Wardrobe name, static architecture, etc.)
- [x] Cut features NOT included (live preview, user accounts, etc.)
- [x] "Instant dignity" philosophy threaded through tasks
- [x] 3-week timeline achievable with parallel execution
- [x] Ship test defined: "I can't believe I just did that"
- [x] Sara Blakely customer gut-check scheduled (task-19)
- [x] Board re-review preparation included (task-20)

---

## Ship Test

> Does the user run `npx wardrobe install ember` and feel "I can't believe I just did that"?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/emdash-marketplace/decisions.md, prds/emdash-marketplace.md*
*Project Slug: emdash-marketplace*
