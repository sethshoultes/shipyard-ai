# Phase 1 Plan — MemberShip v1 Ship

**Generated**: April 12, 2026
**Project Slug**: finish-plugins
**Product Name**: MemberShip (Membership Plugin for EmDash)
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 12
**Waves**: 3
**Status**: READY FOR BUILD

---

## The Essence

> **What it is:** Turn visitors into members. Gate your best content. Get paid.

> **The feeling:** "I built that."

> **The one thing that must be perfect:** The first 30 seconds.

> **Creative direction:** Disappear.

---

## Build Status

**Technical MVP:** ~80% feature-complete (needs security fixes, banned pattern removal, documentation)
**Board Verdict:** PROCEED (Conditional) — 5.6/10 aggregate score
**Current State:** Code exists but critical blockers prevent ship; 0/10 gate conditions met

| Component | Lines | Status | Gap |
|-----------|-------|--------|-----|
| sandbox-entry.ts | 3,984 | Complete | 114 banned patterns, missing admin auth |
| auth.ts | 210 | Complete | Strong JWT implementation |
| email.ts | 581 | Complete | 8 warm email templates |
| gating.ts | 272 | Complete | Drip unlock logic works |
| Astro components | ~500 | Complete | Need copy review |
| Documentation | 0/4 | NOT DONE | Ship blocker |
| Production deploy | 0 | NOT DONE | Ship blocker |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-RISK-005: Remove banned patterns (114) | phase-1-task-1 | 1 |
| REQ-RISK-002: Add admin authentication | phase-1-task-2 | 1 |
| REQ-RISK-003: Secure status endpoint | phase-1-task-3 | 1 |
| REQ-RISK-004: Unify version to 1.0.0 | phase-1-task-4 | 1 |
| REQ-SHIP-004: Installation documentation | phase-1-task-5 | 2 |
| REQ-SHIP-005: Configuration documentation | phase-1-task-6 | 2 |
| REQ-SHIP-006: API reference documentation | phase-1-task-7 | 2 |
| REQ-SHIP-007: Troubleshooting documentation | phase-1-task-8 | 2 |
| REQ-SHIP-012: Brand voice audit | phase-1-task-9 | 2 |
| REQ-SHIP-001: Deploy to Sunrise Yoga | phase-1-task-10 | 3 |
| REQ-SHIP-002, REQ-SHIP-003: Production validation | phase-1-task-11 | 3 |
| Sara Blakely customer gut-check | phase-1-task-12 | 3 |

---

## Documentation References

This plan cites specific sections from the source documents:

- **decisions.md Section VI**: Risk Register (lines 296-314)
- **decisions.md Section VII**: Shipping Criteria (lines 319-331)
- **decisions.md Decision 5**: Brand voice (lines 57-67)
- **decisions.md Decision 8**: Documentation blocker (lines 88-98)
- **docs/EMDASH-GUIDE.md Section 5**: Cloudflare deployment
- **docs/EMDASH-GUIDE.md Section 6**: Plugin system, routes, ctx.storage, ctx.kv

---

## Wave Execution Order

### Wave 1 (Parallel) — Security & Code Quality Fixes

