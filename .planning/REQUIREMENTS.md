# Requirements: Intake Auto-Close (Closer)

> **Project Slug:** intake-autoclose
> **Source:** PRD + Locked Decisions from Debate Phase
> **Generated:** 2025-01-13

---

## Executive Summary

When the daemon's GitHub intake converts an issue to a PRD and the pipeline ships it, the original GitHub issue should auto-close. Currently issues remain open until manually closed. This feature adds a single function (`closeSourceIssue()`) to `pipeline.ts` that closes the source issue after successful ship.

**Architecture:** Single function in existing file (~20 lines total)
**Files Modified:** 1 (`pipeline.ts`)
**New Dependencies:** 0 (uses existing `gh` CLI)

---

## The Essence (from decisions.md)

> *"Invisible. Inevitable. Complete."*

The quiet satisfaction of a door clicking shut. When you ship, the issue closes. No configuration. No retry logic. No ceremony.

---

## Atomic Requirements

### Function Definition

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-1 | Function `closeSourceIssue()` must be defined in `pipeline.ts` | Decisions #1 | Function exists in `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` |
| REQ-2 | Function signature: `closeSourceIssue(prdContent: string, projectName: string): void` | Decisions (File Structure) | Function accepts PRD markdown content and project name, returns void |
| REQ-3 | Function is ~15 lines, total change ~20 lines | Decisions (File Structure) | Line count within bounds |

### Content Parsing

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-4 | Parse PRD content with regex `/Auto-generated from GitHub issue (.+)#(\d+)/` | PRD + Decisions #2 | Regex correctly extracts repo (group 1) and issue number (group 2) |
| REQ-5 | Content parsing is authoritative — do NOT parse filename | Decisions #2 | Function reads PRD content, not filename pattern |
| REQ-6 | If markdown lacks issue marker, fail silently (debug log, not error) | Decisions (Open Questions) | No match = silent skip with optional debug log |

### Shell Command

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-7 | Execute: `gh issue close {number} --repo "{repo}" --comment "..."` | PRD | Command format matches exactly |
| REQ-8 | Use `execSync` (synchronous, fire-and-forget) | Decisions #6 | No async/await, no promises for gh command |
| REQ-9 | Timeout: 15 seconds (15_000 ms) | PRD + Decisions #6 | `execSync` options include `timeout: 15_000` |

### Comment Format

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-10 | Comment text: `Shipped via Great Minds pipeline. Project: {project}` | PRD + Decisions #3 | Exact text with project name interpolated |
| REQ-11 | Professional tone: no emojis, no exclamation points, no marketing language | Decisions #4 | Comment is single plain sentence |

### Error Handling

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-12 | On failure: log error and continue (non-fatal) | PRD + Decisions #6 | Try-catch wraps execSync, logs error, does not throw |
| REQ-13 | Log format: `[Closer] Failed to close {repo}#{number}: {error}` | Decisions (Open Questions) | Log message follows existing patterns |
| REQ-14 | Pipeline must not crash if close fails | PRD (Success Criteria) | Pipeline completes even on close failure |

### Call Site

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-15 | Call `closeSourceIssue()` after PRD archived to `completed/` | PRD + Decisions | Call site is after line 566 in `runPipeline()` |
| REQ-16 | Single call site only | Decisions (MVP) | Only one invocation in entire codebase |
| REQ-17 | Only call after successful ship (failed pipelines do NOT close) | PRD (Success Criteria) | Close is inside try block, after ship success |

### Negative Scope (What Does NOT Ship)

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-18 | No new files (`closer.ts`, `issue-manager/`, etc.) | Decisions (MVP) | Only `pipeline.ts` modified |
| REQ-19 | No retry logic or exponential backoff | Decisions #7 | No retry loops in code |
| REQ-20 | No configuration options (toggles, opt-out, settings) | Decisions #5 | No config parameters added |
| REQ-21 | No async workers or queues | Decisions (MVP) | No queue libraries or async patterns |
| REQ-22 | No webhooks | Decisions (MVP) | No webhook handlers |
| REQ-23 | No status labels or transition states | Decisions (MVP) | Only `gh issue close`, no label changes |
| REQ-24 | No elaborate comment templates | Decisions (MVP) | Hardcoded single-line string |
| REQ-25 | Zero new dependencies | Decisions (File Structure) | package.json unchanged |

