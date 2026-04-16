# Board Review: Shipyard Self-Serve Intake
**Reviewer**: Jensen Huang, NVIDIA CEO
**Date**: 2026-04-16
**Verdict**: **4/10** - Good infrastructure work, zero strategic moat

---

## The Moat Question: What Compounds?

**None. This is plumbing.**

- Webhook handler with HMAC validation
- Basic keyword matching for priority detection
- Simple regex for request classification
- GitHub API wrapper with retry logic
- Structured logging

None of this creates defensibility. Any competent engineer replicates this in 48 hours.

**What should compound:**
- Model that learns from closed issues → gets smarter at triage over time
- Repository-specific priority patterns → adapts to each customer's workflow
- Historical accuracy data → continuously improving confidence scores
- Customer feedback loops → self-improving classification

**Current state:** Static keyword maps. No learning. No data flywheel. No moat.

---

## AI Leverage: Where's the 10x?

**Currently using AI:** Nowhere. Zero.

All "intelligence" is hardcoded:
- Priority keywords: `['critical', 'urgent', 'emergency']`
- Request types: regex matching "bug", "feature", "docs"
- Classification: keyword counting with title weight = 2x

**This is 1990s rule-based systems with better logging.**

**Where AI should 10x this:**
- Embedding-based semantic similarity (not keyword matching)
- Few-shot classification from repo's historical issues
- Multimodal analysis (screenshots, error logs, stack traces)
- Context-aware priority (analyzes impact blast radius from codebase)
- PRD generation that references actual repo architecture

**Gap:** Calling this "AI-powered" is false advertising.

---

## Unfair Advantage Not Being Built

**What makes GitHub Copilot valuable?** Training data from billions of repos.

**What makes this valuable?** Access to customer codebases + issue outcomes.

**What we're NOT building:**
1. **Outcome tracking**: Did p0 issues actually ship faster? Were classifications accurate?
2. **Feedback signals**: Customer corrections → model retraining
3. **Cross-repo learning**: Pattern transfer from high-quality repos to new customers
4. **Integration leverage**: Code analysis → priority inference (breaking change = p0, docs typo = p2)
5. **Network effects**: More customers → better models → better value → more customers

**Current implementation:** None of above. Fire-and-forget pipeline.

---

## Platform vs Product

**This is currently a product.** One-shot intake handler.

**To become a platform:**
- **Extensibility**: Plugin system for custom analyzers (security scanner, cost estimator, breaking change detector)
- **Data API**: Expose intake patterns, priority heatmaps, response time metrics
- **Marketplace**: Third-party "analyzers" (Snyk for security, Datadog for infra impact)
- **Developer ecosystem**: SDK for custom classifiers trained on private data
- **Composition**: Chain multiple AI models (triage → scope → estimate → assign)

**Missing infrastructure:**
- No plugin architecture
- No API for external consumption
- No hooks for extending classification logic
- No way for customers to bring their own models

**This handles GitHub webhooks. A platform would orchestrate work assignment across tools.**

---

## What Good Looks Like

Compare to **Linear's triage**:
- Learns from team's past labeling behavior
- Suggests similar issues automatically
- Predicts cycle time based on historical data
- Adapts priority thresholds per team

Compare to **Sentry's issue grouping**:
- Fingerprints errors with ML
- Groups by root cause, not string matching
- Learns from user merges/splits
- Gets smarter with every event

**This project does none of that.**

---

## Specific Technical Gaps

1. **No embeddings**: Priority detection uses `includes()` on strings. Should use sentence transformers.

2. **No personalization**: Same keywords for every repo. Kubernetes repo ≠ marketing site.

3. **No feedback loop**: Bot comments on issues, then... nothing. No tracking if human overrode the classification.

4. **No context window**: Analyzes single issue in isolation. Should consider recent issues, repo health, team velocity.

5. **No confidence calibration**: "Confidence: 0.8" means nothing without validation against ground truth.

6. **Database writes nowhere**: Code has `db.ts` that logs errors to `intake_requests.error_log` but never stores successes. No training data accumulation.

---

## Code Quality Assessment

**What's good:**
- Clean TypeScript with proper types
- Timing-safe HMAC comparison
- Circuit breaker pattern for GitHub API
- Structured logging with request IDs
- 100% test coverage (17/17 passing)

**What's commodity:** All of it. This is senior engineer work, not breakthrough engineering.

**What's missing:**
- ML pipelines
- Model versioning
- A/B testing infrastructure
- Feature stores
- Online learning

---

## Strategic Recommendation

**Stop positioning this as "AI intake".**

It's a **webhook automation tool** with keyword matching. That's fine—but don't claim AI leverage that doesn't exist.

**Two paths forward:**

### Path A: Double down on infrastructure (current trajectory)
- Add more integrations (Slack, Linear, Jira)
- Build beautiful dashboard
- Polish the keyword rules
- **Result:** Nice productivity tool. No moat. Commoditized in 12 months.

### Path B: Build the data engine (the hard thing)
- Instrument outcome tracking religiously
- Build model training pipeline
- Create feedback loops everywhere
- Accumulate proprietary training data
- **Result:** Defensible AI product that improves with scale.

**Choose B or don't do this at all.**

---

## Score: 4/10

**Why not lower?** Implementation is solid. Tests pass. Security is correct. Logging is production-ready.

**Why not higher?** Zero strategic value. No moat. No AI. No data flywheel. No platform.

This is infrastructure work that enables future AI, but currently contains none.

**Analogy:** Building a beautiful train station (this project) vs building the railroad network that creates transportation monopolies (not this project).

Great engineering. Wrong leverage point.

---

**Next Board Meeting Expectation:**

Show me:
1. Accuracy metrics: Classification vs human override rate
2. Model v2: Trained on first 1000 issues
3. Feedback loop: Closed-loop from customer correction → retraining
4. Cross-repo transfer learning: Model improves for new customers using data from existing customers

Or pivot to infrastructure-as-a-service and drop AI positioning.

---

*— Jensen*
