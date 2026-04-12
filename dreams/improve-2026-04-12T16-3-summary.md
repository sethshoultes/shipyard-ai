# IMPROVE Cycle Summary
**Date:** 2026-04-12 | **Cycle:** 3 | **Orchestrator:** Phil Jackson

---

## Executive Summary

The board reviewed all five shipped products for the third consecutive IMPROVE cycle. A clear pattern has emerged: **we keep proposing the same improvements and they keep failing to ship.**

Two PRDs from the previous cycle (Shipyard Maintenance System, LocalGenius Benchmark Engine) are now in the `failed/` folder. Both were comprehensive 300+ line documents requiring complex infrastructure. The lesson is clear: we're overengineering solutions to simple problems.

This cycle, the board consensus is: **stop writing complex PRDs. Start shipping simple fixes.**

---

## Board Review Summary

| Board Member | Focus Area | Key Finding |
|--------------|------------|-------------|
| **Jensen Huang** | Moat Gaps & Compounding | Zero network effects across portfolio; start with simple data collection before building flywheels |
| **Oprah Winfrey** | First-5-Minutes UX | Jargon, empty states, missing demos; every product fails the "Is this for me?" test |
| **Warren Buffett** | Revenue & Investability | Most products generate $0; past PRDs failed because they were too complex; ship manual processes first |
| **Shonda Rhimes** | Retention Hooks | No daily habit triggers; no progress narratives; products are pilots without series orders |

---

## The Meta-Problem: PRD Complexity

**Previous Cycle PRDs That Failed:**
1. `shipyard-maintenance-system.md` — 300 lines, 8-week timeline, Stripe + email + dashboard
2. `localgenius-benchmark-engine.md` — 370 lines, 8-week timeline, data warehouse + aggregation pipeline

**Why They Failed:**
- Too much infrastructure before proving the model
- No quick wins that validate demand
- Engineering scope exceeded available capacity

**This Cycle's Approach:**
- **No new PRDs unless they pass the "Can we ship this in 1 week?" test**
- **Manual-first: prove the model works before automating**
- **Prefer config changes, copy updates, and email sequences over new systems**

---

## Cross-Board Consensus Themes

### 1. LocalGenius Is Ready — We're Just Not Selling It
- Buffett: "Pricing isn't visible. How do we expect people to buy?"
- Oprah: "No demo video. No social proof. No industry relevance."
- Shonda: "No daily habit trigger. Users forget it exists."
- Jensen: "No data flywheel — but we need customers first to build one."

**Consensus:** LocalGenius has product-market fit. It needs sales-market fit. The fixes are mostly copy, content, and email sequences — not engineering.

### 2. Shipyard's Maintenance Problem Is a Process Problem, Not a Product Problem
- Buffett: "Just send a manual email after delivery. Track in a spreadsheet."
- Shonda: "Monthly Site Story email keeps the relationship alive."
- Jensen: "Build the component library so maintenance is fast."
- Oprah: "Case study on the homepage proves capability."

**Consensus:** We don't need a maintenance *system*. We need to *offer maintenance* and see if anyone says yes. Manual first, automate later.

### 3. WordPress Plugins Are Marketing Assets, Not Products
- All board members agree: Dash and Pinned should be on WordPress.org
- They should capture emails for LocalGenius/Shipyard pipeline
- Revenue potential is minimal; lead-gen potential is high
- Stop treating them as products; start treating them as top-of-funnel

### 4. Great Minds Should Stay Internal (For Now)
- Fascinating technology, unclear customer
- Powers Shipyard (proven value)
- Revisit when portfolio hits $50K MRR

---

## Top 3 Improvements (Ranked by Impact)

### #1: LocalGenius Sales Readiness Sprint
**Impact:** CRITICAL | **Effort:** LOW | **Consensus:** 4/4 board members
**Can We Ship in 1 Week?** ✅ YES

**What It Includes:**
1. **Add visible pricing page** — $149/mo + $1,490/year (2 months free)
2. **Record 60-second demo video** — Real business owner using LocalGenius
3. **Add industry selector** — Homepage toggles examples for Restaurant/Dental/Salon/Retail
4. **System first message** — Post-signup, show discovered business data + suggested first action
5. **Track metrics** — Weekly report of signups, trials, conversions, churn

**Why This Wins:**
- No engineering required (mostly content + config)
- Addresses Oprah's first-5-minutes critique
- Addresses Buffett's revenue visibility concern
- Foundation for Shonda's retention hooks (can add Morning Briefing after)

**Success Metrics:**
- Trial-to-paid conversion rate visible and tracked
- Demo video completion rate >50%
- Industry selector A/B shows higher engagement

**PRD Status:** ⚠️ No PRD needed — this is a sprint checklist, not a project

---

### #2: Shipyard Manual Maintenance Offer
**Impact:** HIGH | **Effort:** LOW | **Consensus:** 4/4 board members
**Can We Ship in 1 Week?** ✅ YES

**What It Includes:**
1. **Post-delivery email template** — "Project complete. $99/mo for ongoing updates. Reply YES."
2. **Tracking spreadsheet** — Customer, tier, token usage, billing date
3. **Monthly Site Story email** — Traffic, performance, one recommendation
4. **90-day proposal template** — "Based on trends, here's what you could add next"

