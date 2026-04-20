# Requirements Traceability Matrix
# Shipyard Maintenance Subscription → "Shipyard Care"

**Generated**: 2026-04-20
**Source Documents**:
- `/home/agent/shipyard-ai/rounds/shipyard-maintenance-subscription/decisions.md`
- `/home/agent/shipyard-ai/prds/shipyard-maintenance-subscription.md`

**Project Status**: Locked decisions — ready for implementation
**Total Requirements**: 62
**Estimated Build Time**: 8 hours (locked decision from Elon/Steve consensus)

---

## Requirements Summary by Category

| Category | Count | Description |
|----------|-------|-------------|
| Database Schema | 3 | subscribers, token_usage, referrals tables |
| Script Requirements | 9 | Subscriber management, token tracking, daemon modifications |
| Stripe Integration | 5 | Subscriptions API + 4 webhook handlers |
| Token Tracking | 4 | Balance tracking, overage pricing, logging, warnings |
| Referral System | 6 | Code generation, landing page, credit application, fraud prevention |
| Email Communication | 5 | Welcome, incident report, token warning templates + triggers |
| Daemon Routing | 3 | Subscriber flag, dedicated capacity, free-tier monitoring |
| Marketing & Positioning | 3 | Care page, brand voice, naming consistency |
| Business Logic | 3 | Tier options, token reset, overage handling |
| Success Metrics | 8 | Launch validation + 90-day targets |
| File Deliverables | 11 | All files that must be created |
| Configuration | 3 | Stripe keys, pricing constants, thresholds |
| Integration Points | 3 | Daemon, checkout, email delivery |

---

## DATABASE REQUIREMENTS

### REQ-1: Database Schema - Subscribers Table
**Source**: decisions.md lines 195-206
**Priority**: P0 (Blocker)
**Description**: Create `subscribers` table with columns: id (primary key), email (unique), tier (enum: care/care_pro), tokens_monthly (integer), tokens_remaining (integer), referral_code (unique), referral_credits (default 0), start_date, status (enum: active/cancelled/paused)

**Acceptance Criteria**:
- [ ] Table exists in database with all columns
- [ ] Proper types enforced on all columns
- [ ] CHECK constraints on `tier` (care, care_pro) and `status` (active, cancelled, paused)
- [ ] `email` column is UNIQUE with NOT NULL constraint
- [ ] `referral_code` column is UNIQUE
- [ ] Primary key on `id` column

**Technical Notes**:
- Use Drizzle ORM schema definition in `packages/db/schema/subscribers.ts`
- Follow existing pattern from `packages/db/schema/subscriptions.ts`
- Neon PostgreSQL database (serverless)

---

### REQ-2: Database Schema - Token Usage Tracking
**Source**: decisions.md lines 208-215
**Priority**: P0 (Blocker)
**Description**: Create `token_usage` table with columns: id (primary key), subscriber_email, prd_id, tokens_used, timestamp, and FOREIGN KEY constraint to subscribers.email

**Acceptance Criteria**:
- [ ] Table exists in database
- [ ] FOREIGN KEY constraint enforced (subscriber_email → subscribers.email)
- [ ] All rows traceable to a subscriber
- [ ] Supports querying by subscriber_email, prd_id, timestamp
- [ ] Index on subscriber_email for performance

**Technical Notes**:
- Use Drizzle ORM foreign key syntax
- Add composite index on (subscriber_email, timestamp) for usage queries

---

### REQ-3: Database Schema - Referrals Tracking
**Source**: decisions.md lines 217-224
**Priority**: P1 (Required for MVP)
**Description**: Create `referrals` table with columns: id (primary key), referrer_email, referred_email, credit_amount, converted_date, FOREIGN KEY to subscribers.email

