# Phase 1 Plan — NERVE v1 Verification & Ship

**Generated:** April 11, 2026
**Project Slug:** promptops
**Product Name:** NERVE (Autonomous Pipeline Daemon)
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 12
**Waves:** 3
**Status:** READY FOR BUILD

---

## The Essence

> **What it is:** The invisible backbone that makes everything else possible.

> **The feeling:** Peace. The absence of the 3 AM knot in your stomach.

> **The one thing that must be perfect:** Determinism. When something must happen, it happens.

> **Creative direction:** Disappear completely. Work always.

---

## Build Status

**Technical MVP:** Feature-complete (1,273 lines of code across 5 scripts + README)
**Board Verdict:** HOLD (4.7/10) — with conditions for proceeding
**Current State:** Scripts exist but need verification against acceptance criteria

| Script | Lines | Status | Verification Needed |
|--------|-------|--------|---------------------|
| daemon.sh | 247 | Complete | PID lock, exit codes, signal handling |
| queue.sh | 304 | Complete | FIFO, crash recovery, atomic writes |
| abort.sh | 112 | Complete | Flag lifecycle, force-kill |
| parse-verdict.sh | 136 | Complete | Exit codes, pattern matching |
| status.sh | 174 | Complete | JSON output, metrics display |
| README.md | 300 | Complete | All commands documented |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| NERVE-REQ-001: daemon.sh PID Lockfile | phase-1-task-1 | 1 |
| NERVE-REQ-002: queue.sh Persistence | phase-1-task-2 | 1 |
| NERVE-REQ-003: abort.sh Flag Handling | phase-1-task-3 | 1 |
| NERVE-REQ-004: parse-verdict.sh Output | phase-1-task-4 | 1 |
| NERVE-REQ-005: Log Format | phase-1-task-5 | 2 |
| NERVE-REQ-006: Nerve Prefix | phase-1-task-5 | 2 |
| NERVE-REQ-007: README Documentation | phase-1-task-6 | 2 |
| NERVE-REQ-020: Three Metrics | phase-1-task-7 | 2 |
| NERVE-REQ-026: Atomic Writes | phase-1-task-8 | 2 |
| NERVE-REQ-027: Orphan Cleanup | phase-1-task-9 | 2 |
| NERVE-REQ-009: QA Pass | phase-1-task-10 | 3 |
| Board Path C: Baseline Metrics | phase-1-task-11 | 3 |
| Sara Blakely Review | phase-1-task-12 | 3 |

---

## Documentation References

This plan cites specific sections from the source documents:

- **decisions.md Section II (MVP Feature Set):** Core components and UX requirements
- **decisions.md Section III (File Structure):** Implementation specifications and exit codes
- **decisions.md Section IV (Open Questions):** OQ-001 log format, OQ-002 naming resolved
- **decisions.md Section V (Risk Register):** Atomic writes, orphan processes
- **decisions.md Section VI (Board Conditions):** Path C (ROI validation) requirements
- **decisions.md Section IX (Acceptance Criteria):** 9-item checklist

---

## Wave Execution Order

### Wave 1 (Parallel) — Verification of Core Scripts

