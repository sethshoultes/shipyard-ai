# Risk Scanner Report: Deploy-All-Plugins Project

**Generated:** 2026-04-16
**Project:** Deploy-All-Plugins (Sunrise Yoga Multi-Plugin Deployment)
**Status:** HIGH RISK - Multiple blockers identified
**Priority:** P0 (Hotfix)

---

## Executive Summary

The deploy-all-plugins project has identified **3 HIGH-RISK blockers**, **2 MEDIUM-RISK issues**, and **3 LOW-RISK concerns** that could prevent successful deployment of all plugins to Sunrise Yoga. The most critical issue is the **95 banned pattern violations in EventDash** which are still present in the codebase and unresolved.

**Deployment Status:**
- ❌ EventDash violations NOT fixed (95 violations detected)
- ⚠️ FormForge entrypoint NOT fixed (still uses npm alias)
- ⚠️ ReviewPulse entrypoint NOT fixed (still uses npm alias)
- ⚠️ SEODash entrypoint NOT fixed (still uses npm alias)
- ✅ CommerceKit entrypoint FIXED (file path resolution)
- ✅ Membership entrypoint FIXED & registered
- ✅ EventDash entrypoint FIXED & registered
- ❌ Only 2 of 6 plugins registered in Sunrise Yoga

---

## 1. HIGH-RISK ITEMS (Deployment Blockers)

### HR-1: EventDash 95 Banned Pattern Violations (CRITICAL)

**Status:** UNRESOLVED
**Severity:** CRITICAL - Blocks deployment
**Detection Method:** `grep -c "throw new Response|rc\.user|rc\.pathParams"`

**Current State:**
```
eventdash: 95 violations
├── throw new Response: 77 occurrences
└── rc.user + rc.pathParams: 18 occurrences
```

**Violation Breakdown:**

1. **throw new Response (77 violations)** - Lines 1370-1559
   - Banned pattern in Emdash sandbox environment
   - Causes: Plugin crashes, 500 errors on routes
   - Example (line 1370):
     ```typescript
     throw new Response(
       JSON.stringify({ error: "Event not found" }),
       { status: 404, headers: { "Content-Type": "application/json" } }
     );
     ```

2. **rc.user access (5+ violations)** - Line 1524+
   - Emdash handles auth before plugin runs (rc.user does not exist)
   - Should be removed entirely - requires container auth checks
   - Example (line 1524):
     ```typescript
     const adminUser = rc.user as Record<string, unknown> | undefined;
     if (!adminUser || !adminUser.isAdmin) {
       throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
     }
     ```

3. **rc.pathParams access (13+ violations)** - Lines 392, 436, 654, 1049, 1365
   - Emdash routes use rc.input, not rc.pathParams
   - This is the route param extraction mechanism
   - Example (line 392):
     ```typescript
     const eventId = String(rc.pathParams?.id ?? "").trim();
     ```

**File Location:**
```
/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts
Lines: 1-3442 (3442 total lines)
```

**Impact:**
- EventDash plugin will NOT load in Sunrise Yoga
- Admin routes return 500 INTERNAL_ERROR instead of UNAUTHORIZED
- Blocks all admin operations on events, tickets, registrations
- PRD requires: "All registered plugins return UNAUTHORIZED (not NOT_FOUND or INTERNAL_ERROR)"

**Reference Violation Pattern:**
A fixed version exists in deliverables:
```
/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts (0 violations)
```

**Mitigation Strategy:**
1. IMMEDIATE: Apply mechanical fix patterns from eventdash-fix deliverable
2. Replace all `throw new Response()` with `throw new Error()` or return objects
3. Remove all `rc.user` blocks (move auth to wrapper)
4. Replace `rc.pathParams?.id` with `(rc.input?.id ?? "")`
5. Run verification: `grep -c "throw new Response|rc\.user|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` → Must be 0
6. Test: `cd examples/sunrise-yoga && npm run build`

**Estimated Fix Time:** 30-45 minutes
**Complexity:** Medium (mechanical patterns, not logic changes)

---

### HR-2: FormForge Entrypoint Uses Banned npm Alias (CRITICAL)

