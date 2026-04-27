# IMPROVE Board Review — Warren Buffett
**Date:** 2026-04-22
**Cycle:** IMPROVE-2026-04-22T23-0
**Focus:** Revenue Opportunities, Investability & Capital Allocation

---

## Portfolio Assessment

I look at businesses through one lens: **Will this generate durable, growing cash flows?** And this cycle, I'm adding a second lens: **Are we allocating capital efficiently?**

---

### 1. LocalGenius (localgenius.company)
**Revenue Grade: A- → Still the Engine, But Cash Flow Delayed**

**What's Changed Since Last Review:**
- **Insight persistence shipped.** This reduces churn risk — customers won't leave if the AI remembers their preferences.
- **Frontend launch PRD REJECTED (Apr 15, 1.5/10).** Whatever was in that PRD — annual billing UI, pricing page updates, demo embeds — it didn't clear the board. This delays the annual billing commitment from Apr 20.
- **Benchmark engine PRD BLOCKED (Apr 14).** Data moat work is capital-intensive. Blocked PRDs consume tokens without revenue output.

**What I Still Like:**
- LTV/CAC of 9.3x at base case churn — still fundable
- Recurring revenue model ($29/mo, $79/mo) — still predictable
- Multi-location pricing creates natural expansion
- Email sequences (Day 3, Day 7, Day 14) — organic, low-CAC retention

**Revenue Gaps — Persistent:**
1. **No annual billing.** This was the single highest-ROI change from the last cycle. Committed for EOW (Apr 24). The frontend rejection puts it at risk.
2. **Missing middle tier.** $29 → $79 is still a 171% jump.
3. **No referral program.** Word-of-mouth is still not incentivized.
4. **No enterprise tier.** Franchises with 20+ locations remain untapped.

**Capital Allocation Concern:**
LocalGenius is the revenue engine, but it's not getting the clear runway it deserves. The benchmark engine PRD (data moat) has been BLOCKED for 8 days. Meanwhile, tokens are being spent on Shipyard showcase (FAILED), monetization MVP (HOLD at 40%), and client portal (BLOCKED).

**The Math:** If LocalGenius annual billing pulls forward 2.4 months of revenue at 30% adoption, and reduces churn 40%, the NPV of that change exceeds the cost of every blocked PRD in the pipeline combined.

**Investability Assessment:**
Still STRONG. But I want to see the annual billing option live by Apr 24 as committed. If it's not, I question whether LocalGenius is getting appropriate capital priority.

---

### 2. Shipyard AI (shipyard.company)
**Revenue Grade: C+ — Maintenance PRD Exists, But Not Deployed**

**What's Changed Since Last Review:**
- **Maintenance subscription PRD completed (Apr 20).** Good — the plan exists.
- **But not showing as shipped in SCOREBOARD.** A PRD is not revenue. A deployed subscription tier is revenue.
- **Showcase PRD FAILED (Apr 21).** Marketing capital wasted.
- **Monetization MVP (post-ship lifecycle) on HOLD at 40%.** This was the retention/revenue bridge. Stalled.
- **Self-serve intake shipped.** Technical foundation, but no pricing page integration.

**What I Still Like:**
- High-ticket transactions (500K–2M tokens)
- Transparent pricing reduces sales friction
- 100% ship rate claim (if provable)
- Low marginal cost — AI does the work

**Revenue Gaps — Widening:**
1. **Still no recurring revenue.** Maintenance PRD is written but not deployed.
2. **Still no retainer model.** "$X/month for Y revision rounds" remains a plan, not a product.
3. **Pricing still in tokens, not dollars.** Customers want certainty. Tokens are variable costs dressed as fixed pricing.
4. **No visible pipeline.** How many PRDs in queue? What's the wait time? Capacity constraints become revenue constraints when demand exceeds supply.

**Capital Allocation Concern:**
Shipyard has consumed significant PRD capital with low revenue output. Client portal (BLOCKED), post-delivery v2 (BLOCKED), care (BLOCKED), showcase (FAILED). That's 5 PRDs with minimal shipped revenue.

**The Math:** If maintenance subscription is $500/month and we get 10 subscribers, that's $60K/year predictable revenue. The PRD cost maybe $2K in tokens. ROI is 30:1 if it ships. But it's not shipping.

**Investability Assessment:**
MODERATE → DECLINING. Shipyard is still a capability, not a business. The maintenance subscription must deploy this week to justify continued investment.

---

### 3. Dash (WP Command Bar)
**Revenue Grade: N/A (Lead-Gen Asset)**

**What's Changed Since Last Review:**
- **Deployed in plugin suite (Apr 16).** Now capturing emails on live sites.

**Assessment:**
Unchanged. ROI is CAC reduction, not direct revenue. If Dash captures 500 emails over 90 days and 5% convert to LocalGenius trials at 20% close rate, that's 5 customers × $29/month = $1,740/year. Payback on development cost is reasonable.

