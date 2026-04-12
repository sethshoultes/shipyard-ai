# Board Review: shipyard-post-delivery-v2 (Anchor)

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-12
**Lens:** Durable Value

---

## Executive Summary

This is the first PRD from Shipyard that demonstrates business thinking, not just product thinking. They've correctly diagnosed the fatal flaw in their model—100% churn after delivery—and designed a simple, capital-efficient remedy. The restraint shown here is the most impressive part.

---

## Unit Economics

### Customer Acquisition Cost (CAC)

**Effectively $0 incremental for maintenance.**

The client is acquired through the original project sale. The maintenance upsell rides that existing relationship at no additional marketing spend. The only cost is 5 minutes of email send time per touchpoint (4 emails total = 20 minutes per client over 6 months).

**Cost to serve (Anchor Basic at $79/month):**
- 50K tokens/month allowance
- Assuming $0.01 per 1K tokens (Claude API), that's $0.50 max token cost
- 48-hour response SLA means no dedicated staff; batched work
- Gross margin: ~99% if token usage stays within allowance

**Cost to serve (Anchor Pro at $149/month):**
- 200K tokens/month = $2.00 max token cost
- Quarterly refresh proposal = ~30 min per quarter
- Gross margin: ~98%

**Verdict:** These are software-like margins on a services wrapper. Excellent.

---

## Revenue Model

### Is This a Business or a Hobby?

**This is a business.** Here's why:

1. **Recurring revenue with high retention probability.** Once a client is on Anchor, switching costs are real—they'd need to find a new developer, explain their site, rebuild trust. Stickiness is structural.

2. **LTV math works.** If a $2,000 project client converts to $79/month Anchor Basic with 12-month average retention:
   - Project: $2,000 one-time
   - Anchor: $948/year recurring
   - Year 2: $948 again with no acquisition cost
   - LTV doubles on retention.

3. **Natural upsell path.** Anchor Basic → Anchor Pro ($70/month delta). Project refresh requests from maintenance clients (already in the conversation).

4. **Targets from PRD are modest and achievable:**
   - 25% attach rate on new projects
   - $400 MRR in 60 days (5 Basic clients or 2-3 Pro)

### Revenue Projection (Conservative)

| Clients/Month | Attach Rate | New Anchor | MRR Added | Cumulative MRR |
|---------------|-------------|------------|-----------|----------------|
| 4 | 25% | 1 | $79 | $79 |
| 4 | 25% | 1 | $79 | $158 |
| 4 | 25% | 1 | $79 | $237 |
| 4 | 25% | 1 | $79 | $316 |
| 4 | 25% | 1 | $79 | $395 |
| 4 | 25% | 1 | $79 | $474 |

**By month 6:** ~$474 MRR with minimal churn assumed.

At 50% Pro tier mix, that's closer to **$550 MRR**.

**By month 12:** $948–$1,100 MRR from maintenance alone, assuming consistent delivery pace.

This is small, but it compounds. A $10K+ ARR business within 12 months from a zero-cost addition to existing workflow.

---

## Competitive Moat

### What Stops Someone From Copying This in a Weekend?

**Nothing technical.** Any agency could copy this tomorrow. That's actually fine.

The moat here isn't technology. It's **operational discipline and brand positioning**.

1. **The "We don't disappear" hook is defensible through repetition.** If Shipyard consistently delivers on this promise across dozens of clients, it becomes their reputation. Reputation compounds; copy-paste doesn't.

2. **The process documentation is the moat.** Most agencies have good intentions about follow-up. None document the process to this level. The Notion database, email templates, voice guide, and send process create institutional memory that survives individual employees.

3. **First-mover advantage in the relationship.** By the time a competitor could pitch maintenance, the Anchor sequence has already established trust at Day 0, Day 7, and Day 30. The client isn't shopping.

4. **Manual-first is strategically correct.** By avoiding automation, Shipyard can iterate on messaging based on actual client responses. When they do automate (at 25 clients), they'll automate what works. Competitors building automation first will automate guesses.

