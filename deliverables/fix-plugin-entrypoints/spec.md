# Spec: Fix Plugin Entrypoints + Register All in Sunrise Yoga

**Priority**: P0 (Hotfix)
**Generated**: 2026-04-16
**PRD**: `/home/agent/shipyard-ai/prds/fix-plugin-entrypoints.md`
**Plan**: `/home/agent/shipyard-ai/.planning/phase-1-plan.md`

---

## Goals

Fix broken npm-alias entrypoints in 4 Emdash plugins and register all 6 working plugins in Sunrise Yoga example site.

### Problem Statement

6 of 8 Emdash plugins are not registered in Sunrise Yoga and 4 have broken npm-alias entrypoints that fail on Cloudflare Workers.

The broken pattern:
```typescript
entrypoint: "@shipyard/<name>/sandbox"
```

**Why it fails**: npm aliases work in local development via `node_modules` but fail on Cloudflare Workers which only has access to bundled code. The bundler cannot resolve npm aliases at runtime.

### Success Criteria

- [ ] All plugin entrypoints use file path resolution, not npm alias
- [ ] All 6 working plugins registered in `examples/sunrise-yoga/astro.config.mjs`
- [ ] `npm run build` succeeds in sunrise-yoga directory
- [ ] Changes committed and pushed to remote

---

## Implementation Approach

### Phase 1: Fix Plugin Entrypoints (Wave 1 — Parallel)

Replace npm-alias entrypoints with file path resolution in 4 plugins:
- `plugins/commercekit/src/index.ts`
- `plugins/formforge/src/index.ts`
- `plugins/reviewpulse/src/index.ts`
- `plugins/seodash/src/index.ts`

**Pattern to implement** (from `plugins/membership/src/index.ts`):

```typescript
// Add imports at top of file
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Inside the plugin function, before return statement
export function <pluginName>Plugin() {
  // NOTE: Use real file path instead of npm alias (@shipyard/<name>/sandbox)
  // The alias works in local dev via node_modules but fails in Cloudflare Workers
  // which only has access to bundled code. Bundler resolves absolute paths correctly.
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts");

  return definePlugin({
    // ...
    entrypoint: entrypointPath, // ← changed from "@shipyard/<name>/sandbox"
  });
}
```

### Phase 2: Register Plugins in Sunrise Yoga (Wave 2 — After Wave 1)

Update `examples/sunrise-yoga/astro.config.mjs` to import and register all 6 plugins:

1. Add imports (after existing membership and eventdash imports):
   ```javascript
   import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";
   import { formforgePlugin } from "../../plugins/formforge/src/index.js";
   import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";
   import { seodashPlugin } from "../../plugins/seodash/src/index.js";
   ```

2. Update plugins array:
   ```javascript
   plugins: [
     membershipPlugin(),
     eventdashPlugin(),
     commercekitPlugin(),
     formforgePlugin(),
     reviewpulsePlugin(),
     seodashPlugin(),
   ],
   ```

3. Incremental build testing:
   - Start with baseline (membership + eventdash only)
   - Add each plugin one at a time and run build
   - If a plugin fails, remove it and document the failure
   - Final build with all working plugins

### Phase 3: Verification and Commit

1. Run final build: `cd examples/sunrise-yoga && npm run build`
2. Verify build output shows all plugins loaded
3. Commit all changes with conventional commit format
4. Push to remote repository

---

## Verification Criteria

### Per-Plugin Verification (Wave 1)

For each modified plugin (`commercekit`, `formforge`, `reviewpulse`, `seodash`):

1. **TypeScript compilation**:
   ```bash
   npx tsc --noEmit plugins/<plugin-name>/src/index.ts
   ```
   Expected: No compilation errors

2. **Pattern consistency**:
   - Compare against `plugins/membership/src/index.ts` (lines 16-28)
   - Verify imports at top: `fileURLToPath`, `dirname`, `join`
   - Verify path resolution code before return statement
   - Verify `entrypoint: entrypointPath` in definePlugin call

3. **File existence**:
   ```bash
   ls plugins/<plugin-name>/src/sandbox-entry.ts
   ```
   Expected: File exists

### Build Verification (Wave 2)

1. **Incremental build testing**:
   ```bash
   cd examples/sunrise-yoga
   # Test baseline
   npm run build
   # Add each plugin one-by-one and rebuild
   ```
   Expected: Each build succeeds (exit code 0)

