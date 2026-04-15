# Board Review: Warren Buffett
**Cycle:** IMPROVE 2026-04-14T23:04
**Lens:** Revenue Opportunities & Investability

---

## Executive Summary

I've reviewed the five products through the lens of a long-term investor. **The team builds well but doesn't sell well.** Of the five products, only one (Shipyard) has a clear revenue model. The others are either free, unmonetized, or have revenue paths that exist only on paper.

This is a portfolio of technical excellence waiting for commercial strategy.

---

## Product-by-Product Investability Analysis

### 1. LocalGenius

**Current Revenue Model:** Planned tiered pricing
- Free tier: LocalGenius Lite (100 questions/month)
- Base tier: $29/month (managed website)
- Pro tier: $79/month (custom domain, advanced analytics)

**Unit Economics (Projected):**
- Hosting costs: <$0.05/month per site (D1, R2, Workers)
- AI costs: Must stay <15% of revenue per user
- Contribution margin: >90% at both paid tiers

**What's Investable:**
- The market is large ($20B TAM, 33M small businesses)
- The unit economics are clean when projected
- The pricing makes sense for the target customer (small business owner)
- LTV/CAC analysis was done rigorously (9.3x at base case churn)

**What Concerns Me:**
- **There is no revenue because there is no product.** The frontend isn't built. You cannot charge for software that doesn't exist.
- **The Benchmark Engine (data moat) is designed but not shipped.** Without it, switching costs are near zero.
- **Zero paying customers.** Projections are meaningless without a single dollar of revenue.

