# Board Review: LocalGenius Benchmark Engine

**Reviewer:** Warren Buffett
**Role:** Board Member, Great Minds Agency
**Date:** 2026-04-14
**Project:** localgenius-benchmark-engine (RANK)

---

## Executive Summary

This is a business, not a hobby—but only barely. The Benchmark Engine addresses a genuine strategic weakness (lack of data moat), and the team has built sensible infrastructure. However, the economics remain untested and the competitive moat is thinner than advertised.

**Score: 6/10** — *Sound strategy with commodity execution risk; moat depends on adoption velocity that hasn't been proven.*

---

## Unit Economics

### What It Costs to Acquire and Serve One User

**Acquisition Cost (CAC):**
- Zero incremental CAC — this is a feature for existing LocalGenius customers, not a standalone product
- However, there's hidden cost: Google Business Profile OAuth friction. Each user must grant access, creating a conversion funnel
- Estimate: 60-70% of existing customers will complete OAuth based on typical permission grant rates

**Cost to Serve (per user/month):**
| Component | Estimated Cost |
|-----------|----------------|
| Google API calls | ~$0.01-0.02 (daily sync, rate-limited) |
| Database storage | ~$0.005 (metrics + rankings rows) |
| Compute (weekly ranking job) | ~$0.001 |
| **Total marginal cost** | **~$0.02-0.03/user/month** |

**Verdict:** Near-zero marginal cost is excellent. The 24-hour cache and weekly batch processing show capital discipline. This scales linearly without surprise costs.

---

## Revenue Model

### Is This a Business or a Hobby?

**Current Model:**
- Free tier: See rank and percentile (engagement hook)
- Pro tier: See gaps to next rank, competitor benchmarks, trend history

**Revenue Mechanics:**
- Target: +10% Pro tier upgrade rate in 90 days
- Target: 50 benchmark-driven upsells/month by 6 months

**The Problem:**
The PRD targets "+10% upgrade rate" but doesn't state the baseline. If current Pro conversion is 5%, reaching 15% is ambitious but achievable. If it's 2%, reaching 12% is a moonshot.

**What I'd Want to See:**
1. Current Pro conversion rate (baseline)
2. Price delta between Free and Pro tiers
3. LTV:CAC ratio for Pro customers

**Verdict:** This is a *feature that might drive revenue*, not a revenue product itself. The business model is sound in theory (gamification drives engagement drives upgrades), but the numbers are aspirational, not proven. I've seen many "engagement features" fail to move revenue needles.

---

## Competitive Moat

### What Stops Someone From Copying This in a Weekend?

**What They Built:**
1. Data aggregation layer (commodity)
2. Ranking algorithm (commodity)
3. Dynamic cohort sizing (commodity)
4. React components (commodity)

**Their Claimed Moat (from decisions.md):**
> "Review counts are commodity. Response times from LocalGenius platform are the real moat."

**Reality Check:**

The proprietary signals (response_rate, avg_response_time_hours) are only 30% of the composite score:
- Review count: 25% (commodity)
- Average rating: 25% (commodity)
- Review velocity: 20% (commodity)
- Response rate: 15% (proprietary)
- Response time: 15% (proprietary)

**The Math Problem:**
A competitor could build 70% of the scoring algorithm using only Google Business Profile data, which is publicly scrapeable. The 30% LocalGenius-proprietary data provides differentiation, but not defensibility.

**The Real Moat (if it exists):**
- **Network effects:** Rankings become more meaningful as more businesses join the same category/location cohort
- **Data freshness:** Competitors would need to scrape daily; LocalGenius has authorized API access
- **Switching cost:** Once a business cares about their rank, leaving means losing visibility

**Weekend Copy Assessment:**
| Component | Copy Difficulty |
|-----------|-----------------|
| Database schema | 2 hours |
| Ranking algorithm | 4 hours |
| React widget | 4 hours |
| Google OAuth | 2 hours |
| Metro mapping | 1 hour (they published it) |
| **Total for 70% clone** | **~13 hours** |

**Verdict:** The moat is not in the code—it's in the installed base. If LocalGenius has 500+ businesses per category in target markets (per their expansion criteria), competitors face a cold-start problem. But if they don't, someone *can* copy this in a weekend and out-execute on distribution.

---

## Capital Efficiency

### Are We Spending Wisely?

**What They Did Right:**

1. **Scope discipline:** Only 3 categories (restaurants, home_services, retail). Elon's quote in the code: "Rankings require cohort density. 9 categories at launch = 'V2 wearing V1's clothes.'"

2. **API cost mitigation:** 24-hour cache minimum, exponential backoff, staggered sync window. They're not burning money on Google API calls.

3. **No external dependencies:** TrendLine component uses pure SVG instead of a charting library. Small thing, but shows cost consciousness.

4. **Graceful degradation:** "Insufficient data" handling when N < 10. They won't show garbage rankings that erode trust.

**What Concerns Me:**

1. **8-week timeline across 4 phases** — Is this one engineer? Two? The PRD doesn't specify team size. Time is capital.

2. **Metro mapping is hand-coded** — 200+ city-to-metro mappings. This is tech debt. Should use a geocoding service or Census Bureau API.

3. **Email infrastructure not shown** — PRD mentions weekly ranking emails, but no implementation in deliverables. Hidden scope.

**Verdict:** The technical implementation shows fiscal discipline. They're not over-engineering. But the *business* investment (8 weeks of engineering time) for an unproven revenue thesis is the real capital question. If this doesn't move Pro conversions, it's an expensive engagement feature.

---

## Strategic Assessment

### The Buffett Lens

**What I Like:**
1. They identified a real problem: "No proprietary data moat — competitors using the same AI can match our features"
2. The solution creates network effects that compound over time
3. Marginal economics are favorable

**What Worries Me:**
1. The moat is adoption-dependent, not technology-dependent
2. 70% of the ranking algorithm uses commodity data
3. No evidence that SMB owners will actually change behavior based on rankings
4. The "Coach voice" philosophy is good UX, but good UX doesn't guarantee monetization

**The Charlie Munger Question:**
*"What has to be true for this to work?"*

1. LocalGenius must have sufficient business density (10+ per category/city)
2. SMB owners must care about relative rank (competitive psychology)
3. Rank improvements must correlate with actions LocalGenius can monetize (Pro features, AI suggestions)
4. Google must not rate-limit or change their API terms

That's four dependencies. I prefer investments with one or two.

---

## Recommendations

1. **Instrument everything:** Track correlation between rank engagement and Pro conversion from day one. Kill this if it doesn't move the number in 90 days.

2. **Increase proprietary signal weight:** Consider moving response_rate and response_time to 20% each (40% total). This strengthens the moat.

3. **Add a truly proprietary metric:** What about "AI recommendation acceptance rate"? Something competitors can't replicate at all.

4. **Define success/failure criteria explicitly:** What Pro conversion rate increase justifies the 8-week investment? Write it down.

---

## Final Score

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Unit Economics | 8/10 | 25% | 2.00 |
| Revenue Model | 5/10 | 25% | 1.25 |
| Competitive Moat | 5/10 | 30% | 1.50 |
| Capital Efficiency | 7/10 | 20% | 1.40 |
| **Total** | | | **6.15/10** |

**Score: 6/10**

**One-Line Justification:** *Smart strategic move with disciplined execution, but the moat depends on adoption density that hasn't been proven, and the revenue thesis remains an educated guess.*

---

*"Price is what you pay. Value is what you get." — The value here is conditional on winning the adoption race.*

— Warren Buffett
Board Member, Great Minds Agency
