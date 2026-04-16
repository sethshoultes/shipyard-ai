# Plugin Loader Integration with Convention-Based Resolver

**Task**: Design how the existing Emdash plugin loader will integrate with the convention-based plugin resolver.

**Status**: Design specification (non-implementation)

**Reference**: REQ-015 (Decisions line 212), requires plugin-resolver-spec.ts (Task 4)

---

## 1. Overview

The Emdash plugin loader currently accepts an array of plugin descriptors in the Astro integration config:

```typescript
// Current implementation (requires manual path specification)
plugins: [{
  type: "standard",
  entrypoint: "@shipyard/membership/sandbox",  // npm alias (broken in Workers)
  workerLoader: "esm"
}]
```

The new convention-based resolver will replace manual entrypoint configuration with automatic path resolution:

```typescript
// After integration (convention-based, zero-config)
plugins: ["membership"]  // auto-resolves to plugins/membership/src/sandbox-entry.ts
```

This design document specifies how the resolver integrates into the plugin loading pipeline without modifying the Emdash core code (which is outside this repository).

---

## 2. Current Plugin Loading Flow

### 2.1 Astro Integration Entry Point

**File**: `examples/sunrise-yoga/astro.config.mjs`

```typescript
import emdash from "emdash/astro";
import { membershipPlugin } from "../../plugins/membership/src/index.js";

export default defineConfig({
  integrations: [
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [membershipPlugin()],  // ← Plugin passed here
    }),
  ],
});
```

### 2.2 Plugin Function Return Value

**File**: `plugins/membership/src/index.ts`

The plugin function (`membershipPlugin()`) returns a plugin descriptor object:

```typescript
export function membershipPlugin() {
  return {
    type: "standard",
    entrypoint: "@shipyard/membership/sandbox",  // ← BROKEN: npm alias
    workerLoader: "esm"
  };
}
```

### 2.3 Emdash Integration Processing

The Emdash Astro integration (in the Emdash core repo, outside this repo) receives the plugins array and:

1. **Validates** each plugin descriptor
2. **Bundles** the entrypoint file
3. **Registers** the plugin in the manifest
4. **Passes** the manifest to the Cloudflare Worker

**Current behavior**: The integration tries to resolve `@shipyard/membership/sandbox` as an npm alias. This works in local dev (via node_modules) but fails in Cloudflare Workers (no node_modules at runtime).

---

## 3. Integration Point: Where the Resolver Gets Called

### 3.1 Two Input Formats Must Be Supported

The plugin loader integration must support BOTH formats during the transition:

#### Format A: Array of Plugin Descriptors (Existing)

```typescript
// Emdash config - BEFORE integration
plugins: [
  {
    type: "standard",
    entrypoint: "./plugins/membership/src/sandbox-entry.ts",  // explicit path
    workerLoader: "esm"
  }
]
```

#### Format B: Array of Plugin Names (Convention-based)

```typescript
// Emdash config - AFTER integration
plugins: ["membership", "payments"]  // convention-based
```

### 3.2 Resolver Integration Point

The resolver should be called in the Emdash core's plugin loader **before** bundling:

```
┌─────────────────────────────────────────────────┐
│  Emdash Astro Integration (emdash/astro)        │
│                                                 │
│  1. Receive: plugins config (string[] or        │
│     PluginDescriptor[])                        │
│                                                 │
│  2. NORMALIZE: Convert string[] to              │
│     PluginDescriptor[] using resolver           │
│                                                 │
│  3. VALIDATE: Call resolver for each plugin     │
│     to ensure entrypoint exists                 │
│                                                 │
│  4. BUNDLE: Pass normalized descriptors to      │
│     bundler                                     │
│                                                 │
│  5. MANIFEST: Generate plugin manifest          │
│  └─────────────────────────────────────────────┘
```

### 3.3 In Code (Emdash Core - Outside This Repo)

The Emdash core integration would implement something like:

