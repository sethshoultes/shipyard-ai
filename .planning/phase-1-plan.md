# Phase 1 Plan — Pulse (Kimi Smoke Test)

**Generated**: 2026-04-21
**Requirements**: `/home/agent/shipyard-ai/rounds/kimi-smoke-test/decisions.md`, `/home/agent/shipyard-ai/prds/kimi-smoke-test.md`
**Total Tasks**: 2
**Waves**: 2
**Estimated Duration**: < 15 minutes

---

## Documentation Review

Per **CLAUDE.md** (Project Instructions for all agents):
> "Before building, modifying, or debugging any Emdash site, theme, or plugin, agents MUST read docs/EMDASH-GUIDE.md first."

This project explicitly rejects the Emdash stack per locked decisions:
- **Architecture** (Elon wins): "Single shell command. Zero modules. Zero imports. Zero entry points."
- **MVP Feature Set**: "One shell command that writes one sentence to one text file and exits."
- **Build constraint**: "If the build produces more than one meaningful file plus this blueprint, it has already failed."

Therefore, **EMDASH-GUIDE.md is intentionally not cited** — the locked architecture forbids any framework or external API usage. The only interfaces are the filesystem and the shell exit code.

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-1: Shell Command (run.sh) | phase-1-task-1 | 1 | P0 |
| REQ-2: Output File (pulse.txt) | phase-1-task-1 | 1 | P0 |
| REQ-3: Locked Sentence Content | phase-1-task-1 | 1 | P0 |
| REQ-4: CI Step Invocation | phase-1-task-2 | 2 | P1 |
| REQ-5: Exit Code Verification | phase-1-task-2 | 2 | P0 |
| REQ-6: Wall-Clock Time < 5s | phase-1-task-2 | 2 | P1 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Core Artifact
Duration: < 5 minutes | Dependencies: None

**Tasks**: 1
- phase-1-task-1: Create run.sh shell script that writes "Kimi drove this." to pulse.txt

### Wave 2 (Parallel, after Wave 1) — Pipeline Integration
Duration: < 10 minutes | Dependencies: run.sh exists (Wave 1)

**Tasks**: 1
- phase-1-task-2: Add GitHub Actions workflow to invoke run.sh and verify exit code

---

## Task Plans

<task-plan id="phase-1-task-1" wave="1">
  <title>Create Pulse Shell Script (run.sh)</title>
  <requirement>REQ-1, REQ-2, REQ-3</requirement>
  <description>
    Create the single shell command that generates the Pulse heartbeat artifact. This is the only meaningful build file for the project. It must be zero-configuration, executable, and produce exactly the locked sentence in pulse.txt with a zero exit code on success.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/kimi-smoke-test/decisions.md" reason="Locked decisions: sentence content, file structure, zero-config constraint" />
    <file path="/home/agent/shipyard-ai/prds/kimi-smoke-test.md" reason="Original PRD specifying smoke test intent and model verification goal" />
  </context>

  <steps>
    <step order="1">Ensure the directory `/home/agent/shipyard-ai/rounds/kimi-smoke-test/` exists</step>
    <step order="2">Create `/home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh` with a shebang (`#!/usr/bin/env bash`) and a single command that writes the exact text `Kimi drove this.` to `pulse.txt` in the same directory</step>
    <step order="3">Set executable permissions: `chmod +x /home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh`</step>
    <step order="4">Execute `./run.sh` and verify exit code is 0</step>
    <step order="5">Verify `pulse.txt` exists in the same directory and contains exactly `Kimi drove this.`</step>
    <step order="6">Run a second time to verify overwrite behavior (file should still contain exact text, no duplication or append)</step>
  </steps>

  <verification>
    <check type="test">cd /home/agent/shipyard-ai/rounds/kimi-smoke-test && ./run.sh && test $? -eq 0</check>
    <check type="test">grep -Fxq 'Kimi drove this.' /home/agent/shipyard-ai/rounds/kimi-smoke-test/pulse.txt</check>
    <check type="manual">Confirm file contains no trailing newlines or extra whitespace beyond the exact sentence</check>
    <check type="manual">Confirm run.sh has no external dependencies, env vars, or flags</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>feat(pulse): add run.sh heartbeat command

Create the single shell command for the Kimi smoke test:
- Writes 'Kimi drove this.' to pulse.txt
- Zero configuration, zero imports, zero modules
- Exit code 0 on success, non-zero on failure
- Overwrites pulse.txt on each run to prevent disk fill

