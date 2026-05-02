# Requirements Traceability Matrix
# Slug — Model Canary TypeScript Utility Library (v1)

**Generated**: 2026-05-02
**Source Documents**:
- `/home/agent/shipyard-ai/prds/build-model-canary.md` (PRIMARY — intake PRD)
- `/home/agent/shipyard-ai/rounds/build-model-canary/decisions.md` (LOCKED — overrides PRD where in conflict)

**Project Slug**: `build-model-canary`
**Product Name**: Slug (locked per decisions.md §1)
**Total Requirements**: 8
**Status**: Phase 1 — v1 Canary Build

---

## CRITICAL: Decisions.md Overrides PRD on Structure

The debate-locked `decisions.md` is the load-bearing source of truth. Where the PRD and decisions conflict, decisions win:

| PRD Requirement | Locked Decision | Winner |
|-----------------|-----------------|--------|
| `index.ts` barrel file | No barrel files | **decisions.md** |
| `tests/` subdirectory | Flat file structure, zero subdirectories | **decisions.md** |
| `spec.md` + `todo.md` in build dir | No process artifacts in build output | **decisions.md** |
| `tsx` import for test runner | Zero runtime dependencies; use Node built-in test runner | **decisions.md** |
| 7 files | 6 files (source + test + package.json + tsconfig.json) | **decisions.md** |

---

## Requirements Summary

| ID | Requirement | Priority | Source | Kill Switch |
|----|-------------|----------|--------|-------------|
| R1 | Flat file layout in `deliverables/build-model-canary/` — no subdirectories, no barrel files, no process artifacts | P0 | decisions.md §4, §6 | **Non-negotiable** |
| R2 | Zero runtime dependencies; minimal `package.json` with empty `dependencies`; no `devDependencies` in artifact | P0 | decisions.md §3, §5 | **Non-negotiable** |
| R3 | `slugify(text: string): string` — lowercase, hyphenate whitespace/noise, strip leading/trailing hyphens, collapse consecutive hyphens | P0 | PRD §slugify.ts, decisions.md §MVP #1 | **Non-negotiable** |
| R4 | `truncate(text: string, maxLength: number): string` — cut at nearest word boundary ≤ maxLength, append `…`; if no boundary, hard-cut at maxLength | P0 | PRD §truncate.ts, decisions.md §MVP #2 | **Non-negotiable** |
| R5 | Two test files using Node.js built-in `node:test` + `node:assert`; cover happy path, edge cases, empty input, unicode | P0 | PRD §tests, decisions.md §7 | **Non-negotiable** |
| R6 | All `.ts` files pass `tsc --noEmit` with zero type errors | P0 | PRD §Acceptance #4, decisions.md §Open #6 | **Non-negotiable** |
| R7 | `node --test` exits 0 on compiled test output (or via tsx if available in host environment) | P0 | PRD §Acceptance #2 | **Non-negotiable** |
| R8 | No placeholder comments, no `TODO`, no empty function bodies anywhere in emitted code | P0 | PRD §Acceptance #3, decisions.md §Risk #1 | **Non-negotiable** |

---

## Atomic Requirements

### R1: Flat File Layout
**Type**: Structural Constraint
**Priority**: P0
**Scope**: `deliverables/build-model-canary/` directory contents.

#### Acceptance Criteria
1. All emitted files sit directly in `deliverables/build-model-canary/` — no `src/`, `lib/`, `tests/`, or any other subdirectory.
2. No `index.ts` barrel file exists.
3. No `spec.md`, `todo.md`, `README.md`, `CHANGELOG.md`, or any other process artifact exists inside the build directory.
4. No CI configs, lint configs, or build configs other than a minimal `tsconfig.json`.

---

### R2: Zero Runtime Dependencies
**Type**: Dependency Constraint
**Priority**: P0
**Scope**: `package.json` and module graph.

#### Acceptance Criteria
1. `package.json` contains `name`, `version`, `type` (set to `"module"`), and an empty `dependencies` object.
2. `package.json` does NOT contain `devDependencies` in the emitted artifact.
3. No `node_modules` directory is created or required.
4. Test files import only `node:test`, `node:assert`, and the local source files.

---

### R3: slugify Function
**Type**: Pure Function
**Priority**: P0
**Scope**: `slugify.ts`

#### Signature
```ts
export function slugify(text: string): string;
```

