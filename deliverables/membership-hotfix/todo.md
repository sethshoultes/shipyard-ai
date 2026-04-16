# Todo List: Membership Plugin Hotfix

**Project:** membership-hotfix
**Status:** Ready to Execute
**Estimated Time:** 15-20 minutes total

---

## Wave 1: Core Fixes (Parallel Tasks)

### Task 1: Add Default Admin Dashboard Handler

- [ ] Read sandbox-entry.ts lines 2202-2525 to understand current admin handler structure — verify: can describe handler flow
- [ ] Locate members page handler starting at line 2211 — verify: line number confirmed
- [ ] Insert new page_load handler BEFORE line 2211 with condition: `if (interaction.type === "page_load" && (!interaction.page || interaction.page === "/"))` — verify: handler placed above members handler
- [ ] Add KV fetches with null guards: `const listJson = await ctx.kv.get<string>("members:list") ?? "[]"` and `const plansJson = await ctx.kv.get<string>("plans") ?? "[]"` — verify: both fetches have ?? fallbacks
- [ ] Parse JSON with defaults: `const memberEmails = parseJSON<string[]>(listJson, [])` and `const plans = parseJSON(plansJson, DEFAULT_PLANS)` — verify: parseJSON calls include array defaults
- [ ] Return Block Kit response with header block (text: "MemberShip — Membership Management"), stats block (Total Members, Active Plans), and actions block (3 buttons: Manage Members, Manage Plans, Settings) — verify: response has all 3 block types

### Task 2: Add Null Guards to KV Array Operations

- [ ] Search for all `ctx.kv.get` calls in sandbox-entry.ts — verify: found all KV fetch locations
- [ ] Update line 2212 members:list fetch to include `?? "[]"` — verify: grep shows null coalescing present
- [ ] Search for all `.map()` calls using `grep -n "\.map(" plugins/membership/src/sandbox-entry.ts` — verify: each .map() operates on null-safe array
- [ ] Verify plans list fetch has proper parseJSON fallback — verify: plans fetch cannot return undefined
- [ ] Review all `.filter()`, `.forEach()`, `.reduce()` calls for null safety — verify: no array operations on potentially undefined values

---

## Wave 2: Verification & Deploy (Sequential, After Wave 1)

### Task 3: Verify Zero Banned Patterns

- [ ] Run `grep -c "throw new Response" plugins/membership/src/sandbox-entry.ts` — verify: output is 0
- [ ] Run `grep -c "rc\.user" plugins/membership/src/sandbox-entry.ts` — verify: output is 0
- [ ] Run `grep -c "rc\.pathParams" plugins/membership/src/sandbox-entry.ts` — verify: output is 0

### Task 4: Commit and Push Changes

- [ ] Run `git status` to verify only sandbox-entry.ts is modified — verify: no unexpected changes
- [ ] Stage file: `git add plugins/membership/src/sandbox-entry.ts` — verify: git status shows file staged
- [ ] Create commit with message "fix(membership): fix blank settings page and null reference crashes" (see spec.md for full message) — verify: git log -1 shows correct commit message
- [ ] Push changes: `git push` — verify: git status shows "Your branch is up to date"

---

## Verification Summary

After all tasks complete, verify:

- [ ] **Final grep check passes:** `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts` returns 0
- [ ] **Null guards present:** All KV list fetches use `?? []` or parseJSON with array default
- [ ] **Block Kit structure valid:** page_load handler returns `{ blocks: [...] }` with header, stats, actions
- [ ] **Git status clean:** Working tree is clean after push
- [ ] **Manual test ready:** Code ready for QA to test admin dashboard, members page, plans page

---

## Notes

- **Time per task:** Each task should take <5 minutes
- **Parallel execution:** Tasks 1-2 are independent and can run in parallel
- **Sequential execution:** Tasks 3-4 MUST run after tasks 1-2 complete
- **Verification critical:** Each checkbox includes a "verify:" clause — confirm it passes before moving on
- **Hotfix priority:** This is p0 production fix — prioritize correctness over speed

---

*Generated for shipyard-ai agency • GSD methodology*
