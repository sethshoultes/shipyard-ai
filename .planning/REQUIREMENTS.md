# MemberShip v1 — Requirements Specification

**Generated**: April 12, 2026
**Source**: `/home/agent/shipyard-ai/rounds/finish-plugins/decisions.md`
**Project**: finish-plugins
**Plugin**: MemberShip (ships first, alone)

---

## I. Ship Blockers (Critical)

All requirements in this section MUST be completed before MemberShip can ship.

### REQ-SHIP-001: Production Deployment
- **Description**: Deploy MemberShip to one real EmDash site (Sunrise Yoga)
- **Verification**: Production URL accessible at `https://yoga.shipyard.company/_emdash/admin`, logs show traffic
- **Dependencies**: REQ-RISK-002 (Admin Auth), REQ-RISK-003 (Status Endpoint)
- **Source**: decisions.md Section VII, Line 321

### REQ-SHIP-002: Real Stripe Transactions
- **Description**: Complete three real Stripe transactions in production mode
- **Verification**: Production mode receipts with real cards and real money
- **Dependencies**: REQ-SHIP-001 (deployment), Stripe API configured
- **Source**: decisions.md Section VII, Line 322

### REQ-SHIP-003: Webhook Kill-Test
- **Description**: Verify webhook failure recovery by killing webhook mid-transaction
- **Verification**: Customer pays (Stripe confirms) but system denies access; confirm recovery without customer contact required
- **Dependencies**: REQ-RISK-001 (webhook handling)
- **Source**: decisions.md Section VII, Line 323

### REQ-SHIP-004: Installation Documentation
- **Description**: Create `/docs/installation.md` with complete installation steps
- **Verification**: File exists, covers all installation steps, accurate
- **Dependencies**: All features implemented
- **Source**: decisions.md Section II, Lines 94-98

### REQ-SHIP-005: Configuration Documentation
- **Description**: Create `/docs/configuration.md` covering all configuration options
- **Verification**: File exists, documents all env vars, Stripe setup
- **Dependencies**: All features implemented
- **Source**: decisions.md Section II, Lines 94-98

### REQ-SHIP-006: API Reference Documentation
- **Description**: Create `/docs/api-reference.md` documenting all endpoints
- **Verification**: File exists, documents all REST endpoints and responses
- **Dependencies**: All API endpoints implemented
- **Source**: decisions.md Section II, Lines 94-98

### REQ-SHIP-007: Troubleshooting Documentation
- **Description**: Create `/docs/troubleshooting.md` with common issues and solutions
- **Verification**: File exists, addresses common issues
- **Dependencies**: All features implemented
- **Source**: decisions.md Section II, Lines 94-98

### REQ-SHIP-008: Beautiful Admin Dashboard
- **Description**: Admin dashboard must be beautiful, not spreadsheet-like
- **Verification**: Design review confirms equal investment to customer-facing UI
- **Dependencies**: REQ-DECISION-4 (Admin UI Quality)
- **Source**: decisions.md Decision 4, Lines 48-53

### REQ-SHIP-009: Admin Authentication
- **Description**: All admin endpoints require authentication
- **Verification**: Unauthorized requests to `/membership/approve`, `/membership/revoke` return 401/403
- **Dependencies**: REQ-RISK-002
- **Source**: decisions.md Section VII, Line 327

### REQ-SHIP-010: Status Endpoint Secured
- **Description**: `/membership/status` endpoint secured against email enumeration
- **Verification**: Endpoint requires auth OR email lookup capability removed
- **Dependencies**: REQ-RISK-003
- **Source**: decisions.md Section VII, Line 328

### REQ-SHIP-011: Version Number Unified
- **Description**: Version 1.0.0 everywhere
- **Verification**: README.md, API.md, package.json all show 1.0.0
- **Dependencies**: REQ-RISK-004
- **Source**: decisions.md Section VII, Line 329

### REQ-SHIP-012: Brand Voice Applied
- **Description**: All copy uses terse, confident, warm voice
- **Verification**: Manual review confirms 3-word principle applied where possible
- **Dependencies**: REQ-BRAND-001 through REQ-BRAND-007
- **Source**: decisions.md Decision 5, Lines 57-67

### REQ-SHIP-013: Compassionate Error Messages
- **Description**: All error messages are user-friendly
- **Verification**: No "404: Member not found" style messages remain
- **Dependencies**: Copy review
- **Source**: decisions.md Section VII, Line 331