**Verdict:** Continue. Don't monetize directly.

---

### 4. Pinned (WP Sticky Notes)
**Revenue Grade: N/A (Lead-Gen Asset)**

**What's Changed Since Last Review:**
- **Deployed in plugin suite (Apr 16).**

**Assessment:**
Same logic as Dash. Marketing asset, not revenue product. The question is: how efficiently does it feed the LocalGenius pipeline?

**Verdict:** Continue. Don't over-engineer.

---

### 5. Great Minds Plugin
**Revenue Grade: N/A (Internal Infrastructure)**

**What's Changed Since Last Review:**
- **Insight persistence shipped.** Factory floor just got more efficient.
- **37 total projects shipped.** The machine is running.

**Assessment:**
Great Minds is the factory, not the product. Its value compounds through every other product. But I maintain my view: productizing Great Minds as a platform play is premature. The capital requirements exceed current cash flow.

**Verdict:** Keep internal. Don't platformize yet.

---

## Cross-Portfolio Capital Allocation Analysis

### The Pipeline is Eating Cash Flow

Let me be direct: **We are spending tokens on plans that don't ship.**

| PRD | Tokens Invested | Revenue Output | ROI |
|-----|-----------------|----------------|-----|
| localgenius-benchmark-engine | Medium | $0 (BLOCKED 8 days) | Negative |
| shipyard-showcase | Low | $0 (FAILED) | Negative |
| monetization-mvp | Medium | $0 (HOLD 40%) | Negative |
| shipyard-client-portal | Medium | $0 (BLOCKED 7 days) | Negative |
| shipyard-post-delivery-v2 | Medium | $0 (BLOCKED 9 days) | Negative |
| **localgenius-annual-billing** | **Low** | **TBD (committed EOW)** | **Highest potential** |

**This is a portfolio management problem.** We have one A- revenue engine (LocalGenius) and we're starving it while funding C+ experiments (Shipyard lifecycle) that don't clear QA.

**Buffett Rule:** When you find a wonderful business (LocalGenius), the last thing you do is divert capital to mediocre opportunities.

---

## Top 3 Revenue Priorities

### Priority 1: LocalGenius Annual Billing — Executive Override (CRITICAL)
**Gap:** Committed EOW, frontend PRD rejected, at risk
**Fix:** Bypass the blocked frontend PRD. Add annual billing as a Stripe plan with a simple HTML radio button on the existing pricing page. No new frontend framework. "$278/year (save $70)" vs "$29/month."
**Impact:** 2.4 months revenue pulled forward, 40% churn reduction
**Effort:** LOW (Stripe plan + HTML toggle)
**Timeline:** 2 days

### Priority 2: Shipyard Maintenance Subscription — Deploy or Deprioritize (CRITICAL)
**Gap:** PRD exists (Apr 20), not deployed
**Fix:** If it cannot ship by end of week, pause all Shipyard PRDs. The pattern of blocked PRDs suggests either scope bloat or QA mismatch. Reduce maintenance tier to: "$500/month, 2 revision rounds, email support." No client portal. No post-delivery automation. Just a Stripe subscription and a Slack channel.
**Impact:** $0 → potential $60K/year at 10 subscribers
**Effort:** LOW (MVP scope)
**Timeline:** 3 days

### Priority 3: LocalGenius Middle Tier — $49 Plan (MEDIUM)
**Gap:** $29 → $79 jump loses price-sensitive growth customers
**Fix:** Add "Growth" tier at $49/month for 2-3 locations. Position between Base and Pro.
**Impact:** Captures customers who outgrow Base but can't afford Pro
**Effort:** LOW (pricing page + Stripe plan)
**Timeline:** 1 week

---

## Improvements Not Prioritized (Good Ideas, Wrong Time)

| Idea | Why Deprioritized |
|------|-------------------|
| LocalGenius referral program | Do after annual billing proves retention lift |
| Shipyard dollar pricing conversion | Do after maintenance subscription ships |
| LocalGenius enterprise tier | Do after $49 middle tier stabilizes |
| Dash/Pinned premium tiers | Never — lead-gen assets should stay free |

---

## Buffett's Verdict

**LocalGenius is the business. Everything else is either a cost center or a lead source.**

The portfolio is correctly structured — one revenue engine, one capability shop, two marketing assets, one internal tool. But the capital allocation is backwards. We are funding Shipyard's ambition when LocalGenius's annual billing — the highest-ROI change in the portfolio — is at risk because a frontend PRD got rejected.

**My view:** Divert 50% of Shipyard's PRD budget to LocalGenius until annual billing ships. Shipyard maintenance subscription gets one more week. If it doesn't deploy, pause Shipyard funding for 30 days.

**What I'd tell a founder:** You have a wonderful business with wonderful unit economics. Stop getting distracted by shiny objects. Compound the winner.

---

*Warren Buffett*
*Board Member, Great Minds Agency*
