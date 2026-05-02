# Build Blueprint: `build-model-canary` (Slug)

*Zen Master synthesis. Read the debates. Heard the thunder. Here is the quiet.*

> "The strength of the team is each individual member. The strength of each member is the team."
> — Phil Jackson

This document is the single source of truth for the build phase. Every file emitted must pass through these locks. No exceptions. No mood swings.

---

## Locked Decisions

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1 | **Product name: "Slug"** | Steve Jobs | Steve Jobs (conceded by Elon) | One word. No hyphens, no suffixes, no `-ts`, no `build-model-canary`. Elon conceded: "clean naming matters; `slugify-ts` is defeat." Identity sets the floor for every file that follows. |
| 2 | **Language: TypeScript** | Steve Jobs (TS); Elon Musk (plain JS) | Steve Jobs (conditional) | Elon conceded TS is "defensible if the surrounding pipeline demands it." The essence frames this canary as "setting the craft floor for every future file." Typed signatures are promises; plain JS is a guess. The pipeline context wins. |
| 3 | **Zero runtime dependencies; zero build tooling** | Elon Musk; Steve Jobs agreed | **Consensus** | Both load-bearing. No bundler, no monorepo tool, no CI, no formatter, no linter, no ORM. The lifetime cost of software is maintenance and silent rot of dependencies. The only tooling is `tsc` (dev-only, type-checking only). |
| 4 | **Flat file structure, zero architecture** | Elon Musk; Steve Jobs agreed | **Consensus** | One directory. Pure functions. No `src/`, no `lib/`, no `tests/` subdirectories. No abstraction layers, no barrel files, no index exports. If the model invents a folder structure, it has already failed the canary. |
| 5 | **Two functions: `slugify` and `truncate`** | Steve Jobs (2); Elon referenced 3 | Steve Jobs | Scalpel, not Swiss Army knife. Steve's "two functions" is a load-bearing wall. Both debaters explicitly name `slugify` and `truncate`. No configuration objects, no options parameters, no plugins. |
| 6 | **No process artifacts in build output** | Elon Musk; Steve Jobs defended spec-as-manifesto | Phil Jackson | The build artifact contains **zero** `spec.md`, `todo.md`, or README novels inside the directory. The existing `essence.md` is the manifesto. These `decisions.md` are the external blueprint. The test files are the spec. The code is the poetry. |
| 7 | **Two test files** | Elon Musk | **Consensus** | One test file per function. The test files define acceptance criteria. No TODOs, no empty bodies, no placeholders, no "we'll fix it later." |
| 8 | **Optimize for agent orchestration, not regex** | Elon Musk; Steve reframed as cognitive load | Elon Musk (technical) / Steve (human) | String utilities are O(n) on kilobytes. CPU cycles are irrelevant. The 10x path is parallel file emission, not faster regex. The bottleneck is model inference latency and tool-call overhead. Code clarity saves more human-hours than algorithmic optimization. |
| 9 | **Reliability > Capability** | Elon Musk; Steve conceded | **Consensus** | One perfect build means nothing. One hundred identical emissions mean everything. Zero hallucinations. Zero TODOs. No empty bodies. The canary tests statistics, not single-shot capability. |

---

## MVP Feature Set (What Ships in v1)

The smallest unit that sings. Nothing more.

1. **`slugify(text: string): string`**
   - Lowercases input
   - Replaces whitespace and noise with hyphens
   - Strips leading/trailing hyphens
   - Collapses consecutive hyphens
   - Pure function, zero side effects