---

## II. Risk Mitigations (Must Fix Before Ship)

### REQ-RISK-001: Webhook Failure Recovery
- **Risk**: Webhook failure loses payment
- **Likelihood**: Medium
- **Impact**: Critical
- **Mitigation**: Kill-test before ship. Customer pays but doesn't get access = nightmare.
- **Verification**: Kill webhook mid-transaction, confirm system recovers
- **Source**: decisions.md Section VI, Line 297

### REQ-RISK-002: Admin Authentication
- **Risk**: No admin authentication on approve/revoke endpoints
- **Likelihood**: High
- **Impact**: Critical
- **Mitigation**: Add `isAdmin` checks to approve, revoke, mark-paid endpoints
- **Verification**: Unauthenticated requests return 401/403
- **Source**: decisions.md Section VI, Line 299
- **Files Affected**: `sandbox-entry.ts` lines 1240-1342

### REQ-RISK-003: Status Endpoint Privacy
- **Risk**: `GET /membership/status?email=...` exposes membership data without auth
- **Likelihood**: High
- **Impact**: Critical
- **Mitigation**: Require auth OR remove email parameter visibility
- **Verification**: Email enumeration attack fails
- **Source**: decisions.md Section VI, Line 300
- **Files Affected**: `sandbox-entry.ts` lines 1138-1210

### REQ-RISK-004: Version Inconsistency
- **Risk**: Three different versions erode trust (README 3.0.0, API 1.5.0, package.json 1.0.0)
- **Likelihood**: High
- **Impact**: Medium
- **Mitigation**: Unify to 1.0.0 everywhere
- **Verification**: grep -r "version" shows 1.0.0 only
- **Source**: decisions.md Section VI, Line 302

### REQ-RISK-005: Hallucinated API Pattern
- **Risk**: 114 instances of `throw new Response` incompatible with EmDash
- **Likelihood**: High
- **Impact**: High
- **Mitigation**: Mechanical find-and-replace to EmDash API pattern
- **Verification**: grep "throw new Response" returns 0 results
- **Source**: decisions.md Section VI, Line 303
- **Files Affected**: `sandbox-entry.ts` (114 instances)

### REQ-RISK-006: No Production Validation
- **Risk**: Zero production deployments exist
- **Likelihood**: High
- **Impact**: Critical
- **Mitigation**: Deploy to Sunrise Yoga this week
- **Verification**: Production URL serves traffic
- **Source**: decisions.md Section VI, Line 298

### REQ-RISK-007: Documentation Incomplete
- **Risk**: "PENDING" documentation with "SHIP" status is self-deception
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: All four docs complete before ship
- **Verification**: All docs pass review
- **Source**: decisions.md Section II, Line 92

---

## III. MVP Features (What Ships)

### REQ-MVP-001: Stripe Checkout + Webhooks
- **Description**: Core payment flow with Stripe
- **Acceptance**: Payment completes, HMAC signature verified, webhook processes
- **Status**: IMPLEMENTED (needs banned pattern fix)
- **Source**: decisions.md Section III, Line 148
- **EmDash Reference**: docs/EMDASH-GUIDE.md Section 6 - Plugin hooks `content:afterSave`

### REQ-MVP-002: KV Member Storage
- **Description**: Member records stored in KV
- **Acceptance**: Status, plan, expiration persisted
- **Status**: IMPLEMENTED
- **Note**: Acceptable for <1,000 records
- **Source**: decisions.md Section III, Line 149
- **EmDash Reference**: docs/EMDASH-GUIDE.md Section 6 - `ctx.kv` plugin storage

### REQ-MVP-003: Email Confirmation (Resend)
- **Description**: Registration triggers welcome email
- **Acceptance**: Email uses Maya Angelou's warm copy
- **Status**: IMPLEMENTED
- **Source**: decisions.md Section III, Line 150
- **EmDash Reference**: docs/EMDASH-GUIDE.md Section 6 - `ctx.email.send()` capability

### REQ-MVP-004: Admin Dashboard
- **Description**: Beautiful admin UI via Block Kit
- **Acceptance**: Not spreadsheet-like, equal design investment
- **Status**: IMPLEMENTED (review needed)
- **Source**: decisions.md Section III, Line 151
- **EmDash Reference**: docs/EMDASH-GUIDE.md Section 6 - Block Kit for sandboxed plugins

