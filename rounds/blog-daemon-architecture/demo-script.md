# Demo Script: The Night Shift

## Scene 1: The Problem (0:00-0:25)

**NARRATOR:**
It's 11pm. You've written the PRD. Now you have to watch it.

[SCREEN: Terminal showing a PRD pipeline stuck on "Build phase running...". Cursor blinks. Nothing happens.]

Start the pipeline. Monitor for stalls. Restart failed agents. Babysit QA. Approve the merge.

90 minutes. You can't write the next PRD while babysitting this one. You can't sleep while the build runs.

The bottleneck isn't the AI. It's you.

---

## Scene 2: The Solution (0:25-1:30)

**NARRATOR:**
So we built a daemon that ships while you sleep.

[SCREEN: File appears in `prds/` directory - `feature-auth.md` gets created]

Drop a PRD file. Walk away.

[SCREEN: Split-screen view showing five phases lighting up in sequence like a pipeline diagram]

The daemon picks it up. Five phases: Debate. Plan. Build. QA. Ship.

[SCREEN: Terminal shows agent conversations scrolling - Steve Jobs vs Elon Musk debate snippets, then planner generating XML tasks]

Jobs and Musk debate the approach. Rick Rubin distills it. A planner converts decisions to atomic tasks.

[SCREEN: Multiple terminal windows spawn simultaneously showing parallel agent execution]

Build phase spawns sub-agents in parallel. Each gets fresh context. No rot. No hangs.

[SCREEN: QA agent checking files, running tests, validating no placeholders]

Margaret Hamilton runs QA — two passes. First: no placeholders, no "coming soon" markers, everything complete. Second: tests pass, requirements traced.

[SCREEN: Git commit, branch merge, GitHub notification]

Marcus Aurelius writes the retrospective. Daemon commits. Merges. Pushes.

---

## Scene 3: The Resilience (1:30-1:50)

**NARRATOR:**
It crashed 48 times.

[SCREEN: Log file showing "OOM kill" errors, timestamps, systemd restart messages]

Out-of-memory kills. Hard stops. Process terminated.

[SCREEN: Daemon restarts in 5 seconds, picks up exactly where it left off]

Systemd restarts it in 5 seconds. Completed phases don't re-run. Partial progress preserved.

Every agent gets a 20-minute timeout. Hangs get killed. Retries happen automatically.

One agent failure doesn't stop the pipeline.

---

## Scene 4: The Wow (1:50-2:00)

**NARRATOR:**
Close your laptop at 6pm with a PRD in the queue.

[SCREEN: Laptop closes. Screen goes dark. Time-lapse effect - clock spins from 6pm to 8am]

Wake up at 8am.

[SCREEN: GitHub notification lights up phone screen: "Merged PR #47: Ship auth feature"]

The code is live. The retrospective is written. The review passed.

You weren't watching.

[SCREEN: Fade to tagline]

**NARRATOR:**
The Night Shift. It works while you sleep.
