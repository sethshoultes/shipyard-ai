# NERVE — Atomic Requirements Specification

**Product:** NERVE (Autonomous Pipeline Daemon for Operations Hardening)
**Project Slug:** promptops
**Generated:** April 11, 2026
**Sources:** rounds/promptops/decisions.md, docs/EMDASH-GUIDE.md (not applicable - pure bash)

---

## The Essence

> **What it is:** The invisible backbone that makes everything else possible.

> **The feeling:** Peace. The absence of the 3 AM knot in your stomach.

> **The one thing that must be perfect:** Determinism. When something must happen, it happens.

> **Creative direction:** Disappear completely. Work always.

---

## Requirements Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Blocker | 9 | Build acceptance criteria - must complete before ship |
| P1-Must | 16 | Core MVP functionality from locked decisions |
| P2-Should | 6 | Risk mitigation requirements |
| **Total** | **31** | |

---

## Critical Overrides (decisions.md Locked Decisions)

| # | Decision | Proposed By | Winner | Requirement Impact |
|---|----------|-------------|--------|-------------------|
| 1 | **Name: NERVE** | Steve | Steve | All code/docs use "nerve" prefix |
| 2 | **No Proxy in v1** | Elon | Elon | No HTTP proxy code |
| 3 | **No Dashboards v1** | Steve | Steve | CLI only, no web UI |
| 4 | **Bash Over Agent Prompts** | Both | Consensus | All ops are shell commands |
| 5 | **Zero Configuration** | Steve | Steve | No config files |
| 6 | **Rate Limiting Per API Key** | Elon | Elon | Rate limit before external exposure |
| 7 | **CLI-First Architecture** | Both | Consensus | nerve push/status/abort verbs |
| 8 | **Observability Before Scale** | Elon | Elon | Three metrics before sharding |
| 9 | **PRD Required Before v2** | Elon | Elon | Retrospective PRD required |
| 10 | **Clinical Voice** | Both | Consensus | No emoji/exclamation/casual |

---

## P0-BLOCKER (Build Acceptance Criteria)

### NERVE-REQ-001: daemon.sh PID Lockfile
- **Category:** Core
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
daemon.sh starts, creates PID lockfile at `/tmp/nerve.pid`, prevents duplicate instances.

**Acceptance Criteria:**
- [ ] Daemon creates `/tmp/nerve.pid` with its PID
- [ ] Second daemon instance exits with code 2 (already running)
- [ ] PID file removed on clean shutdown
- [ ] Stale PID detection (process dead but file exists)

---

### NERVE-REQ-002: queue.sh Persistence and Recovery
- **Category:** Core
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
queue.sh persists queue to disk at `/tmp/nerve-queue/`, recovers state on restart.

**Acceptance Criteria:**
- [ ] Queue items written to `pending/`, `running/`, `completed/`, `failed/` directories
- [ ] Items survive daemon crash
- [ ] Items in `running/` moved back to `pending/` on restart (crash recovery)
- [ ] Atomic file operations (write temp, then mv)

---

### NERVE-REQ-003: abort.sh Flag Handling
- **Category:** Core
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
abort.sh sets flag at `/tmp/nerve.abort`, daemon responds, shutdown is clean.

**Acceptance Criteria:**
- [ ] `abort.sh set` creates abort flag
- [ ] Daemon detects flag and sets SHUTDOWN_REQUESTED
- [ ] Daemon completes current item before exit
- [ ] Clean shutdown within 5 seconds (or SIGKILL escalation)
- [ ] `abort.sh clear` removes flag

---

### NERVE-REQ-004: parse-verdict.sh JSON Output
- **Category:** Core
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
parse-verdict.sh returns JSON with verdict (PASS/FAIL/BLOCKED) and issue counts.

**Acceptance Criteria:**
- [ ] Exit code 0 = PASS verdict found
- [ ] Exit code 1 = FAIL verdict found
- [ ] Exit code 2 = ERROR (no verdict, file missing, ambiguous)
- [ ] Parses `**Status:** PASS/FAIL` and `VERDICT: PASS/FAIL` patterns