### REQ-MVP-005: Basic Reporting API
- **Description**: Two metrics: members count, revenue total
- **Acceptance**: No vanity metrics
- **Status**: IMPLEMENTED
- **Source**: decisions.md Section III, Line 152

### REQ-MVP-006: Two Permission Tiers
- **Description**: Members vs everyone else only
- **Acceptance**: No Bronze/Silver/Gold complexity
- **Status**: IMPLEMENTED
- **Source**: decisions.md Decision 6, Lines 72-76

### REQ-MVP-007: Single-Form Registration
- **Description**: Email only, no password maze
- **Acceptance**: Registration form has email field only
- **Status**: IMPLEMENTED
- **Source**: decisions.md Section III, Line 154

### REQ-MVP-008: JWT Authentication
- **Description**: Secure token-based auth
- **Acceptance**: httpOnly cookies, 15-min access, 7-day refresh
- **Status**: IMPLEMENTED
- **Source**: decisions.md Section III, Line 155
- **EmDash Reference**: docs/EMDASH-GUIDE.md Section 3 - passkey-first auth pattern

### REQ-MVP-009: Empty State with CTA
- **Description**: "Create Your First Member" CTA on install
- **Acceptance**: No demo data, clear call-to-action
- **Status**: IMPLEMENTED
- **Source**: decisions.md Decision 3, Lines 38-44

---

## IV. Brand/Copy Requirements

### REQ-BRAND-001: Product Description
- **Old**: "Email-based membership plugin..."
- **New**: "Turn visitors into members. Gate your best content. Get paid."
- **Source**: Maya Angelou rewrite, decisions.md Line 64

### REQ-BRAND-002: Welcome Email Header
- **Old**: "Welcome email — Sent on successful registration"
- **New**: "The first hello. So members feel received, not processed."
- **Source**: Maya Angelou rewrite, decisions.md Line 65

### REQ-BRAND-003: Access Description
- **Old**: "Full access with email support"
- **New**: "Everything we make. Every course, every guide, every tool."
- **Source**: Maya Angelou rewrite, decisions.md Line 66

### REQ-BRAND-004: Success Messages
- **Kill**: "successfully," "submitted," "confirmed"
- **Use**: "Done," "Saved," "Live"
- **Source**: decisions.md Decision 5, Line 60

### REQ-BRAND-005: Error Messages
- **Kill**: "error occurred"
- **Use**: "Oops"
- **Source**: decisions.md Decision 5, Line 60

### REQ-BRAND-006: Three-Word Principle
- **Rule**: Use 3 words where competitors use 12
- **Source**: decisions.md Decision 5, Line 57

### REQ-BRAND-007: Voice Characteristics
- **Required**: Terse, confident, warm
- **Forbidden**: Generic, formal
- **Source**: decisions.md Decision 5, Line 57

---

## V. Technical Debt Accepted (OK to Defer)

### REQ-DEBT-001: 4,000-Line Monolith
- **Scope**: sandbox-entry.ts
- **Refactor Target**: v2 (after revenue)
- **Source**: decisions.md Line 273

### REQ-DEBT-002: ~60% Code Duplication
- **Scope**: Stripe integration, email, auth patterns
- **Refactor Target**: Extract to /shared in v2
- **Source**: decisions.md Line 269

### REQ-DEBT-003: Demo Data Deferred
- **Scope**: Sofia Chen fake member
- **Ship Target**: v1.1
- **Source**: decisions.md Decision 3, Line 42

### REQ-DEBT-004: Analytics Dashboards
- **Scope**: Chart.js visualizations
- **Ship Target**: v2
- **Note**: "Members and money" sufficient for v1
- **Source**: decisions.md Line 172

### REQ-DEBT-005: Multi-Gateway Support
- **Scope**: PayPal stub removed
- **Ship Target**: v2 when integrations requested
- **Note**: Stripe = 95% of market
- **Source**: decisions.md Line 167

### REQ-DEBT-006: Email Queue Infrastructure
- **Scope**: Resend direct, no queue
- **Monitor**: 500-person event stress test
- **Source**: decisions.md Open Question 4, Line 286

---

## VI. Decision Locks (Cannot Change)

