# Requirements: Membership Production Fix

**Project:** membership-production-fix
**Generated:** 2026-04-16
**Source Documents:**
- PRD: `/home/agent/shipyard-ai/prds/membership-production-fix.md`
- Decisions: `/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md`

---

## Problem Statement

The MemberShip plugin is registered in `examples/sunrise-yoga/astro.config.mjs` and the site builds + deploys successfully. But the plugin is **NOT** showing in the Emdash manifest at production (`https://yoga.shipyard.company/_emdash/api/manifest` returns `[]`).

Plugin routes return errors:
- `/plugins/membership/admin` → `{"error":{"code":"UNAUTHORIZED","message":"Authentication required"}}`
- `/plugins/membership/register` → `{"error":{"code":"INTERNAL_ERROR","message":"Plugin route error"}}`

**Root Cause:** The plugin descriptor uses entrypoint `@shipyard/membership/sandbox` which cannot be resolved at build time because it's a fake npm alias that doesn't exist.

---

## Atomic Requirements

### Phase 1: Immediate Fix (10-minute time budget)

**REQ-1: Fix membership plugin entrypoint path**
- **Description:** Replace fake npm alias `@shipyard/membership/sandbox` with real file path
- **Acceptance Criteria:** Plugin descriptor's entrypoint field resolves to actual file location
- **Verification:** Build completes without module resolution errors
- **Files:** `plugins/membership/src/index.ts`

**REQ-2: Update Sunrise Yoga plugin registration**
- **Description:** Ensure astro.config.mjs correctly imports and registers membership plugin
- **Acceptance Criteria:** Plugin appears in emdash integration config
- **Verification:** Build succeeds with plugin loaded
- **Files:** `examples/sunrise-yoga/astro.config.mjs`

**REQ-3: Configure worker_loaders if needed**
- **Description:** Add worker_loaders binding to wrangler.jsonc if required for sandboxed plugins
- **Acceptance Criteria:** Cloudflare deployment accepts configuration
- **Verification:** Wrangler validation passes
- **Files:** `examples/sunrise-yoga/wrangler.jsonc`

**REQ-4: Build and deploy to production**
- **Description:** Execute build and deployment workflow
- **Acceptance Criteria:** Deployment completes successfully
- **Verification:** `npm run build && npx wrangler deploy` succeeds
- **Files:** Build artifacts

**REQ-5: Verify plugin in production manifest**
- **Description:** Confirm membership plugin appears in manifest API
- **Acceptance Criteria:** Manifest returns `["membership"]` in plugins array
- **Verification:** `curl https://yoga.shipyard.company/_emdash/api/manifest | jq .plugins`
- **Files:** None (runtime verification)

**REQ-6: Verify plugin routes accessible**
- **Description:** Ensure plugin routes return proper responses (not INTERNAL_ERROR)
- **Acceptance Criteria:** Routes return 200/302/401, never 500 with INTERNAL_ERROR
- **Verification:** Manual curl tests to plugin routes
- **Files:** None (runtime verification)

### Phase 2: Convention System (30-minute time budget)

**REQ-7: Create plugin resolver module**
- **Description:** Build convention-based plugin path resolution system
- **Acceptance Criteria:** Resolver maps plugin names to entrypoint files
- **Verification:** `resolvePluginEntrypoint("membership")` returns correct path
- **Files:** `shipyard-core/plugin-resolver.ts` (NEW)

**REQ-8: Implement naming convention**
- **Description:** Plugin name → `plugins/<name>/sandbox.ts` convention
- **Acceptance Criteria:** "membership" resolves to `plugins/membership/sandbox.ts`
- **Verification:** Unit tests pass for convention mapping
- **Files:** `shipyard-core/plugin-resolver.ts`

**REQ-9: Create build validator**
- **Description:** Build-time validation that fails loudly on broken plugins
- **Acceptance Criteria:** Build throws error (not warning) for unresolvable plugins
- **Verification:** Build fails with clear message for invalid entrypoints
- **Files:** `shipyard-core/build-validator.ts` (NEW)

**REQ-10: Modify plugin loader**
- **Description:** Update plugin loader to use convention resolver
- **Acceptance Criteria:** Loader accepts string array and auto-resolves entrypoints
- **Verification:** `loadPlugins(["membership"])` works
- **Files:** `shipyard-core/plugin-loader.ts` (MODIFY)

**REQ-11: Support simplified plugin registration**
- **Description:** Enable `plugins: ["membership"]` syntax in astro.config
- **Acceptance Criteria:** String array accepted instead of descriptor objects
- **Verification:** Build succeeds with simplified syntax
- **Files:** `examples/sunrise-yoga/astro.config.mjs`

