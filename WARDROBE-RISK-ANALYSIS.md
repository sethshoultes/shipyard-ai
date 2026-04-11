# Risk Analysis: Wardrobe (Emdash Theme Marketplace)

**Project:** Wardrobe - Theme marketplace for Emdash CMS
**Analysis Date:** April 11, 2026
**Board Status:** PROCEED (Conditional) - 6/10 aggregate score
**Launch Target:** V1 with Tier 1 blockers

---

## Executive Summary

Wardrobe demonstrates strong technical architecture with clean separation of concerns (CLI, Workers, static showcase). However, **critical launch blockers** exist in the Board Conditions (Tier 1) that prevent release. The greatest risks lie in:

1. **Missing Board Conditions** - Screenshots/live demos must replace SVG placeholders
2. **Cloudflare Deployment Complexity** - Three independent Workers (email, analytics, showcase) with unresolved credential/namespace setup
3. **Emdash Integration Gaps** - Undefined contract between Wardrobe CLI and Emdash core
4. **Email Capture Infrastructure** - Worker deployed but not wired to showcase website

**Estimated Impact of Unresolved Risks:** 2-4 week launch delay if discovered during QA

---

## High-Risk Areas (Prioritized by Launch Impact)

### CRITICAL: Tier 1 Launch Blockers (Board-Mandated)

#### Risk #1: SVG Placeholders Instead of Real Screenshots
**Severity:** CRITICAL | **Likelihood:** CERTAIN | **Impact:** Launch Blocker

**Current State:**
- Screenshots directory contains `.svg` placeholder files only
- File paths: `/wardrobe/showcase/screenshots/{ember,forge,slate,drift,bloom}.svg`
- Size: ~1KB each (placeholder geometry, no actual theme content)
- Oprah's feedback: "People can't see themselves in placeholders"

**What's Missing:**
- Real site screenshots showing actual Emdash content rendered in each theme
- High-quality PNG/WebP images (at least 1200x800 recommended)
- GIF animations showing before/after theme transformation (Elon's suggestion adopted)

**Dependent Tasks:**
1. Generate demo content site for each theme (5 content variations)
2. Render each theme with demo content using Playwright + headless browser
3. Verify screenshot quality and file sizes
4. Replace `.svg` with `.png` in showcase `index.html`

**Why It's High Risk:**
- Board decision states: "Add real screenshots — Replace SVG placeholders with actual site images"
- No evidence of screenshot generation script completion
- `npm run screenshots` command exists in `package.json` but implementation status unclear
- SVG placeholders will not convince users to install

**Mitigation:**
- Implement `scripts/generate-screenshots.ts` immediately
- Set up Playwright with standardized demo site template
- Create production-ready screenshot artifacts (1200x800, optimized)
- Validate all 5 screenshots render correctly before showcase deployment

---

#### Risk #2: Post-Install Reveal Not Implemented
**Severity:** CRITICAL | **Likelihood:** HIGH | **Impact:** Launch Blocker

**Current State:**
- CLI install command completes with success message: `"Your site is now wearing [theme]."`
- Success message printed but no follow-up action
- Code location: `/wardrobe/cli/commands/install.ts` (lines 197-202)

**What's Missing:**
- `npx wardrobe preview` should open browser to `http://localhost:4321` after install
- Instruction: "Installed in 2.34s. Open your browser to see the result."
- Shonda's feedback: "Show the climax, don't cut away"

**Technical Implementation:**
```typescript
// In install.ts, after success message:
if (!process.env.CI) {
  const opened = await open(`http://localhost:${devServerPort || 4321}`);
  if (opened) {
    console.log(`\nOpening browser to http://localhost:4321...`);
  }
}
```

**Why It's High Risk:**
- Emotional payload of "instant transformation" is lost if user has to manually navigate
- User might assume install failed if nothing visible happens
- Board condition: "Post-install reveal — CLI offers to open transformed site or prints clear localhost URL"

**Mitigation:**
- Add `open` package to `dependencies`
- Detect dev server port from `.astro` or Emdash config
- Implement smart browser open (skip in CI environments)
- Test across macOS, Linux, Windows

---

#### Risk #3: Email Capture Not Wired
**Severity:** CRITICAL | **Likelihood:** CERTAIN | **Impact:** Launch Blocker

**Current State:**
- Email capture Worker deployed: `/wardrobe/workers/email-capture/`
- HTML form exists in showcase: "Sign up for theme updates"
- Worker code complete with validation, rate limiting, KV storage
- **BUT**: Form submission endpoint not configured in `index.html`

**What's Missing:**
1. Form action attribute in `showcase/index.html` is not set to Worker endpoint
2. Worker endpoint URL not deployed (placeholder: `REPLACE_WITH_KV_NAMESPACE_ID`)
3. KV namespace IDs not provisioned in `wrangler.toml`
4. No confirmation message after email submission

**Cloudflare Setup Required:**
```bash
# Create two KV namespaces
wrangler kv:namespace create "wardrobe-emails"
wrangler kv:namespace create "wardrobe-rate-limits"

