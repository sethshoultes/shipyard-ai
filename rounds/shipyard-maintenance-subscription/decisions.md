# Shipyard Maintenance Subscription: Locked Decisions
**Consolidated by:** Phil Jackson, Zen Master
**Date:** 2026-04-20
**Status:** Build blueprint — ready for implementation

---

## Executive Summary

**What we're building:** A subscription service selling permission to stop worrying about your website.

**The synthesis:** $500/month = 100K tokens. Dedicated agent capacity. Silence when healthy, 3-line incident reports when broken. Referral credits baked in from day 1. No dashboards. No anxiety. Just care.

**Build time estimate:** 8 hours for V1
**Ship target:** This week

---

## I. Core Decisions (Who Won and Why)

### Decision 1: Product Name and Brand
**Proposed by:** Steve Jobs
**Outcome:** STEVE WINS
**Decision:** Product is called **"Shipyard Care"** (not "Maintenance")

**Why Steve won:**
- Language is product architecture, not cosmetics
- "Care" implies relationship and trust vs. transactional "maintenance"
- Emotional contract matters in a peace-of-mind product
- One word that carries the entire philosophy

**Elon's concession:** Keep "Maintenance" in URL/metadata for SEO discovery, but "Care" in all marketing copy

---

### Decision 2: Pricing Model
**Proposed by:** Elon Musk
**Outcome:** ELON WINS
**Decision:** **Token-based pricing** ($500/month = 100K tokens, not "2 revision rounds")

**Why Elon won:**
- Eliminates fake scarcity and arbitrary limits
- No support overhead defining "what counts as one round?"
- Algorithmically simple, scales to 10,000 customers
- Transparent compute pricing vs. artificial bundling
- Overage model: $5 per 10K additional tokens

**Steve's objection overruled:**
- Steve argued "taxi meter" causes customer anxiety
- Elon counter: Rounds feel like negotiations; tokens are honest
- Essence file synthesis: Token budgets are honest over revision rounds (fake scarcity)

---

### Decision 3: Health Reports vs. Incident Reports
**Proposed by:** Both (Synthesis)
**Outcome:** BOTH WRONG → NEW APPROACH
**Decision:** **Incident logging only** (not monthly monitoring)