**Acceptance Criteria**:
- [ ] Table exists in database
- [ ] FOREIGN KEY constraint enforced (referrer_email → subscribers.email)
- [ ] Referral conversions logged with amounts and dates
- [ ] Supports querying referral counts per user
- [ ] Index on referrer_email for fraud detection

**Technical Notes**:
- Add check: credit only counts after referred user's 2nd payment (fraud prevention, REQ-22)

---

## SUBSCRIBER MANAGEMENT SCRIPTS

### REQ-4: Script - Add New Subscriber (bin/subscriber-add.sh)
**Source**: decisions.md lines 228-232
**Priority**: P0 (Blocker)
**Description**: Create bash script that accepts email and tier, generates unique referral code, initializes token balance to tier amount, and triggers Stripe subscription creation

**Acceptance Criteria**:
- [ ] Script exists at `bin/subscriber-add.sh` with executable permissions
- [ ] Accepts parameters: email, tier (care or care_pro)
- [ ] Generates unique referral code (format: 8-char alphanumeric)
- [ ] Initializes tokens_monthly: 100,000 for care, 250,000 for care_pro
- [ ] Sets tokens_remaining = tokens_monthly on creation
- [ ] Calls Stripe API to create subscription
- [ ] Sends welcome email with referral link
- [ ] Returns success/failure exit code

**Technical Notes**:
- Use `openssl rand -hex 4` for referral code generation
- Check for collision in database before inserting
- Integrate with existing Stripe client at `apps/pulse/lib/stripe.ts`

---

### REQ-5: Script - Check Subscriber Status (bin/subscriber-check.sh)
**Source**: decisions.md lines 234-237
**Priority**: P0 (Blocker)
**Description**: Create bash script that checks if email is active subscriber, returns token balance, validates if request can proceed

**Acceptance Criteria**:
- [ ] Script exists at `bin/subscriber-check.sh` with executable permissions
- [ ] Accepts parameter: email
- [ ] Returns JSON with: is_subscriber (bool), status (active/cancelled/paused), tokens_remaining (int)
- [ ] Exit code 0 if active subscriber with tokens, 1 otherwise
- [ ] Response time < 100ms (indexed query)

**Technical Notes**:
- Query: `SELECT status, tokens_remaining FROM subscribers WHERE email = $1`
- Return false if not found or status != 'active'

---

### REQ-6: Script - Token Deduction (bin/token-deduct.sh)
**Source**: decisions.md lines 239-242
**Priority**: P0 (Blocker)
**Description**: Create bash script that deducts tokens after PRD completion, logs usage to token_usage table, sends alert email if balance < 20K

**Acceptance Criteria**:
- [ ] Script exists at `bin/token-deduct.sh` with executable permissions
- [ ] Accepts parameters: subscriber_email, prd_id, tokens_used
- [ ] Deducts tokens_used from tokens_remaining
- [ ] Creates record in token_usage table with timestamp
- [ ] Sends warning email if new balance < 20,000 tokens
- [ ] Returns new balance in response
- [ ] Atomic transaction (deduct + log together)

**Technical Notes**:
- Use PostgreSQL transaction: BEGIN; UPDATE subscribers...; INSERT INTO token_usage...; COMMIT;
- Warning email uses template: `templates/token-warning.txt` (REQ-27)

---

## DAEMON MODIFICATIONS

### REQ-7: Daemon Modification - Subscriber Status Check
**Source**: decisions.md lines 245-249
**Priority**: P0 (Blocker)
**Description**: Modify daemon.sh to check subscriber status before processing PRD, route to dedicated daemon instance if subscriber, log token consumption per run, trigger incident report if errors occur

**Acceptance Criteria**:
- [ ] `bin/daemon.sh` (or equivalent) updated with subscriber check
- [ ] Calls `bin/subscriber-check.sh` before processing each PRD
- [ ] Routes PRDs with `subscriber:true` flag to dedicated instance
- [ ] Logs all token usage via `bin/token-deduct.sh` after completion
- [ ] Triggers incident report email (REQ-26) on failures
- [ ] Backwards compatible with non-subscriber PRDs

