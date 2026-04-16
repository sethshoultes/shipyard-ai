# Plugin Resolver Test Specification

**Requirement:** REQ-016: Test Convention Resolution (Decisions line 219)

**Module Under Test:** `plugin-resolver.ts` - Convention-based plugin entry point resolution

**Purpose:** Verify that the resolver handles all supported plugin formats, naming conventions, and edge cases correctly.

---

## Test Suite Overview

The plugin resolver implements a convention-over-configuration system that transforms simple plugin names like `"membership"` into resolvable file paths. This specification defines test cases covering happy paths, edge cases, and error conditions.

**Monorepo Plugins:** The resolver must handle all plugins currently in `/home/agent/shipyard-ai/plugins/`:

**Complete plugins (with sandbox-entry.ts):**
1. membership
2. formforge
3. eventdash
4. reviewpulse
5. seodash
6. commercekit

**Partial/incomplete plugins:**
7. adminpulse (no src/sandbox-entry.ts)
8. forge (no sandbox-entry.ts, has src/email.ts)

---

## Test Case 1: Basic Resolution - Single Plugin

**Case ID:** TC-001
**Title:** resolvePluginEntrypoint("membership") returns correct path

**Preconditions:**
- Plugin "membership" exists in `plugins/membership/`
- File exists at `plugins/membership/src/sandbox-entry.ts`

**Test Input:**
```typescript
const result = resolvePluginEntrypoint("membership");
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/membership/src/sandbox-entry.ts",
  sourceFile: true,  // indicates .ts source, not compiled
  absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"
}
```

**Acceptance Criteria:**
- Returns success: true
- Path points to `plugins/membership/src/sandbox-entry.ts`
- Correctly identifies as source file (.ts)
- Absolute path is accurate
- Does not modify global state or environment

**Error Handling:** None - happy path only

**Related Decisions:** Decision 2 (Convention-Based Plugin System), Decision 5 (Documentation Philosophy)

---

## Test Case 2: Missing Plugin Error

**Case ID:** TC-002
**Title:** Resolution fails for non-existent plugin with clear, actionable error

**Preconditions:**
- Plugin "nonexistent-plugin" does NOT exist in `plugins/`
- No fallback configuration for this plugin

**Test Input:**
```typescript
const result = resolvePluginEntrypoint("nonexistent-plugin");
```

**Expected Output:**
```typescript
{
  success: false,
  error: "PLUGIN_NOT_FOUND",
  message: "Plugin 'nonexistent-plugin' not found. Expected location: plugins/nonexistent-plugin/src/sandbox-entry.ts",
  tried: [
    "plugins/nonexistent-plugin/src/sandbox-entry.ts",
    "plugins/nonexistent-plugin/src/index.ts",
    "plugins/nonexistent-plugin/src/plugin.ts"
  ],
  suggestion: "Check plugin name spelling. Available plugins: membership, formforge, eventdash, reviewpulse, seodash, commercekit, adminpulse, forge"
}
```

**Acceptance Criteria:**
- Returns success: false
- Includes specific error code (PLUGIN_NOT_FOUND)
- Lists all paths that were checked
- Provides helpful suggestion listing available plugins
- Error message is clear enough for developer to fix in <2 minutes
- Follows Decision 3 (Self-Verifying Build System) error specification

**Error Handling:** Specified with actionable error message per Decision 3

**Related Decisions:** Decision 3 (Self-Verifying Build System), Decision 5 (Documentation)

---

## Test Case 3: Extension Resolution (.ts vs .js)

**Case ID:** TC-003
**Title:** Handles both .ts and .js extensions; prefers compiled .js if exists

**Preconditions:**
- Plugin has both `src/sandbox-entry.ts` (source) and `dist/sandbox-entry.js` (compiled)
- Resolver should prefer compiled version for production consistency

**Test Variations:**

### 3a. Prefers compiled .js when both exist
```typescript
const result = resolvePluginEntrypoint("formforge", { preferCompiled: true });
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/formforge/dist/sandbox-entry.js",
  sourceFile: false,  // compiled, not source
  absolutePath: "/home/agent/shipyard-ai/plugins/formforge/dist/sandbox-entry.js"
}
```

### 3b. Falls back to .ts if .js doesn't exist
```typescript
const result = resolvePluginEntrypoint("eventdash", { preferCompiled: true });
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/eventdash/src/sandbox-entry.ts",
  sourceFile: true,
  absolutePath: "/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
}
```

