# PRD: MemberShip Plugin — Fix Remaining Violations, Deploy to Sunrise Yoga, Smoke Test

> Priority: p0

## Problem

The MemberShip plugin shipped pattern fixes on 2026-04-12 but has 3 unresolved issues:

1. **4 remaining banned pattern violations** in the source file at `plugins/membership/src/sandbox-entry.ts` — 2 `rc.user` checks and 2 `throw new Response` in the `approve` and `revoke` admin routes (around lines 1233-1290). The clean deliverable at `deliverables/membership-fix/sandbox-entry.ts` has 0 violations but was never copied to the source.

2. **Not registered in Sunrise Yoga** — the plugin was never added to any live Emdash site's `astro.config.mjs`. It has never been tested against a running Emdash instance.

3. **No smoke test** — registration, status lookup, and admin Block Kit have never been verified end-to-end on a real site.

## CRITICAL: Do NOT Rewrite

The deliverable file is clean (0 violations, 3,441 lines). The source file has 4 violations in 2 routes. Either:
- Copy the deliverable over the source: `cp deliverables/membership-fix/sandbox-entry.ts plugins/membership/src/sandbox-entry.ts`
- Or fix the 4 violations in-place (remove the `rc.user` guard blocks, replace `throw new Response` with `throw new Error`)

Do NOT rewrite the plugin. Do NOT refactor. Fix 4 lines, deploy, test.

## Phase 1: Fix Remaining Violations

In `plugins/membership/src/sandbox-entry.ts`, find the `approve` route handler (around line 1230) and the `revoke` route handler (around line 1280). Both have this identical pattern:

```typescript
// WRONG — remove this entire block (4 lines)
const adminUser = rc.user as Record<string, unknown> | undefined;
if (!adminUser || !adminUser.isAdmin) {
  throw new Response(
    JSON.stringify({ error: "Admin access required" }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
```

Delete both blocks entirely. Emdash handles admin auth before the handler runs — these checks are unnecessary and use banned patterns.

After fixing, verify zero violations:
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts
# Expected: 0
```

## Phase 2: Register in Sunrise Yoga

Add the MemberShip plugin to the Sunrise Yoga site at `examples/sunrise-yoga/astro.config.mjs`.

First, check how existing plugins are registered:
```bash
cat examples/sunrise-yoga/astro.config.mjs
```

The plugin needs to be imported and added to the `plugins` array in the emdash configuration. The plugin's descriptor should be at `plugins/membership/src/descriptor.ts` or similar — read it to find the correct import path and function name.

If no descriptor exists, the plugin may use the `sandbox-entry.ts` directly. Check the EventDash plugin registration pattern for reference:
```bash
grep -r "eventdash\|plugin" examples/sunrise-yoga/astro.config.mjs
```

## Phase 3: Smoke Test on Sunrise Yoga

After registering the plugin and restarting the dev server, run these tests:

### Test 1: Admin page loads
```bash
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}' | head -20
```
Expected: JSON response with `blocks` array (not an error)

### Test 2: Member registration
```bash
curl -s -X POST http://localhost:4324/_emdash/api/plugins/membership/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","plan":"basic"}'
```
Expected: `{ "success": true }` or similar (not a double-encoded JSON string, not a `throw new Response` error)

### Test 3: Member status lookup
```bash
curl -s http://localhost:4324/_emdash/api/plugins/membership/status \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Expected: A `MemberRecord` object with `email`, `plan`, `status` fields (not a string, not null)

### Test 4: Verify no double-encoding
The response from Test 3 should be a JSON object, not a string. If you see escaped quotes like `"{\"email\":...}"` that means KV is still double-encoding — BLOCK.

### Test 5: Admin Block Kit pages
```bash
# Members list
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"action","action_id":"view_members"}'

# Plans list  
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"action","action_id":"view_plans"}'
```
Expected: JSON with `blocks` array for each

### Test 6: Banned patterns final check
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/membership/src/sandbox-entry.ts
```
Expected: 0

Document all test results with actual curl output in a TEST-RESULTS.md file in `deliverables/membership-v2/`.

## Phase 4: Deploy to Cloudflare (if tests pass)

If Sunrise Yoga uses Cloudflare Workers in production:
```bash
cd examples/sunrise-yoga && npx wrangler deploy
```

If it's dev-only, just verify the dev server works with the plugin registered.

## Success Criteria

- [ ] Zero banned pattern violations in `plugins/membership/src/sandbox-entry.ts`
- [ ] Plugin registered in `examples/sunrise-yoga/astro.config.mjs`
- [ ] Admin page loads (Test 1 passes)
- [ ] Member registration works (Test 2 passes)
- [ ] Member status returns typed object, not double-encoded string (Tests 3-4 pass)
- [ ] Admin Block Kit pages render (Test 5 passes)
- [ ] All test results documented in `deliverables/membership-v2/TEST-RESULTS.md`
- [ ] Committed and pushed

## Files to Modify

- `plugins/membership/src/sandbox-entry.ts` — remove 2 `rc.user` blocks (8 lines total)
- `examples/sunrise-yoga/astro.config.mjs` — register plugin

## Files to Create

- `deliverables/membership-v2/TEST-RESULTS.md` — smoke test documentation

## Notes

Do not add features. Do not refactor. Do not start v2 work (moat, AI, retention). This PRD is about finishing what was started: fix the last 4 violations, deploy to a real site, and prove it works end-to-end. V2 is a separate PRD after this passes.
