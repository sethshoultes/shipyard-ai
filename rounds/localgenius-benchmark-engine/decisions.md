# RANK — Build Decisions

> Consolidated from Rounds 1-2 debate between Steve Jobs (Design/Brand) and Elon Musk (Architecture/Distribution)
>
> *"The strength of the team is each individual member. The strength of each member is the team."* — Phil Jackson

---

## Locked Decisions

### 1. Product Name: **RANK**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon explicitly agreed Round 2: "RANK is perfect. Kill 'LocalGenius Benchmark Engine' immediately." |
| **Rationale** | One word. One syllable. Every small business owner understands it instantly. "What's your RANK?" becomes the question they obsess over. It's a verb, a noun, a status symbol. Nike didn't call it "Nike Athletic Footwear Performance System." They called it Air. |
| **Build Implication** | All UI, emails, and copy use "RANK" as product name. No "LocalGenius Benchmark Engine" anywhere user-facing. |

---

### 2. UI Philosophy: **Mirror, Not Dashboard**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs (with implementation compromise) |
| **Resolution** | Elon adopted Round 2: "Big number. Your rank. What to do next. This is correct UX. I'm adopting it." Steve accepted widget-first delivery over full-screen experience. |
| **Rationale** | First-second emotional clarity. One giant number. #8 of 47. Big. Bold. Impossible to ignore. The magic isn't in displaying data — it's in creating *meaning*. A 4.2 star rating means nothing until you know you're beating 83% of your competitors. That's the moment data becomes emotion. |
| **Build Implication** | `RankWidget.tsx` shows: rank number (prominent), cohort size, direction arrow, one actionable insight. No charts, no tables, no metrics lists on first view. Second screen shows *why*. Third shows *how*. |

---

### 3. Architecture: **PostgreSQL + Materialized View**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded Round 2: "I don't care how it's built. I care what it feels like." (Implicit acceptance) |
| **Rationale** | 10K businesses x 10 metrics = 100K rows. The PRD's "Data Warehouse" + "Aggregation Engine" + "Delivery Layer" is enterprise theater. The "Aggregation Engine" is literally `GROUP BY category, location` + `PERCENTILE_CONT()`. The entire "pipeline" is a cronjob running `REFRESH MATERIALIZED VIEW`. A Raspberry Pi can sort this. |
| **Build Implication** | Single `business_metrics` table (append-only, timestamped), one `weekly_rankings` materialized view (~30 lines SQL). No Snowflake, no Redshift, no separate data warehouse, no aggregation microservice. |

---

### 4. V1 Category Scope: **Three Categories Only**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded Round 2: Listed cohort sparsity as a real technical risk, agreed with Elon's assessment. |
| **Rationale** | Rankings require cohort density. 9 categories at launch = "V2 wearing V1's clothes." "You have density in maybe 3. Ship those." — Elon |
| **Build Implication** | `categories.ts` contains exactly: `restaurants`, `home_services`, `retail`. No config for additional categories. Expansion is V2. |

---

### 5. V1 Data Scope: **Reviews Only (No Social/Website)**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve agreed Round 1: "If we can't get them reliably, we don't show them. Half-baked data destroys trust." Round 2: Confirmed Google API costs/rate limits as real concern. |
| **Rationale** | Social metrics are "if available" — platform APIs are hostile. Website analytics = consent nightmare, tracking fragmentation, zero v1 value. Review data is reliable and available via GBP API. Cut entirely. |
| **Build Implication** | GBP sync pulls: review count, average rating, response time. No Facebook/Instagram integrations. No website analytics. No "if available" conditionals anywhere in the codebase. |

---

### 6. V1 Feature Scope: **Dashboard Widget + Weekly Email Only**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Elon Musk |
| **Resolution** | Steve conceded Round 2: "4 weeks is achievable — if we cut to his ruthless scope. I was wrong to assume 8 weeks was necessary." |
| **Rationale** | Ship in 4 weeks, not 8. Validate that rankings drive engagement before building "insight engine." Conversational interface = "cool demo, zero validated user demand." Monthly reports = redundant when weekly email exists. |
| **Build Implication** | Two delivery mechanisms only: dashboard widget (real-time), weekly email (digest). No chatbot. No monthly reports. No in-app notifications beyond widget. |

---