# Get the resulting namespace IDs and add to wrangler.toml
# Then deploy
wrangler deploy
```

**Deployment Path:**
- Current URL: None (Worker not deployed)
- Expected URL: `https://wardrobe-email-capture.{subdomain}.workers.dev/subscribe`
- Form must POST to this endpoint with `{email, source}`

**Why It's High Risk:**
- Shonda's feedback: "Promise made must be kept"
- Placeholder URLs are technical debt that breaks user trust
- Email list is retention mechanism (Coming Soon themes notification)
- Board condition: "Wire email capture before launch"

**Mitigation:**
1. Provision KV namespaces and update `wrangler.toml`
2. Deploy email-capture Worker
3. Wire form in `showcase/index.html` to live endpoint
4. Test email submission flow with real form data
5. Implement "Thanks for subscribing!" confirmation message
6. Verify emails stored in KV

---

#### Risk #4: Anonymous Install Telemetry Not Verified
**Severity:** MODERATE | **Likelihood:** MEDIUM | **Impact:** Launch Blocker

**Current State:**
- Telemetry endpoint: `https://wardrobe-analytics.emdash.workers.dev/track`
- Analytics Worker code complete with validation and rate limiting
- CLI sends fire-and-forget POST with: `{theme, os, timestamp, cliVersion}`
- **BUT**: Analytics Worker not deployed, endpoint returns 404

**What's Missing:**
1. Analytics Worker not deployed to Cloudflare
2. API_KEY secret not configured in `wrangler.toml`
3. KV namespace IDs not provisioned
4. No verification that telemetry reaches backend

**Cloudflare Setup Required:**
```bash
# Create KV namespace
wrangler kv:namespace create "wardrobe-analytics"
wrangler kv:namespace create "wardrobe-analytics-staging"

# Set API key secret
wrangler secret put API_KEY

# Deploy both environments
wrangler deploy --env production
wrangler deploy --env staging
```

**Why It's High Risk:**
- Buffett's feedback: "Know your users" (installs data is critical for product decisions)
- CLI sends telemetry but silently fails if endpoint down
- Non-blocking (fire-and-forget), so users won't notice, but data loss is silent
- Need baseline metrics for post-launch retrospective

**Mitigation:**
1. Deploy analytics Worker to production
2. Configure API_KEY and KV namespaces
3. Update analytics endpoint URL in `cli/commands/install.ts`
4. Test telemetry transmission (curl to `/track` endpoint)
5. Implement `/stats` endpoint for board reviews
6. Create monitoring alert if telemetry errors exceed 5%

---

### HIGH-RISK: Cloudflare Deployment Complexity

#### Risk #5: Three Independent Worker Deployments Required
**Severity:** HIGH | **Likelihood:** HIGH | **Impact:** High

**Architectural Issue:**
Wardrobe requires three separate Cloudflare Workers, each with independent deployment lifecycle:

1. **Email Capture Worker** (`/workers/email-capture/`)
   - Purpose: Subscribe emails for Coming Soon theme notifications
   - Dependencies: KV (EMAILS, RATE_LIMITS)
   - Status: Code complete, not deployed

2. **Analytics Worker** (`/workers/analytics/`)
   - Purpose: Track anonymous theme installation metrics
   - Dependencies: KV (ANALYTICS)
   - Status: Code complete, not deployed

