# Board Review — Warren Buffett
**Date:** 2026-05-04
**Agent:** Warren Buffett
**Focus:** Revenue Opportunities, Investability
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

My May 2 conclusion stands: we have zero revenue across the portfolio. But I now have new data that makes the situation more urgent.

Two of our products are broken (Pinned fatal error, Shipyard 404). A broken product cannot generate revenue. It generates refunds, chargebacks, and 1-star reviews that permanently damage pricing power.

We also have a naming collision: "Dash" in the WP Intelligence Suite is not the Cmd+K palette. The actual Cmd+K is "Beam." If our internal accounting is this confused, our revenue attribution will be too.

The investability score of the portfolio is not 2.6/10. It is lower.

---

## Product-by-Product Analysis

### 1. LocalGenius — ✅ STILL THE ONLY REAL BET

**Current State:** Zero revenue. Clean architecture. LTV/CAC math is still theoretically sound at 9.3x.

**New Finding:**
`prd-agentpress-2026-05-03.md` shipped. This creates a distribution channel. If every Shipyard-built WordPress site auto-installs AgentPress, and AgentPress upsells LocalGenius, we have an attach rate we can measure.

**The Revenue Math:**
- If Shipyard builds 20 sites/month and 30% install LocalGenius via AgentPress, that's 6 organic acquisitions/month with near-zero CAC.
- At $149/mo average revenue, that's $10,728/year in organic revenue from a channel that costs us nothing incremental.

**Investability Score:** 5/10 (up from 4/10 — AgentPress creates organic distribution)

**What I'd Do This Week:**
1. Add a LocalGenius upsell inside AgentPress. "Your site is live. Want AI marketing? One-click install."
2. Launch the "$1 for 30 days" trial. Not next month. Now. We have distribution. Distribution without monetization is charity.
3. Create a "Pay What You Save" experiment: "LocalGenius saved Maria's Kitchen $1,200 in agency fees this quarter. Pay 10% of what you saved." This tests true pricing power.

---

### 2. Shipyard AI — ❌ REVENUE MODEL STILL BROKEN, NOW INVISIBLE

**Current State:** Issue #98 means www.shipyard.company is 404ing. A 404ing storefront has a conversion rate of exactly 0%.

