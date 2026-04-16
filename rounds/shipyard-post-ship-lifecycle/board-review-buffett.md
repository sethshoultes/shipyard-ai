# Board Review: Warren Buffett
**Project:** Shipyard Post-Ship Lifecycle ("Homeport")
**Date:** 2026-04-16
**Lens:** Durable value, unit economics, competitive moat

---

## Score: 7/10
**Verdict:** Transforms transactions into relationships — good margin structure, but moat depends on execution quality.

---

## Unit Economics

**Customer Acquisition Cost (CAC):**
- Zero marginal CAC for lifecycle system
- Customer already acquired through core Shipyard project sale
- Lifecycle emails cost ~$0.01 per send (Resend pricing)
- 5 emails/customer/year = $0.05 total

**Cost to Serve:**
- Cloudflare Workers: ~$0 (free tier covers 100K requests/day)
- Resend: $0.05/customer/year (5 emails × $0.01)
- Reply inbox monitoring: Phil's time (~2 hrs/week at 10% reply rate)
- **Total marginal cost per customer: $0.05/year**

**Revenue Opportunity:**
- 20% conversion target on revision/update CTAs (PRD line 30)
- If revision averages $2,000 (conservative for web agency work)
- Expected value per customer: $2,000 × 0.20 = $400/year
- **Gross margin: 99.99%** ($400 revenue - $0.05 cost)

**Payback Period:**
- First revision request pays for 8,000 years of lifecycle emails
- Break-even at 0.0125% conversion rate

---

## Revenue Model

**Current State:**
- Transaction business: one-off project fees, no recurring revenue
- Customer forgets Shipyard 6 months post-ship (PRD line 16)
- No retention mechanics = starting from zero each sale

**Post-Homeport:**
- Recurring touchpoints: 5 emails over 365 days
- Conversion funnel to paid updates/revisions
- Three revenue streams unlocked:
  1. **Repeat projects** (new sites from existing customers)
  2. **Revisions** (small updates, faster turnaround)
  3. **Maintenance contracts** (future, not in MVP)

**Business or Hobby?**
- Business if conversion rate hits 10%+ on any CTA
- 12 shipped projects × 10% = 1.2 paid updates/year minimum
- At $2K average = $2,400/year incremental revenue from 12 customers
- Scales linearly with shipped project volume
- **Verdict: Business, not hobby** — creates repeat revenue engine

---

## Competitive Moat

**What stops someone from copying this in a weekend?**

**Easy to copy (weak moat):**
- Email templates (5 text files)
- Scheduled cron job (standard Worker pattern)
- Transactional email service (Resend, SendGrid, Postmark — commodity)

**Hard to copy (durable moat):**
1. **Voice and positioning** — "Trusted mechanic" tone requires craft (templates show this, Day 7/30/90)
2. **Data compounding** — Phase 2 telemetry (PRD lines 81-89) creates operational insights competitors can't replicate without shipped volume
3. **Relationship quality** — Phil monitoring replies personally (<24h SLA) builds trust traditional agencies won't match
4. **Integration into core product** — Lifecycle emails auto-populate from shipment pipeline (V1.1, PRD lines 141-146)

**Moat strength assessment:**
- **Year 1:** Weak moat (anyone can clone templates)
- **Year 2+:** Moderate moat if Phase 2 telemetry ships — "Sites with X framework ship 40% faster" (PRD line 88) becomes intellectual property
- **Long-term:** Strong moat if customer LTV data + project patterns create recommendation engine

**Competitive vulnerability:**
- If another agency appears with better timing (e.g., customer needs update Day 91, competitor cold-calls Day 90), no lock-in prevents switch
- Mitigation: 365-day touchpoint cadence reduces timing vulnerability from 100% to ~20%

---

## Capital Efficiency

**Investment Required:**
- MVP build: 2 weeks (PRD lines 134-140)
- Resend setup: $0 initial, $20/month at scale (10K emails/month)
- Worker infrastructure: $0 (Cloudflare free tier)
- Data entry (manual CSV): 2 hours one-time
- **Total upfront cost: ~$40 (1 month Resend + setup time)**

**Return on Investment:**
- Single revision request = $2,000 revenue
- ROI break-even at 0.002% conversion rate
- PRD targets 20% conversion = 10,000x ROI multiple

**Capital allocation wisdom:**
- Zero infrastructure risk (no servers, no hosting costs)
- Low execution risk (email delivery is solved problem)
- High leverage (automated touchpoints scale infinitely)
- **Verdict: Exceptionally capital-efficient** — $40 investment, $400+ expected value per customer

**Spending wisely?**
- Yes — minimal cash outlay, massive margin expansion potential
- Risk is time (2 weeks build), not capital
- If it fails, sunk cost is 80 hours of dev time (~$8K opportunity cost)
- If it succeeds, unlocks 20-30% repeat customer rate (PRD line 28)

---

## Strengths (Buffett Approves)

1. **Economic moat emerging** — Phase 2 telemetry creates proprietary operational data
2. **Pricing power** — Returning customers pay premium for trusted relationship
3. **Negative working capital** — Customer already paid for initial project before lifecycle begins
4. **Scalability** — Marginal cost approaches zero as volume increases
5. **Aligned incentives** — Phil monitors replies personally (skin in game)

---

## Risks (Buffett Warns)

1. **No lock-in** — Customer can ghost Shipyard despite lifecycle emails
2. **Moat depends on execution** — Templates must maintain voice quality at scale
3. **Manual reply handling doesn't scale** — Phil's time becomes bottleneck above 10% reply rate
4. **Competitor can poach customers** — Lifecycle emails remind them they need updates, but don't prevent switching to cheaper agency
5. **Email deliverability fragility** — One spam complaint spike kills domain reputation

---

## Strategic Recommendations

1. **Ship Phase 2 telemetry within 6 months** — Data moat is the durable advantage
2. **Track LTV by cohort** — Measure which project types generate most repeat revenue
3. **Convert high-value customers to retainers** — Lock in top 20% with annual maintenance contracts
4. **Build unsubscribe firewall** — Any unsubscribe rate >5% requires immediate copy review
5. **Test pricing elasticity** — Returning customer discount vs. premium pricing (which drives more revenue?)

---

## Final Verdict

**This is not a revolutionary business.**
**This is a blocking-and-tackling retention play.**

But it's the right play. Shipyard currently has a leaky bucket — customers pour in, complete projects, disappear. Homeport plugs the leak.

Unit economics are excellent. Capital efficiency is exceptional. Competitive moat is weak initially but strengthens with data compounding.

**The risk is execution:** If email voice degrades to generic agency spam, this becomes noise. If Phil stops monitoring replies personally, trust signal dies. If Phase 2 telemetry never ships, no durable moat emerges.

**But if executed well:** 30% repeat customer rate (PRD target) transforms Shipyard from project shop to relationship business. Customer lifetime value doubles. Referral rates increase (happy customers remember you).

**Score: 7/10** — Good fundamentals, modest moat, exceptional capital efficiency. Needs Phase 2 to reach 9/10.

---

**Warren Buffett**
Board Member, Great Minds Agency
