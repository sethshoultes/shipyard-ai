# Requirements Traceability: GitHub Issue #75
## Deploy Sunrise Yoga + Verify Plugins

**Generated:** 2026-04-16
**Source:** `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-75.md`
**Decisions:** `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-75/decisions.md`
**Project Slug:** `github-issue-sethshoultes-shipyard-ai-75`

---

## Atomic Requirements

### REQ-1: Verify Prerequisites Are Fixed
**Success Criteria:**
- wrangler.jsonc contains `worker_loaders` binding
- Plugin entrypoint files exist and export correctly
- No configuration syntax errors

**Test:**
```bash
npx wrangler whoami
cat wrangler.jsonc | grep -q "worker_loaders"
```

---

### REQ-2: Fix EventDash Plugin Registration
**Success Criteria:**
- EventDash plugin imported in astro.config.mjs
- EventDash plugin added to plugins array
- EventDash dependency added to package.json

**Current State (BROKEN):**
```javascript
// astro.config.mjs - ONLY membership registered
plugins: [membershipPlugin()]
```

**Required State:**
```javascript
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";

plugins: [membershipPlugin(), eventdashPlugin()]
```

**Test:**
```bash
grep -q "eventdashPlugin" astro.config.mjs
grep -q "eventdash" package.json
```

---

### REQ-3: Fix EventDash Plugin Entrypoint Path
**Success Criteria:**
- EventDash uses absolute file path (not npm alias)
- Matches membership plugin pattern

**Current State (BROKEN):**
```typescript
// plugins/eventdash/src/index.ts
entrypoint: "@shipyard/eventdash/sandbox"  // NPM alias fails in Workers
```

**Required State:**
```typescript
const currentDir = dirname(fileURLToPath(import.meta.url));
const entrypointPath = join(currentDir, "sandbox-entry.ts");
entrypoint: entrypointPath  // Absolute path
```

**Test:**
```bash
grep -q "fileURLToPath" plugins/eventdash/src/index.ts
```

---

### REQ-4: Build Sunrise Yoga Application
**Success Criteria:**
- `npm run build` completes with exit code 0
- No TypeScript compilation errors
- Build artifacts generated in dist/

**Test:**
```bash
npm run build
test -f dist/server/entry.mjs
```

---

### REQ-5: Deploy to Cloudflare Production
**Success Criteria:**
- `npx wrangler deploy` completes successfully
- Production URL accessible
- Environment variables properly set

**Test:**
```bash
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy
```

---

### REQ-6: Verify Manifest Endpoint
**Success Criteria:**
- GET /api/manifest returns HTTP 200
- Response is valid JSON
- No INTERNAL_ERROR in response

**Test:**
```bash
curl -s https://yoga.shipyard.company/_emdash/api/manifest | jq .
```

---

### REQ-7: Verify Both Plugins in Manifest
**Success Criteria:**
- Manifest includes membership plugin
- Manifest includes eventdash plugin
- Exactly 2 plugins present (no more, no less)

**Test:**
```bash
curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "
import json,sys
d=json.load(sys.stdin)
plugins = {p.get('id') for p in d.get('plugins',[])}
assert plugins == {'membership', 'eventdash'}, f'Expected membership+eventdash, got {plugins}'
print('PASS: Both plugins verified')
"
```

---

### REQ-8: Test Membership Plugin Admin Route
**Success Criteria:**
- POST /api/membership/admin returns non-500 status
- Response does not contain INTERNAL_ERROR
- Response is valid JSON

**Test:**
```bash
curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}' | python3 -c "
import json,sys
resp=json.load(sys.stdin)
assert 'INTERNAL_ERROR' not in str(resp), 'INTERNAL_ERROR found'
print('PASS: Membership plugin healthy')
"
```

---

### REQ-9: Test EventDash Plugin Admin Route
**Success Criteria:**
- POST /api/eventdash/admin returns non-500 status
- Response does not contain INTERNAL_ERROR
- Response is valid JSON

**Test:**
```bash
curl -s https://yoga.shipyard.company/_emdash/api/plugins/eventdash/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}' | python3 -c "
import json,sys
resp=json.load(sys.stdin)
assert 'INTERNAL_ERROR' not in str(resp), 'INTERNAL_ERROR found'
print('PASS: EventDash plugin healthy')
"
```

---

### REQ-10: Commit and Push Changes
**Success Criteria:**
- All changes committed with proper message
- Commit references Issue #75
- Changes pushed to origin main
- Git status clean

**Test:**
```bash
git add .
git commit -m "fix: Deploy Sunrise Yoga with verified plugins

- Fixed wrangler.jsonc plugin paths
- Verified membership and eventdash plugins load correctly
- All smoke tests passing
- Manifest endpoint returns clean JSON

Resolves #75"
git push origin main
```

---

## Dependency Graph

```
REQ-1 (Prerequisites)
  ↓
REQ-2, REQ-3 (Fix Configurations - Parallel)
  ↓
REQ-4 (Build)
  ↓
REQ-5 (Deploy)
  ↓
REQ-6 (Manifest)
  ↓
REQ-7, REQ-8, REQ-9 (Verification Tests - Parallel)
  ↓
REQ-10 (Commit)
```

---

## Traceability Matrix

| Requirement | PRD Section | Decisions Reference | Priority |
|-------------|-------------|---------------------|----------|
| REQ-1 | Prerequisites | Decision 1 (Bash + curl) | MUST-HAVE |
| REQ-2 | Steps | Decision 1 (Fix config) | MUST-HAVE |
| REQ-3 | Prerequisites | Decision 2 (Zero errors) | MUST-HAVE |
| REQ-4 | Steps | Decision 1 (Build) | MUST-HAVE |
| REQ-5 | Steps | Decision 1 (Deploy) | MUST-HAVE |
| REQ-6 | Smoke Test | Decision 2 (Manifest is truth) | MUST-HAVE |
| REQ-7 | Smoke Test | Decision 2 (Python assertion) | MUST-HAVE |
| REQ-8 | Smoke Test | Decision 2 (No INTERNAL_ERROR) | MUST-HAVE |
| REQ-9 | Smoke Test | Decision 2 (No INTERNAL_ERROR) | MUST-HAVE |
| REQ-10 | Success Criteria | Decision 1 (Commit & push) | MUST-HAVE |

---

## Critical Findings from Research

### Configuration Gaps (High Risk)
1. **EventDash not registered** - astro.config.mjs only has membership
2. **EventDash uses npm alias** - should use absolute path like membership
3. **EventDash missing from package.json** - no dependency entry

### Files to Modify
1. `/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs`
2. `/home/agent/shipyard-ai/examples/sunrise-yoga/package.json`
3. `/home/agent/shipyard-ai/plugins/eventdash/src/index.ts`

### Verified Working Configuration
- wrangler.jsonc ✓ (worker_loaders present)
- Membership plugin ✓ (uses absolute paths)
- Build system ✓ (npm scripts ready)
- Cloudflare resources ✓ (D1, R2 configured)
