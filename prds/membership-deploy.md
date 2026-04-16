# PRD: MemberShip Plugin — Deploy Clean Deliverable and Smoke Test

> Priority: p0

## Problem

The MemberShip plugin fix was completed but the clean deliverable was never copied to the source directory. The plugin has never been tested on a live Emdash site.

## Scope — SMALL AND FOCUSED

This PRD has exactly 3 steps. Do not add scope. Do not refactor. Do not redesign.

## Step 1: Copy Clean Deliverable to Source

The deliverable at `deliverables/membership-fix/sandbox-entry.ts` has 0 banned pattern violations. The source at `plugins/membership/src/sandbox-entry.ts` has 4 violations. Copy the clean file over:

```bash
cp deliverables/membership-fix/sandbox-entry.ts plugins/membership/src/sandbox-entry.ts
```

Verify:
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts
# Must be 0
```

Also copy the auth and email modules if they exist in deliverables:
```bash
cp deliverables/membership-fix/auth.ts plugins/membership/src/auth.ts 2>/dev/null
cp deliverables/membership-fix/email.ts plugins/membership/src/email.ts 2>/dev/null
```

Commit:
```bash
git add plugins/membership/src/ && git commit -m "fix: deploy clean membership plugin — 0 banned pattern violations"
```

## Step 2: Test API Endpoints via Sunrise Yoga

The Sunrise Yoga dev server is running on port 4324. Test the membership plugin endpoints:

```bash
# Test 1: Check if plugin routes are accessible
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}' | head -5

# Test 2: Register a test member
curl -s -X POST http://localhost:4324/_emdash/api/plugins/membership/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@example.com","plan":"basic"}' | head -5

# Test 3: Check member status
curl -s http://localhost:4324/_emdash/api/plugins/membership/status \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@example.com"}' | head -5
```

If the plugin isn't registered in Sunrise Yoga yet (routes return 404), note that in the test results — that's expected and a separate task.

## Step 3: Write Test Results

Write results to `deliverables/membership-v2/TEST-RESULTS.md`:
```markdown
# MemberShip v2 — Test Results

## Banned Pattern Check
- `throw new Response`: [count]
- `rc.user`: [count]  
- `rc.pathParams`: [count]
- Total violations: [count]

## API Tests
- Admin page_load: [status code] [pass/fail]
- Member register: [status code] [pass/fail]
- Member status: [status code] [pass/fail]

## Notes
[any issues found]
```

Commit everything and push.

## Success Criteria

- [ ] `plugins/membership/src/sandbox-entry.ts` has 0 banned pattern violations
- [ ] Test results documented
- [ ] Committed and pushed