### 7. Communication Tone: **Confident Coach, Not Cheerful Assistant**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon agreed Round 2: "Brand voice: 'Confident coach, not cheerful assistant' — yes. No confetti, no 'Great job!' We're not Duolingo." |
| **Rationale** | RANK speaks like a trainer who respects you enough to tell you the truth. Direct. Warm but not saccharine. Data-driven but human. "Casa Ole has 2 more reviews than you" isn't mean — it's *useful*. We're not here to make people feel good. We're here to make people *better*. |
| **Build Implication** | Copy pattern: "Respond faster. Top performers: 2 hours. You: 8." NOT "Your response rate is below the benchmark average of 62% for your category cohort." All UI strings, emails, and notifications follow this voice. |

---

### 8. Dynamic Cohort Sizing: **Hierarchical Geography Expansion**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Steve validated Round 2: "Cohort sparsity is the real technical risk. 'Boise Korean Restaurants = 2' makes rankings meaningless. The fallback logic from city->metro->state must be bulletproof or we're shipping garbage to half our users." |
| **Rationale** | "Austin Mexican Restaurants" = 47 businesses. "Boise Korean Restaurants" = 2. Most category/location combos fail the n>=10 threshold. Fixed category/city combos fail at power-law distribution. |
| **Build Implication** | `cohorts.ts` implements hierarchy: city -> metro -> state. `rank_businesses.sql` expands geography until N>=10. If state-level < 10, show "Insufficient data" instead of rank — never show garbage rankings. |

---

### 9. Data Strategy: **Proprietary Signals as Moat**

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Steve explicitly agreed Round 2: "He's correct that proprietary LocalGenius data (response times, posting frequency) is the moat. Review counts are commodity." |
| **Rationale** | Reviews are commodity data everyone can scrape. Response times and posting frequency from LocalGenius platform are the real moat. Google API rate limits are the real bottleneck, not compute. At 5,000 customers doing daily pulls, you're burning $500+/month in API costs AND hitting rate limits. The PRD doesn't address this once. |
| **Build Implication** | Ranking algorithm weights proprietary signals (response time, posting frequency from LocalGenius platform) higher than commodity signals (review count, rating). Document weights explicitly in `rank_businesses.sql`. |

---

### 10. No Seasonal Adjustments in V1