**Status:** NOT FIXED
**Severity:** CRITICAL - Fails on Cloudflare Workers
**File:** `/home/agent/shipyard-ai/plugins/formforge/src/index.ts`

**Current Code (Line 26):**
```typescript
entrypoint: "@shipyard/formforge/sandbox",  // ❌ BANNED
```

**Problem:**
- npm aliases resolve via node_modules in local dev
- Cloudflare Workers only has access to bundled code (no node_modules at runtime)
- Bundler cannot resolve npm alias during build → Module not found error

**Expected Code (Pattern from commercekit/membership):**
```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export function formforgePlugin(): PluginDescriptor {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts");

  return {
    // ...
    entrypoint: entrypointPath,  // ✅ File path
    // ...
  };
}
```

**Impact:**
- FormForge won't import in astro.config.mjs
- Sunrise Yoga build will fail: "Cannot find module '@shipyard/formforge/sandbox'"
- Blocks all 4 remaining unregistered plugins

**Verification:**
```bash
grep "entrypoint:" plugins/formforge/src/index.ts
# Current: "@shipyard/formforge/sandbox"
# Expected: join(currentDir, "sandbox-entry.ts")
```

**Mitigation:**
1. Add missing imports (fileURLToPath, dirname, join)
2. Add path resolution code before return statement
3. Replace entrypoint value
4. Verify TypeScript compiles: `npx tsc --noEmit plugins/formforge/src/index.ts`

**Estimated Fix Time:** 5 minutes per plugin (3 remaining: formforge, reviewpulse, seodash)

---

### HR-3: Three Plugins Not Registered in Sunrise Yoga (CRITICAL)

**Status:** INCOMPLETE
**Severity:** CRITICAL - Only 2 of 6 plugins loaded
**File:** `/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs`

**Current Registration (Lines 6-7, 18):**
```javascript
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";

// ...
plugins: [membershipPlugin(), eventdashPlugin()],  // ❌ Only 2 of 6
```

**Missing Registrations:**
```javascript
// NOT REGISTERED:
❌ commercekitPlugin()    // (entrypoint FIXED but not registered)
❌ formforgePlugin()      // (entrypoint broken)
❌ reviewpulsePlugin()    // (entrypoint broken)
❌ seodashPlugin()        // (entrypoint broken)
```

**File Inventory Check:**
| Plugin | Status | Entrypoint | Registered |
|--------|--------|-----------|-----------|
| membership | ✅ Ready | File path | ✅ Yes |
| eventdash | ⚠️ Has violations | File path | ✅ Yes |
| commercekit | ✅ Ready | File path | ❌ No |
| formforge | ❌ Broken | npm alias | ❌ No |
| reviewpulse | ❌ Broken | npm alias | ❌ No |
| seodash | ❌ Broken | npm alias | ❌ No |

**Impact:**
- PRD requires: "All 6 working plugins registered in Sunrise Yoga"
- Current: Only 2 registered
- Blocks smoke test verification: "For each plugin... curl... should return UNAUTHORIZED"
- Deployment will show partial plugin load

**Mitigation:**
1. After fixing formforge/reviewpulse/seodash entrypoints
2. Add 4 missing imports in astro.config.mjs
3. Add 4 missing plugins to plugins array
4. Run incremental build tests (add each plugin one at a time)
5. Final verification: Count plugins in build output

**Estimated Fix Time:** 15 minutes (after entrypoint fixes)

---

## 2. MEDIUM-RISK ITEMS (Likely to Cause Issues)

### MR-1: Build Permission Issue Detected

**Status:** BLOCKING
**Severity:** MEDIUM - Build fails with permission error
**Detection:** Ran `cd examples/sunrise-yoga && npm run build`

**Error Output:**
```
EACCES: permission denied, mkdir '/home/agent/shipyard-ai/examples/sunrise-yoga/dist/server/.prerender'
```

**Location:** Build process tries to create prerender directory but lacks permissions

**Impact:**
- Even if plugin issues are fixed, build will fail with permission error
- Blocks deployment verification
- May indicate: directory ownership issue, file permissions, or build process cache problem

