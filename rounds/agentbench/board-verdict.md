# Board Verdict: AgentBench/Proof

**Date:** 2026-04-12
**Reviewers:** Jensen Huang (NVIDIA CEO)
**Status:** Final Consolidated Verdict

---

## Points of Agreement Across Board Members

### 1. The Problem Space Is Real
All reviewers agree that AI agent testing is a genuine, unsolved problem. Developers are shipping agents without proper testing, and the market is wide open.

### 2. Local-First Architecture Is Correct
Unanimous alignment that tests should run on-machine, data stays private. "Privacy is a moat and a business model." No hosted evaluation API in v1.

### 3. The Name "Proof" Is Right
Rebrand from AgentBench to Proof is locked. `npx proof` captures the essence: confidence, certainty, a verb and a noun.

### 4. LLM Evaluation Must Be Opt-In
First run works without API keys. Deterministic evaluators (`contains`, `does_not_contain`, `json_schema`) by default. Semantic evaluation unlocks with `--llm` flag.

### 5. Parallel Execution Is Table Stakes
Sequential LLM calls (~1s each) make the framework unusable. Parallel execution ships in v1, non-negotiable.

### 6. Terminal-First, No Dashboard
"Dashboards are where focus goes to die." The terminal is sacred space. No web UI in v1 (Elon: "No web UI ever").

---

## Points of Tension

### 1. Delivery Gap: Foundation vs. Function
**Current state:** ~40% delivered. Config parser, CLI scaffolding, HTTP adapter, subprocess adapter, error handling, TypeScript setup are done.

**Critical missing pieces:**
- Test executor (the actual core loop)
- Evaluators (contains, sentiment, matches_intent)
- LLM integration (Anthropic SDK unused)
- Output formatters
- Example configs
- Tests for the testing framework

**Tension:** The foundation is solid but the product doesn't actually work. This is scaffolding, not software.

### 2. Scaffolding Command (`npm init proof`)
- **Steve:** Essential for first 30-second magic, converts skeptics
- **Elon:** Scope creep, README copy-paste suffices
- **Resolution:** Cut from v1 (Elon wins)

### 3. Confidence Scores
- **Steve:** Ship in v1. LLM outputs are probabilistic. 51% confidence != 98% confidence.
- **Elon:** False precision. Pass/fail is honest.
- **Resolution:** Tiered display (HIGH/MEDIUM/LOW) ships (Steve wins with compromise)

### 4. Moat and Data Flywheel
**Jensen's critical concern:** Zero compounding advantages being built.
- No evaluation datasets being collected
- No evaluator model fine-tuning path
- No failure pattern taxonomy
- Each customer's tests are siloed

**Tension:** Building a commodity before building the moat.

### 5. AI Leverage Underutilization
**Jensen scores C+.** Using LLM-as-judge is table stakes, but missing:
- Test generation from system prompts
- AI-powered failure diagnosis
- Prompt optimization suggestions
- Adversarial test generation

---

## Overall Verdict

# HOLD

**Not REJECT because:**
- Problem space is validated and real
- Technical foundation is solid
- Design decisions are well-reasoned
- Clear product vision exists

**Not PROCEED because:**
- Core functionality (test executor, evaluators) is missing
- Product doesn't actually work yet
- No moat or compounding advantages being built
- AI leverage is underutilized (using AI as fancy string matcher)

---

## Conditions for Proceeding

### Immediate (Before Next Review)

1. **Ship a Working MVP**
   - Test executor must be functional
   - Basic evaluators (`contains`, `does_not_contain`, `json_schema`) must work
   - At least one LLM evaluator (`matches_intent` or `sentiment`) must work
   - CLI must run tests end-to-end

2. **Dogfood the Framework**
   - Write tests for Proof using Proof
   - Document real bugs caught during development

3. **Example Config + Documentation**
   - Working `proof.yaml` example
   - README with copy-paste quick start that actually works

### Short-Term (v1.1 Planning)

4. **Instrument for Data Collection**
   - Plan how test runs will be logged (with consent)
   - Design schema for evaluation dataset
   - This is the foundation of the moat

5. **Test Generation POC**
   - Prototype `proof init --analyze` that reads agent code and suggests tests
   - This is the "wow" moment that differentiates Proof

### Medium-Term (Platform Vision)

6. **Define the Flywheel**
   - Evaluation data -> Better evaluator model -> Better evaluations -> More users -> More data
   - Plan hosted evaluation tier architecture (multi-tenant from start)

7. **Evaluator Marketplace Roadmap**
   - Community-contributed evaluators
   - Domain-specific packages (`@proof/safety-eval`, `@proof/medical-compliance`)

---

## Summary

**Score:** 5/10 (Jensen's assessment stands)

**Justification:** Solid problem space, correct architectural decisions, good design debates—but the product doesn't work yet and no moat is being built. The scaffolding is excellent; now build the house.

**Next milestone:** Ship a working CLI that runs tests, catches failures, and outputs results. That's the table stakes. Then instrument for the data flywheel that turns this from a product into a platform.

---

*"You're building a regression testing framework for AI agents. The concept is sound—but you're building a commodity before you've built the moat."* — Jensen Huang

*"Ship it."* — Steve Jobs

*"Build the thing that works, not the thing that sounds impressive."* — Elon Musk

---

**Verdict:** HOLD pending functional MVP delivery.
