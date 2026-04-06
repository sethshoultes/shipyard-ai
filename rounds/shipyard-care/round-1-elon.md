# Round 1 Review: Elon Musk — Chief Product & Growth Officer

## Architecture: What's the simplest system that could work?

The PRD describes 5 dashboard pages, 3 tiers, 6+ integrations, and a recommendation engine. This is a **SaaS platform masquerading as a feature**.

Simplest v1: A cron job that runs Lighthouse, stores a number in Postgres, and emails a template once a month. Stripe checkout link. Done.

You don't need a dashboard for v1. You need proof of recurring revenue. A well-designed email that links to a static Lighthouse report URL is 90% of the value. Dashboards are expensive to build and nobody uses them. Build the dashboard when 50 customers complain they can't see their data.

**Recommendation:** Ship email + Stripe only. Dashboard is v2.

## Performance: Where are the bottlenecks?

The real bottleneck isn't technical—it's **data collection permissions**. You need Google Analytics access from every customer. That's OAuth flows, token refresh, scope creep, and support tickets. Most customers won't do it.

Second bottleneck: Lighthouse CI at scale. Running Lighthouse on 1,000 sites = ~100 hours of compute per month at 6 minutes/run. That's $500/month in cloud costs before you make a dime.

**10x path:** Use Pagespeed Insights API (free, Google-hosted) instead of self-hosted Lighthouse. Skip GA entirely—use server logs or Plausible snippet you control. Control your data supply chain.

## Distribution: How does this reach 10,000 users without paid ads?

The PRD has zero distribution strategy. "Existing customer outreach" isn't a strategy—it's an email blast.

Real distribution levers:
1. **Default-on:** Every new site ships with Care Basic trial. Opt-out, not opt-in. Conversion at checkout is 10x harder than preventing cancellation.
2. **The Report as Marketing:** Make Site Performance Story shareable. Add a "Share your site's performance" button. Customers flex. Their network sees Shipyard brand.
3. **Agency Arbitrage:** Agencies mark up your $99 to $299 and white-label. You get volume, they get margin. Build for resale from day 1.

Target: 10K users = 250 agencies with 40 clients each. Agencies are the cheat code.

## What to CUT

**Cut immediately (v2 or later):**
- Benchmark Comparison: Vanity feature. Nobody cares if they're "top 15%." They care if their site is fast.
- Recommendation Engine: Hand-wave. "AI-powered suggestions" means rule-based if-statements. Write 10 static recommendations and randomize. Ship that.
- Support Ticket System: Use email. Freshdesk exists. Don't build this.
- Performance Dashboard (all 5 pages): See above. Email link to Lighthouse report.
- Dark mode: Seriously?
- Quarterly strategy calls: Unscalable. Cut or automate with AI.
- Competitor monitoring: You don't have competitors' data. How does this work? Hand-waving.

**v1 is:** Stripe subscriptions + monthly email with Lighthouse score and uptime. That's it.

## Technical Feasibility: Can one agent session build this?

The PRD estimates 900K tokens for dashboard + email + integrations + billing + recommendation engine. This is wildly optimistic.

Stripe subscriptions alone with webhook handling, subscription state management, failed payment recovery = 150K tokens minimum.

The "5-page dashboard" estimate of 400K assumes no complexity. Auth, state management, real-time data, charts, mobile responsive = 800K minimum.

**Reality:** One session can build Stripe checkout + email template + one API integration. Everything else needs follow-up sessions.

**Recommendation:** Scope v1 to what one session can actually ship: landing page + Stripe checkout + cron email.

## Scaling: What breaks at 100x usage?

At 100 customers: Nothing breaks. You're fine.

At 10,000 customers:
- **Lighthouse runs:** 10K sites x 6 min = 1,000 hours/month. Need job queue, parallelization, caching.
- **Email delivery:** 10K emails/month is nothing. Sendgrid handles it.
- **Analytics API rate limits:** Google Analytics API has 50K requests/day limit. At 10K customers checking dashboards = rate limit city.
- **Support tickets:** 10K customers x 5% needing help = 500 tickets/month. You need a team.

**What actually breaks:** Your margins. $99/customer x 10K = $990K MRR. But 8 hours/month support for Enterprise tier x 100 Enterprise customers = 800 hours = 5 FTEs. Tier 3 is a trap.

## Final Verdict

This PRD wants to build Datadog for WordPress sites. That's a $10M project, not a feature.

Ship the email. Prove people pay. Build the dashboard when you have 100 paying customers screaming for it.

The "pattern library moat" is real but premature. You need sites generating data before you have patterns. Focus on customer acquisition, not data infrastructure.

**One question that matters:** What's the conversion rate from "completed Shipyard project" to "Care subscription" today? If you don't know, find out before building anything.
