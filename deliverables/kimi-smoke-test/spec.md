# Spec — Pulse (Kimi Smoke Test)

## 1. Goals

From the PRD (`prds/kimi-smoke-test.md`):

1. **Smoke-test the pipeline end-to-end** — Confirm that Kimi K2.6 (via Ollama Cloud) can drive the Shipyard AI build pipeline from PRD through to deploy artifact.
2. **Validate the model swap** — Prove that swapping the inference model produces a working, verifiable output.
3. **Generate a heartbeat artifact** — Create a single plain-text file that acts as evidence the model executed and the pipeline completed.

**PRD discrepancy resolved:** The PRD asks for `hello-kimi.txt` containing "Kimi K2.6 drove this." The locked debate decision (`decisions.md`) overrides this with the crafted sentence **"Kimi drove this."** written to `pulse.txt`. The locked decision wins.

## 2. Implementation Approach

### 2.1 Philosophy (from `decisions.md`)

> "This is not a product. It is a heartbeat. A single beat that says 'I'm here.'"

- **One shell command.** No modules. No imports. No entry points.
- **Zero configuration.** No env vars, no flags, no `.yaml` consumed at runtime.
- **One crafted sentence.** Evidence of taste, not a log line.
- **Exit-code interface only.** Green means go; red means wake someone up.

### 2.2 Wave 1 — Core Artifact

Create `/home/agent/shipyard-ai/rounds/kimi-smoke-test/run.sh`:

- Shebang: `#!/usr/bin/env bash`
- Single command that writes the exact text `Kimi drove this.` to `pulse.txt` in the same directory.
- Overwrite (not append) on each run to prevent disk fill.
- Exit 0 on success.

### 2.3 Wave 2 — Pipeline Integration

Create `/home/agent/shipyard-ai/.github/workflows/kimi-smoke-test.yml`:

- Trigger: `push` to `main` and `workflow_dispatch`.
- Single job `pulse` on `ubuntu-latest`.
- Checkout with `actions/checkout@v4`.
- Run step that executes `rounds/kimi-smoke-test/run.sh`.
  - **Must not** set `continue-on-error: true`.
- Verification step that asserts `pulse.txt` exists and prints its contents to the build log.
- Target wall-clock time: < 5 seconds end-to-end.

## 3. Verification Criteria

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | `run.sh` exists and is executable | `test -x rounds/kimi-smoke-test/run.sh` |
| 2 | `run.sh` exits 0 on success | `cd rounds/kimi-smoke-test && ./run.sh; test $? -eq 0` |
| 3 | `pulse.txt` is created | `test -f rounds/kimi-smoke-test/pulse.txt` |
| 4 | `pulse.txt` contains exact locked sentence | `grep -Fxq 'Kimi drove this.' rounds/kimi-smoke-test/pulse.txt` |
| 5 | `pulse.txt` has no trailing newlines or extra whitespace | `wc -c` matches byte count of sentence + 1 (for newline) or exact byte count if no trailing newline; manual `od -c` inspection |
| 6 | Overwrite semantics — second run does not duplicate or append | Run twice; `cat pulse.txt | wc -l` == 1; content remains exact |
| 7 | `run.sh` has zero external dependencies | Visual inspection / `grep` confirms no `source`, `import`, `require`, `curl`, `npm`, `node`, or env-var reads |
| 8 | CI workflow invokes `run.sh` | `grep -q 'run.sh' .github/workflows/kimi-smoke-test.yml` |
| 9 | CI workflow does not mask exit codes | `grep` confirms absence of `continue-on-error: true` in the run step |
| 10 | CI workflow prints `pulse.txt` contents | `grep -q 'pulse.txt' .github/workflows/kimi-smoke-test.yml` |
| 11 | End-to-end execution < 5 seconds | `time ./run.sh` or CI timer; wall-clock must be under 5s |
| 12 | Build produces no more than one meaningful file | Directory listing of `rounds/kimi-smoke-test/` contains only `run.sh`, `decisions.md`, and generated `pulse.txt` |

## 4. Files to Create or Modify

### 4.1 Created (implementation)

| File | Purpose |
|------|---------|
| `rounds/kimi-smoke-test/run.sh` | The single shell command heartbeat. Executable. Writes `pulse.txt`. |
| `.github/workflows/kimi-smoke-test.yml` | GitHub Actions workflow that invokes `run.sh` and validates the exit code. |

### 4.2 Generated (runtime artifact — not committed)

| File | Purpose |
|------|---------|
| `rounds/kimi-smoke-test/pulse.txt` | Output of `run.sh`. Contains exactly `Kimi drove this.`. |

### 4.3 Modified (existing)

| File | Change |
|------|--------|
| `.github/workflows/` | New file added; no existing workflow modified. |

### 4.4 Created (deliverables / planning)

| File | Purpose |
|------|---------|
| `deliverables/kimi-smoke-test/spec.md` | This document. |
| `deliverables/kimi-smoke-test/todo.md` | Running task list with atomic steps. |
| `deliverables/kimi-smoke-test/tests/test-exit-code.sh` | Verifies `run.sh` exists, runs, and exits 0. |
| `deliverables/kimi-smoke-test/tests/test-content.sh` | Verifies `pulse.txt` content is exact. |
| `deliverables/kimi-smoke-test/tests/test-overwrite.sh` | Verifies idempotent overwrite behavior. |
| `deliverables/kimi-smoke-test/tests/test-ci.sh` | Verifies CI workflow structure and semantics. |
| `deliverables/kimi-smoke-test/tests/test-no-creep.sh` | Banned-pattern scan (no imports, modules, config files). |

---

*Locked sentence: "Kimi drove this."*
