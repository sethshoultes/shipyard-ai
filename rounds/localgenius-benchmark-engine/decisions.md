# PULSE — Build Decisions

> Consolidated from Rounds 1-2 debate between Steve Jobs (Design/Brand) and Elon Musk (Architecture/Distribution)
>
> *"The strength of the team is each individual member. The strength of each member is the team."* — Phil Jackson

---

## Locked Decisions

### 1. Product Name: **PULSE**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon conceded Round 2: "The name 'PULSE' is better. Ship it under that name. Cost: zero. Impact: real." |
| **Rationale** | One word. Captures the heartbeat of business, the rhythm of competition, vital signs. "Check your PULSE" becomes natural language. "Your PULSE is strong this week" creates emotional resonance. Best products become verbs. |
| **Build Implication** | All UI, emails, and copy use "PULSE" as product name. No "LocalGenius Benchmark Engine" anywhere user-facing. |

---

### 2. UI Philosophy: **Scoreboard, Not Spreadsheet**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs (with implementation compromise) |
| **Resolution** | Elon challenged ("you designed a poster, I need a product") but agreed the rank is the core value. Steve accepted widget-first delivery over full-screen experience. |
| **Rationale** | First-second emotional clarity. One giant number. Rank. Direction. That's it. Analytics dashboards: 12% weekly return rate. Scoreboards: 47%. The #8 of 47 IS the product. Users don't want data — they want *clarity*. |
| **Build Implication** | `RankWidget.tsx` shows: rank number (prominent), cohort size, direction arrow, one actionable insight. No charts, no tables, no metrics lists on first view. Swipe/click for details. |

---

### 3. Architecture: **PostgreSQL + Materialized View**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded Round 2: "I don't care how it's built. I care what it feels like." |
| **Rationale** | 10K businesses x 10 metrics = 100K rows. The PRD's "Data Warehouse" + "Aggregation Engine" + "Delivery Layer" is enterprise theater. The entire "pipeline" is a cronjob running `REFRESH MATERIALIZED VIEW`. A Raspberry Pi can sort this. |
| **Build Implication** | Single `business_metrics` table (append-only, timestamped), one `weekly_rankings` materialized view (~30 lines SQL), one ranking function (~50 lines). No Snowflake, no Redshift, no separate data warehouse, no aggregation microservice. |

---

### 4. V1 Category Scope: **Three Categories Only**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded Round 2: "Focus on 3 categories, not 9. Ship where we have density. Expand later." |
| **Rationale** | Rankings require cohort density. 9 categories at launch = scope creep disguised as ambition. "You have density in maybe 3. Ship those." — Elon |
| **Build Implication** | `categories.ts` contains exactly: `restaurants`, `home_services`, `retail`. No config for additional categories. Expansion is V2. |

---

### 5. V1 Data Scope: **Reviews Only (No Social/Website)**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve explicitly agreed Round 2: "Only show what we can measure with confidence." and "If we can't get solid engagement data, don't show it. Showing 'Unknown' destroys trust." |
| **Rationale** | Social metrics and website tracking are "if available" scope creep — platform APIs are hostile. Cut entirely. Review data is reliable and available via GBP API. |
| **Build Implication** | GBP sync pulls: review count, average rating, response time. No Facebook/Instagram integrations. No website analytics. No "if available" conditionals anywhere in the codebase. |

---

### 6. V1 Feature Scope: **Rank Widget + Weekly Email Only**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded timeline Round 2: "4 weeks is possible — if we cut honestly. I was protecting scope." |
| **Rationale** | Ship in 4 weeks. Validate that rankings drive engagement before building "insight engine." Conversational interface is "nice demo, zero validated user demand." Monthly reports are redundant when weekly email exists. |
| **Build Implication** | Two delivery mechanisms only: dashboard widget (real-time), weekly email (digest). No chatbot. No monthly reports. No in-app notifications beyond widget. |

---

