# AgentBench → Proof: Locked Decisions

*Consolidated by Phil Jackson, The Zen Master*

---

## Locked Decisions

### 1. Product Name: **Proof**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve Jobs |
| **Final Vote** | Unanimous (Elon conceded Round 2) |
| **Rationale** | "AgentBench" is forgettable. "Proof" is a verb and noun. `npx proof` becomes the command. The name defines the category in an empty market. |

---

### 2. Parallel Test Execution: **Ships in v1**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Final Vote** | Unanimous (Steve conceded Round 2) |
| **Rationale** | Sequential LLM calls at ~1s latency each = 40s for 20 tests. Unacceptable. "Parallel execution isn't polish. It's table stakes." |

---

### 3. LLM Evaluation: **Opt-in, Not Default**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Final Vote** | Unanimous |
| **Rationale** | First run must work without API key. Default evaluators: `contains`, `does_not_contain`, `json_schema`. Semantic evaluation unlocks with `--llm` flag or when evaluator requires it. Privacy + speed + zero friction. |

---

### 4. Scaffolding Command: **Cut**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 2) |
| **Winner** | Elon Musk |
| **Disputed by** | Steve Jobs (wanted `npm init proof`) |
| **Rationale** | Scaffolding requires template maintenance and debugging. README with copy-paste example ships faster. Converts skeptics via docs, not generators. |

---

### 5. Watch Mode: **Cut**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Final Vote** | Unanimous (Steve conceded Round 2) |
| **Rationale** | "Nobody watch-modes their agent tests. They run them before deploy." |

---

### 6. Dashboard/Web UI: **Cut from v1**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve Jobs |
| **Final Vote** | Unanimous |
| **Rationale** | "Dashboards are where focus goes to die. The terminal is sacred space." Elon goes further: "No web UI ever. Stay in the workflow." |

---

### 7. SDK/Hook Adapter: **Cut**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Final Vote** | Unanimous (Steve conceded Round 2) |
| **Rationale** | HTTP + subprocess covers 99% of cases. SDK adapter is over-engineering for users who don't exist yet. |

---

### 8. Custom Evaluators: **Cut from v1**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Rationale** | `custom: "./evaluators/safety.js"` builds complexity for edge cases. Ship built-in evaluators only. |

---

### 9. Output Format: **JSON Only**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Rationale** | "Markdown is vanity." JSON for programmatic consumption. CLI output handles human readability. |

---

### 10. Local-First Architecture: **No Hosted Evaluation**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Both (aligned from start) |
| **Winner** | Unanimous |
| **Rationale** | "Your tests run on your machine. Your data stays on your machine. Privacy is a moat and a business model." |

---

### 11. Brand Voice: **Terse, Confident, Zero Apologies**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve Jobs |
| **Final Vote** | Unanimous (Elon conceded Round 2) |
| **Rationale** | "Test failed. Here's why." Not "Oops!" or "You might want to consider..." The voice is a senior engineer at 2am. |

---

## Contested Decision (Unresolved)

### Confidence Scores

| Steve's Position | Elon's Position |
|------------------|-----------------|
| Ships in v1. "LLM outputs aren't binary—they're probabilistic. A test that passes with 51% confidence is qualitatively different from 98%." | Cut. "False precision masquerading as insight. Pass/fail is honest. Users won't understand why 73% passes but 72% doesn't." |

**Status:** UNRESOLVED. Requires Phil's ruling.

**Phil's Ruling:** Steve wins. Confidence scores ship in v1 but displayed as tiers, not raw percentages:
- **HIGH** (90%+): Green checkmark
- **MEDIUM** (70-89%): Yellow checkmark with warning
- **LOW** (<70%): Treated as failure with explanation

This preserves Steve's insight (probabilistic nature of LLM evaluation) while addressing Elon's concern (users confused by arbitrary percentages).

---

## MVP Feature Set (v1)

### What Ships

| Component | Description |
|-----------|-------------|
| **CLI** | `npx proof` runs tests. `npx proof --llm` enables semantic evaluation. |
| **Config Parser** | YAML → test definitions |
| **Agent Adapters** | HTTP endpoint + subprocess (inline, no abstraction) |
| **Built-in Evaluators** | `contains`, `does_not_contain`, `json_schema`, `matches_intent` (LLM), `sentiment` (LLM) |
| **Parallel Execution** | All tests run concurrently from day one |
| **LLM Batching** | One Claude call per test (not one per expectation) |
| **Confidence Tiers** | HIGH/MEDIUM/LOW display (not raw percentages) |
| **JSON Output** | `--output json` flag for CI integration |
| **CLI Output** | Colored terminal output, terse error messages |

### What Does NOT Ship

| Cut Feature | Reason |
|-------------|--------|
| `npm init proof` scaffolding | Maintenance burden, docs suffice |
| Watch mode | Nobody watch-modes agent tests |
| Dashboard/Web UI | Terminal is sacred space |
| Custom evaluators (`custom: "./eval.js"`) | Complexity for edge cases |
| SDK/hook adapter | HTTP + subprocess covers 99% |
| Multiple output formats | JSON only |
| Hosted evaluation API | Local-first is the moat |
| Multi-turn conversations | "Crutch for fuzzy thinking" |
| Retry logic | Flaky agents are bugs, not test problems |
| GitHub Action | v1.1 when users demand it |

