# Requirements — EmDash Plugins v1 (MemberShip + Convene)

**Project:** 003-emdash-plugins
**Generated:** 2026-04-05
**Source:** PRD + Decisions (rounds/003-emdash-plugins/decisions.md)
**Status:** Verified — 46 atomic requirements extracted

---

## MemberShip Plugin Requirements (13)

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| REQ-MS-001 | Implement `definePlugin` registration function for MemberShip plugin to register with EmDash | PRD | P0 |
| REQ-MS-002 | Build member registration flow with single form for new users to sign up | Decisions (MVP) | P0 |
| REQ-MS-003 | Integrate Stripe Checkout for membership plan subscription creation | Decisions (MVP) | P0 |
| REQ-MS-004 | Implement Stripe webhook handler to process subscription lifecycle events (subscribe, cancel, payment failed) | Decisions (MVP) | P0 |
| REQ-MS-005 | Create access check endpoint (`GET /check-access`) to verify member subscription status | Decisions (MVP) | P0 |
| REQ-MS-006 | Build member dashboard page allowing users to view their own subscription status | Decisions (MVP) | P0 |
| REQ-MS-007 | Build member dashboard cancel functionality allowing users to cancel their subscription | Decisions (MVP) | P0 |
| REQ-MS-008 | Create admin member list UI with cursor-based pagination via Block Kit | Decisions (MVP) | P0 |
| REQ-MS-009 | Create admin UI for creating new membership plans via Block Kit | Decisions (MVP) | P0 |
| REQ-MS-010 | Create admin UI for editing existing membership plans via Block Kit | Decisions (MVP) | P0 |
| REQ-MS-011 | Create admin settings UI for Stripe connection configuration via Block Kit | Decisions (MVP) | P0 |
| REQ-MS-012 | Implement registration confirmation email template with beautiful default styling (no WYSIWYG) | Decisions (#8) | P0 |
| REQ-MS-013 | Create empty state UI with copy "Your first member is one link away" when no members exist | Decisions (MVP) | P1 |

---

## Convene Plugin Requirements (10)

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| REQ-CV-001 | Implement `definePlugin` registration function for Convene plugin to register with EmDash | PRD | P0 |
| REQ-CV-002 | Build event creation form for single-form event setup (title, date, time, description, capacity, price) | Decisions (MVP) | P0 |
| REQ-CV-003 | Build event registration flow for attendees to sign up for events | Decisions (MVP) | P0 |
| REQ-CV-004 | Integrate Stripe Checkout for one-time event registration payment | Decisions (MVP) | P0 |
| REQ-CV-005 | Implement Stripe webhook handler to process payment events | Decisions (MVP) | P0 |
| REQ-CV-006 | Create attendee list per event with member visibility | Decisions (MVP) | P0 |
| REQ-CV-007 | Create admin event list UI with cursor-based pagination via Block Kit | Decisions (MVP) | P0 |
| REQ-CV-008 | Create admin settings UI for Stripe connection configuration via Block Kit | Decisions (MVP) | P0 |
| REQ-CV-009 | Implement registration confirmation email template with beautiful default styling (no WYSIWYG) | Decisions (#8) | P0 |
| REQ-CV-010 | Create empty state UI with copy "Your first event is 60 seconds away" when no events exist | Decisions (MVP) | P1 |

---

## Shared/Infrastructure Requirements (23)

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| REQ-SHARED-001 | Use Stripe as single source of truth for all subscription state | Decisions (#2) | P0 |
| REQ-SHARED-002 | Query Stripe for subscription state and cache briefly in KV with 60-second TTL for display | Decisions (#2) | P0 |
| REQ-SHARED-003 | Use D1 (SQLite) for all entities requiring filter, sort, or pagination operations | Decisions (#3) | P0 |
| REQ-SHARED-004 | Implement cursor-based pagination for all admin list endpoints from v1 | Decisions (#4) | P0 |
| REQ-SHARED-005 | Achieve installation-to-first-success (event published or plan created) within 60 seconds | Decisions (#5) | P0 |
| REQ-SHARED-006 | Use conversational language (not technical jargon) in all UI copy and email templates | Decisions (#6) | P1 |
| REQ-SHARED-007 | Never persist subscription state in KV storage; only use KV for auth tokens and session cache | Decisions (#2) | P0 |
| REQ-SHARED-008 | Display "Syncing..." visual indicator when Stripe request exceeds 2 seconds | Decisions (Open Q1) | P1 |
| REQ-SHARED-009 | Implement E2E test coverage for all payment workflows | Decisions (#9) | P0 |
| REQ-SHARED-010 | Implement E2E tests for subscription lifecycle events and payment event handling | Decisions (#9) | P0 |
| REQ-SHARED-011 | Implement unit tests for all API routes in both plugins | PRD (Quality) | P0 |
| REQ-SHARED-012 | Implement TypeScript strict mode with zero 'any' types in all code | PRD (Quality) | P0 |
| REQ-SHARED-013 | Provide comprehensive README documentation with installation and usage instructions | PRD (Quality) | P0 |
| REQ-SHARED-014 | Use idempotency keys on all Stripe payment operations to prevent duplicate charges | Decisions (Risk) | P0 |
| REQ-SHARED-015 | Implement alert mechanism for webhook signature validation failures | Decisions (Risk) | P1 |
| REQ-SHARED-016 | Use Resend for email delivery with proper SPF/DKIM configuration | Decisions (Risk) | P0 |
| REQ-SHARED-017 | Implement email send queue for handling >10 emails/second | Decisions (Risk) | P2 |
| REQ-SHARED-018 | Log all email send failures for monitoring and debugging | Decisions (Risk) | P1 |
| REQ-SHARED-019 | Load test admin dashboards at 10,000+ records before launch | Decisions (Risk) | P1 |
| REQ-SHARED-020 | Ensure access control decisions for content gating always verify with Stripe (never rely on stale cache) | Decisions (#2) | P0 |
| REQ-SHARED-021 | Version D1 schema to support future migrations | Decisions (Risk) | P1 |
| REQ-SHARED-022 | Never delete columns in v1.x D1 schema to maintain backward compatibility | Decisions (Risk) | P1 |
| REQ-SHARED-023 | Create migration scripts for any D1 schema changes | Decisions (Risk) | P1 |

---

## Explicitly NOT in v1 (Cut Scope)

Per Decision #7, the following are explicitly excluded:

- Event series / recurring events
- Event categories / tags
- Venue management
- Group/corporate memberships
- Multi-step registration wizards
- Cohort analysis / LTV / conversion funnels
- PayPal or any non-Stripe payment processor
- CSV import/export
- Developer webhooks with HMAC signing
- WYSIWYG email editor
- Attendee comments / discussion threads
- iCal export (deprioritized from original PRD)
- Calendar view component (deprioritized from original PRD)

---

## Locked Decisions Summary

| # | Decision | Winner |
|---|----------|--------|
| 1 | Keep "MemberShip", rename EventDash to "Convene" | Steve |
| 2 | Stripe is source of truth for subscription state | Elon |
| 3 | D1 (SQLite) for all list operations | Elon |
| 4 | Cursor pagination required from v1 | Consensus |
| 5 | 60-second first-run benchmark | Steve |
| 6 | Conversational UI copy, not technical jargon | Steve |
| 7 | Cut Phase 5 entirely | Elon |
| 8 | Beautiful email templates, no WYSIWYG | Steve |
| 9 | E2E test coverage required for payment software | Consensus |

---

## Open Questions (Pending Resolution)

1. **Caching Strategy**: 60-second TTL for Stripe cache; "Syncing..." indicator when >2s. Needs UX design.
2. **D1 Migration Path**: Fresh start (no existing production data to migrate).
3. **Shared Stripe Integration**: Leaning toward shared connection (aligns with 60-second benchmark).
4. **Empty State Copy**: Approved as stated in MVP.

---

## Traceability

Every task in `phase-1-plan.md` traces back to at least one requirement in this document.
Every requirement in this document is covered by at least one task.

**Coverage Status:** 46/46 requirements mapped (100%)
