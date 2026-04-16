# Requirements: membership-deploy

**Generated**: 2026-04-16
**Project**: membership-deploy
**Source PRD**: /home/agent/shipyard-ai/prds/membership-deploy.md
**Source Decisions**: /home/agent/shipyard-ai/rounds/membership-deploy/decisions.md

---

## Executive Summary

Deploy the clean membership plugin from `deliverables/membership-fix/` to `plugins/membership/src/`. This is a 3-file copy operation with zero banned patterns, complete endpoint testing, and full user flow validation. Binary outcome: works completely or rollback immediately.

**Scope**: SMALL AND FOCUSED
- Copy 3 files (sandbox-entry.ts, auth.ts, email.ts)
- Verify zero banned patterns
- Test 3 API endpoints
- Document results
- Commit and push

**NOT in Scope**:
- Renaming to "Portal"
- Copy/UX rewrites
- Pre-commit hooks (post-ship)
- Directory structure unification (post-ship)
- CI/CD automation (post-ship)

---

## Requirements Traceability Matrix

### Pre-Deploy Validation

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-001 | MUST | Dev server running on port 4324 | Server responds to HTTP requests | `curl -s http://localhost:4324/_emdash/api/plugins/membership/admin \| head -1` returns valid response |
| REQ-002 | MUST | Source files exist in deliverables/ | All 3 files present | `test -f deliverables/membership-fix/sandbox-entry.ts && test -f deliverables/membership-fix/auth.ts && test -f deliverables/membership-fix/email.ts` |
| REQ-003 | MUST | Destination directory writable | plugins/membership/src/ exists | `test -d plugins/membership/src/ && test -w plugins/membership/src/` |
| REQ-004 | MUST | Fail fast if server unavailable | Clear error, halt immediately | Attempt deploy without server, verify halt with error message |

### File Deployment

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-005 | MUST | Copy sandbox-entry.ts | File copied successfully | `cp deliverables/membership-fix/sandbox-entry.ts plugins/membership/src/` exits 0 |
| REQ-006 | MUST | Copy auth.ts (if exists) | File copied or skipped gracefully | `cp deliverables/membership-fix/auth.ts plugins/membership/src/auth.ts 2>/dev/null \|\| true` |
| REQ-007 | MUST | Copy email.ts (if exists) | File copied or skipped gracefully | `cp deliverables/membership-fix/email.ts plugins/membership/src/email.ts 2>/dev/null \|\| true` |
| REQ-008 | MUST | Zero banned patterns in all files | Count = 0 for all patterns | `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/*.ts` returns 0 for each file |
| REQ-009 | MUST | Commit with clear message | Commit includes "0 banned pattern violations" | `git log --oneline -1 \| grep "0 banned pattern violations"` |

### Endpoint Testing

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-010 | MUST | Admin endpoint returns 200 | HTTP 200 with valid JSON | `curl -s http://localhost:4324/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' \| head -5` shows response |
| REQ-011 | MUST | Register endpoint returns 200 | HTTP 200 with valid JSON | `curl -s -X POST http://localhost:4324/_emdash/api/plugins/membership/register -H "Content-Type: application/json" -d '{"email":"smoketest@example.com","plan":"basic"}' \| head -5` shows response |
| REQ-012 | MUST | Status endpoint returns 200 | HTTP 200 with valid JSON | `curl -s http://localhost:4324/_emdash/api/plugins/membership/status -H "Content-Type: application/json" -d '{"email":"smoketest@example.com"}' \| head -5` shows response |
| REQ-013 | MUST | Fail if any endpoint non-200 | Deployment halts immediately | All 3 endpoints must return 200 or rollback |

### Full User Flow Testing (Steve's Requirement)

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-014 | MUST | User visits members-only page | Page loads without error | Manual: Navigate to membership entry point |
| REQ-015 | MUST | User enters email address | Email input accepts valid format | Manual: Type email, form accepts |
| REQ-016 | MUST | User receives magic link | Email delivered with clickable link | Manual: Check inbox, verify link present |
| REQ-017 | MUST | Magic link grants access | Clicking link shows protected content | Manual: Click link, verify authentication |
| REQ-018 | MUST | Session persists | Page refresh maintains auth | Manual: Refresh page after REQ-017, still authenticated |

### Negative Testing

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-019 | MUST | Invalid email rejected | System shows error for bad format | Manual: Submit "invalidemail", verify error |
| REQ-020 | MUST | Error message terse and factual | Message is 1-2 sentences, no chatty copy | Manual: Read error, verify brevity |
| REQ-021 | MUST | Expired link shows error | Clear error for invalid/expired links | Manual: Use expired link, verify error |
| REQ-022 | MUST | Expired link error terse | Message is 1-2 sentences, factual | Manual: Read error, verify brevity |

