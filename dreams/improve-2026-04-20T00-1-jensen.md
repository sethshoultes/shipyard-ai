# IMPROVE Board Review — Jensen Huang
**Date:** 2026-04-20
**Cycle:** IMPROVE-2026-04-20T00-1
**Focus:** Moat Gaps & Compounding Advantages

---

## Portfolio Assessment

### 1. LocalGenius (localgenius.company)
**Moat Status: YELLOW — Growing but Fragile**

**Current Compounding Advantages:**
- Restaurant-specific training data creates domain expertise competitors lack
- Insight persistence (`insight_actions` table) builds institutional memory per customer
- Weekly digests create habit loops that compound engagement
- Multi-location pricing ($79/location) creates switching costs at scale

**Moat Gaps:**
- **No network effects.** Each restaurant is an island. A 10,000-restaurant network should be smarter than 10,000 individual installations — it isn't.
- **Data moat underleveraged.** We see what marketing works across hundreds of restaurants but don't aggregate this into "industry benchmarks" that single-location tools can't provide.
- **API ecosystem absent.** No third-party integrations means no developer community, no lock-in through ecosystem.
- **Brand moat weak.** "AI marketing for restaurants" is a category, not a position. Who owns "the restaurant marketer"?

**Compounding Opportunity:**
Create anonymized benchmark reports: "Restaurants using LocalGenius see 23% higher review response rates than industry average." This is data only we can generate. It becomes marketing material AND a moat.

**Verdict:** LocalGenius has the *ingredients* for a data moat but hasn't assembled them. The unit economics work (LTV/CAC 9.3x per previous review), but defensibility is thin.

---

### 2. Shipyard AI (shipyard.company)
**Moat Status: YELLOW — Execution Moat Only**

**Current Compounding Advantages:**
- 100% ship rate creates trust signal competitors can't claim without evidence
- 19 projects shipped builds internal process knowledge
- Token-based pricing transparency is differentiating (agencies hide costs)
- Great Minds pipeline is proprietary process IP

**Moat Gaps:**
- **No portfolio visibility.** An agency lives on case studies. Zero visible portfolio = zero social proof. The 100% ship rate claim is unverifiable externally.
- **Process moat is copyable.** The Great Minds pipeline could be replicated by any team with Claude Agent SDK access. There's no data flywheel.
- **No client retention mechanism.** "PRD in, production out" is transactional. Where's the subscription layer?
- **Platform economics missing.** Why isn't there a self-serve tier? Shipyard should be building toward "AWS for AI-built software" not "boutique agency."

**Compounding Opportunity:**
Publish sanitized case studies with before/after metrics. "Client X went from PRD to production in 72 hours. Here's the token breakdown." This creates proof AND attracts similar clients (selection effect).

**Verdict:** Shipyard is an execution machine without a flywheel. The process works, but it doesn't compound. Every new client starts from zero trust.

---

### 3. Dash (WP Command Bar)
**Moat Status: GREEN — Acceptable for Free Plugin**

**Current Compounding Advantages:**
- Local index grows with WordPress installation (more posts = more value)
- Recent items create personalized shortcuts (habit formation)
- Cmd+K is universal UX pattern (zero learning curve)
- Developer API could create ecosystem lock-in

**Moat Gaps:**
- **No network effects.** Each installation is isolated. We can't say "most-searched commands across 10,000 Dash users" because we don't aggregate.
- **Feature-complete = clonable.** 6KB, zero dependencies means any developer can replicate in a weekend.
- **No premium tier.** Lead-gen only means no direct revenue to reinvest in R&D moat.

**Compounding Opportunity:**
If we collect anonymized search patterns (opt-in), we could offer "suggested commands" that single-site tools cannot. "Users like you frequently search for: [Settings → Permalinks]."

**Verdict:** Moat matches strategy. Dash is a marketing asset, not a product. GREEN.

---

### 4. Pinned (WP Sticky Notes)
**Moat Status: GREEN — Acceptable for Free Plugin**

**Current Compounding Advantages:**
- Historical notes create organizational memory
- @mention patterns reveal team communication graphs
- Note aging data shows organizational priorities
- Dashboard placement creates daily touchpoint

**Moat Gaps:**
- Same as Dash: isolated installations, no cross-site learning, easily clonable

**Compounding Opportunity:**
"What do teams pin most?" by industry/role could inform template suggestions. Agencies pin client feedback differently than dev shops pin deployment notes.

**Verdict:** GREEN. Same logic as Dash — lead-gen asset, not standalone product.

---

### 5. Great Minds Plugin
**Moat Status: GREEN — Strong Process IP**

**Current Compounding Advantages:**
- 19 shipped projects = accumulated learnings in memory store
- DO-NOT-REPEAT patterns prevent regression (institutional knowledge)
- Agent personas are refined through retrospectives
- Token ledger provides cost visibility competitors lack

**Moat Gaps:**
- **Open-source adjacent.** If someone reads the README, they understand the architecture. Process IP without patent protection.
- **No external adoption.** Great Minds powers Shipyard, but isn't a product itself. No community, no ecosystem.

**Compounding Opportunity:**
The memory store is the moat. Every project makes future projects better. This is invisible to competitors who'd have to ship 19 projects to match.

**Verdict:** GREEN. The moat is execution history, not architecture.

---

## Top 3 Moat Priorities

### Priority 1: LocalGenius Data Moat (CRITICAL)
**Gap:** Siloed customer data
**Fix:** Aggregate anonymized performance benchmarks across all customers
**Impact:** Creates "only we can tell you this" value proposition
**Effort:** MEDIUM (analytics pipeline + reporting)
**Timeline:** 30-day MVP

### Priority 2: Shipyard Portfolio Visibility (HIGH)
**Gap:** Zero visible case studies
**Fix:** Publish 3 sanitized case studies with metrics
**Impact:** Converts 100% ship rate from claim to proof
**Effort:** LOW (content, not code)
**Timeline:** 2 weeks

### Priority 3: Cross-Installation Intelligence (MEDIUM)
**Gap:** WordPress plugins are isolated islands
**Fix:** Opt-in anonymized usage telemetry → "suggested features"
**Impact:** Creates network effect impossible to clone
**Effort:** HIGH (privacy, infrastructure, UX)
**Timeline:** 60+ days

---

## Jensen's Verdict

The portfolio has **execution moats** but lacks **data moats**. LocalGenius is the highest-stakes gap — it's the revenue engine, and its defensibility is thin. Shipyard needs proof, not promises. The WordPress plugins are correctly positioned as marketing assets.

**One thing to fix this week:** Publish one Shipyard case study. It costs nothing but time and immediately addresses the trust gap.

---

*Jensen Huang*
*Board Member, Great Minds Agency*
