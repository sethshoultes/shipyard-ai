# Retrospective: AgentBench → Proof

**Author:** Marcus Aurelius
**Date:** 2026-04-12
**Verdict:** HOLD (5/10)

---

## What Worked Well

### 1. The Dialectic Process Produced Clarity

The structured debate between Steve and Elon worked. Two rounds of genuine conflict—name, confidence scores, scaffolding, parallel execution—led to decisions that neither would have reached alone. Steve's insistence on "Proof" gave the product identity. Elon's demand for parallel execution caught a fatal flaw before it shipped. The tension was productive; the synthesis was stronger than either thesis.

### 2. Essence Capture Was Sharp

"The ability to sleep at night knowing your AI won't break." This single line anchored every decision. When debates wandered, the essence pulled them back. The feeling (confidence, the exhale) and the one thing that must be perfect (first 30 seconds) gave the team a compass. This is what good product definition looks like.

### 3. Scope Discipline Was Ruthless

Eleven features were locked. Eight were explicitly cut: scaffolding, watch mode, dashboard, SDK adapters, custom evaluators, multiple output formats, hosted API, retry logic. The team said no more often than yes. This is rare. This is valuable. The decisions.md document is a model of what locked decisions should look like.

### 4. Design Debates Were Substantive, Not Political

Steve's case for confidence scores wasn't vanity—it was an argument about the probabilistic nature of LLM evaluation. Elon's case for cutting was about false precision. Phil's resolution (tiered display: HIGH/MEDIUM/LOW) honored both concerns. This is what productive disagreement looks like: positions with reasons, not egos defending territory.

### 5. The Retention Roadmap Showed Long-Term Thinking

Shonda's document demonstrates that someone was thinking beyond v1. The emotional hooks, the progressive disclosure model, the "holy shit" moment when Proof catches a real bug—this is user psychology understood. The loop from install to team standardization is mapped. The North Star is clear.

---

## What Didn't Work

### 1. The Product Was Not Delivered

This is the fundamental failure. ~40% complete. The test executor—the core loop—was not built. The evaluators were not built. The LLM integration was not built. We have scaffolding, not software.

A working CLI that runs zero tests is not an MVP. It is a README with build scripts. Jensen's assessment is correct: "This is scaffolding, not software." The process produced excellent decisions about what to build, but did not actually build the thing.

### 2. Planning Consumed Execution Time

Two rounds of Steve/Elon debate. Phil's consolidation. Jensen's board review. Shonda's retention roadmap. The documentation is extensive and well-crafted. But somewhere between round 1 and round 2, the balance tipped from "necessary clarity" to "planning as procrastination."

The test executor could have been built in the time spent debating whether to include watch mode (which was cut anyway). Perfect plans do not ship. Working software ships.

### 3. No Moat Was Built

Jensen identified this clearly. Every test run generates labeled data (input, output, pass/fail). This data could train a faster, cheaper, proprietary evaluation model. Instead, each customer's tests are siloed. No network effects. No flywheel. No compounding advantage.

The team optimized for "local-first" (correct) but failed to architect for "instrument-first" (oversight). Privacy and data collection are not mutually exclusive. The labeled data opportunity was left on the table.

### 4. AI Leverage Was Underutilized

The product uses LLM-as-judge for semantic evaluation. This is table stakes—the minimum to differentiate from regex matching. But:

- No test generation from system prompts
- No AI-powered failure diagnosis
- No prompt optimization suggestions
- No adversarial test generation

The product uses AI where it adds 1.5x value, not 10x. This is a testing framework for AI agents that barely uses AI beyond evaluation. The irony is not lost.

### 5. The Board Review Came Too Late

Jensen's feedback—data flywheel, evaluator model, platform vs. product—would have reshaped the architecture if delivered earlier. Instead, it arrived after the foundation was poured. The hosted evaluation concerns, the benchmark leaderboard opportunity, the evaluator marketplace vision—all of this is post-hoc wisdom that cannot easily retrofit into what was built.

Board reviews should inform design, not critique it after execution. The timing was wrong.

---

## What the Agency Should Do Differently Next Time

### 1. Timebox Debates; Protect Execution

Two rounds of Steve/Elon debate is reasonable. But establish a hard gate: after decisions lock, 70% of remaining time goes to building, not planning. Document the v1.1 roadmap *after* v1 works. Shonda's retention roadmap is excellent, but it was premature—we don't need retention strategy for a product that doesn't function.

**Concrete change:** Mandate that "ship working core" precedes "plan future features." The test executor should have been Day 1 work, before the second debate round.

### 2. Board Review Before Architecture, Not After

Jensen's insights about data flywheels and platform plays should have arrived before the file structure was defined. Instead, the review came after HTTP adapters and subprocess runners were built.

**Concrete change:** Strategic board review happens *before* technical design begins. Tactical board review happens *after* MVP ships. Reverse the order next time.

### 3. Dogfood Earlier

"Write tests for Proof using Proof" was listed as a condition for proceeding. This should have been done during development, not after. If the team had tried to use Proof mid-build, they would have discovered immediately that the test executor didn't exist. Building something you cannot use is a warning sign.

**Concrete change:** The product must be usable by the team before the first review milestone. If it cannot be used, it is not ready for review.

### 4. Architect for Instrumentation from Day One

The data flywheel opportunity was identified but not built. This should be embedded in the initial architecture, not retrofitted. Even with local-first execution, every test run could write to a local SQLite log. That log becomes the foundation for trend analysis, regression alerts, and eventually (with consent) the training data for a proprietary evaluator model.

**Concrete change:** Include "data capture layer" in the initial file structure. Make instrumentation a first-class concern, not a v1.1 afterthought.

### 5. Define "Done" Before Starting

The project reached 40% completion and received a HOLD verdict. But what was the original definition of done? If "done" meant "working CLI that runs tests end-to-end," the project failed. If "done" meant "decisions documented and architecture defined," it succeeded. The ambiguity suggests the goal was never clearly stated.

**Concrete change:** Before any project begins, write a single sentence: "This milestone is complete when [X] works." For AgentBench, that sentence should have been: "This milestone is complete when `npx proof` runs a test suite and outputs pass/fail results."

---

## Key Learning to Carry Forward

**Decisions without delivery are theater; the test executor should have been built before the second debate round.**

---

## Process Adherence Score: 6/10

**Justification:**

| Aspect | Score | Notes |
|--------|-------|-------|
| Essence capture | 9/10 | Sharp, focused, used as compass |
| Debate structure | 8/10 | Two rounds, clear positions, resolutions documented |
| Decision documentation | 9/10 | Locked decisions are exemplary |
| Execution against decisions | 3/10 | Core functionality not built |
| Board review timing | 4/10 | Came after architecture was set |
| Risk identification | 7/10 | Risks noted, but "scope creep" risk materialized as "planning creep" |
| Moat/platform thinking | 4/10 | Identified late, not architected |

The process was followed for deliberation. It was not followed for delivery. A good process includes shipping; this one got lost in refinement.

---

## Final Reflection

There is wisdom in debate. Steve and Elon sharpened each other. The product vision that emerged is cleaner than either started with. But wisdom without action is philosophy, not product.

The emperor who deliberates endlessly while the legions wait is no better than one who marches blindly into ambush. The virtue is in balance: think clearly, then act decisively.

AgentBench—now Proof—has clarity. It lacks existence.

The task now is simple: build the test executor, build the evaluators, run a test, see it pass. Do not add another document until a green checkmark appears in the terminal.

The exhale comes not from planning the breath, but from taking it.

---

*"Waste no more time arguing about what a good man should be. Be one."*
— Meditations, Book X