```typescript
// This code goes in emdash core, not in this repo
// Shown here only to illustrate the integration point

import { resolvePluginEntrypoint } from './plugin-resolver';

async function emdashAstroIntegration(config) {
  const plugins = config.plugins || [];

  // Normalize: convert string[] to PluginDescriptor[]
  const normalizedPlugins = plugins.map(plugin => {
    if (typeof plugin === 'string') {
      // String: use convention-based resolver
      const entrypoint = resolvePluginEntrypoint(plugin);
      return {
        type: "standard",
        entrypoint,      // ← Resolved by convention
        workerLoader: "esm"
      };
    }
    // Already a descriptor: use as-is
    return plugin;
  });

  // Continue with bundling, validation, etc.
  return bundlePlugins(normalizedPlugins);
}
```

---

## 4. Handling Array of Strings vs Array of PluginDescriptor Objects

### 4.1 Input Type Definition

The plugin loader should accept a union type:

```typescript
type PluginConfig = (string | PluginDescriptor)[];

interface PluginDescriptor {
  type: "standard";
  entrypoint: string;        // File path (not npm alias)
  workerLoader: "esm" | "commonjs";
}
```

### 4.2 Normalization Algorithm

```
for each item in plugins array:
  if typeof item === 'string':
    // Convention-based: resolve using plugin-resolver
    resolved_path = resolvePluginEntrypoint(item)
    descriptor = {
      type: "standard",
      entrypoint: resolved_path,
      workerLoader: "esm"           // Default loader
    }
  else:
    // Already a descriptor: validate & use
    descriptor = item               // Assume valid

  // Both paths result in a normalized PluginDescriptor
  normalizedPlugins.push(descriptor)
```

### 4.3 Practical Example

**Input (mixed format)**:

```typescript
plugins: [
  "membership",                    // ← String: use convention
  {                                // ← Descriptor: use explicit path
    type: "standard",
    entrypoint: "./custom-plugin.ts",
    workerLoader: "commonjs"
  },
  "payments"                       // ← String: use convention
]
```

**After normalization**:

```typescript
plugins: [
  {
    type: "standard",
    entrypoint: "/absolute/path/to/plugins/membership/src/sandbox-entry.ts",
    workerLoader: "esm"
  },
  {
    type: "standard",
    entrypoint: "/absolute/path/to/custom-plugin.ts",
    workerLoader: "commonjs"
  },
  {
    type: "standard",
    entrypoint: "/absolute/path/to/plugins/payments/src/sandbox-entry.ts",
    workerLoader: "esm"
  }
]
```

---

## 5. Error Propagation: Resolver Errors Must Fail the Build

### 5.1 Design Principle

**Rule**: If a plugin cannot be resolved, the BUILD MUST FAIL, not silently drop the plugin.

This prevents production deployments with broken plugins.

### 5.2 Error Handling Strategy

#### Option A: Fail-Fast (Recommended)

Fail immediately when the FIRST plugin cannot be resolved:

```typescript
function normalizePlugins(config) {
  const normalized = [];

  for (const plugin of config.plugins) {
    if (typeof plugin === 'string') {
      try {
        const entrypoint = resolvePluginEntrypoint(plugin);
        normalized.push({
          type: "standard",
          entrypoint,
          workerLoader: "esm"
        });
      } catch (error) {
        // FAIL IMMEDIATELY: this propagates to the build system
        throw new Error(
          `Failed to load plugin "${plugin}"\n${error.message}`
        );
      }
    } else {
      normalized.push(plugin);
    }
  }

  return normalized;
}
```

**Behavior**: First unresolvable plugin stops the entire build.

**Pros**: Fast feedback, clear cause of failure
**Cons**: Developer has to fix one plugin at a time

#### Option B: Collect-All-Errors (Alternative)

Collect all errors and report them together:

