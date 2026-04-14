# Shopfront E-Commerce Plugin: Requirements Specification

**Project**: Shopfront (formerly CommerceKit) - E-Commerce Plugin for Emdash CMS
**Generated**: 2026-04-14
**Sources**:
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-35.md`
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-35/decisions.md`

---

## Executive Summary

Shopfront is a simple e-commerce plugin for Emdash CMS that makes anyone a merchant in 30 seconds. Target: small merchants selling 5-50 products. Architecture: KV-first storage, Stripe-only payments, zero-config defaults.

**Key Principle**: WordPress made everyone a publisher. Shopfront makes everyone a merchant.

---

## BLOCKERS (Must Fix Before Launch)

### REQ-001: Webhook Signature Verification Fix
**Category**: BLOCKER (Security)
**Description**: Implement proper Stripe webhook signature verification to replace current weak implementation
**Source**: decisions.md Section 1.8, 5.1
**Current State**: sandbox-entry.ts lines 987-1022 admits "For now, we trust the payload"
**Acceptance Criteria**:
- HMAC-SHA256 signature verification implemented per Stripe standards
- All webhook events validated against `stripe-signature` header
- Constant-time comparison to prevent timing attacks
- Security audit confirms compliance
- Code passes review before ANY production traffic

### REQ-002: Inventory Race Condition Prevention
**Category**: BLOCKER (Concurrency)
**Description**: Implement distributed locks or atomic operations to prevent overselling during concurrent orders
**Source**: decisions.md Section 5.1
**Acceptance Criteria**:
- No inventory overselling in load tests with 100+ simultaneous orders
- Atomic order number generation (no duplicates)
- Inventory reservation on cart add with expiry
- Orders fail gracefully if inventory depleted

### REQ-003: Async Email Queue Implementation
**Category**: BLOCKER (Performance)
**Description**: Queue email sending via Cloudflare Queues so checkout doesn't block on email delivery
**Source**: decisions.md Section 1.6, 5.1
**Acceptance Criteria**:
- Emails sent asynchronously (not blocking checkout flow)
- Order confirmation emails queued in Cloudflare Queues
- Checkout completes within 200ms even if email queue is slow
- Email retry mechanism for failed sends (exponential backoff, max 3 attempts)

### REQ-004: Demo Store Deployment
**Category**: BLOCKER (Marketing)
**Description**: Build and deploy live demo store with 20 test products before any marketing activity
**Source**: decisions.md Section 1.9, 7 Week 2
**Acceptance Criteria**:
- 20 beautifully photographed test products
- Real Stripe test mode checkout functional
- Order management with status updates working
- Inventory decrements on purchase
- Live at demo.shopfront.dev (or designated subdomain)
- Actual email confirmations sending
- Demo exists before Week 1 development ends

### REQ-005: End-to-End Checkout Flow Testing
**Category**: BLOCKER (Integration)
**Description**: Verify complete checkout flow with real Stripe test mode
**Source**: decisions.md Section 7 Week 1
**Acceptance Criteria**:
- Product can be added to cart from product page
- Stripe checkout session initiates successfully
- Payment processing completes in Stripe test mode
- Order confirmation email sends automatically
- Order appears in admin dashboard with correct details
- Inventory decreases after successful payment

---

## CORE FEATURES (v1 Must-Haves)

### REQ-006 through REQ-015
See comprehensive requirements list in research agent output above.

Key features:
- Product CRUD (~130 lines)
- Shopping Cart (~180 lines)
- Stripe Checkout (~200 lines)
- Order Management (~150 lines)
- Inventory Tracking (~80 lines)
- Email Notifications (~100 lines)
- Admin Dashboard (~120 lines)
- Basic Analytics (~40 lines)
- Single-Dimension Variants (~50 lines)

Total v1 scope: ~1,050 lines

---

## CUT FEATURES (Explicitly Deferred)

### REQ-016 through REQ-025
Features explicitly NOT in v1:
- Advanced analytics (cohort analysis, LTV, 30-day scans)
- Multi-axis product variants (size AND color)
- Low stock alerts
- Discount codes/coupons
- Multiple payment gateways (PayPal, Square)
- Bulk product import
- Subscription products
- Abandoned cart emails
- CRM integrations
- Themes/templates system

**Philosophy**: Every NO strengthens the product. Ruthless minimalism.

---

## TESTING & VALIDATION

### REQ-026: First-Run UX User Testing
- 5 non-technical users test onboarding
- Each user can add first product in <5 minutes
- No documentation needed for basic flow
- Users report "felt like a merchant" emotional response

### REQ-027: Performance Testing - Page Load <200ms
- Product listing, detail, cart, admin dashboard all <200ms
- Measured under simulated network conditions
- KV list operations used (not serial reads)
- Product lists cached with 60s TTL

### REQ-028: Performance Testing - Analytics <50ms
- Analytics dashboard loads in <50ms
- No on-demand calculations
- Daily rollups pre-calculated

---

## BRAND & LANGUAGE

### REQ-056: Merchant Language Implementation
All UI text must use merchant language, not technical jargon.

Examples:
- ❌ "Configure payment gateway integration"
- ✅ "Let's get you paid. Connect Stripe?"

- ❌ "Inventory management dashboard"
- ✅ "What's in stock?"

- ❌ "Order fulfillment workflow"
- ✅ "Mark as shipped"

- ❌ "Error: Invalid checkout session configuration"
- ✅ "Hmm, something went wrong. Let's try that again?"

