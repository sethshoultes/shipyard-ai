# Decisions — daemon-fix-watcher-skip-loop

*Locked by Phil Jackson. Blueprint for build phase. No scope drift without a new round.*

---

## Locked Decisions

### 1. Name stays. No rebrand in v1.
- **Proposed by:** Steve (rebrand to **"Forge"**)
- **Opposed by:** Elon
- **Winner:** Elon / Essence
- **Why:** The essence decrees: *"No rename until v2 ships."* Steve christened the daemon "Forge" in Round 1, but Elon correctly identified this as luxury during triage: *"You do not name a tourniquet. You apply it."* Operational drag during a P0 patch breaks runbooks, scripts, and muscle memory for zero user-facing value. Steve conceded the tactical patch ships today; the poetry waits for v2. The team will revisit naming within 30 days of v1 ship.

### 2. Filesystem queue + mtime check ships in v1.
- **Proposed by:** Steve (ship the tourniquet now; stop the bleeding)
- **Opposed by:** Elon (SQLite single-table is the real fix; ship architecture, not band-aids)
- **Winner:** Steve on scope, Elon on record.
- **Why:** A strategic SQLite rewrite is v2. The essence commands: *"Tourniquet today. Spine tomorrow."* Both agree to ship the band-aid to stop the bleeding, but the team must document the architectural debt on merge so the next engineer knows the real target. The mtime check is accepted as a tactical patch — not an atomic, idempotent, or race-safe solution. Elon proved the `<=` tie-risk becomes guaranteed data loss under ext4 one-second precision at scale; Steve conceded the filesystem queue must die, but not today.

