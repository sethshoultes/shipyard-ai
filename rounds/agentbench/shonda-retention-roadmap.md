# Shonda Retention Roadmap: What Keeps Users Coming Back

**Product:** Proof (formerly AgentBench)
**Version:** v1.1 Features & Retention Strategy
**Date:** 2026-04-12

---

## The Emotional Core

> *"We're not selling a testing framework. We're selling confidence. We're selling the moment when you push to main and you're not afraid."* — Steve Jobs

**The feeling we're protecting:** That exhale after all tests pass. The ability to sleep at night knowing your AI won't break.

---

## What Keeps Users Coming Back

### 1. The Ritual: Pre-Deploy Certainty

**Hook:** `npx proof` becomes muscle memory before every deploy.

**Retention mechanic:**
- Fast feedback loop (parallel execution, sub-5s for typical suites)
- Beautiful, screenshot-worthy output
- Zero friction to run (no API keys needed for basic checks)

**Emotional payoff:** The green checkmarks are a dopamine hit. Each passing test is validation that you didn't break anything.

### 2. Progressive Disclosure of Power

**Hook:** Start with string matching, graduate to semantic evaluation.

**Retention mechanic:**
- Day 1: `contains`, `does_not_contain` — free, fast, works offline
- Day 7: Try `--llm` flag for `matches_intent` — first taste of magic
- Day 30: Build complex semantic test suites, can't imagine going back

**Emotional payoff:** Each new capability feels earned, not overwhelming.

### 3. The Safety Net Effect

**Hook:** Catch the regression before production catches you.

**Retention mechanic:**
- First time Proof catches a bug you would have shipped = permanent conversion
- That "holy shit" moment when you realize your prompt change broke 3 tests
- Screenshot + share in team Slack = social proof and internal champions

**Emotional payoff:** Proof becomes the safety net you didn't know you needed.

### 4. The Test Suite as Documentation

**Hook:** Your tests describe your agent's expected behavior better than any README.

**Retention mechanic:**
- New team members read `proof.yaml` to understand what the agent does
- Tests become the source of truth for agent behavior
- Updating tests = updating documentation

**Emotional payoff:** Pride in well-documented, well-tested agents.

---

## v1.1 Features

### Tier 1: Essential Additions

#### 1. Test Generation (`proof init --analyze`)
**What:** AI analyzes your agent's system prompt and generates starter test cases.

**Why it matters:**
- Eliminates blank-page paralysis
- "50 edge cases your agent should handle" is 10x magic
- Converts skeptics who don't want to write tests manually

**Implementation:**
```bash
proof init --analyze ./agents/support-bot.ts
# Output: Generated proof.yaml with 12 test cases based on your agent's behavior
```

#### 2. GitHub Action
**What:** Official GitHub Action for CI integration.

**Why it matters:**
- Users have been demanding this (Elon: "when users demand it, you've earned the right")
- Block PRs that break agent behavior
- Proof in CI = Proof as gate = Proof as requirement