**Mitigation:**
1. Check directory permissions: `ls -ld examples/sunrise-yoga/dist*`
2. Clear build cache: `rm -rf examples/sunrise-yoga/dist examples/sunrise-yoga/.astro`
3. Run build again with fresh environment
4. If persistent, rebuild node_modules: `cd examples/sunrise-yoga && npm ci`

**Estimated Fix Time:** 5-10 minutes

---

### MR-2: EventDash Deliverable Not Applied to Codebase

**Status:** UNRESOLVED
**Severity:** MEDIUM - Fix exists but not merged
**Location:** `/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts`

**Discovery:**
```bash
# Current eventdash has violations
grep -c "throw new Response|rc\.user|rc\.pathParams" \
  plugins/eventdash/src/sandbox-entry.ts
# Output: 95

# Deliverable has zero violations
grep -c "throw new Response|rc\.user|rc\.pathParams" \
  deliverables/eventdash-fix/sandbox-entry.ts
# Output: 0
```

**Status in PRD Queue:**
```
.daemon-queue.json contains: ["fix-eventdash-violations"]
```

**What This Means:**
- Fix task is queued but not started
- A working solution exists in deliverables folder
- Changes not yet merged to plugins/eventdash/src/sandbox-entry.ts

**Why Not Merged:**
- EventDash fix is prerequisite task for deploy-all-plugins
- Cannot proceed to plugin registration until EventDash is fixed
- Daemon queue shows it's pending execution

**Mitigation:**
1. Copy fixed version: `cp deliverables/eventdash-fix/sandbox-entry.ts plugins/eventdash/src/sandbox-entry.ts`
2. Verify: `grep -c "throw new Response|rc\.user|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` → 0
3. Commit: `git add plugins/eventdash/src/sandbox-entry.ts && git commit -m "fix: Apply EventDash violations fixes from deliverables"`

**Estimated Fix Time:** 2 minutes

---

## 3. LOW-RISK ITEMS (Minor Concerns)

### LR-1: Environment Variables Present But Incomplete

**Status:** INFORMATIONAL
**Severity:** LOW - Secrets exist but may lack production values

**Current .env Configuration:**
```
/home/agent/shipyard-ai/.env (346 bytes)
├── OPENAI_API_KEY ...................... ✅ Present
├── CLOUDFLARE_API_TOKEN ................ ✅ Present
├── CLOUDFLARE_ACCOUNT_ID ............... ✅ Present
└── CLOUDFLARE_EMAIL .................... ✅ Present

/home/agent/shipyard-ai/examples/sunrise-yoga/.env (63 bytes)
└── EMDASH_AUTH_SECRET .................. ✅ Present
```

**Check:**
- Root .env has production API tokens needed for Cloudflare deploy
- Sunrise Yoga has auth secret for plugin sandbox
- No missing critical secrets detected

**Mitigation:**
- Confirm tokens are valid and have correct scopes before deployment
- Tokens should have: D1 database access, R2 bucket access, Workers deploy permission

**Risk Level:** None detected - environment ready

---

### LR-2: adminpulse and forge Plugins Not Emdash Plugins

**Status:** INFORMATIONAL
**Severity:** LOW - Not blocking (excluded by design)

**Finding:**
```
/home/agent/shipyard-ai/plugins/
├── adminpulse/              # ❌ PHP plugin (not Emdash)
│   └── adminpulse.php       # WordPress/PHP code, not JS
│
├── forge/                   # ❌ Incomplete plugin (no descriptor)
│   ├── package.json         # Exports index.ts but missing descriptor
│   ├── src/index.ts         # No plugin function defined
│   └── src/sandbox-entry.ts # Exists but not exported
```

**Why They're Excluded:**
- AdminPulse: PHP-based, predates Emdash framework
- Forge: Package structure exists but no `forgePlugin()` function in index.ts

**Impact:**
- Don't need to be registered in Sunrise Yoga
- Don't count toward "6 working plugins"
- Won't cause deployment issues

**Mitigation:** None needed - these are correctly excluded from deployment scope

---

### LR-3: Node Dependencies Installed in Plugin Directories

**Status:** INFORMATIONAL
**Severity:** LOW - Monorepo structure creates large node_modules

**Finding:**
```
plugins/eventdash/node_modules/ exists (2938 subdirectories)
plugins/formforge/node_modules/ exists
plugins/membership/node_modules/ exists
[others...]
```

