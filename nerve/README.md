# NERVE

**Operations Hardening for Autonomous Pipeline Daemon**

> The invisible backbone that makes everything else possible—infrastructure you trust so completely you forget it exists.

---

## The Essence

**What it is:** Deterministic pipeline execution. No hoping. No asking. Execution.

**The feeling:** Peace. The absence of the 3 AM knot in your stomach.

**The one thing that must be perfect:** Determinism. When something must happen, it happens.

**Creative direction:** Disappear completely. Work always.

---

## Architecture

```
nerve/
├── daemon.sh         # Main loop with PID lockfile
├── queue.sh          # Persistence and crash recovery
├── abort.sh          # Graceful shutdown management
├── parse-verdict.sh  # Strict QA verdict parsing
├── status.sh         # Quick status check
└── README.md         # This file
```

**Principle:** Four files. No new dependencies. Defense in depth.

**Philosophy:** Trust bash, not instructions. Deterministic execution is the architectural contract. No probabilistic operations for critical paths.

---

## Usage

### Starting the Daemon

```bash
./daemon.sh
```

The daemon:
- Acquires a PID lockfile at `/tmp/nerve.pid`
- Initializes the queue at `/tmp/nerve-queue/`
- Polls for work every 5 seconds
- Logs to stdout in clinical format

### Stopping the Daemon

```bash
./abort.sh request
```

This creates an abort flag. The daemon detects it, drains the queue gracefully, and shuts down.

To force stop (emergency only):
```bash
kill $(cat /tmp/nerve.pid)
```

### Checking Status

```bash
./status.sh          # Human-readable
./status.sh --json   # JSON output
```

### Queue Management

```bash
# Initialize queue directories
./queue.sh init

# Add an item to the queue
./queue.sh enqueue "item-001" '{"task":"build","project":"sunrise-yoga"}'

# Check queue depth
./queue.sh depth

# List all items by status
./queue.sh list

# Recover crashed items (automatic on daemon start)
./queue.sh recover
```

### Verdict Parsing

```bash
# Parse QA report verdict
./parse-verdict.sh /path/to/qa-report.md

# Check exit code
if ./parse-verdict.sh report.md; then
    echo "QA PASS"
else
    echo "QA FAIL or ERROR"
fi
```

Exit codes:
- `0` — PASS verdict found
- `1` — FAIL verdict found
- `2` — ERROR (no verdict, file missing, or ambiguous)

---

## Log Format

All NERVE components use a consistent, clinical log format:

```
[TIMESTAMP] [COMPONENT] message
```

**Components:** `DAEMON`, `QUEUE`, `ABORT`, `VERDICT`, `METRICS`

**Examples:**
```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items
[2026-04-11T14:22:35Z] [QUEUE] processed item abc123 in 2.3s
[2026-04-11T14:22:36Z] [METRICS] depth=2 latency=2.3s errors=0
[2026-04-11T14:22:37Z] [ABORT] shutdown requested
[2026-04-11T14:22:38Z] [DAEMON] shutdown complete
```

**Grep patterns:**
```bash
grep '\[DAEMON\]'    # All daemon messages
grep '\[QUEUE\]'     # All queue operations
grep '\[ABORT\]'     # All abort events
grep '\[METRICS\]'   # All metrics output
grep '\[VERDICT\]'   # All verdict parsing
```

---

## Metrics

NERVE tracks three metrics, written to `/tmp/nerve-metrics.json`:

| Metric | Description |
|--------|-------------|
| `queue_depth` | Number of pending items |
| `latency_last` | Processing time of last item (seconds) |
| `error_count` | Cumulative failed items |

**Example:**
```json
{"queue_depth":5,"latency_last":2.3,"error_count":0,"timestamp":"2026-04-11T14:22:36Z"}
```

Metrics are updated after each queue poll cycle and logged every 60 seconds.

---

## Failure Modes

### Duplicate Daemon Attempt

**Symptom:** `[DAEMON] already running (PID: 12345)`

**Cause:** Another daemon instance holds the lockfile.

**Resolution:** Either stop the existing daemon or kill it if unresponsive.

### Stale Lockfile

**Symptom:** Daemon finds lockfile but no process at that PID.

**Automatic Recovery:** NERVE cleans stale lockfiles automatically:
```
[DAEMON] cleaning stale lockfile (was PID: 12345)
[DAEMON] started (PID: 67890)
```

### Crashed Queue Items

**Symptom:** Items stuck in `running/` after daemon crash.

**Automatic Recovery:** On startup, NERVE moves `running/` items back to `pending/`:
```
[QUEUE] recovered 2 items from crashed state
```

### Abort Flag Not Cleared

**Symptom:** Daemon immediately shuts down on start.

**Resolution:** Clear the abort flag:
```bash
./abort.sh clear
```

---

## Environment Variables

All configuration uses zero-config defaults. Override only if needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `NERVE_LOCKFILE` | `/tmp/nerve.pid` | PID lockfile path |
| `NERVE_ABORT_FLAG` | `/tmp/nerve.abort` | Abort flag path |
| `NERVE_QUEUE_DIR` | `/tmp/nerve-queue` | Queue directory |
| `NERVE_METRICS_FILE` | `/tmp/nerve-metrics.json` | Metrics output |
| `NERVE_LOG_FILE` | (none) | Optional log file path |
| `NERVE_POLL_INTERVAL` | `5` | Queue poll interval (seconds) |
| `NERVE_HEARTBEAT_INTERVAL` | `12` | Metrics log frequency (iterations) |

---

## Compatibility

- **Bash:** 4.0+ required (scripts check and fail fast)
- **Platform:** Linux, macOS (uses portable `#!/usr/bin/env bash`)
- **Dependencies:** None (bash-only implementation)

---

## Deferred Features (v2+)

These features were explicitly deferred to keep v1 minimal and reliable:

- Metrics/observability endpoint (HTTP)
- Multi-daemon coordination
- Distributed locking (Redis/etcd)
- Queue partitioning
- Automated recovery beyond abort flags
- Dashboard/visualization
- Webhook notifications

---

## Integration

### With pipeline/qa/run-qa.sh

NERVE's `parse-verdict.sh` understands the verdict format from `run-qa.sh`:

```bash
# After QA runs
./parse-verdict.sh projects/my-site/review/qa-report_20260411.md
```

### With pipeline/deploy/deploy.sh

Use queue to manage deployment order:

```bash
./queue.sh enqueue "deploy-sunrise-yoga" '{"project":"sunrise-yoga","action":"deploy"}'
```

---

## Troubleshooting

### "Bash 4.0+ required" error

**macOS ships Bash 3.2.** Install a newer version:

```bash
brew install bash
# Then use: /usr/local/bin/bash daemon.sh
```

### Queue directory permissions

NERVE uses `umask 0077` for security. Files are owner-readable only.

### Process not visible in `ps aux | grep nerve`

The process runs as `bash daemon.sh`. Use:
```bash
ps aux | grep daemon.sh
# or
cat /tmp/nerve.pid
```

---

## Design Principles

1. **Determinism over elegance.** When something must happen, it happens.
2. **Invisible architecture.** The best infra is infra you forget exists.
3. **Zero configuration.** Every option is a failure to decide.
4. **Clinical voice.** No emoji. No "Oops!"
5. **Trust bash, not instructions.** Probabilistic operations have no place in critical paths.

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
*"When the floor is solid, the dance is free."* — Phil Jackson
