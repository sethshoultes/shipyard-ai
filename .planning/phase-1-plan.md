# Phase 1 Plan — ReviewPulse v1 MVP Fix & Refactor

**Generated:** 2026-04-13
**Project Slug:** github-issue-sethshoultes-shipyard-ai-32
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 12
**Waves:** 4

---

## The Essence

From decisions.md:

> **North Star:** Letting small business owners sleep at night by turning customer voices into peace of mind.

> **Perfection point:** The first 30 seconds — Connect. See. Done.

> **Creative direction:** Invisible. Warm. Immediate.

---

## Problem Statement

ReviewPulse plugin exists at 2,051 lines but has never been tested against real Emdash CMS. The PRD documents:
- **72 `throw new Response()` patterns** (banned by Emdash plugin system)
- **17 `rc.user` references** (incorrect context access)
- **1 `rc.pathParams` reference** (incorrect route parameter access)
- **Feature bloat**: v1 ships only core features, not Wave 3 additions

The fix requires: removing banned patterns, cutting features deferred to v2, and ensuring Emdash design system compliance.

**Technical Reference:** docs/EMDASH-GUIDE.md Section 6 (Plugin System) defines correct patterns:
- Route handlers return objects, not throw Response
- `ctx.kv.get<T>(key)` for KV access
- `ctx.log.{info|warn|error}(msg)` for logging
- Block Kit for sandboxed admin UI

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-FIX-001: Eliminate `throw new Response()` | phase-1-task-1 | 1 |
| REQ-FIX-002: Correct `rc.user` access | phase-1-task-2 | 1 |
| REQ-FIX-003: Correct `rc.pathParams` access | phase-1-task-2 | 1 |
| REQ-CUT-001: Remove response templates | phase-1-task-3 | 1 |
| REQ-CUT-002: Remove email campaigns | phase-1-task-3 | 1 |
| REQ-CUT-004: Remove AI response suggestions | phase-1-task-3 | 1 |
| REQ-CUT-006: Remove notification emails | phase-1-task-3 | 1 |
| REQ-SYNC-001: Google OAuth flow | phase-1-task-4 | 2 |
| REQ-SYNC-002: Google Places API | phase-1-task-4 | 2 |
| REQ-SYNC-003: Yelp API integration | phase-1-task-5 | 2 |
| REQ-ADMIN-001: Dashboard overview | phase-1-task-6 | 2 |
| REQ-ADMIN-004: Featured toggle | phase-1-task-6 | 2 |
| REQ-ADMIN-005: Flagged toggle | phase-1-task-6 | 2 |
| REQ-UI-001: Widget display | phase-1-task-7 | 2 |
| REQ-UI-002: Schema markup | phase-1-task-7 | 2 |
| REQ-FIX-004: Emdash design system | phase-1-task-8 | 3 |
| REQ-FIX-005: Mock data testing | phase-1-task-9 | 3 |
| REQ-UI-005: Human-first copy | phase-1-task-10 | 3 |
| Build verification | phase-1-task-11 | 4 |
| Commit & document | phase-1-task-12 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Code Cleanup