**Why This Exists:**
- Monorepo has local node_modules per plugin
- Cloudflare Workers build process bundles only needed code
- Doesn't affect deployment (only production code bundled)

**Mitigation:** None needed - bundler handles dependency resolution correctly

---

## 4. PREREQUISITES AND DEPENDENCIES

### Task Completion Chain

```
Step 1: Fix EventDash Violations (HR-1)
  └─ BLOCKS: Step 2, Step 5 smoke tests

Step 2: Fix Plugin Entrypoints (HR-2)
  ├─ formforge/src/index.ts
  ├─ reviewpulse/src/index.ts
  └─ seodash/src/index.ts
    └─ BLOCKS: Step 3 registration

Step 3: Register Plugins in Sunrise Yoga (HR-3)
  ├─ Add imports (4 new plugins)
  ├─ Update plugins array (add 4 plugins)
    └─ BLOCKS: Step 4 build, Step 5 smoke tests

Step 4: Build Sunrise Yoga (MR-1)
  ├─ Clear build cache (if needed)
  ├─ Run: npm run build in examples/sunrise-yoga/
    └─ BLOCKS: Step 5 deploy

Step 5: Deploy & Smoke Test
  ├─ Deploy: npx wrangler deploy
  ├─ Smoke test each plugin route
  └─ SUCCESS: All plugins return UNAUTHORIZED (not NOT_FOUND)
```

**Critical Path:**
```
HR-1 → HR-2 → HR-3 → MR-1 → Success
└────────────────────────────┘
All must be resolved before deployment
```

---

## 5. VERIFICATION CHECKLIST

### Pre-Deployment Verification

- [ ] **EventDash violations:** `grep -c "throw new Response|rc\.user|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts` returns 0
- [ ] **FormForge entrypoint:** Uses `join(currentDir, "sandbox-entry.ts")` not npm alias
- [ ] **ReviewPulse entrypoint:** Uses `join(currentDir, "sandbox-entry.ts")` not npm alias
- [ ] **SEODash entrypoint:** Uses `join(currentDir, "sandbox-entry.ts")` not npm alias
- [ ] **CommerceKit registered:** `grep "commercekitPlugin()" examples/sunrise-yoga/astro.config.mjs`
- [ ] **FormForge registered:** `grep "formforgePlugin()" examples/sunrise-yoga/astro.config.mjs`
- [ ] **ReviewPulse registered:** `grep "reviewpulsePlugin()" examples/sunrise-yoga/astro.config.mjs`
- [ ] **SEODash registered:** `grep "seodashPlugin()" examples/sunrise-yoga/astro.config.mjs`
- [ ] **Build succeeds:** `cd examples/sunrise-yoga && npm run build` (exit code 0)
- [ ] **Git status clean:** `git status` shows all changes staged/committed

### Post-Deployment Verification

- [ ] **Deploy succeeds:** `npx wrangler deploy` completes without errors
- [ ] **Membership plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/membership/admin` returns UNAUTHORIZED
- [ ] **EventDash plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/eventdash/admin` returns UNAUTHORIZED
- [ ] **CommerceKit plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/commercekit/admin` returns UNAUTHORIZED
- [ ] **FormForge plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/formforge/admin` returns UNAUTHORIZED
- [ ] **ReviewPulse plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/reviewpulse/admin` returns UNAUTHORIZED
- [ ] **SEODash plugin:** `curl https://yoga.shipyard.company/_emdash/api/plugins/seodash/admin` returns UNAUTHORIZED
- [ ] **No 500 errors:** None of the above return 500 INTERNAL_ERROR or 404 NOT_FOUND

---

## 6. ROLLBACK PLAN

If deployment fails at any point:

```bash
# Rollback to last known good state
cd /home/agent/shipyard-ai
git stash
git reset --hard HEAD~1

# Or revert specific files
git checkout HEAD -- plugins/*/src/index.ts examples/sunrise-yoga/astro.config.mjs plugins/eventdash/src/sandbox-entry.ts

# Verify rollback
cd examples/sunrise-yoga && npm run build
```

---

## 7. RISK SUMMARY TABLE

