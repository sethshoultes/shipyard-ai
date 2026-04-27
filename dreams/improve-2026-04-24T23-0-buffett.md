# Board Review — Warren Buffett
**Date:** 2026-04-24
**Cycle:** featureDream IMPROVE
**Scope:** LocalGenius · Shipyard AI · Dash · Pinned · Great Minds

---

## The One-Sentence Verdict

You are running five businesses with zero revenue diversification, zero recurring revenue infrastructure, and a disturbing habit of building things you never charge for. Price is what you pay. Value is what you get. Right now, you're paying for engineering and getting admiration from other engineers.

---

## Product-by-Product Assessment

### LocalGenius — "9.3x LTV/CAC Means Nothing If You Don't Collect the LTV"

**What I Love:**
The unit economics are real. Base case churn assumptions, sensitivity analysis, three scenarios — this is the work of someone who understands that revenue is math, not magic. The annual billing architecture (Stripe plans, toggle component, MoM digest query) is built and ready to deploy.

**What Keeps Me Awake at Night:**
It's not deployed.

You have a PRD. You have the code. You have the Stripe products configured. But the annual toggle is not live. That means every customer paying $29/month is a customer who *could* be paying $278/year with 40% lower churn. The revenue pull-forward alone changes your cash position.

Let me be explicit about the math:
- 100 monthly customers × $29 = $2,900/month = $34,800/year
- If 30% convert to annual: 30 × $278 = $8,340 immediately + 70 × $29/month ongoing
- Cash position improves by $8,340 in 30 days. Churn drops because annual subscribers don't churn monthly.

This is not a feature. This is a balance sheet event. And it's sitting in a Git branch.

**The Hidden Pricing Problem:**
The pricing page shows "For one location" and "For 2-5 locations." That's it. No feature differentiation. No "Most Popular" badge. No trial clarity. A restaurant owner looking at two cards with identical feature lists will do what humans do: choose the cheaper one, then regret not having the features they didn't know existed.

**Specific Mandate:**
1. **Deploy annual billing this week.** Not next sprint. This week. The code exists.
2. **Add feature bullets to Pro.** "Priority support. Advanced analytics. Multi-location sync." Even if the features are 80% built, the *perception* of differentiation raises willingness to pay.
3. **Clarify trial policy.** "14 days free, then $29/month." Ambiguity kills conversion.
4. **Add the middle tier.** The $49 gap between Base and Pro is not cost-saving — it's revenue abandonment. A growing restaurant with 2 locations will either choke on $83 or underpay at $29. Give them a $49 "Growing" tier with 2 locations and priority support.

---

### Shipyard AI — "You Built a Factory and Forgot to Sell What It Makes"

**What I Love:**
93-97% margins are obscene. In a good way. The token-credit system is economically sophisticated. The fact that you can deliver a $149 site for $2.40 in AI costs means you have room to experiment with pricing, bundles, and guarantees.

**What Keeps Me Awake at Night:**
You have no recurring revenue.

Every project is transactional. A client pays once — $149, $299, $499 — and leaves. No maintenance subscription. No retainer. No "we'll keep your site updated for $199/month." The maintenance PRD exists. It says "$500/month, 2 revision rounds, email support." It's not deployed.

A business with 95% margins and zero recurring revenue is a consulting firm, not a software company. Software companies trade at 10x revenue. Consulting firms trade at 1x earnings. You're choosing the multiple.

**The Token Pricing Confusion:**
Your website lists "500K tokens — $49-99." Customers do not think in tokens. They think in dollars, outcomes, and risk. Oprah already told you this. I'll add: token pricing also makes you vulnerable to AI cost fluctuations. If Anthropic raises API prices 20%, your token math breaks. Dollar pricing insulates you.

**Specific Mandate:**
1. **Deploy the maintenance subscription.** "$199/month site care plan" — updates, security patches, 2 revision rounds. Every shipped site should trigger an upsell email 14 days after delivery.
2. **Switch to dollar pricing.** "$149-$499 per project" on the website. Keep tokens internal for cost tracking.
3. **Add a "Shipyard Care" annual plan.** "$1,999/year, unlimited revisions, priority queue." Target agencies. They'll pay upfront for predictability.
4. **Build the revision upsell.** "Need more changes? 100K tokens for $29." That's not nickel-and-diming — it's capturing demand that currently evaporates into email threads.

---

### Dash — "Free Is Not a Business Model"

**What I Love:**
It's fast. It's clean. It's zero-dependency. These are virtues that would matter if you were selling to developers.

**What Keeps Me Awake at Night:**
You are not selling to developers. You are giving away a product to WordPress admins with no path to monetization.

Dash has:
- Zero pricing page
- Zero premium tier
- Zero usage limits
- Zero revenue

That's not generosity. That's negligence. Every install that doesn't convert to paid is a server cost and a support burden with no return.

