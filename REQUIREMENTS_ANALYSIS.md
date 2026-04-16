# Requirements Analysis: Deploy All Plugins

**PRD Source:** `/home/agent/shipyard-ai/prds/deploy-all-plugins.md`
**Priority:** P0 (Hotfix)
**Date:** 2026-04-16

---

## Executive Summary

This document extracts atomic requirements from the "Fix Deploy Sunrise Yoga — Verify All Plugins Load" PRD. The objective is to verify all plugins are correctly registered, build the Sunrise Yoga example application, deploy it to Cloudflare, and smoke-test each plugin endpoint to ensure they load correctly.

---

## PREREQUISITES

**Must be completed BEFORE starting any requirements in this PRD:**

1. **Fix plugin entrypoints + register all in Sunrise Yoga**
   - Status: Must be completed first
   - Related PRD: `fix-plugin-entrypoints`
   - Impact: Without this, plugin registration verification (REQ-1) will fail

2. **Fix EventDash 95 banned pattern violations**
   - Status: Must be completed first
   - Impact: Without this, violation checking (REQ-2) will fail if EventDash violations exist

---

## ATOMIC REQUIREMENTS

### REQ-1: Verify All Plugins Registered
**Status:** Pending | **Risk Level:** LOW | **Category:** Verification

**Requirement Text:**
Verify that all required plugins are registered in the Sunrise Yoga Astro configuration file.

**Verification Command:**
```bash
grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs
```

**Expected Output:**
A count of "Plugin" occurrences (exact number depends on total plugins registered, should be > 0)

**How to Verify:**
- Execute the command
- Confirm the output is a number
- Confirm the number is greater than 0 (indicating plugins are present)

**Dependencies:**
- PREREQUISITE-1: Fix plugin entrypoints must be completed first

**Risk Assessment:**
- **Complexity:** Low - simple grep count
- **Failure Impact:** High - if plugins aren't registered, nothing will work downstream
- **Rollback Path:** Clear - would indicate incomplete prerequisite work

**Related File(s):**
- `examples/sunrise-yoga/astro.config.mjs`

---

### REQ-2: Verify Zero Violations Across All Plugins
**Status:** Pending | **Risk Level:** MEDIUM | **Category:** Code Quality

**Requirement Text:**
Verify that all plugins have zero violations of banned patterns: `throw new Response`, `rc.user`, and `rc.pathParams`.

**Verification Command:**
```bash
for f in plugins/*/src/sandbox-entry.ts; do
  name=$(echo $f | sed 's|plugins/||;s|/src/.*||')
  count=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$f" 2>/dev/null)
  echo "$name: $count violations"
done
```

**Expected Output:**
```
membership: 0 violations
eventdash: 0 violations
commercekit: 0 violations
formforge: 0 violations
reviewpulse: 0 violations
seodash: 0 violations
```

**How to Verify:**
- Execute the command from the repository root
- Parse each line output
- Confirm all plugins show `: 0 violations`
- Fail if any plugin shows a non-zero count

**Dependencies:**
- PREREQUISITE-2: EventDash 95 banned pattern violations must be fixed
- REQ-1 must pass (plugins must be registered before checking them)

**Risk Assessment:**
- **Complexity:** Medium - multiple file iteration, pattern matching
- **Failure Impact:** High - violations prevent proper sandboxing/security
- **Rollback Path:** If violations found, coordinate with plugin owners to fix; can skip deploy until fixed

**Related File(s):**
- `plugins/membership/src/sandbox-entry.ts`
- `plugins/eventdash/src/sandbox-entry.ts`
- `plugins/commercekit/src/sandbox-entry.ts`
- `plugins/formforge/src/sandbox-entry.ts`
- `plugins/reviewpulse/src/sandbox-entry.ts`
- `plugins/seodash/src/sandbox-entry.ts`

---

