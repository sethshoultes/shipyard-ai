# Specification: Membership Plugin Hotfix

**Project:** membership-hotfix
**Type:** Production Hotfix (p0)
**Target:** yoga.shipyard.company
**Generated:** 2026-04-16

---

## Goals

Fix two critical runtime bugs blocking customers on the Membership plugin admin dashboard:

1. **Blank Settings Page** — Admin dashboard at `/_emdash/admin/plugins/membership` renders completely blank on page load
2. **Members Page Crash** — Members list page at `/_emdash/admin/plugins/membership/members` throws `Cannot read properties of undefined (reading 'map')` error

Both issues are Block Kit rendering failures in the admin route handler.

---

## Implementation Approach

### Root Causes Identified

**Bug 1: Blank Settings Page**
- The admin `page_load` handler does not have a default route for the root admin page (`/` or no page specified)
- When users navigate to the root plugin admin page, no handler matches the request
- Empty blocks array is returned, causing a blank screen

**Bug 2: Members Page `.map()` Crash**
- KV fetch for `members:list` can return `null` or `undefined` when no members exist yet
- Code attempts to call `.map()` on the undefined value without null-checking
- Results in runtime TypeError crash

### Implementation Strategy

**Phase 1: Add Default Admin Dashboard Handler**
- Insert new handler BEFORE existing members page handler (line 2211 in sandbox-entry.ts)
- Check for `interaction.type === "page_load"` AND `(!interaction.page || interaction.page === "/")`
- Fetch member and plan counts from KV with null-safe defaults
- Return Block Kit response with:
  - Header: "MemberShip — Membership Management"
  - Stats block: Total Members count, Active Plans count
  - Actions block: 3 buttons (Manage Members, Manage Plans, Settings)

**Phase 2: Reinforce Null Guards on KV Operations**
- Add `?? []` null coalescing to all `ctx.kv.get()` calls that fetch arrays
- Target patterns: `.map()`, `.filter()`, `.forEach()`, `.reduce()`
- Primary fixes:
  - Line 2212: `members:list` fetch
  - Verify plans list fetch has proper fallback
  - Audit all other KV list operations

**Phase 3: Verify Zero Banned Patterns**
- Run grep checks to ensure no sandboxed plugin violations:
  - No `throw new Response`
  - No `rc.user` references
  - No `rc.pathParams` references

**Phase 4: Commit and Deploy**
- Single commit with all fixes
- Push to remote repository
- Ready for deployment to yoga.shipyard.company

---

## Verification Criteria

### Automated Tests

1. **Banned Patterns Check**
   - Run: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts`
   - Expected: Output is `0`
   - Pass criteria: Zero occurrences of banned patterns

2. **Null Guard Presence Check**
   - Run: `grep -n "members:list" plugins/membership/src/sandbox-entry.ts`
   - Verify: Each fetch includes `?? "[]"` or `?? []` or parseJSON with array default
   - Pass criteria: All KV list fetches are null-safe

3. **Block Kit Structure Validation**
   - Read admin handler section (lines 2202-2525)
   - Verify: page_load handler returns `{ blocks: [...] }` with valid Block Kit blocks
   - Pass criteria: Response matches format from EMDASH-GUIDE.md and PRD example

### Manual Verification

1. **Root Admin Page Loads**
   - Navigate to: `https://yoga.shipyard.company/_emdash/admin/plugins/membership`
   - Expected: Page displays dashboard with header, stats, and action buttons
   - FAIL if: Page is blank or shows error
   - PASS if: All UI elements render correctly

2. **Members Page with Empty State**
   - Clear KV store for `members:list` (simulate empty database)
   - Navigate to: `/_emdash/admin/plugins/membership/members`
   - Expected: Page shows empty table or "No members" message
   - FAIL if: Page crashes with `.map()` error
   - PASS if: Page renders without errors