**Risk:** This moat is weak until Shipyard has 20+ successful Anchor relationships. Before that, it's just a plan.

---

## Capital Efficiency

### Are We Spending Wisely?

**Yes.** This is one of the most capital-efficient PRDs I've reviewed.

| Investment | Cost | Return |
|------------|------|--------|
| 5 days to build | Labor only | Infinite ROI if it works |
| Stripe setup | $0 (pay-per-use) | No upfront cost |
| Notion database | $0–$10/month | Already in use |
| Email sends | $0 (Gmail) | Free until scale |
| Automation (future) | Deferred | Only build if Phase 1 proves demand |

**Total capital requirement:** $0 incremental.

The PRD explicitly states: "Ship manual, automate later." This is correct. I've seen too many startups build automated billing systems for products no one buys.

The Phase 2 automation is appropriately gated:
- 15 clients: Evaluate
- 25 clients: Deploy automation
- 50 clients: Consider full CRM

This is milestone-based capital deployment. Spend when evidence justifies it.

---

## Concerns

### 1. Token Estimation Risk

The pricing assumes 50K tokens (Basic) and 200K tokens (Pro) are sufficient. If clients consistently exceed allowances, the team faces:
- Awkward overage conversations
- Compressed margins
- Pressure to do free work to preserve relationship

**Mitigation needed:** Track actual token usage religiously from Day 1. Adjust pricing or allowances within 90 days if data contradicts assumptions.

### 2. Manual Process Fragility

The entire system depends on someone opening Notion every morning. If they're sick, traveling, or simply forget, emails don't go out. The "we don't disappear" promise becomes a lie.

**Mitigation in place:** Escalation protocol exists (15 → 25 → 50 client thresholds). Acceptable for Phase 1.

### 3. No Annual Prepay Yet

The PRD mentions "2 months free for annual prepay" but defers implementation. Annual prepay would:
- Improve cash flow
- Reduce churn (commitment psychology)
- Signal client confidence

**Recommendation:** Implement annual option by month 3 if any clients ask.

### 4. Pricing May Be Too Low

$79/month for "peace of mind" and $149/month for "strategic partnership" are aggressive. Market research suggests:
- $99 feels more like professional service
- $149 vs $199 for Pro tier leaves money on the table

**Counter-argument:** At current scale, volume matters more than margin. Low pricing reduces conversion friction. Can raise prices for new clients later.

---

## What I'd Want to See in 90 Days

1. **Attach rate data.** Did 25% of new projects convert to Anchor?
2. **Token usage actuals.** Are allowances calibrated correctly?
3. **Churn rate.** Did anyone cancel in month 2 or 3?
4. **Reply rates.** Which emails generate responses?
5. **Time-to-send compliance.** Hitting 95% on-time?

If attach rate is 15%+, token usage is within allowances, and churn is <10% monthly, Phase 2 automation is justified.

---

## Score: 7/10

**Justification:** Correct diagnosis, elegant solution, capital-efficient execution—but the moat is unproven until 20+ clients validate the model and the "we don't disappear" promise becomes operational reality.

---

## The Buffett Test

*"Would I buy this business for 10x annual revenue?"*

**Not yet.** At $0 ARR and 0 Anchor clients, there's nothing to buy. The plan is sound, but plans are worth nothing without execution.

**In 12 months, if:**
- $12K+ ARR from Anchor
- 25+ active maintenance clients
- <10% monthly churn
- Documented process being followed

Then yes, this becomes a business worth multiples—because the revenue is recurring, the margins are excellent, and the customer relationship is owned.

---

## Recommendation

**Approve for immediate implementation.**

Ship Phase 1 this week. Track the five metrics I listed. Present 90-day data at next board review.

The best time to start building recurring revenue was a year ago. The second best time is today.

---

*"Price is what you pay. Value is what you get. This team is finally building something that delivers ongoing value—and capturing some of it."*

— Warren Buffett
Board Member, Great Minds Agency
