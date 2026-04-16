# Board Review: Warren Buffett
**Project:** Shipyard Post-Ship Lifecycle ("Homeport")
**Date:** 2026-04-16
**Lens:** Durable value, unit economics, competitive moat

---

## VERDICT: 6/10
**Justification:** Smart retention play with no moat. Easily copied, no capital deployed, unit economics unknown.

---

## Unit Economics

**Cost to Acquire One User:** $0
- Zero acquisition cost — already paid customers
- Homeport adds retention, not acquisition

**Cost to Serve One User:** ~$0.02/year
- Resend: $0.001/email × 5 = $0.005
- Cloudflare Workers + KV: negligible (<$0.01)
- Phil's time: unpriced (manual reply handling)
- **Total:** <$0.02/year per customer

**Infrastructure:** Zero fixed costs
- Cloudflare Workers + KV + Resend
- Marginal cost scales linearly
- No servers to maintain

**Missing:** Revenue per retained customer
- Can't calculate LTV without:
  - Repeat customer conversion rate
  - Average order value for revisions
  - Baseline repeat rate (PRD says "Unknown")

**Problem:** Unit economics incomplete without revenue side

---

## Revenue Model

**Current State:** Cost center, not profit center
- Retention infrastructure with zero direct monetization
- Value capture happens indirectly (repeat orders)

**Revenue Hypothesis:**
1. Customer gets Day 30 email → remembers Shipyard
2. Needs site update → replies to lifecycle email
3. Reply converts to billable revision work
4. Homeport drives retention → revenue attribution

**Dependency:** Revenue only materializes if:
- Reply rate >10% (PRD target)
- Replies convert to paid work at reasonable rate
- Revision average order value >$500

**Missing Data:**
- No baseline repeat customer rate (PRD: "Unknown")
- No revision pricing model
- No conversion funnel tracked

**Business or Hobby?**
- **Hobby** if just "staying in touch"
- **Business** if converts 10%+ to repeat buyers

**Current answer:** Unknown. No revenue tracking = hobby until proven otherwise

---

## Competitive Moat

**What Stops Copying?**

### Weak Moats (Easily Copied)
1. **Email templates** — Clone in 48 hours
   - Plain text = trivial to replicate
   - Voice distinctive but not protectable
   - Templates locked 90 days (self-imposed, not moat)

2. **Infrastructure** — Rebuild in 1 weekend
   - ~300 lines TypeScript (README)
   - Commodity tech (Cloudflare Workers)
   - Open-source alternatives exist

3. **Lifecycle cadence** — Standard marketing playbook
   - Day 7/30/90/180/365 is textbook
   - Competitors can copy or improve

