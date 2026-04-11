# Phase 1 Plan — MemberShip Plugin Ship

**Generated:** April 11, 2026
**Project Slug:** finish-plugins
**Product Name:** MemberShip
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 16
**Waves:** 4
**Timeline:** 1 week (ship this week per decisions.md)

---

## The Essence

> **What is this product REALLY about?**
> Making people who feel inadequate feel capable.

> **What's the feeling it should evoke?**
> "I built that."

> **What's the one thing that must be perfect?**
> The first 30 seconds.

> **Creative direction:**
> Disappear.

---

## Build Status

**Technical MVP:** Feature-complete (10,195 lines of code)
**Board Verdict:** PROCEED (with conditions)
**Blockers:** 7 ship-gate items from decisions.md Section VI

| Ship-Gate Condition | Status | This Phase |
|---------------------|--------|------------|
| Deploy to real EmDash site | NOT DONE | Yes |
| Three real Stripe transactions | NOT DONE | Yes |
| Webhook failure recovery verified | NOT DONE | Yes |
| Documentation complete | PARTIAL | Yes |
| Admin dashboard beautiful | DONE | Verify |
| Admin authentication exists | PARTIAL | Yes |
| Brand voice applied throughout | PARTIAL | Yes |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Deploy to real EmDash site | phase-1-task-13 | 4 |
| REQ-002: Three real Stripe transactions | phase-1-task-14 | 4 |
| REQ-003: Webhook failure recovery | phase-1-task-3 | 2 |
| REQ-004: Documentation complete | phase-1-task-7, phase-1-task-8, phase-1-task-9, phase-1-task-10 | 2-3 |
| REQ-005: Admin dashboard beautiful | phase-1-task-5 | 2 |
| REQ-006: Admin authentication | phase-1-task-2 | 1 |
| REQ-007: Brand voice | phase-1-task-6 | 2 |
| REQ-013: Two permission tiers | phase-1-task-1 | 1 |
| REQ-015: Empty state CTA | phase-1-task-4 | 1 |

---

## Documentation References

This plan cites specific sections from the docs/ directory:

- **EMDASH-GUIDE.md Section 6 (Plugin System):** Defines plugin structure, hooks, routes, ctx.kv, ctx.email capabilities
- **EMDASH-GUIDE.md Section 6 (Block Kit):** Admin UI rendering for sandboxed plugins
- **EMDASH-GUIDE.md Section 6 (Plugin Context):** Available plugin APIs (storage, kv, content, media, http, log)
- **decisions.md Section VI (Shipping Criteria):** Ship-gate checklist items
- **decisions.md Section II (MVP Feature Set):** What ships vs. what's cut
- **decisions.md Section V (Risk Register):** Critical risks requiring mitigation

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation: Cut Scope & Harden Auth

Three independent tasks that establish the v1 scope boundary and security foundation.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Remove GroupRecord code (two-tier permission model)</title>
  <requirement>REQ-013: Two permission tiers only (members vs non-members)</requirement>
  <description>
    Per decisions.md Decision 6: Delete ~500 lines of group/role code.
    Complexity is a tax on attention. Seven permission levels means you're
    a corporation pretending to be a yoga studio. Two tiers enables deletion.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Contains GroupRecord types and group routes" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/GroupManagement.astro" reason="1,086 lines - entire file should be removed" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 6 locked: two tiers only" />
  </context>

  <steps>
    <step order="1">Open sandbox-entry.ts and identify GroupRecord type definition (~lines 50-80)</step>
    <step order="2">Identify all group-related routes: groups/create, groups/invite, groups/remove, groups/:id, groups/accept, groups/my, groups/my/invite, groups/my/remove</step>
    <step order="3">Remove GroupRecord type and GroupInviteCode type</step>
    <step order="4">Remove all 8 group-related routes from routes object</step>
    <step order="5">Remove any helper functions specific to groups (e.g., generateInviteCode)</step>
    <step order="6">Delete entire file: src/astro/GroupManagement.astro (1,086 lines)</step>
    <step order="7">Update src/astro/index.ts to remove GroupManagement export</step>
    <step order="8">Search for any remaining "group" or "Group" references in codebase</step>
    <step order="9">Run TypeScript build: npm run build</step>
    <step order="10">Run tests: npm test</step>
    <step order="11">Verify binary permission check remains: isMember(email) returns boolean only</step>
  </steps>

  <verification>
    <check type="bash">npm run build</check>
    <check type="bash">npm test</check>
    <check type="bash">grep -r "GroupRecord" src/ (should return nothing)</check>
    <check type="bash">grep -r "groups/" src/ (should return nothing)</check>
    <check type="manual">GroupManagement.astro file deleted</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>refactor(membership): remove group/role code per Decision 6