3. **Showcase Website** (`/showcase/`)
   - Purpose: Marketing/discovery site
   - Deployed to: Cloudflare Pages (not Workers)
   - Dependencies: Static assets only
   - Status: Configured, deployment unclear

**Deployment Risk Chain:**
```
Showcase HTML/CSS/JS
    ↓
Email Form (HTML) → Email Worker (Cloudflare Workers)
    ↓
Telemetry (CLI) → Analytics Worker (Cloudflare Workers)
```

**Current Problems:**
- No unified deployment script (each Worker deployed separately)
- No deployment checklist or runbook
- Environment variables scattered across three configs
- No automated verification that all three are live
- Showcase might deploy before Workers are ready

**Why It's High Risk:**
- **Single point of failure:** If any Worker is down, features silently fail
- **Operational overhead:** Three separate `wrangler deploy` commands, three sets of credentials
- **Credential management:** Each needs separate API keys, KV namespace IDs
- **Testing gap:** Integration tests between showcase ↔ Workers missing
- **Rollback complexity:** Need to coordinate three deployments if issues occur

**Mitigation:**
1. Create unified deployment guide/checklist
2. Implement deployment verification script:
   ```bash
   # After deploying all three, verify:
   curl https://wardrobe-email-capture.*.workers.dev/health
   curl https://wardrobe-analytics.*.workers.dev/health
   curl https://wardrobe.emdash.dev/health
   ```
3. Create pre-deployment environment validation:
   - Check all KV namespaces exist
   - Check all secrets are set
   - Check CORS origins match
4. Document rollback procedure (revert order: showcase → analytics → email)
5. Set up monitoring/alerts for Worker downtime

**Code Location:**
- Email: `/wardrobe/workers/email-capture/wrangler.toml` (needs KV IDs)
- Analytics: `/wardrobe/workers/analytics/wrangler.toml` (needs KV IDs, API_KEY)
- Showcase: `/wardrobe/showcase/wrangler.toml` (incomplete, missing production routes)

---

#### Risk #6: R2 CDN Configuration Not Verified
**Severity:** HIGH | **Likelihood:** MEDIUM | **Impact:** High

**Current State:**
- Theme tarballs stored in `/dist/themes/` (built locally)
- Registry URL points to: `https://cdn.emdash.dev/themes/` (placeholder)
- Actual R2 bucket not created or configured
- Upload script exists (`npm run upload:themes`) but `.env` not populated

**What's Missing:**
1. Cloudflare R2 bucket creation: `emdash-themes`
2. R2 public access configuration
3. CDN base URL in `registry/themes.json` not pointing to actual R2
4. SHA256 hashes in registry must match uploaded tarballs
5. Install command relies on R2 URLs working

**Installation Flow Risk:**
```
CLI requests: https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz
    ↓
If R2 not set up → 404 NOT FOUND
    ↓
Install fails with cryptic "Failed to download" error
```

**Why It's High Risk:**
- **Blocking:** Install command cannot work without valid tarball URLs
- **Hard to debug:** Users see generic download error, no indication it's infrastructure
- **Silent failure:** If URLs are wrong, install silently fails
- **Per-theme blocker:** All 5 themes must be accessible

**Current File References:**
- Tarballs: `/wardrobe/dist/themes/*.tar.gz` (5 files × ~5-6KB)
- Registry: `/wardrobe/registry/themes.json` (contains URLs)
- Upload script: `/wardrobe/scripts/upload-tarballs.ts`

**Mitigation:**
1. Create R2 bucket and enable public access
2. Run `npm run upload:tarballs` to populate bucket
3. Update `registry/themes.json` with actual R2 URLs
4. Verify SHA256 hashes match uploaded files
5. Test download URLs:
   ```bash
   for theme in ember forge slate drift bloom; do
     curl -I https://pub-{ACCOUNT_ID}.r2.dev/${theme}@1.0.0.tar.gz
   done
   ```
6. Verify all 5 themes return 200 OK

---

### MODERATE-RISK: Integration Points with Emdash Core

#### Risk #7: Emdash Core Integration Contract Undefined
**Severity:** MODERATE | **Likelihood:** MEDIUM | **Impact:** Moderate

**Decision Log Uncertainty:**
From `decisions.md` (lines 264-270):
```
### 2. Emdash Core Integration
- Does Emdash core depend on Wardrobe CLI?
- Or does Emdash bundle themes directly?
- Who owns the integration code?
Decision needed from Emdash core team.
```

