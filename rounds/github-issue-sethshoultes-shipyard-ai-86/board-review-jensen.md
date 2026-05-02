# Board Review — WorkerForge (Anvil)
**Reviewer:** Jensen Huang
**Date:** 2026-05-02
**Issue:** github-issue-sethshoultes-shipyard-ai-86

---

## Verdict
Thin scaffolding play on commodity infrastructure. Execution is clean. Strategy is shallow. Needs a data or network flywheel to survive.

---

## Moat / What Compounds
- None visible.
- Code generator with zero proprietary data. User runs once, never returns.
- Live spec fetch is convenient; Cloudflare could add `--template ai` to wrangler tomorrow.
- No model benchmarks, no performance telemetry, no learned optimizations across deployments.
- Network effects: zero. Switching costs: zero.

## AI Leverage
- AI is the payload, not the engine.
- CLI does zero AI. Hand-rolled string concatenation. Could have used an LLM to adapt worker code to user intent; doesn't.
- Missed 10x: AI-generated custom handlers, AI-tuned rate limits based on traffic patterns, AI-assisted debugging of failed deployments.
- This is like selling shovels during a gold rush — but the shovels don't get smarter.

## Unfair Advantage We're Not Building
- **Inference telemetry layer:** No visibility into p99 latency, token throughput, or model error rates across the fleet of deployed workers. That dataset would be gold.
- **Model optimization runtime:** No KV-cache tricks, no speculative decoding, no batching scheduler. Just passes through to Cloudflare's binding.
- **Multi-cloud abstraction:** Hard-locked to Cloudflare. If Workers AI pricing shifts, user base evaporates. No portability moat.
- **Agent orchestration:** No multi-step pipelines, no tool-calling scaffolding, no stateful agent memory. Just a single POST endpoint.

## Platform vs Product
- Right now: product. `create-react-app` for Workers AI. `create-react-app` died.
- To become platform:
  - Template registry + marketplace (community plugins)
  - Shared observability layer across all Anvil-deployed workers
  - Prompt/model versioning and A/B testing infrastructure
  - Runtime that abstracts Cloudflare/AWS/GCP inference backends
  - API surface: `anvil.deploy()`, `anvil.benchmark()`, `anvil.route()`
- Need users to build *on top of* Anvil, not just *with* it once.

## Score
**4/10**
Well-built tool, zero strategic depth. If we ship this as-is, we own a README and a npm package — not a business.

---

## One Ask
Before next round: define the telemetry and benchmarking flywheel. What data do we collect from every deployed worker that compounds into an unfair advantage?
