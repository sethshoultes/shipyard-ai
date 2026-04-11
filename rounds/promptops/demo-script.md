# NERVE Demo Script
**Runtime:** 2 minutes
**Format:** NARRATOR + [SCREEN] stage directions

---

**[SCREEN: Black. A cursor blinks.]**

NARRATOR:
It's 2 AM. You're watching a pipeline run.

**[SCREEN: Terminal scrolling. Log lines flying past.]**

NARRATOR:
Not because you want to be here. Because the last time you didn't watch, the pipeline crashed at 2:47 AM, and by the time you woke up, it had been spinning for four hours doing nothing. And nobody knew. And the client demo was at nine.

**[SCREEN: The scrolling freezes. A single line: "Connection timeout."]**

NARRATOR:
So now you watch. You watch it like it's a sleeping baby. You watch it like it's a fuse you lit and you're not sure how long it is.

**[SCREEN: Cut to a clean terminal. Prompt waiting.]**

NARRATOR:
This is NERVE.

**[SCREEN: Types `./daemon.sh start`]**

NARRATOR:
One command. It starts.

**[SCREEN: `[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)`]**

NARRATOR:
No configuration file. No YAML. No "let me just set up the"—no. It starts. It runs. It does exactly one thing: it makes sure your pipeline never dies in the dark.

**[SCREEN: Types `./queue.sh push qa-pass /reports/qa-report.md`]**

NARRATOR:
Queue a job. Any job.

**[SCREEN: `[2026-04-11T14:22:34Z] [QUEUE] pushed item a1b2c3d4e5f6 (type: qa-pass)`]**

NARRATOR:
That item is now in a persistent queue. Not in memory. Not in some Redis you forgot to configure. In a directory. On disk. Where it belongs.

**[SCREEN: Types `./queue.sh metrics`]**

**[SCREEN: `[2026-04-11T14:22:35Z] [METRICS] depth=1 processing=0 completed=0 errors=0`]**

NARRATOR:
Now here's where it gets interesting.

**[SCREEN: Terminal suddenly closes. Dramatic.]**

NARRATOR:
Power outage. Kernel panic. Your laptop dies because you forgot to plug it in. Whatever. The daemon's gone.

**[SCREEN: New terminal opens. Types `./daemon.sh start`]**

NARRATOR:
Start it again.

**[SCREEN: `[2026-04-11T14:23:01Z] [QUEUE] initialized with 1 pending items (recovered 1)`]**

NARRATOR:
*Recovered one.*

That job you queued? It's still there. Still waiting. Because NERVE doesn't guess about state. It writes to disk. It reads from disk. If it was processing when you crashed, it moves back to pending. Zero lost work. Zero.

**[SCREEN: Types `./parse-verdict.sh report /reports/qa-report.md`]**

NARRATOR:
Parse a QA report.

**[SCREEN: `{"file":"/reports/qa-report.md","verdict":"BLOCKED","issues":{"p0":6,"p1":2,"p2":0},"parsed_at":"2026-04-11T14:23:15Z"}`]**

NARRATOR:
Not "it looks like maybe there might be some issues." BLOCKED. Six P0s. Two P1s. That's the answer. Unambiguous. Grep-able. Debuggable at 2 AM when you've had too much coffee and not enough sleep.

**[SCREEN: Types `grep '\[QUEUE\]' nerve.log`]**

**[SCREEN: Shows clean, filtered output—only queue operations.]**

NARRATOR:
Every component logs to the same format. Square brackets. Timestamps. No emoji. No colors. Because when something breaks, you don't need it to look pretty. You need to find it. Fast.

**[SCREEN: Types `./abort.sh set`]**

**[SCREEN: `[2026-04-11T14:23:30Z] [ABORT] abort flag set`
`[2026-04-11T14:23:30Z] [ABORT] daemon (PID: 12345) will shutdown on next poll`]**

NARRATOR:
And when you need to stop? You tell it to stop. It finishes what it's doing. It shuts down clean. No orphan processes. No zombie jobs. No wondering if it's still running somewhere.

**[SCREEN: `[2026-04-11T14:23:31Z] [DAEMON] shutdown complete`]**

NARRATOR:
That's it.

**[SCREEN: Freeze on the clean log output.]**

NARRATOR:
NERVE isn't a dashboard. It isn't a platform. It's the thing that lets you close your laptop at 2 AM and go to sleep.

**[SCREEN: Fade to black. Text appears: `NERVE — The invisible backbone.`]**

NARRATOR:
Because the best infrastructure is infrastructure you forget exists.

**[SCREEN: Hold on tagline. Fade out.]**

---

*"Real artists ship."* — Steve Jobs
*"The best part is no part."* — Elon Musk
