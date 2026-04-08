# RANK — Build Decisions

> Consolidated from Rounds 1-2 debate between Steve Jobs (Design/Brand) and Elon Musk (Architecture/Distribution)

---

## Locked Decisions

### 1. Product Name: **RANK**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon conceded Round 2) |
| **Why** | One syllable. Verb and noun. Universal. "Let me check my rank" is natural language. "LocalGenius Benchmark Engine" is forgettable enterprise-speak. |

### 2. UI Philosophy: **One Number Dominates**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon agreed Round 2) |
| **Why** | Rank IS the product. No dashboard clutter with 12 metrics. The first thing Maria sees: **#8 of 47**. Scoreboard, not spreadsheet. |

### 3. Architecture: **PostgreSQL, No Data Warehouse**
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (Steve conceded Round 2) |
| **Why** | 10K businesses × 10 metrics × 365 days = 36.5M rows/year. That's small data. No "Data Warehouse" or "Aggregation Engine" theater. One Postgres function, ~50 lines. |

### 4. V1 Scope: **Rank Widget + Weekly Email Only**
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (Steve conceded on conversational interface) |
| **Why** | Ship in 3 weeks, not 8. Validate that rankings drive engagement before building "insight engine." Cut: conversational interface, monthly reports, seasonal adjustments, multi-location, website analytics integration. |

### 5. Communication Tone: **Action-Oriented Coach**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon agreed Round 2) |
| **Why** | Every insight must suggest specific behavior. "2 reviews away from #7" — not "Your review count is below average." Coach voice, not consultant voice. |

### 6. Dynamic Cohort Sizing
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (uncontested) |
| **Why** | Fixed category/city combos fail at power-law distribution. "Austin Mexican Restaurants" has 47 businesses; "Wichita Falls Vegan Cafes" has 2. Algorithm must expand geography until N≥10 to ensure meaningful rankings. |

---

## Unresolved: Public vs. Private Rankings

| | Steve Jobs | Elon Musk |
|---|---|---|
| **Position** | Private only. No public leaderboards. | Public city leaderboards, opt-out available. |
| **Argument** | Only winners share. Losers (#34 of 47) feel exposed → churn. Retention > virality. Shame engine destroys coaching relationship. | Zero viral coefficient = paid acquisition = death for SMB product. Distribution > dignity. Opt-out handles the sensitive ones. |
| **Status** | **DEADLOCKED** — Requires founder decision |

**Phil Jackson's Note:** This is the strategic fork. Steve optimizes for LTV via retention. Elon optimizes for CAC via viral distribution. Both are right within their frame. Founder must decide: Are we building a retention machine or a growth machine first?

---

## MVP Feature Set (V1)

### Ships
1. **Rank Widget** — Single number (#X of Y), direction arrow, one actionable insight ("2 reviews away from #7")
2. **Weekly Email** — Rank update, movement direction, one action item
3. **Google Business Profile Integration** — OAuth flow, daily data pull (reviews, ratings, response times)
4. **Dynamic Cohort Algorithm** — Category + location with automatic geography expansion when N<10
5. **Basic Dashboard** — Rank display, trend line, category/location context

### Cut from V1 (Explicitly Deferred)
- Conversational interface / chatbot benchmark queries
- Monthly performance reports
- Seasonal adjustments to rankings
- Multi-location business handling
- Website analytics integration
- "Engagement rate (if available)" — ambiguous scope
- Complex weighting explanations to users

---

## File Structure (What Gets Built)

```
rank/
├── api/
│   ├── auth/
│   │   └── google-oauth.ts          # OAuth flow for GBP
│   ├── data/
│   │   └── gbp-sync.ts              # Daily Google Business Profile pull
│   └── rank/
│       └── calculate.ts             # Core ranking algorithm
├── db/
│   ├── schema.sql                   # PostgreSQL schema
│   └── functions/
│       └── rank_businesses.sql      # ~50 line ranking function
├── jobs/
│   └── weekly-email.ts              # Cron: weekly rank digest
├── ui/
│   ├── components/
│   │   └── RankWidget.tsx           # The "punch" — big number, arrow, insight
│   └── pages/
│       └── dashboard.tsx            # Single-page rank display
├── email/
│   └── templates/
│       └── weekly-rank.html         # Coach-voice email template
└── config/
    └── cohorts.ts                   # Dynamic cohort sizing logic
```

---

## Open Questions (Require Resolution Before Build)

| # | Question | Owner | Impact |
|---|---|---|---|
| 1 | **Public vs. Private Rankings** | Founder | Determines distribution strategy, UI for sharing, database privacy model |
| 2 | **Rate limit handling strategy** | Engineering | GBP API quotas will throttle at scale — need retry/backoff logic spec |
| 3 | **Category taxonomy** | Product | PRD lists 9 categories. Real businesses blur lines (taco truck = restaurant? food truck? catering?). Need classification rules. |
| 4 | **Minimum cohort threshold** | Product | Elon says N≥10. Is that right? What if expanding to state level still yields <10? |
| 5 | **OAuth failure UX** | Design | What does Maria see if her Google connection breaks? Error state design needed. |
| 6 | **Rank calculation frequency** | Engineering | PRD says "daily" data pull but "weekly" email. When exactly does rank update? |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Google API changes/deprecation** | Medium | Critical | Abstract GBP integration behind interface; monitor Google deprecation announcements |
| **Cohort sparsity** | High | High | Dynamic cohort sizing (locked decision). Monitor % of users in N<10 cohorts post-launch |
| **Rankings feel arbitrary** | Medium | High | Transparent "what affects your rank" FAQ. Action-oriented insights explain movement |
| **OAuth drop-off** | High | Medium | Streamlined OAuth flow; clear value prop before permission request |
| **Low-ranked businesses churn** | Medium | High | Coach voice, not shame voice. Focus on progress ("up 3 spots") not position when rank is low |
| **Email deliverability** | Medium | Medium | Use established email service; warm up domain; monitor spam rates |
| **Category misclassification** | High | Medium | Allow user override of auto-detected category in V1.1 |
| **Competitive response (Yelp/Google native)** | Low | Critical | Speed to market. LocalGenius's moat is customer activity data (response times, posts) that platforms don't expose |

---

## The Essence (From Design Brief)

> **What is this product REALLY about?**
> Turning invisible small business owners into competitors with something to prove.

> **What's the feeling it should evoke?**
> The stomach-tightening moment you see your number and realize you're in the game.

> **What's the one thing that must be perfect?**
> The first glance. One number. Undeniable truth.

---

## Build Phase Authorization

**Locked decisions:** 6 of 7 major items resolved
**Blocking issue:** Public vs. Private rankings requires founder tiebreak
**Estimated V1 scope:** 3 weeks (per Elon), adjusted for API plumbing risk
**Ready for build:** Yes, pending resolution of Question #1

---

*Consolidated by Phil Jackson — The Zen Master*
*"The strength of the team is each individual member. The strength of each member is the team."*
