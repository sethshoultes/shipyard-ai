# TODO: Fix EventDash 95 Banned Pattern Violations

**Project**: fix-eventdash-violations
**Type**: Hotfix (verification & documentation)
**Date**: 2026-04-16

---

## Wave 1: Pattern Verification

### Task 1: Verify All Banned Patterns Eliminated

- [x] Run primary grep command for all 5 patterns — verify: output must be 0
  ```bash
  grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
  ```

- [x] Run individual pattern checks for detailed verification — verify: all return 0 or empty
  ```bash
  grep -n "throw new Response" plugins/eventdash/src/sandbox-entry.ts
  grep -n "rc\.user" plugins/eventdash/src/sandbox-entry.ts
  grep -n "rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts
  grep -n "JSON\.stringify.*kv" plugins/eventdash/src/sandbox-entry.ts
  grep -n "kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
  ```

- [x] Check parseEvent() helper for acceptable JSON.parse — verify: 0 or 1 match in parseEvent() is OK
  ```bash
  grep -n "JSON\.parse" plugins/eventdash/src/sandbox-entry.ts
  ```

- [x] Verify file size reduction — verify: reduced from 3,442 lines to ~133 lines
  ```bash
  wc -l plugins/eventdash/src/sandbox-entry.ts
  ```

- [x] Document verification results in notes — verify: all 5 patterns show 0 violations

---

## Wave 2: Build & Validation (Parallel)

### Task 2: Verify TypeScript Compilation

- [ ] Navigate to eventdash plugin directory — verify: pwd shows /home/agent/shipyard-ai/plugins/eventdash
  ```bash
  cd /home/agent/shipyard-ai/plugins/eventdash
  ```

- [ ] Check if dependencies installed — verify: node_modules exists or run npm install
  ```bash
  test -d node_modules && echo "OK" || npm install
  ```

- [ ] Run TypeScript compilation check — verify: exit code 0, no errors in output
  ```bash
  npx tsc --noEmit src/sandbox-entry.ts 2>&1 | tee ts-check.log
  ```

- [ ] Review compilation results — verify: ts-check.log shows no errors
  ```bash
  cat ts-check.log
  ```

- [ ] Run build script if exists — verify: build succeeds or skip if no build script
  ```bash
  npm run build 2>&1 | tee build.log || echo "No build script"
  ```

### Task 3: Compare with Membership Reference

- [ ] Compare error handling patterns — verify: both use return objects not Response throws
  ```bash
  echo "=== EventDash ===" && grep -A2 "error:" plugins/eventdash/src/sandbox-entry.ts | head -20
  echo "=== Membership ===" && grep -A2 "error:" plugins/membership/src/sandbox-entry.ts | head -20
  ```

- [ ] Compare KV.set patterns — verify: neither uses JSON.stringify wrapper
  ```bash
  echo "=== EventDash ===" && grep "kv\.set" plugins/eventdash/src/sandbox-entry.ts
  echo "=== Membership ===" && grep "kv\.set" plugins/membership/src/sandbox-entry.ts | head -10
  ```

- [ ] Compare KV.get patterns — verify: both use typed retrieval without JSON.parse
  ```bash
  echo "=== EventDash ===" && grep "kv\.get" plugins/eventdash/src/sandbox-entry.ts
  echo "=== Membership ===" && grep "kv\.get" plugins/membership/src/sandbox-entry.ts | head -10
  ```

- [ ] Compare input parameter access — verify: both use routeCtx.input or rc.input
  ```bash
  echo "=== EventDash ===" && grep "routeCtx\.input\|rc\.input" plugins/eventdash/src/sandbox-entry.ts | head -10
  echo "=== Membership ===" && grep "routeCtx\.input\|rc\.input" plugins/membership/src/sandbox-entry.ts | head -10
  ```

- [ ] Verify no auth checks in either file — verify: both return 0
  ```bash
  grep -c "rc\.user" plugins/eventdash/src/sandbox-entry.ts
  grep -c "rc\.user" plugins/membership/src/sandbox-entry.ts
  ```

### Task 4: Run Functional Validation

- [ ] Review route definitions — verify: events, createEvent, admin routes exist
  ```bash
  grep -A3 "routes:" plugins/eventdash/src/sandbox-entry.ts
  ```

- [ ] Verify handler signatures — verify: all use (routeCtx, ctx) => format
  ```bash
  grep "handler.*async" plugins/eventdash/src/sandbox-entry.ts
  ```

- [ ] Read createEvent handler — verify: input validation, UUID generation, KV storage without JSON.stringify
  ```bash
  grep -A20 "createEvent.*handler" plugins/eventdash/src/sandbox-entry.ts
  ```

- [ ] Read events listing handler — verify: loadEvents() called, parseEvent() used, sorting logic intact
  ```bash
  grep -A20 "routes.*events.*handler" plugins/eventdash/src/sandbox-entry.ts | head -40
  ```