```typescript
function normalizePlugins(config) {
  const normalized = [];
  const errors = [];

  for (const plugin of config.plugins) {
    if (typeof plugin === 'string') {
      const result = resolvePluginEntrypointSafe(plugin);
      if (result.ok) {
        normalized.push({
          type: "standard",
          entrypoint: result.path,
          workerLoader: "esm"
        });
      } else {
        errors.push(`Plugin "${plugin}": ${result.error}`);
      }
    } else {
      normalized.push(plugin);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Failed to load ${errors.length} plugin(s):\n${errors.join('\n')}`
    );
  }

  return normalized;
}
```

**Behavior**: Collect all failures, report everything at once.

**Pros**: Developer sees all problems in one pass
**Cons**: Slower feedback (has to wait for all checks)

### 5.3 Recommended Approach: Fail-Fast

Use **fail-fast** because:
1. Plugin configurations are typically small (< 5 plugins per site)
2. Fast feedback loop encourages quick iteration
3. Prevents "silent success with missing plugins" scenario
4. Error message is immediately actionable

### 5.4 Error Propagation to Build System

The Emdash integration runs during the Astro build process. When the integration throws an error:

```
1. Emdash integration throws during config processing
   ↓
2. Astro catches the error and logs it
   ↓
3. Build fails with non-zero exit code
   ↓
4. CI/CD pipeline stops (fail-safe for deployment)
```

**Verification**: The build should exit with code 1 (non-zero) if any plugin fails to resolve.

---

## 6. Before/After Code Examples

### 6.1 Site Configuration Example

#### BEFORE (Manual path configuration)

**File**: `examples/sunrise-yoga/astro.config.mjs`

```typescript
import emdash from "emdash/astro";
import { membershipPlugin } from "../../plugins/membership/src/index.js";

export default defineConfig({
  integrations: [
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [membershipPlugin()],  // ← Returns descriptor with manual path
    }),
  ],
});
```

**File**: `plugins/membership/src/index.ts`

```typescript
// ❌ BEFORE: Manual path in descriptor
export function membershipPlugin() {
  return {
    type: "standard",
    entrypoint: "@shipyard/membership/sandbox",  // npm alias (broken)
    workerLoader: "esm"
  };
}
```

#### AFTER (Convention-based)

**File**: `examples/sunrise-yoga/astro.config.mjs`

```typescript
import emdash from "emdash/astro";

export default defineConfig({
  integrations: [
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: ["membership"],  // ← String: auto-resolve convention
    }),
  ],
});
```

**File**: `plugins/membership/src/index.ts` (Can be deleted or simplified)

```typescript
// ✅ AFTER: Convention-based, no export needed
// The plugin is registered via string name in astro.config.mjs
// File kept for reference, but not required
```

**Alternative**: If plugin needs custom configuration, keep the descriptor approach:

```typescript
// Still possible for advanced use cases
plugins: [
  "membership",  // ← Simple: convention-based
  {
    // Advanced: explicit descriptor for custom workerLoader
    type: "standard",
    entrypoint: "./plugins/custom-loader.ts",
    workerLoader: "commonjs"
  }
]
```

### 6.2 Plugin Function Signature Changes

#### BEFORE

```typescript
// Each plugin exports a function returning a descriptor
export function membershipPlugin() {
  return {
    type: "standard",
    entrypoint: "@shipyard/membership/sandbox",
    workerLoader: "esm"
  };
}
```

#### AFTER

Two approaches (both valid during transition):

**Approach 1: Use String Convention** (Recommended)

```typescript
// astro.config.mjs
plugins: ["membership"]  // Don't call membershipPlugin() at all
```

**Approach 2: Keep Plugin Function** (For complex config)

```typescript
// plugins/membership/src/index.ts
export function membershipPlugin() {
  return {
    type: "standard",
    entrypoint: "./plugins/membership/src/sandbox-entry.ts",  // Explicit path
    workerLoader: "esm"
  };
}
```

```typescript
// astro.config.mjs
plugins: [membershipPlugin()]  // Call function for custom config
```

---

## 7. Migration Guide: Converting Existing Plugins

### 7.1 Step-by-Step Conversion Process

#### Step 1: Understand the Convention

**Convention Rule**: Plugin named `"membership"` resolves to:
- First choice: `plugins/membership/src/sandbox-entry.ts`
- Fallback: `plugins/membership/dist/sandbox-entry.js`
- Last resort: `plugins/membership/src/index.ts`

#### Step 2: Verify Plugin Directory Structure

Run this check to ensure your plugin matches the convention:

```bash
# For the membership plugin:
ls -la plugins/membership/src/
# Should contain: sandbox-entry.ts (or index.ts)

