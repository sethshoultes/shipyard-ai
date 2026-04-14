# Requirements: intake-add-p2

**Generated**: 2024-04-14
**Project Slug**: intake-add-p2
**Source PRD**: `/home/agent/shipyard-ai/prds/intake-add-p2.md`
**Source Decisions**: `/home/agent/shipyard-ai/rounds/intake-add-p2/decisions.md`

---

## Executive Summary

Expand the GitHub issue intake daemon to poll for `p2` labeled issues alongside existing `p0` and `p1` support. This is a minimal, targeted change per Decision 7: "Minimum viable delta. Ship the diff, not the refactor."

**Target File**: `/home/agent/great-minds-plugin/daemon/src/health.ts`
**Function**: `pollGitHubIssuesWithLabels()` (lines 162-222)
**Estimated LOC Change**: 4-6 lines

---

## Functional Requirements

### REQ-001: Add p2 Label Fetch
**Source**: PRD lines 9-23, decisions.md Decision 1 MVP
**Description**: Add `const p2Issues = fetchByLabel("p2");` after the existing p1Issues fetch (health.ts line 188).
**Verification**: Code inspection confirms p2 fetch call exists at line 189.

### REQ-002: Include p2 in Merged Array
**Source**: PRD lines 24-30, decisions.md Decision 8
**Description**: Update the spread array from `[...p0Issues, ...p1Issues]` to `[...p0Issues, ...p1Issues, ...p2Issues]` at health.ts line 192.
**Verification**: Code includes p2Issues in the merged array.

### REQ-003: Deduplication Handles 3 Labels
**Source**: decisions.md Decision 8
**Description**: Existing Set-based deduplication must work with 3 label sources. "Defensive deduplication using Set. O(1) cost, prevents duplicate PRDs."
**Verification**: An issue with all 3 labels (p0, p1, p2) results in only 1 PRD.

### REQ-004: Update Polling Start Log Message
**Source**: PRD line 33, decisions.md Decision 3
**Description**: Update health.ts line 163 from `log("INTAKE: Polling GitHub for p0/p1 issues")` to `log("INTAKE: Polling GitHub for p0/p1/p2 issues")`.
**Verification**: Log output shows "p0/p1/p2" when polling starts.

### REQ-005: Update Results Log Message
**Source**: PRD line 35, decisions.md Decision 3
**Description**: Update health.ts line 220 from `p0/p1 issue(s)` to `p0/p1/p2 issue(s)`.
**Verification**: Log output shows "p0/p1/p2 issue(s)" in results message.

### REQ-006: Generate PRD for Qualifying p2 Issues
**Source**: PRD line 40, decisions.md MVP
**Description**: After deduplication, the existing `convertIssueToPRD()` function processes all qualifying issues including p2.
**Verification**: GitHub issues #34 (SEODash) and #35 (CommerceKit) with p2 labels are auto-converted to PRDs.

---

## Configuration Requirements (Decision 4)

### REQ-007: Configurable Priority Labels (Recommended)
**Source**: decisions.md Decision 4
**Description**: Priority labels should be configurable via `INTAKE_PRIORITY_LABELS` environment variable. Default: `p0,p1,p2`. Parse as comma-separated string.
**Note**: Decision 7 mandates "minimal diff". If config requires significant changes, hardcode `['p0', 'p1', 'p2']` for v1 and defer configurable labels to v2.
**Verification**: If implemented, setting `INTAKE_PRIORITY_LABELS=p0,p1` excludes p2 from polling.

### REQ-008: Follow Existing Config Pattern
**Source**: decisions.md Open Question 4
**Description**: If adding configuration, follow existing pattern in config.ts: `process.env.VAR || defaultValue` (see lines 9, 59, 62).
**Verification**: Config pattern matches existing codebase conventions.

---

## Observability Requirements (Decision 3)

### REQ-009: Log Timestamp Per Poll Cycle
**Source**: decisions.md Decision 3
**Description**: Every poll cycle must include timestamp in logs. Already provided by logger.ts.
**Verification**: Log entries show timestamp prefix (e.g., `2024-04-14 12:00:00 DAEMON: INTAKE: ...`).

### REQ-010: Log Issues Found Count
**Source**: decisions.md Decision 3
**Description**: Every poll cycle must log number of issues found.
**Verification**: Log shows `Found X p0/p1/p2 issue(s)`.

### REQ-011: Log Fatal Errors
**Source**: decisions.md Risk Register
**Description**: Any fatal errors during poll cycle must be logged.
**Verification**: Error conditions produce log output via existing error handling.

---

## Technical Requirements

### REQ-012: TypeScript Must Compile
**Source**: PRD line 41
**Description**: Modified code must compile with TypeScript without errors.
**Verification**: `tsc` or `npm run build` exits with code 0.

### REQ-013: Minimal Diff — No Refactoring
**Source**: PRD line 49, decisions.md Decision 7
**Description**: "One targeted change. Do not refactor or reorganize." This is a HARD CONSTRAINT.
**Verification**: Git diff shows only necessary lines changed (~4-6 lines).

### REQ-014: Target File Must Be health.ts
**Source**: PRD line 46
**Description**: Modifications occur in `/home/agent/great-minds-plugin/daemon/src/health.ts`.
**Verification**: Only health.ts modified (and config.ts if adding configurable labels).

---

## Constraint Requirements (Must NOT Have)

### REQ-015: No Dashboard or Status Page
**Source**: decisions.md Decision 6, MVP "Must NOT Have"
**Description**: Do not implement any dashboard or status page functionality.
**Verification**: No new UI files or HTTP endpoints added.