**The synthesis:**
- **Cut:** Monthly proactive health monitoring (Steve's proposal)
- **Keep:** 3-line incident reports when something breaks (Elon's counter)
- **Why:** Monthly monitoring is theater; incident reports are proof of care
- Format: "Broken link detected on /about. Fixed in 12 minutes. 2,400 tokens used."

**Steve's defeat:** Monthly "your site is healthy" emails deemed feature bloat
**Elon's victory:** Alert-based, not scheduled. Only notify on failures.
**Saved time:** 8 hours of monitoring infrastructure → 1 hour of incident logging

---

### Decision 4: Distribution Strategy
**Proposed by:** Elon Musk
**Outcome:** ELON WINS
**Decision:** **Referral credits baked into V1** (not a V2 feature)

**Why Elon won:**
- Without viral distribution, limited to "emailing your mom" (10 subscribers)
- Referral model: $100 MRR credit per conversion
- Every subscriber becomes a salesperson (10x multiplier)
- Steve's "brand as moat" doesn't scale without discovery mechanism

**Implementation:**
- Referral link generator for each subscriber
- Credit tracking in subscriber table
- Viral loop built into product, not bolted on later

---

### Decision 5: Scaling Architecture
**Proposed by:** Elon Musk
**Outcome:** ELON WINS
**Decision:** **Dedicated agent capacity** (not priority queue jumping)

**Why Elon won:**
- Priority queue kills free tier funnel (at 100 subscribers, free users wait weeks)
- Horizontal scaling preserves growth engine
- Run parallel daemon instances for subscribers
- Don't slow down non-subscribers — speed up paid ones

**Steve's concession:** "He's right about the math. We need dedicated capacity."

---

### Decision 6: Billing Automation
**Proposed by:** Elon Musk
**Outcome:** ELON WINS (Steve conceded)
**Decision:** **Stripe Subscriptions API from day 1** (not manual invoicing)

**Why Elon won:**
- Manual invoicing breaks at ~50 subscribers (10 hours/month overhead)
- Steve conceded: "Manual invoicing is a ticking time bomb"
- Non-negotiable for V1 to avoid painting into corner

---

### Decision 7: Brand Voice and UX
**Proposed by:** Steve Jobs
**Outcome:** STEVE WINS
**Decision:** **Email-first UX, calm brand voice, no dashboard bloat**

**Why Steve won:**
- Elon conceded: "Brand voice is the difference between tolerate and evangelize"
- Voice: "We've got this" beats "48-hour SLA"
- UX: Push notifications (email/SMS), not login-required dashboards
- Positioning: "Your site won't break. If it does, we'll fix it before you notice."

**Elon's concession:** "Steve is correct. Email-first design, no dashboard requirement."

---

### Decision 8: Features Cut from V1
**Proposed by:** Elon Musk (mostly)
**Outcome:** CUTS LOCKED

**Eliminated entirely:**
1. **Quarterly strategy calls** — Not a consulting agency (Steve conceded)
2. **Maintenance Plus tier** — Overcomplicates V1
3. **Proactive health monitoring** — Theater, not value (save 8 hours build time)
4. **"Founding subscriber discounts"** — Desperation pricing (Steve's position)
5. **Public trust badges / "Powered by Shipyard"** — Steve's anti-billboard stance won
6. **Dashboard logins** — Email-first wins

---

## II. MVP Feature Set (What Ships in V1)

### Core Product: "Shipyard Care"
**Price:** $500/month = 100K tokens
**Higher tier option:** $1,000/month = 250K tokens
**Overage:** $5 per 10K additional tokens

### Features Included:
1. **Token budget tracking**
   - SQLite table: `email`, `tier`, `tokens_remaining`, `start_date`
   - Real-time token consumption logging per PRD

2. **Dedicated agent capacity**
   - Parallel daemon instances for subscribers
   - Priority processing without starving free tier

3. **Incident reporting (email)**
   - Triggered only on failures, not scheduled
   - Format: 3-line summary (what broke, how fixed, tokens used)
   - Example: "Broken link on /about. Fixed in 12 min. 2,400 tokens."

4. **Referral system**
   - Unique referral link per subscriber
   - $100 MRR credit per successful conversion
   - Credit tracking in subscriber table

5. **Stripe Subscriptions API**
   - Automated recurring billing
   - No manual invoice generation

6. **Priority flag in PRD frontmatter**
   - Boolean flag: `subscriber: true`
   - Routes to dedicated daemon capacity

### User Journey:
1. Subscribe → Stripe checkout
2. Receive welcome email with referral link
3. Submit PRDs as normal (flagged as subscriber)
4. Silence unless something breaks
5. If incident occurs: 3-line email report + auto-fix
6. Monthly Stripe invoice (automated)

---

## III. File Structure (What Gets Built)

### 1. Database Schema
**File:** `db/subscribers.sql`

```sql
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('care', 'care_pro')),
  tokens_monthly INTEGER NOT NULL,
  tokens_remaining INTEGER NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referral_credits INTEGER DEFAULT 0,
  start_date TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'paused'))
);

CREATE TABLE token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_email TEXT NOT NULL,
  prd_id TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (subscriber_email) REFERENCES subscribers(email)
);

CREATE TABLE referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_email TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  credit_amount INTEGER NOT NULL,
  converted_date TEXT NOT NULL,
  FOREIGN KEY (referrer_email) REFERENCES subscribers(email)
);
```

### 2. Subscriber Management Scripts
**File:** `bin/subscriber-add.sh`
- Add new subscriber (email, tier)
- Generate unique referral code
- Initialize token balance
- Trigger Stripe subscription creation

**File:** `bin/subscriber-check.sh`
- Check if email is active subscriber
- Return token balance
- Validate request can proceed

**File:** `bin/token-deduct.sh`
- Deduct tokens after PRD completion
- Log usage in `token_usage` table
- Send alert if balance < 20K

### 3. Daemon Modifications
**File:** `bin/daemon.sh` (modifications)
- Check subscriber status before processing PRD
- Route to dedicated daemon instance if subscriber
- Log token consumption per run
- Trigger incident report if errors occur

**File:** `bin/daemon-subscriber.sh` (new)
- Dedicated daemon instance for subscribers
- Runs in parallel with main daemon
- Higher polling frequency

### 4. Email Templates
**File:** `templates/incident-report.txt`
```
Subject: [Shipyard Care] Issue detected and resolved

Hi [NAME],

We detected an issue on your site and fixed it:

- **What broke:** [DESCRIPTION]
- **How we fixed it:** [ACTION_TAKEN]
- **Tokens used:** [TOKENS]

Your site is back to normal. Current token balance: [BALANCE]/[MONTHLY_LIMIT]

We've got this.
— Shipyard Care
```

**File:** `templates/welcome-subscriber.txt`
```
Subject: Welcome to Shipyard Care

Hi [NAME],

Your site is now under our care. Here's what happens next:

1. Submit PRDs as usual — they'll be prioritized automatically
2. We'll monitor for issues and fix them before you notice
3. You'll only hear from us when something breaks (and we've already fixed it)

**Your referral link:** [REFERRAL_URL]
Share this with colleagues — you'll earn $100/month credit for each new subscriber.

**Your token balance:** [TOKENS]/month

No dashboards. No anxiety. Just care.

— Shipyard Care
```

### 5. Referral Landing Page
**File:** `public/refer/[CODE].html`
- Display referrer's name (social proof)
- Explain referral credit ($100 MRR)
- Link to standard Stripe checkout
- Track referral code through conversion

### 6. Stripe Integration
**File:** `bin/stripe-webhook.sh`
- Handle `customer.subscription.created`
- Handle `customer.subscription.deleted`
- Handle `invoice.payment_succeeded` (monthly renewal → reset token balance)
- Handle `invoice.payment_failed` (pause subscriber status)

### 7. Marketing Page Update
**File:** `public/care.html`
- Product name: "Shipyard Care"
- Pricing: $500/month (100K tokens) or $1,000/month (250K tokens)
- Positioning: "Your site won't break. If it does, we'll fix it before you notice."
- CTA: Stripe checkout link
- Voice: Calm, confident, no jargon
- No "founding discounts" or desperation pricing

---

## IV. Open Questions (What Still Needs Resolution)

### 1. Token Calculation Precision
**Question:** How do we accurately measure token usage per PRD?
- **Option A:** Parse Claude API response headers (if available)
- **Option B:** Estimate based on file changes + PRD length (less accurate)
- **Decision needed:** Technical feasibility of Option A

**Risk if unresolved:** Customer disputes over token consumption

---

### 2. Referral Credit Application
**Question:** How do credits apply to monthly invoices?
- **Option A:** Stripe coupon codes (automatic discount on renewal)
- **Option B:** Manual credit tracking + invoice adjustments
- **Decision needed:** Stripe API capabilities for dynamic credits

**Impact:** Distribution strategy depends on seamless credit flow

---

### 3. Overage Handling
**Question:** What happens when subscriber exceeds token budget mid-month?
- **Option A:** Auto-charge overage ($5/10K tokens) via Stripe
- **Option B:** Pause processing + email notification to upgrade/top-up
- **Option C:** Allow overage, bill at month-end

**Steve's likely preference:** Option B (no surprise charges)
**Elon's likely preference:** Option A (frictionless)
**Decision needed:** Balance trust vs. automation

---

### 4. Incident Detection Mechanism
**Question:** How do we automatically detect failures vs. waiting for user reports?
- **Option A:** Parse daemon error logs for common failures (broken links, build errors)
- **Option B:** Simple health ping after PRD completion (200 status check)
- **Option C:** No proactive detection — only report failures we encounter during requested work

**V1 recommendation:** Option C (simplest, aligns with "incident reports not monitoring" decision)
**V2 exploration:** Option A or B if customers request it

---

### 5. Multi-Tier Boundaries
**Question:** Do we launch with both $500 and $1,000 tiers, or just one?
- **Current spec:** Two tiers (100K tokens vs. 250K)
- **Risk:** Overcomplicates V1 messaging
- **Elon's stance:** Launch both, let market decide
- **Steve's stance:** One tier only, add second tier in V2 based on demand

**Decision needed:** Single-tier vs. two-tier launch

---

## V. Risk Register (What Could Go Wrong)

### Risk 1: Token Pricing Confusion
**Likelihood:** Medium
**Impact:** High (customer churn)

**Description:** Customers don't understand token limits; feel nickel-and-dimed

**Mitigation:**
- Clear email examples: "This PRD used 15K tokens (15% of monthly budget)"
- Warning at 80% consumption: "You've used 80K of 100K tokens this month"
- Steve's voice in communications: "We've got this" not "You're running out"

**Ownership:** Steve wins messaging, Elon wins pricing structure — both must collaborate

---

### Risk 2: Free Tier Cannibalization
**Likelihood:** High
**Impact:** Critical (growth funnel dies)

**Description:** At 100+ subscribers, free tier waits weeks → bad reviews kill inbound

**Mitigation:**
- Dedicated agent capacity (already decided)
- Monitor free-tier median wait times weekly
- If >7 days, add more parallel daemon capacity (horizontal scaling)

**Elon's warning validated:** This is the bottleneck that kills at scale

---

### Risk 3: Referral Gaming / Fraud
**Likelihood:** Low (initially), High (at scale)
**Impact:** Medium (revenue loss)

**Description:** Fake signups to farm referral credits, churned accounts

**Mitigation:**
- Credit only applies after referred user's 2nd monthly payment (Stripe check)
- Max credits: 50% of monthly bill (cap exploitation)
- Manual review of referrals >5 per account

**V1 approach:** Trust-based, add fraud detection in V2

---

### Risk 4: Incident Report Fatigue
**Likelihood:** Medium
**Impact:** Medium (perceived low quality)

**Description:** If sending 10+ incident reports/month, feels like site is broken

**Mitigation:**
- Weekly digest option: Batch minor fixes into one summary email
- Severity levels: Only email immediately for critical issues (site down)
- Monthly summary: "We fixed 8 things this month so you didn't have to"

**Steve's UX principle:** Invisible until essential — applies to emails too

---

### Risk 5: Stripe Subscription API Complexity
**Likelihood:** Medium
**Impact:** High (delays launch)

**Description:** Webhook handling, failed payments, prorated upgrades = implementation time sink

**Mitigation:**
- Use Stripe's pre-built Checkout (not custom forms)
- Start with simple success/failure webhooks only
- Defer prorated upgrades to V2 (force month-end tier changes)

**Build time risk:** Could balloon from 8 hours → 16 hours if over-engineered

---

### Risk 6: No Dashboard = No Trust?
**Likelihood:** Low (consumer side), Medium (B2B side)
**Impact:** Medium (feature requests)

**Description:** Enterprise customers demand "visibility" — want login portal

**Steve's position:** Dashboards are where products die
**Elon's counter:** B2B needs receipts, not vibes

**Compromise (already locked):**
- No dashboard in V1
- If 3+ customers request it in first 90 days → add simple auth-link archive page (V2)
- Primary UX stays email-first

---

### Risk 7: Monthly Token Reset Timing
**Likelihood:** Low
**Impact:** Low (customer confusion)

**Description:** Customer subscribed mid-month, unclear when tokens reset

**Mitigation:**
- Reset on subscription anniversary (not calendar month)
- Welcome email states: "Your tokens reset on [DAY] each month"
- Stripe invoice = token reset trigger (automated)

**Already solved by:** Stripe Subscriptions API handles anniversary billing

---

## VI. Success Metrics (How We Know It's Working)

### V1 Launch Criteria (Week 1)
- [ ] 5 subscribers converted from existing customer base
- [ ] Stripe automated billing working (no manual invoices)
- [ ] At least 1 incident report sent (proves system works)
- [ ] 0 customer complaints about token confusion
- [ ] Referral links generated for all subscribers

### 90-Day Targets
- [ ] 10 subscribers (original PRD goal)
- [ ] 2+ referral conversions (proves viral loop)
- [ ] <3 day median wait time for free tier (proves scaling works)
- [ ] 80%+ subscriber retention (month 1 → month 2)
- [ ] 0 manual billing interventions required

### 12-Month North Star
- [ ] 100 subscribers ($50K MRR)
- [ ] 30%+ acquisition via referrals (not paid ads)
- [ ] Feature requests logged for V2 roadmap
- [ ] Case study from 1 enterprise customer (B2B validation)

---

## VII. Build Sequence (Implementation Order)

### Phase 1: Infrastructure (4 hours)
1. Database schema (`subscribers.sql`)
2. Subscriber management scripts (add, check, deduct)
3. Stripe Subscriptions API integration
4. Webhook handling (subscription created/cancelled)

### Phase 2: Daemon Integration (2 hours)
1. Modify `daemon.sh` to check subscriber status
2. Create `daemon-subscriber.sh` (dedicated capacity)
3. Token consumption logging
4. Priority routing based on subscriber flag

### Phase 3: Communication Layer (1.5 hours)
1. Incident report email template
2. Welcome email template
3. Token balance warning emails (80% threshold)
4. Referral link generator

### Phase 4: Marketing & Distribution (0.5 hours)
1. Update `public/care.html` with positioning
2. Stripe checkout links
3. Referral landing page template

**Total:** 8 hours

---

## VIII. Post-Launch Monitoring (First 30 Days)

### Daily Checks
- Stripe webhook logs (ensure no failures)
- Free tier median wait time (watch for bottleneck)
- Subscriber token consumption (identify heavy users)

### Weekly Reviews
- Customer feedback on token clarity
- Referral link click-through rates
- Incident report response times (are we fixing fast enough?)

### Monthly Retrospective
- Steve's question: Are customers feeling peace of mind?
- Elon's question: Is the viral loop working?
- Phil's question: What assumptions were wrong?

---

## IX. The Essence (One-Paragraph North Star)

We are selling **the ability to stop worrying**. Not monitoring. Not dashboards. Not queue position. The customer pays $500/month for silence when everything works, and a 3-line "we fixed it" email when something breaks. Token budgets keep pricing honest. Referral credits make growth viral. Dedicated agent capacity keeps the free tier alive. Steve's brand voice ("We've got this") earns trust. Elon's distribution lever (referrals) earns scale. The synthesis: **Invisible excellence with proof of care.**

---

## X. Final Locked Positions

### Steve Jobs NON-NEGOTIABLES (3/3 locked)
1. ✅ **Product is called "Shipyard Care"** — Emotional contract in one word
2. ❌ **Monthly health reports** — Overruled; incident-only approach won
3. ❌ **Round-based pricing** — Overruled; token pricing won

**Steve's wins:** Brand voice, email-first UX, no dashboards, "care" positioning

---

### Elon Musk NON-NEGOTIABLES (3/3 locked)
1. ✅ **Token-based pricing** — $500 = 100K tokens, no fake scarcity
2. ✅ **Referral credits for distribution** — $100 MRR per conversion, V1 not V2
3. ✅ **Dedicated capacity, not priority queues** — Horizontal scaling preserves funnel

**Elon's wins:** Pricing model, growth lever, scaling architecture, billing automation

---

### Synthesis (Both/Neither Wins)
- **Incident reports only** — Neither's original position; new approach from debate
- **No public badges** — Steve's "no billboard" philosophy wins
- **No strategy calls** — Elon's "not a consulting agency" wins
- **Stripe API day 1** — Elon proposed, Steve conceded

---

## XI. One-Line Mandate for Build Phase

**Ship the 8-hour version with Steve's voice and Elon's distribution engine — everything else is V2.**

---

**Document Status:** Locked for implementation
**Next Phase:** Build
**Owner:** Development agent / implementation team
**Review Cycle:** 30-day post-launch retrospective

*The triangle offense doesn't work if everyone takes the same shot. Steve handles emotion, Elon handles scale, and the product wins when both are right.*

— Phil Jackson, Zen Master
