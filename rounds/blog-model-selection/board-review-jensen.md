# Board Review: blog-model-selection
**Reviewer:** Jensen Huang, NVIDIA
**Date:** 2026-04-15

---

## Score: 4/10
Optimization playbook, not platform. Shareable tactic, not defensible moat.

---

## What's the moat? What compounds over time?

**Current state:** None.

- Blog post shares operational learnings
- Model selection per phase = good engineering, not IP
- Everyone copies this in 48 hours
- TERSE optimization is obvious once stated
- No data flywheel, no network effects, no proprietary advantage

**What compounds:** Nothing. Static content that ages out.

---

## Where's the AI leverage? Are we using AI where it 10x's the outcome?

**Missed opportunity:** Blog post ABOUT AI, not POWERED BY AI.

- Should be eating our own dog food
- Auto-generate cost calculators from real pipeline data
- Build interactive model selection advisor
- Embed live SDK code examples that adapt to user's stack
- Generate custom TERSE templates per use case

**Current leverage:** Zero. Human writes markdown. AI mentioned, not employed.

---

## What's the unfair advantage we're not building?

**Missing platform play:**

1. **Model Selection API**
   - Expose cost/accuracy trade-off engine as service
   - Ingest user pipelines, recommend model per phase
   - Learning loop: more pipelines → better recommendations
   - Competitive moat: proprietary dataset of phase → model mappings

2. **TERSE Format Library**
   - Community-contributed output templates
   - GitHub repo with 1000+ TERSE patterns
   - Auto-generates instruction prompts from format specs
   - Network effect: more templates → more users → more templates

3. **Pipeline Cost Profiler**
   - SDK middleware that tracks spend per phase
   - Surfaces optimization opportunities
   - Aggregates anonymized data for benchmarking
   - Data moat: industry cost baselines no competitor has

4. **Agent Marketplace**
   - Pre-tuned agents with proven model selections
   - Community ratings on accuracy/cost
   - One-click import into pipelines
   - Platform lock-in: hard to migrate agent library

**What we built:** Blog post. Gives away insights, captures zero value.

---

## What would make this a platform, not just a product?

**Transform content into infrastructure:**

### Option A: Model Router Service
- Deploy selection logic as hosted API
- Developers call `router.selectModel(phase, task)`
- Returns optimal model + TERSE template
- Monetize per API call or subscription
- Defensibility: recommendation quality improves with usage data

### Option B: Agent SDK Marketplace
- Extend Claude Agent SDK with model selection DSL
- Publish verified agents (plan-sonnet, review-haiku, etc.)
- Usage telemetry feeds recommendation engine
- Freemium: basic agents free, optimized agents paid
- Defensibility: community + data network effects

### Option C: Cost Optimization Platform
- SaaS dashboard for multi-agent pipeline costs
- Visualizes spend per phase, suggests model swaps
- A/B tests model changes, measures impact
- Enterprise tier with custom model fine-tuning
- Defensibility: proprietary cost/performance datasets

**Current deliverable:** Educational content. Zero platform potential.

---

## Strategic gaps:

- **No proprietary data collection** - Insights shared, data uncaptured
- **No API surface** - Can't integrate, can't monetize
- **No community loop** - Knowledge flows out, nothing flows back
- **No lock-in** - Readers implement elsewhere, we get nothing
- **No measurement** - Can't prove ROI, can't optimize

---

## What I'd build instead:

**Shipyard Model Advisor** (2-week sprint):

1. Open-source SDK plugin: `@shipyard/model-advisor`
2. Decorators: `@UseSonnet`, `@UseHaiku`, `@AutoSelect`
3. Auto-instruments pipelines, logs phase costs
4. Local CLI shows optimization recommendations
5. Optional: upload anonymized telemetry for better recs
6. Freemium SaaS dashboard with team analytics

**Moat:** Data compounds. More usage → better model selection → more adoption.

**Leverage:** AI recommends model selection based on 10,000 real pipelines.

**Platform:** Open core (SDK) + paid cloud (analytics/enterprise).

---

## Bottom line:

Blog post = content marketing.
Content marketing ≠ sustainable advantage.

Good writing. Good insights. **Wrong deliverable.**

Build the advisor tool. Open-source it. Capture telemetry. Launch SaaS tier. THEN write blog post showing results.

Order matters. Platform first, content second.

---

**Recommendation:** Shelve blog post. Build `@shipyard/model-advisor` SDK. Launch with blog post as proof case study showing 93% cost reduction using our own tool.

Turn playbook into product. Turn product into platform.

Otherwise this is free consulting for competitors.