These tasks remove banned patterns and cut deferred features. Can run in parallel.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Remove all throw new Response() patterns</title>
  <requirement>REQ-FIX-001</requirement>
  <description>
    Replace all instances of `throw new Response()` with proper Emdash error handling.
    Per EMDASH-GUIDE.md Section 6: route handlers should return objects, not throw Response.
    Error pattern: throw new Error("message") which framework converts to error response.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="Main plugin file - contains all route handlers" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin System - correct error handling pattern" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-FIX-001 specification" />
  </context>

  <steps>
    <step order="1">Read sandbox-entry.ts to locate all throw new Response() instances</step>
    <step order="2">Grep for pattern: throw new Response</step>
    <step order="3">For each instance, replace with: throw new Error("descriptive message")</step>
    <step order="4">Verify error catch blocks don't re-throw Response objects incorrectly</step>
    <step order="5">Pattern to follow (from existing code):
      if (error instanceof Response) throw error; // REMOVE THIS
      ctx.log.error(`Context: ${String(error)}`);
      throw new Error("User-friendly message"); // KEEP THIS</step>
    <step order="6">Remove all `if (error instanceof Response) throw error;` checks</step>
    <step order="7">Ensure all routes return objects on success, throw Error on failure</step>
  </steps>

  <verification>
    <check type="test">grep -r "throw new Response" plugins/reviewpulse/src/ returns 0 results</check>
    <check type="test">grep -c "throw new Error" plugins/reviewpulse/src/sandbox-entry.ts shows expected count</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(reviewpulse): replace throw Response with throw Error per Emdash plugin spec</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Correct rc.user and rc.pathParams context access</title>
  <requirement>REQ-FIX-002, REQ-FIX-003</requirement>
  <description>
    Replace all `rc.user` and `rc.pathParams` references with correct Emdash context access.
    Per EMDASH-GUIDE.md Section 6: use ctx (PluginContext) for authenticated operations,
    and rc.input for route parameters.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="Contains rc.user and rc.pathParams references" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin Context APIs" />
  </context>

  <steps>
    <step order="1">Grep for all `rc.user` references in sandbox-entry.ts</step>
    <step order="2">Grep for all `rc.pathParams` references in sandbox-entry.ts</step>
    <step order="3">Based on risk scan: line 537 has pathParams access that needs fixing</step>
    <step order="4">Replace rc.pathParams with rc.input pattern:
      BEFORE: const pathParams = rc.input as Record<string, string> | undefined;
      AFTER: const input = (rc.input ?? {}) as Record<string, unknown>;</step>
    <step order="5">Access route parameters consistently via input object</step>
    <step order="6">Remove any direct user context checks (admin auth handled by framework)</step>
    <step order="7">Verify routes marked as `public: true` don't require user context</step>
  </steps>

  <verification>
    <check type="test">grep -r "rc.user" plugins/reviewpulse/src/ returns 0 results</check>
    <check type="test">grep -r "rc.pathParams" plugins/reviewpulse/src/ returns 0 results</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(reviewpulse): correct context access per Emdash plugin spec</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Remove v2 features (templates, campaigns, AI, notifications)</title>
  <requirement>REQ-CUT-001, REQ-CUT-002, REQ-CUT-004, REQ-CUT-006</requirement>
  <description>
    Remove all Wave 3 features that are explicitly OUT for v1 MVP per decisions.md:
    - Response templates (REQ-CUT-001)
    - Email campaigns (REQ-CUT-002)
    - AI response suggestions (REQ-CUT-004)
    - Notification emails (REQ-CUT-006)

    These features undermine the v1 focus: simple sync + display + admin.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="Contains all route definitions" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/email.ts" reason="Email module - may need gutting" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-32/decisions.md" reason="MVP Feature Set: what's OUT" />
  </context>

  <steps>
    <step order="1">Remove routes from sandbox-entry.ts:
      - draftResponse (AI suggestions) - lines 773-861
      - saveResponse (tied to AI) - lines 867-904
      - createTemplate - lines 914-958
      - listTemplates - lines 965-985
      - getTemplate - lines 992-1020
      - deleteTemplate - lines 1026-1053
      - applyTemplate - lines 1059-1097
      - createCampaign - lines 1108-1161
      - sendCampaign - lines 1168-1245
      - listCampaigns - lines 1251-1272</step>
    <step order="2">Remove types no longer needed:
      - ResponseTemplate interface
      - Campaign interface</step>
    <step order="3">Remove email notification calls from sync route (sendReviewNotifications)</step>
    <step order="4">Simplify email.ts or remove entirely if no longer needed</step>
    <step order="5">Remove KV keys no longer used:
      - templates:list
      - template:{id}
      - campaigns:list
      - campaign:{id}
      - settings:notifications</step>
    <step order="6">Update plugin:install hook to not initialize removed KV schemas</step>
    <step order="7">Remove Anthropic API integration (draftResponse used ctx.env.ANTHROPIC_API_KEY)</step>
    <step order="8">Keep ONLY: sync, reviews, reviewDetail, reviewUpdate, stats, widgetData, settings, health, admin pages</step>
  </steps>

  <verification>
    <check type="test">grep -r "draftResponse\|createTemplate\|createCampaign" plugins/reviewpulse/src/ returns 0</check>
    <check type="test">grep -r "ANTHROPIC_API_KEY" plugins/reviewpulse/src/ returns 0</check>
    <check type="manual">Count routes in sandbox-entry.ts — should be ~12 (down from 29)</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(reviewpulse): strip v2 features (templates, campaigns, AI) for MVP focus</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Feature Verification

