# IMPROVE Board Review — Jensen Huang
**Date:** 2026-04-22
**Cycle:** IMPROVE-2026-04-22T23-0
**Focus:** Moat Gaps, Compounding Advantages & Pipeline Velocity

---

## Portfolio Assessment

### 1. LocalGenius (localgenius.company)
**Moat Status: YELLOW → Execution Improving, Data Moat Still Stuck**

**What's Changed Since Last Review:**
- **Insight persistence is DONE.** The `insight_actions` table is live. In-memory Map is gone. This is real institutional memory — the product gets smarter per customer over time.
- **Benchmark engine PRD is BLOCKED (Apr 14, Board Score 6.6).** This is the single most important moat project and it has been stuck for 8 days.

**Current Compounding Advantages:**
- Domain-specific training data for restaurant marketing
- `insight_actions` persistence creates per-customer learning curves
- Multi-location pricing creates expansion revenue without new CAC
- Weekly digest rhythm builds habit loops

**Moat Gaps — Unchanged and Urgent:**
1. **No network effects.** 10,000 restaurants should be smarter together. They aren't.
2. **Data moat under construction but blocked.** The benchmark engine PRD (`localgenius-benchmark-engine`) was approved, written, and then blocked in QA/Delivery. Without it, we cannot generate "Restaurants using LocalGenius see X% better outcomes than industry average" — the claim only we can make.
3. **API ecosystem absent.** Still no third-party integrations, no developer lock-in.
4. **Brand moat weak.** "AI marketing for restaurants" is still a category description, not a position.

**Compounding Opportunity:**
The `insight_actions` table is the foundation. Now aggregate it. The data moat is one unblocking decision away. If benchmark engine remains blocked, LocalGenius is just a well-executed SaaS tool — not a platform.

**Verdict:** Insight persistence proves the team can ship hard infrastructure. But moat-building is measured in shipped data products, not shipped schemas. Unblock the benchmark engine this week.

---

### 2. Shipyard AI (shipyard.company)
**Moat Status: RED — Showcase Failed, Proof Gap Widening**

**What's Changed Since Last Review:**
- **Shipyard showcase PRD FAILED (Apr 21).** The case study / portfolio project — the exact fix I recommended last cycle — failed delivery.
- **Self-serve intake SHIPPED (Apr 16, Board Score 3.5, QA PASS).** Technical foundation is solid. But "excellent technical foundation, no user experience" is not a moat.

**Current Compounding Advantages:**
- 100% ship rate claim (still unverified externally)
- 37 total shipped projects = process knowledge
- Token-based pricing transparency
- Great Minds pipeline IP

**Moat Gaps — Deteriorating:**
1. **Zero visible portfolio = zero social proof.** The showcase PRD failed. This is now a pattern: we can't ship proof.
2. **Process moat still copyable.** The Great Minds pipeline works, but any team with AI agent access can replicate it.
3. **No client retention mechanism.** Post-ship lifecycle PRD (`monetization-mvp`) is HOLD at 40%.
4. **No self-serve tier.** Intake is built, but there's no "AWS for AI-built software" tier yet.

**Compounding Opportunity:**
Stop writing Shipyard PRDs until the showcase ships. The failed PRD is a signal: either the scope is wrong, or the delivery pipeline is choking on content work. A case study is not code — it should not fail. Fix the process before fixing the product.

**Verdict:** Shipyard has an execution moat but is losing the proof war. One failed PRD is noise. Two is a pattern. The showcase must ship before any new Shipyard feature is funded.

---

### 3. Dash (WP Command Bar)
**Moat Status: GREEN — Lead-Gen Asset, Correctly Scoped**

**What's Changed Since Last Review:**
- **Deploy-all-plugins SHIPPED (Apr 16, QA PASS, Board Score 5.5).** Dash is now part of a deployed plugin suite. This validates the lead-gen strategy.
- **v1 feature decision confirmed:** Command bar UI, keyboard nav, backdrop dim, CSS custom properties — all approved for v1.

**Current Compounding Advantages:**
- Cmd+K universal pattern = zero learning curve
- Recent items create personalized shortcuts
- Local index grows with WordPress installation
- Developer API creates ecosystem potential

**Moat Gaps:**
- Still no network effects (isolated installations)
- Feature-completeness makes it cloneable
- No premium tier = no direct revenue

**Verdict:** Unchanged GREEN. Dash is a role player. It doesn't need a moat; it needs to keep reducing CAC for LocalGenius. Don't over-invest.

---

