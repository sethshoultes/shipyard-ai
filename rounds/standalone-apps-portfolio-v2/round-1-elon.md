# Round 1: First-Principles Review — Standalone Apps Portfolio v2

## Architecture
Already close to correct. Static export, zero runtime, single data file. **But:** if we're generating static pages from a 30-line data array, why does this need 7 deliverable files? The `spec.md`, `todo.md`, and `MIGRATION.md` are process theater, not product. The simplest system that works is: one `portfolio.ts`, two `.tsx` components, one test file. Meta-files exist because the pipeline doesn't trust the agent to finish. Fix the pipeline, delete the meta-work.

## Performance
Bottleneck isn't render speed — it's **human integration latency**. Static HTML is trivially fast. The 10x path is eliminating `MIGRATION.md` and having the agent write directly into `website/src/`. Every handoff is a queue with infinite delay. If an agent can generate code but can't merge it, we haven't built software — we've built homework.

## Distribution
**This will not reach 10,000 users without paid ads.** Full stop. A portfolio page is credibility infrastructure, not a growth engine. Nobody shares "my agency's work page." Distribution comes from the apps themselves being useful and shareable, or from Seth's content flywheel. Don't pretend a `/work` section is a user acquisition channel. It's social proof for visitors who already arrived.

## What to CUT
- **SCAFFOLD entries on `/work`**: If an app has no detail page and no live demo, it's a line item that says "we started something." That's resume padding, not product. Cut it. Only shipped or demo-able tools get real estate.
- **Feature bullet archaeology**: The PRD demands the agent "read 3 source files per app" to ground bullets. That's correct in principle, but if the code is stubs, the honest output is "Not enough substance to describe." Don't send an agent on a snipe hunt through half-built repos.
- **The "8 acceptance criteria" bureaucracy**: Criteria 4 ("HTTP 200 reachable") is a test for `curl`, not product value. Criteria 6 ("no lorem ipsum") is a smell that v1 was so broken we now ban obvious failures. If you need to write "don't write TODO" as a rule, your agent is not an agent — it's a slot machine.

## Technical Feasibility
Yes, one session builds this. It's ~300 lines of trivial code. **Risk:** the agent spends 70% of its context window reading `projects/tuned/` source files trying to divine what the app "actually does." The PRD correctly limits to 3 apps, but even 3 repos × 3 files = 9 reads + analysis. Budget tokens accordingly. If the agent runs out of context, it will hallucinate bullets. That's the real failure mode.

## Scaling (100× = 300 apps)
`portfolio.ts` hand-curated by humans breaks immediately. At scale, this must be generated from `package.json` + `README.md` via a script, not maintained like a garden. The detail page template is fine — it's data-driven. But the data source should be GitHub, not a TypeScript array someone edits by hand. Also, `generateStaticParams` with 300 slugs is fine, but build time becomes noticeable. The real breakage is **cognitive**: nobody can keep 300 app descriptions honest.

## Bottom Line
Build it. It's small, honest, and necessary. But stop celebrating "restraint" as a virtue — restraint here is just admitting most of the portfolio isn't worth showing yet. Ship the 3 that are real. Delete the rest from the page. A portfolio with 3 strong entries beats a page with 3 strong and 4 weak ones. Weak entries dilute credibility. That's math.