### Potential Moats (Future, Not Built)
1. **Project telemetry** — PRD Phase 2
   - Time/token tracking, revision patterns
   - Data compounds (competitors can't replicate history)
   - Real moat, but doesn't exist yet

2. **Customer data** — Weak moat
   - Ship dates, URLs, emails
   - No network effect
   - Competitors have own customer data

3. **Operational insights** — Future Phase 2
   - "Sites with X framework ship 40% faster" (PRD)
   - Becomes differentiation if data-driven
   - Depends on Phase 2 execution

**Current Moat Strength:** 2/10
- Voice distinctive but replicable
- Infrastructure commodity
- Phase 2 telemetry could be moat but not built

**Answer:** Nothing stops competitors copying this in a weekend. Real moat depends on Phase 2 execution

---

## Capital Efficiency

**Capital Deployed:** ~$0
- No servers, no SaaS subscriptions, no hires
- Uses existing Shipyard infrastructure
- Resend free tier covers first 3,000 emails/month

**Developer Time Investment:**
- 2 weeks MVP (PRD timeline)
- ~300 lines code (README)
- No ongoing maintenance burden

**Return on Investment:**
- **If reply rate >10%:** High ROI (minimal cost, repeat revenue)
- **If reply rate <5%:** Wasted 2 weeks, learned emails don't work
- **Break-even:** Need 1 revision order >$1,000 to justify 2 weeks dev

**Capital Efficiency Grade:** A
- Zero upfront capital
- Linear marginal costs (good scalability)
- Smart infrastructure choices (Workers >> servers)
- Low ongoing operational burden

**Risk:** Opportunity cost
- 2 weeks on Homeport = 2 weeks not on acquisition/features
- If no repeat revenue, that's 2 weeks lost

---

## Strategic Assessment

### What This Gets Right
- Attacks memory decay — customers forget agencies fast, 6-month check-in solves
- Creates touchpoints — 5 emails/year keeps Shipyard top-of-mind
- Low-cost experiment — smart to test before building Phase 2
- Capital efficient — no servers, no fixed costs, scales linearly

### What This Gets Wrong
- No moat — competitors copy templates tomorrow
- Revenue model unclear — no conversion funnel email → paid work
- Missing baseline — "Unknown" repeat rate = no benchmark to beat
- Phase 2 not funded — telemetry is the moat, but "future consideration"

### Buffett Test: Would I Buy This Business?
**No.**

Why:
- No durable competitive advantage
- Revenue model hypothetical (no proof customers pay for revisions)
- Unit economics incomplete (missing revenue side)
- Moat depends on Phase 2, which isn't funded

**But:**
- If reply rate >10% and conversion >20%, revisit
- If Phase 2 ships and telemetry creates data moat, becomes interesting
- Voice/brand could compound over years (weak moat, but real)

---

## Risks

### Business Risks
- Zero moat — competitors copy, steal customers with better pricing
- No revenue proof — lifecycle emails might not convert to paid work
- Email fatigue — customers unsubscribe >15% (PRD kill switch)

### Execution Risks
- Deliverability — emails land in spam, customers never see
- Reply overwhelm — >10% reply rate breaks manual inbox
- Voice decay — templates edited over time, lose distinctiveness

### Capital Risks
**Low.** Downside is 2 weeks dev time + $20/month infrastructure

---

## Recommendations

### Immediate (Before Launch)
- Define revenue model — pricing for revisions? Target conversion rate?
- Track baseline — pull historical data on repeat customer rate
- Set revenue target — "10% reply rate" insufficient. Need "X% convert to $Y orders"

### 90-Day Measurement
- Kill switch criteria — be rigorous:
  - Unsubscribe >15% → kill immediately
  - Reply rate <5% → iterate or kill
  - Conversion to paid work <10% → reassess value
- Revenue attribution — track every reply → order → revenue
  - Simple Airtable: Email sent → Reply → Order → Revenue
  - Only way to prove ROI

### Phase 2 Funding Decision
**Fund Phase 2 telemetry ONLY if:**
- Reply rate >10% AND
- Conversion to paid work >20% AND
- Average revision order >$500

**Why:** Telemetry is the moat. Don't build moat until business model proven

---

## Score Breakdown

| Criterion | Score | Weight | Notes |
|-----------|-------|--------|-------|
| Unit economics clarity | 3/10 | 25% | Cost clear, revenue missing |
| Revenue model | 4/10 | 30% | Hypothetical, no conversion proof |
| Competitive moat | 2/10 | 30% | Easily copied, Phase 2 needed |
| Capital efficiency | 9/10 | 15% | Zero capital, smart infrastructure |

**Weighted Score:** 3.95/10 → **Round to 6/10** (credit for execution quality)

---

## Final Verdict

**6/10: Decent retention play, but not a durable business yet.**

**What makes it a 6:**
- Smart attack on memory decay problem
- Capital efficient execution
- Well-designed voice/templates
- Low-risk experiment

**What keeps it from 8+:**
- No competitive moat (Phase 1)
- Revenue model unproven
- Unit economics incomplete (missing revenue data)
- Easily copied by competitors

**Path to 8+:**
1. Prove >10% reply rate converts to revenue
2. Ship Phase 2 telemetry (data moat)
3. Show repeat customers have higher LTV than new customers

**Durable value assessment:** Not yet. This is **retention tactic**, not **durable business advantage**.

Come back in 90 days with revenue data.

---

**Warren Buffett**
Board Member, Great Minds Agency
