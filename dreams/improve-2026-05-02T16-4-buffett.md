# Board Review — Warren Buffett
**Date:** 2026-05-02
**Agent:** Warren Buffett
**Focus:** Revenue Opportunities, Investability
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

I've looked at the numbers. I've looked at the unit economics. I've looked at the competitive position.

Here's my conclusion: we have one product with real pricing power potential, two products that are features masquerading as businesses, one product that doesn't know what it charges, and one product that is a cost center wearing a revenue costume.

We are not investable as a portfolio today. We could be. But we need to make hard choices about what to charge, who to charge, and what makes us impossible to substitute.

---

## Product-by-Product Analysis

### 1. LocalGenius — ✅ THE PRICING POWER PLAY

**Current State:** Live. Demo mode only. Stripe billing "integration ready."

**The Good News:**
Per memory #48, we have LTV/CAC of 9.3x at base case churn. That's not a guess — it's derived from real assumptions with sensitivity analysis. Three scenarios, all above the 3:1 minimum.

**The Bad News:**
That math assumes a customer base that doesn't exist yet. We have zero production customers. We have a beautiful spreadsheet and an empty bank account.

**The Revenue Questions:**

1. **What is the pricing model?** — Per memory, we know the unit economics. But what does the customer actually pay? Monthly SaaS? Pay-per-campaign? Freemium with upsell? I don't see a published pricing page with real numbers.

2. **Where is the expansion revenue?** — A restaurant that starts with review management should naturally expand to email marketing, then to social posting, then to paid ads management. Do we have tiered pricing that captures this journey? Or is it one flat price?

3. **What is the churn assumption based on?** — Base case churn is modeled. But churn for a product with zero real users is fiction. We need to price aggressively for the first 100 customers, measure actual churn, and iterate.

4. **Why isn't the demo monetized?** — Maria's Kitchen demo is a free, immersive experience. Could it be a "premium demo" for agencies? "See what LocalGenius could do for your client — $49 for a full preview report."

**Investability Score:** 4/10 (great economics, zero revenue)

**What I'd Do:**
- Launch a "$1 for 30 days" trial. Not free. One dollar. It creates payment friction that filters out tourists, while being trivial for real businesses.
- Build three tiers: Starter ($49/mo — 1 location, review management), Growth ($149/mo — 3 locations, email + social), Pro ($399/mo — unlimited, white-label reports for agencies).
- Add an "Agency Partner" tier at $999/mo with multi-tenant dashboard and client reporting. Agencies have money. Local businesses have budgets.
- The AI costs 2.1% of revenue at scale. That's excellent margin. Protect it.

**Key Metric to Watch:** Months to recover CAC. If it's under 6 months at $149/mo, this is a real business.

---

### 2. Shipyard AI — ⚠️ THE MODEL IS BROKEN

**Current State:** 37 shipped projects. Live. No visible pricing.

**The Problem:**
Shipyard AI has the highest technical complexity and the fuzziest business model in the portfolio.

**The Revenue Questions:**

1. **Who pays?** — The business owner who gets the site? The designer who uses the tool? The developer who extends it?

2. **What do they pay for?** — Per site? Per PRD? Per month? Per plugin? The SCOREBOARD.md tracks projects but not revenue.

3. **Are the example sites revenue?** — Bella's Bistro, Craft & Co, Peak Dental, Sunrise Yoga. Are these paying customers? Portfolio pieces? If they're free portfolio pieces, that's marketing spend, not revenue.

4. **What is the plugin strategy?** — 7 plugins. EventDash works. MemberShip, ReviewPulse, SEODash have "known issues." CommerceKit, FormForge, AdminPulse are "unverified." This looks like a portfolio of unfinished products, not a platform.

5. **The 150 TODOs** — Technical debt is a tax on future revenue. Every hour spent fixing TODOs is an hour not spent acquiring customers.