**Technical Notes**:
- RISK: Research shows no central daemon.sh found; system uses Cloudflare Workers
- MITIGATION: Implement in intake processing flow at `deliverables/shipyard-self-serve-intake/lib/intake/`
- Add `is_subscriber` column to `intake_requests` table
- Modify `listIntakeRequests()` query to ORDER BY is_subscriber DESC, created_at ASC

---

### REQ-8: New Daemon - Dedicated Subscriber Instance (bin/daemon-subscriber.sh)
**Source**: decisions.md lines 251-254
**Priority**: P1 (Required for MVP)
**Description**: Create new dedicated daemon instance for subscriber PRDs that runs in parallel with main daemon, has higher polling frequency

**Acceptance Criteria**:
- [ ] Script exists at `bin/daemon-subscriber.sh` with executable permissions
- [ ] Runs independently in parallel with main processing
- [ ] Processes only subscriber-flagged PRDs
- [ ] Higher polling frequency (30s vs 60s for free tier)
- [ ] Does not starve free tier (REQ-30)
- [ ] Logs processing metrics

**Technical Notes**:
- DECISION (LOCKED): Horizontal scaling, not priority queue jumping
- Run as separate systemd service or Kubernetes pod
- Query only PRDs where is_subscriber = true

---

## STRIPE INTEGRATION

### REQ-9: Stripe Integration - Subscriptions API Setup
**Source**: decisions.md lines 172-174, 304-309
**Priority**: P0 (Blocker)
**Description**: Implement Stripe Subscriptions API (not manual invoicing), use Stripe pre-built Checkout for payment forms, handle webhooks for subscription events

**Acceptance Criteria**:
- [ ] Stripe account configured with Subscriptions API enabled
- [ ] Two price IDs created: Care ($500/month), Care Pro ($1,000/month)
- [ ] Checkout page functional at public/care.html
- [ ] All webhook handlers implemented (REQ-10 through REQ-13)
- [ ] STRIPE_WEBHOOK_SECRET configured in environment

**Technical Notes**:
- DECISION CHANGE: Original PRD said "manual invoicing" but decisions.md overruled (Elon wins, line 106-114)
- Use existing Stripe client at `apps/pulse/lib/stripe.ts`
- Extend with subscription creation methods

---

### REQ-10: Webhook Handler - Subscription Created
**Source**: decisions.md lines 305-309
**Priority**: P0 (Blocker)
**Description**: Create webhook handler for `customer.subscription.created` event that creates new subscriber record in database

**Acceptance Criteria**:
- [ ] Webhook receives and validates Stripe event signature
- [ ] Creates subscriber record with correct tier from subscription metadata
- [ ] Sets start_date to subscription.created timestamp
- [ ] Generates unique referral code
- [ ] Sends welcome email (REQ-24)
- [ ] Idempotent (handles duplicate webhook deliveries)

**Technical Notes**:
- Use Stripe webhook signature verification
- Extract tier from price_id: `price_xxx_care` vs `price_xxx_care_pro`

---

### REQ-11: Webhook Handler - Subscription Deleted
**Source**: decisions.md lines 305-309
**Priority**: P0 (Blocker)
**Description**: Create webhook handler for `customer.subscription.deleted` event that updates subscriber status to cancelled

**Acceptance Criteria**:
- [ ] Webhook receives and validates event
- [ ] Sets subscriber status to 'cancelled'
- [ ] Records cancellation timestamp
- [ ] Does NOT delete subscriber record (audit trail)
- [ ] Stops processing future PRDs for this subscriber

---

### REQ-12: Webhook Handler - Invoice Payment Succeeded
**Source**: decisions.md lines 305-309
**Priority**: P0 (Blocker)
**Description**: Create webhook handler for `invoice.payment_succeeded` event that resets token balance to monthly tier amount and logs renewal