**Why This Wins:**
- Zero infrastructure required
- Proves demand before building system
- Creates recurring revenue immediately
- Each maintenance customer = 10x more valuable than project-only

**Success Metrics:**
- 5 maintenance customers within 30 days
- $500 MRR from maintenance within 60 days
- Customer reply rate to Site Story email >30%

**PRD Status:** ⚠️ No PRD needed — this is a manual process + email templates

---

### #3: WordPress.org Distribution + Email Capture
**Impact:** MEDIUM-HIGH | **Effort:** LOW | **Consensus:** 4/4 board members
**Can We Ship in 1 Week?** ✅ YES

**What It Includes:**
1. **Submit Dash to WordPress.org** — Follow WP.org guidelines, prepare assets
2. **Submit Pinned to WordPress.org** — Same process
3. **Add welcome modal on first install** — "Press Cmd+K now!" / "Create your first note!"
4. **Add email capture** — "Get weekly WordPress productivity tips" (feeds LocalGenius/Shipyard marketing)

**Why This Wins:**
- Massive distribution increase (WP.org vs GitHub-only)
- Social proof from reviews
- Qualified lead capture for other products
- Low maintenance after initial submission

**Success Metrics:**
- Both plugins listed on WordPress.org within 30 days
- 1,000 installs within 60 days
- 500 email captures within 90 days

**PRD Status:** ⚠️ No PRD needed — this is plugin submission + minor updates

---

## Additional Improvements (Prioritized Backlog)

| Rank | Improvement | Product | Impact | Effort | Notes |
|------|-------------|---------|--------|--------|-------|
| 4 | Morning Briefing daily notification | LocalGenius | High | Medium | After #1 ships |
| 5 | Case study hero on homepage | Shipyard | Medium | Low | Content, not code |
| 6 | Component library (internal) | Shipyard | Medium | Medium | Moat-building, not revenue |
| 7 | Monthly Progress Report email | LocalGenius | Medium | Low | After #1 ships |
| 8 | "Plain English" pricing copy | Shipyard | Medium | Low | Replace tokens with dollars |
| 9 | Simple competitive stats in email | LocalGenius | Medium | Low | No complex benchmark system |
| 10 | Project Story artifact | Great Minds | Low | Medium | Marketing content |

---

## PRDs Generated This Cycle

**None.**

The board unanimously agreed: no new PRDs until the Top 3 improvements ship. Previous cycles generated comprehensive PRDs that failed to execute. This cycle focuses on quick wins that prove demand.

**When to Write PRDs Again:**
1. LocalGenius has visible, tracked conversion metrics
2. Shipyard has 10+ maintenance customers (manual process proven)
3. WordPress plugins have 1,000+ installs on WordPress.org

After these milestones, we can justify infrastructure investments.

---

## Portfolio Health Scorecard

| Metric | Previous Cycle | Now | Target (90 days) |
|--------|---------------|-----|------------------|
| Products with visible pricing | 0/5 | 0/5 | 2/5 |
| Products with recurring revenue | 1/5 | 1/5 | 2/5 |
| Products on WordPress.org | 0/2 | 0/2 | 2/2 |
| Weekly metrics tracked | ❌ | ❌ | ✅ |
| Maintenance customers (Shipyard) | 0 | 0 | 10+ |
| Portfolio MRR (estimated) | ~$5K | ~$5K | $15K |

---

## Next Steps (This Week)

### Monday-Tuesday
- [ ] Design LocalGenius pricing page
- [ ] Write Shipyard post-delivery email template
- [ ] Prepare WordPress.org submission for Dash

### Wednesday-Thursday
- [ ] Record LocalGenius 60-second demo video
- [ ] Create Site Story email template for Shipyard
- [ ] Prepare WordPress.org submission for Pinned

### Friday
- [ ] Deploy pricing page
- [ ] Send maintenance offer to last 3 Shipyard clients
- [ ] Submit plugins to WordPress.org review queue

### Week 2+
- [ ] Track LocalGenius metrics daily
- [ ] Follow up on maintenance offers
- [ ] Monitor WordPress.org review status

---

## Board Quotes for the Road

**Jensen:** *"Stop building infrastructure. Start collecting data from the customers you already have."*

**Oprah:** *"Before we build anything new, please record a 60-second demo video. I cannot overstate how much this matters."*

**Buffett:** *"This cycle, I want to see invoices, not documents. Send the maintenance email. Add the pricing page. Do the simple things that make money."*

**Shonda:** *"We're writing pilots with no series order. Add the daily hook. Add the progress narrative. Make them want to come back."*

---

## The One Thing

If we do only ONE thing from this cycle, it should be:

**Make LocalGenius pricing visible and track conversion metrics weekly.**

Everything else flows from there. We can't improve what we don't measure. We can't sell what we don't price. LocalGenius has the highest revenue potential — let's find out if people will actually pay for it.

---

*Summary compiled by Phil Jackson*
*"The strength of the team is each individual member. The strength of each member is the team."*