Refs: REQ-1, REQ-2, REQ-3
  </commit-message>
</task-plan>

<task-plan id="phase-1-task-2" wave="2">
  <title>Add CI Workflow for Smoke Test Invocation</title>
  <requirement>REQ-4, REQ-5, REQ-6</requirement>
  <description>
    Add a GitHub Actions workflow that invokes run.sh and validates the exit code. This provides the pipeline integration that makes the smoke test automatic and trust-worthy. The workflow must run in under 5 seconds and fail visibly if the heartbeat does not complete.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh" reason="The command to invoke" />
    <file path="/home/agent/shipyard-ai/.github/workflows/auto-pipeline.yml" reason="Existing workflow patterns in the repo (checkout, run, verify)" />
    <file path="/home/agent/shipyard-ai/rounds/kimi-smoke-test/decisions.md" reason="CI location and failure semantics open questions resolved here" />
  </context>

  <steps>
    <step order="1">Create `/home/agent/shipyard-ai/.github/workflows/kimi-smoke-test.yml`</step>
    <step order="2">Define workflow trigger: `push` to `main` and `workflow_dispatch`</step>
    <step order="3">Add a single job `pulse` running on `ubuntu-latest`</step>
    <step order="4">Add checkout step using `actions/checkout@v4`</step>
    <step order="5">Add step that runs `rounds/kimi-smoke-test/run.sh` and relies on default GitHub Actions exit-code checking (no `continue-on-error: true`)</step>
    <step order="6">Add step that verifies `pulse.txt` exists and prints its contents to the log for visibility</step>
    <step order="7">Validate YAML syntax via visual inspection or `yamllint` if available</step>
  </steps>

  <verification>
    <check type="build">cat /home/agent/shipyard-ai/.github/workflows/kimi-smoke-test.yml | grep -q 'run.sh'</check>
    <check type="manual">Review workflow file to confirm it invokes run.sh and does not mask exit codes</check>
    <check type="manual">Verify workflow trigger is appropriate and job name is 'pulse'</check>
    <check type="manual">Confirm no `continue-on-error: true` is set on the run.sh step</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="CI workflow calls run.sh; script must exist first" />
  </dependencies>

  <commit-message>ci(pulse): add smoke-test workflow

Add GitHub Actions workflow that invokes the Pulse heartbeat:
- Triggers on push to main and manual dispatch
- Runs run.sh and verifies exit code
- Prints pulse.txt contents to build log
- Completes in under 5 seconds

Refs: REQ-4, REQ-5, REQ-6
  </commit-message>
</task-plan>

---

## Risk Notes

**RISK-1: Over-engineering**
- Severity: High (per decisions.md Risk Register)
- Flagged By: Elon
- Mitigation: Hard constraint — any PR adding a module, import, or config file gets rejected automatically. The plan enforces this by limiting tasks to a single shell script and CI step.
- Affected Task: phase-1-task-1

**RISK-2: Style-guide creep**
- Severity: Medium
- Flagged By: Elon
- Mitigation: No voice documentation. No comma review. The sentence ships once. The plan hardcodes it.
- Affected Task: phase-1-task-1

**RISK-3: Cultural rot (degraded output)**
- Severity: Low
- Flagged By: Steve
- Mitigation: The blueprint defends the standard. The plan references the locked sentence explicitly.
- Affected Task: phase-1-task-1

**RISK-4: Inference latency masks failure**
- Severity: High
- Flagged By: Elon
- Mitigation: The script itself executes in < 1 second. The 5-second budget is for CI overhead. No model invocation at runtime.
- Affected Task: phase-1-task-2

**RISK-5: Disk fill at scale**
- Severity: Low
- Flagged By: Elon
- Mitigation: run.sh overwrites pulse.txt in place. No timestamped variants. No append behavior.
- Affected Task: phase-1-task-1

---

## Success Criteria (V1 Launch)

From decisions.md and PRD:

- [ ] `run.sh` exists, is executable, and exits 0
- [ ] `pulse.txt` appears with exact text "Kimi drove this."
- [ ] CI step invokes `run.sh` and passes on green
- [ ] End-to-end execution completes in < 5 seconds
- [ ] Seth trusts the system again

---

**Total Build Time**: < 15 minutes (locked decision)
**Plan Status**: Ready for execution
**Next Step**: Begin Wave 1 implementation