**Implementation:**
```yaml
- uses: proof-ai/action@v1
  with:
    config: ./proof.yaml
    anthropic-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

#### 3. Failure Diagnosis
**What:** When a test fails, AI explains WHY and suggests a fix.

**Why it matters:**
- "Test failed: Expected friendly greeting, got curt response" → "Your agent's temperature may be too low, or the system prompt is missing tone guidance"
- This is where AI 10x's the outcome (Jensen's feedback)

**Implementation:**
- Opt-in via `--diagnose` flag
- One additional LLM call per failure
- Actionable, specific suggestions

### Tier 2: Power User Features

#### 4. Trend Analysis & Regression Alerts
**What:** Track test pass rates over time, alert on regressions.

**Why it matters:**
- "Your agent's sentiment scores dropped 15% after last week's prompt change"
- Historical context for agent quality
- Foundation for enterprise tier

**Implementation:**
- Local SQLite database for history
- `proof history` command
- Optional webhook/Slack alerts

#### 5. Watch Mode (Reconsidered)
**What:** Run tests automatically on file changes during development.

**Why it matters:**
- Cut from v1 as "nobody watch-modes agent tests"
- Reconsider for prompt engineering workflows where rapid iteration matters
- Make it opt-in and fast (only deterministic checks by default)

#### 6. Multiple Config Files
**What:** Support `proof/*.yaml` pattern for organized test suites.

**Why it matters:**
- Large projects need organization
- `proof/customer-support.yaml`, `proof/billing-agent.yaml`, etc.
- Run subsets: `proof run customer-support`

### Tier 3: Platform Features

#### 7. Evaluator Plugins
**What:** Community-contributed evaluators installable via npm.

**Why it matters:**
- `@proof/safety-eval` — Check for harmful outputs
- `@proof/medical-compliance` — HIPAA-aware evaluation
- `@proof/financial-accuracy` — Numerical precision checks
- This is the platform play (Jensen: "Evaluator Marketplace")

**Implementation:**
```yaml
evaluators:
  - npm: @proof/safety-eval
    check: no_harmful_content
```

#### 8. Benchmark Mode
**What:** Standardized benchmarks for agent categories.

**Why it matters:**
- "Customer Support Agent Benchmark v1"
- Compare your agent to industry standards
- Foundation for certification business model

**Implementation:**
```bash
proof benchmark customer-support
# Running 50 standard tests...
# Your agent scored 87/100 (Above Average)
```

---

## Retention Metrics to Track

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **D1 Retention** | 40%+ | First run to second run = product clicked |
| **D7 Retention** | 25%+ | Weekly ritual established |
| **D30 Retention** | 15%+ | Proof is part of workflow |
| **Time to First Test** | <60s | First 30 seconds is everything |
| **Tests per Active User** | 10+ | Investment = stickiness |
| **LLM Opt-in Rate** | 30%+ | Semantic evaluation is the moat |
| **Share/Screenshot Rate** | Track | Viral coefficient |

---

## The Retention Loop

```
Install Proof (Day 1)
    ↓
Run first test, see green checkmark (Time to Value: <60s)
    ↓
Add to existing agent project (Day 3)
    ↓
Catch first regression (The "holy shit" moment)
    ↓
Share with team, add to CI (Day 7-14)
    ↓
Try semantic evaluation (--llm flag)
    ↓
Build comprehensive test suite (Day 30)
    ↓
Team standardizes on Proof
    ↓
Upgrade to enterprise features (Trend analysis, team dashboard)
```

---

## What We're NOT Building (Yet)

| Feature | Why Not Now |
|---------|-------------|
| **Web Dashboard** | Terminal-first. Don't dilute focus. |
| **Hosted Evaluation API** | Local-first is the moat. Instrument for it, don't build it yet. |
| **Multi-turn Conversation Testing** | "Crutch for fuzzy thinking." Single-turn forces clarity. |
| **SDK/Hook Adapters** | HTTP + subprocess covers 99%. |
| **Real-time Monitoring** | Testing framework, not observability platform. |

---

## The v1.1 Promise

**Ship:**
1. Test Generation (`proof init --analyze`) — The "wow" moment
2. GitHub Action — CI integration users are demanding
3. Failure Diagnosis — AI that explains why, not just what

**Instrument:**
4. Anonymous usage analytics (opt-in) for product decisions
5. Evaluation data collection for future evaluator model

**Plan:**
6. Evaluator marketplace architecture
7. Enterprise tier feature set

---

## Summary

Retention comes from three things:

1. **The Ritual** — `npx proof` before every deploy becomes muscle memory
2. **The Safety Net** — The first time Proof catches a bug creates permanent converts
3. **The Investment** — Each test written deepens commitment; switching costs grow

v1.1 accelerates all three:
- Test generation lowers barrier to investment
- GitHub Action makes the ritual automatic
- Failure diagnosis makes the safety net smarter

**North Star:** Every AI engineer ships with Proof. It's not optional. It's just how you test agents.

---

*"The ability to sleep at night knowing your AI won't break."*
