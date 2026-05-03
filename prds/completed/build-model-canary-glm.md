# PRD — Build Model Canary (qwen3.5 smoke test)

**Slug:** `build-model-canary-glm`
**Type:** Smoke test for daemon build phase
**Date:** 2026-05-02

## Background

After two consecutive PRD failures with hollow builds (Kimi K2.6 build agent producing 0 source files), we have switched the daemon's build-phase model to `qwen3.5:cloud` via the `BUILD_PHASE_MODEL` env var. This canary PRD verifies the swap restored the build agent's ability to make `Write` tool calls.

Keep this minimal. The point is to test the model, not the agency pipeline.

## Scope

Build a tiny self-contained TypeScript module — a slug-utility library — inside `deliverables/build-model-canary-glm/`.

## Required files

All under `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/`:

1. `spec.md` — restate goals
2. `todo.md` — checklist
3. `slugify.ts` — exports `slugify(input: string): string` (lowercase, hyphenate, strip non-alphanumerics)
4. `truncate.ts` — exports `truncate(input: string, max: number): string` (cuts at word boundary, appends "…")
5. `index.ts` — re-exports both
6. `tests/test-slugify.ts` — uses `node --test`, asserts:
   - `slugify("Hello World") === "hello-world"`
   - `slugify("Foo  Bar!!!") === "foo-bar"`
   - `slugify("  trim me  ") === "trim-me"`
7. `tests/test-truncate.ts` — uses `node --test`, asserts:
   - `truncate("hello world", 5) === "hello…"` or similar (document expected behavior in spec)
   - long string at word boundary

## Acceptance Criteria

1. All 7 files exist.
2. `node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts` exits 0. (If tsx unavailable, compile via `tsc` then run on `.js` output.)
3. No placeholder comments. No `TODO`. No empty function bodies.
4. Each `.ts` file is valid TypeScript — `tsc --noEmit slugify.ts truncate.ts index.ts` exits 0.

## Out of scope

- Publishing
- Documentation beyond spec.md
- Anything else

## Why this PRD exists

Diagnostic. We need to confirm `BUILD_PHASE_MODEL=qwen3.5:cloud` produces working output. If this canary ships, the model swap worked and we can re-deploy `standalone-apps-portfolio-v2`. If this canary also fails hollow, the issue is deeper than the model and we investigate further.
