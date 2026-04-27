# Board Review — Warren Buffett
**Date:** 2026-04-26
**Cycle:** featureDream IMPROVE
**Focus:** Revenue opportunities, investability

---

## Executive Summary

I have looked at the numbers. We are running a charity with excellent engineering. The portfolio generates approximately $35K ARR with near-zero recurring revenue. We have built infrastructure for subscriptions, client portals, and maintenance contracts — and then left it in the garage.

**Verdict:** This is not an investable business. It is a collection of features looking for a business model. But the business model already exists; it just needs to be turned on.

---

## Product-by-Product Assessment

### 1. LocalGenius — UNIT ECONOMICS CLEAN, REVENUE ZERO

**The good:** Jensen's prior review established LTV/CAC of 9.3x at base case churn. That is a real number derived from real assumptions. The pricing tiers are rational:
- Free: 50 responses/month
- Base: $29/month ($278/year)
- Pro: $49/month ($478/year)

**The problem:** No one can buy because no one can use the product. The frontend doesn't exist.

**Buffett's analysis:**
- If we acquire 35 customers at $29/month, we hit $1,000 MRR in 90 days.
- At 9.3x LTV/CAC, we can afford to spend ~$90 to acquire a $29/month customer.
- Organic-only channels (the current plan) with 1 GTM person can realistically acquire 10-15 customers in 90 days, not 35.

**The gap:** The revenue model assumes a working product. The product assumes revenue will fund frontend completion. This is a circular reference.

**Buffett's directive:** Ship the frontend in 14 days or cut the project. Do not spend another sprint on benchmark schema or engagement system specs. The only metric that matters is: can a restaurant owner install, configure, and pay within 5 minutes? Until yes, this is R&D, not revenue.

**Investability:** Currently 0/10. With working frontend + 10 paying customers: 3/10. With $1K MRR + churn data: 6/10.

---

### 2. Dash / Beam — DIVISION BY ZERO

**The situation:** No pricing. No monetization roadmap. No SaaS upsell. No data flywheel. The board previously called this "division by zero."

**Buffett's analysis:**
- A free WordPress.org plugin with no premium tier generates $0.
- A command palette is a feature, not a product. It should be bundled, not sold standalone.
- The engineering cost to build Beam was ~500 lines. The opportunity cost is the revenue-generating product we didn't build instead.

**Options:**
1. **Bundle into WP Intelligence Suite:** $99/year suite includes Beam + Pinned + LocalGenius Lite. This is the only viable path.
2. **Add AI premium tier:** Semantic search requires API keys = recurring SaaS cost to us = justification for subscription pricing.
3. **Archive:** Stop maintaining a product with no revenue model.

**Buffett's directive:** Do not ship Beam to WordPress.org as a standalone free plugin. Bundle it into the WP Intelligence Suite at $99/year, or add an AI layer with $9/month SaaS pricing. Free without a path to paid is not a strategy. It is a hobby.

---

### 3. Pinned — REVENUE DEFERRED TOO LONG

**The situation:** Pinned is production-ready. It has zero monetization. The readme says billing is "v2." Agency white-label is "v2+." Template marketplace is "v3."

**Buffett's analysis:**
- Pinned has the highest product-market fit signal: teams use it daily (dashboard widget = daily touchpoint).
- Daily touchpoint = highest willingness to pay.
- Deferred monetization to v2/v3 assumes we have unlimited runway. We do not.

**Revenue models available now:**
1. **Freemium:** Free for 3 active notes. Unlimited + @mentions + expiry = $9/month per site.
2. **Agency bundle:** $49/year for white-label + cross-site dashboard. We already deferred cross-site because it's "multi-tenant SaaS = separate product." That is over-thinking. It's just a view across tables.
3. **WP Intelligence Suite:** $99/year includes Pinned + Dash + Beam + LocalGenius Lite.

**Buffett's directive:** Add a simple upgrade gate before v1.1 ships. After 3 notes, show: "This note will be archived in 7 days. Upgrade to Pro for unlimited notes, @mentions, and expiry." The infrastructure for tier gating already exists in `wis-core`.