ls -la plugins/membership/dist/
# Optional: should contain: sandbox-entry.js (if compiled)
```

#### Step 3: Update astro.config.mjs

**Before**:

```typescript
import { membershipPlugin } from "../../plugins/membership/src/index.js";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [membershipPlugin()],
    }),
  ],
});
```

**After**:

```typescript
// Remove the import statement ↑

export default defineConfig({
  integrations: [
    emdash({
      plugins: ["membership"],  // ← Change to string
    }),
  ],
});
```

#### Step 4: Remove or Simplify Plugin Function

**Option A: Delete plugin function** (if no custom config needed)

```typescript
// plugins/membership/src/index.ts

// Delete this entire file or keep it empty
```

**Option B: Simplify for custom config** (if special settings needed)

```typescript
// plugins/membership/src/index.ts

// ✅ Only needed if you need custom configuration
export function membershipPlugin(options?: { customLoader?: string }) {
  return {
    type: "standard",
    entrypoint: "./plugins/membership/src/sandbox-entry.ts",  // Explicit path
    workerLoader: options?.customLoader ?? "esm"
  };
}
```

#### Step 5: Test the Migration

```bash
# Build locally
npm run build

# Verify build succeeds
# Verify plugin appears in manifest: curl http://localhost:3000/api/plugins/manifest

# Deploy to production
npm run deploy

# Verify manifest in production
# curl https://[site].emdash.ai/api/plugins/manifest
```

### 7.2 Multi-Plugin Migration Example

**Before** (Multiple plugins with manual paths):

```typescript
import emdash from "emdash/astro";
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { paymentsPlugin } from "../../plugins/payments/src/index.js";
import { analyticsPlugin } from "../../plugins/analytics/src/index.js";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [
        membershipPlugin(),
        paymentsPlugin(),
        analyticsPlugin()
      ],
    }),
  ],
});
```

**After** (Convention-based, zero imports):

```typescript
import emdash from "emdash/astro";