**Acceptance Criteria**:
- [ ] Webhook receives and validates event
- [ ] Resets tokens_remaining to tokens_monthly
- [ ] Logs payment timestamp
- [ ] Applies referral credits if applicable (REQ-21)
- [ ] Sends confirmation email (optional for V1)

**Technical Notes**:
- Token reset happens on subscription anniversary, not calendar month (REQ-36)
- Referral credits applied as Stripe coupon if exists

---

### REQ-13: Webhook Handler - Invoice Payment Failed
**Source**: decisions.md lines 305-309
**Priority**: P0 (Blocker)
**Description**: Create webhook handler for `invoice.payment_failed` event that pauses subscriber status and sends notification

**Acceptance Criteria**:
- [ ] Webhook receives and validates event
- [ ] Sets subscriber status to 'paused'
- [ ] Sends payment failure email (REQ-28)
- [ ] Stops processing subscriber PRDs
- [ ] Logs payment failure reason

---

## OPEN QUESTIONS (Blockers)

### OPEN-1: Token Calculation Precision
**Source**: decisions.md lines 321-330
**Status**: OPEN (requires decision)
**Options**:
- A: Parse Claude API response headers
- B: Estimate based on file changes + PRD length

**Impact**: HIGH — customer disputes if inaccurate
**Recommendation**: Start with Option B (15K tokens per PRD estimate), refine in V2

---

### OPEN-2: Referral Credit Application Mechanism
**Source**: decisions.md lines 334-340
**Status**: OPEN (requires implementation decision)
**Options**:
- A: Stripe coupon codes (automatic)
- B: Manual credit tracking + invoice adjustments

**Impact**: HIGH — viral growth depends on this
**Recommendation**: Use Option A (Stripe coupons) for automation

---

### OPEN-3: Single Tier vs Two-Tier Launch
**Source**: decisions.md lines 367-374
**Status**: OPEN (requires business decision)
**Options**:
- Launch both tiers ($500 and $1,000)
- Launch single tier ($500), add second in V2

**Impact**: MEDIUM — affects messaging complexity
**Recommendation**: Launch both (Elon's stance) to let market decide

---

## Summary

- **Total Requirements**: 62 (full breakdown in source document)
- **Blocker Requirements (P0)**: 30
- **Required for MVP (P1)**: 20
- **Nice-to-Have (P2)**: 9
- **Open Questions**: 3

**Estimated Build Time**: 8 hours (locked decision from Elon/Steve consensus)

**Build Sequence**:
1. Phase 1: Infrastructure (Database + Scripts) — 4 hours
2. Phase 2: Daemon Integration — 2 hours
3. Phase 3: Communication Layer — 1.5 hours
4. Phase 4: Marketing & Distribution — 0.5 hours

---

**Next Steps**:
1. Resolve open questions (OPEN-1, OPEN-2, OPEN-3)
2. Create XML task plans organized into waves
3. Begin Phase 1 implementation

---

## Detailed Requirements Inventory

For complete 62-requirement traceability matrix with all acceptance criteria, technical notes, and file deliverables, refer to the complete extraction provided to the planning agents.

Key requirement categories covered:
- Database Schema (REQ-1 to REQ-3)
- Scripts (REQ-4 to REQ-8)
- Stripe Integration (REQ-9 to REQ-13)
- Token Tracking (REQ-14 to REQ-17)
- Referral System (REQ-18 to REQ-23)
- Email Communication (REQ-24 to REQ-28)
- Daemon Routing (REQ-29 to REQ-31)
- Marketing & Positioning (REQ-32 to REQ-34)
- Business Logic (REQ-35 to REQ-37)
- Success Metrics (REQ-38 to REQ-45)
- File Deliverables (REQ-46 to REQ-56)
- Configuration (REQ-57 to REQ-59)
- Integration Points (REQ-60 to REQ-62)
