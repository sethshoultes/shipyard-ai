# Specification: Deploy All Plugins to Sunrise Yoga

**Priority:** P0 (Hotfix)
**Project:** Sunrise Yoga — Full Plugin Deployment
**PRD:** `/home/agent/shipyard-ai/prds/deploy-all-plugins.md`
**Plan:** `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
**Token Budget:** 100K (Revision tier)

---

## Goals

Deploy Sunrise Yoga to production with all 6 plugins registered, verified, and functioning correctly:

1. **Fix Prerequisites** — EventDash violations (95 → 0) and plugin entrypoint issues (3 plugins)
2. **Register All Plugins** — Add 4 missing plugins to `astro.config.mjs` (commercekit, formforge, reviewpulse, seodash)
3. **Build Successfully** — Verify all plugins compile and bundle without errors
4. **Deploy to Production** — Push to Cloudflare Workers at `https://yoga.shipyard.company`
5. **Smoke Test All Plugins** — Verify each plugin returns `UNAUTHORIZED` (loaded, auth-gated) not `NOT_FOUND` or `INTERNAL_ERROR`
6. **Commit and Push** — Save all changes to git with proper conventional commit format

---

## Implementation Approach

### Wave 1: Fix Prerequisites (Parallel Execution)

**Task 1: Fix EventDash Violations**
- **Problem:** `plugins/eventdash/src/sandbox-entry.ts` has 95 banned pattern violations (77 `throw new Response`, 18 `rc.user`/`rc.pathParams`)
- **Solution:** Copy fixed version from `/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts` (0 violations)
- **Verification:** `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` MUST return 0

**Task 2-4: Fix Plugin Entrypoints (formforge, reviewpulse, seodash)**
- **Problem:** Three plugins use banned npm alias pattern `@shipyard/{name}/sandbox` which fails on Cloudflare Workers
- **Solution:** Replace with file path resolution using `fileURLToPath`, `dirname`, `join` (proven pattern from membership/commercekit)
- **Pattern:**
  ```typescript
  import { fileURLToPath } from "node:url";
  import { dirname, join } from "node:path";

  // NOTE: Use real file path instead of npm alias
  // The alias works in local dev via node_modules but fails in Cloudflare Workers
  // which only has access to bundled code. Bundler resolves absolute paths correctly.
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts");

  return {
    entrypoint: entrypointPath,
    // ... rest of plugin descriptor
  };
  ```
- **Verification:** Each plugin's `index.ts` MUST have `entrypointPath` variable and NO `@shipyard/{name}/sandbox` string

### Wave 2: Register & Build

**Task 5: Register All 6 Plugins**
- **File:** `examples/sunrise-yoga/astro.config.mjs`
- **Changes:**
  - Add 4 import statements for missing plugins
  - Update `plugins` array to include all 6: `[membershipPlugin(), eventdashPlugin(), commercekitPlugin(), formforgePlugin(), reviewpulsePlugin(), seodashPlugin()]`
- **Verification:** `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` MUST return 6

**Build Verification:**
- Clear cache: `rm -rf examples/sunrise-yoga/dist examples/sunrise-yoga/.astro`
- Build: `cd examples/sunrise-yoga && npm run build`
- Exit code MUST be 0
- No ERROR messages in output
- `dist/` directory MUST exist with build artifacts

### Wave 3: Deploy & Smoke Test

**Task 6: Deploy to Cloudflare Workers**
- **Environment:** Source `/home/agent/shipyard-ai/.env` for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- **Command:** `npx wrangler deploy`
- **Verification:**
  - Exit code MUST be 0
  - Output MUST contain "Published" or "Deployed"
  - URL: `https://yoga.shipyard.company`

**Task 7: Smoke Test All Plugin Routes**
- **Test:** Call admin API for each plugin with `page_load` event
- **Command:**
  ```bash
  for plugin in membership eventdash commercekit formforge reviewpulse seodash; do
    echo "=== $plugin ==="
    curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin \
      -H "Content-Type: application/json" \
      -d '{"type":"page_load"}' | head -3
  done
  ```
- **Expected:** Each plugin MUST return `UNAUTHORIZED` (means plugin loaded, auth-gated)
- **Failure States:**
  - `NOT_FOUND` = plugin not registered in astro.config.mjs
  - `INTERNAL_ERROR` = plugin has runtime errors (likely violations)

### Wave 4: Commit & Push

**Task 8: Commit All Changes**
- **Files Modified:**
  1. `plugins/eventdash/src/sandbox-entry.ts` (violations fix)
  2. `plugins/formforge/src/index.ts` (entrypoint fix)
  3. `plugins/reviewpulse/src/index.ts` (entrypoint fix)
  4. `plugins/seodash/src/index.ts` (entrypoint fix)
  5. `examples/sunrise-yoga/astro.config.mjs` (plugin registration)
- **Commit Format:** Conventional commit with Co-Authored-By line (per CLAUDE.md)
- **Push:** `git push origin main`

---

## Verification Criteria

### REQ-1: All Plugins Registered
```bash
grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs
# MUST return: 6
```

