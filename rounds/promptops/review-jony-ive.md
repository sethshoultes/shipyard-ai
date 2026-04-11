# Design Review: NERVE

*A meditation on form, restraint, and the poetry of infrastructure.*

---

## Overall Impression

There is something genuinely beautiful here. The work demonstrates a rare understanding that infrastructure, when done well, should disappear. The philosophy articulated in `README.md` lines 9-12 — *"Invisible architecture. The best infra is infra you forget exists."* — reveals designers who understand that true elegance is reduction to essence.

And yet. There is more to do. More to remove.

---

## Visual Hierarchy

### What Works

The README establishes hierarchy with remarkable clarity. The opening line (line 3) — *"The invisible backbone that makes everything else possible."* — is perfect. It tells you exactly what this is, why it matters, and does so in thirteen words.

The Philosophy section (lines 8-12) uses bold text sparingly and correctly. Each principle leads with its core truth: **Determinism over elegance.** The structure is: assertion, then context. This is correct.

### What Doesn't

**`parse-verdict.sh` lines 17-24** — The variable declarations compete for attention:

```bash
readonly VERDICT_PASS_PATTERN="^# [[:space:]]*PASS[[:space:]]*$"
readonly VERDICT_FAIL_PATTERN="^# [[:space:]]*FAIL[[:space:]]*$"
readonly VERDICT_BLOCKED_PATTERN="^# [[:space:]]*BLOCKED[[:space:]]*$"
readonly VERDICT_EMOJI_PASS="^#.*PASS"
readonly VERDICT_EMOJI_FAIL="^#.*FAIL"
readonly VERDICT_EMOJI_BLOCKED="^#.*BLOCKED"
```

Six constants, all visually identical, fighting for the same importance. The strict patterns (lines 19-21) are never used. The emoji patterns (lines 22-24) are the ones that matter. This is visual noise masquerading as thoroughness.

**`README.md` lines 16-23** — The ASCII tree structure is visually loud:

```
nerve/
├── daemon.sh         # Main daemon loop with PID lockfile
├── queue.sh          # Queue persistence and recovery
├── abort.sh          # Abort flag management
├── parse-verdict.sh  # Strict QA verdict parsing
└── README.md         # This file
```

Five lines of box-drawing characters to communicate four filenames. The tree notation is nostalgic but not necessary. Consider simply:

```
daemon.sh       Main daemon loop with PID lockfile
queue.sh        Queue persistence and recovery
abort.sh        Abort flag management
parse-verdict.sh    Strict QA verdict parsing
```

The relationship is implicit in the directory structure itself. Let the names speak.

**`queue.sh` lines 214-231** — The help text loses its way. After the elegant command list, the structure dissolves into prose-like formatting with inconsistent spacing around `<type>` and `<p>`. Line 221: `push <type> <p>` truncates `payload` — why? Space is free in terminal output.

---

## Whitespace

### What Works

The shell scripts breathe. Consider `daemon.sh` lines 35-45:

```bash
# Acquire lockfile
acquire_lock() {
    echo $$ > "$PID_FILE"
    log "DAEMON" "started (PID: $$)"
}

# Release lockfile
release_lock() {
    rm -f "$PID_FILE"
    log "DAEMON" "shutdown complete"
}
```

One blank line between functions. Comment as section header. Body does one thing. This is the correct rhythm.

### What Doesn't

**`README.md` lines 52-57** — The table immediately follows the heading with no breathing room:

```markdown
### Commands

| Command | Description |
|---------|-------------|
| `start` | Start the daemon (default) |
```

A single blank line between heading and table would let the eye settle before parsing structured data. This pattern repeats at lines 79-89, 128-135, and 162-172 — four tables, none with adequate breathing room.

**`parse-verdict.sh` lines 162-205** — The `update_metrics()` function is forty-three lines of unbroken density. Seven variable initializations (lines 169-175), seven variable extractions (lines 178-184), seven arithmetic operations (lines 188-191), one case statement (lines 193-197), one file write (lines 200-202), one log call (line 204). This function does seven things but presents them as one unbroken thought.

**`queue.sh` lines 145-154** — The `queue_metrics()` function declares four local variables on a single line (line 146), then immediately executes four nearly identical `find` commands. The visual rhythm is mechanical rather than musical. Each metric deserves a breath.