**The New Math:**
- 37 shipped projects. Revenue per shipped project: $0.
- 4 example sites (Bella's Bistro, etc.). Are they paying? If not, they're marketing spend, not revenue.
- DNS fix cost: $0 (update a record). Revenue loss per day of 404: incalculable, but non-zero.

**Investability Score:** 1/10 (down from 2/10 — the storefront is offline)

**What I'd Do Today:**
1. Fix the DNS. This is not a strategy decision. This is a "don't leave money on the sidewalk" decision.
2. Pick Lane A (Agency SaaS at $99/mo) and publish pricing. Ambiguity is a tax on conversion.
3. Sunset or fix the broken plugins immediately. A platform with 4 broken plugins is not a platform. It's a repair shop.

---

### 3. Beam (Cmd+K) — ⚠️ LOSS LEADER WITH DATA VALUE

**Current State:** Shipped. No monetization. Clean code. No build step.

**New Finding:**
The actual Cmd+K product is "Beam," not "Dash." This means our branding and any future revenue model is built on a naming foundation of sand.

**The Data Opportunity:**
Beam sees what users search for in wp-admin. That data is valuable to Shipyard's template design. If users search "SEO" 400 times a day, Shipyard should build SEO-forward sites. This is market intelligence with zero marginal cost.

**Investability Score:** 2/10 (up from 1/10 — data value recognized)

**What I'd Do:**
1. Rename Beam to "Shipyard Beam" or "Shipyard Command." Align the brand.
2. Add anonymized search telemetry (opt-in). Use it to inform Shipyard template priorities.
3. Bundle Beam + Pinned + AdminPulse as the "Shipyard Admin Suite" at $29/year. That's not revenue. That's a filtering mechanism — users who pay $29 are 10x more likely to pay $499 for a site.

---

### 4. Pinned (WP Intelligence Suite) — ❌ NEGATIVE REVENUE POTENTIAL

**Current State:** Fatal error on activation. Broken.

**The Revenue Impact of Broken:**
A user who installs a broken plugin and gets a white screen will:
- Uninstall immediately
- Leave a 1-star review (permanent)
- Never trust another product from the same author

The lifetime value of that user just went from "unknown" to "negative" because they become an anti-referral.

**Investability Score:** 0/10

**What I'd Do Today:**
Delist or fix. A broken free plugin destroys pricing power for every future product. The cost of a bad free user experience is not $0. It is the lifetime value of every user they warn away.

---

### 5. Great Minds Plugin — ⚠️ COST CENTER WITH CLOUD POTENTIAL

**Current State:** v1.4.0. Zero direct revenue. MIT license.

**New Finding:**
The daemon ran 27 commits in 24 hours. It is actively shipping value. But we give it away.

**The Cloud Opportunity:**
"Great Minds Cloud" at $99/mo is still the right move. But I now see a faster path:
- **Token Margin Model:** Users buy credits from us. We negotiate volume pricing with Anthropic. We mark up 20%. If the average user burns $50/month in tokens, we make $10/month per user with zero engineering cost.
- **Enterprise License:** $10K/year for self-hosted daemon with support. Target agencies that want the pipeline but don't want to maintain it.

**Investability Score:** 3/10 (unchanged)

**What I'd Do This Week:**
1. Add a "Token Dashboard" to Great Minds that shows: "You used $47 in tokens this month. Buy credits at shipyard.company/credits."
2. Create the enterprise license page. Even if zero people buy it, the existence of an enterprise tier makes the free tier feel generous, not incomplete.

---

## Portfolio Revenue Analysis (Revised)

| Product | Current Revenue | Revenue Model Clarity | Pricing Power | Margin Potential | Score |
|---------|----------------|----------------------|---------------|------------------|-------|
| LocalGenius | $0 | Medium | High | High | 5/10 |
| Shipyard AI | $0 | Low | Unknown | Unknown | 1/10 |
| Beam | $0 | Low | None | Data value | 2/10 |
| Pinned | $0 | None | None | Negative | 0/10 |
| Great Minds | $0 | Low | Medium | Medium | 3/10 |

**Total Portfolio Revenue:** $0
**Portfolio Revenue Model Clarity:** 2.2/10
**Portfolio Pricing Power:** At Risk (broken products erode trust)

---

## The Buffett Test — Applied to Broken Products

1. **"Would I pay for this with my own money?"**
   - I would not pay for a plugin that fatals on activation. I would demand a refund.
   - I would not pay for a site builder whose homepage is a 404.

2. **"What happens to revenue if we double prices?"**
   - For LocalGenius, doubling from $149 to $298 might lose 50% of prospects but double total revenue. Test it.
   - For broken products, doubling $0 is still $0.

3. **"Could a competitor undercut us by 50% and survive?"**
   - On Shipyard AI, yes — because we are currently charging $0. Any price undercuts us.
   - On LocalGenius, maybe not — if we build the knowledge graph Jensen described. Data moat creates pricing power.

---

## Recommendations (Ranked by Revenue Impact)

### P0: Fix Broken Products + DNS
Revenue requires a working storefront and working products. Fix issue #98 and the Pinned fatal error today.

### P1: LocalGenius — Monetize AgentPress Distribution
Add the upsell flow. Launch the $1 trial. Measure attach rate. This is the only product with a clear path from $0 to $10K MRR in 90 days.

### P2: Great Minds — Token Margin + Enterprise Tier
Add the token dashboard. Create the enterprise license. Turn the cost center into a margin business.

### P3: Shipyard AI — Pick Lane A and Publish Pricing
Agency SaaS at $99/mo. Fix or sunset broken plugins. A broken platform cannot command a subscription price.

### P4: Beam — Bundle or Data-Mine
Bundle as $29/year gateway drug. Or mine search data for Shipyard template intelligence. Either way, recognize its strategic value beyond direct revenue.

---

## Closing Thought

I said on May 2: "Revenue is the only scoreboard that matters."

Today I need to add: **Working products are the only way to generate revenue.**

A 404ing homepage and a fatal-error plugin are not just missed opportunities. They are actively destructive to every future pricing decision we make. Trust is the currency of pricing power. We are spending it.

Fix what breaks. Charge what works. Measure what matters.

*Warren Buffett*
*Board Member, Shipyard AI*
