# Requirements Document: Deploy All Plugins

**Project Slug**: deploy-all-plugins
**PRD**: /home/agent/shipyard-ai/prds/deploy-all-plugins.md
**Generated**: 2026-04-16
**Priority**: p0 (hotfix)

## Problem Statement

Sunrise Yoga needs all 6 plugins deployed and verified. Current state: only 2 plugins registered. Prerequisites (plugin entrypoints + EventDash violations) must be verified/fixed before deployment.

## Atomic Requirements

### REQ-1: Verify All Plugins Registered

**Source**: PRD Step 1
**File**: `examples/sunrise-yoga/astro.config.mjs`
**Verification**:
```bash
grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs
```
**Expected**: `6`
**Current**: `2` (membership, eventdash only)

**Required plugins**:
- membershipPlugin() ✅
- eventdashPlugin() ✅
- commercekitPlugin() ❌
- formforgePlugin() ❌
- reviewpulsePlugin() ❌
- seodashPlugin() ❌

---

### REQ-2: Verify Zero Violations

**Source**: PRD Step 2
**Files**: All `plugins/*/src/sandbox-entry.ts`
**Verification**:
```bash
for f in plugins/*/src/sandbox-entry.ts; do
  name=$(echo $f | sed 's|plugins/||;s|/src/.*||')
  count=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$f" 2>/dev/null)
  echo "$name: $count violations"
done
```
**Expected**: All show `0 violations`

**Current state** (per Risk Scanner):
- membership: 0 ✅
- eventdash: 95 ❌ **BLOCKER**
- commercekit: 0 ✅
- formforge: 0 ✅
- reviewpulse: 0 ✅
- seodash: 0 ✅

**Fix available**: `/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts` (verified 0 violations)

---

### REQ-3: Build Succeeds

**Source**: PRD Step 3
**Verification**:
```bash
cd examples/sunrise-yoga
npm run build 2>&1 | tail -10
```
**Expected**: No ERROR messages, exit code 0

**Failure scenarios**:
- `Cannot find module @shipyard/{plugin}/sandbox` → Plugin entrypoint uses banned npm alias
- `Permission denied` → Clear `.astro` cache
- Type errors → Plugin descriptor invalid

**Dependencies**:
- REQ-2 must pass (zero violations)
- All plugin entrypoints must use path resolution

---

### REQ-4: Deploy Succeeds

**Source**: PRD Step 4
**Verification**:
```bash
cd examples/sunrise-yoga
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy 2>&1 | tail -10
```
**Expected**: Line containing "Deployed" or "Published", no ERROR messages

**Dependencies**:
- REQ-3 must pass
- Environment: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` set
- Wrangler.jsonc configured with D1/R2 bindings

---

### REQ-5: Smoke Test All Plugin Routes

**Source**: PRD Step 5
**Verification**:
```bash
for plugin in membership eventdash commercekit formforge reviewpulse seodash; do
  echo "=== $plugin ==="
  curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin \
    -H "Content-Type: application/json" \
    -d '{"type":"page_load"}' | head -3
done
```

**Expected for EACH plugin**: `{"error":"UNAUTHORIZED",...}`

**Success**: UNAUTHORIZED (plugin loaded, auth-gated) ✅
**Failure scenarios**:
- `NOT_FOUND` → Plugin not registered ❌
- `INTERNAL_ERROR` → Plugin has runtime error (violations) ❌
- `Bad Gateway` → Worker crashed ❌

**Dependencies**:
- REQ-4 must pass (deployed)
- REQ-1 must pass (all registered)
- REQ-2 must pass (zero violations)

---

### REQ-6: Commit and Push

**Source**: PRD Success Criteria
**Action**: Git commit with all changes

**Dependencies**: REQ-5 must pass

---

## Success Criteria Checklist

- [ ] REQ-1: 6 plugins registered (grep count = 6)
- [ ] REQ-2: All plugins 0 violations
- [ ] REQ-3: Build exits 0, no errors
- [ ] REQ-4: Deploy exits 0, shows "Published"
- [ ] REQ-5: All 6 plugins return UNAUTHORIZED (not NOT_FOUND/INTERNAL_ERROR)
- [ ] REQ-6: Committed and pushed

---

## Files to Modify

**Primary** (definite):
1. `examples/sunrise-yoga/astro.config.mjs` - Add 4 plugin registrations

**Secondary** (if prerequisites not met):
2. `plugins/eventdash/src/sandbox-entry.ts` - Copy from deliverables/eventdash-fix/ (if 95 violations exist)
3. `plugins/formforge/src/index.ts` - Fix entrypoint if using npm alias
4. `plugins/reviewpulse/src/index.ts` - Fix entrypoint if using npm alias
5. `plugins/seodash/src/index.ts` - Fix entrypoint if using npm alias

---

## Dependency Graph

```
REQ-2 (Zero Violations) ← Must fix first
    ↓
REQ-3 (Build) ← Also depends on entrypoints
    ↓
REQ-4 (Deploy)
    ↓
REQ-5 (Smoke Tests) ← Also needs REQ-1
    ↓
REQ-6 (Commit)

REQ-1 (Registered) ← Can verify anytime
```

---

## Wave Structure

- **Wave 1**: Prerequisites (fix violations, fix entrypoints if needed)
- **Wave 2**: Registration + Build (REQ-1, REQ-3)
- **Wave 3**: Deploy + Smoke Test (REQ-4, REQ-5)
- **Wave 4**: Commit (REQ-6)

---

## Risk Summary

| Requirement | Risk | Mitigation |
|-------------|------|------------|
| REQ-1 | LOW | Simple config edit |
| REQ-2 | MEDIUM | Fixed file available |
| REQ-3 | MEDIUM | Clear cache if fails |
| REQ-4 | HIGH | Test build first, verify creds |
| REQ-5 | MEDIUM | Clear expected outputs |
| REQ-6 | LOW | Standard git |

---

## Reference: Plugin Registration Pattern

Per EMDASH-GUIDE.md section 6 and working examples (membership, eventdash):

```javascript
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";
import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";
import { formforgePlugin } from "../../plugins/formforge/src/index.js";
import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";
import { seodashPlugin } from "../../plugins/seodash/src/index.js";

// ...
plugins: [
  membershipPlugin(),
  eventdashPlugin(),
  commercekitPlugin(),
  formforgePlugin(),
  reviewpulsePlugin(),
  seodashPlugin()
]
```

---

## Reference: Correct Entrypoint Pattern

**Working pattern** (membership, commercekit):
```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export function pluginNamePlugin(): PluginDescriptor {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts");

  return {
    id: "plugin-name",
    entrypoint: entrypointPath, // ✓ Path resolution
    // ...
  };
}
```

**Banned pattern** (formforge, reviewpulse, seodash):
```typescript
return {
  id: "plugin-name",
  entrypoint: "@shipyard/plugin-name/sandbox", // ✗ npm alias
  // ...
};
```

---

*Generated by agency-plan skill • GSD methodology*
