# MemberShip Plugin — Next Wave: Phase 5 Plan

**Date**: 2026-04-05
**Issue**: #30 (MemberShip — Membership & Gated Content)
**Status**: DEBATE COMPLETE, READY TO BUILD

---

## Current State Assessment

### What's Shipped (Phases 1-4, Waves 1-3)

The MemberShip plugin is a 5,740-line codebase with the following complete:

**Phase 1 (Core):** Plans, basic gating, email registration, admin UI, KV storage
**Phase 2 (Payments):** Stripe Checkout, webhooks, member dashboard, coupons, email automation, upgrade/downgrade
**Phase 3 (Portals):** Content rules engine, drip content, member portal, content library, accessibility
**Phase 4 Wave 1:** Reporting (revenue/churn), group memberships, developer webhooks
**Phase 4 Wave 2:** Registration forms builder, multi-gateway schema, admin form builder
**Phase 4 Wave 3:** CSV import/export, PayPal checkout, advanced webhooks (retry + signing), cohort analysis, health endpoint

### What's NOT Yet Built (Gaps from PARITY.md + Issue #30)

The PARITY.md still has unchecked items, and the issue calls for "MemberPress equivalent" status. Remaining gaps:

1. **Registration forms — multi-step** (forms builder exists, but no multi-step wizard flow)
2. **Reporting — LTV, growth trends, member activity** (basic revenue/churn done, but LTV/activity missing from member-facing views)
3. **PARITY.md checkbox updates** (several Phase 4 features shipped but PARITY.md not updated)
4. **REST API documentation** (issue explicitly calls for "REST API")
5. **Frontend components for reporting** (API endpoints exist, no Astro dashboard components)
6. **Astro components for group management** (API exists, no portal UI)
7. **Astro components for form rendering** (API exists, no public-facing form component)
8. **End-to-end integration testing** (individual features tested, no cross-feature integration tests)

---

## Debate: Steve Jobs vs Elon Musk

### Round 1: What Matters Most?

**Steve Jobs (UX Priority):**
> We have 15+ API endpoints with no frontend. The admin has a reporting API but no charts to look at. Group membership works server-side but the portal shows nothing about groups. Registration forms can be defined via API but there's no Astro component to actually render them on a page. We shipped the engine with no steering wheel.
>
> Priority: Build the Astro components that make all these Phase 4 features visible and usable. A feature that exists only as an API endpoint is not a feature — it's a promise.

**Elon Musk (Technical Priority):**
> The fastest path to "MemberPress equivalent" is to close the PARITY.md gaps and ship a documented REST API. Site owners integrating MemberShip need API docs, not just pretty dashboards. The multi-step registration form is the one genuine feature gap. Everything else is UI wrapping.
>
> Priority: Multi-step forms, REST API docs, PARITY.md cleanup. Then ship. Don't gold-plate.

### Round 2: Finding Consensus

**Steve:**
> I accept that REST API docs matter for developers. But "MemberPress equivalent" means a non-technical site owner can use this without touching an API. The admin reporting dashboard, the group management UI in the portal, and the public registration form component are table stakes. Without them, this is a developer toolkit, not a product.

**Elon:**
> Fair. Here's the deal: we build Astro components for the three highest-impact features (reporting dashboard, group portal UI, public form renderer), ship REST API docs, update PARITY.md, and add multi-step form support. That's a complete product. No cohort charts, no fancy visualizations — clean tables and numbers that load fast.

### Consensus

Both directors agree on the following priorities:

1. **Astro admin reporting dashboard** — revenue chart, churn, member table (wraps existing API)
2. **Astro public registration form component** — renders form definitions on pages
3. **Astro group management UI** — group members list, invite, remove in portal
4. **Multi-step registration forms** — extend form builder to support wizard flows
5. **REST API documentation** — developer-facing docs for all endpoints
6. **PARITY.md update** — check off all Phase 4 features that shipped

---

## Build Plan: Phase 5 — Two Waves

### Wave 1: Frontend Components + Forms (4 tasks, parallel)

#### Task 1: Astro Admin Reporting Dashboard
**Owner:** Steve Jobs (sub-agent)
**Scope:**
- New Astro component: `AdminReporting.astro`
- Revenue overview: MRR, total revenue, active members, churn rate (cards)
- Revenue chart: daily bar chart (last 30 days) using lightweight SVG (no Recharts — keep bundle small)
- Member table: searchable, filterable by plan/status, sortable, paginated
- Fetches from existing `/membership/reporting/*` endpoints
- Mobile responsive

**Acceptance:**
- [ ] Dashboard renders 4 metric cards
- [ ] Bar chart shows 30-day revenue
- [ ] Member table filters by plan and status
- [ ] Mobile responsive (stacks on small screens)
- [ ] Load time < 2s

#### Task 2: Astro Public Registration Form Component
**Owner:** Steve Jobs (sub-agent)
**Scope:**
- New Astro component: `RegistrationForm.astro`
- Renders a form definition (fetched by form ID) as HTML form
- Field types: text, email, dropdown, checkbox, phone
- Client-side validation (required, email format)
- Submits to existing `/membership/forms/{id}/submit` endpoint
- Success/error states
- Integrates with gated-content block (show form to non-members)

