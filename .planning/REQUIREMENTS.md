# MemberShip Plugin - Atomic Requirements Specification

**Product:** MemberShip Plugin for Emdash CMS
**Project Slug:** finish-plugins
**Generated:** April 11, 2026
**Sources:** decisions.md (Consolidated Board Decisions), EMDASH-GUIDE.md (Plugin Architecture)

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

## Requirements Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Blocker | 7 | Ship Gate Checklist items - must complete before launch |
| P1-Must | 18 | Core MVP functionality from locked decisions |
| P2-Risk | 6 | Risk mitigation requirements |
| P3-Cut | 6 | Explicitly NOT in v1 |
| **Total** | **37** | |

---

## Critical Overrides (decisions.md Locked)

| Topic | Previous State | Locked Decision |
|-------|----------------|-----------------|
| Product Name | Various | **MemberShip** (searchable, obvious) |
| Ship Sequence | Both together | **MemberShip ships FIRST, alone** |
| Empty State | Demo data | **Empty state with clear CTA** |
| Admin UI | Basic | **Equal design investment as customer-facing** |
| Copy Style | Corporate | **Terse, confident, warm (3-word principle)** |
| Permission Model | Multi-tier | **Two tiers only: Members vs Non-Members** |
| Documentation | Follow-up | **Complete BEFORE ship (blocker)** |
| Webhook Testing | Optional | **Kill-test required before ship** |

---

## P0-BLOCKER (Ship Gate Checklist)

### REQ-001: Deploy to Real EmDash Site
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Section VI

**Description:**
Must deploy MemberShip to one real EmDash site in production mode (not test environment).

**Acceptance Criteria:**
- [ ] Deployed to production EmDash instance
- [ ] Not test/staging environment
- [ ] Demonstrates real-world integration capability
- [ ] Plugin loads and renders correctly

---

### REQ-002: Three Real Stripe Transactions
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Section VI

**Description:**
Process 3 production Stripe transactions with real cards before shipping.

**Acceptance Criteria:**
- [ ] Production mode (not test mode)
- [ ] Real credit card transactions
- [ ] Validates complete payment flow end-to-end
- [ ] Member record created correctly after payment

---

### REQ-003: Webhook Failure Recovery Verified
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Decision 8

**Description:**
Kill-test webhook failure: interrupt webhook mid-transaction, confirm system recovers and provides member access. Prevents customer service nightmare of payment succeeding but access denied.

**Acceptance Criteria:**
- [ ] Kill webhook during active transaction
- [ ] Stripe payment completes despite webhook failure
- [ ] System detects and recovers from failure
- [ ] Member eventually gets access (manual or automatic recovery)
- [ ] Customer not charged without access

---

### REQ-004: Documentation Complete
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Decision 7

**Description:**
All 4 documentation sections must be complete and accurate before ship. "PENDING" documentation with "SHIP" status is self-deception.

**Acceptance Criteria:**
- [ ] Installation.md completed
- [ ] Configuration.md completed
- [ ] API-reference.md completed
- [ ] Troubleshooting.md completed
- [ ] All docs accurate and tested

---

### REQ-005: Admin Dashboard Beautiful
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Decision 4

**Description:**
Admin dashboard must receive equal design investment as customer-facing UI. For the first 6 months, the admin panel IS the product. Ugly admin = abandoned installs.

**Acceptance Criteria:**
- [ ] Not spreadsheet-like
- [ ] Beautiful, polished design
- [ ] Mobile-responsive
- [ ] Professional UI elements
- [ ] Design parity with customer-facing components

---

### REQ-006: Admin Authentication Exists
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Section IV Open Question #6

**Description:**
Current gap: "Anyone with endpoint can modify members." Must implement admin authentication to prevent unauthorized access.

**Acceptance Criteria:**
- [ ] Admin endpoints require authentication
- [ ] Verify `user.isAdmin === true` on all admin routes
- [ ] Prevent unauthorized member modification
- [ ] Security audit completed