After cleanup, verify core features work correctly.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Verify and fix Google sync route</title>
  <requirement>REQ-SYNC-001, REQ-SYNC-002, REQ-SYNC-005</requirement>
  <description>
    Ensure Google Places API sync route follows Emdash patterns.
    Verify error handling, environment variable access, and response format.
    Must support 30-second first-run experience.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="sync route handler" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin capabilities: network:fetch" />
  </context>

  <steps>
    <step order="1">Read sync route handler (post Wave 1 cleanup)</step>
    <step order="2">Verify Google API call uses ctx.http.fetch if sandboxed (or native fetch for trusted)</step>
    <step order="3">Add environment variable validation at start of handler:
      if (!ctx.env?.GOOGLE_PLACES_API_KEY) {
        ctx.log.warn("Google Places API key not configured");
      }</step>
    <step order="4">Verify normalizeGoogleReview() handles edge cases</step>
    <step order="5">Ensure deduplication uses source-specific key: `google|author|rating|date`</step>
    <step order="6">Verify sync returns: { imported, skipped, total, lastSyncAt }</step>
    <step order="7">Remove email notification logic (cut in task-3)</step>
  </steps>

  <verification>
    <check type="test">Mock test: sync with fake Google response imports correctly</check>
    <check type="manual">Environment variable validation logged when missing</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="throw Response patterns must be fixed" />
    <depends-on task-id="phase-1-task-3" reason="v2 features must be removed" />
  </dependencies>

  <commit-message>fix(reviewpulse): harden Google sync with env validation</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Verify and fix Yelp sync route</title>
  <requirement>REQ-SYNC-003</requirement>
  <description>
    Ensure Yelp Fusion API sync follows same patterns as Google sync.
    Verify Bearer token auth, error handling, and response normalization.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="sync route handler - Yelp section" />
  </context>

  <steps>
    <step order="1">Read Yelp sync section in sync route handler</step>
    <step order="2">Add environment variable validation:
      if (!ctx.env?.YELP_API_KEY) {
        ctx.log.warn("Yelp API key not configured");
      }</step>
    <step order="3">Verify Authorization header uses Bearer token correctly</step>
    <step order="4">Verify normalizeYelpReview() handles edge cases</step>
    <step order="5">Ensure deduplication uses source-specific key: `yelp|author|rating|date`</step>
    <step order="6">Verify graceful handling when Yelp API returns empty reviews array</step>
  </steps>

  <verification>
    <check type="test">Mock test: sync with fake Yelp response imports correctly</check>
    <check type="manual">Both Google and Yelp can be synced in single call</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="throw Response patterns must be fixed" />
    <depends-on task-id="phase-1-task-3" reason="v2 features must be removed" />
  </dependencies>

  <commit-message>fix(reviewpulse): harden Yelp sync with env validation</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Verify admin dashboard routes</title>
  <requirement>REQ-ADMIN-001, REQ-ADMIN-004, REQ-ADMIN-005</requirement>
  <description>
    Ensure admin dashboard, featured toggle, and flagged toggle work correctly.
    Verify review list pagination and filtering.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="admin routes" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/admin-ui.ts" reason="HTML rendering functions" />
  </context>

  <steps>
    <step order="1">Verify adminReviews route returns properly formatted HTML</step>
    <step order="2">Verify reviewUpdate route toggles featured/flagged correctly</step>
    <step order="3">Verify pagination parameters handled correctly</step>
    <step order="4">Verify filter parameters (rating, source, status) work</step>
    <step order="5">Verify adminStatsWidget, adminReviewCountWidget, adminRecentReviewsWidget routes</step>
    <step order="6">Verify settingsPage returns settings form HTML</step>
    <step order="7">Remove analytics routes if too complex for v1 (analyticsData, analyticsExport, adminAnalyticsPage)</step>
  </steps>

  <verification>
    <check type="test">Mock test: admin routes return expected HTML structure</check>
    <check type="manual">Featured toggle persists correctly in KV</check>
    <check type="manual">Flagged toggle persists correctly in KV</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="throw Response patterns must be fixed" />
    <depends-on task-id="phase-1-task-2" reason="context access must be fixed" />
  </dependencies>

  <commit-message>fix(reviewpulse): verify admin dashboard functionality</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Verify widget endpoint and Astro components</title>
  <requirement>REQ-UI-001, REQ-UI-002, REQ-UI-003</requirement>
  <description>
    Ensure widgetData endpoint returns correct format for frontend display.
    Verify Astro components (ReviewWidget.astro, ReviewGrid.astro) work with data.
    Verify JSON-LD schema markup for SEO.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="widgetData route" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/astro/ReviewWidget.astro" reason="Frontend widget component" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/astro/ReviewGrid.astro" reason="Grid display component" />
  </context>

  <steps>
    <step order="1">Verify widgetData route returns: { averageRating, totalCount, reviews }</step>
    <step order="2">Verify reviews array contains: author, rating, text, date, source</step>
    <step order="3">Verify featured reviews prioritized in response</step>
    <step order="4">Check ReviewWidget.astro generates valid JSON-LD schema</step>
    <step order="5">Verify mobile-responsive CSS in widget components</step>
    <step order="6">Ensure widget components use Emdash design tokens if available</step>
  </steps>

  <verification>
    <check type="test">widgetData returns valid JSON with expected structure</check>
    <check type="manual">JSON-LD validates at schema.org/review validator</check>
    <check type="manual">Widget displays correctly on mobile viewport</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="throw Response patterns must be fixed" />
  </dependencies>

  <commit-message>fix(reviewpulse): verify widget endpoint and Astro components</commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Polish & Testing

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Align admin UI with Emdash design system</title>
  <requirement>REQ-FIX-004, REQ-ADMIN-006</requirement>
  <description>
    Per decisions.md: "Use Emdash's existing design system — if it looks like Emdash, it looks right."
    Audit admin-ui.ts for custom CSS and align with Emdash patterns.
    Per EMDASH-GUIDE.md Section 6: sandboxed plugins use Block Kit for admin UI.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/admin-ui.ts" reason="Admin UI rendering with embedded CSS" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Block Kit admin UI" />
  </context>

  <steps>
    <step order="1">Read admin-ui.ts and identify custom CSS patterns</step>
    <step order="2">Identify which styles can be replaced with Emdash/Kumo components</step>
    <step order="3">Keep essential brand colors (Terracotta #C4704B, Sage #7A8B6F, Gold #D4A853)</step>
    <step order="4">Ensure buttons, inputs, tables follow Emdash conventions</step>
    <step order="5">Verify accessibility: labels, aria attributes, keyboard navigation</step>
    <step order="6">Document any deviations that are intentional for ReviewPulse brand</step>
  </steps>

  <verification>
    <check type="manual">Admin UI visually consistent with Emdash CMS</check>
    <check type="manual">All form inputs have labels</check>
    <check type="manual">Buttons are keyboard-accessible</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Admin routes must be verified" />
  </dependencies>

  <commit-message>style(reviewpulse): align admin UI with Emdash design system</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Update test suite for MVP scope</title>
  <requirement>REQ-FIX-005</requirement>
  <description>
    Update test suite to match MVP scope. Remove tests for cut features.
    Ensure all remaining routes have mock data tests.
    Per decisions.md: "Mock data testing with human QA is the pragmatic path."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/__tests__/sandbox-entry.test.ts" reason="Main test file" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Test requirements" />
  </context>

  <steps>
    <step order="1">Read existing test file</step>
    <step order="2">Remove tests for cut features:
      - draftResponse tests
      - saveResponse tests
      - template CRUD tests
      - campaign tests
      - email notification tests</step>
    <step order="3">Keep tests for:
      - sync route (Google + Yelp mocked)
      - reviews route (pagination, filters)
      - reviewUpdate route (featured, flagged)
      - stats route
      - widgetData route
      - health route
      - normalization functions
      - computeStats function</step>
    <step order="4">Ensure mock KV correctly simulates ctx.kv API</step>
    <step order="5">Ensure mock fetch correctly simulates Google/Yelp responses</step>
    <step order="6">Run tests and fix any failures</step>
  </steps>

  <verification>
    <check type="test">npm run test passes all tests</check>
    <check type="test">No tests reference removed features</check>
    <check type="manual">Coverage includes all MVP routes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="v2 features must be removed before updating tests" />
    <depends-on task-id="phase-1-task-4" reason="Sync routes must be finalized" />
    <depends-on task-id="phase-1-task-5" reason="Sync routes must be finalized" />
  </dependencies>

  <commit-message>test(reviewpulse): update test suite for MVP scope</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Audit and improve UI copy</title>
  <requirement>REQ-UI-005</requirement>
  <description>
    Per decisions.md Decision 9: "Human-first UI copy throughout"
    - "You've got 3 new reviews" not "3 reviews detected in sync cycle"
    - Professional, attentive, no jargon
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/admin-ui.ts" reason="Contains UI copy strings" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="Contains error messages and labels" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-32/decisions.md" reason="Decision 9: Brand Voice" />
  </context>

  <steps>
    <step order="1">Audit all user-facing strings in admin-ui.ts</step>
    <step order="2">Audit error messages in sandbox-entry.ts</step>
    <step order="3">Replace jargon with human language:
      - "sync cycle" → "check"
      - "imported" → "found"
      - "failed to fetch" → "couldn't reach"</step>
    <step order="4">Ensure empty states are warm and helpful, not technical</step>
    <step order="5">Verify success messages are celebratory but not excessive</step>
  </steps>

  <verification>
    <check type="manual">No technical jargon in user-facing strings</check>
    <check type="manual">Error messages are helpful and actionable</check>
    <check type="manual">Tone consistent throughout</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="UI must be finalized before copy audit" />
  </dependencies>

  <commit-message>copy(reviewpulse): humanize UI copy per brand guidelines</commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Verification & Ship

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Build verification and final QA</title>
  <requirement>All requirements</requirement>
  <description>
    Final verification before committing. Run all checks, verify scope,
    ensure no regressions. Gate before ship.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/" reason="All plugin files" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Acceptance criteria" />
  </context>

  <steps>
    <step order="1">Run TypeScript check: npx tsc --noEmit</step>
    <step order="2">Run tests: npm run test</step>
    <step order="3">Grep verification:
      - grep "throw new Response" → 0 results
      - grep "rc.user" → 0 results
      - grep "rc.pathParams" → 0 results
      - grep "draftResponse\|createTemplate\|createCampaign" → 0 results
      - grep "ANTHROPIC_API_KEY" → 0 results</step>
    <step order="4">Count lines: wc -l sandbox-entry.ts (target: ~800 lines down from 1741)</step>
    <step order="5">Review git diff for all changes</step>
    <step order="6">Verify no new files created (except this is allowed if restructuring)</step>
    <step order="7">Verify ONLY reviewpulse plugin modified (no other plugins/sites)</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit exits 0</check>
    <check type="test">npm run test exits 0</check>
    <check type="test">All grep verifications pass</check>
    <check type="manual">Git diff shows expected scope</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Pattern fixes complete" />
    <depends-on task-id="phase-1-task-2" reason="Context fixes complete" />
    <depends-on task-id="phase-1-task-3" reason="Feature cuts complete" />
    <depends-on task-id="phase-1-task-9" reason="Tests updated" />
    <depends-on task-id="phase-1-task-10" reason="Copy audited" />
  </dependencies>

  <commit-message>N/A — verification only, no commit</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Commit changes and document for human QA</title>
  <requirement>All requirements</requirement>
  <description>
    Commit all changes with semantic commit message.
    Document what needs human QA (live API testing, Bella's Bistro integration).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/" reason="All plugin files to commit" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Human QA checklist" />
  </context>

  <steps>
    <step order="1">Stage all changed files: git add plugins/reviewpulse/</step>
    <step order="2">Commit with message:
      fix(reviewpulse): v1 MVP refactor — strip v2 features, fix Emdash patterns</step>
    <step order="3">Create handoff document in .planning/:
      - List of features removed (for v2 backlog)
      - Environment variables required (GOOGLE_PLACES_API_KEY, YELP_API_KEY)
      - Human QA checklist from REQUIREMENTS.md</step>
    <step order="4">Update STATUS.md if exists</step>
    <step order="5">Do NOT push — wait for human review</step>
  </steps>

  <verification>
    <check type="test">git log --oneline -1 shows expected commit message</check>
    <check type="test">git status shows clean working tree</check>
    <check type="manual">Handoff document exists</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Verification must pass" />
  </dependencies>

  <commit-message>fix(reviewpulse): v1 MVP refactor — strip v2 features, fix Emdash patterns

- Remove response templates, email campaigns, AI suggestions (defer to v2)
- Replace throw new Response() with throw new Error() per Emdash spec
- Correct rc.user and rc.pathParams access patterns
- Update test suite for MVP scope
- Humanize UI copy per brand guidelines

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **RISK RP-001: Environment variable validation** — Mitigated by tasks 4-5 adding explicit checks
2. **RISK RP-002: External API error handling** — Partially addressed; full circuit breaker deferred to v2
3. **RISK RP-003: KV storage scalability** — Accepted for v1 (<1000 reviews); documented
4. **RISK RP-006: Admin UI XSS** — Mitigated by existing escapeHtml() functions; audited in task-8
5. **RISK RP-012: Testing gaps** — Mitigated by mock data tests; live API testing requires human QA

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 (Parallel) | 3 tasks | Code cleanup: remove banned patterns, cut v2 features |
| Wave 2 (Parallel) | 4 tasks | Core feature verification: sync, admin, widget |
| Wave 3 (Parallel) | 3 tasks | Polish: design system, tests, copy |
| Wave 4 (Sequential) | 2 tasks | Verification and commit |
| **Total** | **12 tasks** | |

**Critical Path:** Wave 1 → Wave 2 → Wave 3 → Wave 4

**Parallelization:**
- Wave 1: All 3 tasks can run in parallel
- Wave 2: All 4 tasks can run in parallel
- Wave 3: All 3 tasks can run in parallel (with dependencies)
- Wave 4: Sequential

---

## Human QA Required (Post-Execution)

Per decisions.md: "Mock data testing with human QA is the pragmatic path."

1. [ ] Live Google Places API sync with real credentials
2. [ ] Live Yelp API sync with real credentials
3. [ ] Bella's Bistro site integration test
4. [ ] First-run experience ≤30 seconds
5. [ ] Mobile responsiveness on actual devices
6. [ ] Widget display on live Emdash site

---

## Scope Lock

Per decisions.md, the following are **EXPLICITLY NOT IN v1 MVP**:

- Response templates (v2)
- Email campaigns (v2)
- Manual review creation (v2)
- AI response suggestions (v2 with "editable draft" framing)
- Sentiment analysis (never)
- Notification emails (pending resolution)
- Competitive benchmarking (focus on your customers)

**If it's not in this plan, it's out of scope.**

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2026-04-13*