**Investability:** Currently 2/10 (proven usage, no revenue). With $9/month tier: 5/10. With suite bundle: 6/10.

---

### 4. Great Minds Plugin — DISTRIBUTION, NOT DIRECT REVENUE

**The situation:** The plugin is free and open-source. It drives pipeline usage but does not itself generate revenue.

**Buffett's analysis:**
- This is a loss leader for Shipyard AI services. That is a valid strategy if the conversion rate is tracked.
- No pricing page. No "Upgrade to Shipyard Cloud" CTA. No telemetry on how many plugin users convert to paid Shipyard builds.
- The DXT bundle could be sold for $49-99 as a desktop app for non-technical users. Currently free.

**Buffett's directive:**
1. Add a "Powered by Shipyard AI" footer in every generated project with a link to shipyard.company.
2. Add a `shipyard upgrade` command that migrates local builds to cloud deployment with pricing.
3. Consider a $99 DXT desktop license for agencies who want the plugin without Claude Code subscription.

**Investability:** Currently 1/10. With conversion tracking + DXT pricing: 4/10.

---

### 5. Shipyard AI — THE FACTORY HAS NO CUSTOMERS

**The situation:** We built a maintenance subscription ($199-500/month). We built a client portal. We built post-ship lifecycle emails. None are deployed.

**Buffett's analysis:**
- This is like building a restaurant, hiring a chef, buying ingredients, and then keeping the door locked.
- The marginal cost to deploy existing infrastructure is near-zero.
- The marginal revenue from deployment is potentially $2-5K MRR within 90 days (10-20 maintenance clients at $199-500).

**Revenue architecture already built:**
| Component | Status | Revenue Potential |
|-----------|--------|-------------------|
| Maintenance subscription | Built, not deployed | $199-500/month per client |
| Client portal | Built, not deployed | Retention + upsell enablement |
| Post-ship lifecycle emails | Built, not deployed | Reactivation + referrals |
| WP Intelligence Suite | Spec'd, not deployed | $99/year per site |

**Buffett's directive:** Deploy the maintenance subscription and client portal this week. Not next sprint. This week. The code exists. The only blocker is deployment discipline.

**Pricing validation:**
- $199/month = "we keep your site updated"
- $349/month = + performance monitoring
- $500/month = + monthly content edits + priority support

This is standard agency pricing. We undercut agencies by automating the work. The margin should be 80%+.

**Investability:** Currently 2/10. With maintenance deployed + $2K MRR: 5/10. With suite + plugins: 7/10.

---

## Portfolio Revenue Summary

| Product | Current MRR | Potential MRR (90 days) | Blocker |
|---------|-------------|------------------------|---------|
| LocalGenius | $0 | $300-500 | No frontend |
| Beam | $0 | $0 | No pricing |
| Pinned | $0 | $200-400 | No upgrade gate |
| Great Minds | $0 | $0 | No pricing |
| Shipyard (maintenance) | $0 | $2,000-5,000 | Not deployed |
| **TOTAL** | **$0** | **$2,500-5,900** | **Deployment** |

---

## Top Revenue-Ranked Improvements

| Rank | Improvement | Product | Revenue Impact |
|------|-------------|---------|----------------|
| 1 | Deploy maintenance subscription + client portal | Shipyard AI | $2-5K MRR immediate |
| 2 | Ship frontend + activate Stripe | LocalGenius | $300-500 MRR |
| 3 | Add upgrade gate (3-note limit) | Pinned | $200-400 MRR |
| 4 | Bundle Beam into suite or add AI tier | Beam | $100-200 MRR |
| 5 | Add DXT pricing + conversion CTAs | Great Minds | $100-200 MRR |

---

## Buffett's Closing Thought

> "You built a factory and forgot to sell what it makes. I don't invest in factories. I invest in earnings. You have $35K ARR and zero recurring revenue because you confuse building with business. The highest-return investment you can make right now is not a new feature. It is clicking 'deploy' on what you already built."