Four independent tasks fixing critical blockers. No dependencies on each other.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Remove 114 banned `throw new Response` patterns</title>
  <requirement>REQ-RISK-005: Hallucinated API Pattern (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section VI Line 303: "114 throw new Response -> EmDash API.
    Mechanical find-and-replace." The codebase uses `throw new Response()`
    instead of EmDash's standard return pattern. This is incompatible with
    the plugin sandbox and must be replaced.

    Per docs/EMDASH-GUIDE.md Section 6, plugin routes should return objects
    or use ctx.response helpers, not throw Response objects.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Contains all 114 instances (lines throughout)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin routes pattern reference" />
  </context>

  <steps>
    <step order="1">Read sandbox-entry.ts to understand the pattern structure</step>
    <step order="2">Identify the replacement pattern: return { error: "message", status: 400 } instead of throw</step>
    <step order="3">Create a systematic replacement approach - each throw new Response becomes a return statement</step>
    <step order="4">Replace error responses (status 400): return { error: "message" }</step>
    <step order="5">Replace auth failures (status 401/403): return { error: "Unauthorized" }</step>
    <step order="6">Replace not found (status 404): return { error: "Not found" }</step>
    <step order="7">Replace server errors (status 500): return { error: "Something went wrong" }</step>
    <step order="8">Apply brand voice to error messages per REQ-BRAND-005 ("Oops" not "error occurred")</step>
    <step order="9">Run TypeScript compile to verify no syntax errors: npm run build</step>
    <step order="10">Verify zero instances remain: grep -r "throw new Response" src/</step>
  </steps>

  <verification>
    <check type="bash">grep -c "throw new Response" /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts</check>
    <check type="test">Result is 0</check>
    <check type="bash">cd /home/agent/shipyard-ai/plugins/membership && npm run build</check>
    <check type="test">Build succeeds with no errors</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>fix(membership): replace 114 throw new Response with return pattern

Per decisions.md Section VI Line 303:
- Removed all throw new Response patterns
- Replaced with EmDash-compatible return { error } pattern
- Applied brand voice to error messages
- Build passes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Add admin authentication to approve/revoke endpoints</title>
  <requirement>REQ-RISK-002: Admin Authentication (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section VI Line 299 and Risk Scan findings:
    The approve (line 1240) and revoke (line 1296) endpoints are missing
    `isAdmin` authentication checks. Any unauthenticated user can currently
    approve pending members or revoke active members.

    Other admin endpoints in the codebase already implement the correct pattern
    (line 2168): if (!adminUser || !adminUser.isAdmin) { return error }
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Lines 1240-1342: approve/revoke endpoints" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin route authentication" />
  </context>

  <steps>
    <step order="1">Read sandbox-entry.ts lines 1240-1350 to understand approve/revoke structure</step>
    <step order="2">Read line 2168 area to copy the existing admin auth pattern</step>
    <step order="3">Add to approve endpoint (after line 1241): extract rc from routeCtx, check rc.user?.isAdmin</step>
    <step order="4">If not admin, return { error: "Admin access required" } with appropriate status</step>
    <step order="5">Add same check to revoke endpoint (after line 1297)</step>
    <step order="6">Add same check to mark-paid endpoint if it exists</step>
    <step order="7">Run TypeScript compile: npm run build</step>
    <step order="8">Test: verify unauthenticated request to /approve returns 401/403</step>
  </steps>

  <verification>
    <check type="bash">grep -A5 "approve:" /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts | grep -q "isAdmin"</check>
    <check type="bash">grep -A5 "revoke:" /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts | grep -q "isAdmin"</check>
    <check type="test">Both endpoints have isAdmin checks</check>
    <check type="manual">Unauthenticated POST to /membership/approve returns 401 or 403</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>fix(membership): add admin auth to approve/revoke endpoints

Per decisions.md Section VI Line 299:
- Added isAdmin check to /membership/approve
- Added isAdmin check to /membership/revoke
- Unauthenticated requests now return 403
- Follows existing admin auth pattern (line 2168)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Secure status endpoint against email enumeration</title>
  <requirement>REQ-RISK-003: Status Endpoint Privacy (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section VI Line 300 and Board feedback:
    "GET /membership/status?email=... exposes data without auth."
    Currently marked `public: true` at line 1138, returns full member info
    including Stripe customer ID, subscription ID, payment method.

    Options per board: Require auth OR remove email parameter visibility.
    Recommendation: Require JWT auth and only return status for the
    authenticated user's own email.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Lines 1138-1210: status endpoint" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/auth.ts" reason="JWT verification helpers" />
  </context>

  <steps>
    <step order="1">Read sandbox-entry.ts lines 1138-1210 to understand status endpoint</step>
    <step order="2">Read auth.ts to understand JWT verification pattern</step>
    <step order="3">Option A (recommended): Change public: true to public: false</step>
    <step order="4">Extract user from JWT token in request context</step>
    <step order="5">Only allow status check for the authenticated user's own email</step>
    <step order="6">Remove Stripe IDs from public response (stripeCustomerId, stripeSubscriptionId, stripePaymentMethod)</step>
    <step order="7">Return minimal info: { active: boolean, plan: string, expiresAt: string }</step>
    <step order="8">Run TypeScript compile: npm run build</step>
    <step order="9">Test: verify unauthenticated GET /status returns 401</step>
    <step order="10">Test: verify authenticated request only returns own status</step>
  </steps>

  <verification>
    <check type="bash">grep "status:" /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts | grep -v "public: true"</check>
    <check type="test">public: true removed from status endpoint</check>
    <check type="bash">grep -A20 "status:" /home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts | grep -v "stripeCustomerId"</check>
    <check type="test">Stripe IDs removed from response</check>
    <check type="manual">GET /membership/status without auth returns 401</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>fix(membership): secure status endpoint against email enumeration

Per decisions.md Section VI Line 300:
- Removed public: true from status endpoint
- Requires JWT authentication
- Only returns status for authenticated user's own email
- Removed Stripe IDs from response (privacy)
- Email enumeration attack now fails

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Unify version number to 1.0.0</title>
  <requirement>REQ-RISK-004: Version Inconsistency (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section VI Line 302:
    "Three different versions erode trust (README: 3.0.0, API: 1.5.0, package.json: 1.0.0)."
    Per Section VII Line 329: "Version number unified to 1.0.0."

    This is a simple find-and-replace task across documentation files.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Should already be 1.0.0" />
    <file path="/home/agent/shipyard-ai/plugins/membership/README.md" reason="Shows 3.0.0, needs fix" />
    <file path="/home/agent/shipyard-ai/plugins/membership/API.md" reason="Shows 1.5.0, needs fix" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Plugin descriptor version" />
  </context>

  <steps>
    <step order="1">Read package.json to confirm version is 1.0.0</step>
    <step order="2">Read README.md and find version string (likely "Version: 3.0.0" or "**Version:** 3.0.0")</step>
    <step order="3">Replace with 1.0.0</step>
    <step order="4">Read API.md and find version string (likely 1.5.0)</step>
    <step order="5">Replace with 1.0.0</step>
    <step order="6">Read src/index.ts and check plugin descriptor version field</step>
    <step order="7">Ensure version: "1.0.0" in plugin descriptor</step>
    <step order="8">Search for any other version references: grep -r "version" plugins/membership/</step>
    <step order="9">Fix any remaining inconsistencies</step>
  </steps>

  <verification>
    <check type="bash">grep "version" /home/agent/shipyard-ai/plugins/membership/package.json</check>
    <check type="bash">grep -i "version" /home/agent/shipyard-ai/plugins/membership/README.md</check>
    <check type="bash">grep -i "version" /home/agent/shipyard-ai/plugins/membership/API.md</check>
    <check type="test">All show 1.0.0</check>
    <check type="bash">grep -r "3\.0\.0\|1\.5\.0" /home/agent/shipyard-ai/plugins/membership/</check>
    <check type="test">Returns 0 results (no old versions remain)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>fix(membership): unify version number to 1.0.0

Per decisions.md Section VII Line 329:
- package.json: 1.0.0 (already correct)
- README.md: 3.0.0 -> 1.0.0
- API.md: 1.5.0 -> 1.0.0
- Plugin descriptor: 1.0.0
- Single source of truth established

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Documentation & Copy

Five tasks for documentation creation and brand voice audit. Depends on Wave 1 code fixes being complete.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Create installation.md documentation</title>
  <requirement>REQ-SHIP-004: Installation Documentation (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section II Lines 94-98:
    "Four docs required: Installation.md, Configuration.md, API-reference.md, Troubleshooting.md"

    Create installation guide covering:
    - Prerequisites (EmDash site, Cloudflare account, Stripe account)
    - Adding plugin to astro.config.mjs (per docs/EMDASH-GUIDE.md Section 6)
    - Running migrations
    - First-run setup wizard
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/README.md" reason="Existing overview to extract from" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin registration pattern" />
  </context>

  <steps>
    <step order="1">Create /home/agent/shipyard-ai/plugins/membership/docs/ directory if not exists</step>
    <step order="2">Read README.md for existing installation info</step>
    <step order="3">Read docs/EMDASH-GUIDE.md Section 6 for plugin registration pattern</step>
    <step order="4">Write docs/installation.md with: Prerequisites, Plugin Registration, Migrations, First Run</step>
    <step order="5">Apply brand voice: terse, confident, warm (Decision 5)</step>
    <step order="6">Include code examples for astro.config.mjs plugin array</step>
    <step order="7">Include wrangler commands for D1/R2 setup if needed</step>
    <step order="8">Review for completeness: can a new user follow this and succeed?</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/plugins/membership/docs/installation.md && echo "exists"</check>
    <check type="bash">wc -l /home/agent/shipyard-ai/plugins/membership/docs/installation.md</check>
    <check type="test">File exists and has substantial content (50+ lines)</check>
    <check type="manual">Doc covers Prerequisites, Plugin Registration, Migrations, First Run</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Code must be fixed before documenting" />
  </dependencies>

  <commit-message>docs(membership): add installation.md

Per decisions.md Decision 8:
- Prerequisites documented
- Plugin registration in astro.config.mjs
- Migration commands
- First-run setup wizard
- Brand voice: terse, confident, warm

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Create configuration.md documentation</title>
  <requirement>REQ-SHIP-005: Configuration Documentation (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section II Lines 94-98:
    Create configuration guide covering:
    - Environment variables (STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, etc.)
    - Stripe product/price setup
    - Resend email configuration
    - Plan configuration via admin UI
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/README.md" reason="Existing config info to extract" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Env var references" />
  </context>

  <steps>
    <step order="1">Read README.md and sandbox-entry.ts for all environment variables</step>
    <step order="2">Create docs/configuration.md</step>
    <step order="3">Document required env vars with descriptions</step>
    <step order="4">Document Stripe setup: products, prices, webhooks</step>
    <step order="5">Document Resend email configuration</step>
    <step order="6">Document plan configuration via admin dashboard</step>
    <step order="7">Apply brand voice per Decision 5</step>
    <step order="8">Include security notes (never commit secrets)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/plugins/membership/docs/configuration.md && echo "exists"</check>
    <check type="bash">grep -c "STRIPE" /home/agent/shipyard-ai/plugins/membership/docs/configuration.md</check>
    <check type="test">File exists and documents Stripe configuration</check>
    <check type="manual">Doc covers env vars, Stripe, Resend, plans</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Code must be fixed before documenting" />
  </dependencies>

  <commit-message>docs(membership): add configuration.md

Per decisions.md Decision 8:
- Environment variables documented
- Stripe product/price setup
- Resend email configuration
- Plan configuration via admin
- Security best practices

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Create api-reference.md documentation</title>
  <requirement>REQ-SHIP-006: API Reference Documentation (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section II Lines 94-98:
    Create API reference documenting all endpoints. Existing API.md (42KB)
    can be adapted but needs version fix and may need restructuring.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/API.md" reason="Existing API docs (version 1.5.0)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Actual endpoint definitions" />
  </context>

  <steps>
    <step order="1">Read existing API.md for structure and content</step>
    <step order="2">Verify endpoints match actual code in sandbox-entry.ts</step>
    <step order="3">Create docs/api-reference.md (or rename/move API.md)</step>
    <step order="4">Update version to 1.0.0</step>
    <step order="5">Document each endpoint: method, path, auth requirement, request body, response</step>
    <step order="6">Include curl examples</step>
    <step order="7">Note which endpoints require admin vs member auth</step>
    <step order="8">Apply brand voice where appropriate</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/plugins/membership/docs/api-reference.md && echo "exists"</check>
    <check type="bash">grep "1.0.0" /home/agent/shipyard-ai/plugins/membership/docs/api-reference.md</check>
    <check type="test">File exists and shows version 1.0.0</check>
    <check type="manual">All public endpoints documented with examples</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="API patterns fixed before documenting" />
    <depends-on task-id="phase-1-task-2" reason="Auth requirements must be accurate" />
    <depends-on task-id="phase-1-task-3" reason="Status endpoint changes must be reflected" />
  </dependencies>

  <commit-message>docs(membership): add api-reference.md

Per decisions.md Decision 8:
- All REST endpoints documented
- Auth requirements specified (admin vs member)
- Request/response schemas
- curl examples for common operations
- Version 1.0.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Create troubleshooting.md documentation</title>
  <requirement>REQ-SHIP-007: Troubleshooting Documentation (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section II Lines 94-98:
    Create troubleshooting guide covering common issues:
    - Stripe webhook failures
    - Email delivery issues
    - JWT token expiration
    - Member status sync problems
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/README.md" reason="May have troubleshooting section" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Error conditions" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/email.ts" reason="Email error handling" />
  </context>

  <steps>
    <step order="1">Review code for common error conditions</step>
    <step order="2">Create docs/troubleshooting.md</step>
    <step order="3">Document: "Webhook not receiving events" - check Stripe dashboard, verify endpoint URL</step>
    <step order="4">Document: "Emails not sending" - check Resend API key, check rate limits</step>
    <step order="5">Document: "Member shows expired but paid" - webhook timing, manual refresh</step>
    <step order="6">Document: "Admin endpoints return 403" - verify admin role in EmDash</step>
    <step order="7">Document: "JWT token invalid" - check EMDASH_AUTH_SECRET, token expiration</step>
    <step order="8">Apply brand voice: compassionate, not condescending (Decision 5)</step>
  </steps>

  <verification>
    <check type="bash">test -f /home/agent/shipyard-ai/plugins/membership/docs/troubleshooting.md && echo "exists"</check>
    <check type="bash">wc -l /home/agent/shipyard-ai/plugins/membership/docs/troubleshooting.md</check>
    <check type="test">File exists with substantial content (40+ lines)</check>
    <check type="manual">Doc covers webhook, email, JWT, and admin access issues</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Error messages must be accurate" />
  </dependencies>

  <commit-message>docs(membership): add troubleshooting.md

Per decisions.md Decision 8:
- Stripe webhook troubleshooting
- Email delivery issues
- JWT token problems
- Member status sync
- Admin access issues
- Compassionate tone throughout

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="2">
  <title>Brand voice audit and copy updates</title>
  <requirement>REQ-SHIP-012: Brand Voice Applied (P0-Blocker)</requirement>
  <description>
    Per decisions.md Decision 5 and Maya Angelou rewrites:
    Audit all user-facing copy for brand voice compliance.
    - Kill: "successfully," "submitted," "confirmed," "error occurred"
    - Use: "Done," "Saved," "Live," "Oops"
    - Apply 3-word principle where possible
    - Ensure email templates match Maya's rewrites
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/email.ts" reason="Email templates to audit" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Error messages" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/" reason="UI components" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Lines 60-66: Maya's rewrites" />
  </context>

  <steps>
    <step order="1">Search for banned words: grep -ri "successfully\|submitted\|confirmed\|error occurred"</step>
    <step order="2">Replace with approved alternatives per Decision 5</step>
    <step order="3">Review email.ts templates for Maya Angelou voice</step>
    <step order="4">Verify welcome email matches: "The first hello. So members feel received, not processed."</step>
    <step order="5">Review Astro components for UI copy</step>
    <step order="6">Apply 3-word principle to form labels and buttons</step>
    <step order="7">Ensure error messages are compassionate per REQ-SHIP-013</step>
    <step order="8">Run build to verify no syntax errors from string changes</step>
  </steps>

  <verification>
    <check type="bash">grep -ri "successfully" /home/agent/shipyard-ai/plugins/membership/src/ | wc -l</check>
    <check type="test">Result is 0 (no banned words remain)</check>
    <check type="bash">grep -ri "error occurred" /home/agent/shipyard-ai/plugins/membership/src/ | wc -l</check>
    <check type="test">Result is 0</check>
    <check type="manual">Email templates use warm, terse voice</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Error messages being replaced in task-1" />
  </dependencies>

  <commit-message>style(membership): apply brand voice throughout

Per decisions.md Decision 5 (Maya Angelou review):
- Replaced "successfully" -> "Done"
- Replaced "submitted" -> "Saved"
- Replaced "error occurred" -> "Oops"
- Applied 3-word principle to UI copy
- Email templates match Maya's rewrites
- Compassionate error messages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Production Validation

Three tasks for deployment, validation, and customer review.

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Deploy MemberShip to Sunrise Yoga</title>
  <requirement>REQ-SHIP-001: Production Deployment (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section VIII Line 340 and Decision 7:
    "One test site per plugin. Sunrise Yoga gets MemberShip."

    Deploy the fixed, documented plugin to the Sunrise Yoga EmDash site.
    Per docs/EMDASH-GUIDE.md Section 5, this involves:
    - Adding plugin to site's astro.config.mjs
    - Configuring Stripe environment variables
    - Deploying via wrangler
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/" reason="Target deployment site" />
    <file path="/home/agent/shipyard-ai/plugins/membership/" reason="Plugin to deploy" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Deployment" />
  </context>

  <steps>
    <step order="1">Verify all Wave 1 and Wave 2 tasks complete</step>
    <step order="2">Read sunrise-yoga/astro.config.mjs for current configuration</step>
    <step order="3">Add MemberShip plugin to integrations array per docs/EMDASH-GUIDE.md Section 6</step>
    <step order="4">Set Stripe environment variables via wrangler secrets</step>
    <step order="5">Set Resend API key if using email</step>
    <step order="6">Run build: npm run build in sunrise-yoga directory</step>
    <step order="7">Deploy: wrangler deploy</step>
    <step order="8">Verify plugin appears in admin panel: https://yoga.shipyard.company/_emdash/admin</step>
    <step order="9">Verify /membership/health endpoint returns 200</step>
    <step order="10">Test registration form appears on site</step>
  </steps>

  <verification>
    <check type="bash">curl -I https://yoga.shipyard.company/membership/health</check>
    <check type="test">Returns HTTP 200</check>
    <check type="manual">Plugin visible in EmDash admin panel</check>
    <check type="manual">Registration form renders correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Code must be fixed" />
    <depends-on task-id="phase-1-task-2" reason="Security must be in place" />
    <depends-on task-id="phase-1-task-3" reason="Status endpoint secured" />
    <depends-on task-id="phase-1-task-5" reason="Installation docs needed for reference" />
    <depends-on task-id="phase-1-task-6" reason="Configuration docs needed for setup" />
  </dependencies>

  <commit-message>deploy(membership): ship to Sunrise Yoga production

Per decisions.md Section VIII:
- Plugin deployed to yoga.shipyard.company
- Stripe integration configured
- Admin panel accessible
- Registration form working
- Health endpoint verified

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Production validation: 3 real transactions + webhook kill-test</title>
  <requirement>REQ-SHIP-002: Real Stripe Transactions, REQ-SHIP-003: Webhook Kill-Test (P0-Blockers)</requirement>
  <description>
    Per decisions.md Section VII Lines 322-323:
    "Three real Stripe transactions in production mode."
    "Webhook failure recovery verified - kill webhook mid-transaction."

    This validates the complete payment flow in production.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/troubleshooting.md" reason="Document recovery procedure" />
  </context>

  <steps>
    <step order="1">Ensure Stripe is in production mode (not test mode)</step>
    <step order="2">Transaction 1: Complete a real $1 test purchase with real card</step>
    <step order="3">Verify member status updates to active</step>
    <step order="4">Verify welcome email received</step>
    <step order="5">Transaction 2: Complete another purchase with different email</step>
    <step order="6">Verify same success flow</step>
    <step order="7">Transaction 3: Begin purchase, then disable webhook endpoint in Stripe dashboard</step>
    <step order="8">Complete payment - payment succeeds but webhook fails</step>
    <step order="9">Verify system handles gracefully (logs error, doesn't crash)</step>
    <step order="10">Re-enable webhook, trigger retry from Stripe dashboard</step>
    <step order="11">Verify member status updates after retry</step>
    <step order="12">Document the kill-test procedure and recovery steps</step>
    <step order="13">Refund all test transactions in Stripe dashboard</step>
  </steps>

  <verification>
    <check type="manual">Stripe dashboard shows 3 successful production transactions</check>
    <check type="manual">All 3 members created with correct status</check>
    <check type="manual">Welcome emails received for all 3</check>
    <check type="manual">Webhook failure handled gracefully (no 500 errors)</check>
    <check type="manual">Webhook retry recovered transaction 3</check>
    <check type="test">Kill-test procedure documented in troubleshooting.md</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Must be deployed to production first" />
  </dependencies>

  <commit-message>test(membership): complete production validation

Per decisions.md Section VII:
- 3 real Stripe production transactions completed
- Welcome emails verified
- Webhook kill-test performed
- Recovery procedure documented
- All gate criteria for transactions met

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    MemberShip customers are yoga instructors, course creators, and small
    business owners using EmDash. "Would they pay for this? What feels like
    engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Board decisions and essence" />
    <file path="/home/agent/shipyard-ai/plugins/membership/README.md" reason="Product documentation" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and MemberShip plugin</step>
    <step order="3">Answer: Would a yoga instructor actually use MemberShip?</step>
    <step order="4">Answer: What would make them say "I built that"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. real value?</step>
    <step order="6">Answer: Does the empty state CTA feel welcoming or intimidating?</step>
    <step order="7">Answer: Is the admin dashboard beautiful enough to make them feel smart?</step>
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
    <depends-on task-id="phase-1-task-11" reason="Review after production validation" />
  </dependencies>

  <commit-message>docs(membership): add Sara Blakely customer gut-check

Per SKILL.md Step 7:
- Customer perspective validation complete
- "Would a yoga instructor use this?" answered
- Engineering vanity vs real value assessed
- First 30 seconds experience evaluated

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 4 | Security fixes & code quality (banned patterns, auth, version) | 4 parallel |
| 2 | 5 | Documentation & brand voice | 5 parallel (after Wave 1) |
| 3 | 3 | Production validation | Sequential (after Wave 2) |

**Total Tasks:** 12
**Maximum Parallelism:** Wave 2 (5 concurrent tasks)
**Timeline:** 3-5 days (focused code fixes + documentation)

---

## Dependencies Diagram

```
Wave 1:  [task-1: Banned Patterns] ──────────────────────────────────────────>
         [task-2: Admin Auth] ───────────────────────────────────────────────>
         [task-3: Status Endpoint] ──────────────────────────────────────────>
         [task-4: Version Unify] ────────────────────────────────────────────>

Wave 2:  [task-5: installation.md] ──> (depends on task-1) ──────────────────>
         [task-6: configuration.md] ─> (depends on task-1) ──────────────────>
         [task-7: api-reference.md] ─> (depends on tasks 1,2,3) ─────────────>
         [task-8: troubleshooting.md] (depends on task-1) ───────────────────>
         [task-9: Brand Voice] ──────> (depends on task-1) ──────────────────>

Wave 3:  [task-10: Deploy Sunrise] ──> (depends on tasks 1-6) ───────────────>
         [task-11: Prod Validation] ─> (depends on task-10) ─────────────────>
         [task-12: Sara Review] ─────> (depends on task-11) ─────────────────>
```

---

## Risk Notes

### Addressed in This Phase

| Risk | Mitigation | Task |
|------|------------|------|
| 114 banned patterns | Mechanical find-and-replace | task-1 |
| Missing admin auth | Add isAdmin checks | task-2 |
| Status endpoint privacy | Require JWT, remove Stripe IDs | task-3 |
| Version inconsistency | Unify to 1.0.0 | task-4 |
| Documentation incomplete | Write all 4 required docs | tasks 5-8 |
| No production validation | Deploy to Sunrise Yoga | task-10 |
| Webhook failure untested | Kill-test procedure | task-11 |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| 4,000-line monolith | Medium | Refactor after revenue (Decision lock) |
| ~60% code duplication | Medium | Extract shared module in v2 |
| No demo data | Low | Empty state CTA sufficient (Decision 3) |
| KV at 10K records | Medium | D1 migration path exists |

---

## Verification Checklist

- [x] All P0 requirements have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed
- [x] Board conditions mapped to tasks
- [x] EmDash docs cited for technical accuracy (Section 5, 6)
- [x] 3-5 day timeline achievable
- [x] Ship test defined: "I built that"
- [x] Sara Blakely customer gut-check scheduled (task-12)

---

## Ship Test

> Does the yoga instructor feel smarter after using MemberShip?

> Does she see "I built that" when her first member joins?

> Does the first 30 seconds make her want to continue?

> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/finish-plugins/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: finish-plugins*