| ID | Decision | Winner | Source |
|----|----------|--------|--------|
| DECISION-1 | Product name: MemberShip (not "Belong") | Elon | Line 18 |
| DECISION-2 | Ship sequence: MemberShip alone first | Elon | Line 31 |
| DECISION-3 | First-run: Empty state with CTA (no demo) | Elon | Line 42 |
| DECISION-4 | Admin UI: Beautiful, equal investment | Steve | Line 51 |
| DECISION-5 | Brand voice: Terse, confident, warm | Steve | Line 59 |
| DECISION-6 | Permissions: Two tiers only (Free/Paid) | Steve | Line 74 |
| DECISION-7 | Test sites: One per plugin (Sunrise Yoga) | Elon | Line 83 |
| DECISION-8 | Documentation: Ship blocker, not follow-up | Elon | Line 92 |
| DECISION-9 | Webhooks: Kill-test required | Elon | Line 106 |
| DECISION-10 | Playwright: Cut (manual verification OK) | Elon | Line 114 |

---

## VII. Verification Matrix

| Requirement | Wave | Verification Command | Pass Criteria |
|-------------|------|---------------------|---------------|
| REQ-RISK-005 | 1 | `grep -r "throw new Response" plugins/membership/src/` | 0 results |
| REQ-RISK-002 | 1 | Manual test: unauthenticated POST to /approve | 401 or 403 |
| REQ-RISK-003 | 1 | Manual test: GET /status?email=test | Auth required OR no email info |
| REQ-RISK-004 | 1 | `grep -r "version" plugins/membership/` | All show 1.0.0 |
| REQ-SHIP-004 | 2 | `test -f plugins/membership/docs/installation.md` | File exists |
| REQ-SHIP-005 | 2 | `test -f plugins/membership/docs/configuration.md` | File exists |
| REQ-SHIP-006 | 2 | `test -f plugins/membership/docs/api-reference.md` | File exists |
| REQ-SHIP-007 | 2 | `test -f plugins/membership/docs/troubleshooting.md` | File exists |
| REQ-SHIP-001 | 3 | `curl https://yoga.shipyard.company/membership/health` | 200 OK |
| REQ-SHIP-002 | 3 | Stripe Dashboard Production transactions | 3+ successful |
| REQ-SHIP-003 | 3 | Kill-test procedure documented | Recovery verified |

---

## VIII. EmDash Integration References

This plan cites the following sections from `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md`:

| Section | Topic | Relevance |
|---------|-------|-----------|
| **Section 1** | Getting Started | Port 4321, project structure |
| **Section 5** | Deployment | Cloudflare Workers, D1, R2 configuration |
| **Section 6** | Plugin System | Plugin hooks, capabilities, ctx.kv, ctx.email |
| **Section 6** | Block Kit | Admin UI for sandboxed plugins (JSON-described UI) |
| **Section 6** | Plugin Context | ctx.storage, ctx.kv, ctx.content, ctx.http, ctx.email |
| **Section 6** | Available Hooks | content:afterSave, plugin:install, etc. |

**EmDash Plugin Pattern (from docs/EMDASH-GUIDE.md Section 6):**
- Plugins use `definePlugin()` for runtime logic
- Storage via `ctx.storage.entries.put()` and `ctx.kv.get/put()`
- Email via `ctx.email.send()` capability
- Admin UI via Block Kit JSON blocks (not raw React for sandboxed plugins)
- Routes via `routes: { routeName: { handler: async (ctx) => { } } }`

---

## IX. Summary

**Total Requirements**: 43
- Ship Blockers: 13
- Risk Mitigations: 7
- MVP Features: 9
- Brand/Copy: 7
- Technical Debt (Accepted): 6
- Decision Locks: 10 (implicit)

**Critical Path**:
1. Fix security vulnerabilities (REQ-RISK-002, REQ-RISK-003)
2. Remove banned patterns (REQ-RISK-005: 114 instances)
3. Unify version to 1.0.0 (REQ-RISK-004)
4. Write 4 documentation files (REQ-SHIP-004 through REQ-SHIP-007)
5. Deploy to Sunrise Yoga (REQ-SHIP-001)
6. Complete 3 real transactions (REQ-SHIP-002)
7. Verify webhook recovery (REQ-SHIP-003)

**Ship Condition**: ALL gate criteria must pass. "PENDING" + "SHIP" is self-deception.

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/finish-plugins/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: finish-plugins*