### REQ-3: Build Sunrise Yoga Application
**Status:** Pending | **Risk Level:** MEDIUM | **Category:** Build

**Requirement Text:**
Execute a successful build of the Sunrise Yoga example application with no errors.

**Verification Command:**
```bash
cd examples/sunrise-yoga
npm run build 2>&1 | tail -10
```

**Expected Output:**
- Last 10 lines of build output showing successful completion
- Must NOT contain error messages like "Error:", "failed", "BUILD FAILED"
- Typical success indicators: "Built in X.XXs", "Build complete", or similar

**How to Verify:**
- Execute the command
- Examine the last 10 lines
- Confirm no error keywords present
- Build process completed (exit code 0)

**Dependencies:**
- REQ-1: Plugins must be registered
- REQ-2: All violations must be fixed
- PREREQUISITE-1 and PREREQUISITE-2 must be completed

**Risk Assessment:**
- **Complexity:** Medium - depends on multiple upstream tasks
- **Failure Impact:** Critical - blocks deployment
- **Rollback Path:** Fix any build errors, re-run build

**Related File(s):**
- `examples/sunrise-yoga/package.json`
- `examples/sunrise-yoga/astro.config.mjs`
- All plugin source files (indirectly)

---

### REQ-4: Deploy to Cloudflare
**Status:** Pending | **Risk Level:** HIGH | **Category:** Deployment

**Requirement Text:**
Deploy the built Sunrise Yoga application to Cloudflare Workers using wrangler, with proper authentication credentials from environment variables.

**Verification Command:**
```bash
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy 2>&1 | tail -10
```

**Expected Output:**
- Last 10 lines must contain "Deployed" or "Successfully deployed"
- Must NOT contain error messages, authentication failures, or deployment errors
- Typical output includes Worker URL and deployment timestamp

**How to Verify:**
- Source the `.env` file first (sets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID)
- Execute wrangler deploy
- Check that output contains "Deployed" keyword
- No errors in output
- Exit code 0

**Dependencies:**
- REQ-3: Build must succeed first
- REQ-1 and REQ-2: Upstream verifications must pass
- **ENVIRONMENT:** `.env` file must exist with valid CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID

**Risk Assessment:**
- **Complexity:** High - external dependency (Cloudflare), requires credentials
- **Failure Impact:** Critical - affects production/staging environment
- **Rollback Path:**
  - If deployment fails, check credentials in `.env`
  - Check Cloudflare account status and quota
  - Can redeploy after fixing issues
  - Previous deployment remains active if new one fails

**Related File(s):**
- `/home/agent/shipyard-ai/.env` (credentials)
- `examples/sunrise-yoga/wrangler.toml` (deployment config)

---

### REQ-5: Smoke Test All Plugin Routes
**Status:** Pending | **Risk Level:** MEDIUM | **Category:** Integration Testing

**Requirement Text:**
Verify each plugin endpoint loads and returns the expected UNAUTHORIZED response (indicating proper auth gating and successful plugin loading). Six plugins must be tested: membership, eventdash, commercekit, formforge, reviewpulse, and seodash.

**Verification Command:**
```bash
for plugin in membership eventdash commercekit formforge reviewpulse seodash; do
  echo "=== $plugin ==="
  curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin \
    -H "Content-Type: application/json" \
    -d '{"type":"page_load"}' | head -3
done
```

**Expected Output Per Plugin:**
```
=== membership ===
UNAUTHORIZED

=== eventdash ===
UNAUTHORIZED

=== commercekit ===
UNAUTHORIZED

=== formforge ===
UNAUTHORIZED

=== reviewpulse ===
UNAUTHORIZED

=== seodash ===
UNAUTHORIZED
```

**How to Verify:**
- Execute the command (requires internet and deployment from REQ-4)
- For each plugin, check the response:
  - **PASS:** Response contains `UNAUTHORIZED` (plugin is loaded, auth is working)
  - **FAIL:** Response contains `NOT_FOUND` (plugin not loaded at all)
  - **FAIL:** Response contains `INTERNAL_ERROR` (plugin loaded but broken)
  - **FAIL:** Any other error response