### 3. SQLite rewrite ticket must exist before merge.
- **Proposed by:** Elon (Round 2 non-negotiable #1)
- **Opposed by:** None
- **Winner:** Unanimous
- **Why:** A `TODO` comment is not enough. Steve agreed: *"File the SQLite rewrite ticket before this merges, or I will personally hold the pen."* If the strategic fix does not have a tracked ticket before the tactical patch merges, the band-aid becomes permanent by default. "Documented debt" means a ticket in the backlog with a trigger threshold, not a comment in the source code. Tomorrow must be real, not rhetorical.

### 4. Silent rejection is banned.
- **Proposed by:** Steve ("NO silent failures")
- **Opposed by:** None (unanimous)
- **Winner:** Unanimous
- **Why:** Elon calls it evil; Steve calls it a betrayal of the brand. The two-day detection window was caused by absence of signal, not just a missing mtime check. The essence demands: *"Zero silent drops. Every skip screams."* If the watcher skips a file, it must emit a structured log line with full file path and explicit cause. No quiet burial via `isAlreadyProcessed` or any other gate.

### 5. Failed PRDs get a dead-letter path with timestamped reason — and a path back.
- **Proposed by:** Elon (dead-letter with retry boundaries)
- **Refined by:** Steve ("failure is a waypoint, not graveyard")
- **Opposed by:** None
- **Winner:** Consensus
- **Why:** Every dropped or failed PRD lands in a dead-letter directory with a timestamped reason. No infinite retries, no euphemisms. Steve is correct: once the root cause is fixed, the PRD must have a clean path back to intake. Recovery is state-machine hygiene, not optimism. Elon conceded Steve's resurrection requirement.

### 6. No module surface-area changes for test coverage.
- **Proposed by:** Elon ("CUT refactor for testability via export changes")
- **Opposed by:** Steve (defended in Round 2: "If we cannot test the contract... then some brilliant engineer next quarter will break that contract")
- **Winner:** Elon
- **Why:** The synthesis: tests must exist, but the module surface stays untouched. If you need to change exports to test 30 lines of pure logic, you are testing wrong. Use a temp directory, mock `PRDS_DIR`, monkey-patch `fs`, or use `vi.spyOn`. The vitest file runs against a temp directory with mocked constants. Steve gets verification; Elon gets zero surface drift.

### 7. Manual smoke test (AC #5) is cut as a gating deliverable.
- **Proposed by:** Elon
- **Opposed by:** Steve (partially — defends the "human moment")
- **Winner:** Elon
- **Why:** "Place a file, restart the daemon, eyeball the log" is operational toil, not acceptance criteria. Steve concedes the eyeballing is toil, but insists the first-run "human moment" of watching the system breathe is where trust is born. That moment lives in the onboarding script, not a gating AC. Automate the validation, or delete it.

### 8. Retro as a merge-gating deliverable is cut.
- **Proposed by:** Elon
- **Opposed by:** Steve ("Keep it — the markdown file is scar tissue that reminds us we broke a covenant")
- **Winner:** Elon
- **Why:** Post-mortems are conversations and rituals, not filesystem deliverables that gate a patch. If you need a markdown file to remember why you were down for 2 days, your observability is broken. Steve's accountability argument is heard: the ritual happens in person, not in a template. The team must have the conversation; it does not ship a file. The scar tissue is in the team's memory, not `memory/daemon-fix-retrospective.md`.

### 9. Log output: clean, grep-friendly, no passive voice where it obscures failure.
- **Proposed by:** Steve ("speak in verbs; Forge is human")
- **Opposed by:** Elon ("structured logs over craftsperson poetry; if a failure is final, say 'failed'")
- **Winner:** Draw — Elon's safety override on failure states.
- **Why:** The CLI output should be legible and the log format grep-friendly. Steve's brand voice is accepted for info-level lifecycle events. But if a failure is final, the log must say "failed" plainly. Confidence is good; denial dressed as optimism is not. Words are UI, even in a terminal. Engineers grep at 3 a.m.; poetry does not survive `jq`.

### 10. Internal plumbing is not user-facing product.
- **Proposed by:** Steve ("The user never sees `failed/` or `parked/` — those are our scars, not their concern")
- **Opposed by:** Elon ("If you cannot debug it at 2 a.m. with `grep` and `ls`, it is not production-ready")
- **Winner:** Steve's intent, Elon's implementation.
- **Why:** Internal directories (`prds/failed/`) exist for 2 a.m. debugging (Elon wins on operational reality), but they are not surfaced in user-facing onboarding, CLI help, or primary UX (Steve wins on product). The interface is logs and scripts; directories are the emergency escape hatch, not the storefront. Debuggability beats aesthetic purity at 2 a.m.; aesthetic purity wins everywhere else.

### 11. Retry logic gets a hard ceiling — no infinite loops, no configurable knobs in v1.
- **Proposed by:** Steve ("NO configuration knobs for retry logic")
- **Opposed by:** Elon ("no configuration knobs is operational malpractice at 10× scale")
- **Winner:** Steve for v1, Elon's override reserved for v2.
- **Why:** Simplicity in v1 means a hardcoded retry ceiling. A bad PRD must not thunder against a flaky downstream forever. The exact number is an open question (see #3 below), but it will be a constant, not a config flag. Elon conceded the boundary for v1 but reserved the right to add a circuit-breaker dial when scale demands it.

### 12. Onboarding friction is fixed — with shell scripts and clear logs, not brand voice.
- **Proposed by:** Steve (first 30 seconds must feel like magic)
- **Opposed by:** Elon (brand guidelines are dangerous during outages)
- **Winner:** Steve's priority, Elon's implementation.
- **Why:** The first 30 seconds decide whether engineers actually run the daemon. Elon conceded the friction must drop, but the fix is a shell script and clean, grep-friendly logs — not a brand-voice overhaul or renaming. Even piston rings need zero-friction onboarding.

### 13. `statSync` event-loop block is accepted as a v1 risk.
- **Proposed by:** Elon (warned as future bottleneck)
- **Opposed by:** Steve (conceded: "a millisecond of blocked loop to prevent a two-day silent death is a trade I make every time")
- **Winner:** Consensus to accept.
- **Why:** At 100× usage, synchronous syscalls inside Chokidar handlers will stall Node. Today the daemon is low-frequency; the trade is accepted. Profile later. Survive now.

---

## MVP Feature Set (What Ships in v1)

1. **Watcher skip-loop fix** — patched `daemon.ts` watcher handler. Eliminates the silent drop path.
2. **mtime guard** — tactical patch to prevent re-processing recent files. Documented as debt with a filed P1 ticket for SQLite replacement.
3. **Explicit skip logging** — every skipped file logs a human-readable reason with full path. No silent drops. No euphemisms.
4. **Dead-letter directory** — `prds/failed/` with timestamped reason for every failure.
5. **Recovery path** — mechanism to move a dead-letter PRD back to intake once the root cause is resolved. Failure is a waypoint, not a tomb.
6. **Onboarding script** — shell script that installs deps, creates directories, validates environment, and prints a single green line on success.
7. **Clean log formatting** — grep-friendly, plain language on fatal errors, no passive-obfuscation of real failures. Brand voice allowed for info-level lifecycle events.
8. **Vitest coverage** — tests run against a temp directory with mocked constants, zero export changes.
9. **No rename, no SQLite schema, no brand-voice manifesto, no retro deliverable, no manual smoke test.**
10. **Hard retry ceiling** — constant-defined, not configurable.

---

## File Structure (What Gets Built)

```
shipyard-ai/
├── src/
│   └── daemon.ts                    # patched watcher handler, mtime guard, explicit logs
│   └── health.ts                    # aligned with new dead-letter path; unchanged surface
├── tests/
│   └── daemon.watcher.skip.test.ts  # vitest, temp dir, mocked constants, zero export changes
├── scripts/
│   └── onboard.sh                   # one-command setup + verify + green success line
│   └── retry.sh                     # helper to resurrect a dead-letter PRD back to intake
├── prds/
│   ├── ...                          # intake directory
│   └── failed/                      # dead-letter with timestamped reason files
└── decisions.md                     # this document (the blueprint)
```

*No SQLite schema file. No `forge.ts`. No retro markdown. No surface-area refactor. No new config files.*

---

## Open Questions (Needs Resolution Before Merge)

1. **Dead-letter path format** — `prds/failed/PRD-123-20250502T160422Z.reason.txt`? Keep `.md` with YAML frontmatter? Single file or sidecar? *(Owner: Build agent)*
2. **Smoke test automation** — If AC #5 is deleted, do we replace it with a CI health ping, or is the onboarding script sufficient? *(Owner: Build agent + Reviewer)*
3. **Retry ceiling** — How many intake attempts before dead-letter? 1? 3? Hardcoded constant must be chosen. Steve: no knobs. Elon: boundaries are hygiene. Need a number. *(Owner: Phil / Build agent)*
4. **Recovery UX** — Manual `mv` back to intake, or does `scripts/retry.sh` handle it? *(Owner: Build agent)*
5. **v2 migration trigger** — What metric trips the SQLite rewrite? 500 PRDs/day? 3rd filesystem race? Document the threshold in code comments and the P1 ticket. *(Owner: Build agent)*
6. **Onboarding script scope** — Does it install deps, create directories, or just validate and start? Must be locked before build begins. *(Owner: Build agent)*
7. **Log severity mapping** — Who decides which events are `info` vs `error` vs `warn`? Steve wants emotional immediacy; Elon wants deterministic severity. Need a one-line rule. *(Owner: Build agent)*

---

## Risk Register

| Risk | Severity | Likelihood | Owner | Mitigation |
|---|---|---|---|---|
| **mtime precision collapse** | High | High at scale | Build agent | Documented debt on merge; 1-second `<=` tie-risk becomes certainty under load. P1 ticket filed per Decision 3. |
| **statSync event-loop block** | Medium | Low today, High at 100× | Build agent | Accept for v1; daemon is low-frequency today. Monitor intake latency. |
| **Filesystem watcher degradation** | High | Medium at scale | Build agent | Chokidar degrades linearly with directory size. v2 SQLite rewrite is the fix. |
| **Concurrency race (intake + watcher)** | High | Medium | Build agent | No multi-instance support in v1. Document single-node constraint. |
| **Band-aid becomes permanent** | High | Medium | Phil / Reviewer | Debt comment must include exact trigger threshold for v2 rewrite. P1 ticket must exist before merge (Decision 3). |
| **Naming conflict (Forge vs daemon)** | Low | Low | Steve / v2 | If v2 is delayed, muscle memory hardens and rename cost rises. Schedule v2 decision within 30 days of v1 ship. |
| **Dead-letter spam** | Medium | Low | Build agent | Without retry ceiling, a bad PRD could loop forever. Hard ceiling set in v1 (Open Question #3). |
| **Onboarding script rot** | Low | Medium | Build agent | Script must be tested in CI same as code, or it becomes a lying promise. |
| **Log verbosity explosion** | Medium | Medium | Build agent | Every skip screams, but a noisy daemon is almost as bad as a silent one. Use structured, single-line logs. No stack traces on expected skips. |
| **Recovery path manual toil** | Low | Low today | Build agent | If recovery is manual `mv`, on-call engineers must know the path. Document in runbook; automate with `scripts/retry.sh` if toil repeats. |
| **Export-change temptation** | Medium | Medium | Build agent | Future engineer may break Decision 6 to "make it testable." Enforce in code review: zero surface-area changes without a new round. |

---

*Build phase starts on green light from the user. No scope drift without a new round.*
