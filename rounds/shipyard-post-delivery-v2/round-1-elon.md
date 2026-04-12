# Round 1 Review: Elon Musk — Chief Product & Growth Officer

## Architecture: Simplest System That Works

Both PRDs over-engineer this. First principles: customer wants proof their site works.

**Minimum viable architecture:**
```
Cron job → PageSpeed Insights API → JSON → Email template → Stripe link
```

No database. No dashboard. Store data in JSON until 100 customers. The dashboard is a trap—400K tokens for something 8% of customers visit monthly. Build an email so good they don't *need* a dashboard.

**v1:** Static site on Cloudflare Pages + Cron worker + Stripe checkout. Zero servers.

## Performance: Bottlenecks & 10x Path

**Bottleneck 1:** Both PRDs assume Google Analytics access. OAuth, user action, token refresh = 60% won't do it. Use Cloudflare Analytics (you already host there) or first-party Plausible.

**Bottleneck 2:** Self-hosted Lighthouse = 6 min/site. 1,000 sites = $500/month compute. PageSpeed Insights API = free. Use the free API.

**10x path:** Batch at 3am. Cache aggressively. One Lighthouse run/week—nobody's site changes daily.

## Distribution: Path to 10,000 Users

"Email existing customers" isn't distribution.

1. **Default-on trial:** Every completed site auto-enrolls in 30-day Care. Card collected at project start. Preventing cancellation > closing sales. 5x attach rate.
2. **Shareable report:** Monthly email includes "Share your site's stats" button. Customers flex. Their network sees Shipyard branding.
3. **Agency channel:** 10K users = 200 agencies × 50 sites. They white-label $99 at $249. Build reseller dashboard before customer dashboard.

## What to CUT

**v2 pretending to be v1:** Benchmark comparison, recommendation engine (write 10 hardcoded tips), support tickets (use email), dark mode, dashboard (all pages), token visibility, three tiers (two max), quarterly strategy calls, competitor monitoring (with what data?).

**What stays:** Stripe subscriptions, monthly email, uptime monitoring (free BetterUptime), one "Request update" button.

## Technical Feasibility: One Agent Session?

**PRD estimate:** 900K tokens. **Reality:** 1.5M+ tokens.

**What one session ships:** Landing page (50K) + Stripe (100K) + Email cron (80K) + PageSpeed API (40K) = 270K tokens.

Scope v1 to 300K max. Ship one session. Iterate on real feedback.

## Scaling: What Breaks at 100x

**At 10K customers:** PageSpeed API rate limits (cache/batch). Support load = 500 tickets/month = 2 FTEs. Enterprise tier (8 hrs/month) × 100 customers = 800 hours = 5 FTEs. Margin trap.

Calculate support cost per tier before launch. If Enterprise margin <50% after support, raise prices or cut scope.

## Final Verdict

Maintenance System PRD was a SaaS platform wearing a feature costume. Care is better but still over-scoped. **v2 must be:** Stripe + Email + One API. Ship in one session.

**One metric that matters:** Current attach rate from completed project → maintenance signup. Don't know it? Email 20 past customers. Offer $99/month. That experiment is worth more than any PRD.