**`DECISIONS-LOCK.md` lines 24-37** — The examples section is generous, perhaps too generous. Seven example lines when three would communicate the pattern. The eye doesn't need to see `[2026-04-11T14:22:38Z] [DAEMON] shutdown complete` to understand that shutdown has a log message.

---

## Consistency

### What Works

The log format is exquisite. `[TIMESTAMP] [COMPONENT] message` repeats across every script. The `log()` function is defined identically in all four shell scripts (lines 14-18 in each). This repetition is not redundancy — it is a conscious choice for independence. Each script can run alone. I respect this.

The CLI interfaces share the same structure: `case` statement, alphabetical commands, `help|*)` as final catch-all. This pattern appears in:
- `daemon.sh` lines 155-184
- `queue.sh` lines 172-234
- `abort.sh` lines 122-165
- `parse-verdict.sh` lines 222-309

### What Doesn't

**Variable declarations lack consistent rhythm:**

In `daemon.sh` lines 8-11:
```bash
readonly PID_FILE="/tmp/nerve.pid"
readonly ABORT_FLAG="/tmp/nerve.abort"
readonly QUEUE_DIR="/tmp/nerve-queue"
readonly POLL_INTERVAL=1
```

In `abort.sh` lines 8-9:
```bash
readonly ABORT_FLAG="${ABORT_FLAG:-/tmp/nerve.abort}"
readonly PID_FILE="${PID_FILE:-/tmp/nerve.pid}"
```

One uses hardcoded paths ("zero configuration philosophy"), the other uses environment variable fallbacks (implicit configuration). Both are valid patterns. Using both is a decision not made. Choose one. I would choose opinion — embrace "zero configuration" completely.

**Function naming varies in convention:**
- `daemon.sh`: `check_lockfile()`, `acquire_lock()`, `release_lock()`, `check_abort()`, `daemon_loop()`
- `queue.sh`: `queue_init()`, `queue_depth()`, `queue_push()`, `queue_pop()`
- `abort.sh`: `abort_set()`, `abort_clear()`, `abort_status()`, `abort_force()`

The daemon uses verb phrases. Queue and abort use noun_verb compounds. Choose one convention and let it become the signature.

**Comment headers vary in capitalization and content:**

- `daemon.sh` line 35: `# Acquire lockfile`
- `queue.sh` line 48: `# Get queue depth (number of pending items)`
- `abort.sh` line 54: `# Force kill daemon (emergency use only)`

Some explain what, some explain why, some explain both. Choose one voice.

**CLI help blocks vary in density:**
- `abort.sh` lines 140-162: Sparse, with explanatory prose
- `queue.sh` lines 214-231: Dense, command list only
- `parse-verdict.sh` lines 279-306: Medium, includes examples

The help text *is* the interface for many users. It should feel designed, not accidental.

---

## Craft

### What Rewards Inspection

**`queue.sh` lines 68-73** — Atomic file writes:

```bash
local temp_file="$QUEUE_DIR/.tmp-$item_id"
cat > "$temp_file" << EOF
{"id":"$item_id","type":"$item_type","payload":"$payload","queued_at":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"}
EOF
mv "$temp_file" "$item_file"
```

Write to temporary file, then atomic move. This is the correct way. Someone understood that filesystem operations can fail mid-write. This detail will never be noticed by users. It will save them anyway.

**`abort.sh` lines 62-76** — The escalation sequence:

```bash
kill -TERM "$pid"
# Wait up to 5 seconds for graceful shutdown
local wait=0
while kill -0 "$pid" 2>/dev/null && [[ "$wait" -lt 5 ]]; do
    sleep 1
    wait=$((wait + 1))
done
if kill -0 "$pid" 2>/dev/null; then
    log "ABORT" "daemon not responding, sending SIGKILL"
    kill -KILL "$pid"
fi
```

SIGTERM, patience, then SIGKILL. This is respect for processes. The five-second wait is generous without being indulgent.

**`daemon.sh` lines 146-152** — The signal handler is elegant:

```bash
cleanup() {
    log "DAEMON" "received signal, shutting down"
    release_lock
    exit 0
}

trap cleanup SIGTERM SIGINT SIGHUP
```

Three signals. Three lines. One function. The form matches the intent.

**`README.md` lines 243-245** — The closing quotes:

```markdown
*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
```

The juxtaposition is deliberate. Completion and reduction. Both are true. Neither is sufficient alone.

### What Does Not Reward Inspection