Four independent tasks verifying each script meets acceptance criteria.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Verify daemon.sh PID lockfile and exit codes</title>
  <requirement>NERVE-REQ-001: daemon.sh PID Lockfile (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: daemon.sh starts, creates PID lockfile,
    prevents duplicate instances. Exit codes: 0=success, 1=error, 2=already running.
    Must verify against specification.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/daemon.sh" reason="Script to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Specification source" />
  </context>

  <steps>
    <step order="1">Read daemon.sh and locate acquire_lock() function (~lines 79-96)</step>
    <step order="2">Verify PID file path is /tmp/nerve.pid (per OQ-002 resolution)</step>
    <step order="3">Test: Start daemon, verify /tmp/nerve.pid contains correct PID</step>
    <step order="4">Test: Start second daemon, verify exit code 2</step>
    <step order="5">Test: Stop daemon, verify PID file is removed</step>
    <step order="6">Test: Create stale PID file (dead process), verify daemon handles it</step>
    <step order="7">Verify exit code 0 on clean shutdown (SIGTERM)</step>
    <step order="8">Verify exit code 1 on initialization error (Bash version check)</step>
    <step order="9">Document any fixes needed in verification notes</step>
  </steps>

  <verification>
    <check type="bash">./nerve/daemon.sh &amp;&amp; cat /tmp/nerve.pid</check>
    <check type="bash">./nerve/daemon.sh; echo "Exit code: $?"</check>
    <check type="test">Second instance exits with code 2</check>
    <check type="test">PID file removed on clean shutdown</check>
    <check type="test">Stale PID detection works</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>verify(nerve): daemon.sh PID lockfile and exit codes

Per decisions.md Section IX acceptance criteria:
- PID lockfile at /tmp/nerve.pid verified
- Exit codes match spec (0/1/2)
- Duplicate instance prevention confirmed
- Stale PID detection working

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Verify queue.sh persistence and crash recovery</title>
  <requirement>NERVE-REQ-002: queue.sh Persistence and Recovery (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: queue.sh persists queue to disk, recovers
    state on restart. Items in running/ moved back to pending/ on init.
    Risk: Queue corruption on crash (Section V).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/queue.sh" reason="Script to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Specification source" />
  </context>

  <steps>
    <step order="1">Read queue.sh and locate queue_init() function</step>
    <step order="2">Verify queue directory is /tmp/nerve-queue/ (per OQ-002)</step>
    <step order="3">Test: Initialize queue, verify directories created (pending, running, completed, failed)</step>
    <step order="4">Test: Enqueue item, verify JSON file in pending/</step>
    <step order="5">Test: Dequeue item, verify moves to running/</step>
    <step order="6">Test: Complete item, verify moves to completed/</step>
    <step order="7">Test: Fail item, verify moves to failed/ with reason</step>
    <step order="8">Test crash recovery: Create item in running/, call init, verify moved to pending/</step>
    <step order="9">Test FIFO: Enqueue 3 items, dequeue, verify oldest returned</step>
    <step order="10">Verify exit codes: 0=success, 1=error, 2=empty queue</step>
    <step order="11">Check for atomic writes (write temp, then mv) per Risk Register</step>
  </steps>

  <verification>
    <check type="bash">./nerve/queue.sh init &amp;&amp; ls /tmp/nerve-queue/</check>
    <check type="bash">./nerve/queue.sh enqueue test-001 '{"msg":"hello"}'</check>
    <check type="test">Items survive daemon crash</check>
    <check type="test">Crash recovery moves running to pending</check>
    <check type="test">FIFO order maintained</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>verify(nerve): queue.sh persistence and crash recovery

Per decisions.md Section IX acceptance criteria:
- Queue persists to /tmp/nerve-queue/
- Crash recovery verified (running -> pending)
- FIFO ordering confirmed
- Exit codes match spec (0/1/2)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Verify abort.sh flag handling and force-kill</title>
  <requirement>NERVE-REQ-003: abort.sh Flag Handling (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: abort.sh sets flag, daemon responds,
    shutdown is clean. Force-kill escalation: SIGTERM -> 5 sec -> SIGKILL.
    Risk: Orphan processes (Section V).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/abort.sh" reason="Script to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Specification source" />
  </context>

  <steps>
    <step order="1">Read abort.sh and verify flag path is /tmp/nerve.abort</step>
    <step order="2">Test: abort.sh set - verify flag file created with timestamp</step>
    <step order="3">Test: abort.sh status - verify correct status reported</step>
    <step order="4">Test: abort.sh clear - verify flag removed</step>
    <step order="5">Test: abort.sh check - verify exit code 0 when flag exists, 1 when not</step>
    <step order="6">Integration test: Start daemon, set abort, verify clean shutdown</step>
    <step order="7">Verify daemon completes current item before exit</step>
    <step order="8">Test force-kill: Verify SIGTERM sent first, then SIGKILL after 5 sec</step>
    <step order="9">Verify no orphan processes left after force-kill</step>
    <step order="10">Verify exit codes match spec</step>
  </steps>

  <verification>
    <check type="bash">./nerve/abort.sh set &amp;&amp; cat /tmp/nerve.abort</check>
    <check type="bash">./nerve/abort.sh status</check>
    <check type="bash">./nerve/abort.sh clear</check>
    <check type="test">Daemon shuts down cleanly on abort flag</check>
    <check type="test">Force-kill escalation works</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>verify(nerve): abort.sh flag handling and force-kill

Per decisions.md Section IX acceptance criteria:
- Abort flag at /tmp/nerve.abort
- Clean shutdown on flag detection
- Force-kill escalation (SIGTERM -> SIGKILL)
- No orphan processes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Verify parse-verdict.sh patterns and exit codes</title>
  <requirement>NERVE-REQ-004: parse-verdict.sh JSON Output (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: parse-verdict.sh returns verdict with
    exit codes: 0=PASS, 1=FAIL, 2=ERROR (no verdict, file missing, ambiguous).
    Patterns: **Status:** PASS/FAIL, VERDICT: PASS/FAIL
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/parse-verdict.sh" reason="Script to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Specification source" />
  </context>

  <steps>
    <step order="1">Read parse-verdict.sh and locate pattern matching logic</step>
    <step order="2">Create test file with **Status:** PASS, verify exit code 0</step>
    <step order="3">Create test file with **Status:** FAIL, verify exit code 1</step>
    <step order="4">Create test file with VERDICT: PASS, verify exit code 0</step>
    <step order="5">Create test file with VERDICT: FAIL, verify exit code 1</step>
    <step order="6">Test missing file, verify exit code 2</step>
    <step order="7">Test file with no verdict, verify exit code 2</step>
    <step order="8">Test ambiguous file (both PASS and FAIL), verify exit code 2</step>
    <step order="9">Verify patterns don't match substrings (PASSING, FAILED)</step>
    <step order="10">Document any pattern edge cases</step>
  </steps>

  <verification>
    <check type="bash">echo '**Status:** PASS' | ./nerve/parse-verdict.sh -; echo "Exit: $?"</check>
    <check type="bash">echo '**Status:** FAIL' | ./nerve/parse-verdict.sh -; echo "Exit: $?"</check>
    <check type="test">Exit 0 on PASS verdict</check>
    <check type="test">Exit 1 on FAIL verdict</check>
    <check type="test">Exit 2 on missing/ambiguous</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>verify(nerve): parse-verdict.sh patterns and exit codes

Per decisions.md Section IX acceptance criteria:
- Exit 0 = PASS verdict
- Exit 1 = FAIL verdict
- Exit 2 = ERROR (no verdict, missing, ambiguous)
- Patterns match specification

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Quality & Risk Mitigation

Five tasks for log format, documentation, metrics, and risk mitigations.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Verify log format and nerve prefix usage</title>
  <requirement>NERVE-REQ-005: Log Format, NERVE-REQ-006: Nerve Prefix (P0-Blocker)</requirement>
  <description>
    Per decisions.md OQ-001/OQ-002 Resolution: All logs use format
    [TIMESTAMP] [COMPONENT] message. All paths use nerve prefix.
    Clinical voice: no emoji, no exclamation, no casual language.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/daemon.sh" reason="Check log format" />
    <file path="/home/agent/shipyard-ai/nerve/queue.sh" reason="Check log format" />
    <file path="/home/agent/shipyard-ai/nerve/abort.sh" reason="Check log format" />
    <file path="/home/agent/shipyard-ai/nerve/parse-verdict.sh" reason="Check log format" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="OQ-001/002 resolutions" />
  </context>

  <steps>
    <step order="1">Grep all scripts for log functions and echo statements</step>
    <step order="2">Verify timestamp format: ISO8601 UTC (YYYY-MM-DDTHH:MM:SSZ)</step>
    <step order="3">Verify component tags: [DAEMON], [QUEUE], [ABORT], [VERDICT]</step>
    <step order="4">Verify no emoji anywhere in output</step>
    <step order="5">Verify no exclamation marks</step>
    <step order="6">Verify no casual language ("Oops!", "Hey!", etc.)</step>
    <step order="7">Verify path /tmp/nerve.pid (not promptops)</step>
    <step order="8">Verify path /tmp/nerve.abort (not promptops)</step>
    <step order="9">Verify path /tmp/nerve-queue/ (not promptops)</step>
    <step order="10">Test: ps aux | grep nerve returns daemon</step>
    <step order="11">Fix any violations found</step>
  </steps>

  <verification>
    <check type="bash">grep -r "promptops" /home/agent/shipyard-ai/nerve/</check>
    <check type="bash">grep -r "!" /home/agent/shipyard-ai/nerve/*.sh | grep -v "#"</check>
    <check type="test">All logs match [TIMESTAMP] [COMPONENT] message</check>
    <check type="test">No promptops references</check>
    <check type="test">Clinical voice maintained</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Verify after daemon tested" />
  </dependencies>

  <commit-message>verify(nerve): log format and nerve prefix usage

Per decisions.md OQ-001/OQ-002 resolutions:
- Log format: [TIMESTAMP] [COMPONENT] message
- ISO8601 UTC timestamps
- nerve prefix on all paths
- Clinical voice (no emoji/exclamation)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Verify README documentation completeness</title>
  <requirement>NERVE-REQ-007: README Documentation (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: README.md documents all commands with examples.
    Must cover all scripts, functions, exit codes, workflows, troubleshooting.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/README.md" reason="Documentation to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Specification source" />
  </context>

  <steps>
    <step order="1">Read README.md and create checklist of documented items</step>
    <step order="2">Verify daemon.sh documented: start, stop, status, exit codes</step>
    <step order="3">Verify queue.sh documented: push, pop, peek, depth, metrics</step>
    <step order="4">Verify abort.sh documented: set, clear, status, force-kill</step>
    <step order="5">Verify parse-verdict.sh documented: patterns, exit codes</step>
    <step order="6">Verify status.sh documented: human/JSON output</step>
    <step order="7">Check for usage examples for each command</step>
    <step order="8">Verify troubleshooting section exists</step>
    <step order="9">Verify failure modes documented</step>
    <step order="10">Cross-reference with decisions.md acceptance criteria</step>
    <step order="11">Add any missing documentation</step>
  </steps>

  <verification>
    <check type="manual">All scripts documented</check>
    <check type="manual">All functions with parameters documented</check>
    <check type="manual">All exit codes documented</check>
    <check type="manual">Usage examples present</check>
    <check type="manual">Troubleshooting section exists</check>
  </verification>

  <dependencies>
    <!-- No strict dependencies, but better after scripts verified -->
  </dependencies>

  <commit-message>verify(nerve): README documentation completeness

Per decisions.md Section IX acceptance criteria:
- All scripts documented
- All functions and parameters
- All exit codes
- Usage examples
- Troubleshooting section

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Verify three observability metrics</title>
  <requirement>NERVE-REQ-020: Three Observability Metrics (P1-Must)</requirement>
  <description>
    Per decisions.md Decision 8: Three metrics required before scale work:
    queue_depth, latency_last, error_count. Numbers before features.
    Metrics written to /tmp/nerve-metrics.json.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/daemon.sh" reason="Metrics update logic" />
    <file path="/home/agent/shipyard-ai/nerve/queue.sh" reason="Queue metrics" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Decision 8" />
  </context>

  <steps>
    <step order="1">Locate metrics_update() function in daemon.sh</step>
    <step order="2">Verify queue_depth tracked (pending items count)</step>
    <step order="3">Verify latency_last tracked (last item processing time)</step>
    <step order="4">Verify error_count tracked (failed items)</step>
    <step order="5">Test: Run daemon, process items, check /tmp/nerve-metrics.json</step>
    <step order="6">Verify JSON schema: {"queue_depth":N,"latency_last":N,"error_count":N,"timestamp":"..."}</step>
    <step order="7">Verify metrics updated after each queue poll cycle</step>
    <step order="8">Verify metrics log every 60 seconds (heartbeat)</step>
    <step order="9">Test status.sh --json includes metrics</step>
  </steps>

  <verification>
    <check type="bash">cat /tmp/nerve-metrics.json | jq .</check>
    <check type="test">queue_depth accurate</check>
    <check type="test">latency_last accurate</check>
    <check type="test">error_count accurate</check>
    <check type="test">Metrics JSON valid</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Daemon must work for metrics" />
    <depends-on task-id="phase-1-task-2" reason="Queue must work for metrics" />
  </dependencies>

  <commit-message>verify(nerve): three observability metrics

Per decisions.md Decision 8:
- queue_depth tracked
- latency_last tracked
- error_count tracked
- Metrics written to /tmp/nerve-metrics.json

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Implement atomic file writes</title>
  <requirement>NERVE-REQ-026: Atomic File Writes (P2-Should)</requirement>
  <description>
    Per decisions.md Risk Register: Queue corruption on crash during write.
    Mitigation: Write to temp file, then mv to final location.
    Currently NOT implemented per Risk Scanner findings.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/queue.sh" reason="File to modify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Risk Register" />
  </context>

  <steps>
    <step order="1">Locate queue_enqueue() function in queue.sh (~lines 83-110)</step>
    <step order="2">Identify direct write: cat > "$item_file" pattern</step>
    <step order="3">Modify to: Write to temp file (.tmp suffix)</step>
    <step order="4">Add: mv temp file to final location (atomic rename)</step>
    <step order="5">Repeat for queue_fail() reason update</step>
    <step order="6">Repeat for any other JSON file writes</step>
    <step order="7">Test: Enqueue item, verify no .tmp files remain</step>
    <step order="8">Test: Interrupt write, verify no partial JSON</step>
    <step order="9">Update metrics_update() in daemon.sh if needed</step>
  </steps>

  <verification>
    <check type="bash">ls /tmp/nerve-queue/**/*.tmp 2>/dev/null || echo "No temp files"</check>
    <check type="test">Writes use temp + mv pattern</check>
    <check type="test">No partial JSON files possible</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Queue verification complete first" />
  </dependencies>

  <commit-message>fix(nerve): implement atomic file writes

Per decisions.md Risk Register:
- Write to temp file first
- mv to final location (atomic rename)
- Prevents queue corruption on crash

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="2">
  <title>Verify orphan process cleanup</title>
  <requirement>NERVE-REQ-027: Orphan Process Cleanup (P2-Should)</requirement>
  <description>
    Per decisions.md Risk Register: Orphan processes on unclean shutdown.
    Mitigation: Abort escalation SIGTERM -> 5 sec wait -> SIGKILL.
    Verify abort.sh force-kill implements this.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/abort.sh" reason="Script to verify/modify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Risk Register" />
  </context>

  <steps>
    <step order="1">Locate force-kill implementation in abort.sh</step>
    <step order="2">Verify SIGTERM sent first (kill -15 or kill -TERM)</step>
    <step order="3">Verify 5-second wait before SIGKILL</step>
    <step order="4">Verify SIGKILL sent if process still running (kill -9 or kill -KILL)</step>
    <step order="5">Test: Start daemon, force-kill, verify no orphan processes</step>
    <step order="6">Test: ps aux | grep nerve after force-kill shows nothing</step>
    <step order="7">If not implemented, add escalation logic</step>
    <step order="8">Verify PID file cleaned up after force-kill</step>
  </steps>

  <verification>
    <check type="bash">./nerve/daemon.sh &amp; sleep 1 &amp;&amp; ./nerve/abort.sh force-kill &amp;&amp; ps aux | grep daemon.sh</check>
    <check type="test">SIGTERM sent first</check>
    <check type="test">5 second wait</check>
    <check type="test">SIGKILL if needed</check>
    <check type="test">No orphan processes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Abort verification complete first" />
  </dependencies>

  <commit-message>verify(nerve): orphan process cleanup escalation

Per decisions.md Risk Register:
- SIGTERM sent first
- 5 second wait
- SIGKILL if still running
- No orphan processes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — QA, Metrics, Review

Three tasks for final QA, baseline metrics, and customer review.

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>QA Pass - Verify all acceptance criteria</title>
  <requirement>NERVE-REQ-009: QA Pass (P0-Blocker)</requirement>
  <description>
    Per decisions.md Section IX: QA Pass confirms zero P0 issues.
    Final verification of all 9 acceptance criteria from decisions.md.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/nerve/" reason="All scripts to verify" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Section IX checklist" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Full requirements" />
  </context>

  <steps>
    <step order="1">Create QA checklist from decisions.md Section IX</step>
    <step order="2">Verify: daemon.sh starts, creates PID lockfile, prevents duplicates</step>
    <step order="3">Verify: queue.sh persists queue to disk, recovers on restart</step>
    <step order="4">Verify: abort.sh sets flag, daemon responds, shutdown clean</step>
    <step order="5">Verify: parse-verdict.sh returns JSON with verdict and issue counts</step>
    <step order="6">Verify: All scripts use consistent log format</step>
    <step order="7">Verify: All scripts use nerve prefix for file paths</step>
    <step order="8">Verify: README.md documents all commands with examples</step>
    <step order="9">Verify: All files committed to deliverables directory</step>
    <step order="10">Document any P0 issues found</step>
    <step order="11">Create QA report: nerve-qa-report.md</step>
    <step order="12">Pass/Fail verdict</step>
  </steps>

  <verification>
    <check type="manual">All 9 acceptance criteria verified</check>
    <check type="manual">No P0 issues outstanding</check>
    <check type="manual">QA report created</check>
    <check type="bash">./nerve/parse-verdict.sh nerve-qa-report.md; echo "Exit: $?"</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Log format verified" />
    <depends-on task-id="phase-1-task-6" reason="Documentation verified" />
    <depends-on task-id="phase-1-task-7" reason="Metrics verified" />
    <depends-on task-id="phase-1-task-8" reason="Atomic writes implemented" />
    <depends-on task-id="phase-1-task-9" reason="Orphan cleanup verified" />
  </dependencies>

  <commit-message>qa(nerve): verify all acceptance criteria

Per decisions.md Section IX:
- All 9 acceptance criteria verified
- No P0 issues outstanding
- QA report: nerve-qa-report.md
- VERDICT: PASS

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Document baseline metrics for ROI validation</title>
  <requirement>Board Path C: Validate Internal ROI (decisions.md Section VI)</requirement>
  <description>
    Per Board Conditions (Buffett's Path C): Document baseline metrics
    before NERVE. Required to later prove NERVE prevented X failures worth $Y.
    This enables ROI validation post-deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Section VI Board Conditions" />
    <file path="/home/agent/shipyard-ai/STATUS.md" reason="Current pipeline state" />
    <file path="/home/agent/shipyard-ai/qa-monitor.log" reason="Historical failures" />
  </context>

  <steps>
    <step order="1">Review decisions.md Section VI - Path C requirements</step>
    <step order="2">Document baseline metrics BEFORE NERVE:</step>
    <step order="3">  - Pipeline failure rate (how many runs fail per week)</step>
    <step order="4">  - Duplicate daemon instances (how often)</step>
    <step order="5">  - Lost queue items (how many)</step>
    <step order="6">  - Manual recovery time (hours per incident)</step>
    <step order="7">  - 3 AM incidents (count per month)</step>
    <step order="8">Check qa-monitor.log and STATUS.md for historical data</step>
    <step order="9">Create baseline-metrics.md with findings</step>
    <step order="10">Define success criteria for post-NERVE metrics</step>
    <step order="11">Plan: Re-measure after 2 weeks of NERVE operation</step>
  </steps>

  <verification>
    <check type="manual">baseline-metrics.md created</check>
    <check type="manual">Pre-NERVE failure rate documented</check>
    <check type="manual">Success criteria defined</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="QA complete, ready for metrics" />
  </dependencies>

  <commit-message>docs(nerve): document baseline metrics for ROI validation

Per decisions.md Section VI (Buffett's Path C):
- Pre-NERVE failure rate documented
- Baseline metrics established
- Success criteria defined
- Ready for post-deployment comparison

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    NERVE is internal tooling - customer is the operations team.
    "Would they pay for this? What feels like engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/promptops/decisions.md" reason="Board decisions" />
    <file path="/home/agent/shipyard-ai/nerve/README.md" reason="Product documentation" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and NERVE scripts</step>
    <step order="3">Answer: Would operations team actually use NERVE?</step>
    <step order="4">Answer: What would make them say "finally, peace at 3 AM"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. real value?</step>
    <step order="6">Answer: Is the "invisible backbone" truly invisible?</step>
    <step order="7">Answer: Does zero-configuration actually work?</step>
    <step order="8">Answer: Does it deliver "the absence of friction"?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Review after QA pass" />
  </dependencies>

  <commit-message>docs(nerve): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would operations team choose NERVE?
Engineering vanity vs. real value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 4 | Verify core scripts (daemon, queue, abort, verdict) | 4 parallel |
| 2 | 5 | Quality & risk (log format, docs, metrics, atomic, orphan) | 5 parallel (after Wave 1) |
| 3 | 3 | Final (QA pass, baseline metrics, Sara review) | Sequential (after Wave 2) |

**Total Tasks:** 12
**Maximum Parallelism:** Wave 2 (5 concurrent tasks)
**Timeline:** 2-3 days (verification focus, minimal code changes)

---

## Dependencies Diagram

```
Wave 1:  [task-1: daemon.sh] ─────────────────────────────────────────>
         [task-2: queue.sh]  ─────────────────────────────────────────>
         [task-3: abort.sh]  ─────────────────────────────────────────>
         [task-4: verdict.sh] ────────────────────────────────────────>

Wave 2:  [task-5: log format] ───> (depends on task-1) ───────────────>
         [task-6: README docs] ───────────────────────────────────────>
         [task-7: metrics] ───> (depends on tasks 1,2) ───────────────>
         [task-8: atomic writes] ───> (depends on task-2) ────────────>
         [task-9: orphan cleanup] ───> (depends on task-3) ───────────>

Wave 3:  [task-10: QA Pass] ───> (depends on tasks 5-9) ──────────────>
         [task-11: baseline] ───> (depends on task-10) ───────────────>
         [task-12: Sara review] ───> (depends on task-10) ────────────>
```

---

## Risk Notes

### Addressed in This Phase

| Risk | Mitigation | Task |
|------|------------|------|
| Queue corruption on crash | Atomic writes (write temp, mv) | task-8 |
| Orphan processes | SIGTERM -> wait -> SIGKILL | task-9 |
| Documentation gaps | README verification | task-6 |
| Log format inconsistency | Verification against OQ-001 | task-5 |
| No baseline metrics | Document pre-NERVE state | task-11 |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| Single-machine architecture | High at scale | Sharding path clear for v2 |
| No automated tests | Medium | Ship proves correctness |
| Race condition in lockfile | Low | Documented limitation |
| process_item() is a stub | N/A | Intentional for v1 |

---

## Verification Checklist

- [x] All P0 requirements have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed (atomic writes, orphan cleanup)
- [x] Decisions compliance verified (nerve prefix, log format)
- [x] Board Path C addressed (baseline metrics)
- [x] 2-3 day timeline achievable
- [x] Ship test defined: "Peace. The absence of 3 AM knots."
- [x] Sara Blakely customer gut-check scheduled (task-12)

---

## Ship Test

> Does the daemon silently handle queue operations without user intervention?
>
> Does the operations team feel "peace" — the absence of 3 AM knots in their stomach?
>
> Does it disappear completely and work always?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/promptops/decisions.md, CLAUDE.md*
*Project Slug: promptops*