2. **Final build**:
   ```bash
   cd examples/sunrise-yoga && npm run build 2>&1 | tee build.log
   tail -5 build.log
   ```
   Expected:
   - Exit code 0
   - No "Cannot find module" errors
   - No plugin import errors
   - Dist folder created: `ls examples/sunrise-yoga/dist`

3. **Plugin registration**:
   - Check build output for "emdash:plugins" log lines
   - Verify all 6 plugins show as registered

### Git Verification

1. **Git status**:
   ```bash
   git status
   ```
   Expected: 5 files modified (4 plugin index.ts + 1 astro.config.mjs)

2. **Commit verification**:
   ```bash
   git log -1 --oneline
   ```
   Expected: Conventional commit format with "fix:" or "feat:" prefix

3. **Push verification**:
   ```bash
   git status
   ```
   Expected: "Your branch is up to date with 'origin/...'"

---

## Files Modified

### Plugin Files (Wave 1)
1. `/home/agent/shipyard-ai/plugins/commercekit/src/index.ts`
   - Add imports: `fileURLToPath`, `dirname`, `join`
   - Add path resolution code
   - Replace entrypoint value

2. `/home/agent/shipyard-ai/plugins/formforge/src/index.ts`
   - Add imports: `fileURLToPath`, `dirname`, `join`
   - Add path resolution code
   - Replace entrypoint value

3. `/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts`
   - Add imports: `fileURLToPath`, `dirname`, `join`
   - Add path resolution code
   - Replace entrypoint value

4. `/home/agent/shipyard-ai/plugins/seodash/src/index.ts`
   - Add imports: `fileURLToPath`, `dirname`, `join`
   - Add path resolution code
   - Replace entrypoint value

### Configuration File (Wave 2)
5. `/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs`
   - Add 4 new plugin imports
   - Update plugins array to include all 6 plugins

---

## Files NOT Modified

- `/home/agent/shipyard-ai/plugins/adminpulse/` — PHP-based, not an Emdash plugin
- `/home/agent/shipyard-ai/plugins/forge/` — No plugin descriptor found
- `/home/agent/shipyard-ai/plugins/membership/src/index.ts` — Already using correct pattern
- `/home/agent/shipyard-ai/plugins/eventdash/src/index.ts` — Already using correct pattern

---

## Risk Mitigation

### High Risk: Untested Plugin Integration

Only membership and eventdash have been tested in Sunrise Yoga. The 4 new plugins may have build issues.

**Mitigation**:
- Incremental build testing (add plugins one-by-one)
- Remove any failing plugins and document the failure
- Continue with working plugins only

### Medium Risk: Identical Changes to 4 Files

A typo in the pattern affects all 4 plugins.

**Mitigation**:
- Use exact pattern from membership reference
- TypeScript compiler verification after each change
- Pattern consistency checks

### Low Risk: Cloudflare Workers Bundling

File path resolution must work correctly in Cloudflare Workers bundler.

**Mitigation**:
- Pattern is proven in membership/eventdash (git history verified)
- Same bundler configuration used across all plugins

---

## Reference Implementation

**Source**: `/home/agent/shipyard-ai/plugins/membership/src/index.ts` (lines 1-41)

```typescript
import type { EmDashPlugin } from "@emdash-cms/core/plugin";
import { definePlugin } from "@emdash-cms/core/plugin";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export function membershipPlugin(): EmDashPlugin {
  // NOTE: Use real file path instead of npm alias (@shipyard/membership/sandbox)
  // The alias works in local dev via node_modules but fails in Cloudflare Workers
  // which only has access to bundled code. Bundler resolves absolute paths correctly.
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts");

  return definePlugin({
    name: "@shipyard/membership",
    description: "Membership management and access control system",
    entrypoint: entrypointPath,
    sandbox: {
      adminPath: "/membership",
      adminTitle: "Members",
      framework: "react",
    },
  });
}
```

---

## Rollback Plan

If the build fails after all changes:

```bash
cd /home/agent/shipyard-ai
git checkout HEAD -- plugins/*/src/index.ts examples/sunrise-yoga/astro.config.mjs
cd examples/sunrise-yoga && npm run build
```

This reverts all changes and restores the previous working state.

---

## Token Budget

**Total Budget**: 100K tokens (hotfix tier)
- Research Phase: ~50K tokens (completed)
- Planning Phase: ~5K tokens (completed)
- Implementation Phase: ~20K tokens (estimated)
- Verification & Deploy: ~10K tokens (estimated)
- Buffer: ~15K tokens

**Remaining**: ~45K tokens for implementation and verification