**`daemon.sh` lines 124-125** — JSON parsing with `grep` and `cut`:

```bash
item_type=$(grep -o '"type":"[^"]*"' "$item_file" | cut -d'"' -f4)
```

This is brittle craft. The regex assumes no escaped quotes, no whitespace, no variation in JSON formatting. It works, but it does not *feel* inevitable. Consider `jq` or reconsider whether JSON is the right format for a shell-native queue.

**`queue.sh` lines 70-72** — The heredoc within `queue_push()`:

```bash
cat > "$temp_file" << EOF
{"id":"$item_id","type":"$item_type","payload":"$payload","queued_at":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"}
EOF
```

A 200-character line that requires horizontal scrolling. Long lines are a failure of hierarchy — they refuse to prioritize. Break the JSON across lines, or generate it differently.

**`parse-verdict.sh` lines 49-83** — The verdict parsing logic contains three nearly identical patterns for PASS, FAIL, and BLOCKED, checked twice (in section, then in whole file). Thirty-four lines to do what a single pattern with capture groups could accomplish.

**`DECISIONS-LOCK.md` lines 59-62** — The "Alternative Considered" section contains one item:

```markdown
**Alternative Considered:**
- `promptops-daemon` — Rejected: Too long, harder to type, confuses project name with process name
```

Either there were more alternatives and they were edited out, or the process of documenting alternatives was started and never finished. Both cases suggest incompletion.

---

## Recommendations: Quieter but More Powerful

### 1. Remove the Unused Patterns

In `parse-verdict.sh`, delete lines 19-21. The strict patterns `VERDICT_PASS_PATTERN`, `VERDICT_FAIL_PATTERN`, and `VERDICT_BLOCKED_PATTERN` are defined but never referenced. Dead code is not potential — it is noise.

### 2. Remove the ASCII Tree

In `README.md` lines 16-23, replace the box-drawing characters with a simple list. Let the directory structure speak for itself.

### 3. Let Tables Breathe

In `README.md`, add one blank line before every table. The eye needs a moment between prose and structure. This is not decoration — it is pacing.

### 4. Reduce Example Count

In `DECISIONS-LOCK.md` lines 30-37, reduce to three examples maximum:

```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] processed item abc123 in 2.3s
[2026-04-11T14:22:35Z] [ABORT] shutdown requested
```

Start, work, stop. The complete lifecycle in three lines.

### 5. Standardize Configuration Style

Remove the parameter expansion syntax (`${VAR:-default}`) from `queue.sh`, `abort.sh`, and `parse-verdict.sh`. Match `daemon.sh`. Embrace the "zero configuration" philosophy completely.

### 6. Break Up update_metrics()

In `parse-verdict.sh`, introduce visual sections within the function using blank lines:

- Lines 168-175: initialization
- Lines 177-185: extraction
- Lines 187-197: computation
- Lines 199-205: persistence

Four concerns, four visual blocks. The function remains one function but becomes readable as four thoughts.

### 7. Unify Function Naming

Choose either verb phrases (`acquire_lock`, `release_lock`) or noun_verb compounds (`queue_push`, `queue_pop`). Apply consistently across all scripts.

### 8. Standardize Comment Voice

Choose: comments describe *what* (for simple functions) or *why* (for complex ones). Currently the codebase does both, inconsistently. I would suggest *what* for one-liners, *why* for anything longer. But the choice matters less than the consistency.

### 9. Eliminate Truncation

In `queue.sh` line 221, expand `<p>` to `<payload>`. The saving of seven characters costs clarity. In a CLI help message, the user deserves complete words.

### 10. Make Dangerous Things Look Dangerous

The `force` command in `abort.sh` has 30 lines of defensive code (lines 55-87). The comment says "emergency use only." If it's emergency use, perhaps it should be a separate script — `nerve-force-kill.sh` — rather than a subcommand hidden in help text. Make dangerous things *look* dangerous.

---

## Final Thought

This work understands something essential: that the best tools disappear. The name NERVE is well-chosen — infrastructure that carries signals but isn't the signal itself.

The craft is present. The philosophy is sound. What remains is refinement — the slow, patient work of removing everything that isn't essential until what remains could not be any other way.

*"Design is not just what it looks like and feels like. Design is how it works."*

The work functions. Now make it inevitable.

---

*Review conducted: 2026-04-11*
*Reviewer: Jony Ive*