---

### NERVE-REQ-005: Consistent Log Format
- **Category:** Observability
- **Priority:** P0
- **Source:** decisions.md OQ-001 Resolution

**Description:**
All scripts use log format: `[TIMESTAMP] [COMPONENT] message`

**Acceptance Criteria:**
- [ ] TIMESTAMP is ISO8601 UTC: `2026-04-11T14:22:33Z`
- [ ] COMPONENT is one of: DAEMON, QUEUE, ABORT, VERDICT
- [ ] No emoji, no exclamation marks, no "Oops!"
- [ ] Grep-able format for log analysis

**Examples:**
```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] pushed item a1b2c3d4 (type: qa-pass)
[2026-04-11T14:22:35Z] [ABORT] shutdown requested
```

---

### NERVE-REQ-006: Nerve Prefix Usage
- **Category:** Naming
- **Priority:** P0
- **Source:** decisions.md OQ-002 Resolution

**Description:**
All file paths use `nerve` prefix. No references to `promptops`.

**Acceptance Criteria:**
- [ ] PID file: `/tmp/nerve.pid`
- [ ] Abort flag: `/tmp/nerve.abort`
- [ ] Queue directory: `/tmp/nerve-queue/`
- [ ] `ps aux | grep nerve` works

---

### NERVE-REQ-007: README Documentation
- **Category:** Documentation
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
README.md documents all commands with examples.

**Acceptance Criteria:**
- [ ] All scripts documented (daemon.sh, queue.sh, abort.sh, parse-verdict.sh)
- [ ] All functions documented with parameters
- [ ] All exit codes documented
- [ ] Usage examples for common workflows
- [ ] Troubleshooting section

---

### NERVE-REQ-008: Deliverables Committed
- **Category:** Delivery
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
All files committed to deliverables directory.

**Acceptance Criteria:**
- [ ] All scripts in `/home/agent/shipyard-ai/nerve/` or deliverables
- [ ] README.md included
- [ ] Git commit with conventional message

---

### NERVE-REQ-009: QA Pass
- **Category:** Quality
- **Priority:** P0
- **Source:** decisions.md Section IX

**Description:**
QA Pass confirms zero P0 issues.

**Acceptance Criteria:**
- [ ] All acceptance criteria verified
- [ ] No P0 bugs outstanding
- [ ] Manual testing completed
- [ ] Risk mitigations verified

---

## P1-MUST (Core MVP Features)

### NERVE-REQ-010: Exit Codes - daemon.sh
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
daemon.sh exit codes match specification.

**Acceptance Criteria:**
- [ ] Exit 0 = success (clean shutdown)
- [ ] Exit 1 = error
- [ ] Exit 2 = already running

---

### NERVE-REQ-011: Exit Codes - queue.sh
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh exit codes match specification.

**Acceptance Criteria:**
- [ ] Exit 0 = success
- [ ] Exit 1 = error
- [ ] Exit 2 = empty queue (for pop/peek)

---

### NERVE-REQ-012: Exit Codes - abort.sh
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
abort.sh exit codes match specification.

**Acceptance Criteria:**
- [ ] Exit 0 = success (or flag exists for check)
- [ ] Exit 1 = error (or flag not exists for check)

---

### NERVE-REQ-013: Exit Codes - parse-verdict.sh
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
parse-verdict.sh exit codes match specification.

**Acceptance Criteria:**
- [ ] Exit 0 = PASS verdict found
- [ ] Exit 1 = FAIL verdict found (or parse error)
- [ ] Exit 2 = file not found

---

### NERVE-REQ-014: Queue Functions - push
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh push function adds items to pending queue.

**Acceptance Criteria:**
- [ ] Creates JSON file in `pending/`
- [ ] Validates item_id (alphanumeric, dash, underscore only)
- [ ] Stores payload as JSON
- [ ] Returns 0 on success, 1 on error

---

### NERVE-REQ-015: Queue Functions - pop
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh pop function retrieves and removes oldest item.