**REQ-12: Create canonical example**
- **Description:** Document zero-config plugin registration pattern
- **Acceptance Criteria:** 5-line reference implementation
- **Verification:** Example can be copy-pasted and used as-is
- **Files:** `examples/sunrise-yoga/astro.config.mjs` (as reference)

### Testing Requirements

**REQ-13: Unit test - plugin resolver**
- **Description:** Test plugin name resolution
- **Acceptance Criteria:** Resolver returns correct paths for valid plugin names
- **Verification:** Test suite passes
- **Files:** `tests/plugin-resolver.test.ts` (NEW)

**REQ-14: Unit test - resolver error handling**
- **Description:** Test resolver throws on missing plugins
- **Acceptance Criteria:** Error thrown for non-existent plugin names
- **Verification:** Test suite passes
- **Files:** `tests/plugin-resolver.test.ts`

**REQ-15: Unit test - build validator**
- **Description:** Test validator fails on invalid entrypoints
- **Acceptance Criteria:** Throws error when entrypoint doesn't exist
- **Verification:** Test suite passes
- **Files:** `tests/build-validator.test.ts` (NEW)

**REQ-16: Integration test - multi-plugin build**
- **Description:** Test multiple plugins load without conflicts
- **Acceptance Criteria:** Build with `["membership", "formforge"]` succeeds
- **Verification:** Integration test passes
- **Files:** Integration test suite

### Deployment Requirements

**REQ-17: Commit changes**
- **Description:** Git commit all modifications with clear message
- **Acceptance Criteria:** All changes committed, working tree clean
- **Verification:** `git status` shows clean working tree
- **Files:** All modified files

**REQ-18: Deploy within time budget**
- **Description:** Complete both phases in ≤40 minutes
- **Acceptance Criteria:** Hardcode fix (10 min) + convention system (30 min)
- **Verification:** Timestamp verification
- **Files:** None (process metric)

**REQ-19: Production verification**
- **Description:** Verify plugin works in production
- **Acceptance Criteria:** Manifest shows plugin, routes accessible
- **Verification:** Smoke tests pass on production URL
- **Files:** None (runtime verification)

---

## Success Criteria

### Build Phase Success
- ✅ Plugin loads in production (manifest verification)
- ✅ `plugins: ["membership"]` convention works
- ✅ Build fails loudly on broken plugins
- ✅ Total implementation time: ≤40 minutes
- ✅ Zero manual configuration required

### Product Validation Success (post-build)
- 📊 10+ real members using plugin
- 📊 >10% signup completion rate
- 📊 <1% error rate in production
- 📊 Zero developer support tickets on plugin loading

---

## Out of Scope (v1)

Per decisions document, these are **CUT from v1**:
- ❌ "Read all the docs" steps
- ❌ "Compare with other sites" debugging patterns
- ❌ Smoke tests beyond manifest verification
- ❌ Cloudflare internals exposed to developers
- ❌ Multiple plugin configuration patterns
- ❌ "Passport" rebranding

---

## Risk Mitigation

### Risk 1: Speed vs Quality Death Spiral
- **Mitigation:** Lock 40-minute timeline—both fixes in ONE session
- **Owner:** Execute both phases without breaks

### Risk 2: Build System Doesn't Fail Loudly
- **Mitigation:** Build-time validation MUST throw errors, not warnings
- **Owner:** Build validator implementation (REQ-9)

### Risk 3: Convention Doesn't Match Developer Mental Model
- **Mitigation:** Single canonical example + loud build errors
- **Owner:** Documentation (REQ-12) + validation (REQ-9)

---

## Technical Approach

### Phase 1: Hardcode Fix
1. Change entrypoint in `plugins/membership/src/index.ts` to:
   ```typescript
   entrypoint: "./plugins/membership/dist/sandbox-entry.js"
   ```
2. Verify file exists or build plugin to create it
3. Test build: `cd examples/sunrise-yoga && npm run build`
4. Deploy: `npx wrangler deploy`
5. Verify: `curl https://yoga.shipyard.company/_emdash/api/manifest`

### Phase 2: Convention System
1. Create `shipyard-core/plugin-resolver.ts`:
   ```typescript
   export function resolvePluginEntrypoint(name: string): string {
     return `plugins/${name}/sandbox.ts`;
   }
   ```
2. Create `shipyard-core/build-validator.ts`:
   ```typescript
   export function validatePluginExists(entrypoint: string): void {
     if (!fs.existsSync(entrypoint)) {
       throw new Error(`Plugin entrypoint not found: ${entrypoint}`);
     }
   }
   ```
3. Modify plugin loader to use resolver
4. Update astro.config.mjs to use string array syntax
5. Test with multiple plugins

---

## References

- **EMDASH-GUIDE.md Section 6:** Plugin System architecture
- **Decisions Document:** 40-minute timeline, convention over configuration
- **PRD:** Entrypoint resolution issue and verification steps
