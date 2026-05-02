# Round 1 — Elon Musk

## Architecture

The PRD says "web app or WordPress plugin." That's not architecture — that's indecision.

First principles: Shipyard already has a multi-agent orchestration engine (the daemon, the agent SDK, the pipeline). The simplest system that could work is a **JSON workflow config + a lightweight executor** that feeds into the existing pipeline. A "visual builder" in v1 should be a schema-validating code editor with a live preview pane, not a drag-and-drop Figma clone.

Do not build a second runtime. Reuse the dispatch logic, retry logic, and secret management that already exist. A new runtime doesn't make us twice as fast; it makes us half as reliable. The only new code you write is the config schema and a thin wrapper that submits jobs to the daemon. Anything more is ego, not engineering.

## Performance

The bottleneck isn't "edge execution" or Workers AI latency. **It's LLM API cost and serial execution.**

Each workflow node that calls Claude adds 1–3 seconds of blocking latency. Five agents in series = 10–15 seconds minimum. The 10x path is **parallelizing independent nodes** and **aggressive caching** — if an agent's input hasn't changed, don't call the API again. Cache hits should be instant; cache misses should be parallel where possible.

Workers AI doesn't run Claude; this is hand-waving. A pretty UI can't hide a 15-second workflow, but a fast workflow forgives an ugly UI. The product feeling is speed, not pixels. If a workflow isn't under five seconds, nobody uses it twice.

## Distribution

"ProductHunt, no-code communities, LinkedIn" is hope, not strategy.

You don't get to 10,000 users without a distribution channel that already has users in it. The only credible path is **embedding into the existing Emdash plugin ecosystem** — every WordPress site already running EventDash or FormForge becomes a potential user. Otherwise you're building a new category ("Zapier for Claude agents") that nobody is searching for. That's a $10M marketing problem, not a v1 feature.

ProductHunt is a lottery ticket; an installed plugin base is a funnel. If you can't name the exact plugin screen and menu item where this appears, you don't have distribution. No-code communities are graveyards of beautiful tools nobody adopted.

## What to CUT

- **Freemium billing** — v2. Stripe integration, subscription state, dunning logic, and quota enforcement burn 30% of your tokens for zero core value. Ship value first. Worry about monetization when users are actually hitting limits and complaining.
- **Drag-and-drop visual canvas** — v2. A JSON editor ships the same orchestration value in 1/10th the code. A DAG editor is a database schema, a rendering engine, an event system, an undo stack, and a layout solver. That's not a feature; that's a product team.
- **WordPress plugin variant** — pick one platform. "Or" in a PRD means you build two products badly. If the web app works, wrap it in a plugin later. Not on day one.
- **"Workers AI for edge execution"** — agents call the Claude API. This is marketing fluff that confuses the stack and sets false latency expectations. It doesn't run Claude 3.7 Sonnet.

## Technical Feasibility

One agent session can build a **JSON workflow config + executor wrapper** around the existing SDK. It cannot build auth, billing, a visual DAG editor, and a plugin architecture in one session.

The PRD claims "HIGH feasibility" because "we've done multi-agent orchestration" — true, but that's 10% of the product. The other 90% is UX cruft. Scope to the config editor. Ship the core value in one session; iterate on the chrome later. If it doesn't run in the current pipeline, it doesn't ship.

A single session should produce: a JSON schema, a validator, a preview runner, and a submit-to-daemon button. That's it. Everything else is scope creep wearing a feature request.

## Scaling

At 100x usage, **Anthropic's rate limits and your API bill break before Cloudflare does.**

Run the numbers: 1,000 DAUs × 10 workflows × 5 agents × 10K tokens = **$3,000–15,000/day** depending on model. D1 and R2 will handle the load; your wallet won't. You need per-user token budgets, output caching, and request deduplication on day one, or you'll be subsidizing user workloads.

API cost is the existential risk; UI polish is not. If the unit economics don't work at 100 users, they implode at 10,000. The infrastructure that matters isn't Cloudflare — it's your Anthropic rate limit tier and your credit card limit.
