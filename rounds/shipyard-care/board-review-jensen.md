# Board Review: Shipyard Care

**Reviewer:** Jensen Huang, CEO NVIDIA
**Date:** 2026-04-06
**Project:** Shipyard Care — Post-Launch Maintenance & Site Performance Story

---

## Executive Assessment

What I see here is **solid infrastructure for a services business, not a technology company**. You've built a Stripe integration. You've built uptime monitoring. You've built a health score algorithm. These are competent implementations. But let me be direct: **you're building a commodity maintenance business with AI branding**.

---

## What's the Moat? What Compounds Over Time?

**Current moat: Weak.**

The PRD mentions a "pattern library" as the hidden gem—aggregating performance data across sites to understand what works. This is the right instinct. But look at the deliverables:

```typescript
// health-score.ts
const WEIGHTS = {
  loadTime: 0.25,
  uptime: 0.35,
  lighthouse: 0.40,
};
```

These are **static weights**. Fixed constants. There's no learning. No adaptation. No accumulation of knowledge.

**What compounds:**
- Number of sites monitored → more data
- Historical performance baselines → industry benchmarks

**What doesn't compound (yet):**
- The algorithm itself doesn't improve
- No feedback loop from recommendations → outcomes
- No cross-site learning about what interventions work

**Verdict:** You've designed data collection infrastructure but haven't built the intelligence layer that makes the data valuable.

---

## Where's the AI Leverage? Are We Using AI Where It 10x's the Outcome?

**Brutal truth: There is no AI leverage in these deliverables.**

Let me show you what I mean:

| Component | What It Does | AI Leverage |
|-----------|-------------|-------------|
| `health-score.ts` | Weighted average of 3 metrics | **None** — any intern can do this |
| `pagespeed.ts` | Calls Google PageSpeed API | **None** — wrapper around external API |
| `uptime.ts` | Pings URLs, records response | **None** — commodity monitoring |
| `stripe.ts` | Payment processing | **None** — expected |
| Recommendation engine | **Not implemented** | N/A |

The PRD promises an "AI-powered recommendation engine." Where is it?

```typescript
// health-score.ts - recommendations
function generateRecommendations(loadTimeScore, uptimeScore, lighthouseScore) {
  if (loadTimeScore < 50) {
    recommendations.push('Critical: Page load time is very slow...');
  }
  // ... hardcoded if-statements
}
```

This isn't AI. This is a decision tree a junior developer wrote in an afternoon.

**Where AI should 10x the outcome:**
1. **Predictive anomaly detection** — "Your site will likely have issues next Tuesday based on traffic patterns"
2. **Causal recommendation engine** — Not "sites with testimonials convert better" but "YOUR site would convert X% better with testimonials given your specific traffic, industry, and current layout"
3. **Automated fix generation** — Don't just recommend; generate the code/content to implement the fix
4. **Natural language performance stories** — GPT-powered narratives that actually explain what happened and why, not template mail-merge

---

## What's the Unfair Advantage We're NOT Building?

This is what keeps me up at night about Shipyard Care:

### 1. The Shipyard Build Graph
You built these sites. You have the PRDs, the component structures, the CSS decisions. When a Shipyard site underperforms, you know **exactly** what components are on the page. You could correlate performance with specific build decisions at a level no third-party monitoring tool ever could.

**You're not using this.** You're treating Shipyard sites like external URLs to ping.

### 2. One-Click Fixes
You built the site. You can change the site. When you detect a performance issue, why is the recommendation "consider optimizing images"? You should offer a button: "Fix this now — we'll optimize your images and deploy in 3 minutes."

**The monitoring and the fixing should be the same system.** That's your unfair advantage. Use it.

### 3. Competitive Intelligence at Scale
You monitor potentially thousands of sites across industries. You could build the most comprehensive benchmark database in the web performance space. "Law firm websites load 23% slower than average. Here's what the top 10% do differently."

**Not implemented.**

### 4. AI-Generated Content That Converts
Your "Pro" tier includes "4 hours/month content updates." Why is this human time? You should be generating landing page variants, SEO content, A/B test hypotheses—all based on what you've learned works across your portfolio.

**Humans doing content updates is not a scalable moat.**

---

## What Would Make This a Platform, Not Just a Product?

Right now, Shipyard Care is a **maintenance retainer with dashboards**. To become a platform:

### Platform Characteristic 1: Third-Party Extensions
- Let agencies build custom monitoring rules
- Let developers contribute performance optimization recipes
- Plugin architecture for different CMS backends

### Platform Characteristic 2: Network Effects
- "Shipyard Intelligence Score" that improves as more sites join
- Anonymized performance benchmarks that become industry standard
- API access so others build on your performance data

### Platform Characteristic 3: Ecosystem Lock-in
- Performance optimizations that only work on Shipyard-built sites
- Custom infrastructure (CDN, edge functions) that integrates with the monitoring
- Build-time performance guarantees based on monitoring feedback

### Platform Characteristic 4: Developer-Facing Tools
- Performance SDK that sites can install
- Real User Monitoring (RUM) that feeds back to Shipyard
- CI/CD integration that blocks deploys if performance degrades

**Current state:** Isolated SaaS dashboards with no ecosystem play.

---

## Technical Implementation Review

**What's done well:**
- Proper Stripe webhook handling with idempotency
- Session-based auth with httpOnly cookies and token refresh
- Database schema with appropriate indexes for time-series queries
- Connection pooling configured correctly

**What concerns me:**
- In-memory cache for PageSpeed results won't survive process restarts
- No queue system for background monitoring jobs
- No rate limiting on external API calls
- Recommendation engine is hardcoded, not ML-based
- No infrastructure for A/B testing recommendations

---

## The NVIDIA Test

When I evaluate investments, I ask: **"Does this benefit from more compute?"**

Shipyard Care as built: No. More compute doesn't make your health score better. Doesn't make recommendations smarter. Doesn't improve the product.

Shipyard Care as it should be: Yes. Train recommendation models on cross-site data. Run inference on every metric collection. Generate AI content for each site. Continuously A/B test optimizations.

**You're building a spreadsheet when you should be building an intelligence engine.**

---

## Score: 5/10

**Justification:** Competent infrastructure foundation for a services business, but zero AI leverage and no compounding moat—this is a commodity maintenance product with subscription pricing, not a technology play that Warren would find investable at scale.

---

## Path to 8/10

1. **Implement actual ML** for the recommendation engine using cross-site performance data
2. **Build the Shipyard build graph integration** — connect monitoring to the original site architecture
3. **Add one-click automated fixes** — don't just monitor, actively improve
4. **Create platform APIs** for third-party integrations and ecosystem development
5. **Deploy AI content generation** for Pro/Enterprise tiers instead of human hours

The bones are here. The vision in the PRD is correct. But the implementation delivers maintenance-as-a-service, not intelligence-as-a-service.

Build the flywheel. Make the product smarter with every site. That's how you build something that compounds.

---

*"The more you sweat in training, the less you bleed in combat." — The same applies to data collection. Collect the right data now so your AI can fight for you later.*

— Jensen