### 7. Communication Tone: **Coach, Not Consultant**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon agreed Round 2: "The emotional hook is real. 'You're not alone in the dark anymore' is the right positioning." |
| **Rationale** | Every insight must suggest specific behavior. Short sentences. Direct. Slightly urgent. Never apologetic. The voice sounds like a trusted friend who owns a successful business — someone who tells you the truth because they believe in you. |
| **Build Implication** | Copy pattern: "Respond faster. Top performers: 2 hours. You: 8." NOT "Your response rate is below the benchmark average of 62% for your category cohort." All UI strings, emails, and notifications follow this voice. |

---

### 8. Dynamic Cohort Sizing: **Hierarchical Geography Expansion**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Steve validated Round 2: "Cohort sparsity will kill us." Both agreed fallback logic must be bulletproof. |
| **Rationale** | "Austin Mexican Restaurants" = 47 businesses. "Boise Korean Restaurants" = 2. Fixed category/city combos fail at power-law distribution. Most category/location combos fail the n>=10 threshold. |
| **Build Implication** | `cohorts.ts` implements hierarchy: city -> metro -> state. `rank_businesses.sql` expands geography until N>=10. If state-level < 10, show "Insufficient data" instead of rank — never show garbage rankings. |

---

### 9. Data Strategy: **Lead with Proprietary Signals**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Steve explicitly agreed Round 2: "He's right. Response times and posting frequency are data competitors can't get. Reviews are commodity data everyone can scrape." |
| **Rationale** | Reviews are commodity data anyone can scrape. Response times and posting frequency from LocalGenius platform are the real moat. Google API rate limits are the real bottleneck, not compute. At 5,000 customers doing daily pulls, you're burning $500+/month in API costs AND hitting rate limits. |
| **Build Implication** | Ranking algorithm weights proprietary signals (response time, posting frequency from LocalGenius platform) higher than commodity signals (review count, rating). Document weights explicitly in `rank_businesses.sql`. |

---

### 10. No Seasonal Adjustments in V1

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Elon agreed Round 1: "Over-engineering. Launch, measure, adjust later." Steve stated: "Perfect is the enemy of shipped." |
| **Rationale** | Premature optimization. Launch with simple rankings. Add sophistication after 6 months of data collected. |
| **Build Implication** | No seasonal weighting logic. No holiday adjustments. Simple rolling averages only. |

---

### 11. Monetization Model: **Action, Not Information Hoarding**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon agreed Round 2: "Free tier gatekeeping is wrong. Steve's right — don't hide information." |
| **Rationale** | "Free users see rank. Pro users see details" is too cute. Everyone sees the full picture. Pro users get AI-generated game plans to climb. Free users see where they stand. |
| **Build Implication** | No information paywall on rankings. All users see full rank, cohort size, direction, and basic insights. Premium features (when built) focus on actionable recommendations, not data access. |

---

## DEADLOCKED: Public vs. Private Rankings

| Aspect | Steve Jobs | Elon Musk |
|---|---|---|
| **Position** | Private only. No public leaderboards. No embeddable badges. **Non-negotiable.** | Public opt-in badges ("Top 10% — PULSE Verified"), public benchmark reports, embeddable badges with backlinks. |
| **Core Argument** | Public comparison creates shame, not motivation. Only winners share. #34 of 47 feels exposed -> churn. "Embeddable badges reward winners, punish everyone else. Only the top 10% display them. The other 90% feel like losers." We exist to make everyone compete against *yesterday's version of themselves*. | Private rankings = zero viral coefficient. Zero backlinks. Zero press hooks. "You can have the most beautiful dashboard on Earth — if nobody sees it, it doesn't matter." The board wants a flywheel. Private-only is a hamster wheel. |
| **Supporting Evidence** | "Competitor alerts at 11pm aren't engagement — they're anxiety. 'Someone just passed you' triggers panic, not motivation." Panic-driven opens != genuine retention. | Public reports ("2026 Austin Restaurant Marketing Report") ship week 5 as growth engine. Winners *want* to brag. Let them. Free distribution. Instagram didn't grow by keeping photos private. |
| **Proposed Compromise** | None offered — called it "the ethical core of the product" | Rankings stay private. Achievement badges are opt-in public. "Shame avoided, growth unlocked." |

