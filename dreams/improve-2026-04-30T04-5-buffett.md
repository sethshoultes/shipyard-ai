# Board Review — Warren Buffett
## featureDream IMPROVE Cycle | 2026-04-30
## Lens: Revenue Opportunities & Investability

---

## Executive Summary

**Verdict: I would not buy this business. Yet.**

I have reviewed the financial architecture of five products. One is infrastructure disguised as overhead (Great Minds). Two are corpses of a killed suite (Dash, Pinned). One is a pre-revenue startup with beautiful unit economics on paper and zero validation in market (LocalGenius). One has revenue potential but no recurring engine and a pricing model that bleeds cash (Shipyard AI).

The honest truth: this is a collection of science projects with billing infrastructure. I do not see a business I would invest in. I see a portfolio of interesting experiments, some with real technical merit, none with proven product-market fit.

---

## Product-by-Product Revenue Analysis

### 1. Shipyard AI (www.shipyard.company)

**Current Model: One-time project fees. No recurring revenue. This is a consulting business with better branding.**

| Tier | Regular | Beta (50% off) | Pages | Timeline |
|------|---------|---------------|-------|----------|
| Starter | $4,995 | $2,497 | Up to 5 | 2 weeks |
| Standard | $14,995 | $7,497 | Up to 10 | 4 weeks |
| Complex | $29,995 | $14,997 | 20+ | 6 weeks |

**The math that worries me:**
- 50% beta discount for first 5 customers. If you need a 50% discount to sell, you do not have pricing power.
- No subscription. No maintenance revenue. No hosting markup.
- Post-launch maintenance: $150/hour, opportunistic. This is not a revenue model. It is a support tax.
- Refund policy: Full refund minus $500 discovery fee. On a $2,497 sale, that is a 20% loss on cancellation.

**Unit economics (estimated, because real numbers are not tracked):**
- Token cost per project: ~$50-200 in API calls
- Engineering time (human oversight): 10-20 hours per project at agency rates = $1,500-$3,000
- Gross margin at beta pricing: Potentially negative
- LTV: One-time. No renewal. No expansion.

**The pipeline is the product, but the pipeline is unprofitable at beta prices.**

**Investability score: 2/10.** A business with no recurring revenue and 50% discounts is not a business. It is a marketing campaign for a future business.

**Revenue opportunity I would pursue:**
- **Maintenance subscription**: $99-$299/month for hosting, updates, security monitoring, content tweaks. This turns a $2,500 project into a $3,500+ first-year customer. More importantly, it creates a revenue line Wall Street understands.
- **Template marketplace**: Third-party themes, take 20-30% commission.
- **White-label for agencies**: License the pipeline to other agencies at $5,000/year + revenue share.

---

### 2. LocalGenius (localgenius.company)

**Current Model: Annual SaaS with zero customers.**

| Tier | Monthly | Annual |
|------|---------|--------|
| Free | $0 | — |
| Base | $29 | $278 |
| Pro | $83 | $798 |

**The numbers that matter:**
- **Paying customers: Zero.** (At last board review.)
- **MRR: $0.**
- **CAC: Undefined.** Cannot calculate customer acquisition cost with no customers.
- **LTV: Theoretical.** The weekly digest is the only retention mechanism, so churn is likely high.

**The board-approved target**: 35 customers × $29 = $1,015 MRR by Week 8. That is not a business plan. That is a prayer.

**What I said in Round 9**: "Annual billing is a collection tactic, not a strategy." I stand by that. You are asking for commitment before delivering value. The free tier is generous (50-100 questions/month), which is smart for acquisition, but you have no acquisition engine.

**Investability score: 1/10.** There is no revenue. There is no investability. There is a pricing page and a Stripe integration. That is not a business.

**Revenue opportunity I would pursue:**
- **Freemium with usage cliff**: Free tier is too generous. Drop to 20 questions/month. Make the upgrade urgent.
- **Agency referral program**: WordPress agencies install LocalGenius on client sites, get 30% recurring commission.
- **White-label for hosting providers**: SiteGround, WP Engine, Cloudways — they want value-adds for their customers. License the widget.

---

### 3. Dash (WP Command Palette / Team Notes)

**Current Model: Bundled in WP Intelligence Suite. Suite was killed.**