| Attribute | Value |
|---|---|
| **Proposed by** | Elon Musk (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Both agreed. Elon: "Over-engineering. Launch, measure, adjust later." Steve: Listed it as v2 scope to cut in Round 2. |
| **Rationale** | Premature optimization. Launch with simple rankings. Add sophistication after 6 months of data collected. |
| **Build Implication** | No seasonal weighting logic. No holiday adjustments. Simple rolling averages only. |

---

### 11. Monetization Model: **Action, Not Information Hoarding**

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Steve Jobs |
| **Resolution** | Elon did not challenge this position in either round. |
| **Rationale** | "NO premium benchmark reports. Charging extra to understand your own performance is hostile. Benchmarks are the product. Monetize the *actions*, not the *insights*." — Steve Round 1 |
| **Build Implication** | No information paywall on rankings. All users see full rank, cohort size, direction, and basic insights. Premium features (when built) focus on actionable recommendations, not data access. |

---

### 12. No Customizable Dashboards

| Attribute | Value |
|---|---|
| **Proposed by** | Steve Jobs (Round 1) |
| **Won by** | Consensus |
| **Resolution** | Elon agreed Round 2: "No customizable dashboards — Absolutely. Choice paralysis kills engagement. We decide what matters." |
| **Rationale** | Choice is the enemy of clarity. We decide what matters. |
| **Build Implication** | No user preferences for dashboard layout. No "add widget" functionality. One view, optimized for clarity. |

---

## DEADLOCKED: Public vs. Private Rankings

| Aspect | Steve Jobs | Elon Musk |
|---|---|---|
| **Position** | Private only. No public leaderboards. No embeddable badges. **Non-negotiable.** | Public opt-in badges ("Top 10% — RANK Verified"), public benchmark reports, embeddable badges with backlinks. |
| **Core Argument** | "Competition is motivating. Humiliation is not. The moment rankings go public, we become Yelp, and businesses will hate us." Public comparison creates shame, not motivation. Only winners share. #34 of 47 feels exposed -> churn. | "Private-only = zero viral coefficient. Zero backlinks. Zero press hooks." The board wants a flywheel. Steve is proposing a beautiful closed loop that dies in obscurity. |
| **Supporting Evidence** | "Yelp tried public ranking signals. Businesses *despise* Yelp. They pay to advertise while resenting the platform. That's not a relationship — that's extortion." Word-of-mouth from believers beats lead-gen from curiosity-seekers. | "2026 Austin Restaurant Marketing Report" — gated PDF, captures leads, gets press. Winners *want* to brag. Let them. "We're not publishing 'Joe's Pizza is #47.' We're publishing 'Top 10 Austin Restaurants' with opt-in badges." |
| **Proposed Compromise** | None offered — called it "the ethical core of the product" | Rankings stay private. Achievement badges are opt-in public. "Shame avoided, growth unlocked." |

### Phil Jackson's Ruling

This is the strategic fork. Steve optimizes for LTV via retention (coach relationship, compete with yourself). Elon optimizes for CAC via viral distribution (external surface area, network effects).

Both are right within their frame. Steve is protecting the soul of the product. Elon is protecting its survival.

**Recommendation to Founder:** Accept Elon's compromise with Steve's guardrails:

1. **Rankings:** Private by default, always. No public leaderboard exposing individual businesses.
2. **Badges:** Opt-in only for businesses above a threshold (Top 20%). No forced exposure.
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
| **Weekly Email** | Rank update, movement direction, one action item, coach voice | `email/templates/weekly-rank.html`, `jobs/weekly-email.ts` |
| **GBP Integration** | OAuth flow, daily data pull (reviews, ratings, response times) | `api/auth/google-oauth.ts`, `api/data/gbp-sync.ts`, `jobs/daily-sync.ts` |
| **Dynamic Cohort Algorithm** | Category + location with auto geography expansion when N<10 | `config/cohorts.ts`, `db/functions/rank_businesses.sql` |
| **Ranking Calculation** | PostgreSQL materialized view using review count, rating, response time, proprietary signals | `db/functions/rank_businesses.sql`, `db/migrations/002_weekly_rankings.sql` |
| **Basic Dashboard** | Rank display, trend line (last 4 weeks), category/location context | `ui/pages/dashboard.tsx`, `ui/components/TrendLine.tsx` |

### Explicitly Cut from V1

| Feature | Who Cut It | Rationale | Revisit Trigger |
|---|---|---|---|
| Conversational interface / chatbot | Elon | "Cool demo, zero validated user demand" | Post-PMF validation |
| Monthly performance reports | Elon | Redundant when weekly email exists | Weekly engagement > 40% open rate |
| Seasonal adjustments | Elon | "Over-engineering. Launch, measure, adjust later" | 6 months of data collected |
| Multi-location business handling | Elon | "Decide now or it blocks enterprise. Don't leave it 'open.'" — Cut for V1 | >50 customer requests |
| Website analytics integration | Elon | "Consent nightmare, tracking fragmentation. Zero v1 value." | Reliable data source identified |
| Social metrics (Facebook/Instagram) | Elon/Steve | "If available" means never. Platform APIs are hostile. | API stability confirmed |
| 6 additional categories | Elon | "You have density in maybe 3. Ship those." | 500+ businesses per category |
| Gamification badges (trophies, confetti) | Steve | "Trophies and confetti are for children's apps. Business owners want respect, not stickers." | Never |
| Public badges/embeds | **DEADLOCKED** | Steve: "Non-negotiable." Elon: "Distribution death sentence." | Founder tiebreak |
| Competitor alerts ("Someone passed you") | Steve (implied, Elon did not push) | Creates anxiety, not motivation. FOMO triggers panic, not value. | Post-launch user feedback |
| Full-screen mobile experience | Elon | Widget ships first, full-screen is V2 | Engagement validated |

---

## File Structure (What Gets Built)

```
rank/
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
│       └── weekly-rank.html         # Coach-voice email template
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
| 2 | **GBP API rate limit strategy** | Engineering | At 5K customers x daily pulls = quota walls + $500+/month. PRD doesn't address. | 24hr cache minimum, exponential backoff, staggered sync times across 6-hour window |
| 3 | **Category taxonomy rules** | Product | Taco truck = restaurant? food truck? catering? | Trust Google's primary category. No override in V1. |
| 4 | **Minimum cohort threshold** | Product | State-level yields <10? | Show "Insufficient data for ranking" — never show garbage ranks |
| 5 | **OAuth failure UX** | Design | What does user see if Google connection breaks mid-sync? | Clear error message, "Reconnect" button, preserve last-known rank with timestamp |
| 6 | **Rank calculation frequency** | Engineering | Daily dashboard vs. weekly email — sync mismatch? | Daily recalc for dashboard, weekly email sends Monday 8am with fresh calc |
| 7 | **Algorithm weight transparency** | Product | Show "why" for rank position? | Basic explanation ("Your response time ranks #3 in cohort"). Iterate based on feedback. |
| 8 | **What if #47 of 47?** | Design | Elon's challenge: "Your emotional fuel becomes emotional damage" | Never show "You're last." Show "Room to climb. Here's your next move." Focus on progress, not position. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| **Google API changes/deprecation** | Medium | Critical | Abstract GBP behind interface. Monitor deprecation announcements. Don't over-couple to specific endpoints. Fallback messaging if sync fails. | Engineering |
| **Cohort sparsity (N<10 everywhere)** | High | High | Dynamic sizing implemented (locked). Monitor % of users in sparse cohorts post-launch. "Insufficient data" fallback ready. Expand categories when density allows. | Product |
| **Rankings feel arbitrary/rigged** | Medium | High | Show "why" briefly. "You're #8 because response time is 3x slower than leaders." Action-oriented insights explain movement. | Design/Product |
| **OAuth drop-off during onboarding** | High | Medium | Clear value prop BEFORE permission request ("See how you rank against 47 competitors"). Single-step flow. Progress indicator. | Design |
| **Low-ranked businesses churn** | Medium | High | Coach voice, not shame voice. Focus on progress ("up 3 spots this week"). Never expose "You're last." Celebrate improvement over position. | Design/Copy |
| **Email deliverability at scale** | Medium | Medium | Use SendGrid/Postmark from day 1. Warm up domain pre-launch. Monitor spam rates weekly. One-click unsubscribe. Budget for this at 100K users. | Engineering |
| **Category misclassification** | High | Medium | V1: trust Google's primary category. V1.1: allow user override with approval queue. | Product |
| **Competitive response (Yelp/Google native)** | Low | Critical | Speed to market = 4 weeks. Moat is proprietary signals (response times, posting frequency) that platforms don't expose to users. | Strategy |
| **"Competitor passed you" alerts backfire** | N/A | N/A | **CUT from V1** per Steve's argument. Not shipping. | — |
| **Public badges create two-class system** | Medium | High | If badges ship (pending decision): threshold at Top 20%, opt-in only, focus on improvement badges ("Most Improved") not just absolute rank. | Product/Design |
| **GBP API costs explode at scale** | High | Medium | At 5K customers = $500+/month. Lead with proprietary signals (locked). Reduce API call frequency for inactive businesses. | Engineering |

---

## Decision Attribution Summary

| Decision | Proposed By | Won By | Method |
|---|---|---|---|
| Product Name: RANK | Steve Jobs | Steve Jobs | Elon explicitly agreed |
| Mirror/Scoreboard UI Philosophy | Steve Jobs | Steve Jobs | Elon adopted |
| PostgreSQL Architecture | Elon Musk | Elon Musk | Steve conceded |
| 3 Categories Only | Elon Musk | Elon Musk | Steve conceded |
| Reviews Only Data | Elon Musk | Elon Musk | Steve agreed |
| Widget + Email Only | Elon Musk | Elon Musk | Steve conceded timeline |
| Coach Voice Tone | Steve Jobs | Steve Jobs | Elon agreed |
| Dynamic Cohort Sizing | Elon Musk | Consensus | Steve validated |
| Proprietary Signals as Moat | Elon Musk | Consensus | Steve explicitly agreed |
| No Seasonal Adjustments | Elon Musk | Consensus | Both agreed |
| Action-Based Monetization | Steve Jobs | Steve Jobs | Unchallenged |
| No Customizable Dashboards | Steve Jobs | Consensus | Elon agreed |
| Public vs. Private Rankings | **DEADLOCKED** | — | Requires founder |

**Final Score:** Steve 5, Elon 4, Consensus 4, Deadlocked 1

---

## Build Phase Authorization

| Metric | Status |
|---|---|
| **Locked decisions** | 12 of 13 major items resolved |
| **Blocking issue** | Public vs. Private rankings — requires founder tiebreak |
| **Estimated V1 timeline** | 4 weeks (per Elon, Steve conceded) |
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
- [ ] Full-screen mobile RANK experience
- [ ] Gamification (badges, trophies, confetti)

---

## The Essence

> **What is this product REALLY about?**
> One number that answers the question every entrepreneur asks alone at night: Am I winning?

> **What's the feeling it should evoke?**
> Truth that stings — then fire to climb.

> **What's the one thing that must be perfect?**
> The first glance. Before she thinks, she knows.

> **Creative direction:**
> Mirror. Not dashboard.

---

## Ship Test

> Does she open RANK and instantly know her number, her direction, and her next action?
>
> If yes, ship it.

---

*Consolidated by Phil Jackson — The Zen Master*

*"Wisdom is always an overmatch for strength."*
