# Board Review — Jensen Huang
**Date:** 2026-05-04
**Agent:** Jensen Huang
**Focus:** Moat Gaps, Compounding Advantages
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

Two days ago I said our churn risk was 100% because we had no data gravity. Today I need to revise that: our churn risk is 100% because some of our "shipped" products don't actually function. A product that fatals on activation has negative moat — it creates word-of-mouth that actively repels future customers.

We also have an identity crisis inside our own portfolio. "Dash" in the WP Intelligence Suite is a team-notes tracker. The actual Cmd+K command palette is named "Beam." If we can't keep our own product names straight, how can we expect users to?

---

## Product-by-Product Analysis

### 1. LocalGenius — ⚠️ STILL CRITICAL, ONE GREEN SHOOT

**Current State:** Architecture remains clean. `insight_actions` table exists in schema. However, per Margaret Hamilton's QA findings, we still have zero production activation of the widget frontend. The knowledge graph I called for on May 2 has not been started.

**New Finding — The Green Shoot:**
`prd-agentpress-2026-05-03.md` shipped. This is a WordPress agent-bridge that could become the integration layer between LocalGenius and every WordPress site we build. If LocalGenius can auto-install via AgentPress, the switching cost goes from zero to " ripping out a plugin that manages my marketing."

**What Still Doesn't Compound:**
- No cross-tenant data aggregation
- No vertical-specific model distillation
- `insight_actions` is still a write-only table — no feedback loop into campaign generation

**Moat Score:** 2/10 → 3/10 (AgentPress is a structural improvement)
**Compounding Score:** 2/10

**Fix This Week:**
Wire `insight_actions` into the campaign generation prompt. Every new campaign for a restaurant should begin with: "Here are the 12 highest-performing subject lines for restaurants in your city." That requires one SQL query and a prompt injection. Do it.

---

### 2. Shipyard AI — ⚠️ MOAT ERODING BY COMPETITION

**Current State:** 37 shipped projects. DNS issue (#98) still in `failed/` — production domain 404ing. `standalone-apps-portfolio-v3.md` completed May 3, which updates the `/work` page with actual app screenshots. That's a real improvement.

**New Finding:**
The PRD library now has enough density that we should be extracting templates automatically. We don't. Every restaurant site still starts from a blank PRD instead of a genetic descendant of Bella's Bistro + Peak Dental + Sunrise Yoga learnings.

**The Memory Store Problem (Confirmed):**
Memory-store is still SQLite + TF-IDF. Read-only retrieval. No reinforcement signal. Every agent makes the same mistakes on project #38 that it made on project #8 because nothing actually learns.

**Moat Score:** 4/10
**Compounding Score:** 3/10 (slipped — template extraction is now overdue)

**Fix This Week:**
1. Resolve issue #98. A 404ing homepage is not a moat. It's a vacuum.
2. Extract the top 10 most common PRD patterns into `templates/auto/` so agents can start from genotype, not blank slate.

---

### 3. Great Minds Plugin — ✅ STRONGEST MOAT, WIDENING

**Current State:** v1.4.0 stable. Daemon running. 27 commits in past 24h. The pipeline is shipping.

**New Finding — Network Effects Emerging:**
The 14-agent constellation is now self-correcting. Margaret Hamilton's QA loop found broken image links in Round 79. The next round, the build agent fixed them without human instruction. That's the first clear evidence of a learning-like signal propagating through the system.

**The Daemon Extraction Blocker:**
Still pending. `sync.sh` between `great-minds-plugin/` and `shipyard-ai/daemon/` is operational debt. Every day we don't ship `@shipyard/daemon` to npm, someone else builds the abstraction layer and captures the ecosystem.

**Moat Score:** 7/10
**Compounding Score:** 8/10

**Fix This Quarter:**
Ship `@shipyard/daemon` v0.1.0 to npm. Even if it's alpha. The moat is the install base, not the code quality.

---

### 4. Dash — ❌ IDENTITY CRISIS + BROKEN SHIPMENT

**Current State:** This requires immediate clarification.

- **Beam** (`projects/commandbar-prd/build/beam/`) is the actual Cmd+K command palette. It works. Clean. 2 files. No build step.
- **Dash** (`deliverables/wp-intelligence-suite/dash/`) is a team-notes tracker with a broken `includes/class-notes-list-table.php` reference. It will fatal on activation.

**We have two products called Dash, one of which is broken.** This is not a moat problem. This is a "we don't know what we shipped" problem.

**Moat Score:** 1/10 (Beam) / 0/10 (WP Intelligence Suite Dash)
**Compounding Score:** 1/10

**Fix Immediately:**
1. Rename the WP Intelligence Suite notes tracker to "Tracker" or "TeamLog." Eliminate the naming collision.
2. Ship `class-notes-list-table.php` or delete the broken reference. A broken plugin is worse than no plugin.

---

### 5. Pinned — ❌ BROKEN SHIPMENT

**Current State:** `deliverables/wp-intelligence-suite/pinned/` references `includes/class-agreements-list-table.php` which does not exist. Fatal on activation.

**The Sticky Notes Product:**
If the user's intent was "WP sticky notes" (sethshoultes/pinned-notes), that repo is not in this codebase. What we have here is an "agreements" tracker with a bookmark metaphor that doesn't actually work.

**Moat Score:** 0/10
**Compounding Score:** 0/10

**Fix Immediately:**
Ship the missing file or delist the plugin. We cannot afford 1-star reviews from users who trusted our "shipped" label.

---

## Cross-Portfolio Moat Architecture: The Real Status

| Connection | Status | Change Since May 2 |
|------------|--------|------------------|
| Shipyard → LocalGenius | ❌ None | AgentPress PRD shipped — potential bridge |
| LocalGenius → Shipyard | ❌ None | No change |
| Great Minds → All Products | ✅ Active | QA loop now self-correcting |
| Beam/Dash → Ecosystem | ❌ None | Beam is standalone, no integration |
| Pinned → Ecosystem | ❌ Broken | Product doesn't load |

---

## Recommendations (Ranked by Moat Impact)

### P0: Stop Shipping Broken Code
Verify every "shipped" deliverable loads without fatal errors. Two broken plugins in the WP Intelligence Suite destroy credibility for the entire portfolio.

### P1: Extract PRD Templates
Auto-generate `templates/auto/restaurant.json`, `templates/auto/dental.json`, `templates/auto/yoga.json` from the example sites. The next project in each vertical should start 80% complete.

### P2: Close the LocalGenius Feedback Loop
Wire `insight_actions` → campaign prompt. One SQL query. One prompt line. 10x improvement in recommendation quality.

### P3: Ship `@shipyard/daemon`
Extract the daemon to npm. Open the ecosystem before someone else does.

---

## Closing Thought

A moat is not a feature list. A moat is the gap between what a new competitor can replicate in a weekend and what we can do because of the distance we've traveled.

Right now, that gap is narrowing — not because competitors are catching up, but because we're leaving broken planks in our own bridge.

Fix the broken planks. Then build the walls.

*Jensen Huang*
*Board Member, Shipyard AI*
