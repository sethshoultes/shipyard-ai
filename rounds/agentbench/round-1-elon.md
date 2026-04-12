# AgentBench Review — Elon Musk (Chief Product & Growth)

## Architecture: What's the Simplest System That Could Work?

The PRD has four layers. That's three too many for v1.

**First-principles architecture:**
```
YAML file → HTTP call to agent → String/LLM evaluation → Pass/Fail
```

That's one file. ~300 lines. Ship it.

The "Adapter Layer" is architecture astronautics. You don't need a plugin system for two adapters. You need an if-statement: `if (config.endpoint) fetch() else spawn()`. The CLI subprocess adapter is solving a problem nobody has yet. 95% of agents being built are HTTP APIs. Start there.

**Kill Commander.js.** Parse `process.argv[2]` for the config file. Done. Dependencies are debt.

## Performance: Where Are the Bottlenecks?

The bottleneck isn't your code. It's physics.

Every `sentiment` or `matches_intent` test = 1 Claude API call = 500ms-2s latency + ~$0.01-0.03. Run 50 semantic tests = 50 API calls = **$1.50 and 45 seconds**. That's slower than manual testing.

**The 10x path (in priority order):**
1. **Batch evaluations.** One prompt: "Evaluate these 20 outputs against these expectations. Return JSON." 20x faster, 20x cheaper.
2. **Parallelize test execution.** Don't wait for test 1 to finish before calling test 2. Concurrent HTTP calls.
3. **Cache by hash(input + output + expectation).** Deterministic agents produce same outputs. Don't re-evaluate.

The PRD puts parallel execution in Phase 2. Wrong. Without parallelism, this tool is unusably slow. It's v1 or nothing.

## Distribution: 10,000 Users Without Paid Ads

The PRD says "HN, Twitter, Discord, r/LocalLLaMA." That's a wish list, not a strategy.

**What actually reaches 10K:**
1. **Dogfood publicly.** Test Shipyard's own agents. Post the YAML. Post the failures. "Here's how we found 3 bugs in our agent" beats "here's a testing tool."
2. **One integration > 1000 blog posts.** PR `agentbench.yaml` into LangChain's example repo. If their docs mention you, you inherit their distribution.
3. **The controversy play.** Create "The 5 Tests Every AI Agent Fails." Run it against popular agents. Tweet results. Developers share failures.

**Hard math:** 100 npm downloads/week is 14/day. A rounding error. The metric that matters: active users running tests. You need telemetry (opt-in) to know if anyone actually uses this.

**r/LocalLLaMA won't help.** They care about running Llama locally, not testing agents. Wrong audience.

## What to CUT: V2 Features Masquerading as V1

**Cut immediately:**
- `custom: "./evaluators/safety.js"` — Plugin systems are v3. You don't know what plugins people want.
- `--watch` mode — Iterating on tests isn't the bottleneck. Writing them is.
- Multiple output formats — JSON only. It's parseable. Humans can read it.
- `npm init agentbench` scaffolding — Copy-paste from README. YAML is already minimal.
- CLI subprocess adapter — HTTP only. Revisit when someone asks.
- SDK hook adapter — Way overengineered. Kill it.
- Confidence scores — Pass/fail is clearer. "0.73 confidence" requires explanation.

**Keep:**
- `contains`, `does_not_contain` — Fast, deterministic, no API cost.
- `sentiment`, `matches_intent` — This is the product. Semantic testing is the differentiator.
- JSON schema validation — Actually useful for structured outputs.
- Exit code 1 on failure — CI integration is table stakes.

## Technical Feasibility: Can One Session Build This?

**Yes. If and only if you cut to the bone.**

Minimum viable AgentBench:
- YAML parser: 40 lines
- HTTP executor: 25 lines
- String evaluators: 35 lines
- LLM evaluator (batched): 80 lines
- CLI runner: 50 lines
- Output formatter: 40 lines

**Total: ~270 lines of TypeScript.** One session. No abstractions. No patterns.

What kills the session: "Adapter patterns," "Evaluator registries," "Reporter plugins." Those are v5 problems. Resist the urge.

## Scaling: What Breaks at 100x Usage?

At 10,000 test runs/day:

1. **Claude rate limits.** Tier 1 is 50 requests/minute. You'll hit it. Need queue + exponential backoff.
2. **Cost explosion.** 10K runs × 10 semantic evals × $0.02 = **$2,000/day**. Who pays? User's API key? Yours?
3. **No telemetry.** You won't know what's breaking or which evaluators people use.
4. **LLM failures cascade.** Claude API down = all semantic tests fail = angry users.

**Build for scale now:**
- Require user's own API key. Don't subsidize LLM costs.
- Graceful degradation: LLM unavailable → skip semantic tests, don't fail.
- Version the YAML schema: `version: 1` in every config. You will need to change it.

## Verdict

Good idea. 40% too much scope.

**Ship:** YAML config, HTTP adapter, string matchers, batched LLM evaluator, parallel execution, JSON output.

**Don't ship:** Custom evaluators, watch mode, CLI adapter, SDK hooks, multiple output formats, scaffolding commands.

The product is LLM-as-judge for semantic testing. Everything else is distraction. Make that work. Make it fast. Ship it.

---
*"The best part is no part. The best process is no process."*