### Phil Jackson's Ruling

This is the strategic fork. Steve optimizes for LTV via retention (coach relationship, compete with yourself). Elon optimizes for CAC via viral distribution (external surface area, network effects).

Both are right within their frame. Steve is protecting the soul of the product. Elon is protecting its survival.

**Recommendation to Founder:** Accept Elon's compromise with Steve's guardrails:

1. **Rankings:** Private by default, always. No public leaderboard exposing individual businesses.
2. **Badges:** Opt-in only for businesses above a threshold (Top 20%, not Top 10%). No forced exposure.
3. **Reports:** Aggregated category benchmarks only ("Austin Restaurants: Median review response time is 4.2 hours"). No individual business names without explicit consent.

This preserves Steve's ethical core (no shame, no forced exposure) while enabling Elon's distribution surface area (proud businesses opt in, backlinks flow, press hooks exist).

**Build Implication (if approved):**
- Add `badge_opt_in` boolean to user settings (default: false)
- Add `/embed/badge.svg` endpoint for website embed
- Public reports show category averages, not individual rankings

**STATUS: BLOCKING — Requires founder decision before build phase begins.**

---

## MVP Feature Set (V1 Scope)

### Ships in V1

| Feature | Description | Build Artifact |
|---|---|---|
| **Rank Widget** | Single number (#X of Y), direction arrow, one actionable insight | `ui/components/RankWidget.tsx` |
| **Weekly Email** | Rank update, movement direction, one action item, coach voice | `email/templates/weekly-pulse.html`, `jobs/weekly-email.ts` |
| **GBP Integration** | OAuth flow, daily data pull (reviews, ratings, response times) | `api/auth/google-oauth.ts`, `api/data/gbp-sync.ts`, `jobs/daily-sync.ts` |
| **Dynamic Cohort Algorithm** | Category + location with auto geography expansion when N<10 | `config/cohorts.ts`, `db/functions/rank_businesses.sql` |
| **Ranking Calculation** | PostgreSQL materialized view using review count, rating, response time, proprietary signals | `db/functions/rank_businesses.sql`, `db/migrations/002_weekly_rankings.sql` |
| **Basic Dashboard** | Rank display, trend line (last 4 weeks), category/location context | `ui/pages/dashboard.tsx`, `ui/components/TrendLine.tsx` |

### Cut from V1 (Explicitly Deferred)

| Feature | Reason | Revisit Trigger |
|---|---|---|
| Conversational interface / chatbot | "Nice demo, zero validated user demand" — Elon | Post-PMF validation |
| Monthly performance reports | Don't build two email systems | Weekly engagement > 40% open rate |
| Seasonal adjustments | Premature optimization | 6 months of data collected |
| Multi-location business handling | Edge case complexity | >50 customer requests |
| Website analytics integration | "Consent nightmare, zero v1 value" — Steve | Reliable data source identified |
| Social metrics (Facebook/Instagram) | "Platform APIs are hostile" — Elon | API stability confirmed |
| Complex weighting explanations | Users don't need algorithm details | User research shows distrust |
| 6 additional categories | Density insufficient | 500+ businesses per category |
| Public badges/embeds | **DEADLOCKED** — pending founder decision | Founder tiebreak |
| Competitor alerts ("someone passed you") | "Anxiety, not value" — Steve | Post-launch user feedback |
| Full-screen mobile experience | "Widget ships, full-screen is V2" — Elon | Engagement validated |

---

## File Structure (What Gets Built)

```
pulse/
├── api/
│   ├── auth/
│   │   └── google-oauth.ts          # OAuth flow for GBP connection
│   ├── data/
│   │   └── gbp-sync.ts              # Daily Google Business Profile pull
│   └── rank/
│       └── calculate.ts             # Core ranking algorithm wrapper
├── db/
│   ├── migrations/
│   │   ├── 001_business_metrics.sql # Append-only metrics table with timestamps
│   │   └── 002_weekly_rankings.sql  # Materialized view definition
│   └── functions/
│       └── rank_businesses.sql      # ~50 line ranking function with documented weights
├── jobs/
│   ├── daily-sync.ts                # Cron: GBP data pull (24hr cache, exponential backoff)
│   └── weekly-email.ts              # Cron: weekly rank digest (Mondays 8am local)
├── ui/
│   ├── components/
│   │   ├── RankWidget.tsx           # The "punch" — #8 of 47, arrow, insight
│   │   └── TrendLine.tsx            # Simple rank-over-time (4 weeks)
│   └── pages/
│       └── dashboard.tsx            # Single-page rank display
├── email/
│   └── templates/
│       └── weekly-pulse.html        # Coach-voice email template
└── config/
    ├── cohorts.ts                   # Dynamic cohort sizing (city -> metro -> state)
    └── categories.ts                # 3 categories: restaurants, home_services, retail
```

**Total artifact count:** 14 files
- 2 database migrations
- 1 SQL function
- 5 API/job files
- 3 React components
- 1 email template
- 2 config files

---

## Open Questions (Require Resolution Before Build)

| # | Question | Owner | Impact | Default if Unresolved |
|---|---|---|---|---|
| 1 | **Public vs. Private Rankings** | Founder | Determines distribution strategy, database privacy model, sharing UI | **BLOCKING** — no default, requires decision |
| 2 | **GBP API rate limit strategy** | Engineering | At 1K customers x daily pulls = quota walls. PRD doesn't address this. | 24hr cache minimum, exponential backoff, staggered sync times across 6-hour window |
| 3 | **Category taxonomy rules** | Product | Taco truck = restaurant? food truck? catering? | Trust Google's primary category. No override in V1. |
| 4 | **Minimum cohort threshold** | Product | State-level yields <10? | Show "Insufficient data for ranking" — no fake ranks |
| 5 | **OAuth failure UX** | Design | What does Maria see if Google connection breaks mid-sync? | Clear error message, "Reconnect" button, preserve last-known rank with timestamp |
| 6 | **Rank calculation frequency** | Engineering | Daily dashboard vs. weekly email — sync mismatch? | Daily recalc for dashboard, weekly email sends Monday 8am with fresh calc |
| 7 | **Algorithm weight transparency** | Product | Show "why" for rank position? | Basic explanation ("Your response time ranks #3 in cohort"). Iterate based on feedback. |
| 8 | **What if #47 of 47?** | Design | Elon's challenge: "Your emotional fuel becomes emotional damage" | Never show "You're last." Show "Room to climb. Here's your next move." Focus on progress, not position. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| **Google API changes/deprecation** | Medium | Critical | Abstract GBP behind interface. Monitor deprecation announcements. Don't over-couple to specific endpoints. Have fallback messaging if sync fails. | Engineering |
| **Cohort sparsity (N<10 everywhere)** | High | High | Dynamic sizing implemented (locked). Monitor % of users in sparse cohorts post-launch. "Insufficient data" fallback ready. Expand categories when density allows. | Product |
| **Rankings feel arbitrary/rigged** | Medium | High | Show "why" briefly. "You're #8 because response time is 3x slower than leaders." Action-oriented insights explain movement. | Design/Product |
| **OAuth drop-off during onboarding** | High | Medium | Clear value prop BEFORE permission request ("See how you rank against 47 competitors"). Single-step flow. Progress indicator. | Design |
| **Low-ranked businesses churn** | Medium | High | Coach voice, not shame voice. Focus on progress ("up 3 spots this week"). Never expose "You're last." Celebrate improvement over position. | Design/Copy |
| **Email deliverability at scale** | Medium | Medium | Use SendGrid/Postmark from day 1. Warm up domain pre-launch. Monitor spam rates weekly. Implement one-click unsubscribe. Budget for this at 100K users. | Engineering |
| **Category misclassification** | High | Medium | V1: trust Google's primary category. V1.1: allow user override with approval queue. | Product |
| **Competitive response (Yelp/Google native)** | Low | Critical | Speed to market = 4 weeks. Moat is proprietary signals (response times, posting frequency) that platforms don't expose to users. | Strategy |
| **"Competitor passed you" alerts backfire** | Medium | Medium | **Do NOT ship** in V1 per Steve's argument. Revisit post-launch with user research. | Product |
| **Public badges create two-class system** | Medium | High | If badges ship: threshold at Top 20% (not Top 10%), opt-in only, focus on improvement badges ("Most Improved") not just absolute rank. | Product/Design |
| **GBP API costs explode at scale** | High | Medium | At 5K customers = $500+/month. Lead with proprietary signals (locked). Reduce API call frequency for inactive businesses. | Engineering |

---

## Decision Attribution Summary

| Decision | Proposed By | Won By | Method |
|---|---|---|---|
| Product Name: PULSE | Steve Jobs | Steve Jobs | Elon conceded |
| Scoreboard UI Philosophy | Steve Jobs | Steve Jobs | Elon agreed with implementation caveats |
| PostgreSQL Architecture | Elon Musk | Elon Musk | Steve conceded |
| 3 Categories Only | Elon Musk | Elon Musk | Steve conceded |
| Reviews Only Data | Elon Musk | Elon Musk | Steve agreed |
| Widget + Email Only | Elon Musk | Elon Musk | Steve conceded timeline |
| Coach Voice Tone | Steve Jobs | Steve Jobs | Elon agreed |
| Dynamic Cohort Sizing | Elon Musk | Consensus | Steve validated |
| Proprietary Signals as Moat | Elon Musk | Consensus | Steve explicitly agreed |
| No Seasonal Adjustments | Steve Jobs | Consensus | Elon agreed |
| Action-Based Monetization | Steve Jobs | Steve Jobs | Elon agreed |
| Public vs. Private Rankings | **DEADLOCKED** | — | Requires founder |

**Final Score:** Steve 4, Elon 5, Consensus 3, Deadlocked 1

---

## Build Phase Authorization

| Metric | Status |
|---|---|
| **Locked decisions** | 11 of 12 major items resolved |
| **Blocking issue** | Public vs. Private rankings — requires founder tiebreak |
| **Estimated V1 timeline** | 4 weeks (adjusted for API integration risk) |
| **Minimum shippable** | Rank widget + weekly email + GBP integration for 3 categories |
| **Build readiness** | **READY** — pending Question #1 resolution |

---

## Builder Checklist

### Build This:
- [ ] PostgreSQL materialized view ranking by review count, rating, response time, proprietary signals
- [ ] Dashboard widget: #X of Y, direction arrow, one action item (coach voice)
- [ ] Weekly email: same content, coach voice, SendGrid delivery, Mondays 8am
- [ ] GBP OAuth + daily sync with 24hr caching + exponential backoff
- [ ] Dynamic cohort sizing: city -> metro -> state until N>=10
- [ ] Three categories only: restaurants, home_services, retail
- [ ] "Insufficient data" state for sparse cohorts
- [ ] Trend line showing last 4 weeks of rank movement

### Don't Build (Yet):
- [ ] Public leaderboards, badges, or embeds (pending founder decision)
- [ ] Chatbot / conversational interface
- [ ] Multiple email cadences (monthly reports)
- [ ] Seasonal adjustments
- [ ] Multi-location handling
- [ ] Social/website integrations
- [ ] More than 3 categories
- [ ] "Competitor passed you" alerts
- [ ] Full-screen mobile PULSE experience

---

## The Essence

> **What is this product REALLY about?**
> One number that tells her if she's winning.

> **What's the feeling it should evoke?**
> The gut-punch of truth. Then fire.

> **What's the one thing that must be perfect?**
> The first glance. Before she thinks, she knows.

> **Creative direction:**
> Scoreboard. Not spreadsheet.

---

## Ship Test

> Does Maria open PULSE and instantly know her number, her direction, and her next action?
>
> If yes, ship it.

---

*Consolidated by Phil Jackson — The Zen Master*

*"Wisdom is always an overmatch for strength."*