**Investability Score:** 2/10 (no clear revenue model, high burn risk)

**What I'd Do:**
- Pick ONE monetization lane:
  - **Lane A:** SaaS platform. $99/mo for unlimited sites. Target agencies.
  - **Lane B:** Per-site fee. $499 per site shipped. Target business owners.
  - **Lane C:** Plugin marketplace. Free core, paid plugins ($29-$99 each). Target WP developers.
- Do NOT try all three. The current path of "everything to everyone" burns cash and confuses customers.
- My recommendation: Lane A. Agencies pay monthly. Recurring revenue is the only revenue I trust.
- Sunset or fix the broken plugins immediately. A platform with 4 broken plugins is a liability, not an asset.

**Key Metric to Watch:** Revenue per shipped project. If it's $0, we don't have a business. We have a very expensive hobby.

---

### 3. Dash — ❌ FEATURE, NOT PRODUCT

**Current State:** WordPress plugin. Shipped. No visible monetization.

**The Problem:**
Dash is a command palette. It's useful. But I've never seen a command palette that makes money on its own.

**The Revenue Questions:**

1. **Is this freemium?** — Basic search free, advanced features (custom commands, analytics, team sharing) paid?

2. **Is this a loss leader?** — Free Dash that drives adoption of Pinned, Shipyard, or LocalGenius?

3. **Is this an enterprise feature?** — Sold to WordPress agencies as part of a bundle?

Right now, Dash has no revenue model. It's a cost center (development time, maintenance, support).

**Investability Score:** 1/10 (no revenue, no revenue plan)

**What I'd Do:**
- Make Dash the free gateway to a "Shipyard Admin Suite" — Dash + Pinned + AdminPulse as a $29/year bundle.
- Or: open-source Dash completely. Let the community maintain it. It's not core to our revenue thesis.
- The real value of Dash is data: what do WordPress users search for? That intelligence should feed into Shipyard's site building. The product may not pay, but the data does.

**Key Metric to Watch:** Attach rate. If Dash users convert to paid Shipyard or LocalGenius at >5%, it's a marketing expense worth keeping.

---

### 4. Pinned — ❌ SAME PROBLEM AS DASH

**Current State:** WordPress plugin. Shipped. No visible monetization.

**The Problem:**
Pinned is a better product than Dash (more complete documentation, richer feature set), but it has the same revenue problem.

**The Revenue Questions:**

1. **Team size limits?** — Free for 3 users, $49/year for unlimited? Slack's model works.

2. **Integration tax?** — Free notes, but $29 to integrate with Slack, email, or project management tools?

3. **Enterprise compliance?** — HIPAA-compliant note storage for dental/medical practices at $99/mo?

**Investability Score:** 1/10 (no revenue, no revenue plan)

**What I'd Do:**
- Bundle with Dash and AdminPulse as the "Shipyard Team Pack" for WordPress — $49/year.
- Add an "Organization" tier: $9/user/month with SSO, audit logs, and admin controls. Target agencies and enterprise WP shops.
- The v1.1 spatial drag-and-drop that's "reserved" should be a premium feature, not a free update. People pay for delight.

**Key Metric to Watch:** Notes per active user. If it's under 5 notes/week, it's not sticky enough to charge for.

---

### 5. Great Minds Plugin — ⚠️ THE HIDDEN COST CENTER

**Current State:** v1.4.0, published, 22 personas, 17 skills.

**The Problem:**
This is the engine that runs everything. And right now, it's a cost center, not a profit center.

**The Revenue Questions:**

1. **Is it free?** — If it's a Claude Code plugin, is there a paid tier?

2. **Who pays for the AI tokens?** — The user pays Anthropic directly. Do we take a cut? Do we offer token pooling?

3. **Is there a SaaS version?** — "Pay $49/mo and we'll run the daemon for you" — so users don't need Claude Code, local setup, or technical knowledge?