**Acceptance Criteria:**
- [ ] Returns oldest item (FIFO order)
- [ ] Moves item from `pending/` to `running/`
- [ ] Returns 2 if queue empty

---

### NERVE-REQ-016: Queue Functions - peek
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh peek function shows next item without removing.

**Acceptance Criteria:**
- [ ] Returns oldest item info
- [ ] Does NOT move item
- [ ] Returns 2 if queue empty

---

### NERVE-REQ-017: Queue Functions - depth
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh depth function returns queue size.

**Acceptance Criteria:**
- [ ] Counts pending items
- [ ] Returns count to stdout
- [ ] Returns 0 exit code

---

### NERVE-REQ-018: Queue Functions - metrics
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
queue.sh metrics function returns queue metrics.

**Acceptance Criteria:**
- [ ] Returns JSON with queue depth, latency, error count
- [ ] Writes to `/tmp/nerve-metrics.json`

---

### NERVE-REQ-019: Abort Functions - set/clear/status/force-kill
- **Category:** Implementation
- **Priority:** P1
- **Source:** decisions.md Section III

**Description:**
abort.sh provides full abort lifecycle.

**Acceptance Criteria:**
- [ ] `set` creates abort flag with timestamp
- [ ] `clear` removes abort flag
- [ ] `status` shows current abort state
- [ ] `force-kill` sends SIGKILL to daemon

---

### NERVE-REQ-020: Three Observability Metrics
- **Category:** Observability
- **Priority:** P1
- **Source:** decisions.md Decision 8

**Description:**
Queue depth, latency, error count metrics before scale work.

**Acceptance Criteria:**
- [ ] `queue_depth` tracked (pending items)
- [ ] `latency_last` tracked (last item processing time)
- [ ] `error_count` tracked (failed items)
- [ ] Metrics written to `/tmp/nerve-metrics.json`

---

### NERVE-REQ-021: Deterministic Execution
- **Category:** Core
- **Priority:** P1
- **Source:** decisions.md Decision 4

**Description:**
All operations are shell commands, not LLM prompts.

**Acceptance Criteria:**
- [ ] No LLM calls in any script
- [ ] All state changes via bash commands
- [ ] Deterministic behavior (same input = same output)

---

### NERVE-REQ-022: Zero Configuration
- **Category:** UX
- **Priority:** P1
- **Source:** decisions.md Decision 5

**Description:**
Every option has sensible default. No config files.

**Acceptance Criteria:**
- [ ] Scripts work with no arguments
- [ ] Environment variables optional (override only)
- [ ] No config file parsing

---

### NERVE-REQ-023: Clinical Voice in Logs
- **Category:** UX
- **Priority:** P1
- **Source:** decisions.md Decision 10

**Description:**
Professional tone in all output. No emoji, no casual language.

**Acceptance Criteria:**
- [ ] No emoji anywhere
- [ ] No exclamation marks
- [ ] No "Oops!" or casual language
- [ ] Report and move on: `[QUEUE] 47 items processed. 2.3s elapsed.`

---

### NERVE-REQ-024: Bash 4.0+ Requirement
- **Category:** Implementation
- **Priority:** P1
- **Source:** Codebase patterns

**Description:**
All scripts verify Bash 4.0+ at startup.

**Acceptance Criteria:**
- [ ] Version check at script start
- [ ] Exit 2 with clear error if Bash < 4.0
- [ ] Uses `#!/usr/bin/env bash` shebang

---

### NERVE-REQ-025: Strict Mode
- **Category:** Implementation
- **Priority:** P1
- **Source:** Codebase patterns

**Description:**
All scripts use `set -euo pipefail`.

**Acceptance Criteria:**
- [ ] Exit on error
- [ ] Exit on undefined variable
- [ ] Exit on pipe failure
- [ ] `umask 0077` for file permissions

---

## P2-SHOULD (Risk Mitigation)

### NERVE-REQ-026: Atomic File Writes
- **Category:** Risk
- **Priority:** P2
- **Source:** decisions.md Risk Register (Queue corruption)