Per decisions.md: Two permission tiers only (members vs non-members).
Deleted ~500 lines of GroupRecord, GroupInviteCode, group routes.
Removed GroupManagement.astro (1,086 lines).
Complexity is a tax on attention.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Harden admin authentication and add audit logging</title>
  <requirement>REQ-006: Admin authentication exists (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Open Question #6: "Anyone with endpoint can modify members."
    This is a CRITICAL security gap. Must verify isAdmin on all admin routes
    and add audit logging for security visibility.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Contains admin routes that need auth hardening" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin Context - ctx.log for structured logging" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Risk Register: No admin authentication - CRITICAL" />
  </context>

  <steps>
    <step order="1">Create helper function: assertAdmin(rc, ctx) that throws 403 if !rc.user?.isAdmin</step>
    <step order="2">Add audit logging: ctx.log.warn on failed admin auth attempts with IP/email if available</step>
    <step order="3">Apply assertAdmin() to all admin routes:</step>
    <step order="4">  - /approve, /revoke, /admin/mark-paid</step>
    <step order="5">  - /reports/*, /export/csv, /import/csv</step>
    <step order="6">  - /forms/create, /forms/:id (PUT), /forms/:id/submissions</step>
    <step order="7">  - /coupons/create, /coupons (list)</step>
    <step order="8">  - /webhooks/*, /gating/rules (POST)</step>
    <step order="9">Add rate limiting on failed admin auth: track in KV, block after 5 failures</step>
    <step order="10">Add audit log entries for successful admin actions:</step>
    <step order="11">  - ctx.log.info(`ADMIN_ACTION: ${adminEmail} ${action} ${targetEmail}`)</step>
    <step order="12">Add test case for admin auth rejection</step>
    <step order="13">Add test case for rate limiting</step>
    <step order="14">Run tests to verify</step>
  </steps>

  <verification>
    <check type="bash">npm test -- --grep "admin"</check>
    <check type="test">Non-admin user gets 403 on /approve</check>
    <check type="test">Rate limited after 5 failed attempts</check>
    <check type="manual">Audit log entries appear in ctx.log output</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>security(membership): harden admin auth and add audit logging

Ship-gate blocker: Admin authentication must exist.
- assertAdmin() helper for all admin routes
- Audit logging for auth attempts and actions
- Rate limiting on failed admin auth (5 attempts)
- ctx.log.warn/info for security visibility

Closes security gap in decisions.md Open Question #6.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Implement empty state with clear CTA</title>
  <requirement>REQ-015: Empty state with clear CTA (Decision 3)</requirement>
  <description>
    Per decisions.md Decision 3: Show empty state with "Create Your First Member"
    CTA when no members exist. No demo data generation complexity.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/AdminReporting.astro" reason="Admin dashboard - add empty state" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 3: Empty state, no demo data" />
  </context>

  <steps>
    <step order="1">Open AdminReporting.astro</step>
    <step order="2">Add member count check at top of component</step>
    <step order="3">If memberCount === 0, render empty state view:</step>
    <step order="4">  - Centered container with warm, inviting design</step>
    <step order="5">  - Heading: "No members yet"</step>
    <step order="6">  - Subheading: "Create your first member to get started."</step>
    <step order="7">  - CTA button: "Create Your First Member" (links to registration form)</step>
    <step order="8">  - Optional: illustration or icon (simple, not clipart)</step>
    <step order="9">Apply brand voice: terse, confident, warm</step>
    <step order="10">Ensure CTA button has prominent styling (primary color, large touch target)</step>
    <step order="11">Test with empty KV store</step>
    <step order="12">Verify normal dashboard appears when members exist</step>
  </steps>

  <verification>
    <check type="manual">Empty state displays when member count is 0</check>
    <check type="manual">CTA button is prominent and clickable</check>
    <check type="manual">Copy follows brand voice (terse, warm)</check>
    <check type="manual">Normal dashboard displays when members exist</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(membership): add empty state with clear CTA

Per Decision 3: Empty state instead of demo data.
- "Create Your First Member" CTA when memberCount === 0
- Terse, warm copy following brand voice
- No demo data generation complexity

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Verification & Documentation

Seven tasks for webhook testing, design review, and documentation completion.

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>Verify webhook failure recovery (kill-test)</title>
  <requirement>REQ-003: Webhook failure recovery verified (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 8: Kill-test webhook failure before ship.
    Customer service nightmare: Stripe payment succeeds but member doesn't get access.
    Must verify system recovers from webhook failure mid-transaction.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Stripe webhook handler implementation" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/__tests__/integration.test.ts" reason="Add kill-test" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 8: Webhook failure handling" />
  </context>

  <steps>
    <step order="1">Review current webhook handler in sandbox-entry.ts (lines 1400-1500)</step>
    <step order="2">Identify recovery mechanisms: idempotency key, retry logic</step>
    <step order="3">Create test case: test_webhook_failure_recovery</step>
    <step order="4">Simulate scenario:</step>
    <step order="5">  - Start checkout session</step>
    <step order="6">  - Payment succeeds in Stripe</step>
    <step order="7">  - Webhook call throws error mid-processing</step>
    <step order="8">  - Verify member record is NOT corrupted</step>
    <step order="9">  - Simulate Stripe retry (re-send webhook)</step>
    <step order="10">  - Verify member gets access on retry</step>
    <step order="11">If recovery mechanism missing, implement:</step>
    <step order="12">  - Atomic idempotency check (setNX pattern)</step>
    <step order="13">  - Cleanup on failure (remove processing flag)</step>
    <step order="14">  - Recovery endpoint for admin to manually reconcile</step>
    <step order="15">Document manual recovery procedure in troubleshooting.md</step>
    <step order="16">Run full test suite</step>
  </steps>

  <verification>
    <check type="test">npm test -- --grep "webhook failure"</check>
    <check type="test">Stripe retry delivers access after initial failure</check>
    <check type="test">No duplicate member records created</check>
    <check type="test">No duplicate emails sent</check>
    <check type="manual">Manual recovery procedure documented</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Admin auth needed for recovery endpoint" />
  </dependencies>

  <commit-message>test(membership): verify webhook failure recovery (kill-test)

Ship-gate blocker: Webhook failure recovery must be verified.
- Added test: webhook failure mid-transaction
- Verified Stripe retry delivers member access
- Atomic idempotency check prevents duplicates
- Manual recovery procedure documented

Per Decision 8: Prevents "payment succeeds, access denied" nightmare.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Review admin dashboard design (Steve's requirement)</title>
  <requirement>REQ-005: Admin dashboard beautiful (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 4: Admin dashboard receives equal design investment.
    For first 6 months, admin panel IS the product. Ugly admin = abandoned installs.
    Review and enhance if needed.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/AdminReporting.astro" reason="Main admin dashboard" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/MemberDashboard.astro" reason="Member-facing dashboard for comparison" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 4: Admin UI quality" />
  </context>

  <steps>
    <step order="1">Open AdminReporting.astro and review current design</step>
    <step order="2">Check against "spreadsheet-like" anti-pattern:</step>
    <step order="3">  - Tables should have proper spacing and alignment</step>
    <step order="4">  - Cards should have visual hierarchy</step>
    <step order="5">  - Buttons should have clear styling</step>
    <step order="6">Compare design quality to MemberDashboard.astro (customer-facing)</step>
    <step order="7">Review mobile responsiveness</step>
    <step order="8">Check accessibility: aria-labels, semantic HTML, focus states</step>
    <step order="9">If improvements needed, apply:</step>
    <step order="10">  - Better typography (heading hierarchy)</step>
    <step order="11">  - Improved spacing (breathing room)</step>
    <step order="12">  - Status badges with color coding</step>
    <step order="13">  - Hover states on interactive elements</step>
    <step order="14">  - Loading states for async operations</step>
    <step order="15">Take screenshot of final admin dashboard</step>
    <step order="16">Document design decisions in code comments</step>
  </steps>

  <verification>
    <check type="manual">Admin dashboard is NOT spreadsheet-like</check>
    <check type="manual">Design parity with member-facing components</check>
    <check type="manual">Mobile responsive</check>
    <check type="manual">Accessibility: proper aria-labels, focus states</check>
    <check type="manual">Screenshot captured for board review</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>style(membership): review and enhance admin dashboard design

Ship-gate: Admin dashboard must be beautiful.
Per Decision 4: Equal design investment as customer-facing.
- Verified not spreadsheet-like
- Design parity with member dashboard
- Mobile responsive, accessible
- Screenshot captured for board review

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Apply brand voice audit (3-word principle)</title>
  <requirement>REQ-007: Brand voice applied throughout (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 5: Terse, confident, warm copy.
    Three words where competitors use twelve.
    Maya Angelou's rewrites: "They're in. Welcome email sent."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/email.ts" reason="Email template copy" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Response messages" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/RegistrationForm.astro" reason="Form labels and messages" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/astro/AdminReporting.astro" reason="Admin UI copy" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 5: Brand voice" />
  </context>

  <steps>
    <step order="1">Create COPY-AUDIT.md checklist</step>
    <step order="2">Review email templates in email.ts:</step>
    <step order="3">  - Welcome email: "They're in. Welcome email sent." not "Registration confirmed..."</step>
    <step order="4">  - Payment receipt: terse, warm</step>
    <step order="5">  - Cancellation: respectful, brief</step>
    <step order="6">Review sandbox-entry.ts response messages:</step>
    <step order="7">  - Success: short, confident</step>
    <step order="8">  - Errors: helpful, not technical</step>
    <step order="9">Review RegistrationForm.astro:</step>
    <step order="10">  - Labels: minimal, clear</step>
    <step order="11">  - CTA button: action-oriented</step>
    <step order="12">  - Error messages: human, not jargon</step>
    <step order="13">Review AdminReporting.astro:</step>
    <step order="14">  - Section headers: terse</step>
    <step order="15">  - Empty states: warm, not clinical</step>
    <step order="16">Apply Maya Angelou rewrites where applicable</step>
    <step order="17">Remove any passive voice</step>
    <step order="18">Remove any corporate/marketing speak</step>
    <step order="19">Document voice guidelines in COPY-AUDIT.md</step>
  </steps>

  <verification>
    <check type="manual">COPY-AUDIT.md checklist completed</check>
    <check type="manual">No passive voice in user-facing copy</check>
    <check type="manual">No technical jargon visible to users</check>
    <check type="manual">Maya Angelou rewrites applied</check>
    <check type="bash">grep -r "has been" src/ (find passive voice)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>docs(membership): apply brand voice audit (3-word principle)

Ship-gate: Brand voice must be applied throughout.
Per Decision 5: Terse, confident, warm.
- Maya Angelou rewrites applied
- No passive voice
- No technical jargon
- COPY-AUDIT.md checklist completed

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Write installation.md documentation</title>
  <requirement>REQ-004: Documentation complete (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 7: Documentation complete BEFORE ship.
    Installation guide for MemberShip plugin.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin registration in astro.config.mjs" />
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Package name and dependencies" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 7: Documentation blocker" />
  </context>

  <steps>
    <step order="1">Create membership/docs/installation.md</step>
    <step order="2">Write Prerequisites section:</step>
    <step order="3">  - Emdash site running on Cloudflare Workers</step>
    <step order="4">  - Stripe account with API keys</step>
    <step order="5">  - Resend account for email</step>
    <step order="6">Write Installation section:</step>
    <step order="7">  - npm install @shipyard/membership</step>
    <step order="8">  - Add to astro.config.mjs plugins array</step>
    <step order="9">  - Reference EMDASH-GUIDE.md Section 6 for plugin registration</step>
    <step order="10">Write Environment Setup section:</step>
    <step order="11">  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET</step>
    <step order="12">  - RESEND_API_KEY</step>
    <step order="13">  - JWT_SECRET</step>
    <step order="14">Write Verification section:</step>
    <step order="15">  - Visit admin panel</step>
    <step order="16">  - Verify MemberShip appears in plugins</step>
    <step order="17">Write Next Steps: link to configuration.md</step>
    <step order="18">Use brand voice: terse, confident, no jargon</step>
  </steps>

  <verification>
    <check type="manual">installation.md exists and is complete</check>
    <check type="manual">Prerequisites clear</check>
    <check type="manual">Step-by-step instructions accurate</check>
    <check type="manual">References EMDASH-GUIDE.md Section 6</check>
    <check type="manual">Brand voice applied</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>docs(membership): write installation.md

Ship-gate: Documentation must be complete.
- Prerequisites: Emdash, Stripe, Resend
- Installation steps with astro.config.mjs
- Environment variable setup
- Verification procedure
- References EMDASH-GUIDE.md Section 6

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Write configuration.md documentation</title>
  <requirement>REQ-004: Documentation complete (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 7: Documentation complete BEFORE ship.
    Configuration guide for Stripe, Resend, plans setup.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Configuration options and default plans" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin settings schema" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Decision 7: Documentation blocker" />
  </context>

  <steps>
    <step order="1">Create membership/docs/configuration.md</step>
    <step order="2">Write Stripe Setup section:</step>
    <step order="3">  - Creating Stripe products and prices</step>
    <step order="4">  - Configuring webhook endpoint</step>
    <step order="5">  - Webhook events to subscribe (checkout.session.completed, etc.)</step>
    <step order="6">Write Resend Setup section:</step>
    <step order="7">  - API key configuration</step>
    <step order="8">  - Sender email setup</step>
    <step order="9">Write Plans Configuration section:</step>
    <step order="10">  - Default plans (free, pro, premium)</step>
    <step order="11">  - Custom plan creation</step>
    <step order="12">  - Stripe price ID mapping</step>
    <step order="13">Write Admin Settings section:</step>
    <step order="14">  - Settings schema from plugin definition</step>
    <step order="15">  - Reference EMDASH-GUIDE.md Section 6: settingsSchema</step>
    <step order="16">Write Security section:</step>
    <step order="17">  - JWT_SECRET generation</step>
    <step order="18">  - Webhook signature verification</step>
    <step order="19">Use brand voice: clear, no jargon</step>
  </steps>

  <verification>
    <check type="manual">configuration.md exists and is complete</check>
    <check type="manual">Stripe setup accurate</check>
    <check type="manual">Resend setup accurate</check>
    <check type="manual">Plans configuration clear</check>
    <check type="manual">References EMDASH-GUIDE.md Section 6</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 2 task -->
  </dependencies>

  <commit-message>docs(membership): write configuration.md

Ship-gate: Documentation must be complete.
- Stripe products, prices, webhooks setup
- Resend API key and sender configuration
- Plans: free, pro, premium
- Security: JWT_SECRET, webhook verification
- References EMDASH-GUIDE.md Section 6

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Final Documentation

Three tasks completing the documentation suite.

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Write api-reference.md documentation</title>
  <requirement>REQ-004: Documentation complete (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 7: Documentation complete BEFORE ship.
    API reference for all 52+ endpoints.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="All route definitions" />
    <file path="/home/agent/shipyard-ai/plugins/membership/API.md" reason="Existing API documentation to enhance" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin routes pattern" />
  </context>

  <steps>
    <step order="1">Create membership/docs/api-reference.md (or enhance existing API.md)</step>
    <step order="2">Organize by category (matching REQUIREMENTS.md structure):</step>
    <step order="3">  - Authentication endpoints</step>
    <step order="4">  - Member management endpoints</step>
    <step order="5">  - Checkout/payment endpoints</step>
    <step order="6">  - Reporting endpoints</step>
    <step order="7">  - Gating endpoints</step>
    <step order="8">For each endpoint document:</step>
    <step order="9">  - Method and path</step>
    <step order="10">  - Description</step>
    <step order="11">  - Request body schema (if applicable)</step>
    <step order="12">  - Response schema</step>
    <step order="13">  - Authentication requirement</step>
    <step order="14">  - Example request/response</step>
    <step order="15">Mark admin endpoints clearly</step>
    <step order="16">Mark public endpoints clearly</step>
    <step order="17">Reference EMDASH-GUIDE.md Section 6 for route patterns</step>
    <step order="18">Use consistent formatting</step>
  </steps>

  <verification>
    <check type="manual">api-reference.md exists and is complete</check>
    <check type="manual">All 52+ endpoints documented</check>
    <check type="manual">Request/response examples included</check>
    <check type="manual">Admin vs public endpoints marked</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Group endpoints removed, don't document" />
  </dependencies>

  <commit-message>docs(membership): write api-reference.md

Ship-gate: Documentation must be complete.
- All endpoints documented by category
- Request/response schemas
- Authentication requirements
- Example requests/responses
- Admin vs public endpoints marked

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Write troubleshooting.md documentation</title>
  <requirement>REQ-004: Documentation complete (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Decision 7: Documentation complete BEFORE ship.
    Troubleshooting guide for common issues.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="Error handling patterns" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Risk Register items" />
  </context>

  <steps>
    <step order="1">Create membership/docs/troubleshooting.md</step>
    <step order="2">Write Webhook Issues section:</step>
    <step order="3">  - "Webhook signature verification failed"</step>
    <step order="4">  - "Member didn't get access after payment"</step>
    <step order="5">  - Manual recovery procedure (from task-3)</step>
    <step order="6">Write Authentication Issues section:</step>
    <step order="7">  - "JWT token expired"</step>
    <step order="8">  - "Admin access denied"</step>
    <step order="9">Write Email Issues section:</step>
    <step order="10">  - "Welcome email not sent"</step>
    <step order="11">  - "Resend rate limit hit"</step>
    <step order="12">Write Configuration Issues section:</step>
    <step order="13">  - "Stripe key invalid"</step>
    <step order="14">  - "Missing environment variables"</step>
    <step order="15">Write Debugging section:</step>
    <step order="16">  - How to check ctx.log output</step>
    <step order="17">  - How to verify KV data</step>
    <step order="18">Write FAQ section with common questions</step>
    <step order="19">Use brand voice: helpful, not condescending</step>
  </steps>

  <verification>
    <check type="manual">troubleshooting.md exists and is complete</check>
    <check type="manual">Webhook issues covered</check>
    <check type="manual">Authentication issues covered</check>
    <check type="manual">Email issues covered</check>
    <check type="manual">Manual recovery procedure included</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Needs webhook recovery procedure" />
  </dependencies>

  <commit-message>docs(membership): write troubleshooting.md

Ship-gate: Documentation must be complete.
- Webhook issues and recovery procedure
- Authentication troubleshooting
- Email delivery issues
- Configuration problems
- Debugging guide
- FAQ section

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Create documentation index and verify completeness</title>
  <requirement>REQ-004: Documentation complete (ship-gate blocker)</requirement>
  <description>
    Create docs index and verify all 4 documentation files are complete and accurate.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/installation.md" reason="Verify exists" />
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/configuration.md" reason="Verify exists" />
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/api-reference.md" reason="Verify exists" />
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/troubleshooting.md" reason="Verify exists" />
  </context>

  <steps>
    <step order="1">Create membership/docs/README.md as index</step>
    <step order="2">Link to all 4 documentation files</step>
    <step order="3">Add quick start section</step>
    <step order="4">Verify each doc file exists</step>
    <step order="5">Verify each doc file has content (not empty)</step>
    <step order="6">Check all internal links work</step>
    <step order="7">Verify consistent formatting across docs</step>
    <step order="8">Add version number and last updated date</step>
    <step order="9">Update main README.md to link to docs/</step>
  </steps>

  <verification>
    <check type="bash">ls /home/agent/shipyard-ai/plugins/membership/docs/</check>
    <check type="manual">All 4 docs exist</check>
    <check type="manual">docs/README.md index created</check>
    <check type="manual">All internal links work</check>
    <check type="manual">Consistent formatting</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Needs installation.md" />
    <depends-on task-id="phase-1-task-8" reason="Needs configuration.md" />
    <depends-on task-id="phase-1-task-9" reason="Needs api-reference.md" />
    <depends-on task-id="phase-1-task-10" reason="Needs troubleshooting.md" />
  </dependencies>

  <commit-message>docs(membership): create documentation index

Ship-gate: Documentation must be complete.
- docs/README.md index with all 4 files
- All internal links verified
- Consistent formatting across docs
- Version and last updated added

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Run full test suite and build verification</title>
  <requirement>Pre-deployment verification</requirement>
  <description>
    Run complete test suite and verify build works before deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/src/__tests__/integration.test.ts" reason="Test suite" />
    <file path="/home/agent/shipyard-ai/plugins/membership/vitest.config.ts" reason="Test configuration" />
    <file path="/home/agent/shipyard-ai/plugins/membership/package.json" reason="Build scripts" />
  </context>

  <steps>
    <step order="1">Run TypeScript type check: npm run typecheck (or tsc --noEmit)</step>
    <step order="2">Run full test suite: npm test</step>
    <step order="3">Check test coverage: npm test -- --coverage</step>
    <step order="4">Run build: npm run build</step>
    <step order="5">Verify dist/ output exists</step>
    <step order="6">Check for any console warnings or errors</step>
    <step order="7">Run lint if configured: npm run lint</step>
    <step order="8">Document test results</step>
    <step order="9">Fix any failing tests</step>
    <step order="10">Re-run until all pass</step>
  </steps>

  <verification>
    <check type="bash">npm run build</check>
    <check type="bash">npm test</check>
    <check type="manual">All tests pass</check>
    <check type="manual">Build succeeds without errors</check>
    <check type="manual">No TypeScript errors</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Code changes affect tests" />
    <depends-on task-id="phase-1-task-2" reason="Auth changes affect tests" />
    <depends-on task-id="phase-1-task-3" reason="Webhook tests added" />
  </dependencies>

  <commit-message>test(membership): run full test suite and build verification

- TypeScript type check passed
- All tests passing
- Build succeeds
- Ready for deployment

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Production Validation

Four tasks for deploying and validating in production.

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Deploy to real EmDash site</title>
  <requirement>REQ-001: Deploy to real EmDash site (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Section VI: Must deploy to one real EmDash site in production mode.
    Not test environment. Demonstrates real-world integration capability.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 5: Deployment to Cloudflare Workers" />
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/installation.md" reason="Installation procedure" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Ship gate: real deployment" />
  </context>

  <steps>
    <step order="1">Identify target EmDash site for deployment (e.g., yoga.shipyard.company)</step>
    <step order="2">Verify Stripe production keys are available</step>
    <step order="3">Verify Resend production credentials are available</step>
    <step order="4">Follow installation.md procedure</step>
    <step order="5">Add MemberShip plugin to astro.config.mjs</step>
    <step order="6">Configure wrangler.toml with required bindings</step>
    <step order="7">Set production secrets: wrangler secret put STRIPE_SECRET_KEY, etc.</step>
    <step order="8">Deploy: wrangler deploy</step>
    <step order="9">Verify plugin loads in admin panel</step>
    <step order="10">Verify MemberShip menu item appears</step>
    <step order="11">Verify admin dashboard renders</step>
    <step order="12">Verify empty state CTA appears (no members yet)</step>
    <step order="13">Document deployment URL and configuration</step>
  </steps>

  <verification>
    <check type="bash">wrangler deploy</check>
    <check type="manual">Plugin visible in admin panel</check>
    <check type="manual">Admin dashboard renders correctly</check>
    <check type="manual">Empty state CTA visible</check>
    <check type="manual">No console errors</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Docs complete for deployment" />
    <depends-on task-id="phase-1-task-12" reason="Tests passing, build verified" />
  </dependencies>

  <commit-message>deploy(membership): deploy to real EmDash site

Ship-gate: Must deploy to production EmDash site.
- Deployed to: [site URL]
- Plugin loads correctly
- Admin dashboard renders
- Empty state CTA visible
- Ready for production transactions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>Complete three real Stripe transactions</title>
  <requirement>REQ-002: Three real Stripe transactions (ship-gate blocker)</requirement>
  <description>
    Per decisions.md Section VI: Process 3 production Stripe transactions with real cards.
    Validates complete payment flow end-to-end.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/membership/docs/configuration.md" reason="Stripe setup procedure" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Ship gate: 3 transactions" />
  </context>

  <steps>
    <step order="1">Ensure Stripe is in production mode (not test)</step>
    <step order="2">Register first test member via registration form</step>
    <step order="3">Complete Stripe checkout with real card</step>
    <step order="4">Verify member record created in KV</step>
    <step order="5">Verify welcome email received</step>
    <step order="6">Repeat for second test member</step>
    <step order="7">Verify second transaction complete</step>
    <step order="8">Repeat for third test member</step>
    <step order="9">Verify third transaction complete</step>
    <step order="10">Check Stripe dashboard: 3 successful payments</step>
    <step order="11">Check admin dashboard: 3 members listed</step>
    <step order="12">Check email: 3 welcome emails sent</step>
    <step order="13">Document transaction IDs and timestamps</step>
    <step order="14">Test member dashboard access for each</step>
  </steps>

  <verification>
    <check type="manual">Stripe dashboard shows 3 successful payments</check>
    <check type="manual">Admin dashboard shows 3 members</check>
    <check type="manual">3 welcome emails received</check>
    <check type="manual">Each member can access member dashboard</check>
    <check type="manual">Transaction IDs documented</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Deployed to production site" />
  </dependencies>

  <commit-message>test(membership): complete three real Stripe transactions

Ship-gate: 3 production transactions required.
- Transaction 1: [ID] - [timestamp]
- Transaction 2: [ID] - [timestamp]
- Transaction 3: [ID] - [timestamp]
- All members created correctly
- All emails delivered
- Payment flow validated end-to-end

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="4">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    "Would a real customer pay for this? What feels like engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This phase plan" />
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Board decisions" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely (growth-mindset entrepreneur)</step>
    <step order="2">Prompt: Read phase plan and deployed MemberShip plugin</step>
    <step order="3">Answer: Would a yoga studio owner actually use MemberShip?</step>
    <step order="4">Answer: What would make them say "shut up and take my money"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. customer value?</step>
    <step order="6">Answer: Is the first 30 seconds perfect? (per The Essence)</step>
    <step order="7">Answer: Does the admin feel capable or overwhelmed?</step>
    <step order="8">Answer: Does it make them feel "I built that"?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-14" reason="Review after production validation" />
  </dependencies>

  <commit-message>docs(membership): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would a yoga studio owner choose MemberShip?
Engineering vanity vs. customer value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-16" wave="4">
  <title>Ship gate checklist completion</title>
  <requirement>Final verification before ship</requirement>
  <description>
    Verify all 7 ship-gate items from decisions.md Section VI are complete.
    Final checklist before declaring MemberShip v1 shipped.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md" reason="Section VI ship gate" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="All requirements" />
  </context>

  <steps>
    <step order="1">Create SHIP-CHECKLIST.md</step>
    <step order="2">Verify each ship-gate item:</step>
    <step order="3">  - [ ] Deployed to one real EmDash site (task-13)</step>
    <step order="4">  - [ ] Three real Stripe transactions (task-14)</step>
    <step order="5">  - [ ] Webhook failure recovery verified (task-3)</step>
    <step order="6">  - [ ] Documentation complete (tasks 7-11)</step>
    <step order="7">  - [ ] Admin dashboard is beautiful (task-5)</step>
    <step order="8">  - [ ] Admin authentication exists (task-2)</step>
    <step order="9">  - [ ] Brand voice applied (task-6)</step>
    <step order="10">Document any exceptions or known issues</step>
    <step order="11">Include Sara Blakely feedback summary</step>
    <step order="12">Request stakeholder sign-off</step>
    <step order="13">Mark MemberShip v1 as SHIPPED</step>
    <step order="14">Update STATUS.md: MemberShip shipped, EventDash next</step>
  </steps>

  <verification>
    <check type="bash">cat SHIP-CHECKLIST.md</check>
    <check type="manual">All 7 ship-gate items verified</check>
    <check type="manual">Known issues documented</check>
    <check type="manual">Stakeholder sign-off obtained</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-15" reason="Needs Sara Blakely review" />
  </dependencies>

  <commit-message>docs(membership): complete ship gate checklist

MemberShip v1 SHIPPED.
All 7 ship-gate items verified:
- [x] Deployed to production
- [x] 3 real Stripe transactions
- [x] Webhook recovery verified
- [x] Documentation complete
- [x] Admin dashboard beautiful
- [x] Admin auth exists
- [x] Brand voice applied

EventDash next after validation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 3 | Foundation: Cut scope, harden auth, empty state | 3 parallel |
| 2 | 6 | Verification: Webhook test, design, voice, docs | 6 parallel (after Wave 1) |
| 3 | 4 | Final Docs: API ref, troubleshooting, verify, build | 4 parallel (after Wave 2) |
| 4 | 4 | Production: Deploy, transactions, review, ship | Sequential (after Wave 3) |

**Total Tasks:** 16
**Maximum Parallelism:** Wave 2 (6 concurrent tasks)
**Timeline:** 1 week (ship this week per decisions.md)

---

## Dependencies Diagram

```
Wave 1:  [task-1: Cut groups]  ─────────────────────────────────────────────────>
         [task-2: Admin auth]  ─────────────────────────────────────────────────>
         [task-4: Empty state] ─────────────────────────────────────────────────>

Wave 2:  [task-3: Webhook test] ───> (depends on task-2) ────────────────────────>
         [task-5: Design review] ───────────────────────────────────────────────>
         [task-6: Brand voice] ─────────────────────────────────────────────────>
         [task-7: installation.md] ─────────────────────────────────────────────>
         [task-8: configuration.md] ────────────────────────────────────────────>

Wave 3:  [task-9: api-reference.md] ───> (depends on task-1) ───────────────────>
         [task-10: troubleshooting.md] ───> (depends on task-3) ────────────────>
         [task-11: docs index] ───> (depends on tasks 7-10) ────────────────────>
         [task-12: tests/build] ───> (depends on tasks 1-3) ────────────────────>

Wave 4:  [task-13: Deploy] ───> (depends on tasks 11,12) ───────────────────────>
         [task-14: 3 transactions] ───> (depends on task-13) ───────────────────>
         [task-15: Sara review] ───> (depends on task-14) ──────────────────────>
         [task-16: Ship checklist] ───> (depends on task-15) ───────────────────>
```

---

## Risk Notes

### Critical (Address in Wave 1-2)

1. **Admin Authentication Gap** — CRITICAL per Risk Register
   - Task-2 addresses this
   - Must verify before production deployment
   - Rate limiting on failed attempts

2. **Webhook Failure Recovery** — CRITICAL per Decision 8
   - Task-3 addresses this
   - Kill-test required before ship
   - Manual recovery procedure documented

3. **Documentation Incomplete** — BLOCKER per Decision 7
   - Tasks 7-11 address this
   - All 4 docs required before deployment
   - No "PENDING" status allowed

### High (Monitor During Execution)

4. **Production Stripe Keys** — Dependency
   - Need production keys for task-13
   - Coordinate with infrastructure

5. **Production EmDash Site** — Dependency
   - Need target site for deployment
   - Coordinate with team

6. **Brand Voice Consistency** — Quality
   - Task-6 audits all copy
   - Maya Angelou's 3-word principle

### Accepted for v1 (Not Blocking)

7. **4,000-line monolith** — Technical debt
   - Refactor after revenue
   - Not a ship blocker

8. **~60% code duplication** — Technical debt
   - Extract shared module in v2
   - Not a ship blocker

9. **KV architecture** — Scaling
   - Acceptable for <1K records
   - D1 migration path exists

---

## Verification Checklist

- [x] All ship-gate blockers have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] Decisions compliance verified (MemberShip name, two tiers, etc.)
- [x] Cut features NOT included (groups, coupons, multi-step)
- [x] EMDASH-GUIDE.md Section 6 referenced for technical patterns
- [x] 1-week timeline achievable with parallel execution
- [x] Ship test defined: "I built that"
- [x] Sara Blakely customer gut-check scheduled (task-15)

---

## Ship Test

> Does the admin see their first member registered and feel "I built that"?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/finish-plugins/decisions.md, docs/EMDASH-GUIDE.md, CLAUDE.md*
*Project Slug: finish-plugins*