---

### REQ-007: Brand Voice Applied Throughout
- **Category:** Ship-Gate
- **Priority:** P0
- **Source:** decisions.md Decision 5

**Description:**
All copy must follow "terse, confident, warm" style using the 3-word principle. Maya Angelou's rewrites adopted.

**Acceptance Criteria:**
- [ ] 3-word principle applied where possible
- [ ] No passive voice
- [ ] No technical jargon visible to users
- [ ] Success messages follow approved copy (e.g., "They're in. Welcome email sent.")
- [ ] CTA buttons are clear and warm

---

## P1-MUST (Core MVP Features)

### MVP Feature Set from decisions.md Section II

### REQ-008: Stripe Checkout + Webhooks
- **Category:** Payment
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Core Stripe payment flow with checkout session creation and webhook handling.

**Technical Reference:** EMDASH-GUIDE.md Section 6 (Plugin System) - Routes and HTTP capabilities

**Acceptance Criteria:**
- [ ] Stripe checkout session creation
- [ ] Webhook handler for payment events
- [ ] Signature verification (HMAC-SHA256)
- [ ] Idempotency handling for duplicate events
- [ ] Error recovery logging

---

### REQ-009: KV Member Storage
- **Category:** Storage
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Store member data in KV with status, plan, expiration tracking. KV acceptable for <1,000 records in v1.

**Technical Reference:** EMDASH-GUIDE.md Section 6 - ctx.kv (Key-value store)

**Acceptance Criteria:**
- [ ] Member records stored in KV
- [ ] Schema: status, plan_id, expiration_date, created_at
- [ ] KV key pattern: `member:{encoded_email}`
- [ ] Handles <1,000 records efficiently
- [ ] Migration path to D1 documented for future scaling

---

### REQ-010: Email Confirmation (Resend)
- **Category:** Communication
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Send terse, warm confirmation emails via Resend integration.

**Technical Reference:** EMDASH-GUIDE.md Section 6 - ctx.email (capability-gated)

**Acceptance Criteria:**
- [ ] Resend integration working
- [ ] Welcome email on registration
- [ ] Payment receipt email
- [ ] Cancellation confirmation email
- [ ] Copy follows brand voice (terse, warm)

---

### REQ-011: Admin Dashboard
- **Category:** UI
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Beautiful admin dashboard for member management. NOT spreadsheet-like.

**Technical Reference:** EMDASH-GUIDE.md Section 6 - admin.pages, Block Kit