**Three Possible Integration Models:**

**Option A: Theme Distribution via Emdash Create (Recommended)**
```bash
npx emdash create --theme ember
# Emdash core directly uses wardrobe registry to fetch theme
```
- Wardrobe is discovery/marketplace
- Emdash core owns download logic
- Risk: Requires change to `@emdash-cms/create-astro`

**Option B: Standalone Wardrobe CLI (Current Assumption)**
```bash
npx emdash create  # Creates default blank site
npx wardrobe install ember  # Then swap theme
```
- User runs two commands
- Wardrobe is independent tool
- Risk: Two CLI tools, confusing UX

**Option C: Wardrobe Embedded in Emdash (Tightest Coupling)**
```bash
npx emdash create --theme ember
# Creates site with theme already applied
```
- Single command experience
- Wardrobe becomes internal Emdash feature
- Risk: High coupling, version conflicts

**Current Code Assumption:**
The CLI appears built for **Option B** (standalone):
- `wardrobe list` → fetch themes
- `wardrobe install [theme]` → swap `src/`
- Standalone npm package with `bin: wardrobe`

**Why It's High Risk:**
- **Version alignment:** If Emdash ships theme versions that don't match Wardrobe versions, install fails
- **Breaking changes:** If Emdash changes `src/` structure, all themes break
- **Discovery confusion:** Users might not know about Wardrobe if only Emdash is promoted
- **Maintenance:** Who updates themes when Emdash core changes?

**Critical Questions Not Answered:**
1. Does Emdash core version lock depend on Wardrobe version?
2. If Emdash updates `src/` structure, how are themes versioned?
3. What happens if user installs theme with older Emdash core (incompatible)?
4. Does `emdash create --theme [name]` exist, or is it `wardrobe install`?

**Mitigation:**
1. Define clear integration contract in writing
2. Document theme compatibility matrix (Emdash version ↔ Theme version)
3. Implement version check in install command:
   ```typescript
   const emdashVersion = readPackageJson().version;
   if (!isCompatible(themeVersion, emdashVersion)) {
     throw new Error(`Theme ${theme} requires Emdash ${minVersion}+`);
   }
   ```
4. Create e2e test: `emdash create` → works locally → can switch themes
5. Update Emdash documentation to mention Wardrobe

**Code Location:**
- CLI doesn't validate Emdash version: `/wardrobe/cli/commands/install.ts` (line 130-140)
- No version constraint in `registry/themes.json`

---

#### Risk #8: Theme `src/` Directory Contract Not Formalized
**Severity:** MODERATE | **Likelihood:** HIGH | **Impact:** Moderate

**Current Validation:**
In `/wardrobe/cli/commands/install.ts` (lines 180-189):
```typescript
const hasRequiredFiles = await checkCriticalFiles(extractedSrcPath);
if (!hasRequiredFiles) {
  throw new Error(
    'Theme is missing required files: live.config.ts or pages/index.astro'
  );
}
```

**Only two files checked:**
1. `live.config.ts`
2. `pages/index.astro`

**Questions Unanswered:**
1. What if theme is missing `src/layouts/`? Will it work?
2. Must theme have `astro.config.mjs`? (Currently not checked)
3. What about component dependencies? (e.g., theme imports `@emdash-cms/ui`)
4. Can theme have custom dependencies in `package.json`?
5. Are there breaking changes between theme versions?

**Risk Scenarios:**
- Theme extracted successfully but has missing components → Build fails on user's machine
- Theme uses newer Emdash API that older versions don't support → Runtime error
- User swaps theme but database schema incompatible → Data loss

**Why It's High Risk:**
- **Silent failures:** Backup exists, but user doesn't know why build fails
- **No recovery path:** User has old theme in `src.backup/`, current `src/` broken
- **No compatibility matrix:** Which themes work with which Emdash versions?

**Required Contract Definition:**
```markdown
# Wardrobe Theme Contract

## Required Files
- src/live.config.ts (Emdash loader configuration)
- src/pages/index.astro (Homepage)
- src/layouts/Base.astro (Base layout)

## Must Support
- Emdash Collections API (getEmDashCollection, getEmDashEntry)
- PortableText rendering
- Astro 4.x

## Incompatible Changes
- If Emdash Collection schema changes, theme version must be bumped
- If Portable Text format changes, theme must be tested
```

