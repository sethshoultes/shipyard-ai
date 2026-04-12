# IMPROVE Cycle: Warren Buffett Review
**Date:** 2026-04-12 | **Focus:** Revenue Opportunities & Investability

---

## The Investment Lens

*"Someone's sitting in the shade today because someone planted a tree a long time ago."*

Trees take time to grow. But you need to plant them. Let's look at what's been planted — and what still needs planting.

---

## Portfolio Financial Assessment (Updated)

### Current Revenue Model Summary

| Product | Model | Status | MRR | Trend |
|---------|-------|--------|-----|-------|
| LocalGenius | Subscription ($29-79/mo) | Active | Est. $2-5K | Stable |
| Shipyard AI | Project-based | 7 plugins shipped | $0 recurring | Risk |
| Dash | Free/OSS | v1.0.0 shipped | $0 | Stable |
| Pinned | Free/OSS | v1.0.0 shipped | $0 | Stable |
| Great Minds | Free plugin | Operational | $0 | Stable |

**Portfolio Grade: C** (up from C-)

**What Changed:**
- Shipyard shipped 7 production plugins (asset creation)
- Theme marketplace operational (potential revenue channel)
- Still only 1 product with recurring revenue

---

## Product-by-Product Revenue Analysis

### Shipyard AI

**Current Economics:**
- 7 plugins built and shipped
- 4 example sites live
- 5 themes in Wardrobe marketplace
- Token-based project pricing ($500-5K range)
- $0 recurring revenue

**The Fundamental Problem:**

Shipyard has shipped $50K+ worth of software (7 plugins, 5 themes, 4 sites) but captures $0 in ongoing revenue from any of it. This is a factory, not a business.

**Revenue Opportunities:**

1. **Maintenance Contracts (CRITICAL — Still Blocked)**
   - Last cycle recommended this
   - PRD was written: `shipyard-maintenance-system.md`
   - Status: FAILED in pipeline
   - Why? Likely complexity/scope issues
   - **Action:** Simplify scope, re-submit

   **Simplified V1:**
   - Tier 1: $79/mo — 50K token allowance for updates
   - Tier 2: $199/mo — 200K tokens + quarterly refresh proposal
   - Automated post-delivery email sequence
   - Simple client dashboard (site stats only)

   **Revenue Projection:** 30% attach rate × 10 projects/mo × $139 avg = +$417 MRR/month growing

2. **Plugin Licensing (NEW)**
   - 7 plugins are production-ready
   - Currently bundled with Emdash sites
   - Unbundle and sell individually?

   **Model A: Per-Site License**
   - $29/year per plugin per site
   - Enterprise: $199/year unlimited sites

   **Model B: Bundle Subscription**
   - Full plugin suite: $149/year
   - Cheaper than buying 3+ individually

   **Revenue Projection:** 100 sites × $100/year avg = $10K ARR

3. **Theme Marketplace Revenue Share (NEW)**
   - Wardrobe has 5 themes
   - Currently free/included
   - Premium themes: $49-99 one-time or $19/year

   **Revenue Projection:** Modest — $2-5K ARR if popular

4. **AgentBench Monetization (FUTURE)**
   - Testing framework in development
   - npm package + open-source core
   - Enterprise features could be paid
   - Not ready yet — track for future cycle

---

### LocalGenius

**Current Economics:**
- $29-79/mo subscription
- Franchise tier at $79/location
- Unknown current MRR (estimate $2-5K)
- Benchmark engine (PULSE) blocked on strategic decision

**Revenue Opportunities:**

1. **Annual Plans (Still Not Implemented)**
   - Recommended last cycle
   - No evidence of implementation
   - **Action:** Implement immediately

   **Structure:**
   - Base Annual: $290 (save $58 / 2 months free)
   - Pro Annual: $790 (save $158)
   - Franchise Annual: $790/location

   **Revenue Impact:**
   - Improved cash flow
   - 15-20% better retention (commitment)
   - Same revenue, less churn