**Acceptance:**
- [ ] Form renders all 5 field types correctly
- [ ] Client-side validation shows errors inline
- [ ] Submission works and returns success message
- [ ] Works inside gated-content blocks as upgrade CTA
- [ ] Accessible (labels, ARIA, keyboard nav)

#### Task 3: Astro Group Management Portal UI
**Owner:** Steve Jobs (sub-agent)
**Scope:**
- Extend `MemberDashboard.astro` with group section
- Group owner view: seat count (X/Y), member list, invite button, remove button
- Group member view: "Part of [Org Name]" badge, group members list
- Invite modal: generate link, copy to clipboard
- Remove confirmation dialog
- Fetches from existing `/membership/groups/*` endpoints

**Acceptance:**
- [ ] Owner sees seat count and member list
- [ ] Invite generates link with copy button
- [ ] Remove shows confirmation, then removes member
- [ ] Non-owner members see group badge
- [ ] Responsive layout

#### Task 4: Multi-Step Registration Forms
**Owner:** Elon Musk (sub-agent)
**Scope:**
- Extend form builder schema: add `steps` array to form definition
- Each step has a `label` and array of `fieldIds`
- API: update form CRUD to accept steps
- Frontend: `RegistrationForm.astro` renders step-by-step wizard
- Progress indicator (Step 1 of 3)
- Back/Next buttons, final Submit
- Validation per step (don't advance with errors)

**Acceptance:**
- [ ] Form definition supports `steps` array
- [ ] Wizard renders one step at a time
- [ ] Progress indicator shows current step
- [ ] Per-step validation blocks advancement
- [ ] Back button preserves entered data
- [ ] Final submit sends all fields

### Wave 2: Documentation + Polish (3 tasks, parallel)

#### Task 5: REST API Documentation
**Owner:** Elon Musk (sub-agent)
**Scope:**
- Document all MemberShip API endpoints in `plugins/membership/API.md`
- Sections: Authentication, Members, Plans, Subscriptions, Groups, Webhooks, Forms, Reporting, CSV, PayPal
- Each endpoint: method, path, auth required, request body, response shape, example
- Include webhook event payload schemas
- Include error codes and meanings

**Acceptance:**
- [ ] All endpoints documented
- [ ] Request/response examples for each
- [ ] Webhook payload schemas documented
- [ ] Error codes listed
- [ ] Developer can integrate from docs alone

#### Task 6: PARITY.md Update + Gap Closure
**Owner:** Phil Jackson
**Scope:**
- Update PARITY.md to check off all Phase 4 features:
  - [x] Registration forms
  - [x] Reporting
  - [x] Multiple payment gateways
  - [x] Group/corporate memberships
  - [x] Developer webhooks
  - [x] CSV import/export
- Update EventDash parity items:
  - [x] Event categories/tags
  - [x] Venue management
  - [x] Reporting
  - [x] Embeddable widgets
  - [x] CSV export (via general CSV)
  - [x] Waiting list notifications
  - [x] Event series
- Identify any remaining MemberPress features NOT in the list (e.g., courses/LMS, affiliate tracking) and document as "Out of Scope v1" or "Phase 6"

**Acceptance:**
- [ ] All shipped features checked off
- [ ] No false checkmarks (verify feature actually works)
- [ ] Remaining gaps documented with phase target

#### Task 7: Integration Testing + Edge Cases
**Owner:** Margaret Hamilton
**Scope:**
- Cross-feature integration tests:
  - Member signs up via form -> gets gated content access -> drip unlocks -> webhook fires
  - Group owner invites member -> member accepts -> member sees gated content
  - PayPal payment -> subscription created -> reporting reflects it
  - CSV import -> imported members appear in reporting
- Edge cases:
  - Expired group invite code
  - Form submission with invalid step data
  - Webhook retry exhaustion
  - CSV import with malformed rows
- Performance: reporting endpoints with 1000+ members (mock data)

**Acceptance:**
- [ ] 4 integration test scenarios pass
- [ ] Edge cases handled gracefully (no crashes, clear error messages)
- [ ] Reporting performs under load
- [ ] All tests documented in test file

---

## Timeline

| Wave | Tasks | Duration | Status |
|------|-------|----------|--------|
| Wave 1 | Tasks 1-4 (parallel) | 5 days | NOT STARTED |
| Wave 2 | Tasks 5-7 (parallel) | 3 days | NOT STARTED |
| **Total** | **7 tasks** | **8 days** | |

---

## Success Criteria

After Phase 5:
- A non-technical site owner can see their membership revenue, manage groups, and collect registrations entirely through the UI — no API calls needed
- A developer can integrate MemberShip into their toolchain using the REST API docs alone
- PARITY.md shows MemberPress feature parity achieved (core features)
- All features tested end-to-end across the membership lifecycle

---

## Out of Scope (Phase 6+)

- Courses / LMS (MemberPress Courses add-on equivalent)
- Affiliate tracking
- Advanced analytics dashboards (cohort visualizations beyond tables)
- Multi-currency support
- White-label email templates
- SSO / SAML authentication