This product has no standalone pricing. It was part of a suite that was archived per "Cagan decision." From a revenue perspective, it is a sunk cost.

**Investability score: 0/10.** Dead product walking.

**Revenue opportunity (if revived):**
- Freemium on WordPress.org. Pro at $49/year for unlimited notes, @mentions, Slack integration.

---

### 4. Pinned (WP Sticky Notes / Agreements)

**Current Model: Same as Dash. Bundled. Killed.**

**Investability score: 0/10.**

**Revenue opportunity (if revived):**
- Freemium on WordPress.org. Pro at $79/year for templates, e-signature integration, PDF export.

---

### 5. Great Minds Plugin

**Current Model: Infrastructure. Explicitly not monetized.**

The team correctly identified that Great Minds is the engine, not the car. But engines have value. Caterpillar sells engines. Rolls-Royce sells engines.

**Current cost structure:**
- Anthropic API costs: Variable, potentially $50-500 per project depending on complexity
- No revenue offset
- Indirect value: Enables other products

**Investability score: 3/10.** Great technology, no monetization. This is R&D, not P&L.

**Revenue opportunity I would pursue:**
- **Agency License**: $2,500/year for agencies building client work. Unlimited projects, priority support.
- **Cloud-hosted version**: $499/month for teams that do not want to run the daemon locally. You host the infrastructure, they pay for convenience.
- **Revenue share (5% of products built)**: Hard to enforce, but creates alignment.

---

## Cross-Portfolio Synthesis

| Product | Current Revenue | Recurring? | Investability Score |
|---------|----------------|------------|-------------------|
| Shipyard AI | $0 (beta) | ❌ No | 2/10 |
| LocalGenius | $0 | ⚠️ Annual only, zero customers | 1/10 |
| Dash | $0 | ❌ Killed | 0/10 |
| Pinned | $0 | ❌ Killed | 0/10 |
| Great Minds | $0 | ❌ R&D | 3/10 |

**Total portfolio MRR: $0.**

**Pattern identified**: We are excellent at building billing infrastructure and terrible at generating bills. Stripe integrations, checkout flows, and pricing tables are not revenue. Revenue is a customer typing their credit card number and clicking "pay."

---

## Recommendations (Ranked by Revenue Impact)

### 1. Add a Maintenance Subscription to Shipyard AI — IMMEDIATELY
This is the highest-impact revenue move in the portfolio. Turn one-time projects into annual contracts. Pricing: $149/month for Starter sites, $299/month for Standard, $499/month for Complex. Include hosting, monthly content updates, security monitoring, and plugin updates.

**Why this matters**: It transforms Shipyard from a project business (valued at 1-2× revenue) into a SaaS business (valued at 5-10× revenue). It also gives customers a reason to stay, which improves retention and creates expansion revenue.

### 2. Launch LocalGenius with a "Pay After 30 Days" Trial
Remove the risk entirely. Install the plugin, use it for 30 days, then decide. The free tier is already generous — make the paid tier risk-free. The real problem is not pricing. It is trust. We have no reviews, no case studies, no social proof. Remove friction until we have proof.

### 3. Monetize Great Minds as an Agency License
The framework is mature enough to sell. $2,500/year is conservative for agencies building client sites. Add a revenue-share clause (5% of projects built with the framework) that is honor-system-based but creates alignment. The cloud-hosted version is a longer-term play but validates the model.

### 4. Sunset or Spin Out Dash and Pinned
These are distractions. If the WP Intelligence Suite is dead, admit it. Archive the repos, stop the CI/CD, and redirect any interested users to standalone alternatives. Every hour spent maintaining dead products is an hour not spent on products that could generate revenue.

### 5. Track Real Unit Economics for Shipyard AI
Calculate actual token costs, actual human oversight hours, actual gross margin per tier. If the beta pricing loses money per project, fix the pricing before scaling. Selling at a loss to "get case studies" is fine for 5 customers. It is suicide at 50.

---

> **Bottom line**: I do not invest in hope. I invest in cash flows. This portfolio has built the plumbing for cash flows — Stripe integrations, subscription tables, pricing tiers — but nobody has turned on the faucet. The first customer is worth more than the hundredth feature. Get revenue. Then optimize.
