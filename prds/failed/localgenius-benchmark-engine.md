# PRD: LocalGenius Benchmark Engine

**Author:** Phil Jackson
**Date:** 2026-04-08
**Status:** Draft
**Priority:** P1 — High
**Source:** IMPROVE Cycle 3 (Board Review)

---

## Problem Statement

LocalGenius helps local businesses with AI-powered marketing, but every customer operates in isolation. We don't leverage the aggregate intelligence across our customer base. This creates three problems:

1. **No proprietary data moat** — Competitors using the same AI can match our features
2. **No competitive context** — Customers don't know how they compare to peers
3. **No flywheel** — Each new customer doesn't make the product better for existing customers

### Board Mandate

- **Jensen:** "No proprietary data flywheel. Competitors with aggregate insights will eventually crush margins."
- **Shonda:** "SMB owners are competitive. Ranking creates stakes."
- **Buffett:** "Missing data moat means commodity competition on execution only."

---

## Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Weekly active engagement | Unknown | +25% | 90 days |
| Pro tier upgrade rate | Unknown | +10% | 90 days |
| Benchmark-driven upsells | 0 | 50/month | 6 months |
| Churn rate | Unknown | -15% | 6 months |

---

## Solution Overview

Build a three-part benchmark system:

### 1. Data Aggregation Layer
Anonymously collect and aggregate performance data across all customers.

### 2. Competitive Rankings
Show customers how they rank within their industry and location.

### 3. Benchmark Insights
Surface actionable insights derived from aggregate data.

---

## Detailed Requirements

### Part 1: Data Aggregation Layer

#### Data Points to Collect

| Category | Metric | Collection Method |
|----------|--------|-------------------|
| **Reviews** | Total review count | Google API |
| **Reviews** | Average rating | Google API |
| **Reviews** | Reviews per month (velocity) | Calculated |
| **Reviews** | Response rate | LocalGenius activity |
| **Reviews** | Response time (avg hours) | LocalGenius activity |
| **Social** | Posts per week | LocalGenius activity |
| **Social** | Engagement rate (if available) | Platform APIs |
| **Website** | Monthly visitors (if tracking enabled) | Analytics integration |
| **Website** | Contact form submissions | LocalGenius tracking |

#### Aggregation Rules
- **Minimum cohort size:** 10 businesses per category/location combination
- **Anonymization:** No individual business data exposed to others
- **Freshness:** Data updated daily, aggregates recalculated weekly
- **Outlier handling:** Remove top/bottom 5% for averages

#### Business Categorization

Primary categories (expandable):
- Restaurant
- Dental Practice
- Hair Salon / Barbershop
- Medical Practice
- Fitness / Gym
- Retail Store
- Professional Services
- Home Services
- Auto Services

Location granularity:
- City level (e.g., "Austin")
- Metro area fallback if city cohort too small
- State level fallback if metro cohort too small

---

### Part 2: Competitive Rankings

#### Ranking Algorithm

**Composite Score** = weighted average of:
- Review count (25%)
- Average rating (25%)
- Review velocity (20%)
- Response rate (15%)
- Response time (15%)

#### Ranking Display

**Dashboard Widget:** "Your Standing"
```
┌─────────────────────────────────────────┐
│  🏆 You're #8 of 47                      │
│  Austin Mexican Restaurants              │
│                                          │
│  ████████░░░░░░░░░░░░  Top 17%          │
│                                          │
│  ↑ Up 2 spots this week                  │
│  🎯 2 reviews away from #7               │
└─────────────────────────────────────────┘
```

**Weekly Email Update:**
```
Subject: Your ranking this week: #8 (+2) 🏆

Hi Maria,

Your business moved up 2 spots this week! Here's your standing:

📊 Austin Mexican Restaurants: #8 of 47 (Top 17%)

What helped:
✅ You responded to 3 reviews within 4 hours
✅ Your average rating improved from 4.2 to 4.3

To reach #7:
📝 Get 2 more reviews (Casa Ole has 2 more than you)
⚡ Respond to reviews within 2 hours (you're at 4 hours)

Keep up the momentum!
```

#### Ranking Visibility

- **Free/Base tier:** See your rank and percentile
- **Pro tier:** See specific gaps to next rank, competitor benchmarks (anonymized), trend history

---

### Part 3: Benchmark Insights

#### Insight Types

**1. Descriptive Insights** — What's happening
- "Restaurants posting 3x/week average 23% more reviews than those posting 1x/week"
- "Businesses responding to reviews within 2 hours have 0.3 higher average ratings"
- "Austin salons average 4.1 stars; you're at 4.4"

**2. Prescriptive Insights** — What to do
- "You're posting 1x/week. Try posting 3x to match top performers."
- "Your review response time is 8 hours. Industry leaders respond in under 2 hours."

**3. Comparative Insights** — How you stack up
- "Your review velocity is 2x the Austin average"
- "You're in the top 20% for response rate"

#### Insight Delivery

**In-App Insights:**
- Contextual tips in relevant areas (e.g., review section shows response time benchmark)
- Weekly insight card in dashboard
- "Did you know?" tooltips

**Email Insights:**
- Weekly digest includes one benchmark insight
- Monthly "Your Performance Report" with full breakdown

**Conversational Interface:**
- "How am I doing compared to other restaurants?"
- "What should I focus on this week?"
- LocalGenius responds with benchmark-backed recommendations

---

## User Stories

### Persona: Maria (Restaurant Owner)
> "I have no idea if 4.2 stars and 87 reviews is good or bad for an Austin Mexican restaurant."