---

## File Structure (What Gets Built)

```
proof/
├── package.json
├── README.md                    # Copy-paste quick start
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── cli/
│   │   └── run.ts               # Commander.js setup
│   ├── config/
│   │   └── parser.ts            # YAML → test definitions
│   ├── runner/
│   │   ├── executor.ts          # Parallel test execution
│   │   ├── http-adapter.ts      # HTTP endpoint calls (inline)
│   │   └── subprocess-adapter.ts # CLI subprocess calls (inline)
│   ├── evaluators/
│   │   ├── index.ts             # Evaluator registry
│   │   ├── contains.ts          # String contains check
│   │   ├── does-not-contain.ts  # String exclusion check
│   │   ├── json-schema.ts       # JSON structure validation
│   │   ├── matches-intent.ts    # LLM semantic matching
│   │   └── sentiment.ts         # LLM sentiment analysis
│   ├── llm/
│   │   └── claude.ts            # Claude API integration (opt-in)
│   └── output/
│       ├── console.ts           # Colored terminal output
│       └── json.ts              # JSON output for CI
├── tests/
│   └── ...                      # Internal test suite
└── examples/
    └── proof.yaml               # Example config for README
```

---

## Open Questions (Need Resolution)

| # | Question | Context | Owner |
|---|----------|---------|-------|
| 1 | **Threshold for confidence tiers?** | Phil ruled HIGH/MEDIUM/LOW but exact cutoffs (90%/70%) need validation | Engineering |
| 2 | **How to batch LLM evaluations?** | One prompt per test with multiple expectations—what's the prompt structure? | Engineering |
| 3 | **API key configuration?** | Environment variable (`ANTHROPIC_API_KEY`)? Config file? Both? | Engineering |
| 4 | **Error message templates?** | "Haikus of clarity" need actual copywriting. Who writes them? | Steve/Design |
| 5 | **Subprocess timeout default?** | Agent hangs → test hangs. What's the default timeout? 30s? 60s? | Engineering |
| 6 | **Rate limiting strategy?** | Parallel execution + Claude API = potential rate limit hits. Backoff strategy? | Engineering |
| 7 | **Test file naming convention?** | `proof.yaml`? `*.proof.yaml`? `proof/*.yaml`? | Engineering |
| 8 | **Version strategy?** | Ship as 0.1.0? 1.0.0? Semantic versioning commitment? | Product |

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | **LLM-as-judge inconsistency** | HIGH | HIGH | Confidence tiers + clear docs that semantic evaluation is probabilistic |
| 2 | **Claude API costs surprise users** | MEDIUM | HIGH | Clear messaging that `--llm` flag incurs API costs. First run is free. |
| 3 | **Parallel execution reveals race conditions** | MEDIUM | MEDIUM | Tests should be isolated. Document requirement clearly. |
| 4 | **YAML parsing edge cases** | LOW | LOW | Use battle-tested parser (js-yaml). Validate schema strictly. |
| 5 | **Name collision (`proof` on npm)** | MEDIUM | HIGH | Check npm availability immediately. Have backup: `@proof/cli`, `prooftest` |
| 6 | **Scope creep during build** | HIGH | MEDIUM | This document is the spec. If it's not here, it doesn't ship. |
| 7 | **"Terse" errors become "unhelpful" errors** | MEDIUM | MEDIUM | User testing on real failures. Iterate on specific error messages. |
| 8 | **HTTP adapter doesn't cover streaming responses** | MEDIUM | LOW | v1 waits for complete response. Document limitation. |
| 9 | **Subprocess adapter platform differences** | MEDIUM | MEDIUM | Test on macOS, Linux, Windows. Document supported platforms. |
| 10 | **First user experience fails silently** | LOW | HIGH | Verbose error on missing config. Guide user to README. |

---

## The Essence (Guiding Star)

> **What it's really about:** The ability to sleep at night knowing your AI won't break.
>
> **The feeling:** Confidence. The exhale after all tests pass.
>
> **The one thing that must be perfect:** First 30 seconds—from install to passing test.
>
> **Creative direction:** Calm certainty. No fear.

---

## Summary for Build Phase

1. **Name:** Proof
2. **Command:** `npx proof` (default), `npx proof --llm` (semantic)
3. **Architecture:** Config parser → Parallel executor → Evaluators → Output
4. **Adapters:** HTTP + subprocess only (inline, no abstraction layer)
5. **Evaluators:** 5 built-in (3 deterministic, 2 LLM-powered)
6. **Output:** Console (default) + JSON (`--output json`)
7. **Confidence:** Tiered display (HIGH/MEDIUM/LOW)
8. **Philosophy:** Local-first, zero-config start, LLM opt-in

*This document is the blueprint. Build what's here. Nothing more.*

---

*"The strength of the team is each individual member. The strength of each member is the team."* — Phil Jackson