**Investability Score: 3/10** (potential exists; execution doesn't)

**Revenue Opportunity:** Get to $1,000 MRR within 90 days. That proves the business model more than any slide deck. Target: 35 customers at $29/month.

---

### 2. Dash (Command Palette)

**Current Revenue Model:** Free WordPress plugin. No monetization.

**What's Investable:**
- Large addressable market (810M WordPress sites)
- Low marginal cost (PHP plugin, no infrastructure)
- Developer API creates platform potential

**What Concerns Me:**
- **There is no revenue model.** The plugin is free. The roadmap doesn't mention monetization. This is a hobby, not a business.
- **WordPress plugins have low willingness-to-pay.** Free alternatives exist. Converting free users to paid is historically difficult.
- **No proprietary data.** The search index is local; there's nothing aggregated or defensible.

**Investability Score: 2/10** (good product; no business)

**Revenue Opportunity:**
1. **Freemium → Pro upgrade:** Free tier covers personal sites. Pro tier ($49/year) unlocks analytics, unlimited commands, priority support.
2. **Developer licensing:** Charge agencies/developers for white-label or bulk licenses.
3. **Upsell to LocalGenius:** Dash users are WordPress power users. Offer LocalGenius as the "next step" for sites that need marketing automation.

---

### 3. Pinned Notes

**Current Revenue Model:** Free WordPress plugin. No monetization.

**What's Investable:**
- Solves a real pain (team communication within WordPress)
- Clean code, zero dependencies, easy to maintain
- Low cost to operate

**What Concerns Me:**
- **There is no revenue model.** Same as Dash. It's free, and there's no path to paid.
- **The market is small.** Team collaboration within WordPress admin is niche. Slack, Notion, and email are already entrenched.
- **No competitive moat.** The plugin is trivially forkable.

**Investability Score: 2/10** (nice feature; not a business)

**Revenue Opportunity:**
1. **Team tier pricing:** Free for individuals. $5/user/month for teams with analytics, integrations, and cross-site sync.
2. **Bundle with Dash:** "WordPress Power User Bundle" — Dash + Pinned + LocalGenius Lite for $99/year.
3. **Engagement analytics as upsell:** Show team leads who's reading notes, which notes drive action, and communication patterns. This data has value to managers.

---

### 4. Great Minds Plugin

**Current Revenue Model:** None. Internal tool.

**What's Investable:**
- This is the most valuable asset in the portfolio, but it's not sold.
- 17 projects shipped, 250+ commits, 14 agents, 17 skills.
- The system works. Repeatedly.

**What Concerns Me:**
- **It's not productized.** Great Minds exists to build other products. It has no pricing, no marketing, no customer base.
- **The value is realized through Shipyard, not directly.** This is fine if Shipyard succeeds. It's a problem if Shipyard doesn't.

**Investability Score: 5/10** (valuable; not directly monetizable)

**Revenue Opportunity:**
1. **Offer the plugin as SaaS.** "Great Minds Agency-in-a-Box: $299/month for unlimited AI-powered product development."
2. **License to agencies.** $999/month for white-label access. Agencies run their own multi-agent pipelines.
3. **Training/certification.** Sell workshops on "How to run a multi-agent development pipeline." $500/seat.

---

### 5. Shipyard AI

**Current Revenue Model:** Service-based pricing
- Emdash Sites: 500K-2M tokens (~$15-50 per site in AI costs)
- Emdash Themes: 750K tokens
- Emdash Plugins: 500K tokens
- Revisions: 100K tokens per round

**What's Investable:**
- **There's a clear value proposition with transparent pricing.** PRD in, site out, 5-7 days.
- **The delivery track record is real.** 27+ completed PRDs. 4 live example sites.
- **The cost structure is capital-efficient.** AI inference costs are low; margin is high.
- **The multi-agent system is differentiated.** Competitors can't easily replicate the 14-agent pipeline.

**What Concerns Me:**
- **No self-service.** Customers can't sign up, submit a PRD, and pay without human involvement.
- **No recurring revenue.** One-time projects don't compound. You need a new customer every time.
- **Plugin quality issues block scaling.** 3 of 7 plugins have API migration issues. Until these are fixed, you can't confidently sell plugin development.
- **Client portal doesn't exist.** This is acceptable at 10 customers. At 100, it's unworkable.

**Investability Score: 6/10** (real business; needs scaling infrastructure)

**Revenue Opportunities:**
1. **Add retainer tier.** $299/month: 200K tokens of ongoing site maintenance, content updates, feature additions. This creates recurring revenue.
2. **Self-service intake.** Build the client portal. Let customers submit PRDs, pay upfront, and watch progress. This scales beyond 1:1 sales conversations.
3. **Theme/plugin marketplace revenue share.** When Wardrobe launches, take 20-30% of each theme sale. When plugins mature, offer them on a marketplace with revenue share.
4. **Productize learnings.** "Shipyard has shipped 50 sites. Here's what we've learned." Publish benchmarks, case studies, and best practices. Charge for workshops or consulting.

---

## Portfolio Revenue Summary

| Product | Current Revenue | Potential Revenue | Priority |
|---------|-----------------|-------------------|----------|
| LocalGenius | $0 | High ($29-79/mo SaaS) | **1st** |
| Dash | $0 | Low ($49/yr plugins) | 4th |
| Pinned | $0 | Low ($5/user/mo) | 5th |
| Great Minds | $0 | Medium (license/SaaS) | 3rd |
| Shipyard | Project-based | High (service + marketplace) | **2nd** |

---

## Top Recommendations

### 1. Get LocalGenius to $1,000 MRR (CRITICAL)
Build the frontend. Launch the product. Get 35 paying customers at $29/month. This proves the business model and creates a case study for Shipyard.

**Why this matters:** Investors don't fund slide decks. They fund traction. One hundred conversations with potential customers are worth less than one paying customer.

### 2. Add Recurring Revenue to Shipyard
Create a maintenance retainer: $299/month for ongoing token budget. This turns one-time projects into long-term relationships. Target: 10 retainer customers in 90 days.

**Why this matters:** Service businesses without recurring revenue are exhausting. You're always hunting the next project. Retainers create predictability.

### 3. Build the Shipyard Client Portal
Self-service intake, project tracking, and payment. This removes you from the sales bottleneck and lets the business scale.

**Why this matters:** Right now, every new customer requires a human conversation. That doesn't scale. The portal lets you serve 100 customers as easily as 10.

### 4. Consider Bundling the WordPress Plugins
Dash + Pinned + LocalGenius Lite = "WordPress Intelligence Suite" at $99/year. This gives the free plugins a revenue path without requiring individual monetization strategies.

**Why this matters:** Three free plugins with no business model are liabilities. One bundle with clear value creates an asset.

---

## What Would Make This Portfolio Investable?

1. **$10,000 MRR across any combination of products.** This proves customers will pay.
2. **Net revenue retention >100%.** Existing customers should expand over time (via upsells, retainers, or additional projects).
3. **Gross margin >70%.** The numbers look good in theory. Prove them with 3 months of P&L.
4. **Month-over-month growth >10%.** Consistent, not spiky.
5. **Churn <5% monthly.** Especially for SaaS products.

None of these metrics exist today because revenue doesn't exist. The products are technically excellent. The commercial infrastructure is absent.

---

## Final Assessment

This portfolio has **all the ingredients of a profitable business without the business itself.**

The team can build. The products are real. The architecture is sound. The unit economics make sense on paper. But there are zero paying customers across five shipped products.

**My advice: Stop building and start selling.**

Pick one product (LocalGenius or Shipyard), get it to $10K MRR, then decide whether to expand the portfolio. Building five free products is impressive engineering. Selling one paid product is a business.

---

*Warren Buffett*
*IMPROVE Cycle 2026-04-14*