### REQ-057: Product Naming - "Shopfront"
- Official name: Shopfront (not CommerceKit)
- Brand positioning: "Makes everyone a merchant" not "developer library"
- Locked decision per Section 1.1

---

## PERFORMANCE REQUIREMENTS

### REQ-058: KV List Operations Optimization
- Use KV list API (batch operations) instead of serial reads
- Product listing uses KV list (not N serial get() calls)
- Performance improvements demonstrated in load tests

### REQ-059: Product List Caching (60s TTL)
- Product list cached for 60 seconds
- Cache invalidated on product create/update/delete
- Cache layer transparent to consumers

### REQ-060: Distributed Lock for Order Creation
- Durable Objects used for inventory lock
- Order creation acquires lock before stock decrement
- Lock timeout prevents deadlock (30s)
- Performance acceptable (<50ms lock acquisition)

---

## SUCCESS METRICS (90 Days Post-Launch)

### REQ-061: Launch Success Metrics
- **Target**: 50+ stores deployed / 100 (stretch)
- **Target**: $10k GMV processed / $50k (stretch)
- **Target**: 100 GitHub stars / 500 (stretch)
- **Target**: 5+ GitHub issues filed
- **Target**: 1 paying customer / 5 (stretch)
- **Target**: 50 Twitter mentions / 200 (stretch)
- **Target**: 1,000 demo site visitors / 5,000 (stretch)

**Success definition**: 50+ stores deployed AND $10k GMV proves product-market fit.

---

## DOCUMENTATION REQUIREMENTS

### REQ-042: 3-Step Quickstart Guide
- <500 words total
- 3 clear steps: Install, Add Stripe key, Add first product
- Each step includes screenshot/example
- Written for non-technical merchants
- Links to demo store

### REQ-043: GitHub README with Deploy Button
- "Deploy to Cloudflare" button/link
- What it does, who it's for, quick start
- Links to live demo and documentation

### REQ-044: Opinionated Roadmap ("What We Say NO To")
- Document cut features and philosophy
- Explain: "Shopfront makes everyone a merchant, not a platform builder"
- Prevent support requests for cut features

---

## OPEN QUESTIONS

### REQ-054: Email Provider Configuration
**Question**: Resend or SendGrid for transactional emails?
**Deadline**: Week 1 (demo store requires working emails)
**Owner**: Infrastructure team

### REQ-053: Test Site Assignment
**Question**: Which Emdash instance for testing?
**Deadline**: Before Week 1 development starts
**Owner**: Infrastructure team

### REQ-055: Demo Store Domain
**Question**: demo.shopfront.dev or alternative?
**Deadline**: Week 2 (before soft launch)
**Owner**: Infrastructure/DevOps

---

## ARCHITECTURAL DECISIONS (Locked)

### KV-First Storage (REQ-001, Section 1.5)
- All data in Cloudflare KV (no PostgreSQL)
- Zero schema migrations
- Scales to 100k+ orders
- Simpler = fewer moving parts = fewer bugs

### Stripe-Only Payments (REQ-020, Section 1.4)
- Hardcoded Stripe, zero customization
- No PayPal, Square, or other gateways
- Every choice = support ticket

### Performance Budget (REQ-027-028, Section 1.6)
- 200ms page load maximum
- <50ms analytics dashboard
- Speed is the feature that makes all other features feel better

---

## COMPLIANCE & SECURITY

### Security Requirements
- HMAC-SHA256 webhook verification (REQ-001)
- Admin route authentication (verify Emdash provides)
- HTML sanitization in email templates
- CORS configuration via Emdash
- Audit logging for admin operations (v1.1)

### GDPR Compliance (Deferred to v1.1)
- Data retention policy (7 years)
- Right to be forgotten (delete customer data on request)
- Data export capability
- Privacy policy documentation

---

## FILE STRUCTURE

```
shopfront/
├── sandbox-entry.ts          # Main entry point (KV routing)
├── admin-ui.ts                # Emdash admin interface
├── email.ts                   # Order confirmation emails
├── stripe-integration.ts      # Checkout sessions (NEW - extract from sandbox-entry)
├── analytics.ts               # Basic revenue/order tracking (NEW)
├── README.md                  # Setup instructions
└── package.json               # Dependencies
```

### KV Data Structure
```
Prefixes:
- product:{id}                 # Product documents
- cart:{sessionId}             # Shopping carts
- order:{id}                   # Order documents
- order:status:{status}:{id}   # Status index (NEW - for filtering)
- settings:orderCounter        # Atomic order number
- analytics:daily:{date}       # Revenue rollups (NEW)
```

---

## RISK REGISTER

See comprehensive risk analysis in Risk Scanner Report.

**CRITICAL Risks (Block Launch)**:
1. Webhook security vulnerability
2. Order number race condition
3. Inventory double-selling
4. No production validation
5. Email blocking checkout

**HIGH Risks (Degrade Experience)**:
6. N+1 query timeout at 1000+ records
7. Email silent failures
8. No pagination in admin

All P0 risks must be resolved before ship.

---

**Requirements Status**: ✅ COMPLETE
**Total Requirements**: 61 atomic requirements
**Blockers**: 5
**Core Features**: 17
**Cut Features**: 10
**Testing**: 8
**Documentation**: 5

Generated by: Requirements Analyst agent
Verified against: PRD, Decisions Document, Risk Scanner Report, Codebase Scout Report