**Dependencies:**
- REQ-4: Must be deployed first
- REQ-3, REQ-2, REQ-1: Build and verification must pass
- **EXTERNAL:** Internet connectivity and `https://yoga.shipyard.company` must be accessible

**Risk Assessment:**
- **Complexity:** Medium - external API calls, multiple plugins to check
- **Failure Impact:** High - indicates plugins not loading in production
- **Rollback Path:**
  - If one plugin fails: investigate that plugin's code/registration
  - If multiple fail: may indicate deployment issue, check Cloudflare logs
  - Previous version remains active until successful redeploy

**Plugin List:**
1. membership
2. eventdash
3. commercekit
4. formforge
5. reviewpulse
6. seodash

**Related File(s):**
- All plugin entry files (indirectly through deployment)

---

### REQ-6: Commit and Push Changes
**Status:** Pending | **Risk Level:** LOW | **Category:** Source Control

**Requirement Text:**
Commit and push all changes to the repository to ensure successful deployment is tracked in version control.

**Verification Command:**
```bash
git status
git log -1 --oneline
```

**Expected Output:**
- `git status`: "nothing to commit, working tree clean" or "Your branch is ahead of 'origin/main'"
- `git log`: Shows recent commit with meaningful message

**How to Verify:**
- Execute `git status` - should show clean state or tracked commits
- Execute `git log -1 --oneline` - should show recent commit
- Verify commit message references this PRD (deploy/verify theme)

**Dependencies:**
- REQ-4: Deploy must succeed first
- REQ-5: Smoke tests must pass

**Risk Assessment:**
- **Complexity:** Low - standard git operations
- **Failure Impact:** Medium - deployment not tracked; makes retrospective difficult
- **Rollback Path:** Force reset if needed (though not recommended)

**Related File(s):**
- All modified files (none per PRD: "this is deploy + verify only")

---

## FILES TO MODIFY

**Per PRD Statement:** "None — this is deploy + verify only."

No source files should be modified. This is a pure verification and deployment task.

**Files Referenced/Read (not modified):**
- `examples/sunrise-yoga/astro.config.mjs` (verified)
- `examples/sunrise-yoga/wrangler.toml` (deployment config)
- `plugins/*/src/sandbox-entry.ts` (verified)
- `/home/agent/shipyard-ai/.env` (credentials only)

---

## SUCCESS CRITERIA

**All of the following must be met:**

- [ ] **REQ-1 PASS:** `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs` returns a number > 0
- [ ] **REQ-2 PASS:** All plugins show `0 violations` in violation check loop
- [ ] **REQ-3 PASS:** Build completes with no errors (exit code 0)
- [ ] **REQ-4 PASS:** Deployment shows "Deployed" with no errors (exit code 0)
- [ ] **REQ-5 PASS:** All 6 plugins return `UNAUTHORIZED` (not `NOT_FOUND` or `INTERNAL_ERROR`)
- [ ] **REQ-6 PASS:** Changes committed and pushed to repository

---

## DEPLOYMENT FLOW (Sequence of Operations)

```
START
  ↓
PREREQUISITE-1: Fix plugin entrypoints + register all
  ↓
PREREQUISITE-2: Fix EventDash violations
  ↓
REQ-1: Verify All Plugins Registered ✓ (grep -c "Plugin")
  ↓ (GATES REQ-2)
REQ-2: Verify Zero Violations ✓ (violation check loop)
  ↓ (GATES REQ-3)
REQ-3: Build Sunrise Yoga ✓ (npm run build)
  ↓ (GATES REQ-4)
REQ-4: Deploy to Cloudflare ✓ (wrangler deploy)
  ↓ (GATES REQ-5)
REQ-5: Smoke Test All Plugins ✓ (curl each endpoint)
  ↓ (GATES REQ-6)
REQ-6: Commit and Push ✓ (git commit & push)
  ↓
END - ALL REQUIREMENTS MET
```