2. **Agency/Reseller Channel (HIGH)**
   - Marketing agencies serve 10-50+ SMB clients each
   - Agency buys at $15-20/client wholesale
   - Resells at $50+/client
   - Volume: 10+ clients = discount tier

   **Revenue Projection:**
   - 5 agencies × 20 clients × $15 wholesale = $1,500 MRR
   - Lower margin but zero CAC

3. **Transaction Revenue (MEDIUM)**
   - LocalGenius facilitates bookings/appointments
   - Small % of transaction value
   - "We helped get this customer"

   **Challenge:** Requires integration work
   **Revenue Projection:** +$5-15/customer/month if implemented

4. **Benchmark Engine Premium Tier (HIGH — If Unblocked)**
   - PULSE competitive rankings as premium feature
   - Base: Private rank only
   - Pro: Public badge, benchmark insights

   **Prerequisite:** Ship the benchmark engine first

---

### Dash + Pinned (WordPress Plugins)

**Current Economics:**
- Both free and open source
- Production v1.0.0 shipped
- Zero direct revenue

**The Strategic Question:**

Should these be monetized, or are they marketing channels?

**Option A: Monetize Directly**
- Freemium model with Pro features
- Dash Pro: $29/year (analytics, multi-site, custom commands)
- Pinned Pro: $39/year (threads, history, Slack sync)
- Expected conversion: 2-5%

**Projection:**
- 10,000 installs × 3% × $34 avg = ~$10K ARR
- But: WordPress plugin monetization is brutally competitive

**Option B: Marketing Funnel (Recommended)**
- Keep free
- Add tasteful cross-promotion to LocalGenius/Shipyard
- Settings page: "Built by Shipyard AI — need a site?"
- Dashboard: "Managing content? Try LocalGenius for AI marketing"

**Projection:**
- 0.5% of plugin users → Shipyard/LocalGenius inquiry
- 10,000 installs × 0.5% = 50 leads/year
- 10% conversion × $2K avg project = $10K revenue
- Same revenue, no plugin support burden

**Recommendation:** Keep free, implement cross-promotion. WordPress plugin monetization has poor ROI for small teams.

---

### Great Minds Plugin

**Current Economics:**
- Free Claude Code plugin
- Powers all Shipyard output
- No direct revenue

**Revenue Opportunities:**

1. **Hosted Execution (SaaS)**
   - "Run Great Minds without local setup"
   - Per-project pricing: $50-500
   - Removes friction, captures value

   **Challenge:** Significant infrastructure investment
   **Timeline:** 6-12 months to productize
   **Revenue Projection:** $5-20K MRR if successful

2. **Enterprise License**
   - Self-hosted with support
   - Custom persona development
   - Training and integration
   - $10K-50K/year

   **Challenge:** Sales effort required
   **Timeline:** Opportunistic — need inbound demand first

3. **Template Marketplace**
   - PRD templates, agent configurations
   - Community-created, revenue share
   - Platform play

   **Timeline:** Requires scale first

**Recommendation:** Don't monetize yet. Great Minds is infrastructure — keep it powering Shipyard until Shipyard has revenue worth protecting.

---

## Portfolio Restructuring (Updated)

```
                    REVENUE PRIORITY
                          ↓
               ┌─────────────────────┐
               │    LocalGenius      │ ← Primary revenue engine
               │   $29-79/mo SaaS    │ ← Add annual plans + agency channel
               └─────────────────────┘
                          ↓
               ┌─────────────────────┐
               │    Shipyard AI      │ ← Secondary revenue
               │ + Maintenance MRR   │ ← STILL NEEDS IMPLEMENTATION
               │ + Plugin licensing  │ ← NEW opportunity
               └─────────────────────┘
                          ↓
               ┌─────────────────────┐
               │   Great Minds       │ ← Infrastructure (no direct rev)
               │  (Powers above)     │
               └─────────────────────┘
                          ↓
               ┌─────────────────────┐
               │  Dash + Pinned      │ ← Marketing/Lead Gen
               │  (Free + funnel)    │ ← Cross-promote, don't monetize
               └─────────────────────┘
```