3. **Plans Page with Empty State**
   - Clear KV store for `plans` (simulate empty database)
   - Navigate to: `/_emdash/admin/plugins/membership/plans`
   - Expected: Page shows default plans or empty state
   - FAIL if: Page crashes with undefined error
   - PASS if: Page renders with fallback data

4. **Stats Display Accuracy**
   - Verify member count in dashboard matches actual member count in KV
   - Verify plan count in dashboard matches actual plan count in KV
   - Pass criteria: Counts are accurate (0 for empty, actual count otherwise)

5. **Button Interactions**
   - Click "Manage Members" button → should navigate to members page
   - Click "Manage Plans" button → should navigate to plans page
   - Click "Settings" button → should show settings form
   - Pass criteria: All buttons trigger correct actions

### Code Review Checklist

- [ ] New page_load handler is placed BEFORE line 2211 (members handler)
- [ ] page_load handler checks for root page: `(!interaction.page || interaction.page === "/")`
- [ ] KV fetches use null coalescing: `await ctx.kv.get(...) ?? "[]"`
- [ ] parseJSON calls include array defaults: `parseJSON(json, [])`
- [ ] Block Kit blocks array includes: header, stats, actions
- [ ] Stats items include: Total Members, Active Plans
- [ ] Actions include: 3 buttons with correct action_ids
- [ ] No regression to existing handlers (members, plans still work)
- [ ] Zero banned patterns in final code

---

## Files to be Modified

### Modified Files

1. **plugins/membership/src/sandbox-entry.ts**
   - Location: Admin route handler section (lines 2202-2525)
   - Changes:
     - Add new page_load handler for root admin page (insert before line 2211)
     - Add null coalescing to members:list fetch (line 2212)
     - Add null coalescing to any other KV array fetches without guards
   - Lines affected: ~30-40 lines (new handler ~15 lines, null guards ~5-10 edits)

### No New Files Created

This is a hotfix to existing code — no new files are required.

---

## Success Criteria Summary

**All criteria must pass before deployment:**

1. ✅ Admin page_load handler returns valid Block Kit blocks (not blank)
2. ✅ view_members works with 0 members in KV (no crash, empty state renders)
3. ✅ view_plans works with 0 plans in KV (no crash, defaults render)
4. ✅ view_settings (if implemented) returns valid settings form
5. ✅ Zero banned pattern violations (grep check passes)
6. ✅ All manual verification tests pass
7. ✅ Code review checklist complete
8. ✅ Changes committed and pushed to remote

**Deployment Ready When:**
- All automated tests pass
- All manual verifications complete
- QA sign-off received
- Git commit pushed to remote repository

---

## Risk Mitigation

### Production Hotfix Risks
- **Impact:** Live site (yoga.shipyard.company) — test thoroughly before deploy
- **Mitigation:** Test all admin pages after changes, verify no regressions to existing functionality

### KV State Assumptions
- **Risk:** Code assumes DEFAULT_PLANS constant exists and is an array
- **Mitigation:** Verify constant definition before deployment, add fallback if missing

### Block Kit Format Compliance
- **Risk:** Incorrect Block Kit format will cause rendering failures
- **Mitigation:** Follow exact format from EMDASH-GUIDE.md (lines 1015-1047) and PRD example (lines 42-56)

### Regression Risk
- **Risk:** Changes to admin handler could affect existing /members and /plans pages
- **Mitigation:** Test all admin pages after changes, verify buttons and navigation still work

---

## Deployment Procedure

1. Complete all implementation tasks (see todo.md)
2. Run all automated tests (see tests/ directory)
3. Perform all manual verification steps
4. Get QA approval (Margaret Hamilton review)
5. Commit changes with conventional commit message
6. Push to remote repository
7. Deploy to yoga.shipyard.company using standard deployment procedure
8. Monitor production logs for errors
9. Have rollback plan ready (revert commit if issues occur)

---

*Generated for shipyard-ai agency • GSD methodology*