### REQ-2: Zero Violations Across All Plugins
```bash
for f in plugins/*/src/sandbox-entry.ts; do
  name=$(echo $f | sed 's|plugins/||;s|/src/.*||')
  count=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$f" 2>/dev/null || echo 0)
  echo "$name: $count violations"
done
# ALL must show: 0 violations
```

### REQ-3: Build Succeeds
```bash
cd examples/sunrise-yoga
npm run build 2>&1 | tail -10
# Exit code: 0
# Output: NO "ERROR" messages
# Result: dist/ directory exists
```

### REQ-4: Deploy Succeeds
```bash
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
cd examples/sunrise-yoga
npx wrangler deploy 2>&1 | tail -10
# Exit code: 0
# Output: Contains "Published" or "Deployed"
```

### REQ-5: Smoke Tests Pass (All Plugins Load)
```bash
for plugin in membership eventdash commercekit formforge reviewpulse seodash; do
  curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin \
    -H "Content-Type: application/json" \
    -d '{"type":"page_load"}' | grep -o "UNAUTHORIZED\|NOT_FOUND\|INTERNAL_ERROR"
done
# ALL must return: UNAUTHORIZED
# NONE should return: NOT_FOUND or INTERNAL_ERROR
```

### REQ-6: Changes Committed and Pushed
```bash
git status
# Output: "Your branch is up to date with 'origin/main'"
# Output: "nothing to commit, working tree clean"

git log -1 --grep "deploy:"
# Output: Shows commit with "deploy:" prefix
```

---

## Files to Create or Modify

### Modified Files (5 total)

1. **`plugins/eventdash/src/sandbox-entry.ts`**
   - **Change:** Replace entire file with fixed version from `deliverables/eventdash-fix/sandbox-entry.ts`
   - **Before:** 3442 lines, 95 violations
   - **After:** Similar size, 0 violations
   - **Reason:** Fix banned patterns (throw new Response → return Response.json(), rc.user → ctx.user, rc.pathParams → route handler params)

2. **`plugins/formforge/src/index.ts`**
   - **Change:** Add file path resolution imports and logic, replace npm alias entrypoint
   - **Lines Modified:** ~10 lines added, 1 line changed
   - **Before:** `entrypoint: "@shipyard/formforge/sandbox"`
   - **After:** `entrypoint: entrypointPath` (with path resolution)

3. **`plugins/reviewpulse/src/index.ts`**
   - **Change:** Add file path resolution imports and logic, replace npm alias entrypoint
   - **Lines Modified:** ~10 lines added, 1 line changed
   - **Before:** `entrypoint: "@shipyard/reviewpulse/sandbox"`
   - **After:** `entrypoint: entrypointPath` (with path resolution)

4. **`plugins/seodash/src/index.ts`**
   - **Change:** Add file path resolution imports and logic, replace npm alias entrypoint
   - **Lines Modified:** ~10 lines added, 1 line changed
   - **Before:** `entrypoint: "@shipyard/seodash/sandbox"`
   - **After:** `entrypoint: entrypointPath` (with path resolution)

5. **`examples/sunrise-yoga/astro.config.mjs`**
   - **Change:** Add 4 plugin imports and register in plugins array
   - **Lines Modified:** 4 imports added, 1 line modified (plugins array)
   - **Before:** 2 plugins registered (membership, eventdash)
   - **After:** 6 plugins registered (membership, eventdash, commercekit, formforge, reviewpulse, seodash)

### No New Files Created

This is a deploy-only hotfix. All necessary files already exist.

---

## Success Criteria Summary

- [ ] **Build succeeds** — Exit 0, no errors, dist/ exists
- [ ] **Deploy succeeds** — Exit 0, "Published" in output
- [ ] **All 6 plugins registered** — astro.config.mjs has 6 Plugin references
- [ ] **All plugins return UNAUTHORIZED** — Not NOT_FOUND or INTERNAL_ERROR
- [ ] **No violations remain** — All plugins show 0 in grep check
- [ ] **Changes committed and pushed** — Git status shows up-to-date with origin/main

---

## Risk Mitigation

### Critical Risks
1. **EventDash violations** → MITIGATED by using pre-vetted fixed version from deliverables/
2. **npm alias entrypoints** → MITIGATED by using proven pattern from membership/commercekit
3. **Missing Cloudflare credentials** → MITIGATED by verifying .env before deployment

### Medium Risks
4. **Build cache corruption** → MITIGATED by clearing .astro/ and dist/ before build
5. **Untested plugin integration** → MITIGATED by smoke tests catching load failures

### Rollback Plan
If deployment fails at any stage:
```bash
# Full rollback
cd /home/agent/shipyard-ai
git reset --hard HEAD
cd examples/sunrise-yoga
npm run build
npx wrangler deploy
```

---

## Post-Deployment Verification

After successful deployment:
1. Visit admin panel: `https://yoga.shipyard.company/_emdash/admin`
2. Verify all 6 plugins appear in plugin list
3. Click each plugin's admin page to verify UI loads
4. Monitor Cloudflare Workers logs for first 24 hours
5. Document any issues in GitHub issue tracker

---

**Generated:** 2026-04-16
**Last Updated:** 2026-04-16
**Status:** Ready for execution