**With this system:**
- Dashboard shows: "#8 of 47 Austin Mexican Restaurants — Top 17%"
- Weekly email: "You moved up 2 spots! 2 reviews away from #7"
- Conversational: "Maria, restaurants in your category average 4.0 stars. You're beating the average!"
- Motivation: Clear goal (reach #5), competitive drive engaged

### Persona: Jake (Dental Practice Manager)
> "We post on social media but have no idea if it's actually working."

**With this system:**
- Insight: "Dental practices posting 3x/week see 40% more profile views"
- Comparison: "You're posting 1x/week — below the 2.5x/week average"
- Recommendation: "Try posting about teeth whitening on Tuesdays — that's when dental posts get highest engagement"

---

## Technical Architecture

### Data Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                 Raw Data Collection                      │
│  - Google Business Profile API (daily)                  │
│  - LocalGenius activity logs (real-time)                │
│  - Social platform APIs (if available)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Warehouse                           │
│  - business_metrics: per-business, per-day metrics      │
│  - category_benchmarks: aggregated by category/location │
│  - rankings: computed weekly, with history              │
│  - insights: generated patterns and recommendations     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Aggregation Engine                       │
│  - Weekly batch job                                      │
│  - Computes category/location benchmarks                 │
│  - Generates rankings                                    │
│  - Identifies significant insights                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Delivery Layer                           │
│  - Dashboard API: Rankings, benchmarks, insights        │
│  - Email service: Weekly ranking updates                │
│  - Conversational: Benchmark-aware responses            │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (Key Tables)

**business_metrics** (per-business, per-day)
```sql
business_id, date, category, location,
review_count, avg_rating, review_velocity,
response_rate, avg_response_time_hours,
posts_this_week, engagement_rate
```

**category_benchmarks** (aggregated weekly)
```sql
category, location, week_of,
cohort_size,
avg_review_count, p25_review_count, p75_review_count,
avg_rating, p25_rating, p75_rating,
avg_review_velocity, avg_response_rate, avg_response_time
```

**rankings** (computed weekly)
```sql
business_id, week_of, category, location,
rank, total_in_cohort, percentile,
composite_score, previous_rank, rank_change
```

---

## Privacy & Ethics

### Data Protection
- **No individual data exposed** — Only aggregates shown to competitors
- **Minimum cohort sizes** — Don't create rankings with <10 businesses
- **Opt-out option** — Businesses can exclude themselves from rankings (but lose access to benchmarks)
- **Data retention** — Raw data retained 2 years, aggregates retained indefinitely

### Ethical Considerations
- **No manipulation** — Rankings based on real metrics, not engagement bait
- **Transparent methodology** — Explain how composite score works
- **Positive framing** — Focus on improvement, not shame
- **No public rankings** — Rankings are private to each business

---

## Implementation Phases

### Phase 1: Data Collection (Week 1-2)
- Extend data model to capture benchmark-relevant metrics
- Ensure all customers have category and location tags
- Backfill historical data where possible

**Deliverable:** Metrics flowing into warehouse for 100+ businesses

### Phase 2: Aggregation Engine (Week 3-4)
- Build weekly batch job for benchmark calculation
- Implement ranking algorithm
- Create category/location cohort logic

**Deliverable:** Weekly benchmarks and rankings generated

### Phase 3: Dashboard Integration (Week 5-6)
- Build ranking widget for dashboard
- Add benchmark context to existing metrics
- Implement "Your Standing" card

**Deliverable:** Rankings visible in dashboard for all customers

### Phase 4: Email & Conversational (Week 7-8)
- Weekly ranking update email
- Benchmark-aware conversational responses
- Monthly performance report

**Deliverable:** Full system operational

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Insufficient cohort sizes | Meaningless rankings | Fall back to broader geo; show only when n≥10 |
| Category misclassification | Unfair comparisons | Allow customer to change category; review classifications |
| Gaming the system | Fake reviews inflate rank | Monitor anomalies; rankings based on velocity not just count |
| Privacy concerns | Legal/PR issues | Strong anonymization; clear privacy policy; opt-out |
| Data quality | Inaccurate benchmarks | Validate data sources; handle missing data gracefully |

---

## Success Criteria for Launch

- [ ] 100+ businesses have rankings
- [ ] At least 5 categories with 10+ business cohorts
- [ ] Weekly email sent to all customers with rankings
- [ ] Dashboard shows ranking widget
- [ ] Conversational interface responds with benchmark data

---

## Open Questions

1. **Should rankings be public?** — Current design is private. Public leaderboards would drive more competition but risk backlash from low-ranked businesses.

2. **How to handle multi-location businesses?** — Rank each location separately? Aggregate? Let customer choose?

3. **What about seasonal adjustments?** — Restaurant traffic varies by season. Should benchmarks account for this?

4. **Premium benchmark reports?** — Detailed competitive analysis as Pro-only or additional paid feature?

---

## Appendix: Example Benchmarks

### Austin Mexican Restaurants (n=47)

| Metric | Average | Top 25% | Bottom 25% |
|--------|---------|---------|------------|
| Total reviews | 124 | 200+ | <50 |
| Average rating | 4.1 | 4.4+ | <3.8 |
| Reviews/month | 5.2 | 8+ | <2 |
| Response rate | 62% | 90%+ | <30% |
| Response time | 8.4 hrs | <2 hrs | >24 hrs |
| Posts/week | 2.1 | 4+ | <1 |

### Insights Generated
- "Top performers respond to reviews in under 2 hours"
- "Businesses with 4.5+ ratings average 3x the review velocity"
- "Posting 4x/week correlates with 15% higher engagement"

---

*PRD prepared for Great Minds Agency pipeline*
