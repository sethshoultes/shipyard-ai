# Position: GitHub issue #97 QA Gate

## Bottom line
This is a 20-line shell script masquerading as a product spec. Stop architecting. Start grep-ing.

## Architecture
Simplest system that works: a pre-build Node script (or shell one-liner) that exits non-zero if `output: 'export'` and any `route.ts` contains `runtime = 'edge'`.
No AST parsing. No Next.js plugin. No compiler integration. Read two files, run two regexes, done.
Auto-routing to `functions/` is v2 fantasy. Fail fast, tell the human where to move the file.

## Performance
Bottleneck is not the check; it is the cognitive overhead of Margaret reading a 50-line PRD for a grep.
The 10x path is a 5 ms regex at CI start vs. a 90 s Next.js build that produces a phantom route.
Do not measure this in milliseconds; measure it in engineer-hours saved.

## Distribution
Internal CI gate first. If externalized, ship as a zero-dependency npm bin named `margaret-check`.
Distribution for dev tools is social, not paid. One post about "Margaret-class bugs" with the 404 screenshot drives more npm installs than a YC launch.
10k users is irrelevant if the primary customer is this repo's deploy pipeline.

## What to Cut — Hard
- **Auto-routing to CF Pages Functions**: v2. Requires path mapping, import rewriting, and opinions you do not have.
- **AST parsing with TS compiler API**: Scope creep disguised as robustness. Regex is sufficient because this is a lint, not a compiler.
- **Dashboard / telemetry**: If you build a web UI for this, you have already failed.
- **Auto-fix mode**: Do not rewrite user code. Fail loudly. Humans fix one file in 30 seconds.

## Technical Feasibility
One agent session? Yes. One *human* session? Yes.
The suggested fix in the PRD is literally the implementation: grep, cross-reference, exit 1.
Anything more complex proves you have been infected by Next.js plugin architecture brain-worms.

## Scaling / 100x
100x = 100 repos or 100 builds/day.
- Regex scales linearly; monorepos with 10k files might slow to 200 ms. Add an `ignore` list if needed.
- False positives from edge-case syntax are your support tax. Keep patterns literal: `runtime\s*=\s*['"]edge['"]`.
- If Margaret becomes a standard gate, cache the config read. Not for speed—for sanity when debugging CI logs.

## Verdict
Build the grep script. Add it to `package.json` as `"build:check"`. Run it in CI before `next build`. Close the issue. Move on.