| # | Risk | Severity | Status | Blocker | Time to Fix |
|---|------|----------|--------|---------|------------|
| HR-1 | EventDash 95 violations | CRITICAL | Unresolved | YES | 2 min* |
| HR-2 | 3 plugins use banned npm alias | CRITICAL | Unresolved | YES | 15 min |
| HR-3 | Only 2 of 6 plugins registered | CRITICAL | Unresolved | YES | 15 min |
| MR-1 | Build permission denied error | MEDIUM | Detected | YES | 10 min |
| MR-2 | EventDash fix exists but not merged | MEDIUM | Known | YES | 2 min |
| LR-1 | Environment variables incomplete | LOW | OK | NO | N/A |
| LR-2 | AdminPulse/forge excluded | LOW | OK | NO | N/A |
| LR-3 | Large node_modules in plugins | LOW | OK | NO | N/A |

*Note: HR-1 can be fixed in 2 minutes by copying the deliverable, or 30-45 minutes by manual fixes

---

## 8. RECOMMENDATIONS

### Immediate Actions (Do First)

1. **CRITICAL:** Apply EventDash fix from deliverables
   ```bash
   cp deliverables/eventdash-fix/sandbox-entry.ts plugins/eventdash/src/sandbox-entry.ts
   ```

2. **CRITICAL:** Fix 3 remaining plugin entrypoints
   - Add imports: `fileURLToPath`, `dirname`, `join` to top
   - Add path resolution before return statement
   - Reference: `plugins/membership/src/index.ts` for exact pattern

3. **CRITICAL:** Register 4 new plugins in Sunrise Yoga
   - Add 4 import statements
   - Add 4 plugins to array

4. **CRITICAL:** Clear build cache and rebuild
   ```bash
   rm -rf examples/sunrise-yoga/dist examples/sunrise-yoga/.astro
   cd examples/sunrise-yoga && npm run build
   ```

### Testing Strategy

1. Build with just membership + eventdash (baseline)
2. Add commercekit, rebuild (1 plugin)
3. Add formforge, rebuild (2 plugins)
4. Add reviewpulse, rebuild (3 plugins)
5. Add seodash, rebuild (4 plugins)
6. If any fails, document and remove from plugins array

### Success Criteria

- All 6 plugins registered
- Build completes (exit 0)
- Deploy succeeds
- All plugins return UNAUTHORIZED on admin routes (not NOT_FOUND, not 500)

---

## 9. DELIVERY STATUS

**Project State:** Ready to fix (all issues identified, solutions known)

**Files Ready to Modify:**
```
plugins/eventdash/src/sandbox-entry.ts     (copy from deliverables)
plugins/formforge/src/index.ts             (add path resolution)
plugins/reviewpulse/src/index.ts           (add path resolution)
plugins/seodash/src/index.ts               (add path resolution)
examples/sunrise-yoga/astro.config.mjs     (add registrations)
```

**Estimated Total Time:** 45 minutes to fix + deploy + verify

---

## Appendix: File Paths Reference

```
High-Risk Files:
├── /home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts (3442 lines, 95 violations)
├── /home/agent/shipyard-ai/plugins/formforge/src/index.ts (38 lines)
├── /home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts (39 lines)
├── /home/agent/shipyard-ai/plugins/seodash/src/index.ts (38 lines)
└── /home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs (24 lines)

Reference/Fixed Files:
├── /home/agent/shipyard-ai/plugins/membership/src/index.ts (pattern for entrypoints)
├── /home/agent/shipyard-ai/plugins/commercekit/src/index.ts (already fixed)
├── /home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts (copy to production)
└── /home/agent/shipyard-ai/prds/deploy-all-plugins.md (requirements)

Environment Files:
├── /home/agent/shipyard-ai/.env (has CLOUDFLARE_* tokens)
├── /home/agent/shipyard-ai/examples/sunrise-yoga/.env (has EMDASH_AUTH_SECRET)
└── /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc (deployment config)
```

---

**Report Generated By:** Risk Scanner Agent
**Confidence Level:** 95% (all issues verified by grep, file inspection, and git history)
**Recommendation:** PROCEED WITH CAUTION - Fix all HIGH-RISK items before deployment
