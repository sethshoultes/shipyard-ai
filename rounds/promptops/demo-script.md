# PromptOps Demo Script

**Runtime:** 2 minutes
**Format:** NARRATOR lines + [SCREEN: description] stage directions

---

## ACT ONE: THE PROBLEM (0:00 - 0:35)

[SCREEN: Black. A timestamp fades in: "Tuesday, 11:47 PM"]

NARRATOR:
Sarah just pushed a prompt change to production.

[SCREEN: Slack channel. Messages appear, one by one: "Hey, the chatbot's being weird" / "Is it just me or..." / "No, I see it too"]

NARRATOR:
The chatbot that talks to forty thousand customers a day. She tweaked two words in the system prompt. Made it friendlier.

[SCREEN: Side-by-side diff. Old: "You are a helpful assistant." New: "You are a helpful, cheerful assistant."]

NARRATOR:
Except now it's adding exclamation points to everything. Including the apology emails. The ones that go out when orders are late.

[SCREEN: Email preview. Subject: "Your Order Update!" Body: "We're so sorry your package is delayed! We hope you have a wonderful day!"]

NARRATOR:
Sarah doesn't have a backup. Her git history shows "updated prompt" fourteen times.

[SCREEN: Git log scrolling. Every commit message identical: "updated prompt" / "updated prompt" / "updated prompt"]

NARRATOR:
Which one worked? She doesn't know. Nobody knows. The version that was right? It's gone. Somewhere. Maybe.

[SCREEN: Sarah's face, laptop glow. Eyes closed. Deep breath.]

NARRATOR:
This is the problem. Prompts are code now. They run your business. But we're still managing them like napkin scribbles.

---

## ACT TWO: THE WALKTHROUGH (0:35 - 1:35)

[SCREEN: Fade to black. Then: a clean terminal. Cursor blinking.]

NARRATOR:
Here's Drift.

[SCREEN: Types `drift init` — enters]

[SCREEN: Output:
```
Drift initialized.
Project: acme-support
API Key: dk_a1b2c3d4...
```]

NARRATOR:
One command. No signup form. No OAuth dance. You're working.

[SCREEN: Types `drift push system-prompt --file ./prompt.txt -m "initial version"`]

[SCREEN: Output: `Pushed system-prompt v1.`]

NARRATOR:
Push your prompt. Just like code.

[SCREEN: Quick montage — commands flying by:
`drift push system-prompt --file ./prompt.txt -m "removed hedging"`
`Pushed system-prompt v2.`
`drift push system-prompt --file ./prompt.txt -m "PM feedback on tone"`
`Pushed system-prompt v3.`]

NARRATOR:
Version two. Version three. Your PM has a "quick idea." Version four. Every version lives. Every version has a message. Every version can come back.

[SCREEN: Types `drift list` — enters]

[SCREEN: Clean table appears:
```
NAME              ACTIVE    VERSIONS    CREATED
system-prompt     v7        7           2026-04-01
onboarding        v3        3           2026-04-05
error-handler     v2        2           2026-04-08

3 prompt(s) found.
```]

NARRATOR:
Every prompt. Every version. Right there.

[SCREEN: Terminal splits. Right side shows NERVE daemon running — clean, clinical logs:]

```
[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)
[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items
[2026-04-11T14:22:35Z] [QUEUE] processed item abc123 in 2.3s
[2026-04-11T14:22:36Z] [METRICS] depth=2 latency=2.3s errors=0
```

NARRATOR:
And running behind the scenes? NERVE. The daemon that processes your queue. Evals. Deployments. QA checks. It crashes? It recovers. Your work doesn't vanish. It comes back.

[SCREEN: Daemon crashes — screen blinks]

[SCREEN: `./daemon.sh` — restart]

[SCREEN:
```
[DAEMON] cleaning stale lockfile (was PID: 12345)
[QUEUE] recovered 2 items from crashed state
[DAEMON] started (PID: 67890)
```]

NARRATOR:
Zero lost work. Because that's the whole point.

---

## ACT THREE: THE WOW MOMENT (1:35 - 2:00)

[SCREEN: Back to Sarah. It's 11:47 PM. Slack is exploding.]

NARRATOR:
Now let's go back to Tuesday night. Sarah's in trouble.

[SCREEN: She types `drift list` — sees system-prompt at v7]

NARRATOR:
She sees it. Version 7. "Cheerful tone per marketing." That's the one. That's the problem.

[SCREEN: She types: `drift rollback system-prompt --version 6`]

NARRATOR:
One command.

[SCREEN: Output:
```
Rolled back system-prompt from v7 to v6.
Live now.
```]

NARRATOR:
Not "deployed in five minutes." Not "waiting for CI." Not "pending approval from someone who's asleep."

[SCREEN: Pause. Hold on those two words: "Live now."]

NARRATOR:
Live. Now.

[SCREEN: Clock shows 11:48 PM. One minute later. Slack goes quiet. A single message: "chatbot's back to normal 🙏"]

NARRATOR:
Eleven seconds. That's how long the fix took. The customers who saw the weird emails? A few dozen. Not forty thousand.

[SCREEN: Sarah closes her laptop. Lights off.]

NARRATOR:
Sarah sleeps tonight. Not because nothing went wrong. Things always go wrong. But when they did, the fix was one command. Eleven seconds. And there was a daemon running that didn't need her to watch it.

[SCREEN: Black. Then: `drift rollback` — typed slowly, alone on screen]

[SCREEN: Logo fades in: "PromptOps"]
[SCREEN: Below: "Drift + NERVE"]
[SCREEN: Below that, smaller: "The undo button for your AI."]

NARRATOR:
Go to sleep. We've got this.

[SCREEN: Fade to black.]

---

*END — Runtime: ~2:00*