**Mitigation:**
1. Create `THEME_CONTRACT.md` documenting requirements
2. Expand `checkCriticalFiles()` to validate:
   - `src/pages/` exists and has at least one route
   - `src/layouts/` exists
   - `src/components/` exists
3. Add theme validation script (run before tarball generation):
   ```bash
   npm run validate-theme -- [theme-name]
   ```
4. Document breaking changes in CHANGELOG
5. Implement version pinning in registry:
   ```json
   {
     "name": "ember",
     "version": "1.0.0",
     "compatibleEmdash": "^1.0.0",
     "breakingChanges": ["Portable Text format v2"]
   }
   ```

---

### MODERATE-RISK: Five Themes in One Session (Overreach)

#### Risk #9: Theme Build and Testing Incomplete
**Severity:** MODERATE | **Likelihood:** MEDIUM | **Impact:** Moderate

**Current Status:**
- All 5 themes implemented: Ember, Forge, Slate, Drift, Bloom
- Each has `src/` directory with layouts, components, styles
- No evidence of build verification or testing
- No automated tests that themes build correctly

**Decision Log Concern:**
From `decisions.md` (lines 49):
```
Risk register documented 5 themes as high-likelihood overreach.
Mitigation: Phase rollout (ship Ember, Forge, Slate first; add Drift and Bloom in follow-up).
Note: The mitigation was documented but not followed.
Marcus Aurelius flagged this in retrospective.
```

**Why It's High Risk:**
- **Complexity:** 5 themes × 3 commands (list, install, preview) = 15 interaction paths to test
- **Asset generation:** 5 screenshot sets to generate and verify
- **QA time:** Each theme needs visual regression testing
- **Unknown issues:** If one theme breaks during integration testing, whole launch slips

**Testing Gap:**
- No automated tests that each theme:
  - Extracts without errors
  - Has required files
  - Builds successfully (`npm run build`)
  - Renders without errors
- No CI step verifying tarball integrity
- Manual testing only

**Mitigation:**
1. Create theme validation test:
   ```bash
   # For each theme, test:
   tar -xzf dist/themes/[theme]@1.0.0.tar.gz
   npm install
   npm run build  # Must not error
   ```
2. Add to CI pipeline (`.github/workflows/ci.yml`):
   ```yaml
   - name: Build each theme
     run: |
       for theme in ember forge slate drift bloom; do
         echo "Building $theme..."
         npm run test:build -- $theme
       done
   ```
3. Create rollback plan: Ship only Ember, Forge, Slate first
4. Have Drift and Bloom ready for immediate follow-up patch

---

## Dependency Risk Matrix

| Dependency | Status | Risk |
|-----------|--------|------|
| **CLI Dependencies** |
| `commander` (13.1.0) | ✓ Current | Low |
| `tar` (7.5.13) | ✓ Current | Low |
| **DevDependencies** |
| `playwright` (1.48.0) | ⚠️ Used for screenshots | Medium (not verified) |
| `sharp` (0.33.0) | ⚠️ Image processing | Medium (not verified) |
| **Cloudflare Dependencies** |
| `wrangler` | ⚠️ Required for deploy | High (user responsibility) |
| **Emdash Integration** |
| Emdash core `^1.x` | ⚠️ Implied, not explicit | High (undefined) |
| Astro `^4.x` | ⚠️ Implied in themes | High (undefined) |

---

## File and Code Risk Hot Spots

### Critical Risk Files

| File | Risk | Issue |
|------|------|-------|
| `/showcase/index.html` | CRITICAL | Email form not wired to Worker endpoint |
| `/showcase/screenshots/*.svg` | CRITICAL | Placeholders, not real screenshots |
| `/cli/commands/install.ts` | CRITICAL | No post-install browser open |
| `/workers/email-capture/wrangler.toml` | CRITICAL | KV namespace IDs not set |
| `/workers/analytics/wrangler.toml` | CRITICAL | KV namespace IDs and API_KEY not set |
| `/registry/themes.json` | HIGH | CDN URLs may not resolve (R2 not configured) |
| `/cli/commands/install.ts` (line 130-140) | HIGH | No Emdash version compatibility check |
| `/scripts/generate-screenshots.ts` | HIGH | Unclear if implementation complete |
| `/showcase/wrangler.toml` | MODERATE | Production routes not configured |
| `/cli/utils/download.ts` | MODERATE | No retry logic on failed download |