#### Acceptance Criteria
1. Lowercases the entire input string.
2. Replaces any sequence of one or more characters that are NOT ASCII alphanumeric (`a-z`, `A-Z`, `0-9`) with a single hyphen `-`.
3. Strips leading and trailing hyphens.
4. Collapses consecutive hyphens into a single hyphen (guaranteed by rule #2 if regex uses `+` quantifier).
5. Returns an empty string for empty input.
6. Pure function: zero side effects, no mutation of input, no external state.
7. Explicit parameter and return types; no `any`.

#### Verified Test Cases
- `slugify("Hello World")` → `"hello-world"`
- `slugify("Foo  Bar!!!")` → `"foo-bar"`
- `slugify("  trim me  ")` → `"trim-me"`
- `slugify("")` → `""`
- `slugify("UPPER")` → `"upper"`
- `slugify("unicode-ñ-test")` → `"unicode-test"` (non-ASCII alphanumeric stripped)

---

### R4: truncate Function
**Type**: Pure Function
**Priority**: P0
**Scope**: `truncate.ts`

#### Signature
```ts
export function truncate(text: string, maxLength: number): string;
```

#### Acceptance Criteria
1. If `text.length <= maxLength`, returns `text` unchanged with no ellipsis appended.
2. If `text.length > maxLength`, finds the last word boundary (space character `' '`) at an index `≤ maxLength`.
3. If a word boundary is found, returns `text.substring(0, boundaryIndex) + "…"`.
4. If no word boundary exists at or before `maxLength` (e.g., the first word is longer than `maxLength`), performs a hard cut: returns `text.substring(0, maxLength) + "…"`.
5. `maxLength` of `0` returns `"…"` (hard-cut rule).
6. Negative `maxLength` returns `"…"` (treat as 0).
7. Empty string returns empty string.
8. Pure function: zero side effects, no mutation of input, no external state.
9. Explicit parameter and return types; no `any`.

#### Verified Test Cases
- `truncate("hello world", 5)` → `"hello…"` (boundary at index 5)
- `truncate("hello world", 4)` → `"hell…"` (boundary before index 4)
- `truncate("short", 10)` → `"short"` (no truncation needed)
- `truncate("", 5)` → `""`
- `truncate("supercalifragilisticexpialidocious", 5)` → `"super…"` (hard-cut, no boundary ≤ 5)
- `truncate("hello world", 0)` → `"…"`
- `truncate("hello world", -1)` → `"…"`

---

### R5: Test Coverage
**Type**: Test Files
**Priority**: P0
**Scope**: `slugify.test.ts` and `truncate.test.ts`

#### Acceptance Criteria
1. Two test files exist, one per function, in the root of the build directory (flat structure).
2. Each test file uses Node.js built-in `node:test` and `node:assert` exclusively.
3. Each test file imports its corresponding source file using `.js` extension (ESM TypeScript pattern: `import { slugify } from './slugify.js'`).
4. Tests cover:
   - Happy path (normal input)
   - Edge cases (empty string, whitespace-only, unicode)
   - Boundary conditions (maxLength at word boundary, between words, negative, zero)
5. Test files serve as the spec: comments or test names clearly document expected behavior.
6. No TODOs, no skipped tests, no placeholder assertions.

---

### R6: TypeScript Validity
**Type**: Type Check
**Priority**: P0
**Scope**: All `.ts` files in the build directory.

#### Acceptance Criteria
1. `tsc --noEmit` exits with code 0 when run in the build directory.
2. Zero type errors across all `.ts` files.
3. `tsconfig.json` is minimal — only fields required for ESM Node resolution and strict type checking.

---

### R7: Test Execution
**Type**: Runtime Verification
**Priority**: P0
**Scope**: Compiled or interpreted test execution.

#### Acceptance Criteria
1. Tests can be executed via one of the following paths:
   - **Path A (preferred, zero dependency)**: `npx tsc` compiles `.ts` → `.js`, then `node --test *.test.js` exits 0.
   - **Path B (host convenience)**: If `tsx` is available in the host environment, `node --test --import tsx *.test.ts` exits 0.
2. All assertions pass; no test failures.
3. Test runner output is clean — no unhandled errors or warnings.

---

### R8: Code Quality — Zero Placeholders
**Type**: Static Quality Gate
**Priority**: P0
**Scope**: All emitted source and test files.

#### Acceptance Criteria
1. No line matches `/TODO/i` anywhere in emitted code.
2. No empty function bodies (`{}` with no statements) except where a no-op is the intended implementation (not applicable here).
3. No placeholder comments like `// implement me`, `// fix later`, `// placeholder`.
4. No `console.log`, `debugger`, or `// eslint-disable` comments.