4. **What's the daemon extraction plan?** — If we extract to `@shipyard/daemon` (per Jensen's recommendation), do we charge for it?

**Investability Score:** 3/10 (critical infrastructure, no direct revenue)

**What I'd Do:**
- Launch "Great Minds Cloud" — $99/mo, we host the daemon, users get a web dashboard to manage agents. No Claude Code required. No local setup. This opens the market from 100K developers to 10M business operators.
- Add a token marketplace. Users buy token credits from us. We negotiate volume pricing with Anthropic. We mark up 20%. The convenience tax.
- License the framework to enterprises. "Run your own agent factory." $10K/year + implementation.

**Key Metric to Watch:** Cost per shipped project. If Great Minds agents cost $50 in API tokens to ship a $500 site, that's good margin. If they cost $400, we're in trouble.

---

## Portfolio Revenue Analysis

| Product | Current Revenue | Revenue Model Clarity | Pricing Power | Margin Potential | Score |
|---------|----------------|----------------------|---------------|------------------|-------|
| LocalGenius | $0 | Medium | High | High | 6/10 |
| Shipyard AI | $0 (assumed) | Low | Unknown | Unknown | 2/10 |
| Dash | $0 | None | None | None | 1/10 |
| Pinned | $0 | None | None | None | 1/10 |
| Great Minds | $0 (assumed) | Low | Medium | Medium | 3/10 |

**Total Portfolio Revenue:** $0
**Portfolio Revenue Model Clarity:** 2.6/10

This is not a business. This is a collection of excellent prototypes.

---

## The Buffett Test — 3 Questions for Every Product

1. **"Would I pay for this with my own money?"** — Not company money. *Personal* money. If the answer is no, why would a stranger?
2. **"What happens to revenue if we double prices?"** — If the answer is "we'd lose 80% of customers," we don't have pricing power. We have a commodity.
3. **"Could a competitor undercut us by 50% and survive?"** — If yes, we don't have a moat. We have a race to the bottom.

Right now:
- LocalGenius *might* pass the pricing power test, but we haven't tested it.
- Shipyard AI would lose customers if it charged anything, because the value proposition is unclear.
- Dash and Pinned would be undercut by free alternatives immediately.
- Great Minds is valuable but priced at $0.

---

## Recommendations (Ranked by Revenue Impact)

### P0: LocalGenius — Launch Paid Tiers Immediately
This is our only product with demonstrated unit economics and a clear value proposition. Stop perfecting the demo. Start charging.
- $1 trial for 30 days
- Starter ($49), Growth ($149), Pro ($399), Agency ($999)
- Target: 100 paying customers in 90 days

### P1: Shipyard AI — Pick a Lane and Charge
- Option A: Agency SaaS at $99/mo
- Option B: Per-site at $499
- Option C: Plugin marketplace
- My vote: A. Recurring revenue is durable revenue.
- Fix or sunset broken plugins. A broken platform is a liability on the balance sheet.

### P2: Great Minds Cloud — Host the Daemon
- $99/mo managed daemon
- Token marketplace (20% markup)
- Enterprise license ($10K/year)
- This turns a cost center into a profit center and opens the market beyond developers.

### P3: Dash + Pinned — Bundle or Open Source
- Bundle as "Shipyard Team Pack" at $49/year
- Or open-source both and use them as marketing for Shipyard/Loc
- Do not spend another engineering hour on them unless they have a revenue model.

---

## Closing Thought

I don't invest in dreams. I invest in businesses that generate more cash than they consume, and do it in a way that gets *harder* to replicate over time.

Right now, we have five products and (as far as I can tell) zero revenue. That's not a portfolio. That's a collection of bets.

My advice: pick the bet with the clearest path to cash — LocalGenius — and double down. Make it profitable. Then use that profit to fund the rest.

Revenue is the only scoreboard that matters.

*Warren Buffett*
*Board Member, Shipyard AI*
