# Spec — Build Model Canary (GLM)

**Slug:** `build-model-canary-glm`
**Type:** Smoke test for daemon build phase
**Date:** 2026-05-03

## Goals

Verify that the `BUILD_PHASE_MODEL=qwen3.5:cloud` model swap restored the build agent's ability to:
1. Make `Write` tool calls to create actual source files
2. Produce working TypeScript code with substance
3. Execute the full build pipeline without hollow failures

This is a diagnostic canary, not a product. Success proves the model swap worked; failure indicates deeper wiring issues.

## Implementation Approach

### Architecture
- **Zero Dependencies:** Raw TypeScript with native `node --test` runner
- **Zero Build Tools:** No package.json scripts, no bundlers, no transpilation
- **Minimal Scope:** Exactly 7 files as mandated by the PRD
- **Native Testing:** Direct `node --test --import tsx` execution

### Module Structure
```
deliverables/build-model-canary-glm/
├── spec.md              # This specification file
├── todo.md              # Task tracking checklist
├── slugify.ts           # String normalization utility
├── truncate.ts          # String truncation utility
├── index.ts             # Module entry point (re-exports both)
├── tests/
│   ├── test-slugify.ts  # Slugify test suite
│   └── test-truncate.ts # Truncate test suite
```

### Core Functions

#### `slugify(input: string): string`
- Converts input string to lowercase
- Replaces spaces and non-alphanumerics with hyphens
- Trims leading/trailing hyphens
- Collapses multiple consecutive hyphens
- Returns: Clean slug string

#### `truncate(input: string, max: number): string`
- Cuts string at word boundary when possible
- Appends ellipsis (`…`) when truncated
- If `max` occurs mid-word, cuts at exact length
- Returns: Truncated string with ellipsis or original

#### `index.ts`
- Re-exports both utility functions
- Provides clean module interface

## Verification Criteria

### 1. File Existence Verification
All 7 files must exist:
- `spec.md` (this file)
- `todo.md` (task checklist)
- `slugify.ts` (function implementation)
- `truncate.ts` (function implementation)
- `index.ts` (re-exports)
- `tests/test-slugify.ts` (slugify tests)
- `tests/test-truncate.ts` (truncate tests)

### 2. TypeScript Validation
Each `.ts` file must pass TypeScript compilation:
```bash
tsc --noEmit slugify.ts truncate.ts index.ts
# Exits 0 (no type errors)
```

### 3. Test Execution Verification
Full test suite must pass:
```bash
node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts
# Exits 0 with green output
```

### 4. Functional Verification

#### Slugify Test Cases
- `slugify("Hello World")` returns `"hello-world"`
- `slugify("Foo  Bar!!!")` returns `"foo-bar"`
- `slugify("  trim me  ")` returns `"trim-me"`
- `slugify("Multiple---Spaces")` returns `"multiple-spaces"`

#### Truncate Test Cases
- `truncate("hello world", 5)` returns `"hello…"`
- Long strings truncate at word boundaries
- Edge cases (empty string, max longer than input)

### 5. Quality Verification
- No incomplete comments or temporary markers
- No empty function bodies
- Each function has real implementation
- Total TypeScript ≈ 80 lines (aggressively pruned)

## Files to be Created/Modified

### New Files (7 total)
1. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/spec.md` - This specification
2. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/todo.md` - Task checklist
3. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/slugify.ts` - String normalization
4. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/truncate.ts` - String truncation
5. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/index.ts` - Module exports
6. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/tests/test-slugify.ts` - Slugify tests
7. `/home/agent/shipyard-ai/deliverables/build-model-canary-glm/tests/test-truncate.ts` - Truncate tests

### Existing Files (none)
No existing files will be modified. This is a self-contained smoke test.

## Acceptance Criteria

1. **All 7 files exist** in correct directory structure
2. **TypeScript compilation passes** for all `.ts` files
3. **Test suite passes** with clean green output
4. **No hollow files** - every file has real substance
5. **Zero dependencies** - works with native Node.js
6. **Tests can run** with `node --test --import tsx` or compiled `.js` fallback

## Out of Scope

- README files, documentation beyond spec.md
- CI/CD configuration, Prettier configs
- Build tools, bundlers, transpilation
- Publishing to npm
- Any additional utilities beyond slugify/truncate

This canary succeeds if and only if the qwen3.5:cloud model can build these 7 files with substance and pass all verification criteria.