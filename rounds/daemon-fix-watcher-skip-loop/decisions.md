# Decisions — daemon-fix-watcher-skip-loop

*Locked by Phil Jackson. Blueprint for build phase.*

---

## Locked Decisions

### 1. Name stays. No rebrand in v1.
- **Proposed by:** Steve ("Pulse")
- **Opposed by:** Elon
- **Winner:** Elon
- **Why:** Operational drag during a P0 patch is unacceptable. Runbooks, scripts, and muscle memory break for zero user-facing value. Rebrand is a v2 conversation. Steve concedes the tactical patch ships today; the poetry waits.

### 2. Filesystem queue + mtime check ships in v1.
- **Proposed by:** Steve (the "covenant")
- **Opposed by:** Elon (SQLite single-table is the real fix)
- **Winner:** Steve on scope, Elon on record.
- **Why:** A strategic SQLite rewrite is v2. The team agreed: ship the band-aid now, but document the architectural debt on merge so the next engineer knows the real target. The mtime check is accepted as a tactical patch — not an atomic, idempotent, or race-safe solution.

### 3. Silent rejection is banned.
- **Proposed by:** Steve
- **Opposed by:** None (unanimous)
- **Winner:** Unanimous
- **Why:** Elon calls it a "sin"; Steve calls it a betrayal of the brand. If the watcher skips a file, it must scream the reason in the log. Every time. No quiet burial via `isAlreadyProcessed` or any other gate.

### 4. Failed PRDs get a dead-letter path with timestamped reason — and a path back.
- **Proposed by:** Elon (dead-letter with boundaries)
- **Refined by:** Steve (failure is a waypoint, not graveyard)
- **Winner:** Consensus
- **Why:** Every dropped or failed PRD lands in a dead-letter directory with a timestamped reason. No infinite retries, no euphemisms. Elon concedes Steve is correct: once the root cause is fixed, the PRD must have a clean path back to intake. Recovery is state-machine hygiene, not optimism.

### 5. No module surface-area changes for test coverage.
- **Proposed by:** Elon
- **Opposed by:** None
- **Winner:** Elon
- **Why:** If you need to change exports to test 30 lines of pure logic, you're testing wrong. Use a temp directory and mock the constants. Changing the module surface area to chase coverage is v2 masquerading as v1.

### 6. Manual smoke test (AC #5) is cut.
- **Proposed by:** Elon
- **Opposed by:** None
- **Winner:** Elon
- **Why:** Restarting a service and eyeballing a log file is operational toil, not acceptance criteria. Automate it properly or delete it. It does not block the v1 merge.

### 7. Retro as a deliverable is cut.
- **Proposed by:** Elon
- **Opposed by:** None
- **Winner:** Elon
- **Why:** Post-mortems are conversations, not file-system deliverables. If you need a markdown file to remember a 2-day outage, your observability is broken.

### 8. Onboarding friction is fixed — with shell scripts and clear logs, not brand voice.
- **Proposed by:** Steve (first 30 seconds must feel like magic)
- **Opposed by:** Elon (brand guidelines are dangerous during outages)
- **Winner:** Steve's priority, Elon's implementation.
- **Why:** The first 30 seconds decide whether engineers actually run the daemon. Elon concedes the friction must drop. The fix is a shell script and clean, grep-friendly logs — not a brand-voice overhaul or renaming.

### 9. Log output: clean, grep-friendly, no passive voice where it obscures failure.
- **Proposed by:** Steve (speak in verbs)
- **Opposed by:** Elon (can paper over failure states)
- **Winner:** Draw, Elon's safety override.
- **Why:** The CLI output should be legible and the log format grep-friendly. But if a failure is final, the log must say "failed" plainly. Confidence is good; denial dressed as optimism is not.

---

## MVP Feature Set (What Ships in v1)

1. **Watcher skip-loop fix** — patched `daemon.ts` watcher handler.
2. **mtime guard** — tactical patch to prevent re-processing recent files. Documented as debt.
3. **Explicit skip logging** — every skipped file logs a human-readable reason. No silent drops.
4. **Dead-letter directory** — `prds/failed/` (or equivalent) with timestamped reason for every failure.
5. **Recovery path** — mechanism to move a dead-letter PRD back to intake once the root cause is resolved.
6. **Onboarding script** — shell script that gets the daemon running with one command and verifies it.
7. **Clean log formatting** — grep-friendly, no passive-obfuscation of real errors.
8. **Vitest coverage** — tests run against a temp directory with mocked constants, zero export changes.
9. **No rename, no SQLite, no brand-voice manifesto, no retro file, no manual smoke test.**

---

## File Structure (What Gets Built)

```
shipyard-ai/
├── src/
│   └── daemon.ts                    # patched watcher handler, mtime guard, explicit logs
│   └── health.ts                    # unchanged or aligned with new dead-letter path
├── tests/
│   └── daemon.watcher.skip.test.ts  # vitest, temp dir, mocked constants
├── scripts/
│   └── onboard.sh                   # one-command setup + verify
├── prds/
│   ├── ...                          # intake directory
│   └── failed/                      # dead-letter with timestamped reasons
└── decisions.md                     # this document
```

*No SQLite schema file. No `pulse.ts`. No retro markdown. No surface-area refactor.*

---

## Open Questions (Needs Resolution Before Merge)

1. **Dead-letter path format** — `prds/failed/PRD-123-20250502T160422Z.reason.txt`? Keep `.md` with YAML frontmatter? Single file or sidecar?
2. **Smoke test automation** — If AC #5 is deleted, do we replace it with a CI health ping, or is the onboarding script sufficient?
3. **Retry ceiling** — How many intake attempts before dead-letter? 1? 3? Configurable?
4. **Recovery UX** — Manual `mv` back to intake, or a `scripts/retry.sh` helper?
5. **v2 migration trigger** — What metric trips the SQLite rewrite? 500 PRDs/day? 3rd filesystem race? Document the threshold in code comments.
6. **Onboarding script scope** — Does it install deps, create directories, or just validate and start?

---

## Risk Register

| Risk | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|
| **mtime precision collapse** | High | High at scale | Build agent | Documented debt on merge; 1-second `<=` tie-risk becomes certainty under load. |
| **statSync event-loop block** | Medium | Low today, High at 100× | Build agent | Accept for v1; daemon is low-frequency today. Monitor intake latency. |
| **Filesystem watcher degradation** | High | Medium at scale | Build agent | Chokidar degrades linearly with directory size. v2 SQLite rewrite is the fix. |
| **Concurrency race (intake + watcher)** | High | Medium | Build agent | No multi-instance support in v1. Document single-node constraint. |
| **Band-aid becomes permanent** | High | Medium | Phil / Reviewer | Debt comment must include exact trigger threshold for v2 rewrite. No exceptions. |
| **Naming conflict (Pulse vs daemon)** | Low | Low | Steve / v2 | If v2 is delayed, muscle memory hardens and rename cost rises. Schedule v2 decision within 30 days. |
| **Dead-letter spam** | Medium | Low | Build agent | Without retry ceiling, a bad PRD could loop forever. Set hard ceiling in v1. |
| **Onboarding script rot** | Low | Medium | Build agent | Script must be tested in CI same as code, or it becomes a lying promise. |

---

*Build phase starts on green light from the user. No scope drift without a new round.*
