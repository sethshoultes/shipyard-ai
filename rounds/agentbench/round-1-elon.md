# Round 1 Review: AgentBench — Elon Musk

## Architecture: Strip It Down

The four-layer architecture is over-engineered for v1. Here's what actually matters:

1. **Config parser** (YAML → tests)
2. **Agent runner** (spawn subprocess OR call HTTP endpoint)
3. **Evaluators** (string matching + one LLM call for semantic stuff)
4. **CLI output** (console.log with colors)

That's it. Commander.js is fine, but don't abstract the "adapter layer" into a pattern on day one. You'll guess wrong. Write inline code for subprocess and fetch. Refactor when you have 3+ adapters, not before.

## Performance: LLM Calls Are The Bottleneck

Let's do the math. If you run 20 tests with `sentiment` + `matches_intent` checks, that's 40 Claude API calls minimum. At ~1s latency each sequentially = 40 seconds. Unacceptable.

**10x path:**
- Batch all LLM evaluations into a single prompt per test (not one per expectation)
- Run tests in parallel from day one (not "Phase 2")
- Cache deterministic evaluations (contains/json_schema don't need LLM)

Parallel execution isn't polish. It's table stakes for any test framework.

## Distribution: The 10K User Path

HN + Twitter + Discord = **maybe** 500 users if you're lucky. Here's what actually works:

1. **Dogfood publicly** — Test YOUR agents, publish the test files, blog about bugs you caught
2. **Integration with existing tools** — GitHub Action in week 1 (not "CI examples in docs")
3. **Screenshot-worthy output** — Make the CLI output so beautiful people share it
4. **Be opinionated** — "This is how you test agents" not "flexible framework for everyone"

1000 downloads in month 1 is too low. That's 33/day. A good HN post does that in an hour.

## What to CUT

**CUT from v1:**
- `custom: "./evaluators/safety.js"` — You're building complexity for users who won't exist
- Watch mode — Nobody watch-modes their agent tests. They run them before deploy.
- Multiple output formats (json/markdown) — JSON only. Markdown is vanity.
- `npm init agentbench` scaffolding — Copy-paste from README works fine

**v2 features masquerading as v1:**
- SDK hook adapter — Over-engineering. HTTP and CLI cover 99% of cases.
- Confidence scores — Nice to have, not need to have. Pass/fail is what matters.
- Retry logic — If your agent is flaky, that's a bug, not a test framework problem.

## Technical Feasibility

Can one agent session build this? **Yes, if you cut scope.**

The core loop is simple:
1. Parse YAML
2. For each test: call agent, check expectations
3. Print results

The risky part is LLM-as-judge. You're adding latency and cost to every test run. Consider making semantic evaluation opt-in and defaulting to string matching. Ship something that works without an API key first.

## Scaling: What Breaks at 100x

At 100x usage (100K tests/day across users):

- **Nothing breaks** because it's local execution. That's the right call.
- **Your Claude bill breaks** if you offer hosted evaluation later. LLM-as-judge doesn't scale economically.
- **YAML parsing doesn't break** — it's CPU-bound and fast.

The "hosted evaluation API" in Phase 3 is a trap. Don't build infrastructure. Stay local-first.

## Bottom Line

Ship a working CLI that runs tests against an HTTP endpoint with `contains`/`does_not_contain` checks. Add LLM evaluation as an opt-in flag. Publish to npm. Write one blog post with real examples.

That's a weekend project. Everything else is scope creep.

*Build the thing that works, not the thing that sounds impressive.*
