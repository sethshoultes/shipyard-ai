# Phase 1 Plan — Slug: Model Canary TypeScript Utility Library (v1)

**Generated**: 2026-05-02
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 6
**Waves**: 3
**Project Slug**: `build-model-canary`

---

## Documentation Review

### Verified Technical Context

1. **Platform Lock**: Standalone TypeScript utility module, NOT Emdash/Cloudflare/Astro. No CMS integration, no plugin patterns, no wrangler. The `docs/EMDASH-GUIDE.md` is explicitly NOT applicable here (CLAUDE.md §Emdash CMS Reference); this is a plain Node.js ESM module.
2. **Architecture Lock**: Flat file structure, zero subdirectories, zero barrel files (decisions.md §4). The model has already failed the canary if it invents `src/`, `lib/`, or `tests/`.
3. **Zero-Dependency Contract**: Empty `dependencies` in `package.json`. No `devDependencies` in the emitted artifact. Node built-in test runner only (`node:test` + `node:assert`) per decisions.md §3, §7.
4. **TypeScript Discipline**: Explicit parameter and return types. No `any`, no implicit returns. `tsc --noEmit` must pass (decisions.md §4, PRD §Acceptance #4).
5. **Test-as-Spec Contract**: The test files ARE the specification. No separate `spec.md` or `todo.md` inside the build directory (decisions.md §6).
6. **Slugify Rules** (locked from PRD test cases + decisions.md Open #3 resolution):
   - Lowercase input via `toLowerCase()`.
   - Replace any sequence of non-ASCII-alphanumeric characters with a single hyphen (`/[^a-z0-9]+/g → '-'`).
   - Strip leading/trailing hyphens (`/^-+|-+$/g → ''`).
   - Unicode non-alphanumerics are treated as noise and stripped.
7. **Truncate Rules** (locked from PRD + decisions.md Open #2 resolution):
   - If `text.length <= maxLength`, return `text` unchanged (no ellipsis).
   - Find the last word boundary (space character) at an index `<= maxLength`.
   - If boundary found, return `text.substring(0, boundary) + "…"`.
   - If no boundary found (single word exceeds `maxLength`), hard-cut at `maxLength` and append `"…"`.
   - `maxLength <= 0` returns `"…"`.
   - Empty string returns `""`.
8. **ESM Import Pattern**: Test files import source files with `.js` extensions (`./slugify.js`, `./truncate.js`). This is the TypeScript ESM standard: TS allows `.js` imports that resolve to `.ts` sources at compile time, and `tsx` resolves them at runtime. This supports both `tsc` compilation and direct `tsx` execution without modifying imports.

### Hindsight Risk Flags

- **`.planning/phase-1-plan.md`** and **`.planning/REQUIREMENTS.md`** are high-churn files (50+ and 47+ changes respectively per `/home/agent/shipyard-ai/.great-minds/hindsight-report.md`). Overwriting them for this canary destroys the active Anvil project plan currently staged in `.planning/`. **Mitigation**: This canary is a deliberate, time-boxed diagnostic with explicit overwrite instructions. The Anvil plan is preserved in git history (last commit 2026-04-30). If both projects need simultaneous active planning, migrate to slug-specific subdirectories (e.g., `.planning/build-model-canary/`) in the next pipeline iteration.
- **Uncommitted changes**: `prds/build-model-canary.md` and `rounds/build-model-canary/` exist in the working tree. These are the correct, expected inputs for this plan. Safe to proceed.
- **No bug-associated files** in the build-model-canary scope. The bug-associated files from hindsight (e.g., `plugins/membership/src/sandbox-entry.ts`, `STATUS.md`) are outside this project's surface area.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R1 (Flat layout) | phase-1-task-1 | 1 |
| R2 (Zero deps) | phase-1-task-1 | 1 |
| R3 (slugify impl) | phase-1-task-2 | 1 |
| R4 (truncate impl) | phase-1-task-3 | 1 |
| R5 (Tests) | phase-1-task-4, phase-1-task-5 | 2 |
| R6 (TS valid) | phase-1-task-6 | 3 |
| R7 (Tests pass) | phase-1-task-6 | 3 |
| R8 (No placeholders) | phase-1-task-1, phase-1-task-2, phase-1-task-3, phase-1-task-4, phase-1-task-5 | 1, 2 |

---

## Wave Execution Order

### Wave 1 (Parallel)

These three tasks are completely independent. They can be emitted in any order or simultaneously by parallel sub-agents.

<task-plan id="phase-1-task-1" wave="1">
  <title>Create minimal package.json and tsconfig.json</title>
  <requirement>R1 (Flat file layout), R2 (Zero runtime dependencies), R6 (TS validity)</requirement>
  <description>Establish the module manifest and TypeScript configuration with zero runtime dependencies, flat structure, and minimal tooling footprint.</description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks the zero-dependency constraint and flat-file rule" />
    <file path="/home/agent/shipyard-ai/prds/build-model-canary.md" reason="PRD acceptance criteria requiring tsc --noEmit" />
  </context>

  <steps>
    <step order="1">Create directory `deliverables/build-model-canary/` if it does not exist.</step>
    <step order="2">Write `deliverables/build-model-canary/package.json` with exactly these fields: `name` set to `"slug"`, `version` set to `"1.0.0"`, `type` set to `"module"`, and `dependencies` set to `{}`. Do NOT include `devDependencies`, `scripts`, `exports`, `main`, or `types` fields.</step>
    <step order="3">Write `deliverables/build-model-canary/tsconfig.json` with minimal configuration required for ESM Node resolution and strict type checking. Required fields: `compilerOptions.module` = `"NodeNext"`, `compilerOptions.moduleResolution` = `"NodeNext"`, `compilerOptions.strict` = `true`, `compilerOptions.esModuleInterop` = `true`, `compilerOptions.skipLibCheck` = `true`, `compilerOptions.forceConsistentCasingInFileNames` = `true`, `include` = `["*.ts"]`.</step>
    <step order="4">Verify that `package.json` parses as valid JSON and contains zero items in `dependencies`.</step>
    <step order="5">Verify that `tsconfig.json` parses as valid JSON and does not include `outDir`, `rootDir`, `src/`, or `dist/` paths.</step>
  </steps>

  <verification>
    <check type="build">`cat deliverables/build-model-canary/package.json | jq '.dependencies | length'` returns 0</check>
    <check type="build">`cat deliverables/build-model-canary/tsconfig.json | jq '.compilerOptions.module'` returns "NodeNext"</check>
    <check type="manual">Neither file references `src/`, `dist/`, `lib/`, or `tests/`</check>
  </verification>

  <dependencies>
    <!-- No dependencies — wave 1 root task -->
  </dependencies>

  <commit-message>chore(canary): minimal package.json and tsconfig.json for slug utility</commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="1">
  <title>Implement slugify.ts</title>
  <requirement>R3 (slugify function), R8 (Zero placeholders)</requirement>
  <description>Emit a pure, zero-dependency slugify function with exact regex rules locked from the PRD test cases.</description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R3 defines the exact slugify acceptance criteria and verified test cases" />
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks pure-function discipline, zero side effects, explicit types" />
  </context>

  <steps>
    <step order="1">Write `deliverables/build-model-canary/slugify.ts`.</step>
    <step order="2">Export a single named function `slugify` with signature `(text: string): string`.</step>
    <step order="3">Implementation must be a single pipeline of pure string operations:
      1. `text.toLowerCase()`
      2. `.replace(/[^a-z0-9]+/g, '-')`
      3. `.replace(/^-+|-+$/g, '')`
    </step>
    <step order="4">Return the transformed string. No external imports, no side effects, no mutation of the input parameter.</step>
    <step order="5">Post-write static scan: reject file if any line matches `/TODO/i` or if the function body is an empty block `{}`.</step>
  </steps>

  <verification>
    <check type="test">`cd deliverables/build-model-canary && node -e "import('./slugify.ts').then(m => console.log(m.slugify('Hello World'))).catch(e => { console.error(e); process.exit(1) })"` outputs `hello-world` (requires tsx or ts-node in host env; if unavailable, verify via tsc compilation first)</check>
    <check type="build">`tsc --noEmit slugify.ts` exits 0 when tsconfig.json is present</check>
    <check type="manual">File contains no `TODO`, `console.log`, `debugger`, or placeholder comments</check>
  </verification>

  <dependencies>
    <!-- No dependencies — wave 1 root task. tsconfig.json is nice-to-have for tsc verification but not a hard dependency. -->
  </dependencies>

  <commit-message>feat(canary): implement slugify pure function</commit-message>
</task-plan>

<task-plan id="phase-1-task-3" wave="1">
  <title>Implement truncate.ts</title>
  <requirement>R4 (truncate function), R8 (Zero placeholders)</requirement>
  <description>Emit a pure, zero-dependency truncate function with word-boundary semantics and ellipsis behavior locked from the PRD.</description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R4 defines the exact truncate acceptance criteria and verified test cases" />
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks pure-function discipline, zero side effects, explicit types" />
  </context>

  <steps>
    <step order="1">Write `deliverables/build-model-canary/truncate.ts`.</step>
    <step order="2">Export a single named function `truncate` with signature `(text: string, maxLength: number): string`.</step>
    <step order="3">Implementation logic (in order):
      1. If `text.length <= maxLength`, return `text`.
      2. If `maxLength <= 0`, return `"…"`.
      3. Find the last space character at an index `<= maxLength` using `text.lastIndexOf(' ', maxLength)`.
      4. If a space is found (`boundary > 0` or `boundary === 0` if `maxLength >= 0`), return `text.substring(0, boundary) + "…"`.
      5. If no space is found, return `text.substring(0, maxLength) + "…"`.
    </step>
    <step order="4">No external imports, no side effects, no mutation of input parameters.</step>
    <step order="5">Post-write static scan: reject file if any line matches `/TODO/i` or if the function body is an empty block `{}`.</step>
  </steps>

  <verification>
    <check type="test">`cd deliverables/build-model-canary && node -e "import('./truncate.ts').then(m => console.log(m.truncate('hello world', 5))).catch(e => { console.error(e); process.exit(1) })"` outputs `hello…` (requires tsx or ts-node in host env; if unavailable, verify via tsc compilation first)</check>
    <check type="build">`tsc --noEmit truncate.ts` exits 0 when tsconfig.json is present</check>
    <check type="manual">File contains no `TODO`, `console.log`, `debugger`, or placeholder comments</check>
  </verification>

  <dependencies>
    <!-- No dependencies — wave 1 root task. -->
  </dependencies>

  <commit-message>feat(canary): implement truncate pure function</commit-message>
</task-plan>

---

### Wave 2 (Parallel, after Wave 1)

These two tasks depend on their respective source files existing so that imports can resolve during verification. They are independent of each other.

<task-plan id="phase-1-task-4" wave="2">
  <title>Create slugify.test.ts</title>
  <requirement>R5 (Test coverage), R8 (Zero placeholders)</requirement>
  <description>Emit the slugify test file using Node.js built-in test runner. The test file IS the spec; it documents expected behavior through test names and assertions.</description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/slugify.ts" reason="Source function under test" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R3 and R5 define the test cases and runner constraints" />
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks flat structure (no tests/ subdir) and zero-dependency test runner" />
  </context>

  <steps>
    <step order="1">Write `deliverables/build-model-canary/slugify.test.ts` in the root directory (NOT in a `tests/` subdirectory).</step>
    <step order="2">Import `describe` and `it` from `node:test` and `strictEqual` from `node:assert`.</step>
    <step order="3">Import `slugify` from `./slugify.js` (ESM `.js` extension pattern for TypeScript).</step>
    <step order="4">Write tests covering:
      - `slugify("Hello World")` → `"hello-world"`
      - `slugify("Foo  Bar!!!")` → `"foo-bar"`
      - `slugify("  trim me  ")` → `"trim-me"`
      - `slugify("")` → `""`
      - `slugify("UPPER")` → `"upper"`
      - `slugify("unicode-ñ-test")` → `"unicode-test"`
    </step>
    <step order="5">Each test must have a descriptive name explaining the scenario. No `todo()` or skipped tests.</step>
    <step order="6">Post-write static scan: reject file if any line matches `/TODO/i` or `/skip/i`.</step>
  </steps>

  <verification>
    <check type="build">`tsc --noEmit slugify.test.ts` exits 0 (import resolves to slugify.ts via tsconfig)</check>
    <check type="test">`node --test slugify.test.js` exits 0 after `tsc` compilation (or via tsx if available)</check>
    <check type="manual">File contains no `TODO`, no skipped tests, no placeholder assertions</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Test file imports and asserts against slugify.ts; source must exist before test verification" />
  </dependencies>

  <commit-message>test(canary): slugify acceptance tests with node:test</commit-message>
</task-plan>

<task-plan id="phase-1-task-5" wave="2">
  <title>Create truncate.test.ts</title>
  <requirement>R5 (Test coverage), R8 (Zero placeholders)</requirement>
  <description>Emit the truncate test file using Node.js built-in test runner. The test file IS the spec; it documents expected behavior through test names and assertions.</description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/truncate.ts" reason="Source function under test" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R4 and R5 define the test cases and runner constraints" />
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks flat structure (no tests/ subdir) and zero-dependency test runner" />
  </context>

  <steps>
    <step order="1">Write `deliverables/build-model-canary/truncate.test.ts` in the root directory (NOT in a `tests/` subdirectory).</step>
    <step order="2">Import `describe` and `it` from `node:test` and `strictEqual` from `node:assert`.</step>
    <step order="3">Import `truncate` from `./truncate.js` (ESM `.js` extension pattern for TypeScript).</step>
    <step order="4">Write tests covering:
      - `truncate("hello world", 5)` → `"hello…"` (boundary at index 5)
      - `truncate("hello world", 4)` → `"hell…"` (boundary before index 4)
      - `truncate("short", 10)` → `"short"` (no truncation needed)
      - `truncate("", 5)` → `""`
      - `truncate("supercalifragilisticexpialidocious", 5)` → `"super…"` (hard-cut, no boundary ≤ 5)
      - `truncate("hello world", 0)` → `"…"`
      - `truncate("hello world", -1)` → `"…"`
    </step>
    <step order="5">Each test must have a descriptive name explaining the scenario. No `todo()` or skipped tests.</step>
    <step order="6">Post-write static scan: reject file if any line matches `/TODO/i` or `/skip/i`.</step>
  </steps>

  <verification>
    <check type="build">`tsc --noEmit truncate.test.ts` exits 0 (import resolves to truncate.ts via tsconfig)</check>
    <check type="test">`node --test truncate.test.js` exits 0 after `tsc` compilation (or via tsx if available)</check>
    <check type="manual">File contains no `TODO`, no skipped tests, no placeholder assertions</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Test file imports and asserts against truncate.ts; source must exist before test verification" />
  </dependencies>

  <commit-message>test(canary): truncate acceptance tests with node:test</commit-message>
</task-plan>

---

### Wave 3 (Sequential, after Wave 2)

This task validates the entire artifact. It must run after all source and test files are emitted.

<task-plan id="phase-1-task-6" wave="3">
  <title>Validate type check and test suite</title>
  <requirement>R6 (TypeScript validity), R7 (Test execution), R1 (Flat layout guard)</requirement>
  <description>Run the full quality gate: type-check all TypeScript files, execute the test suite, and scan for structural violations (subdirectories, process artifacts, placeholders).</description>

  <context>
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/package.json" reason="Dependency gate check" />
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/tsconfig.json" reason="Type check configuration" />
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/slugify.ts" reason="Source file to type-check" />
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/truncate.ts" reason="Source file to type-check" />
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/slugify.test.ts" reason="Test file to type-check and run" />
    <file path="/home/agent/shipyard-ai/deliverables/build-model-canary/truncate.test.ts" reason="Test file to type-check and run" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R6 and R7 define the validation acceptance criteria" />
    <file path="/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md" reason="Locks flat structure, zero deps, and placeholder-free code" />
  </context>

  <steps>
    <step order="1">Run `cd deliverables/build-model-canary && tsc --noEmit`. Verify exit code 0 and zero type errors.</step>
    <step order="2">Run structural scan: `find deliverables/build-model-canary -mindepth 1 -type d`. If any directory is found, reject the build (flat-file lock violated).</step>
    <step order="3">Run structural scan: verify `deliverables/build-model-canary/spec.md`, `todo.md`, `README.md`, `CHANGELOG.md`, `index.ts` do NOT exist. If any found, reject the build.</step>
    <step order="4">Run dependency scan: `cat deliverables/build-model-canary/package.json | jq '.dependencies | length'`. Verify result is 0 and no `devDependencies` key exists.</step>
    <step order="5">Run placeholder scan: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' deliverables/build-model-canary/`. If any match found, reject the build.</step>
    <step order="6">Execute tests. Prefer Path A (zero dependency): `cd deliverables/build-model-canary && npx tsc` to compile, then `node --test *.test.js`. If `tsx` is available, Path B is acceptable: `node --test --import tsx *.test.ts`. Verify exit code 0.</step>
    <step order="7">If any step 1–6 fails, mark build as rejected and report the first failure. Do not proceed to deploy.</step>
  </steps>

  <verification>
    <check type="build">`cd deliverables/build-model-canary && tsc --noEmit` exits 0 with no stderr</check>
    <check type="test">`node --test` on compiled tests exits 0 with no failures</check>
    <check type="manual">Exactly 6 files exist in `deliverables/build-model-canary/`: `package.json`, `tsconfig.json`, `slugify.ts`, `truncate.ts`, `slugify.test.ts`, `truncate.test.ts`</check>
    <check type="manual">No subdirectories, no process artifacts, no barrel file, no TODOs anywhere</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="package.json and tsconfig.json must exist for tsc and dependency scans" />
    <depends-on task-id="phase-1-task-2" reason="slugify.ts must exist for type check and test execution" />
    <depends-on task-id="phase-1-task-3" reason="truncate.ts must exist for type check and test execution" />
    <depends-on task-id="phase-1-task-4" reason="slugify.test.ts must exist for test execution" />
    <depends-on task-id="phase-1-task-5" reason="truncate.test.ts must exist for test execution" />
  </dependencies>

  <commit-message>ci(canary): validate type check, tests, and structural constraints</commit-message>
</task-plan>

---

## Risk Notes

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Hallucination drift** — Model injects TODO, empty body, or placeholder on emission | High | Critical | Deterministic prompts with explicit NO-TODO constraint. Post-generation static scan for `/TODO/i` and empty `{}` bodies (phase-1-task-6, step 5). Reject and retry on hit. |
| **Agent invents folder structure** — Emits `src/`, `lib/`, or `tests/` despite flat-file lock | Medium | High | Explicit one-directory constraint in every task plan. Structural scan in phase-1-task-6 (step 2) parses file paths; rejects any emission containing path separators beyond root. |
| **TypeScript tooling introduces hidden dependency** — `tsc`, `tsx`, or `ts-node` added to `dependencies`/`devDependencies` | Low | Medium | Dependency scan in phase-1-task-6 (step 4). `dependencies` must be empty. `devDependencies` must not exist in the emitted artifact. |
| **Undefined edge-case behavior** — `slugify` or `truncate` behaves differently across emissions because spec was vague | Medium | High | Exact regex rules and truncation logic locked in task plans (phase-1-task-2 and phase-1-task-3). Acceptance tests (phase-1-task-4, phase-1-task-5) assert identical output for identical input. |
| **Test file fails to define spec** — Tests are too shallow to catch regression | Medium | High | Tests cover empty strings, unicode, maximum length, special characters, negative bounds, and word-boundary vs hard-cut paths. The test file IS the contract. |
| **Overwrite of active Anvil plan** — `.planning/` files currently contain the Anvil project plan | High (process) | Medium | Anvil plan is backed up in git history. This canary is time-boxed. Future iterations should use project-specific `.planning/{slug}/` subdirectories to avoid collision. |

---

## Agent Assignments

- **Elon Musk**: Validates zero-dependency lock (empty `dependencies`, no `devDependencies`), flat-file discipline, and structural scan results.
- **Steve Jobs**: Validates function naming (`slugify`, `truncate`), type precision (no `any`), test quality, and the absence of theater (no README novels, no spec.md).
- **Margaret Hamilton**: Runs the full validation gate (phase-1-task-6): `tsc --noEmit`, `node --test`, placeholder scan, subdirectory scan. Rejects the build on any failure.
