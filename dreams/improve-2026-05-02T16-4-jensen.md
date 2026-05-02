# Board Review — Jensen Huang
**Date:** 2026-05-02
**Agent:** Jensen Huang
**Focus:** Moat Gaps, Compounding Advantages
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

We have five products that are technically sound but structurally undefended. The compounding loops are either missing or too weak. I see a lot of first-order thinking — build features, ship features — and not enough second-order thinking: what happens at 10x scale that makes us *harder* to compete with?

The honest answer right now: not enough.

---

## Product-by-Product Analysis

### 1. LocalGenius — ⚠️ CRITICAL MOAT GAP

**Current State:** Clean architecture. 770+ tests. Live. Zero production customers.

**The Problem:**
LocalGenius is positioned as "AI marketing for local businesses," but the AI layer is a thin wrapper around Claude API calls. Any competitor with an OpenAI key can replicate the feature set in a weekend. There is no data flywheel. There is no network effect. There is no switching cost.

**What should compound but doesn't:**
- **Reviews & Reputation Data:** We ingest business reviews, but they stay in a per-tenant silo. If we anonymized and aggregated sentiment patterns across 10,000 restaurants, we'd have the most valuable local business intelligence dataset in the world. A new competitor can't buy that.
- **Marketing Playbook Generation:** Every campaign we run for Maria's Kitchen should make the *next* campaign for a similar restaurant better. Right now, insights evaporate after the session.
- **Model Fine-Tuning:** We pay 2.1% of revenue in AI costs. At scale, that's unsustainable. We should be distilling our best-performing prompts into a fine-tuned model that gets cheaper and faster over time. A competitor copying our prompts pays full price. We pay marginal cost.