### Success Criteria

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-26 | GitHub-sourced PRD ships -> original issue closed with comment | PRD | Manual test passes |
| REQ-27 | Non-GitHub PRDs (manually created) are unaffected | PRD | PRDs without marker skipped silently |
| REQ-28 | Failed pipelines do NOT close issues | PRD | Close only runs after successful ship |
| REQ-29 | TypeScript compiles without errors | PRD | `npx tsc --noEmit` succeeds |
| REQ-30 | Changes committed to great-minds-plugin | PRD | Git log shows commit |
| REQ-31 | Service restarted after deploy | PRD | `systemctl restart shipyard-daemon.service` |

---

## Traceability Matrix

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1, REQ-2, REQ-3 | Task 1 (Add function) | 1 |
| REQ-4, REQ-5, REQ-6 | Task 1 (Regex parsing) | 1 |
| REQ-7, REQ-8, REQ-9 | Task 1 (execSync call) | 1 |
| REQ-10, REQ-11 | Task 1 (Comment format) | 1 |
| REQ-12, REQ-13, REQ-14 | Task 1 (Error handling) | 1 |
| REQ-15, REQ-16, REQ-17 | Task 2 (Call site) | 1 |
| REQ-18-25 | Verification (negative scope) | 2 |
| REQ-26-28 | Task 3 (Manual test) | 2 |
| REQ-29 | Task 4 (TypeScript compile) | 2 |
| REQ-30, REQ-31 | Task 5 (Commit & deploy) | 3 |

---

## Technical Context

### Archive Location (from Codebase Scout)

**File:** `/home/agent/great-minds-plugin/daemon/src/pipeline.ts`
**Lines:** 559-566 (within `runPipeline()` function)

```typescript
// Archive completed PRD so daemon doesn't rebuild it
const prdPath = resolve(PRDS_DIR, prdFile);
const archiveDir = resolve(PRDS_DIR, "completed");
await mkdir(archiveDir, { recursive: true });
const archivePath = resolve(archiveDir, prdFile);
const { rename } = await import("fs/promises");
await rename(prdPath, archivePath).catch(() => {});
log(`ARCHIVE: Moved ${prdFile} to prds/completed/`);
```

**Call site for closeSourceIssue():** After line 566, before line 568.

### PRD Content Format (from health.ts)

The `convertIssueToPRD()` function in health.ts writes PRDs with this format on line 2:

```
> Auto-generated from GitHub issue {repo}#{number}
```

**Regex to extract:** `/Auto-generated from GitHub issue (.+)#(\d+)/`
- Capture group [1] = repo (e.g., `sethshoultes/shipyard-ai`)
- Capture group [2] = issue number (e.g., `32`)

### Imports Needed

Current imports in pipeline.ts (lines 1-26):
- `execSync` from "child_process" — **ALREADY IMPORTED** (line 7)
- `PRDS_DIR` from "./config.js" — **ALREADY IMPORTED** (line 10)
- `log` from "./logger.js" — **ALREADY IMPORTED** (line 25)

**Need to add:**
- `readFileSync` from "fs" — modify line 8 to include

### Existing Patterns

**execSync usage (health.ts lines 169-172):**
```typescript
const output = execSync(
  `gh issue list --repo "${repo}" --state open --label "${label}" ...`,
  { encoding: "utf-8", timeout: 15_000 }
);
```

**Error handling pattern:**
```typescript
try {
  execSync(command, options);
  log(`Success message`);
} catch (err) {
  log(`Error message: ${err}`);
  // Non-fatal — continue execution
}
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| gh CLI not authenticated | Low | Medium | Fail gracefully with clear error message |
| GitHub rate limiting | Low | Low | Authenticated gh CLI gets 5,000 req/hour |
| Regex fails on malformed markdown | Low | Low | Fail silently, log, continue |
| 15-second timeout too short | Very Low | Low | GitHub API is fast; timeout indicates larger issues |
| Feature creep post-ship | Medium | High | Document the "NO" list prominently — this doc is the defense |
| Closing already-closed issue | Low | Low | gh CLI handles gracefully |

---

## Implementation Checklist

From decisions.md:

- [ ] Read `pipeline.ts` and `health.ts` (existing patterns)
- [ ] Add `closeSourceIssue()` function (~15 lines)
- [ ] Add call site in archive success path (~5 lines)
- [ ] Test with real issue (manual verification)
- [ ] Compile, commit, restart service

**Estimated time:** 2-4 hours

---

## Final Alignment

**Elon:** "Ship the PRD as written, with Steve's comment format. Everything else is decoration."

**Steve:** "Ship it right. Then move on."

---

*This document is the specification for the build phase. No new debates. Build what's locked.*