**Critical Path:**
- Each requirement depends on previous ones
- Any failure stops the pipeline
- Requirements must be executed in strict sequence

---

## RISK ASSESSMENT SUMMARY

| Requirement | Risk Level | Mitigation | Rollback Difficulty |
|-------------|-----------|------------|-------------------|
| REQ-1: Plugin Registration | LOW | Verify grep count before proceeding | EASY |
| REQ-2: Violation Checks | MEDIUM | Pre-check all plugins locally | EASY |
| REQ-3: Build | MEDIUM | Run build locally first; check logs | MEDIUM |
| REQ-4: Deploy | HIGH | Verify .env credentials; check quota | HARD |
| REQ-5: Smoke Tests | MEDIUM | Have known-good endpoint for comparison | MEDIUM |
| REQ-6: Commit/Push | LOW | Standard git operations | EASY |

---

## VERIFICATION CHECKLIST

Use this checklist to track completion:

**Phase 1: Prerequisites**
- [ ] Verify fix-plugin-entrypoints is merged
- [ ] Verify EventDash violations are fixed

**Phase 2: Pre-Deployment Verification**
- [ ] [ ] REQ-1: Run `grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs`
- [ ] [ ] REQ-2: Run violation check loop, confirm all show 0 violations
- [ ] [ ] REQ-3: Run build, confirm no errors

**Phase 3: Deployment**
- [ ] [ ] REQ-4: Deploy with wrangler, confirm "Deployed" in output

**Phase 4: Post-Deployment Verification**
- [ ] [ ] REQ-5: Smoke test each plugin, confirm UNAUTHORIZED responses
  - [ ] membership
  - [ ] eventdash
  - [ ] commercekit
  - [ ] formforge
  - [ ] reviewpulse
  - [ ] seodash

**Phase 5: Source Control**
- [ ] [ ] REQ-6: Commit and push changes

---

## TRACEABILITY MATRIX

| Requirement | PRD Section | Success Criteria | Verification Command | Risk |
|-------------|------------|-----------------|----------------------|------|
| REQ-1 | Step 1 | Count > 0 | `grep -c "Plugin"...` | LOW |
| REQ-2 | Step 2 | All 0 violations | `for f in plugins/...` | MED |
| REQ-3 | Step 3 | Build succeeds | `npm run build...` | MED |
| REQ-4 | Step 4 | Shows "Deployed" | `wrangler deploy...` | HIGH |
| REQ-5 | Step 5 | All UNAUTHORIZED | `curl` all 6 plugins | MED |
| REQ-6 | N/A | Pushed to main | `git log -1` | LOW |

---

## NOTES

1. **Environment Variable Requirements:**
   - `.env` file must exist at `/home/agent/shipyard-ai/.env`
   - Must contain: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   - These are sourced before deployment

2. **Plugin Count:**
   - Expected 6 plugins: membership, eventdash, commercekit, formforge, reviewpulse, seodash
   - If registration is correct, grep count should reflect all 6

3. **Smoke Test Endpoint:**
   - Endpoint: `https://yoga.shipyard.company/_emdash/api/plugins/{plugin}/admin`
   - Method: POST
   - Body: `{"type":"page_load"}`
   - Expected auth failure (UNAUTHORIZED) indicates plugin is loaded

4. **Deployment Target:**
   - Cloudflare Workers
   - URL: `yoga.shipyard.company` (customer-facing)
   - Uses wrangler CLI tool

5. **Failure Scenarios:**
   - **NOT_FOUND:** Plugin not registered or route not configured
   - **INTERNAL_ERROR:** Plugin loaded but broken (code error)
   - **UNAUTHORIZED:** Expected success state (auth prevented, plugin OK)