**Description:**
Prevent queue corruption by using atomic writes.

**Acceptance Criteria:**
- [ ] Write to temp file first
- [ ] Use `mv` to final location (atomic rename)
- [ ] No partial JSON files

---

### NERVE-REQ-027: Orphan Process Cleanup
- **Category:** Risk
- **Priority:** P2
- **Source:** decisions.md Risk Register (Orphan processes)

**Description:**
Abort escalation: SIGTERM -> 5 sec wait -> SIGKILL.

**Acceptance Criteria:**
- [ ] `abort.sh force-kill` sends SIGTERM first
- [ ] Waits 5 seconds
- [ ] Then sends SIGKILL if still running

---

### NERVE-REQ-028: Input Validation
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - JSON injection

**Description:**
Validate inputs to prevent queue corruption.

**Acceptance Criteria:**
- [ ] Item ID: alphanumeric, dash, underscore only
- [ ] Payload: valid JSON (if jq available) or basic check
- [ ] Reason strings: escaped for JSON safety

---

### NERVE-REQ-029: Stale PID Detection
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - Race condition

**Description:**
Detect and handle stale PID files.

**Acceptance Criteria:**
- [ ] Check if PID in lockfile is alive (`kill -0`)
- [ ] Remove stale lockfile if process dead
- [ ] Proceed with daemon start

---

### NERVE-REQ-030: Portable sed/stat Usage
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - Portability

**Description:**
Handle GNU vs BSD variants of sed and stat.

**Acceptance Criteria:**
- [ ] Detect GNU vs BSD at runtime
- [ ] Use appropriate syntax for each
- [ ] Log warning if neither works

---

### NERVE-REQ-031: Directory Existence Checks
- **Category:** Risk
- **Priority:** P2
- **Source:** Risk Scanner - /tmp assumptions

**Description:**
Verify queue directory exists and is writable.

**Acceptance Criteria:**
- [ ] Create queue directory on init if missing
- [ ] Check write permissions
- [ ] Clear error message if /tmp not writable

---

## Explicitly Deferred (v2+)

Per decisions.md Section II - Explicitly Deferred:

| Feature | Rationale |
|---------|-----------|
| Metrics/observability dashboard | Read-only observation theater - v2 |
| Multi-daemon coordination | Single-machine is v1 |
| Distributed locking (Redis/etcd) | Not needed for single-machine |
| Queue partitioning | Required for multi-daemon |
| Automated recovery beyond abort | SIGTERM/SIGKILL sufficient |
| LLM-powered verdict parsing | Jensen's Path B recommendation |
| Execution history persistence | Training data - Path B |
| API/SDK for external access | Not internal tooling |
| Chronicle, Health Score, retention | Shonda's roadmap |

---

## Current Implementation Status

### Files in /home/agent/shipyard-ai/nerve/

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| daemon.sh | 247 | Complete | Main loop, PID lock, signal handling |
| queue.sh | 304 | Complete | Persistence, FIFO, crash recovery |
| abort.sh | 112 | Complete | Flag management |
| parse-verdict.sh | 136 | Complete | PASS/FAIL parsing |
| status.sh | 174 | Complete | Human and JSON status output |
| README.md | 300 | Complete | Full documentation |

**Total Lines:** 1,273

### Gaps Identified by Risk Scanner

| Gap | Priority | Effort | Notes |
|-----|----------|--------|-------|
| Atomic file writes | P2 | 2 hours | Write to temp, then mv |
| JSON payload validation | P2 | 1 hour | Use jq or basic check |
| Test suite | P1 | 4 hours | No tests currently exist |
| process_item() stub | P1 | N/A | Intentional for v1 |

---

## Ship Test

> Does the daemon silently handle queue operations without user intervention?
>
> Does the admin feel "peace" - the absence of 3 AM knots?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency - Phase Planning Skill*
*Source: rounds/promptops/decisions.md, CLAUDE.md*
*Project Slug: promptops*
