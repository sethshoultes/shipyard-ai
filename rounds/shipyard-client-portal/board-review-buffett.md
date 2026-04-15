# Board Review: Shipyard Client Portal
**Reviewer:** Warren Buffett (Capital & Revenue)
**Date:** April 15, 2026
**Score:** 6/10

---

## Verdict
**This is real infrastructure, not theater—but incomplete at current funding stage.**

---

## Unit Economics

**Customer Acquisition Cost (CAC):**
- Zero. Self-service portal eliminates sales conversations.
- Marketing cost unknown (not documented).
- Assume <$100 per customer through content/SEO.

**Cost to Serve One User:**
- Infrastructure: ~$5/month (Supabase free tier covers first 50K users; Vercel scales cheaply)
- Stripe fees: 2.9% + $0.30 per transaction
- Email (Resend): ~$0.10/month per active user
- **Total ongoing cost per user: ~$6/month**

**One-Time Project Client:**
- Revenue: $500-1,500
- COGS: $6 serving cost + token budget already in PRD (~$50-150 in LLM costs)
- **Net margin: $344-1,344 per project**
- Payback period: Instant (upfront payment via Stripe)

**Retainer Client:**
- Revenue: $299/month
- COGS: $6 serving + ~$30-60 token usage
- **Net margin: ~$233-263/month**
- LTV (assuming 12-month retention): ~$2,796-3,156

---

## Revenue Model: Is This a Business or a Hobby?

**Current State (Pre-Portal):**
- $5K/month project revenue
- Zero recurring revenue
- Pure services model: exhausting, low-margin, no compounding value

**Target State (Post-Portal):**
- $12K/month project revenue (140% increase via self-service volume)
- $1,495 MRR from 5 retainers
- **Total MRR: $13,495**

**Math:**
- Target assumes 15-20 projects/month (3x current volume)
- Target assumes 5 retainer clients (0 → 5 in 90 days)
- Retainer attach rate: Unknown. If 25% of completed projects convert to retainer, this works. If 5%, it doesn't.

**Critical Missing Assumptions:**
1. Conversion rate: project completion → retainer subscription
2. Churn rate for retainers
3. Average retainer lifespan
4. Acquisition funnel metrics (traffic → signup → project submission)

**Is it a business?**
- Not yet. $13.5K MRR is a side project, not a company.
- At 20% MoM growth (plausible with self-service), this becomes $50K MRR in 12 months. Now we're talking.
- **Needs proof of repeatable acquisition + retention before claiming "business" status.**

---

## Competitive Moat: What Stops Weekend Cloners?

**Zero technical moat.**
- Stack: Next.js + Supabase + Stripe. Available to anyone with $0 and a weekend.
- No proprietary tech. No network effects. No IP.

**Operational moat (weak):**
- "27+ completed PRDs, 4 live sites, 5-7 day turnaround"—this is execution, not defensibility.
- Competitors (Webflow, Framer, no-code agencies) already exist at scale.

**Brand moat (nonexistent):**
- No testimonials visible in portal.
- No case studies.
- No demonstrated client loyalty (no retainers yet).

**Data moat (potential):**
- If portal captures client preferences, project patterns, conversion optimization data → could build proprietary insights.
- **Not built yet.**

**What actually stops cloning:**
- Nothing stops cloning the portal.
- Everything depends on whether Shipyard AI's *pipeline* (the DEBATE → PLAN → BUILD → REVIEW system) is superior.
- Portal is just distribution. Pipeline is the product.

**Verdict:** No moat in portal itself. Moat must come from delivery quality + speed + client relationships. Portal enables scaling those relationships—it doesn't create defensibility.

---

## Capital Efficiency: Are We Spending Wisely?

**Development Cost:**
- Estimated 5 weeks of build time (per PRD milestones)
- Assume $10K-15K in dev time (if outsourced) or 120-160 hours (if internal)
- Tech stack choices are lean: no unnecessary frameworks, no over-engineering

**Infrastructure Costs:**
- Supabase: Free tier → $25/month (once you cross 500MB DB or 2GB bandwidth)
- Vercel: Free tier → $20/month (once you need more than hobby tier)
- Stripe: No monthly fee, just per-transaction
- Resend: Free tier → $20/month once you cross 3K emails/month
- **Total monthly infra: $0 (launch) → ~$65/month (at scale)**

**Efficient?**
- Yes. This is textbook lean SaaS infra.
- No wasted spend on enterprise features not yet needed.
- Scales gracefully: costs rise proportionally with revenue.

**Return on Investment:**
- If portal enables 3x project volume → ROI positive in Month 1
- If portal enables retainer revenue → payback in <3 months (5 retainers = $1,495 MRR > $15K dev cost in 10 months)

**Risk:**
- Biggest risk isn't capital waste—it's *time* waste if self-service doesn't convert.
- No evidence yet that clients *want* self-service. PRD assumes demand; portal must validate it.

---

## What's Missing

**Pre-Revenue Validation:**
- No prototype tested with real clients
- No survey data: "Would you use a self-service portal?"
- No A/B test: manual intake vs. self-service conversion rates

**Retention Metrics:**
- No churn assumptions for retainers
- No LTV calculations beyond 12-month guess
- No cohort analysis planned

**Growth Levers:**
- Portal doesn't create demand. Where do new clients come from?
- SEO? Paid ads? Referrals? Not documented.

**Pricing Validation:**
- $299/month retainer: Is this anchored to market or to cost?
- 200K tokens = how many updates? Client won't understand "tokens"—needs translation to outcomes.

---

## What I'd Want to See Before Investing

1. **Proof of retainer demand:** Survey 10 past clients. How many would pay $299/month for ongoing updates?
2. **Unit economics with real data:** What's actual LLM cost per project? Actual support time?
3. **Acquisition plan:** Portal enables self-service, but how do clients discover Shipyard?
4. **Retention loop:** What keeps clients coming back after project ends? Analytics dashboard is good start—but is it enough?

---

## Score Justification

**6/10 — Real infrastructure, unproven business model.**

**What's good:**
- Eliminates human bottleneck (sales/intake)
- Enables recurring revenue (retainers)
- Capital-efficient tech stack
- Solves real problem (client visibility into project status)

**What's concerning:**
- No moat
- No validation that clients want self-service
- Revenue targets assume conversion rates not yet proven
- Competitive landscape ignored (Webflow, Framer, Builder.io already serve this market)

**What would raise score to 8+:**
- Evidence of retainer demand (3+ LOIs from existing clients)
- Pricing anchored to customer willingness-to-pay, not cost-plus
- Clear acquisition strategy with CAC:LTV ratio >3:1
- Cohort data showing client retention beyond first project

---

## Final Word

You're building a vending machine for websites. That's smart.
But vending machines only work if people know where they are and keep coming back.

Portal = distribution infrastructure.
Pipeline = the product.
**Prove the product has repeatable demand, then scale distribution.**

Right now, you're building the car before proving people want to drive.
I'd rather see 10 retainer clients on a Google Sheet than a perfect portal with zero subscribers.

—WB