2. **`truncate(text: string, maxLength: number): string`**
   - Truncates string to `maxLength`
   - Pure function, zero side effects
   - *(Exact truncation semantics — hard cut, ellipsis, word boundary — defined at build time; see Open Question #2)*

3. **Test coverage for both functions**
   - Assertions for happy path, edge cases, and empty input
   - No test harness dependencies beyond what the runtime provides

4. **TypeScript type precision**
   - Explicit parameter and return types
   - No `any`, no implicit returns

5. **Zero external footprint**
   - Empty `dependencies` in `package.json` (if manifest required for TS resolution)
   - No `devDependencies` beyond TypeScript compiler (if needed)

---

## File Structure (What Gets Built)

Flat. Ruthlessly flat.

```
slug/
├── slugify.ts        # pure function + types
├── slugify.test.ts   # test file is the spec
├── truncate.ts       # pure function + types
├── truncate.test.ts  # test file is the spec
└── package.json      # zero dependencies; types field only if required
```

**Rules:**
- No subdirectories. No `src/`. No `dist/`. No `tests/`.
- No `index.ts` barrel file. Import directly from the function file.
- No `README.md`, `spec.md`, `todo.md`, `CHANGELOG.md` inside the build directory.
- No CI configs (`.github/`, `.gitlab-ci.yml`, etc.).
- No lint configs (`.eslintrc`, `.prettierrc`, etc.).
- No build configs (`tsconfig.json` is acceptable only if TypeScript compilation is required; keep it minimal).

---

## Open Questions (What Still Needs Resolution)

These must be answered before the first file is emitted. They are gaps the debate left behind.

1. **Third function ambiguity**
   - *Conflict*: Elon references "three pure functions and two test files" (Round 1). Steve locks "two functions" as a load-bearing wall (Round 2).
   - *Risk*: If the originating PRD requires a third utility (e.g., `sanitize`, `excerpt`), the build either breaches spec or violates Steve's architecture lock.
   - *Action*: Verify against originating PRD before build. If a third function exists, it ships under the same zero-config discipline. If not, lock at two.

2. **`truncate` exact semantics**
   - *Gap*: Debate names `truncate` but never defines its behavior.
   - *Open*: Hard cut at `maxLength`? Appends `...`? Respects word boundaries? Unicode-aware?
   - *Action*: Define strict acceptance criteria in the build prompt. No ambiguity allowed in emitted code.

3. **`slugify` character whitelist**
   - *Gap*: "Strip noise" is poetic but imprecise.
   - *Open*: Which characters are preserved? How is unicode handled? Does it collapse consecutive hyphens? Strip leading/trailing?
   - *Action*: Lock the regex / transform rules in the build prompt.

4. **Test runner choice**
   - *Gap*: Neither debater specified the test framework.
   - *Open*: Node.js built-in `node:test` + `node:assert` (zero dependency) vs. a test utility that adds no npm dependency.
   - *Action*: Use Node built-in test runner to satisfy the zero-dependency lock.

5. **`package.json` presence and `exports` field**
   - *Gap*: Not debated, but TypeScript resolution may require it.
   - *Open*: Is a manifest required? If yes, what fields (name, version, types, exports)?
   - *Action*: Include a minimal `package.json` with empty `dependencies` only if TS/module resolution demands it. No `exports` map in v1 — direct file paths only.

6. **TypeScript compilation method**
   - *Gap*: How does the build daemon validate types?
   - *Open*: `tsc --noEmit`, `tsx` execution, or `ts-node`?
   - *Action*: Prefer `tsc --noEmit` for validation; `node` for test execution if tests are compiled first. Keep tooling invisible to the developer.

---

## Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Hallucination drift** — Model injects a TODO comment, empty function body, or placeholder on 1 of 100 emissions | High | Critical | Deterministic prompt with explicit NO-TODO constraint. Post-generation static scan for `/TODO/i` and empty `{}` bodies. Reject and retry on hit. |
| **Agent invents folder structure** — Emits `src/`, `lib/`, or `tests/` despite flat-file lock | Medium | High | Explicit one-directory constraint in prompt. Parse emitted file paths; reject any emission containing path separators beyond the root. |
| **Unseen PRD demands third function** — Scope breach if originating spec requires a utility beyond `slugify` and `truncate` | Medium | High | Verify against originating PRD before first emission. If third function exists, ship it under same two-function discipline (zero config, pure function). If no PRD exists, lock at two. |
| **TypeScript tooling introduces hidden dependency** — `tsc`, `tsx`, or `ts-node` added to `dependencies` or `devDependencies` | Low | Medium | Review `package.json` before accepting build. `dependencies` must be empty. `devDependencies` must not exist in the emitted artifact (dev tooling lives outside the canary directory). |
| **Undefined edge-case behavior** — `slugify` or `truncate` behaves differently across 100 emissions because spec was vague | Medium | High | Lock exact regex rules and truncation logic in the build prompt. Acceptance tests must assert identical output for identical input across all runs. |
| **Orchestration bottleneck (next round)** — This canary tests file quality, not volume. The next PRD (50+ files, concurrent writes) will hit rate limits, context truncation, and FS race conditions. | High (future) | High | Treat this canary as necessary but insufficient. Plan stress-test PRD immediately after lock. Do not declare victory because the engine turned over once. |
| **Test file fails to define spec** — Tests are too shallow to catch regression across 100 runs | Medium | High | Tests must cover empty strings, unicode, maximum length, and special characters. The test file IS the contract; if it is weak, the signal is weak. |

---

## Zen Master Ruling

Elon brought the physics: zero layers, zero dependencies, flat files, reliability over capability. Steve brought the soul: the name, the discipline, the refusal to accept mediocrity at the atomic level. Both were right where it mattered, and both were wrong where they let ego choose the metric.

The synthesis is not compromise. It is **triangulation**.

- **Steve wins on identity** (Slug, TypeScript, two functions, the NO list).
- **Elon wins on structure** (flat files, zero tooling, no theater, orchestration over regex).
- **Phil wins on what gets built**: A canary so quiet, so precise, that its absence would be louder than its presence.

Build it flat. Build it clean. Build it a hundred times. If it sings the same note every time, the mine is safe.

---

*Locked. No further debate. Build.*
