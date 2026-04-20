# Board Review: Shipyard Maintenance Subscription
**Reviewer:** Warren Buffett
**Date:** 2026-04-20
**Lens:** Durable Value

---

## Unit Economics

**Customer Acquisition Cost (CAC):**
- Zero paid ads in plan
- Referral-only distribution ($100 MRR credit per conversion)
- Effective CAC: $1,200 (12 months × $100 credit)
- Assumes 2-month conversion delay (fraud protection)
- Risk: Viral loop unproven

**Cost to Serve:**
- $500 tier = 100K tokens = ~6-7 PRD revisions (15K tokens/revision estimate)
- Token cost unknown (Claude API pricing not specified)
- Dedicated capacity = incremental infrastructure spend
- Health monitoring automation = fixed cost, scales well
- No human labor per transaction (fully automated)

**Problem:** Token cost basis not disclosed. Cannot calculate margin without knowing underlying API costs. If Claude charges $0.015/1K tokens (typical Sonnet pricing), 100K tokens = $1.50 COGS. Gross margin >99%. If pricing higher or compute overhead significant, changes calculus.

**Verdict:** Economics look strong IF token costs low. Missing data = investment risk.

---

## Revenue Model

**Structure:**
- $500/month Care tier (100K tokens)
- $1,000/month Care Pro tier (250K tokens)
- Target: 10 subscribers = $5K MRR in 90 days

**Current State:**
- Zero subscribers today
- Zero recurring revenue today
- Transactional agency model (no baseline)

**Churn Risk:**
- SaaS products = monthly opt-out
- If customer ships once, gets maintenance, never needs updates again → churn
- No lock-in mechanism
- 80% retention target = 20% monthly churn assumed

**Assessment:** This is a business model, not a hobby. But $5K MRR = $60K ARR. Too small to matter yet. Needs path to $1M ARR (167 subscribers) within 24 months to be real business.

**90-day milestone realistic?** Maybe. Depends entirely on existing customer base size. PRD mentions "past customers" but no count. If 100 past customers exist, 10% conversion = achievable. If 20 past customers, need 50% conversion = unlikely.

**Verdict:** Business structure correct. Scale targets missing.

---

## Competitive Moat

**What stops copying?**

**Technical barriers:** None.
- Stripe integration = 2 hours
- Token tracking database = 1 hour
- Email templates = 30 minutes
- "Weekend project" assessment accurate

**Defensibility levers:**
1. **Existing customer base** — Only past Shipyard customers get value (maintenance requires deployed project). Competitor can't steal installed base overnight.
2. **Brand trust** — "We've got this" positioning requires earned reputation. New entrant starts at zero trust.
3. **Integration lock-in** — Subscriber PRDs processed via existing Shipyard daemon. Switching cost = re-onboarding entire project to new provider.

**Moat depth:** Shallow.
- No proprietary technology
- No network effects (referral credits ≠ network effects)
- No data moat (token usage logs not valuable IP)
- Customer stickiness = only moat, depends on quality execution

**Attack vectors:**
- Competitor launches "maintenance-as-a-service" for any AI-shipped project (not just Shipyard customers)
- Vercel/Netlify add monitoring + auto-fixes as native feature (free)
- Customer DIY with Uptime Robot + ChatGPS script = $0/month

**Verdict:** No moat. First-mover advantage in own customer base only. Defensibility = execution quality × brand trust. Must ship fast before others wake up.

---

## Capital Efficiency

**Cash required:**
- Development: 8 hours labor (spec estimates) = <$2K if contractor, $0 if founder time
- Infrastructure: Database (Neon free tier or $20/month), Stripe fees (2.9% + $0.30), email service ($0-50/month)
- Marketing: $0 (email to past customers, referral-only)
- Total upfront: <$3K

**Burn rate:**
- Fixed: ~$100/month (infrastructure)
- Variable: Token costs (unknown, see above)
- Human support: Automated (incident reports only)

**Return timeline:**
- 10 subscribers × $500 = $5K MRR
- Break-even: Month 1 if development capitalized
- Payback period: <1 month

**Risk/reward:** Asymmetric. Low capital, capped downside (<$5K), uncapped upside if scales.

**Efficiency score:** Excellent. Minimal spend, fast validation, leverages existing assets (customer base, daemon infrastructure, brand).

**Red flag:** No budget for customer success. If subscribers churn because incident reports inadequate or priority queue doesn't deliver promised value, burns trust faster than revenue compounds.

**Mitigation:** Manual white-glove first 10 subscribers. Founder reads every incident report, calls unhappy customers. Automate after proving retention.

---

## Score: 6/10

**Justification:** Smart incremental bet with poor visibility into unit economics and no durable moat.

**Why not higher:**
- Token cost basis unknown (cannot underwrite margin)
- Scale path to $1M ARR undefined
- Competitive moat = execution only (easily copied)
- Churn risk unaddressed (what happens after customer's site stable for 6 months?)
- Viral loop unproven (referrals ≠ guaranteed distribution)

**Why not lower:**
- Capital efficient (<$5K risk)
- Recurring revenue > transactional model (correct strategic direction)
- Leverages existing assets (no greenfield build)
- Fast validation (90 days to prove/kill)
- Downside contained, upside plausible

---

## Recommendations

1. **Disclose token costs.** Calculate gross margin before launch. If <50%, pricing broken.

2. **Add churn mitigation.** What happens when subscriber doesn't use tokens for 2 months? Auto-pause with opt-in resume? Annual prepay discount (lock in cash)?

3. **Define scale milestones.** $5K MRR = proof of concept. Need targets: $25K MRR (50 subs), $100K MRR (200 subs). When do you hit each? What breaks at each stage?

4. **Build moat while you can.** First 100 subscribers = lock-in window. Options:
   - Annual contracts (upfront cash, lower churn)
   - Multi-project pricing (increase switching cost)
   - Exclusive Slack channel (community = stickiness)
   - Priority feature requests (voice = loyalty)

5. **Test pricing power.** $500/month = anchored to competitor mental models. What if Care = $750? Care Pro = $1,500? Token value opaque enough that 50% price increase won't crater demand. Test with first 5 subscribers.

6. **Quantify existing customer base.** If <50 past customers, 10-subscriber target requires 20% conversion. If <20 past customers, target unachievable. Size the funnel before spending 8 hours building.

---

**Final Word:**

Shipyard currently generates revenue like selling lemonade at a roadside stand. Volume depends on traffic. This subscription converts the stand into a juice bar with members. Directionally correct.

But juice bars fail when: (1) Cost of oranges exceeds membership fees, (2) Members stop drinking juice, (3) Competitor opens across the street with lower prices.

You've addressed none of these yet.

Build it. Launch it. Watch the numbers. If gross margin <50% or churn >20%, shut it down by month 3. If both metrics healthy, reinvest profits into moat-building (annual contracts, community, brand).

Don't confuse "business model" with "durable business." You've built the former. The latter requires proof.

---

*Warren Buffett*
Board Member, Great Minds Agency
