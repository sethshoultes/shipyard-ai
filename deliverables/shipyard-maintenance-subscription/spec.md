# Shipyard Care Subscription Service — Technical Specification

**Version:** 1.0
**Date:** 2026-04-20
**Status:** Ready for Implementation
**Build Estimate:** 8 hours
**Product Name:** Shipyard Care (marketing) / Shipyard Maintenance (SEO/URL)

---

## Goals

### Business Goals (from PRD)

1. **Create recurring revenue stream** — Convert one-time customers into $500/month subscribers
2. **Reduce customer re-engagement friction** — Provide ongoing relationship post-launch
3. **Generate predictable cash flow** — Target: 10 subscribers ($5K MRR) in 90 days
4. **Enable viral distribution** — Referral credits drive customer acquisition without paid ads

### User Goals

**As a founder who shipped with Shipyard:**
- Submit updates without re-engaging from scratch
- Know my site is healthy without manual checking
- Get priority access for urgent fixes
- Feel peace of mind that issues are handled automatically

**As the Shipyard team:**
- Maintain relationships with shipped customers
- Reduce "cold restart" overhead on returning customers
- Build toward sustainable business model (Warren Buffett's board feedback)

### Success Metrics (90 days)

| Metric | Target |
|--------|--------|
| Subscribers | 10 |
| MRR from Care | $5,000+ |
| Retention rate | 80%+ (month-over-month) |
| Referral conversions | 2+ (proves viral loop) |
| Free tier median wait time | <3 days (proves scaling works) |
| Token confusion complaints | 0 |

---

## Implementation Approach

### Architecture Overview

**Core Philosophy:** Token-based subscription with dedicated agent capacity, incident-only reporting, and viral referral distribution.

**Key Decisions (from debate synthesis):**
- **Product Name:** "Shipyard Care" (Steve Jobs wins brand positioning)
- **Pricing Model:** Token-based not round-based (Elon Musk wins pricing structure)
- **Distribution:** Referral credits in V1 not V2 ($100 MRR per conversion)
- **Billing:** Stripe Subscriptions API from day 1 (no manual invoicing)
- **Reporting:** Incident-only (not proactive health monitoring)
- **UX:** Email-first (no login-required dashboards)

### Pricing Structure

| Tier | Price | Tokens | Overage |
|------|-------|--------|---------|
| **Care** | $500/month | 100,000 tokens | $5 per 10K tokens |
| **Care Pro** | $1,000/month | 250,000 tokens | $5 per 10K tokens |

**Token Calculation:** ~15K tokens per typical PRD revision (estimated)

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│ Stripe Subscriptions API                            │
│ (Billing, renewals, webhooks)                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Database (Neon PostgreSQL via Drizzle ORM)          │
│ - subscribers (email, tier, tokens, referral code)  │
│ - token_usage (consumption tracking)                │
│ - referrals (credit tracking)                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ PRD Processing Flow                                 │
│ 1. Check subscriber status (priority routing)       │
│ 2. Process PRD (dedicated vs. shared capacity)      │
│ 3. Deduct tokens (log usage)                        │
│ 4. Send incident report (if errors occurred)        │
└─────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Email Communication Layer                           │
│ - Welcome emails (with referral link)               │
│ - Incident reports (3-line format)                  │
│ - Token warnings (80% threshold)                    │
└─────────────────────────────────────────────────────┘
```

### Database Schema (Drizzle ORM)

**Location:** `packages/db/schema/subscribers.ts`

**Tables:**

1. **subscribers** — Primary subscription tracking
   - `id` (serial, primary key)
   - `email` (text, unique, not null)
   - `tier` (enum: 'care' | 'care_pro', not null)
   - `tokens_monthly` (integer, not null)
   - `tokens_remaining` (integer, not null)
   - `referral_code` (text, unique, not null)
   - `referral_credits` (integer, default 0)
   - `start_date` (timestamp, not null)
   - `status` (enum: 'active' | 'cancelled' | 'paused', not null)
   - Indexes: email, referral_code

2. **token_usage** — Token consumption logs
   - `id` (serial, primary key)
   - `subscriber_email` (text, foreign key → subscribers.email)
   - `prd_id` (text, not null)
   - `tokens_used` (integer, not null)
   - `timestamp` (timestamp, not null)

3. **referrals** — Referral conversion tracking
   - `id` (serial, primary key)
   - `referrer_email` (text, foreign key → subscribers.email)
   - `referred_email` (text, not null)
   - `credit_amount` (integer, not null)
   - `converted_date` (timestamp, not null)

### Stripe Integration

**Product Setup:**
- Product: "Shipyard Care"
- Price IDs:
  - `price_care_500` → $500/month recurring
  - `price_care_pro_1000` → $1,000/month recurring

**Webhooks (required):**
1. `customer.subscription.created` → Add subscriber to database
2. `customer.subscription.deleted` → Mark subscriber as cancelled
3. `invoice.payment_succeeded` → Reset monthly token balance
4. `invoice.payment_failed` → Pause subscriber status, send alert

**Webhook Handler Location:** `packages/api/stripe-webhooks.ts`

### Referral System

**Mechanism:**
- Generate unique 8-character referral code on subscriber creation
- Referral landing page: `shipyard.company/refer/{CODE}`
- Credit: $100 MRR applied to referrer's invoice
- Credit triggers: After referred user's 2nd monthly payment (fraud prevention)
- Credit cap: Max 50% of monthly bill

**Implementation:**
- Referral code in Stripe checkout session metadata
- Track conversion in `referrals` table
- Apply credits via Stripe coupon codes or invoice adjustments

### Email Templates

**Location:** `packages/email/templates/`

**Templates:**
1. `welcome-subscriber.html` — Sent on subscription created
   - Welcome message
   - Referral link with instructions
   - Token balance display
   - Voice: "We've got this" (calm, confident)

2. `incident-report.html` — Sent when errors occur during PRD processing
   - What broke (1 line)
   - How we fixed it (1 line)
   - Tokens used (1 line)
   - Current token balance

3. `token-warning.html` — Sent at 80% token consumption
   - Usage summary
   - Remaining balance
   - Options: upgrade tier or purchase overage

### Priority Routing

**Current Architecture:** Cloudflare Workers distributed architecture (not centralized daemon)

**Implementation:**
- Add subscriber check in PRD intake processing
- Route subscriber PRDs to dedicated worker pool
- Non-subscribers use shared worker pool
- Target SLA: Subscribers 48-hour start time, non-subscribers 5-7 days

**Risk Mitigation (from plan):**
- Monitor free tier median wait times weekly
- If >7 days, add horizontal capacity (more workers)
- Avoid priority queue that starves free tier

---

## Verification Criteria

Each piece must pass these verification tests:

### Database Schema (Task 1-3, 18)
- ✓ TypeScript builds without errors: `cd packages/db && npm run build`
- ✓ Drizzle ORM types generated successfully
- ✓ Subscribers table has exactly 9 columns with correct types
- ✓ UNIQUE constraints on `email` and `referral_code`
- ✓ Foreign key constraints on `token_usage.subscriber_email` and `referrals.referrer_email`
- ✓ Indexes created on `email` and `referral_code`
- ✓ Pricing config exports two tiers with correct token allocations

### Business Logic Scripts (Task 4-6)
- ✓ `subscriber-add.ts` successfully inserts record with unique referral code
- ✓ `subscriber-check.ts` returns subscriber status + token balance for valid email
- ✓ `subscriber-check.ts` returns null for non-subscriber email
- ✓ `token-deduct.ts` decrements `tokens_remaining` and logs in `token_usage`
- ✓ `token-deduct.ts` sends warning email when balance < 20K tokens
- ✓ All scripts use Drizzle ORM (not raw SQL)

### Stripe Integration (Task 7-11)
- ✓ Stripe API client extends existing client pattern
- ✓ Webhook handler validates signature before processing
- ✓ `subscription.created` → Inserts subscriber record with correct tier + token balance
- ✓ `subscription.deleted` → Updates status to 'cancelled', does not delete record
- ✓ `invoice.payment_succeeded` → Resets `tokens_remaining` to `tokens_monthly`
- ✓ `invoice.payment_failed` → Updates status to 'paused', sends alert email
- ✓ Webhook handlers are idempotent (duplicate events don't cause errors)

### Email Templates (Task 12-14)
- ✓ Templates render with dynamic variables: `[NAME]`, `[TOKENS]`, `[BALANCE]`, `[REFERRAL_URL]`
- ✓ Welcome email includes referral link and token balance
- ✓ Incident report follows 3-line format (what broke, how fixed, tokens used)
- ✓ Token warning sent at 80% threshold (not before, not after)
- ✓ Email voice matches "We've got this" brand (calm, confident, no jargon)

### Marketing & Landing Pages (Task 15-16)
- ✓ Marketing page uses "Shipyard Care" name (not "Maintenance")
- ✓ Pricing clearly states: $500/month = 100K tokens, $1,000/month = 250K tokens
- ✓ Positioning: "Your site won't break. If it does, we'll fix it before you notice."
- ✓ CTA links to Stripe checkout with correct price IDs
- ✓ Referral landing page displays referrer name (social proof)
- ✓ Referral page tracks referral code through checkout session

### Daemon Integration (Task 17)
- ✓ PRD processing checks subscriber status before routing
- ✓ Subscriber PRDs flagged with `subscriber: true` metadata
- ✓ Token consumption logged after PRD completion
- ✓ Incident report triggered on error (not on success)
- ✓ Free tier not blocked when subscriber capacity is full (horizontal scaling)

### End-to-End Flow
- ✓ New subscriber → Stripe checkout → Webhook → Database record → Welcome email sent
- ✓ Subscriber submits PRD → Routed to dedicated capacity → Processed → Tokens deducted
- ✓ Token usage logged → Balance < 20K → Warning email sent
- ✓ Invoice paid → Webhook → Token balance reset to monthly allocation
- ✓ Referral link shared → Conversion → Credit applied to referrer's invoice

---

## Files Created or Modified

### New Files

#### Database Schema
- `/home/agent/shipyard-ai/packages/db/schema/subscribers.ts` — Subscribers table (Drizzle ORM)
- `/home/agent/shipyard-ai/packages/db/schema/token-usage.ts` — Token usage logs
- `/home/agent/shipyard-ai/packages/db/schema/referrals.ts` — Referral tracking
- `/home/agent/shipyard-ai/packages/db/config/pricing.ts` — Pricing tier configuration

#### Business Logic Scripts
- `/home/agent/shipyard-ai/packages/db/scripts/subscriber-add.ts` — Add new subscriber
- `/home/agent/shipyard-ai/packages/db/scripts/subscriber-check.ts` — Check subscriber status
- `/home/agent/shipyard-ai/packages/db/scripts/token-deduct.ts` — Deduct tokens, log usage

#### Stripe Integration
- `/home/agent/shipyard-ai/packages/api/stripe/client.ts` — Extended Stripe API client
- `/home/agent/shipyard-ai/packages/api/stripe/webhooks.ts` — Webhook handler (4 events)

#### Email Templates
- `/home/agent/shipyard-ai/packages/email/templates/welcome-subscriber.html`
- `/home/agent/shipyard-ai/packages/email/templates/incident-report.html`
- `/home/agent/shipyard-ai/packages/email/templates/token-warning.html`

#### Marketing & Landing Pages
- `/home/agent/shipyard-ai/public/care.html` — Marketing page (or update existing)
- `/home/agent/shipyard-ai/public/refer/[code].html` — Referral landing page template

### Modified Files

#### Database Exports
- `/home/agent/shipyard-ai/packages/db/index.ts` — Export new schemas

#### PRD Processing Flow
- `/home/agent/shipyard-ai/packages/pipeline/intake.ts` — Add subscriber check, priority routing
- `/home/agent/shipyard-ai/packages/pipeline/process.ts` — Add token logging, incident reporting

#### Configuration
- `/home/agent/shipyard-ai/.env.example` — Add Stripe webhook secret, API keys

---

## Open Questions & Risk Mitigation

### Open Questions (from decisions.md)

1. **Token Calculation Precision**
   - V1: Estimate 15K tokens per PRD (simple average)
   - V2: Parse Claude API response headers if available
   - Risk: Customer disputes → Mitigation: Clear email examples showing per-PRD usage

2. **Referral Credit Application**
   - Preferred: Stripe coupon codes (automatic discount)
   - Fallback: Manual invoice adjustments
   - Decision needed: Test Stripe API for dynamic credit application

3. **Overage Handling**
   - V1: Pause processing + email notification to upgrade
   - V2: Auto-charge overage if customer authorizes
   - Reason: No surprise charges (Steve's preference wins)

4. **Single vs. Two-Tier Launch**
   - V1: Launch both Care ($500) and Care Pro ($1,000)
   - Rationale: Let market decide, not artificially limit choice
   - Risk: Overcomplicates messaging → Mitigation: Clear tier comparison table

### Risk Register

**RISK-1: Token Pricing Confusion**
- Mitigation: Clear email examples, warning at 80%, voice: "We've got this" not "You're running out"

**RISK-2: Free Tier Cannibalization**
- Mitigation: Dedicated capacity (not priority queue), monitor median wait times, horizontal scaling

**RISK-3: Referral Gaming**
- Mitigation: Credit only after 2nd payment, 50% cap, manual review of >5 referrals/account

**RISK-4: Stripe Webhook Complexity**
- Mitigation: Use Stripe Checkout (not custom forms), simple success/failure webhooks only, defer prorated upgrades to V2

---

## Build Waves (8-Hour Execution Plan)

### Wave 1 (2 hours) — Foundation Layer
- Create subscribers, token_usage, referrals table schemas
- Create pricing configuration
- Verify: Database builds without errors

### Wave 2 (3 hours) — Business Logic & Templates
- Subscriber add/check/deduct scripts
- Extend Stripe API client
- Email templates (welcome, incident, warning)
- Verify: Scripts execute successfully, emails render correctly

### Wave 3 (2 hours) — Stripe Webhooks
- 4 webhook handlers (created, deleted, payment succeeded, payment failed)
- Verify: Idempotent, signature validation, correct database updates

### Wave 4 (1 hour) — Integration & Marketing
- Marketing page (care.html)
- Referral landing page
- Daemon integration (subscriber check, token logging)
- Verify: End-to-end flow works from checkout → PRD → billing

---

## Definition of Done

**V1 ships when:**
- [ ] All 18 tasks from phase-1-plan.md completed
- [ ] All verification criteria pass
- [ ] 5 test subscribers converted (manual setup acceptable)
- [ ] Stripe automated billing working (0 manual invoices)
- [ ] At least 1 incident report sent (proof system works)
- [ ] Referral links generated for all subscribers
- [ ] Free tier median wait time <3 days (proves scaling works)

**V2 deferred features:**
- Dashboard/portal for subscribers
- Advanced token analytics
- Proactive health monitoring
- Quarterly strategy calls
- Multi-project pricing tiers

---

**Document Status:** Locked for implementation
**Next Step:** Execute Wave 1 (Database Schema)
**Owner:** Development agent / implementation team

*The triangle offense doesn't work if everyone takes the same shot. Steve handles emotion, Elon handles scale, and the product wins when both are right.* — Phil Jackson