---

## Board Conditions Tracking

### Tier 1: Required for Launch (This Sprint)

| # | Condition | Status | Risk Level |
|---|-----------|--------|------------|
| 1 | **Deploy live demo sites** | ❌ NOT DONE | CRITICAL |
| 2 | **Add real screenshots** | ❌ NOT DONE (SVG placeholders exist) | CRITICAL |
| 3 | **Post-install reveal** | ❌ NOT DONE | CRITICAL |
| 4 | **Wire email capture** | ❌ Code done, Worker not deployed | CRITICAL |
| 5 | **Anonymous install telemetry** | ❌ Analytics Worker not deployed | MODERATE |

**Current Progress:** 0% complete
**Days Until Re-Review:** 14 days
**Timeline Risk:** VERY HIGH - All 5 items required before any launch

### Tier 2: Required Before Paid Themes (Next Sprint)

| # | Condition | Status | Risk Level |
|---|-----------|--------|------------|
| 6 | **Build pricing rails** | ❌ NOT DONE | N/A (future) |
| 7 | **Theme creator guidelines** | ❌ NOT DONE | N/A (future) |
| 8 | **Post-install engagement email** | ❌ NOT DONE | N/A (future) |
| 9 | **User content preview** | ❌ NOT DONE (Jensen's priority) | N/A (future) |

---

## Prioritized Risk Mitigation Plan

### PHASE 1: Pre-Launch Showstoppers (Weeks 1-2)

**Must Complete Before Any Launch:**

1. **Replace SVG screenshots with real images** (3-4 days)
   - Generate demo sites for each theme
   - Run Playwright screenshot automation
   - Verify image quality and file sizes
   - Update `index.html` to reference PNG files

2. **Deploy email-capture Worker** (1 day)
   - Create KV namespaces (EMAILS, RATE_LIMITS)
   - Populate `wrangler.toml` with namespace IDs
   - Deploy with `wrangler deploy`
   - Wire form action in `index.html` to live endpoint
   - Test email submission

3. **Implement post-install reveal** (1 day)
   - Add `open` package to dependencies
   - Detect dev server port
   - Implement browser launch on successful install
   - Test across macOS, Linux, Windows

4. **Deploy analytics Worker** (1 day)
   - Create KV namespaces (ANALYTICS, production + staging)
   - Set API_KEY secret
   - Deploy with `wrangler deploy --env production`
   - Update CLI endpoint URL
   - Test telemetry transmission

5. **Verify R2 CDN configuration** (1-2 days)
   - Create R2 bucket (emdash-themes)
   - Enable public access
   - Upload all tarballs
   - Update registry with real R2 URLs
   - Test all download URLs return 200 OK

**Owner:** Engineering Lead
**Exit Criteria:** All 5 Tier 1 blockers complete, board can re-review

---

### PHASE 2: Integration Risk Mitigation (Week 2)

1. **Define Emdash integration contract** (1 day)
   - Document integration model (A/B/C decision)
   - Define version compatibility matrix
   - Document theme update process
   - Share with Emdash core team for alignment

2. **Formalize theme `src/` contract** (1 day)
   - Create THEME_CONTRACT.md
   - Expand tarball validation
   - Add version pinning to registry
   - Create theme validation test suite

3. **Add theme build verification to CI** (1 day)
   - Add theme build test to `.github/workflows/ci.yml`
   - Verify each theme builds successfully
   - Add tarball integrity verification
   - Test theme extraction and build

4. **Create deployment runbook** (1 day)
   - Unified deployment checklist
   - Environment validation script
   - Rollback procedure
   - Monitoring/alert setup

**Owner:** Tech Lead
**Exit Criteria:** All integration gaps documented, team has clear deployment procedure

---

### PHASE 3: Testing and Polish (Week 3)

1. **End-to-end testing** (2-3 days)
   - Test full flow: `wardrobe list` → `wardrobe install` → browser opens → theme applied
   - Test on macOS, Linux, Windows
   - Test with different Emdash versions
   - Test email signup flow
   - Test telemetry transmission

2. **Performance verification** (1 day)
   - Measure install time (target: <3 seconds)
   - Verify download speeds (test from different regions)
   - Check screenshot load times on showcase
   - Verify Worker response times (<100ms)

3. **Accessibility audit** (1 day)
   - WCAG 2.1 AA compliance on showcase
   - Keyboard navigation testing
   - Screen reader testing (NVDA, VoiceOver)
   - Color contrast verification

4. **Board condition final verification** (1 day)
   - Verify all 5 Tier 1 conditions met
   - Prepare for board re-review
   - Document any trade-offs

**Owner:** QA + Product Lead
**Exit Criteria:** All tests pass, board conditions verified, ready for launch

---

## Recommended Actions Checklist

### Immediate (This Sprint)

- [ ] Create Cloudflare R2 bucket and enable public access
- [ ] Generate real theme screenshots (replace SVGs)
- [ ] Deploy email-capture Worker with populated KV namespaces
- [ ] Wire email form to live Worker endpoint
- [ ] Deploy analytics Worker with API_KEY secret
- [ ] Add post-install browser launch to CLI
- [ ] Update registry with real R2 URLs
- [ ] Test all 5 Tier 1 conditions end-to-end

### Before Re-Review (Week 2)

- [ ] Define Emdash integration model (A/B/C decision from core team)
- [ ] Document theme `src/` contract and version compatibility
- [ ] Create unified deployment runbook
- [ ] Add theme build validation to CI
- [ ] Verify all three Workers deployed and functional
- [ ] Create deployment checklist and monitoring

### Before General Availability

- [ ] Complete end-to-end testing (all platforms)
- [ ] Verify <3 second install time
- [ ] WCAG 2.1 AA accessibility audit
- [ ] Load test showcase website (1000+ concurrent users)
- [ ] Prepare launch announcement
- [ ] Train support team on troubleshooting

---

## Risk Assessment Summary

### By Severity

**CRITICAL (Launch Blockers):**
1. SVG placeholders instead of real screenshots
2. Post-install reveal not implemented
3. Email capture Worker not deployed
4. Telemetry Worker not deployed
5. R2 CDN not configured

**HIGH (Major Issues):**
6. Three-Worker deployment complexity
7. Emdash integration contract undefined
8. Theme version compatibility not formalized

**MODERATE (Should Fix):**
9. Five themes in one session (overreach)
10. Theme build testing incomplete

### By Likelihood of Causing Launch Delay

**CERTAIN (Will delay if not fixed):**
- SVG screenshots → Users won't install
- Email capture not wired → Users can't signup
- R2 CDN not working → Install fails
- Workers not deployed → Telemetry/email fail silently

**HIGH (Likely to cause delay):**
- Post-install reveal missing → User confusion
- Analytics not working → No baseline metrics
- Three-Worker deployment → Coordination issues

**MEDIUM (Might cause delay):**
- Integration contract undefined → Emdash might need changes
- Version compatibility → Users get incompatible themes
- Five themes → QA discovers bugs in themes 4-5

---

## Conclusion

Wardrobe has **strong architectural foundations** with clean code separation and solid CLI implementation. However, it is **NOT READY FOR LAUNCH** in its current state due to five critical Tier 1 blockers:

1. **Screenshots** - Must replace SVG placeholders with real images
2. **Post-install reveal** - Browser must open showing transformed site
3. **Email capture** - Worker must be deployed and wired
4. **Telemetry** - Analytics Worker must collect baseline metrics
5. **R2 CDN** - Tarball URLs must resolve and download successfully

**Estimated effort to resolve:** 1-2 weeks if focused
**Current risk level:** VERY HIGH - Launch will fail without these fixes
**Board re-review target:** End of Week 2 (April 25)

The team should **focus first on the five Tier 1 blockers**, then address integration risks with Emdash core. Once the blockers are complete, the product has potential for strong market fit (Oprah's 8/10 score).

---

**Generated by:** Risk Analysis Team
**Next Review:** April 18, 2026 (Mid-sprint checkpoint)
**Final Re-Review:** April 25, 2026 (Board decision)