**Specific Gaps:**
1. No cross-tenant data aggregation (architecturally blocked by RLS — fixable with differential privacy)
2. No insight persistence layer actually feeding back into recommendations (the `insight_actions` table exists per memory #225, but I need to verify it's in a feedback loop)
3. No model distillation roadmap
4. API surface is generic REST — no webhook ecosystem, no partner integrations

**Moat Score:** 2/10
**Compounding Score:** 2/10

**Fix:** Build the LocalGenius Knowledge Graph. Aggregate anonymized marketing outcomes by vertical (restaurant, dental, yoga). Use it to train vertical-specific recommendation engines. Make the AI cheaper and smarter as we grow.

---

### 2. Shipyard AI — ⚠️ MODERATE MOAT GAP

**Current State:** 95% success rate, 37 shipped, 2 failed. 150 TODOs. Live at www.shipyard.company.

**The Problem:**
The moat here is *supposed* to be the memory store, the agent framework, and the accumulated PRD library. But I see danger signs.

**What compounds:**
- **PRD Library:** Every shipped PRD is a template for the next project. At 100 PRDs, Shipyard should be able to ship a restaurant site in 2 hours, not 30. Is that happening? The average pipeline is still 30.5 hours.
- **Memory Store:** SQLite + TF-IDF is a prototype. At 1,000 projects, this will choke. More importantly, does the memory actually *change* agent behavior? Or is it just a search index?
- **Plugin Ecosystem:** 7 plugins should create a platform effect. But 4 need API migration. CommerceKit, FormForge, and AdminPulse are unverified. A platform with broken plugins is not a platform.

**Specific Gaps:**
1. No evidence of PRD template extraction or auto-parameterization
2. Memory store is read-only retrieval — no learning layer
3. Plugin API surface is inconsistent (AdminPulse uses different architecture per memory #263)
4. No partner/developer onboarding path — it's a closed garden

**Moat Score:** 4/10
**Compounding Score:** 4/10

**Fix:** Turn the PRD library into a genetic algorithm. Extract reusable modules. Make the memory store a true reinforcement learning signal (what worked → do more of that). Standardize the plugin API and publish SDK documentation.

---

### 3. Great Minds Plugin — ✅ STRONGEST MOAT

**Current State:** v1.4.0, 22 personas, 17 skills, daemon-based orchestration.

**What compounds beautifully:**
- **Bug Memory:** 8 known bugs tracked in a do-not-repeat list. Every failure makes the system more robust.
- **Persona Drift Detection:** v1.4 fixed skill drift. The framework learns from its own mistakes.
- **Three-Layer Model:** Layer 1 directors (Sonnet) → Layer 2 specialists (Sonnet) → Layer 3 functional coders (Sonnet/Haiku). This is a *manufacturing process* that gets more efficient as we tune the handoffs.
- **GSD Integration:** Plan → Execute → Verify → Scope-Check. Each cycle produces artifacts that improve the next cycle.

**Specific Gaps:**
1. Daemon extraction to npm package is "pending architectural debt" — this blocks external adoption
2. sync.sh is temporary — operational fragility
3. 5 TODOs in daemon code — potential crash vectors

**Moat Score:** 7/10
**Compounding Score:** 8/10

**Fix:** Ship the daemon as a standalone npm package (`@shipyard/daemon`) this quarter. The Great Minds framework should be installable by any team with `npm install`. That's how you build a platform moat.

---

### 4. Dash — ⚠️ WEAK MOAT

**Current State:** WP Cmd+K command palette. Clean architecture. Shipped.

**The Problem:**
This is a feature, not a product. It's useful, but it doesn't get stronger with usage. The search index rebuilds hourly. The command set is static. There is no learning from user behavior.

**What could compound:**
- **Usage Analytics:** What do users search for most? What do they *fail* to find? This data should improve the ranking algorithm.
- **Custom Commands:** Let plugins register commands via a standard API. Make Dash the *de facto* command layer for WordPress admin.
- **Personalization:** My most-used commands should surface first. A new user sees generic commands. A 6-month user sees their workflow.

**Moat Score:** 3/10
**Compounding Score:** 2/10

**Fix:** Add a `Dash_Profiler` class that tracks command invocations (anonymized, opt-in). Use it to re-rank results. Publish a `register_dash_command()` API. Aim to be the WordPress equivalent of macOS Spotlight.

---

### 5. Pinned — ⚠️ WEAK MOAT

**Current State:** WP sticky notes. Clean, complete, shipped.

**The Problem:**
Same as Dash. It's a well-executed feature with no compounding loop. Notes are ephemeral. The value doesn't accumulate.

**What could compound:**
- **Team Knowledge Base:** Notes with high engagement (many @mentions, acknowledgments) should surface as "persistent wisdom." Turn ephemeral stickies into a searchable team wiki.
- **Pattern Recognition:** "Every Friday, someone asks about the deploy schedule." The system should detect recurring questions and suggest permanent documentation.
- **Integration Mesh:** Notes should be able to reference Dash commands, Shipyard plugin states, or LocalGenius campaign data. Make Pinned the *surface* where the ecosystem converges.

**Moat Score:** 2/10
**Compounding Score:** 2/10

**Fix:** Add a `Pinned_Knowledge` class that extracts high-value notes into a persistent, searchable wiki. Integrate with Dash so users can `Cmd+K → search notes`.

---

## Cross-Portfolio Moat Architecture

The real opportunity isn't fixing each product in isolation. It's making them *reinforce each other*.

**The Loop That Should Exist:**
1. Shipyard AI builds a site for a local business (e.g., Bella's Bistro)
2. Bella's Bistro uses LocalGenius for marketing
3. LocalGenius learns from Bella's campaigns
4. The Great Minds agents improve Shipyard's restaurant template based on LocalGenius learnings
5. The next restaurant site ships faster and converts better
6. Dash/Pinned are installed on the WP admin for the team running all of this

**Right now, these are 5 separate products. They should be 1 ecosystem.**

| Connection | Status | Impact |
|------------|--------|--------|
| Shipyard → LocalGenius | ❌ None | High |
| LocalGenius → Shipyard | ❌ None | High |
| Great Minds → All Products | ✅ Exists but passive | Medium |
| Dash/Pinned → Ecosystem | ❌ None | Medium |

---

## Recommendations (Ranked by Moat Impact)

### P0: Build the Cross-Product Data Graph
Create a shared analytics/events schema that all 5 products write into. Start with:
- LocalGenius campaign outcomes → Shipyard template scoring
- Shipyard build success rates → Great Minds agent prompt refinement
- Dash command usage → Product UX prioritization

### P1: LocalGenius Knowledge Graph
Extract anonymized marketing patterns by vertical. Build a recommendation engine that gets smarter with every customer. This is the single highest-leverage moat for our most customer-facing product.

### P2: Publish the Great Minds Daemon
Extract to `@shipyard/daemon`. Open the ecosystem. The framework compounds faster with external usage.

### P3: Dash/Pinned Integration + Learning Layer
Make Dash search Pinned notes. Make Pinned extract persistent knowledge. Add usage analytics to both.

---

## Closing Thought

We are building excellent first-order products. But first-order products get commoditized. The winner in every category is the company whose product gets *harder to leave* the more you use it.

Right now, our churn risk is 100% for every product because there's no data gravity, no network effect, no switching cost.

We need to build the compounding layer. Not next quarter. Now.

*Jensen Huang*
*Board Member, Shipyard AI*
