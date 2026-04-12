# NERVE — Pipeline Daemon

NERVE is a pipeline daemon for managing background jobs with crash recovery and clean shutdown.

## Quick Start

```bash
# Start daemon
./daemon.sh start

# Add work to queue
./queue.sh add "echo 'hello world'"

# Check status
./daemon.sh status
./queue.sh depth

# Stop daemon
./abort.sh set
```

## Components

| Script | Purpose |
|--------|---------|
| `daemon.sh` | Main daemon loop with PID lockfile |
| `queue.sh` | Queue persistence and recovery |
| `abort.sh` | Abort flag management |
| `parse-verdict.sh` | QA verdict parsing (returns JSON) |

## daemon.sh

Runs the main daemon loop. Prevents duplicate instances via PID lockfile.

```bash
./daemon.sh start    # Start daemon (foreground)
./daemon.sh status   # Check if running
```

**Files:**
- `/tmp/nerve.pid` — PID lockfile
- `/tmp/nerve-queue/` — Queue directory

## queue.sh

Manages the persistent job queue. Survives crashes.

```bash
./queue.sh init              # Initialize queue directory
./queue.sh add "command"     # Add job to queue
./queue.sh list              # List pending jobs (JSON)
./queue.sh depth             # Get queue depth
./queue.sh remove <id>       # Remove specific job
./queue.sh recover           # Recover state after restart
./queue.sh clear             # Clear all jobs
./queue.sh metrics           # Update metrics file
```

## abort.sh

Manages graceful shutdown via abort flag.

```bash
./abort.sh set              # Request graceful shutdown
./abort.sh clear            # Clear abort flag
./abort.sh check            # Check flag status (exit code)
./abort.sh force            # Force immediate shutdown
./abort.sh wait [timeout]   # Wait for shutdown (default: 30s)
```

## parse-verdict.sh

Parses QA reports and extracts verdict with issue counts.

```bash
./parse-verdict.sh file report.md     # Parse file
./parse-verdict.sh stdin < report.md  # Parse stdin
./parse-verdict.sh check report.md    # Exit 0 if PASS
./parse-verdict.sh validate PASS      # Validate verdict string
```

**Output format:**
```json
{
    "verdict": "PASS",
    "p0_count": 0,
    "p1_count": 0,
    "p2_count": 0,
    "total_issues": 0,
    "timestamp": "2026-04-11T14:22:33Z"
}
```

## Log Format

All scripts use: `[TIMESTAMP] [COMPONENT] message`

```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items
[2026-04-11T14:22:35Z] [ABORT] shutdown requested
```

Components: `DAEMON`, `QUEUE`, `ABORT`, `VERDICT`, `METRICS`