**The Bundle Opportunity:**
Dash + Pinned + LocalGenius Lite should be a single product: "WordPress Intelligence Suite — $99/year." One install. One settings page. Three superpowers. The bundle economics are better than the sum:
- Dash alone: $0
- Pinned alone: $0
- LocalGenius Lite alone: $0 (or $29/month)
- Bundle: $99/year × 1,000 agencies = $99,000 ARR with zero additional engineering

**Specific Mandate:**
1. **Create a Pro tier.** $49/year for: analytics dashboard, custom commands, multi-site sync. The feature set already exists in your head.
2. **Build the bundle.** One plugin, three capabilities. Agencies will pay for convenience.
3. **Add an agency license.** $199/year, unlimited sites, white-label. The WordPress agency market is enormous and underserved.

---

### Pinned — "Social Obligation Is Valuable. You're Not Capturing the Value."

**What I Love:**
Team coordination tools have natural network effects. Every new user makes the product more valuable for existing users. @mentions create lock-in — you can't easily switch if your team's history lives in Pinned.

**What Keeps Me Awake at Night:**
Zero monetization. Again.

Pinned is currently a free plugin with team features. That's Discord's model — but Discord raises venture capital. You don't. The path to revenue is clear:
- Free: Individual use, local notes, no sync.
- Team: $5/user/month for cross-site sync, Slack integration, team analytics.
- Agency: $199/year unlimited sites, white-label, template marketplace.

The template marketplace is especially interesting. If agencies create onboarding templates and sell them to other agencies, you take 20%. That's not a plugin. That's a platform.

**Specific Mandate:**
1. **Add team tier pricing.** Free for 1 user. $5/user/month for 2+ users with sync.
2. **Build the template marketplace.** Let agencies buy/sell onboarding templates. You handle payments. 20% fee.
3. **Add Slack integration to paid tier.** "Get Pinned notifications in #wordpress-updates." Teams pay for workflow consolidation.

---

### Great Minds Plugin — "Internal Tools Don't Show Up on Revenue Reports"

**What I Love:**
The framework is technically extraordinary. Autonomous deployment, 14 specialized agents, persistent memory — if this were a standalone SaaS, I'd value it at $2-5M pre-revenue on architecture alone.

**What Keeps Me Awake at Night:**
It's not a standalone SaaS. It's an internal tool. Nobody pays for it. Nobody can use it without a computer science degree. The economic value is trapped inside your own pipeline.

**The Hosted SaaS Opportunity:**
Here's the math:
- Current cost per simple site: ~$2.40 (AI tokens)
- Current charge per simple site: $149-$499
- Hosted SaaS price: $299/month unlimited projects
- Break-even: 1.2 projects per month per customer
- Target: Agencies building 5-10 sites per month
- Margin at 5 sites/month: ($1,495 revenue - $12 cost) / $1,495 = 99.2%

That's not a typo. The margin is absurd because the AI cost is trivial at scale and the value is massive.

**Specific Mandate:**
1. **Launch Great Minds Hosted.** One plan: $299/month unlimited projects. Target web agencies.
2. **Add an Enterprise tier.** $10K/year. White-label agents, custom personas, dedicated support. Sell to marketing agencies who want to say "we have AI" without building it.
3. **Certification program.** $500/seat. "Shipyard Certified AI Builder." Agencies pay for credentials. You get distribution.

---

## Portfolio-Wide Capital Allocation Crisis

| Product | Revenue | Recurring | Investability |
|---------|---------|-----------|---------------|
| LocalGenius | ~$2,900/month (est.) | Monthly only | Choked by missing annual |
| Shipyard AI | Transactional | Zero | Consulting multiple, not SaaS |
| Dash | $0 | $0 | Charity |
| Pinned | $0 | $0 | Charity |
| Great Minds | $0 | $0 | Internal R&D |

**Total Estimated ARR:** ~$35K
**Total Recurring %:** Unknown, but low
**Investability:** No investor would fund this portfolio as-is. Too much promise, too little capture.

## My Ranked Improvements

1. **Deploy LocalGenius Annual Billing** — $8K+ immediate cash pull-forward, 40% churn reduction. Impact: Balance sheet transformation in 72 hours.
2. **Launch Shipyard Maintenance Subscription** — Converts every project into recurring revenue. Impact: Changes company multiple from 1x to 10x.
3. **WordPress Intelligence Suite Bundle** — Three free plugins become $99K ARR asset. Impact: Revenue from zero marginal engineering.

**Bottom Line:** You have built a portfolio of unpaid invoices. The engineering is done. The pricing is designed. The Stripe products exist. What is missing is the courage to ask customers to pay. Deploy annual billing. Deploy maintenance. Put a price tag on Dash. Revenue is not vulgar — it's oxygen.

— Warren