### REQ-016: No User-Facing Configuration UI
**Source**: decisions.md Decision 5
**Description**: No settings panel for users. Configuration is for operators only via env vars.
**Verification**: No UI components added.

### REQ-017: No p3/p4 or Additional Priority Levels
**Source**: decisions.md MVP "Must NOT Have"
**Description**: Support exactly p0, p1, p2. Do not add p3, p4, or other levels.
**Verification**: Label array is exactly `['p0', 'p1', 'p2']`.

### REQ-018: No Batched API Query Optimization
**Source**: decisions.md Decision 9
**Description**: Do not optimize to single batched query (`label:p0 OR label:p1 OR label:p2`). Deferred to v2.
**Verification**: Code makes three separate API calls (one per label).

### REQ-019: No Health Check Endpoint
**Source**: decisions.md MVP "Must NOT Have"
**Description**: Do not add health check endpoint. Deferred to v2.
**Verification**: No new HTTP endpoints.

---

## Deployment Requirements

### REQ-020: Commit to great-minds-plugin Repository
**Source**: PRD line 42
**Description**: Commit changes to the great-minds-plugin repository.
**Verification**: Git log shows commits in great-minds-plugin.

### REQ-021: Push to Remote
**Source**: PRD line 42
**Description**: Push commits to remote repository after local commit.
**Verification**: `git status` shows branch is up to date with remote.

### REQ-022: Restart Daemon Service
**Source**: PRD line 43
**Description**: After push, execute `systemctl restart shipyard-daemon.service`.
**Verification**: Daemon running with new code (verify via logs).

---

## Traceability Matrix

| Requirement | PRD Line | decisions.md | Task |
|-------------|----------|--------------|------|
| REQ-001 | 9-23 | Decision 1 MVP | phase-1-task-1 |
| REQ-002 | 24-30 | Decision 8 | phase-1-task-1 |
| REQ-003 | 24-30 | Decision 8 | phase-1-task-1 |
| REQ-004 | 33 | Decision 3 | phase-1-task-2 |
| REQ-005 | 35 | Decision 3 | phase-1-task-2 |
| REQ-006 | 40 | MVP | (automatic via existing code) |
| REQ-007 | - | Decision 4 | phase-1-task-3 (optional) |
| REQ-008 | - | Open Q4 | phase-1-task-3 |
| REQ-009-011 | - | Decision 3 | (existing functionality) |
| REQ-012 | 41 | Decision 2 | phase-1-task-4 |
| REQ-013 | 49 | Decision 7 | ALL |
| REQ-014 | 46 | - | ALL |
| REQ-015-019 | - | Must NOT Have | CONSTRAINT |
| REQ-020-022 | 42-43 | Decision 2 | phase-1-task-5 |

---

## Open Questions Resolved

| # | Question | Resolution |
|---|----------|------------|
| 1 | Where does config live? | Follow existing pattern: `process.env.INTAKE_PRIORITY_LABELS?.split(',') \|\| ['p0', 'p1', 'p2']` in config.ts. Or hardcode for minimal diff. |
| 2 | Should log include label name per issue? | No — log counts only per decisions.md Decision 3. |
| 3 | Is 60s polling acceptable for p2? | Polling is 5 minutes (config.ts line 40). Acceptable per decisions. |
| 4 | Existing config pattern? | Yes — `process.env.VAR \|\| default` at config.ts lines 9, 59, 62. |

---

## Risk Mitigations

From Risk Scanner analysis:

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hardcoded label references | High | Medium | Search for all "p0/p1" strings before changing |
| No config infrastructure for arrays | Medium | Medium | Use simple comma-separated parsing or defer config to v2 |
| Scope creep temptation | High | High | Decision 7 is HARD CONSTRAINT — minimal diff only |
| Test coverage gap | High | Medium | No tests exist for `pollGitHubIssuesWithLabels()` — accept for v1, add tests in v2 |
| Three API calls at scale | Low | High | Current scale safe; monitor via logs; defer batching to v2 |

---

## Code Reference

### Current Implementation (health.ts lines 185-196)
```typescript
try {
  // Fetch p0 and p1 separately (gh CLI --label a,b syntax is unreliable)
  const p0Issues = fetchByLabel("p0");
  const p1Issues = fetchByLabel("p1");

  // Deduplicate by issue number (issues with both labels appear in both results)
  const seen = new Set<number>();
  const merged = [...p0Issues, ...p1Issues].filter((issue) => {
    if (seen.has(issue.number)) return false;
    seen.add(issue.number);
    return true;
  });
```

### Required Changes
```typescript
// Line 189: ADD this line
const p2Issues = fetchByLabel("p2");

// Line 192: MODIFY to include p2Issues
const merged = [...p0Issues, ...p1Issues, ...p2Issues].filter((issue) => {
```

### Log Message Updates
```typescript
// Line 163: MODIFY
log("INTAKE: Polling GitHub for p0/p1/p2 issues");

// Line 220: MODIFY
log(`INTAKE: Found ${issues.length} p0/p1/p2 issue(s) across ${GITHUB_REPOS.length} repos`);
```

---

## Version

- **Specification Version**: 1.0
- **Last Updated**: 2024-04-14
- **PRD Source**: `prds/intake-add-p2.md`
- **Decisions Source**: `rounds/intake-add-p2/decisions.md`
- **Codebase Reference**: `/home/agent/great-minds-plugin/daemon/src/health.ts` lines 162-222