### Documentation

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-026 | MUST | TEST-RESULTS.md created | File exists with all sections | `test -f deliverables/membership-v2/TEST-RESULTS.md` |
| REQ-027 | MUST | Banned pattern counts documented | All 3 patterns listed with count 0 | `grep "throw new Response.*0" deliverables/membership-v2/TEST-RESULTS.md` |
| REQ-028 | MUST | API test results documented | All 3 endpoints listed with status codes | `grep -E "(Admin\|Register\|Status).*200" deliverables/membership-v2/TEST-RESULTS.md` |
| REQ-029 | MUST | Notes section completed | Section exists (can be empty) | `grep "## Notes" deliverables/membership-v2/TEST-RESULTS.md` |
| REQ-030 | MUST | README updated | Deployment confirmation added | `grep "0 banned patterns" README.md` or equivalent |
| REQ-031 | MUST | All changes committed | Git log shows files | `git log --name-only -1 \| grep "plugins/membership"` |
| REQ-032 | MUST | Changes pushed to remote | Remote up to date | `git status \| grep "nothing to commit"` |

### Quality Standards

| REQ-ID | Priority | Requirement | Success Criteria | Acceptance Test |
|--------|----------|-------------|------------------|-----------------|
| REQ-023 | SHOULD | Manual code review | Visual inspection confirms zero patterns | Developer review of source files |
| REQ-024 | MUST | Binary outcome enforcement | All pass or complete rollback | Test failure scenario, verify rollback |
| REQ-025 | SHOULD | Single session deployment | Total time < 2 hours | Timestamp start to finish < 120 minutes |

---

## Out of Scope (Explicitly Deferred)

| Item | Reason | Deferred To |
|------|--------|-------------|
| Brand renaming ("Portal") | Not touching user-facing copy in this deploy | Post-ship UX sprint |
| Copy/UX rewrites | Deliverables already has final copy | Post-ship if needed |
| Pre-commit hooks | Process fix, not deploy blocker | Post-ship automation |
| Directory unification | Technical debt, acknowledged | Post-ship cleanup |
| CI/CD automation | Infrastructure improvement | Post-ship enhancement |
| Admin dashboards | v2+ feature | Future release |
| Member analytics | v2+ feature | Future release |
| Feature flags/A-B testing | v2+ feature | Future release |
| Enterprise features | v2+ feature | Future release |

---

## Banned Patterns Reference

**Zero tolerance for:**
1. `throw new Response` — Use `throw new Error()` instead
2. `rc.user` — Use typed extraction pattern instead
3. `rc.pathParams` — Use typed input object instead

**Verification command:**
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/*.ts
```

Expected output: All counts = 0

---

## Success Criteria (Binary Gate)

**✅ DEPLOY SUCCESS** requires ALL of:
- [ ] All 3 files copied (or confirmed not needed)
- [ ] Zero banned patterns verified
- [ ] All 3 endpoints return HTTP 200
- [ ] Complete user flow works end-to-end
- [ ] Negative tests handled gracefully
- [ ] TEST-RESULTS.md complete and accurate
- [ ] All changes committed and pushed
- [ ] Total time < 2 hours

**❌ DEPLOY FAILURE** if ANY of:
- Server not available → HALT at REQ-004
- Any banned patterns → ROLLBACK at REQ-008
- Any endpoint fails → ROLLBACK at REQ-013
- User flow breaks → ROLLBACK immediately
- Partial deployment → ROLLBACK completely
- Multi-session execution → Project failure

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Server unavailable | MEDIUM | HIGH | Fail fast with clear error (REQ-004) |
| Incomplete user flow | MEDIUM | HIGH | Mandatory end-to-end test (REQ-014-018) |
| Banned pattern regression | LOW | MEDIUM | Automated grep verification (REQ-008) |
| Scope creep | MEDIUM | MEDIUM | Ruthless discipline, locked scope |
| Partial ship | MEDIUM | MEDIUM | Binary outcome enforcement (REQ-024) |

---

## Decision Alignment

This requirements document aligns with:

**Decision 1 (Elon)**: Ship scope is locked at 3-file copy
**Decision 2 (Steve)**: Full user flow testing is mandatory
**Decision 3 (Both)**: Zero banned patterns, binary outcomes
**Decision 4 (Elon)**: Post-ship process fixes deferred
**Decision 5 (Steve)**: Design philosophy deferred to post-ship

---

## Verification Commands

```bash
# Pre-deploy check
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin || echo "SERVER NOT RUNNING"

# Banned pattern check
grep -r "throw new Response\|rc\.user\|rc\.pathParams" deliverables/membership-fix/ && echo "PATTERNS FOUND" || echo "CLEAN"

# Endpoint tests
curl -s http://localhost:4324/_emdash/api/plugins/membership/admin -H "Content-Type: application/json" -d '{"type":"page_load"}' | head -1
curl -s -X POST http://localhost:4324/_emdash/api/plugins/membership/register -H "Content-Type: application/json" -d '{"email":"test@example.com","plan":"basic"}' | head -1
curl -s http://localhost:4324/_emdash/api/plugins/membership/status -H "Content-Type: application/json" -d '{"email":"test@example.com"}' | head -1

# Commit verification
git log --oneline -1 | grep "0 banned pattern violations"
```

---

**Total Requirements**: 32 (28 MUST, 2 SHOULD, 2 deferred categories)
**Critical Path**: REQ-001 → REQ-004 → REQ-005-007 → REQ-008 → REQ-010-013 → REQ-026-032
**Blocking Gates**: Server check (REQ-004), Pattern check (REQ-008), Endpoint validation (REQ-013)
