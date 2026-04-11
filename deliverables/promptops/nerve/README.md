# NERVE

**The invisible backbone that makes everything else possible.**

NERVE is the autonomous pipeline daemon for operations hardening. It provides deterministic execution, crash recovery, and clean shutdown mechanisms for the Shipyard AI pipeline.

## Philosophy

- **Determinism over elegance.** When something must happen, it happens.
- **Invisible architecture.** The best infra is infra you forget exists.
- **Zero configuration.** Every option is a failure to decide.
- **Clinical voice.** No emoji. No color codes. Just facts.

## Components

```
nerve/
├── daemon.sh         # Main daemon loop with PID lockfile
├── queue.sh          # Queue persistence and recovery
├── abort.sh          # Abort flag management
├── parse-verdict.sh  # Strict QA verdict parsing
└── README.md         # This file
```

## Quick Start

```bash
# Start the daemon
./daemon.sh start

# Check daemon status
./daemon.sh status

# Add item to queue
./queue.sh push qa-pass /path/to/qa-report.md

# Check queue depth
./queue.sh depth

# Graceful shutdown
./abort.sh set

# Force shutdown (emergency only)
./abort.sh force
```

## Daemon (daemon.sh)

The main daemon loop with PID lockfile prevention.

### Commands

| Command | Description |
|---------|-------------|
| `start` | Start the daemon (default) |
| `status` | Check if daemon is running |

### PID Lockfile

The daemon writes its PID to `/tmp/nerve.pid` on startup. If another instance attempts to start, it will detect the existing process and exit. Stale PID files (from crashed processes) are automatically cleaned up.

### Example

```bash
$ ./daemon.sh start
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items

$ ./daemon.sh status
[2026-04-11T14:22:35Z] [DAEMON] running (PID: 12345)
```

## Queue (queue.sh)

Persistent queue with crash recovery.

### Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize queue directories |
| `push <type> <payload>` | Add item to queue |
| `pop` | Get next item for processing |
| `complete <id>` | Mark item as completed |
| `fail <id> [reason]` | Mark item as failed |
| `list [state]` | List items (pending/processing/completed/failed) |
| `depth` | Show pending queue depth |
| `metrics` | Show queue metrics |
| `purge [days]` | Remove completed items older than N days |

### Crash Recovery

On initialization, any items left in the `processing` state (from a previous crash) are automatically moved back to `pending`. No queue state is ever lost.

### Queue Directories

```
/tmp/nerve-queue/
├── pending/      # Items waiting to be processed
├── processing/   # Items currently being processed
├── completed/    # Successfully processed items
└── failed/       # Items that failed processing
```

### Example

```bash
$ ./queue.sh init
[2026-04-11T14:22:33Z] [QUEUE] initialized with 0 pending items

$ ./queue.sh push qa-pass /home/agent/qa-report.md
[2026-04-11T14:22:34Z] [QUEUE] pushed item a1b2c3d4e5f6 (type: qa-pass)
a1b2c3d4e5f6

$ ./queue.sh depth
1

$ ./queue.sh metrics
[2026-04-11T14:22:35Z] [METRICS] depth=1 processing=0 completed=0 errors=0
```

## Abort (abort.sh)

Clean shutdown mechanism for runaway pipelines.

### Commands

| Command | Description |
|---------|-------------|
| `set` | Set abort flag (graceful shutdown) |
| `clear` | Clear abort flag |
| `status` | Check if abort flag is set |
| `force` | Force kill daemon (SIGTERM, then SIGKILL) |
| `wait [secs]` | Set abort and wait for shutdown |

### Abort Mechanism

The daemon checks for the abort flag (`/tmp/nerve.abort`) at each poll interval. When detected:

1. Current item processing completes
2. Abort flag is cleared
3. Daemon shuts down cleanly

Use `force` only when graceful shutdown fails.

### Example

```bash
$ ./abort.sh set
[2026-04-11T14:22:33Z] [ABORT] abort flag set
[2026-04-11T14:22:33Z] [ABORT] daemon (PID: 12345) will shutdown on next poll

$ ./abort.sh status
[2026-04-11T14:22:34Z] [ABORT] abort flag is SET
```

## Verdict Parser (parse-verdict.sh)

Strict QA verdict parsing with unambiguous results.

### Commands

| Command | Description |
|---------|-------------|
| `parse <file>` | Extract verdict (PASS/FAIL/BLOCKED/UNKNOWN) |
| `report <file>` | Full report parsing with JSON output |
| `p0 <file>` | Count P0 (blocker) issues |
| `p1 <file>` | Count P1 (must-fix) issues |
| `p2 <file>` | Count P2 (should-fix) issues |
| `metrics` | Show cumulative parsing metrics |
| `validate <v>` | Check if verdict string is valid |

### Verdict Values

| Verdict | Meaning |
|---------|---------|
| `PASS` | QA checks passed, ready to ship |
| `FAIL` | QA checks failed, fixes required |
| `BLOCKED` | Critical issues prevent any progress |
| `UNKNOWN` | No verdict found in file |
| `ERROR` | File not found or parsing error |

### Example

```bash
$ ./parse-verdict.sh parse qa-pass-1.md
[2026-04-11T14:22:33Z] [VERDICT] parsed qa-pass-1.md: BLOCKED
BLOCKED

$ ./parse-verdict.sh p0 qa-pass-1.md
[2026-04-11T14:22:33Z] [VERDICT] P0 issues in qa-pass-1.md: 6
6

$ ./parse-verdict.sh report qa-pass-1.md
{"file":"qa-pass-1.md","verdict":"BLOCKED","issues":{"p0":6,"p1":2,"p2":0},"parsed_at":"2026-04-11T14:22:33Z"}
```

## Log Format

All scripts use the same clinical, greppable log format:

```
[TIMESTAMP] [COMPONENT] message
```

- **Timestamp:** ISO 8601 UTC format `[2026-04-11T14:22:33Z]`
- **Components:** `DAEMON`, `QUEUE`, `ABORT`, `VERDICT`, `METRICS`
- **Message:** Plain text, no emoji, no ANSI color codes

### Grep Examples

```bash
# All daemon messages
grep '\[DAEMON\]' nerve.log

# All queue operations
grep '\[QUEUE\]' nerve.log

# All abort events
grep '\[ABORT\]' nerve.log

# All metrics
grep '\[METRICS\]' nerve.log
```

## File Locations

| File | Purpose |
|------|---------|
| `/tmp/nerve.pid` | Daemon PID lockfile |
| `/tmp/nerve.abort` | Abort flag |
| `/tmp/nerve-queue/` | Queue storage directory |
| `/tmp/nerve-metrics.json` | Cumulative metrics |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (see log output) |

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