- [ ] Read admin UI handler — verify: Block Kit structure, page_load handling, form actions
  ```bash
  grep -A30 "admin.*handler" plugins/eventdash/src/sandbox-entry.ts | head -50
  ```

- [ ] Verify parseEvent() helper — verify: handles string and object formats
  ```bash
  grep -A10 "function parseEvent" plugins/eventdash/src/sandbox-entry.ts
  ```

---

## Wave 3: Documentation & Commit

### Task 5: Document Pattern Fixes and Verification

- [ ] Create verification summary document — verify: file created at .planning/eventdash-fix-verification.md
  ```bash
  cat > /home/agent/shipyard-ai/.planning/eventdash-fix-verification.md <<'EOF'
  [Summary content with all verification results]
  EOF
  ```

- [ ] Add code comment to parseEvent() function — verify: JSDoc comment added explaining intentional JSON.parse
  ```bash
  # Edit plugins/eventdash/src/sandbox-entry.ts to add comment above parseEvent()
  ```

- [ ] Document correct patterns in verification summary — verify: includes all 5 pattern examples (wrong vs correct)

- [ ] Create deployment readiness checklist in verification summary — verify: all checkboxes from PRD included

- [ ] Document scope boundaries — verify: what changed vs what preserved sections complete

- [ ] Check for backup file and document rollback — verify: rollback procedure documented
  ```bash
  ls -la plugins/eventdash/src/sandbox-entry.ts.backup* 2>/dev/null
  ```

### Task 6: Create Commit (If Needed)

- [ ] Navigate to repo root and check git status — verify: shows status of sandbox-entry.ts
  ```bash
  cd /home/agent/shipyard-ai && git status plugins/eventdash/src/sandbox-entry.ts
  ```

- [ ] Check for uncommitted changes — verify: if diff shows lines, proceed with commit; if 0, skip
  ```bash
  git diff plugins/eventdash/src/sandbox-entry.ts | wc -l
  ```

- [ ] Review diff if changes exist — verify: only pattern fixes, no business logic changes
  ```bash
  git diff plugins/eventdash/src/sandbox-entry.ts | head -100
  ```

- [ ] Stage files if committing — verify: git status shows staged files
  ```bash
  git add plugins/eventdash/src/sandbox-entry.ts .planning/eventdash-fix-verification.md
  ```

- [ ] Create commit with conventional format — verify: commit created with Co-Authored-By line
  ```bash
  git commit -m "$(cat <<'EOF'
  fix(eventdash): eliminate 95 banned pattern violations in sandbox-entry.ts

  [Full commit message from spec]

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  EOF
  )"
  ```

- [ ] Verify commit created — verify: git log shows commit with proper message
  ```bash
  git log -1 --stat | head -30
  ```

---

## Completion Checklist

### Pattern Compliance
- [ ] Primary grep command returns 0
- [ ] All 5 individual pattern checks pass
- [ ] parseEvent() JSON.parse is documented and acceptable
- [ ] File size reduced from 3,442 to ~133 lines

### Build Validation
- [ ] TypeScript compilation succeeds (exit code 0)
- [ ] No type errors in ts-check.log
- [ ] Build script runs successfully (if exists)

### Reference Comparison
- [ ] Error handling patterns match membership plugin
- [ ] KV.set patterns match (no JSON.stringify)
- [ ] KV.get patterns match (no JSON.parse wrapper)
- [ ] Input access patterns match (routeCtx.input)
- [ ] No auth checks in either file

### Functional Validation
- [ ] All route handlers have correct signatures
- [ ] createEvent handler: validation + UUID + KV storage verified
- [ ] events handler: loadEvents + parseEvent + sorting verified
- [ ] admin handler: Block Kit structure verified
- [ ] parseEvent() handles legacy data correctly

### Documentation
- [ ] Verification summary created at .planning/eventdash-fix-verification.md
- [ ] parseEvent() has JSDoc comment
- [ ] Correct patterns documented
- [ ] Deployment checklist complete
- [ ] Scope boundaries documented
- [ ] Rollback procedure documented

### Git
- [ ] Git status checked
- [ ] Changes reviewed (if any)
- [ ] Files staged (if committing)
- [ ] Commit created with conventional format (if needed)
- [ ] Commit verified in git log (if created)

---

## Success Criteria (from PRD)

- [ ] Zero `throw new Response` in eventdash sandbox-entry.ts
- [ ] Zero `JSON.stringify`/`JSON.parse` in KV calls (except parseEvent helper)
- [ ] Zero `rc.user` references
- [ ] Zero `rc.pathParams` references
- [ ] TypeScript compiles without errors
- [ ] All verification documented
- [ ] Committed and ready for deployment

---

**Total Tasks**: 33 atomic sub-tasks across 6 main tasks
**Estimated Time**: <30 minutes (mostly automated verification)
**Current Status**: Ready to execute Wave 1