---

## Revenue Projections (Revised 12-Month Target)

| Product | Current MRR | Actions | 12-Month MRR Target |
|---------|-------------|---------|---------------------|
| LocalGenius | ~$3K | Annual plans, agency channel | $12K |
| Shipyard | $0 | Maintenance contracts, plugin licensing | $5K |
| Plugins (Dash/Pinned) | $0 | Cross-promotion (indirect rev) | $0 direct |
| Great Minds | $0 | Infrastructure — no change | $0 |

**Target Portfolio MRR: $17K/month = $204K ARR**

---

## Investability Assessment (Updated)

| Criterion | Last Cycle | Now | Target |
|-----------|------------|-----|--------|
| Recurring Revenue Products | 1/5 | 1/5 | 2/5 |
| Gross Margins | ~80% | ~80% | Maintain |
| CAC Payback | Unknown | Unknown | < 6 months |
| Monthly Churn | Unknown | Unknown | < 5% |
| Monthly Growth | Unknown | Unknown | > 10% |
| Economic Moat | Weak | Weak | Data/Network |

**Would I Invest Today?** Still no.

**What Changed:**
- More shipped products (7 plugins, themes, sites)
- But no recurring revenue added
- Maintenance system PRD failed — needs retry

**What Would Change My Mind:**

1. Shipyard maintenance contracts at 25%+ attach rate
2. LocalGenius hitting $10K MRR with measured churn
3. Plugin licensing generating any revenue
4. Clear path to $20K MRR within 6 months

---

## Top 3 Revenue Priorities (This Cycle)

### 1. Shipyard Maintenance System V2 (CRITICAL)

**Why:** Project revenue doesn't compound. Recurring revenue does. This was the #1 priority last cycle and the PRD failed.

**What Went Wrong:**
- Original PRD may have been too complex
- Site health dashboard + email sequences + client portal = scope creep

**Simplified Approach:**
- **Phase 1:** Token allowance + manual tracking (spreadsheet-level)
- **Phase 2:** Automated email sequence post-delivery
- **Phase 3:** Client dashboard with site stats

**V2 Scope (Phase 1 Only):**
- Maintenance tier options: $79/mo (50K tokens), $199/mo (200K tokens)
- Simple Stripe subscription setup
- Manual fulfillment (agent runs updates when requested)
- Post-delivery email (manual send for now)

**Investment:** 1 week to MVP
**Revenue Target:** 3 contracts within 60 days = $400+ MRR

### 2. LocalGenius Annual Plans (HIGH — Still Pending)

**Why:** Cash flow improvement + churn reduction. Zero engineering required.

**Implementation:**
- Add annual options to pricing page
- Base Annual: $290 (was $348)
- Pro Annual: $790 (was $948)
- Email existing monthly customers with offer

**Investment:** 1 day (Stripe config + page update)
**Revenue Target:** 30% of new signups choose annual

### 3. Plugin Licensing Trial (MEDIUM)

**Why:** 7 production plugins exist. Test whether market will pay.

**Test Approach:**
- Pick ONE plugin (Membership or EventDash — most standalone value)
- Create landing page with $29/year pricing
- List on plugin marketplace or ProductHunt
- Measure demand before building licensing infrastructure

**Investment:** 2 weeks (packaging + landing page)
**Revenue Target:** 10 paid licenses = $290 ARR (proof of concept)

---

## The Hard Truth

Last cycle identified the same core problem: **3 of 5 products generate $0.**

This cycle: **Still 3 of 5 products generate $0.**

We've shipped more products (7 plugins, 5 themes, 4 sites) but haven't converted shipping discipline into revenue discipline.

**The Pattern:**
- Great at building
- Weak at monetizing

**The Fix:**
- Stop building new features
- Start implementing revenue mechanics
- Maintenance contracts before new plugins
- Annual plans before new tiers

Revenue is a feature. Ship it.

---

*Warren Buffett | Shipyard AI Board*
*"The best time to plant a tree was 20 years ago. The second best time is now."*