export default defineConfig({
  integrations: [
    emdash({
      plugins: ["membership", "payments", "analytics"],
    }),
  ],
});
```

**Migration time**: ~5 minutes per site (mostly copy-paste)

### 7.3 Rollback Plan

If migration causes issues, you can revert to explicit descriptors:

```typescript
plugins: [
  "membership",  // ← This works (convention)
  {
    // ← Or use explicit descriptor (always works)
    type: "standard",
    entrypoint: "./plugins/custom-plugin.ts",
    workerLoader: "esm"
  }
]
```

Both formats can coexist in the same configuration.

---

## 8. Key Design Decisions

### 8.1 Why Convention Over Configuration?

| Aspect | Configuration (Before) | Convention (After) |
|--------|------------------------|-------------------|
| **Lines of code** | 5-8 (per plugin) | 1 (per plugin) |
| **Debugging time** | 30 min (trace npm alias) | 30 sec (clear error) |
| **Local-prod parity** | Fragile (alias breaks in Workers) | Guaranteed (simple path) |
| **Cognitive load** | High (manual paths) | Low (obvious pattern) |
| **Error messages** | Generic | Actionable |

### 8.2 Entrypoint File Naming Convention

We chose `sandbox-entry.ts` because:

1. **Explicit**: "sandbox" clearly indicates this is a Cloudflare Worker context
2. **Discoverable**: Developers immediately understand where the plugin runs
3. **Distinct**: Not confused with `index.ts` (which might be used for other exports)
4. **Consistent**: Same name across all plugins

### 8.3 Resolver Search Order

The resolver tries paths in this order:

1. `src/sandbox-entry.ts` (TypeScript source)
2. `dist/sandbox-entry.js` (Compiled output)
3. `src/sandbox.ts` (Alternative naming)
4. `dist/sandbox.js` (Alternative compiled)
5. `src/index.ts` (Last resort)
6. `dist/index.js` (Last resort compiled)

This allows flexibility while maintaining clear fallbacks.

### 8.4 Fail-Fast Error Behavior

We chose fail-fast (stop on first error) rather than collect-all-errors because:

1. Plugin configs are typically small (<5 plugins)
2. Fast feedback loop encourages iteration
3. Prevents "silent success with broken plugins"
4. Simpler for developers to reason about

---

## 9. Integration Checklist for Emdash Core

When implementing this design in the Emdash core repo, ensure:

- [ ] Import `resolvePluginEntrypoint` from this repo's plugin-resolver-spec.ts
- [ ] Normalize string[] to PluginDescriptor[] in the config processing step
- [ ] Validate all plugins can be resolved BEFORE bundling
- [ ] Throw descriptive errors if any plugin cannot be resolved
- [ ] Return absolute paths from the resolver (not relative)
- [ ] Support mixed format: both strings and descriptors in same array
- [ ] Document the convention in Emdash README (link to this file)
- [ ] Add unit tests for string-to-descriptor normalization
- [ ] Test error handling: missing plugin should fail build
- [ ] Verify that both `astro build` and `astro dev` work with convention

---

## 10. Related Files and References

### 10.1 Files in This Repository

- **`/home/agent/shipyard-ai/.planning/plugin-resolver-spec.ts`** — Resolver implementation specification (Task 4)
- **`/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md`** — Decision rationale and requirements
- **`/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs`** — Current integration point
- **`/home/agent/shipyard-ai/plugins/membership/src/index.ts`** — Example plugin function

### 10.2 Implementation Files (Emdash Core Repo)

These files will be modified/created when implementing this design in the Emdash core:

- `packages/emdash/src/astro-integration.ts` — Main integration
- `packages/emdash/src/plugin-loader.ts` — Plugin loading logic
- `packages/emdash/tests/plugin-loader.test.ts` — Tests

### 10.3 External References

- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Emdash CMS**: https://github.com/emdash-cms/core
- **Astro Integration API**: https://docs.astro.build/en/reference/integrations-reference/

---

## 11. Success Criteria

This integration is complete when:

1. **String format works**: `plugins: ["membership"]` resolves to correct entrypoint
2. **Descriptor format works**: `plugins: [{entrypoint: "...", ...}]` still works
3. **Mixed format works**: Both strings and descriptors in same array
4. **Build fails on error**: Missing plugin stops the build (non-zero exit code)
5. **Error messages are actionable**: Developer immediately knows what to fix
6. **Local-production parity**: Same resolution logic in dev and build
7. **No breaking changes**: Existing descriptor-based configs continue to work
8. **Documentation complete**: Migration guide helps existing sites upgrade

---

## 12. Timeline and Scope

**Design Phase** (This Document): Complete

**Implementation Phase** (Emdash Core):
- Integrate resolver in Emdash plugin loader: ~2 hours
- Add tests and error handling: ~1 hour
- Documentation and examples: ~1 hour
- **Total**: ~4 hours (outside this repo)

**Validation Phase** (This Repo):
- Test convention resolution against actual plugins: ~30 minutes
- End-to-end test with sunrise-yoga site: ~30 minutes

**Total estimated effort**: ~5 hours of Emdash core work + 1 hour of validation

---

## 13. Document History

| Date | Author | Status | Notes |
|------|--------|--------|-------|
| 2026-04-16 | Phase 1 Design | Draft | Initial design specification for plugin loader integration |

---

**This design is ready for implementation in the Emdash core repository.**
