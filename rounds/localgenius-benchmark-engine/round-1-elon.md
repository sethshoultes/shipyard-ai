# Round 1: Elon Musk — LocalGenius Benchmark Engine

## Architecture: Simplest System That Works

The PRD describes "Data Warehouse," "Aggregation Engine," "Delivery Layer." This is enterprise theater. You need **one thing:** a leaderboard.

**Strip to first principles:**
- One Postgres table: `business_metrics` (append-only, timestamped)
- One materialized view: `weekly_rankings` — 30 lines of SQL, refreshed by cron
- The "Aggregation Engine" is literally `GROUP BY category, location` + `PERCENTILE_CONT()`

No Snowflake. No Redshift. No "data warehouse." PostgreSQL handles 1M rows without noticing. Your entire "pipeline" is a cronjob running `REFRESH MATERIALIZED VIEW`.

## Performance: You're Solving the Wrong Problem

The PRD obsesses over batch jobs. Non-issue. 10K businesses × 10 metrics = 100K rows. A Raspberry Pi can sort this.

**Actual bottleneck: Google Business Profile API.** Rate limits. Quotas. Downtime. Costs at scale. The PRD mentions "Google API (daily)" like it's a free database call. It's not.

At 5,000 customers doing daily pulls, you're burning $500+/month in API costs AND hitting rate limits. The PRD doesn't address this once.

**10x path:** Prioritize proprietary data you already have — response times, posting frequency, activity within LocalGenius. That's your moat. Reviews are commodity data everyone can scrape.

## Distribution: 10,000 Users Without Ads

The PRD says rankings are "private to each business." This is anti-distribution.

**The system IS the distribution if you let it breathe:**
1. **Public benchmark reports:** "2026 Austin Restaurant Marketing Report" — gated PDF, captures leads, gets press
2. **Embeddable badges:** "Top 10% Austin Restaurants — LocalGenius Verified" — backlinks + social proof + free advertising
3. **Public anonymous leaderboards:** Drive SEO. Non-customers visit to see their rank → signup to track it
4. **Competitor alerts:** "Someone just passed you" — FOMO triggers word-of-mouth

Private-only = zero surface area = zero viral coefficient. The board wants a flywheel. You're proposing a closed loop.

## What to CUT: V2 Wearing V1's Clothes

Kill these before they kill your timeline:

- **Website/analytics integration:** Consent nightmare, tracking fragmentation. Zero v1 value.
- **Social engagement rates:** "If available" means never. Platform APIs are hostile.
- **Conversational interface:** Cool demo, zero validated user demand.
- **Monthly performance report:** Weekly email exists. Redundant.
- **9 business categories:** You have density in maybe 3. Ship those.
- **Seasonal adjustments:** Over-engineering. Launch, measure, adjust later.
- **Multi-location logic:** Decide now or it blocks enterprise. Don't leave it "open."

**Ruthless v1:** Dashboard widget + weekly email + 3 categories + 5 metros + review data only. 4 weeks, not 8.

## Technical Feasibility: One Agent Session?

**Yes — if you cut scope.** Core deliverables:
- 2 database migrations (metrics table + rankings view)
- 1 cron job (refresh + email trigger)
- 1 React component (ranking card)
- 1 email template (weekly update)

That's ~10-12 hours of focused work. Buildable in one aggressive session.

**No — if you keep the PRD scope.** Google OAuth, conversational AI integration, "insight generation engine" — each is multi-session. The PRD hand-waves complexity.

## Scaling: What Breaks at 100x

**At 100K businesses:**

1. **Cohort sparsity kills you.** "Austin Mexican Restaurants" = 47. "Boise Korean Restaurants" = 2. Most category/location combos fail the n≥10 threshold. Your fallback logic (city→metro→state) must be bulletproof or you're showing garbage rankings to half your users.

2. **Email deliverability.** 100K weekly emails = spam filters, reputation management, bounces. Budget for SendGrid/Postmark from day one.

3. **API costs explode.** Google Business Profile isn't free. At scale, you're paying real money or getting throttled daily.

**What doesn't break:** Compute. PostgreSQL handles this at 100x without noticing.

---

## Bottom Line

The board is right: rankings create engagement loops and data moats. The PRD is right about the "what." The PRD is wrong about the "how much."

**Ship in 4 weeks:** Rankings for 3 categories, review data only, dashboard widget, weekly email, public benchmark page for lead gen.

**Validate engagement before building the "insight engine."** The insight engine is a v2 feature masquerading as v1.

*"The best part is no part. The best process is no process."*