**Acceptance Criteria:**
- Prefers .js (compiled) in production when available
- Falls back to .ts (source) when compiled doesn't exist
- Correctly flags whether file is source or compiled
- Maintains consistency between local dev and production paths
- Selection is deterministic (same input always yields same output)

**Related Decisions:** Decision 1 (Immediate Fix Strategy uses .js), Decision 2 (Convention System)

---

## Test Case 4: Multiple Plugin Resolution

**Case ID:** TC-004
**Title:** Resolves multiple plugins in a single array call

**Preconditions:**
- All three plugins exist in `plugins/` directory
- No circular dependencies

**Test Input:**
```typescript
const result = resolvePluginEntrypoints([
  "membership",
  "formforge",
  "eventdash"
]);
```

**Expected Output:**
```typescript
{
  success: true,
  resolved: [
    {
      name: "membership",
      entrypoint: "plugins/membership/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"
    },
    {
      name: "formforge",
      entrypoint: "plugins/formforge/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts"
    },
    {
      name: "eventdash",
      entrypoint: "plugins/eventdash/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
    }
  ]
}
```

**Acceptance Criteria:**
- All plugins resolve successfully
- Order matches input array order
- Each resolved plugin includes all required metadata
- Partial failures are reported (see TC-004b)

### 4b. Partial failure scenario
**Test Input (one plugin doesn't exist):**
```typescript
const result = resolvePluginEntrypoints([
  "membership",
  "nonexistent",
  "formforge"
]);
```

**Expected Output:**
```typescript
{
  success: false,
  resolved: [
    {
      name: "membership",
      entrypoint: "plugins/membership/src/sandbox-entry.ts",
      sourceFile: true
    }
  ],
  failed: [
    {
      name: "nonexistent",
      error: "PLUGIN_NOT_FOUND",
      message: "Plugin 'nonexistent' not found. Expected location: plugins/nonexistent/src/sandbox-entry.ts"
    }
  ],
  failureMode: "halt"  // Should stop at first failure for build system
}
```

**Acceptance Criteria:**
- Stops at first failure (fail-fast behavior)
- Reports which plugin failed and why
- Build system can use this to fail loudly
- Returns already-resolved plugins for diagnostic purposes

**Related Decisions:** Decision 3 (Build fails loudly on first plugin error)

---

## Test Case 5: Absolute vs Relative Path Resolution

**Case ID:** TC-005
**Title:** Handles both absolute and relative path configurations correctly

**Preconditions:**
- Resolver is called from different working directories
- Must return consistent absolute paths regardless of cwd

**Test Variations:**

### 5a. Resolution from project root
```typescript
// cwd = /home/agent/shipyard-ai
const result = resolvePluginEntrypoint("membership");
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/membership/src/sandbox-entry.ts",  // relative to root
  absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"
}
```

### 5b. Resolution from subdirectory
```typescript
// cwd = /home/agent/shipyard-ai/apps/some-app
const result = resolvePluginEntrypoint("membership");
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "../../plugins/membership/src/sandbox-entry.ts",  // relative to cwd
  absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"  // always absolute
}
```

**Acceptance Criteria:**
- Absolute path is always correct regardless of cwd
- Relative path is adjusted based on caller location
- Both paths resolve to same file when tested
- Supports both relative and absolute path queries
- Local dev and production resolve to identical absolute paths

**Related Decisions:** Decision 1 (Local-production parity)

---

## Test Case 6: Fallback Naming Conventions

**Case ID:** TC-006
**Title:** Resolves plugins using fallback naming conventions when primary convention doesn't exist

**Preconditions:**
- Primary convention: `plugins/{name}/src/sandbox-entry.ts`
- Fallback 1: `plugins/{name}/src/index.ts`
- Fallback 2: `plugins/{name}/src/plugin.ts`
- Fallback 3: `plugins/{name}/index.ts`

**Test Input (primary convention exists):**
```typescript
const result = resolvePluginEntrypoint("membership");
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/membership/src/sandbox-entry.ts",
  convention: "primary"
}
```

**Test Input (primary doesn't exist, fallback 1 does):**
```typescript
// Hypothetically, if sandbox-entry.ts is missing but index.ts exists
const result = resolvePluginEntrypoint("some-plugin");
```

**Expected Output:**
```typescript
{
  success: true,
  entrypoint: "plugins/some-plugin/src/index.ts",
  convention: "fallback_1",
  warning: "Primary convention not found; using fallback"
}
```

**Acceptance Criteria:**
- Tries conventions in documented order
- Returns first convention that resolves to actual file
- Includes which convention was matched
- Logs warning if fallback was used (for developer awareness)
- Convention search order is deterministic and documented

**Related Decisions:** Decision 2 (Convention system), Decision 5 (Documentation philosophy)

---

## Test Case 7: Error Cases - Missing Files

**Case ID:** TC-007
**Title:** Gracefully handles missing files and directory structures

**Test Variations:**

### 7a. Directory exists but no entrypoint file
```typescript
// plugins/test-plugin/ exists but plugins/test-plugin/src/sandbox-entry.ts doesn't
const result = resolvePluginEntrypoint("test-plugin");
```

**Expected Output:**
```typescript
{
  success: false,
  error: "PLUGIN_ENTRYPOINT_NOT_FOUND",
  message: "Plugin 'test-plugin' directory exists but no entrypoint file found",
  tried: [
    "plugins/test-plugin/src/sandbox-entry.ts",
    "plugins/test-plugin/src/index.ts",
    "plugins/test-plugin/src/plugin.ts",
    "plugins/test-plugin/index.ts"
  ],
  suggestion: "Create plugins/test-plugin/src/sandbox-entry.ts or one of the fallback conventions"
}
```

### 7b. Plugin directory doesn't exist
```typescript
const result = resolvePluginEntrypoint("missing-plugin");
```

**Expected Output:**
```typescript
{
  success: false,
  error: "PLUGIN_NOT_FOUND",
  message: "Plugin 'missing-plugin' not found. Expected directory: plugins/missing-plugin/",
  suggestion: "Check plugin name spelling. Available plugins: membership, formforge, eventdash, reviewpulse, seodash, commercekit, adminpulse, forge"
}
```

**Acceptance Criteria:**
- Distinguishes between "plugin not found" and "plugin found but no entrypoint"
- Provides different recovery suggestions for each case
- Error codes are unique and queryable
- Helps developers fix configuration quickly

**Related Decisions:** Decision 3 (Build-time validation, loud failures)

---

## Test Case 8: Integration Test - All Production Plugins

**Case ID:** TC-008
**Title:** Resolver works with all 6+ plugins in the actual /plugins/ directory

**Preconditions:**
- All plugins are installed in `/home/agent/shipyard-ai/plugins/`
- Each plugin has the expected directory structure

**Test Input (Happy Path - Complete Plugins):**
```typescript
const availablePlugins = [
  "membership",
  "formforge",
  "eventdash",
  "reviewpulse",
  "seodash",
  "commercekit"
];

const result = resolvePluginEntrypoints(availablePlugins);
```

**Expected Output (Complete Plugins):**
```typescript
{
  success: true,
  resolved: [
    {
      name: "membership",
      entrypoint: "plugins/membership/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"
    },
    {
      name: "formforge",
      entrypoint: "plugins/formforge/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts"
    },
    {
      name: "eventdash",
      entrypoint: "plugins/eventdash/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
    },
    {
      name: "reviewpulse",
      entrypoint: "plugins/reviewpulse/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts"
    },
    {
      name: "seodash",
      entrypoint: "plugins/seodash/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts"
    },
    {
      name: "commercekit",
      entrypoint: "plugins/commercekit/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/commercekit/src/sandbox-entry.ts"
    }
  ],
  resolvedCount: 6,
  failedCount: 0
}
```

**Test Input (With Incomplete Plugins):**
```typescript
const allPlugins = [
  "membership",
  "formforge",
  "eventdash",
  "reviewpulse",
  "seodash",
  "commercekit",
  "adminpulse",  // no sandbox-entry.ts
  "forge"        // no sandbox-entry.ts
];

const result = resolvePluginEntrypoints(allPlugins);
```

**Expected Output (Partial Resolution):**
```typescript
{
  success: false,  // because some plugins failed
  resolved: [
    {
      name: "membership",
      entrypoint: "plugins/membership/src/sandbox-entry.ts",
      sourceFile: true,
      absolutePath: "/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts"
    },
    // ... 5 more successful resolutions
  ],
  failed: [
    {
      name: "adminpulse",
      error: "PLUGIN_ENTRYPOINT_NOT_FOUND",
      message: "Plugin 'adminpulse' directory exists but no entrypoint file found",
      tried: ["plugins/adminpulse/src/sandbox-entry.ts", ...]
    },
    {
      name: "forge",
      error: "PLUGIN_ENTRYPOINT_NOT_FOUND",
      message: "Plugin 'forge' directory exists but no entrypoint file found",
      tried: ["plugins/forge/src/sandbox-entry.ts", ...]
    }
  ],
  resolvedCount: 6,
  failedCount: 2
}
```

**Actual Plugins in Monorepo:**

| # | Plugin Name   | Source File Location                          | Status   |
|---|----------------|----------------------------------------------|----------|
| 1 | membership     | plugins/membership/src/sandbox-entry.ts     | ✓ exists |
| 2 | formforge      | plugins/formforge/src/sandbox-entry.ts      | ✓ exists |
| 3 | eventdash      | plugins/eventdash/src/sandbox-entry.ts      | ✓ exists |
| 4 | reviewpulse    | plugins/reviewpulse/src/sandbox-entry.ts    | ✓ exists |
| 5 | seodash        | plugins/seodash/src/sandbox-entry.ts        | ✓ exists |
| 6 | commercekit    | plugins/commercekit/src/sandbox-entry.ts    | ✓ exists |
| 7 | adminpulse     | (incomplete - no sandbox-entry.ts)          | ✗ missing |
| 8 | forge          | (incomplete - no sandbox-entry.ts)          | ✗ missing |

**Acceptance Criteria:**
- All 6 complete plugins resolve successfully
- 2 incomplete plugins (adminpulse, forge) fail with actionable errors
- All resolved paths are accurate and point to real files
- No plugins are silently skipped or dropped
- Build fails loudly on incomplete plugins
- Total resolution time is < 100ms (performance acceptable for build time)
- Resolver can be used in build system validation script

**Verification Steps:**
1. Run resolver on actual monorepo
2. Verify each resolved path exists and is a file
3. Check that resolved paths are executable/readable by build system
4. Confirm all 6 complete plugins appear in successful resolutions
5. Confirm adminpulse and forge fail with appropriate errors

**Related Decisions:** Decision 2 (Convention system for all plugins), Decision 3 (Build-time validation)

---

## Error Handling & Recovery Matrix

| Error Code | Condition | User Action | Recovery |
|-----------|-----------|-------------|----------|
| PLUGIN_NOT_FOUND | Plugin directory doesn't exist | Check spelling of plugin name | Provide list of available plugins |
| PLUGIN_ENTRYPOINT_NOT_FOUND | Directory exists, but no entrypoint | Create entrypoint file | Suggest correct directory structure |
| INVALID_PLUGIN_NAME | Name contains invalid characters | Fix plugin name | Show regex pattern for valid names |
| FILE_NOT_READABLE | Entrypoint exists but unreadable | Check file permissions | Suggest chmod command |
| AMBIGUOUS_ENTRYPOINT | Multiple conventions match | Clarify convention priority | Document which takes precedence |

---

## Performance Requirements

- **Single plugin resolution:** < 10ms
- **Multiple plugins (8):** < 50ms
- **Caching:** Results should be cached in same build session
- **Memory:** < 1MB for all 8 plugins' metadata

---

## Related Implementation Requirements

From Decisions document (line 219):

### Plugin Resolver Specification
```typescript
// Target API
plugins: ["membership"]  // System auto-resolves entrypoint

// Convention: Plugin name → file path
"membership" → plugins/membership/src/sandbox-entry.ts

// Build system integration
loadPlugins(["membership"]) → auto-resolve & bundle

// Error handling
Loud failure if plugin won't work in production
No silent drops from manifest
```

### Success Criteria (from Decisions, line 361)
- ✅ Plugin loads in production (manifest verification)
- ✅ `plugins: ["membership"]` convention works
- ✅ Build fails loudly on broken plugins
- ✅ Local dev and production behave identically (no divergence)

---

## Test Execution Strategy

### Unit Tests
- TC-001: Basic resolution (happy path)
- TC-002: Missing plugin with error
- TC-003: Extension preference (.ts vs .js)
- TC-004: Multiple plugins
- TC-005: Path resolution (absolute/relative)
- TC-006: Naming convention fallbacks
- TC-007: Error cases and missing files

### Integration Tests
- TC-008: All production plugins in actual filesystem

### Test Environment
- Node.js 18+
- TypeScript 5.0+
- Testing framework: Vitest (for consistency with plugin tests)
- File system: Real filesystem (not mocked)

### Mock Requirements
- None recommended for core test cases
- Use real filesystem to catch actual deployment issues early

---

## Acceptance Checklist

- [ ] All 8 test cases defined with input/output specifications
- [ ] Error cases include actionable error messages per Decision 3
- [ ] Integration test verifies all 6+ plugins in monorepo
- [ ] Test specification links to requirements (REQ-016, Decisions line 219)
- [ ] Performance targets documented
- [ ] Recovery paths documented for each error
- [ ] Expected vs actual plugin count verified in monorepo
- [ ] Test cases are deterministic (same input = same output)
