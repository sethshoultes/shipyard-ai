# Board Review — Jensen Huang
## featureDream IMPROVE Cycle | 2026-04-30
## Lens: Moat Gaps & Compounding Advantages

---

## Executive Summary

**Verdict: We have built convenience, not conviction.**

Five products reviewed. One has architectural depth worth defending (Great Minds). One has *designed* moats that were never shipped (LocalGenius). The rest are undifferentiated by any standard I would apply to a Series A memo. The honest assessment: our compounding advantage is not compounding. It is not even linear. In several cases, it is negative — we are shipping backend infrastructure and calling it product, which means our "moat" is actually a debt of unfulfilled promises.

---

## Product-by-Product Moat Analysis

### 1. Shipyard AI (www.shipyard.company)

**Current Moat: None. Process is not IP.**

The 7-stage pipeline with 14 named personas is clever marketing. It is not a moat. Any competitor can clone the *idea* of multi-agent orchestration in a weekend. The *execution* is harder, but that is operational excellence, not defensibility.

What would make it a moat:
- **Proprietary training corpus**: Every shipped site teaches the models something about Emdash CMS patterns. We are not capturing this. 60+ PRDs in `/prds/` — where is the fine-tuned model?
- **Template network effects**: 500th site should build faster than 5th. Token budgets are flat. There is no learning curve in the system.
- **Customer site performance data**: We build sites, then abandon them. No analytics dashboard. No performance benchmarking across the fleet.

**Critical gap**: The auto-pipeline exists in GitHub Actions but has **never been tested end-to-end**. If the autonomous pipeline is the core value prop, and it is unverified, we are selling a theorem, not a product.

**Compounding score: 2/10.** We are accumulating projects, not advantages.

---

### 2. LocalGenius (localgenius.company)

**Current Moat: Negative.**

This is the most frustrating review in my portfolio. The team *designed* three genuine moat features and shipped zero:

| Designed Moat | Status | Competitive Value |
|---------------|--------|-----------------|
| Benchmark Engine | ❌ Not built | High — "You're #3 of 47 Italian restaurants" is proprietary data |
| Business Journal | ❌ Not built | High — labeled training data no competitor can replicate |
| FAQ Template Network Effects | ❌ Not built | Medium — 500th plumber gets better FAQs than 5th |

What shipped instead: Cloudflare Workers, KV caching, Stripe billing, and a weekly digest email. All of this is cloneable in 48 hours. I have seen this pattern before — teams confuse "we built something hard" with "we built something defensible." The backend is well-engineered. It is also irrelevant to competitive positioning.

**The compounding clock is running backward.** Every week of delay on the Benchmark Engine is a week where competitors can catch up. Worse: we have zero customers, which means zero data accumulation. A moat with no water is just a ditch.

**Compounding score: 1/10.** Architecture without data is not a moat. It is a foundation with no house.

---

### 3. Dash (WP Command Palette / Team Notes)

**Current Moat: None. Commodity WordPress module.**

Dash is a custom post type with a status dropdown. This is textbook WordPress boilerplate. The `@mention` support referenced in the spec does not exist in code. The activity log records "updated" without capturing what changed. There is no API, no webhook, no integration surface.

**What would create moat:**
- Real-time collaboration layer (Operational Transform or CRDT)
- Cross-site analytics ("Teams using Dash resolve 40% more notes")
- AI-suggested statuses based on note content

None of this exists. The plugin is fine. It is not defensible.

**Compounding score: 1/10.**

---

### 4. Pinned (WP Sticky Notes / Agreements)

**Current Moat: None. Slightly better than Dash, still commodity.**

Checklist meta boxes on a custom post type. The bookmark/pin system referenced in the spec is not implemented. No template system. No version comparison. No e-signature integration.

**What would create moat:**
- Template marketplace (community-generated agreement templates)
- E-signature integration (DocuSign/HelloSign) with audit trail
- Cross-business analytics (benchmarking clause completion times)

**Compounding score: 1/10.**

---

### 5. Great Minds Plugin

**Current Moat: Moderate. Architecture is the moat.**

This is the only product with genuine technical differentiation. The three-layer architecture (directors → specialists → functional writers/reviewers), worktree isolation for parallel agents, crash recovery with exponential backoff, and the memory store with embeddings — these are non-trivial engineering achievements.

**But**: The moat is the *framework*, not the *products it builds*. If competitors adopt Claude Code and build their own agent orchestration, our advantage narrows. The daemon resilience and hung-agent detection are operational moats, not product moats.

**What would deepen the moat:**
- **Fine-tuned models** trained on the 60+ PRDs and debate transcripts in `/rounds/`
- **Bug memory embeddings** — the 8 known bugs should actively guide new projects via vector search
- **Multi-tenant memory** — Team-level memory stores so agencies cannot replicate the individual experience without the collective wisdom

**Compounding score: 6/10.** Best in portfolio, but still vulnerable to OpenAI/Anthropic building similar orchestration.

---

## Cross-Portfolio Synthesis

| Product | Moat Score | Root Cause |
|---------|-----------|------------|
| Shipyard AI | 2/10 | Selling process, not proprietary data |
| LocalGenius | 1/10 | Designed moats never shipped |
| Dash | 1/10 | Commodity CPT plugin |
| Pinned | 1/10 | Commodity CPT plugin |
| Great Minds | 6/10 | Architecture is real, but not productized |

**Pattern identified**: We ship infrastructure and call it product. Backend services, database schemas, and API endpoints are not moats. Customers do not buy Cloudflare Workers. They buy outcomes that improve with time and scale.

---

## Recommendations (Ranked by Moat Impact)

### 1. Ship the LocalGenius Benchmark Engine IMMEDIATELY
This is the highest-leverage moat in the entire portfolio because the data becomes more valuable with every restaurant added. It was designed. It was approved. It was never built. The team has been running architecture sprints for six iterations. Stop. Build the thing that creates a data flywheel.

### 2. Capture Shipyard AI's Project Corpus as Training Data
60+ PRDs. Hundreds of debate transcripts. This is a proprietary dataset no competitor has. Fine-tune a model on Emdash CMS patterns. The first-mover advantage in an empty marketplace becomes real when the mover actually *learns* from each move.

### 3. Extract Great Minds Bug Memory as Active Vector Guidance
The 8 known bugs in the buglog should be embedded and retrieved at plan-time. This turns operational pain into compounding wisdom. Every failure that is not encoded into the system is a failure that will repeat.

### 4. Kill or Commoditize Dash and Pinned
These plugins do not deserve senior engineering attention. They are competent WordPress modules. Spin them out to junior contributors or sunset them. They are diluting focus from the two products that could matter (Shipyard, LocalGenius).

---

> **Bottom line**: I do not invest in companies with no moat. Right now, that describes 80% of this portfolio. The good news: the moat features are already designed. The bad news: design is not defensibility. Ship the moat, or admit we are a services business.
