# Requirements Traceability Matrix
# Kimi Smoke Test → "Pulse"

**Generated**: 2026-04-21
**Source Documents**:
- `/home/agent/shipyard-ai/rounds/kimi-smoke-test/decisions.md`
- `/home/agent/shipyard-ai/prds/kimi-smoke-test.md`

**Project Status**: Locked decisions — ready for implementation
**Total Requirements**: 6
**Estimated Build Time**: < 15 minutes (locked decision from Elon/Steve consensus)

---

## Requirements Summary by Category

| Category | Count | Description |
|----------|-------|-------------|
| Core Artifact | 3 | Shell script, output file, sentence content |
| Pipeline Integration | 2 | CI step invocation, exit code verification |
| Performance | 1 | 5-second wall-clock constraint |

---

## CORE ARTIFACT REQUIREMENTS

### REQ-1: Shell Command (run.sh)
**Source**: decisions.md MVP Feature Set #1, #2; Architecture decision (Elon wins)
**Priority**: P0 (Blocker)
**Description**: Create a single shell command at `/home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh` that writes the locked sentence to `pulse.txt` and exits.

**Acceptance Criteria**:
- [ ] File exists at `/home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh`
- [ ] Has executable permissions (`chmod +x`)
- [ ] Writes exact text `Kimi drove this.` to `pulse.txt`
- [ ] Exits with code 0 on success
- [ ] Exits with non-zero code on any failure (e.g., directory not writable)
- [ ] Zero configuration required (no env vars, no flags, no config files)

**Technical Notes**:
- DECISION (LOCKED): Single shell command. Zero modules. Zero imports. Zero entry points.
- The interface is the exit code. Green means go. Red means wake someone up.
- Sentence is hardcoded; no runtime model invocation.

---

### REQ-2: Output File (pulse.txt)
**Source**: decisions.md MVP Feature Set #6, File Structure
**Priority**: P0 (Blocker)
**Description**: Generate `/home/agent/shipyard-ai/rounds/kimi-smoke-test/pulse.txt` containing only the locked sentence.

**Acceptance Criteria**:
- [ ] File created at `/home/agent/shipyard-ai/rounds/kimi-smoke-test/pulse.txt`
- [ ] Contains exactly: `Kimi drove this.`
- [ ] No metadata, no timestamps, no formatting
- [ ] Overwritten on each run (no accumulation)
- [ ] Human-readable filename (`pulse.txt` honors the product name)

**Technical Notes**:
- DECISION (LOCKED): `pulse.txt` is the output artifact, generated, not committed.
- Cleanup policy: overwrite in-place to prevent disk fill at scale.

---

### REQ-3: Locked Sentence Content
**Source**: decisions.md Section 2 (The Output Sentence)
**Priority**: P0 (Blocker)
**Description**: The output file must contain the exact locked sentence: "Kimi drove this."

**Acceptance Criteria**:
- [ ] Exact match: `Kimi drove this.`
- [ ] Ends with a period (full stop)
- [ ] No extra whitespace, newlines, or prefixes
- [ ] Plain text only

**Technical Notes**:
- DECISION (LOCKED): "Kimi drove this." Period. Full stop. Let the silence do the work.
- Steve wins on craft; sentence must be evidence of taste — clean, inevitable, alive.
- Not a log, not a tag, not robot speak.

---

## PIPELINE INTEGRATION REQUIREMENTS

### REQ-4: CI Step Invocation
**Source**: decisions.md MVP Feature Set #5; Open Questions #2
**Priority**: P1 (Required for MVP)
**Description**: Add one CI step that invokes the shell command. The step should be part of the Shipyard pipeline verification.

**Acceptance Criteria**:
- [ ] CI workflow contains a step that runs `run.sh`
- [ ] Step runs in under 5 seconds wall-clock time
- [ ] Step is triggered appropriately (on push to main and manual dispatch)
- [ ] No additional build artifacts produced by the CI step itself

**Technical Notes**:
- OPEN QUESTION (RESOLVED): CI location — create `/home/agent/shipyard-ai/.github/workflows/kimi-smoke-test.yml` as a dedicated smoke-test workflow.
- OPEN QUESTION (RESOLVED): Agent vs shell — shell hardcodes the sentence. The model is tested by its ability to plan and write the script, not by runtime generation.

---

### REQ-5: Exit Code Verification
**Source**: decisions.md MVP Feature Set #2; Architecture decision
**Priority**: P0 (Blocker)
**Description**: The CI step must check the exit code of the shell command. 0 means success; non-zero means failure.

**Acceptance Criteria**:
- [ ] CI fails (red light) if `run.sh` exits non-zero
- [ ] CI passes (green) if `run.sh` exits 0
- [ ] No additional interface (no parsing of stdout, no artifact inspection beyond basic existence)

**Technical Notes**:
- DECISION (LOCKED): The interface is the exit code. Green means go. Red means wake someone up.
- Failure semantics: CI red light (pager stops if this fails; trust breaks).

---

## PERFORMANCE REQUIREMENTS

### REQ-6: Wall-Clock Time Under 5 Seconds
**Source**: decisions.md Section 7 (Performance & Success Metrics)
**Priority**: P1 (Required for MVP)
**Description**: End-to-end execution from CI trigger to file appearance must complete in under 5 seconds.

**Acceptance Criteria**:
- [ ] `run.sh` execution completes in < 1 second
- [ ] CI step allocation + execution completes in < 5 seconds total
- [ ] Measured via GitHub Actions logs or local `time` command

**Technical Notes**:
- DECISION (LOCKED): Elon is right that the real bottleneck is inference latency and pipeline orchestration, not disk I/O. Wall-clock time must be measured and must be under 5 seconds end-to-end.
- Steve is right that the metric isn't everything — Seth must feel the exhale. The success criterion is binary: file appears + Seth trusts the system again.

---

## Open Questions Resolution

| Question | Resolution | Rationale |
|----------|------------|-----------|
| Output filename location | `/rounds/kimi-smoke-test/pulse.txt` | Honors the name; lives alongside the blueprint |
| CI location | `.github/workflows/kimi-smoke-test.yml` | Dedicated workflow keeps it visible and independent |
| Failure semantics | CI red light | Elon says pager stops; Steve says trust breaks. CI red satisfies both. |
| Agent vs shell | Hardcoded in shell | Model is validated by planning/execution, not runtime generation. Keeps zero-config constraint. |
| Cleanup policy | Overwrite in-place | Prevents disk fill at scale; simplest implementation |

---

## Non-Negotiables

1. **One shell command.** No modules. No imports. No entry points.
2. **Zero process overhead.** No meetings, no design reviews, no stakeholder syncs for this artifact.
3. **One crafted sentence.** Not a log. Not a tag. Evidence of taste.
4. **Zero configuration.** No `.yaml` inside the artifact, no env vars, no flags for `run.sh`.
5. **This blueprint is the only document.** If you need another page, you have already lost the plot.

---

## Success Criteria (V1 Launch)

- [ ] `run.sh` exists, is executable, and exits 0
- [ ] `pulse.txt` appears with exact text "Kimi drove this."
- [ ] CI step invokes `run.sh` and passes on green
- [ ] End-to-end execution completes in < 5 seconds
- [ ] Seth trusts the system again