**Acceptance Criteria:**
- [ ] Member list with pagination
- [ ] Member detail view
- [ ] Manual approve/revoke actions
- [ ] Mark-paid functionality
- [ ] Beautiful design (Steve's requirement)

---

### REQ-012: Basic Reporting API
- **Category:** Analytics
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Minimal reporting API with basic metrics. API exists before rich UI.

**Acceptance Criteria:**
- [ ] GET /reports/members endpoint
- [ ] GET /reports/revenue endpoint
- [ ] Member count metrics
- [ ] Plan distribution metrics
- [ ] Minimal UI sufficient for v1

---

### REQ-013: Two Permission Tiers Only
- **Category:** Auth
- **Priority:** P1
- **Source:** decisions.md Decision 6

**Description:**
Exactly two permission tiers: Members and Non-Members. Delete GroupRecord code (~500 lines).

**Acceptance Criteria:**
- [ ] Only 2 permission states implemented
- [ ] No groups, roles, or corporate structures
- [ ] GroupRecord code removed if present
- [ ] Permission checks are binary (member or not)

---

### REQ-014: Single-Form Registration
- **Category:** UX
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
90% of signups are single-form. No multi-step wizards in v1.

**Acceptance Criteria:**
- [ ] Single-page registration form
- [ ] Clean, beautiful design
- [ ] Minimal required fields
- [ ] No wizard/multi-step flow

---

### REQ-015: Empty State with Clear CTA
- **Category:** UX
- **Priority:** P1
- **Source:** decisions.md Decision 3

**Description:**
When no members exist, show empty state with clear CTA. No demo data generation.

**Acceptance Criteria:**
- [ ] Empty state view when member count = 0
- [ ] "Create Your First Member" CTA button
- [ ] No demo data generation logic
- [ ] No cleanup flows for demo data

---

### REQ-016: Product Name "MemberShip"
- **Category:** Brand
- **Priority:** P1
- **Source:** decisions.md Decision 1

**Description:**
All references use "MemberShip" (not "Circle" or alternatives). SEO-discoverable naming.

**Acceptance Criteria:**
- [ ] Plugin ID uses "membership"
- [ ] All UI labels use "MemberShip"
- [ ] Documentation uses "MemberShip"
- [ ] Meta tags include "MemberShip" for SEO

---

### REQ-017: Ship MemberShip First (Alone)
- **Category:** Delivery
- **Priority:** P1
- **Source:** decisions.md Decision 2

**Description:**
MemberShip ships independently. EventDash follows AFTER production validation.

**Acceptance Criteria:**
- [ ] MemberShip can deploy standalone
- [ ] No dependencies on EventDash
- [ ] EventDash deployment blocked until MemberShip validated

---

### REQ-018: Webhook Signature Verification
- **Category:** Security
- **Priority:** P1
- **Source:** EMDASH-GUIDE.md Plugin Security

**Description:**
All Stripe webhooks must verify signature using HMAC-SHA256.

**Technical Reference:** EMDASH-GUIDE.md mentions signature verification for webhooks

**Acceptance Criteria:**
- [ ] Raw body preserved for signature verification
- [ ] HMAC-SHA256 verification implemented
- [ ] Invalid signatures rejected with 400
- [ ] Timing-safe comparison used

---

### REQ-019: JWT Authentication
- **Category:** Auth
- **Priority:** P1
- **Source:** Current implementation pattern

**Description:**
JWT tokens for member authentication with secure cookie storage.

**Technical Reference:** Uses Web Crypto API (`crypto.subtle.sign`)

**Acceptance Criteria:**
- [ ] Access token (15-min expiry)
- [ ] Refresh token (7-day expiry)
- [ ] httpOnly, Secure, SameSite=Strict cookies
- [ ] No external JWT libraries (Web Crypto only)

---

### REQ-020: Error Handling & Recovery
- **Category:** Reliability
- **Priority:** P1
- **Source:** EMDASH-GUIDE.md Plugin Error Handling

**Description:**
Graceful error handling for all payment and webhook operations.

**Acceptance Criteria:**
- [ ] Download errors caught and reported
- [ ] Webhook failures logged
- [ ] Clear error messages to users
- [ ] Admin notification on critical failures

---

### REQ-021: Rate Limiting
- **Category:** Security
- **Priority:** P1
- **Source:** Risk mitigation

**Description:**
Protect endpoints from abuse with rate limiting.

**Acceptance Criteria:**
- [ ] Rate limiting on registration endpoint
- [ ] Rate limiting on admin endpoints
- [ ] Clear 429 responses when limited

---

### REQ-022: Plans Configuration
- **Category:** Config
- **Priority:** P1
- **Source:** Current implementation

**Description:**
Configurable membership plans (free, pro, premium).

**Acceptance Criteria:**
- [ ] Multiple plan support
- [ ] Plan pricing configuration
- [ ] Plan feature differentiation
- [ ] Admin plan management

---

### REQ-023: Member Status Lifecycle
- **Category:** Business Logic
- **Priority:** P1
- **Source:** Core functionality

**Description:**
Complete member status lifecycle: pending -> active -> expired/cancelled.

**Acceptance Criteria:**
- [ ] Pending status on registration
- [ ] Active status on payment/approval
- [ ] Expired status on plan end
- [ ] Cancelled status on user action
- [ ] Status transitions audited

---

### REQ-024: Admin Manual Actions
- **Category:** Admin
- **Priority:** P1
- **Source:** decisions.md MVP Feature Set

**Description:**
Admin can manually approve, revoke, or mark-paid members.

**Acceptance Criteria:**
- [ ] Approve pending member
- [ ] Revoke active member
- [ ] Mark member as paid (for manual payments)
- [ ] All actions logged

---

### REQ-025: Cancel Subscription Flow
- **Category:** UX
- **Priority:** P1
- **Source:** Core functionality

**Description:**
Members can cancel their subscription from dashboard.

**Acceptance Criteria:**
- [ ] Cancel button in member dashboard
- [ ] Confirmation before cancel
- [ ] Stripe subscription cancelled
- [ ] Cancellation email sent

---

## P2-RISK (Risk Mitigation Requirements)

### REQ-026: Webhook Idempotency
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Register - Webhook failure loses payment

**Description:**
Prevent duplicate processing of webhook events. Current implementation has race condition between check and set.

**Acceptance Criteria:**
- [ ] Atomic idempotency check (not check-then-set)
- [ ] 24-hour TTL on idempotency keys
- [ ] No duplicate charges possible
- [ ] No duplicate emails possible

---

### REQ-027: Email Sending Resilience
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - Silent email failures

**Description:**
Handle email sending failures gracefully with retry or notification.

**Acceptance Criteria:**
- [ ] Log email failures with context
- [ ] Retry transient failures
- [ ] Alert admin on persistent failures
- [ ] Member still registered even if email fails

---

### REQ-028: Admin Audit Logging
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - No audit logging

**Description:**
Log all admin actions for security and debugging.

**Acceptance Criteria:**
- [ ] Log admin authentication attempts
- [ ] Log member modifications (approve, revoke, mark-paid)
- [ ] Include user ID, timestamp, action, target
- [ ] Rate limit failed admin auth attempts

---

### REQ-029: Input Validation
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - Input validation gaps

**Description:**
Validate all inputs to prevent injection and data corruption.

**Acceptance Criteria:**
- [ ] Email format validation
- [ ] Date format validation (YYYY-MM-DD)
- [ ] URL validation for callbacks
- [ ] Numeric range validation (price, capacity)
- [ ] XSS prevention on text inputs

---

### REQ-030: Stripe Key Validation
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - Stripe secret key handling

**Description:**
Validate Stripe keys at startup, not at request time.

**Acceptance Criteria:**
- [ ] Validate STRIPE_SECRET_KEY format (starts with `sk_`)
- [ ] Validate STRIPE_WEBHOOK_SECRET format (starts with `whsec_`)
- [ ] Fail fast if keys invalid or missing
- [ ] Clear error messages for configuration issues

---

### REQ-031: KV Scale Monitoring
- **Category:** Risk
- **Priority:** P2
- **Source:** decisions.md Risk Register

**Description:**
Monitor KV usage and plan D1 migration path.

**Acceptance Criteria:**
- [ ] Track member count metrics
- [ ] Alert at 80% of 1,000 record threshold
- [ ] D1 migration documentation ready
- [ ] Migration script prepared for v2

---

## P3-CUT (Explicitly NOT in v1)

These features are LOCKED as CUT. Do NOT implement:

### CUT-001: Group/Corporate Memberships
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** Zero customers asked for this feature
- **Revisit:** When customer requests validate need

### CUT-002: Developer Webhooks (HMAC)
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** Zero integrations exist yet
- **Revisit:** When integration requests emerge

### CUT-003: Drip Content Scheduling
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** Zero content libraries exist
- **Revisit:** When content libraries are built

### CUT-004: Multi-Payment Gateways
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** Stripe is 95% of market
- **Revisit:** v2 if PayPal requests significant

### CUT-005: Multi-Step Registration
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** 90% of signups are single-form
- **Revisit:** If conversion data suggests need

### CUT-006: Coupon Engine
- **Source:** decisions.md MVP Feature Set - Cut
- **Rationale:** Premature optimization
- **Revisit:** When revenue requires discounting

---

## Current Implementation Status

### What's Already Built (from Codebase Scout)

| Feature | Status | Files | Notes |
|---------|--------|-------|-------|
| Email-based registration | Complete | sandbox-entry.ts | Works |
| Two permission tiers | Complete | sandbox-entry.ts | Binary check |
| JWT authentication | Complete | auth.ts | 15-min/7-day tokens |
| KV member storage | Complete | sandbox-entry.ts | Works |
| Stripe integration | Complete | sandbox-entry.ts | Payment links |
| Webhook handler | Complete | sandbox-entry.ts | Needs kill-test |
| Email automation | Complete | email.ts | 7 templates |
| Member dashboard | Complete | MemberDashboard.astro | 476 lines |
| Content gating | Complete | gating.ts | 271 lines |
| Admin dashboard | Complete | AdminReporting.astro | 1,049 lines |

### What Needs Work (Gaps Identified)

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| Webhook kill-test verification | P0 | 1 day | Ship blocker |
| Admin auth hardening | P0 | 1 day | Ship blocker |
| Documentation completion | P0 | 2 days | 4 docs required |
| Brand voice audit | P0 | 1 day | Maya's 3-word principle |
| Empty state implementation | P1 | 4 hours | CTA for first member |
| Remove GroupRecord code | P1 | 4 hours | ~500 lines cut |
| Deploy to real site | P0 | 1 day | Production validation |
| 3 real transactions | P0 | 1 day | Payment validation |

---

## Technical Debt (Accepted for v1)

Per decisions.md Section IX - Accept for v1:

| Debt | Impact | Status |
|------|--------|--------|
| KV architecture at current scale | Acceptable <1K records | Accepted |
| ~60% code duplication with EventDash | Medium maintenance burden | Accepted |
| 4,000-line monolith (sandbox-entry.ts) | High cognitive load | Refactor after revenue |

---

## File Structure (Current State)

```
/home/agent/shipyard-ai/plugins/membership/
├── src/
│   ├── sandbox-entry.ts          (3,984 lines - monolith)
│   ├── index.ts                  (31 lines - descriptor)
│   ├── auth.ts                   (209 lines - JWT)
│   ├── email.ts                  (580 lines - templates)
│   ├── gating.ts                 (271 lines - content access)
│   ├── astro/
│   │   ├── index.ts              (17 lines)
│   │   ├── MemberPortal.astro    (718 lines)
│   │   ├── RegistrationForm.astro (1,115 lines)
│   │   ├── MemberDashboard.astro (476 lines)
│   │   ├── AdminReporting.astro  (1,049 lines)
│   │   ├── GroupManagement.astro (1,086 lines) <- CUT, should be removed
│   │   └── GatedContent.astro    (246 lines)
│   └── __tests__/
│       ├── integration.test.ts   (1,036 lines)
│       └── helpers.ts            (367 lines)
├── README.md                     (existing documentation)
├── API.md                        (existing API docs)
├── package.json
└── vitest.config.ts
```

---

## Documentation Requirements (from decisions.md)

Per REQ-004, all docs must exist at:
```
membership/docs/
├── installation.md      # How to install plugin
├── configuration.md     # Stripe, Resend, KV setup
├── api-reference.md     # All 52+ endpoints documented
└── troubleshooting.md   # Common issues and solutions
```

---

## Ship Test

> Does the admin see their first member registered and think "I built that"?
>
> **If yes, ship it.**

---

## Open Questions (Blocking Launch)

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which real EmDash site for deployment? | Engineering | Pending |
| 2 | Stripe production keys available? | Infrastructure | Pending |
| 3 | Resend production credentials? | Infrastructure | Pending |

---

*Generated by Great Minds Agency - Phase Planning Skill*
*Source: rounds/finish-plugins/decisions.md, CLAUDE.md*
*Project Slug: finish-plugins*
