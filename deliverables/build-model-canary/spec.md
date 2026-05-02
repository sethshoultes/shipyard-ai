# Build Model Canary — Specification

**Slug:** `build-model-canary`
**Date:** 2026-05-02
**Purpose:** Smoke test to verify `BUILD_PHASE_MODEL=qwen3.5:cloud` produces working TypeScript output

---

## Goals (from PRD)

1. **Verify model swap worked** — Confirm `qwen3.5:cloud` can produce working `Write` tool calls after Kimi K2.6 produced hollow builds (0 source files)
2. **Build a self-contained TypeScript module** — A slug-utility library with two pure functions
3. **Minimal scope** — Test the model, not the agency pipeline
4. **Diagnostic purpose** — If this ships, the model swap worked. If it fails hollow, the issue is deeper than the model.

---

## Implementation Approach (from Plan)

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **TypeScript** — Typed signatures are promises; plain JS is a guess | Pipeline context demands type discipline |
| **Zero runtime dependencies** — Empty `dependencies` in package.json | Minimize supply chain risk, reduce maintenance |
| **Flat file structure** — No `src/`, `lib/`, `tests/` subdirectories | Reduce hallucination surface, simplify emission |
| **Two pure functions** — `slugify` and `truncate` | Scalpel, not Swiss Army knife |
| **Node built-in test runner** — `node:test` + `node:assert` | Zero dependency test coverage |
| **ESM imports with `.js` extension** — `./slugify.js` resolves to `.ts` | Supports both `tsc` compilation and `tsx` runtime |

### Function Specifications

#### `slugify(text: string): string`

```
1. text.toLowerCase()
2. .replace(/[^a-z0-9]+/g, '-')
3. .replace(/^-+|-+$/g, '')
```

- Lowercase input
- Replace any sequence of non-ASCII-alphanumeric characters with a single hyphen
- Strip leading/trailing hyphens
- Unicode non-alphanumerics are treated as noise and stripped

#### `truncate(text: string, maxLength: number): string`

```
1. If text.length <= maxLength, return text (no ellipsis)
2. If maxLength <= 0, return "…"
3. Find last space character at index <= maxLength
4. If space found, return text.substring(0, boundary) + "…"
5. If no space found, return text.substring(0, maxLength) + "…"
6. Empty string returns ""
```

---

## Verification Criteria

### File Existence

| File | Verification Command |
|------|---------------------|
| `spec.md` | `test -f spec.md && echo OK` |
| `todo.md` | `test -f todo.md && echo OK` |
| `slugify.ts` | `test -f slugify.ts && echo OK` |
| `truncate.ts` | `test -f truncate.ts && echo OK` |
| `index.ts` | `test -f index.ts && echo OK` |
| `tests/test-slugify.ts` | `test -f tests/test-slugify.ts && echo OK` |
| `tests/test-truncate.ts` | `test -f tests/test-truncate.ts && echo OK` |

### TypeScript Validity

```bash
cd /home/agent/shipyard-ai/deliverables/build-model-canary
tsc --noEmit slugify.ts truncate.ts index.ts
# Exit code 0 = PASS
```

### Test Execution

```bash
cd /home/agent/shipyard-ai/deliverables/build-model-canary
node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts
# Exit code 0 = PASS
```

### No Placeholders

```bash
grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' .
# No output = PASS
```

```bash
grep -E '^\s*export\s+function\s+\w+\([^)]*\)\s*:\s*\w+\s*\{\s*\}' *.ts
# No output = PASS (no empty function bodies)
```

### Slugify Test Cases

| Input | Expected Output |
|-------|-----------------|
| `"Hello World"` | `"hello-world"` |
| `"Foo  Bar!!!"` | `"foo-bar"` |
| `"  trim me  "` | `"trim-me"` |

### Truncate Test Cases

| Input | Expected Output |
|-------|-----------------|
| `truncate("hello world", 5)` | `"hello…"` (word boundary) |
| `truncate("hello world", 4)` | `"hell…"` (hard cut before boundary) |
| `truncate("short", 10)` | `"short"` (no truncation needed) |
| `truncate("", 5)` | `""` |
| `truncate("supercalifragilisticexpialidocious", 5)` | `"super…"` (hard-cut, no boundary ≤ 5) |
| `truncate("hello world", 0)` | `"…"` |
| `truncate("hello world", -1)` | `"…"` |

---

## Files to Create or Modify

### Create

| Path | Purpose |
|------|---------|
| `deliverables/build-model-canary/spec.md` | This specification document |
| `deliverables/build-model-canary/todo.md` | Task checklist with verification steps |
| `deliverables/build-model-canary/slugify.ts` | Slugify function implementation |
| `deliverables/build-model-canary/truncate.ts` | Truncate function implementation |
| `deliverables/build-model-canary/index.ts` | Barrel file re-exporting both functions |
| `deliverables/build-model-canary/tests/test-slugify.ts` | Slugify test suite |
| `deliverables/build-model-canary/tests/test-truncate.ts` | Truncate test suite |
| `deliverables/build-model-canary/package.json` | Module manifest (zero dependencies) |
| `deliverables/build-model-canary/tsconfig.json` | TypeScript configuration for ESM |

### Modify

None — this is a greenfield canary build.

---

## Acceptance Criteria (from PRD)

1. All 7 required files exist (spec.md, todo.md, slugify.ts, truncate.ts, index.ts, tests/test-slugify.ts, tests/test-truncate.ts)
2. `node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts` exits 0
3. No placeholder comments. No `TODO`. No empty function bodies
4. Each `.ts` file is valid TypeScript — `tsc --noEmit slugify.ts truncate.ts index.ts` exits 0
