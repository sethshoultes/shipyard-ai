# AgentBench Review — Elon (Chief Product & Growth)

## Architecture: Strip It Down Further

The four-layer architecture is one layer too many. Merge CLI and Test Runner—they're the same thing. You don't need "Commander.js" as a dependency; `process.argv` works fine for `run` and `run --watch`.

**Simplest system that works:**
1. Config loader (read YAML, validate schema)
2. Executor (spawn process or HTTP call, capture output)
3. Evaluators (string ops + one Claude call for semantic checks)

That's it. Three files, ~500 lines total. The "Adapter Layer" abstraction is premature—you have two adapters (CLI, HTTP). Write two if-statements, not a plugin system.

## Performance: LLM Calls Are Your Bottleneck

Every `sentiment` or `matches_intent` check is an API call. 10 semantic tests = 10 Claude calls = $0.15-0.30 and 5-15 seconds latency. At 100 tests, you're waiting 2 minutes and paying $3.

**10x path:**
- Batch evaluations: Send all outputs + expectations in one prompt. One API call for N evaluations.
- Cache results: Same input → same output → same eval. Store hashes.
- Default to string matching. LLM eval should be opt-in, not default.

The PRD says "fallback to string matching when LLM unavailable"—flip it. String matching is primary. LLM is the upgrade.

## Distribution: 10K Users Without Paid Ads

**What works:**
1. Ship it to HN with a real case study. "We tested our own agents, found 3 bugs, here's the YAML." Show don't tell.
2. One tweet thread from each team member showing their test results.
3. Reach out to 20 AI influencers on X with "here's how to test your agent in 2 minutes."

**What won't work:**
- r/LocalLLaMA is about running models locally, not testing agents.
- Discord is where users go after they've adopted, not before.
- "Dev community" is hand-waving. Name the 10 people you'll DM.

**Growth hack:** Integrate with popular agent frameworks. If `langchain run` or `autogen` users can add AgentBench with one line, you inherit their distribution.

## What to CUT from v1

**Cut immediately:**
- `--watch` mode — Nice-to-have. Ship without it.
- `custom` evaluator support — You're not building a plugin system in v1.
- `json_schema` validation — Use Zod or ajv directly if needed. Don't reinvent.
- Multiple output formats — Pick one. JSON for CI, done.
- `npm init agentbench` scaffolding — Copy-paste from README is fine.

**v2 features masquerading as v1:**
- "Parallel test execution" — Run sequentially first. Parallelism adds complexity.
- "Retry logic" in test runner — Flaky tests are a config problem, not a framework problem.
- Confidence scores — Binary pass/fail is clearer. Scores require explanation and tuning.

Ship the absolute minimum: YAML in, pass/fail out, one semantic evaluator.

## Technical Feasibility: Can One Agent Session Build This?

**Yes, but only if you cut aggressively.**

Core deliverable in one session:
- YAML parser + config validation: 1 hour
- CLI subprocess executor: 30 min
- HTTP executor: 30 min
- String evaluators (contains, does_not_contain): 30 min
- One LLM evaluator (sentiment OR matches_intent, not both): 1 hour
- CLI output formatting: 30 min
- npm publish setup: 30 min

Total: ~5 hours of focused work. Doable if you don't get distracted by abstractions.

**What kills the session:** Building "adapter patterns," "reporter plugins," or "evaluator registries." Those are v3 problems.

## Scaling: What Breaks at 100x Usage

At 100x (10,000 test runs/day across users):

1. **Claude API rate limits** — You'll hit them. Users will blame you.
2. **No telemetry** — You won't know who's using it or how.
3. **No error handling for LLM failures** — API down = tests fail for wrong reason.
4. **YAML schema will be wrong** — Users will want features you didn't anticipate.

**What to build for scale:**
- Graceful degradation when LLM unavailable (string-only mode)
- Clear error messages distinguishing "test failed" from "evaluation failed"
- Version your YAML schema from day one

---

**Bottom line:** This is a good idea with too much scope. Cut 40% of features, ship in one session, iterate based on real usage. The PRD has "Phase 2" and "Phase 3" baked in—resist the urge to pull them forward.