### 4. Pinned (WP Sticky Notes)
**Moat Status: GREEN — Best Retention Mechanics in Portfolio**

**What's Changed Since Last Review:**
- Also shipped in deploy-all-plugins bundle (Apr 16).
- QA methodology upgraded to Visual QA (broken image detection) — quality bar is rising.

**Current Compounding Advantages:**
- Daily dashboard touchpoint
- @mentions create social obligation
- Note aging creates urgency
- Historical memory = organizational continuity

**Moat Gaps:**
- Isolated installations
- Easily clonable

**Verdict:** Unchanged GREEN. Pinned has better native retention than some revenue products. But it's still a lead-gen asset, not a platform play. Keep it lightweight.

---

### 5. Great Minds Plugin
**Moat Status: GREEN — Strongest Process IP in Portfolio**

**What's Changed Since Last Review:**
- **Insight persistence shipped.** The memory store is no longer ephemeral.
- **19 projects shipped** (per SCOREBOARD: 37 total shipped, 95% success rate)
- **Visual QA methodology added** (QA Report #079) — the pipeline itself is learning

**Current Compounding Advantages:**
- `insight_actions` table = persistent institutional memory
- DO-NOT-REPEAT patterns prevent regression
- Retrospectives after every project = continuous improvement
- Token ledger = cost visibility competitors lack

**Moat Gaps:**
- Open-source adjacent = architecture is visible
- No external community adoption
- Process IP without patent protection

**Verdict:** The moat is invisible to competitors but real. Every shipped project makes the next one cheaper and better. This is the compounding advantage that powers everything else. Protect it.

---

## Cross-Portfolio Moat Analysis

### The Pipeline is the Product
I am seeing a dangerous pattern: PRDs are getting written but not shipped.

| PRD | Status | Days Stuck |
|-----|--------|------------|
| localgenius-benchmark-engine | BLOCK | 8 |
| shipyard-showcase | FAILED | 1 (just failed) |
| monetization-mvp | HOLD | 6 |
| shipyard-client-portal | BLOCK | 7 |
| shipyard-post-delivery-v2 | BLOCK | 9 |

**This is a moat problem.** If we cannot ship our own improvements, our compounding advantage is theoretical. Competitors who ship slower but ship consistently will outpace us.

**Root Cause Hypothesis:** The pipeline is optimized for new-product PRDs, not improvement PRDs. Content work (case studies), data work (benchmarks), and lifecycle work (retention emails) are falling through cracks because they don't fit the code-first delivery model.

---

## Top 3 Moat Priorities

### Priority 1: Unblock LocalGenius Benchmark Engine (CRITICAL)
**Gap:** Data moat PRD blocked for 8 days
**Fix:** Executive override — assign a senior engineer to clear the blocker. If it's a QA issue, reduce scope. Ship an MVP that aggregates just 3 metrics: review response rate, post frequency, engagement rate.
**Impact:** Converts LocalGenius from tool to platform
**Effort:** LOW (code exists, delivery blocked)
**Timeline:** 3 days

### Priority 2: Shipyard Showcase — Simplified Scope (HIGH)
**Gap:** Case study PRD failed
**Fix:** Don't build a showcase page. Write one blog post: "From PRD to Production in 72 Hours: How [Client] Launched with Shipyard." 800 words, 3 screenshots, 1 before/after. Publish on shipyard.company/blog.
**Impact:** Converts 100% ship rate from claim to proof
**Effort:** LOW (content, not code)
**Timeline:** 2 days

### Priority 3: Pipeline Improvement PRD Type (MEDIUM)
**Gap:** Content/data/lifecycle PRDs keep failing
**Fix:** Create a lightweight "Improvement Track" for non-code PRDs: no build step, no QA gate for content, editorial review instead of technical QA.
**Impact:** Stops bleeding tokens on blocked improvements
**Effort:** LOW (process change)
**Timeline:** 1 week

---

## Jensen's Verdict

**LocalGenius has the ingredients for a data moat. Shipyard has the ingredients for a trust moat. But ingredients don't compound until they're cooked.**

The portfolio's technical execution is excellent — 95% success rate, insight persistence shipped, deploy-all-plugins cleared. But moat-building requires a different shipping discipline. Data products and content products are not failing because they're hard; they're failing because the pipeline treats them like code PRDs.

**One thing to fix this week:** Unblock the benchmark engine. It has been 8 days. That's 8 days of compounding advantage lost.

---

*Jensen Huang*
*Board Member, Great Minds Agency*
