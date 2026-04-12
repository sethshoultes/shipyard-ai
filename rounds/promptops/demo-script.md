<<<<<<< HEAD
# PromptOps Demo Script

**Runtime:** 2 minutes
**Format:** NARRATOR + [SCREEN] stage directions

---

[SCREEN: Black. Then a timestamp appears: "11:47 PM — Tuesday"]

NARRATOR:
Sarah just pushed a prompt change to production.

[SCREEN: A Slack channel. A message pops in: "Hey, why is the chatbot being weird?"]

NARRATOR:
The chatbot that talks to forty thousand customers a day. She tweaked the system prompt. Made it friendlier. Two words.

[SCREEN: A diff. Old: "You are a helpful assistant." New: "You are a helpful, cheerful assistant."]

NARRATOR:
Except now it's adding exclamation points to everything. Including the apology emails. The ones that go out when orders are late.

[SCREEN: Email preview. Subject: "Your Order Update!" Body: "We're so sorry your package is delayed! We hope you have a wonderful day!"]

NARRATOR:
Sarah doesn't have a backup of the old prompt. It's in a Google Doc somewhere. Maybe. Her git history shows "updated prompt" fourteen times. Which one worked?

[SCREEN: Git log showing identical commit messages stacked: "updated prompt", "updated prompt", "updated prompt"...]

NARRATOR:
This is the problem. Prompts are code now. They run your business. But we're still managing them like sticky notes.

[SCREEN: Fade to black. Then: Terminal. A cursor blinks.]

NARRATOR:
Here's Drift.

[SCREEN: `drift init` — typed and entered]

[SCREEN: Output appears:
```
Initializing Drift project...
Project initialized: acme-support
API Key: dk_a1b2c3d4e5f6...
⚠️  Save this key! It won't be shown again.
```]

NARRATOR:
One command. No signup form. No OAuth dance. No "verify your email." You get a project. You get an API key. You're working.

[SCREEN: `drift push system-prompt --file ./prompt.txt -m "initial version"`]

[SCREEN: `Pushed system-prompt v1.`]

NARRATOR:
Push your prompt. Just like code.

[SCREEN: Quick montage — commands flying by:
`drift push system-prompt --file ./prompt.txt -m "removed hedging"`
`Pushed system-prompt v2.`
`drift push system-prompt --file ./prompt.txt -m "PM feedback on tone"`
`Pushed system-prompt v3.`]

NARRATOR:
Version two. Version three. Your PM has a "quick idea." Version four. Every version lives. Every version has a message. Every version can come back.

[SCREEN: `drift push system-prompt --file ./prompt.txt -m "cheerful tone per marketing"`]
[SCREEN: `Pushed system-prompt v7.`]

NARRATOR:
And then Tuesday night happens.

[SCREEN: Slack explodes. Messages stacking:
"customers are complaining"
"this is bad"
"who touched the prompt"
"@sarah ???"]

NARRATOR:
Sarah opens her terminal.

[SCREEN: `drift prompts system-prompt`]

[SCREEN: Output shows version history:
```
system-prompt
  v7  "cheerful tone per marketing"   11:47 PM
  v6  "removed hedging"               3:15 PM
  v5  "PM feedback on tone"           yesterday
  v4  "shortened responses"           2 days ago
```]

NARRATOR:
Every version. Right there. With the message she wrote when she pushed it.

[SCREEN: Sarah's finger hovers. Then:]

[SCREEN: `drift rollback system-prompt --version 6`]

NARRATOR:
One command.

[SCREEN: `Rolled back to v6. Live now.`]

NARRATOR:
Not "deployed in five minutes." Not "waiting for CI." Live. Now.

[SCREEN: Clock in corner: 11:48 PM. One minute later.]

[SCREEN: Slack. New message: "chatbot seems normal again?" followed by "yep we're good 🙏"]

NARRATOR:
Eleven seconds. That's how long the fix took. The customers who saw the weird emails? A few dozen. Not forty thousand.

[SCREEN: Fade. New terminal. Different vibe — cleaner, more sparse.]

NARRATOR:
Now here's the part nobody thinks about until 3 AM.

[SCREEN: `./daemon.sh`]

[SCREEN: `[2026-04-11T14:22:33Z] [DAEMON] started (PID: 12345)`]

NARRATOR:
This is NERVE. The daemon that runs everything else.

[SCREEN: Logs scroll. Clean. Clinical. No emoji. No color.
`[2026-04-11T14:22:34Z] [QUEUE] initialized with 3 pending items`
`[2026-04-11T14:22:35Z] [QUEUE] processed item abc123 in 2.3s`
`[2026-04-11T14:22:36Z] [METRICS] depth=2 latency=2.3s errors=0`]

NARRATOR:
Every prompt push, every QA check, every deployment—queued, processed, logged. If NERVE crashes, it recovers. Your items don't vanish. They come back.

[SCREEN: Daemon crashes — screen goes dark]

[SCREEN: Restart. `./daemon.sh`]

[SCREEN: `[DAEMON] cleaning stale lockfile (was PID: 12345)`
`[QUEUE] recovered 2 items from crashed state`
`[DAEMON] started (PID: 67890)`]

NARRATOR:
Zero lost work. Because determinism isn't a feature. It's the whole point.

[SCREEN: Back to Sarah. Laptop closed. Lights off.]

NARRATOR:
Sarah sleeps tonight. Not because nothing went wrong. Things always go wrong. But because when they did, the fix was one line. Eleven seconds. And there was a daemon running that didn't need her to watch it.

[SCREEN: Black. Then, typed slowly: `drift rollback`]

NARRATOR:
That's PromptOps. Version control for prompts. Rollback for mistakes. Infrastructure that disappears because it just works.

[SCREEN: Logo fades in: "PromptOps"]
[SCREEN: Below: "Drift + NERVE"]
[SCREEN: Below that, smaller: "The undo button for your AI's soul."]

[SCREEN: Beat. Hold.]

NARRATOR:
Go to sleep. We've got this.

[SCREEN: Fade to black.]

---

*END — Runtime: ~2:00*
=======
# Tuned — 2-Minute Demo Script

---

## COLD OPEN (0:00 - 0:20)

**NARRATOR:**
So here's the thing nobody talks about.

[SCREEN: Code editor. A system prompt hardcoded in a Python file. The string is 400 characters of carefully crafted instructions.]

**NARRATOR:**
You spent three hours writing this prompt. Tested it. Tweaked it. Finally got your AI to stop being weird. And now it lives... here. In a string literal. In production.

[SCREEN: Zoom into the code. The prompt is buried between API configuration and error handling.]

**NARRATOR:**
Want to improve it? Deploy the whole app. Want to roll it back? Hope you remember the git commit. Want to know which version is actually running? Good luck.

[SCREEN: Git log scrolling. Commit messages like "fix prompt" and "update prompt again" and "ok this one works"]

**NARRATOR:**
Your prompts are the most important part of your AI product. And you're managing them like it's 2003.

---

## THE PRODUCT (0:20 - 1:20)

**NARRATOR:**
This is Tuned.

[SCREEN: Terminal. Clean, dark. Cursor blinking.]

**NARRATOR:**
Sixty seconds. That's all you need.

[SCREEN: Types `npm install -g @tuned/cli` — installation completes in ~3 seconds]

**NARRATOR:**
Install. One command.

[SCREEN: Types `tuned init` — output shows "Tuned. Ready to push prompts." with a generated project ID]

**NARRATOR:**
Initialize. Creates a config, generates your API key. Done.

[SCREEN: Types `tuned push "customer-support" -c "You are a helpful customer support agent. Be concise. Never apologize more than once."`]

**NARRATOR:**
Push your first prompt. Give it a name. Give it content. That's it.

[SCREEN: Output shows "Pushed customer-support v1. Live at edge."]

**NARRATOR:**
Version one. Live. At the edge. Under five milliseconds from anywhere on Earth.

[SCREEN: Split view — on left, terminal. On right, VS Code with SDK integration]

**NARRATOR:**
Now the part that matters. Your code.

[SCREEN: Types SDK code:
```javascript
import { getPrompt } from '@tuned/sdk'

const prompt = await getPrompt('customer-support')
```
]

**NARRATOR:**
One function. `getPrompt`. It fetches your active version, caches it locally, injects it into your LLM call. Zero latency added. None. Your AI call is exactly as fast as before.

[SCREEN: Highlight the simplicity — two lines of code]

**NARRATOR:**
And now when you want to improve that prompt?

[SCREEN: Terminal. Types `tuned push "customer-support" -c "You are a helpful customer support agent. Be concise. Never apologize. If you don't know, say so."`]

**NARRATOR:**
Push again. Version two. Instant.

[SCREEN: Output shows "Pushed customer-support v2. Live at edge."]

**NARRATOR:**
No deploy. No git commit. No restarting servers. It just... works.

---

## THE WOW MOMENT (1:20 - 1:45)

**NARRATOR:**
But here's the thing that changes everything.

[SCREEN: Terminal. Shows `tuned list`]

[SCREEN: Output displays a clean table:
```
NAME              VERSION   UPDATED
customer-support  v2 *      2 min ago
                  v1        5 min ago
```
]

**NARRATOR:**
Version two's live. But something's off. Customers are confused. You need to go back.

[SCREEN: Types `tuned rollback customer-support`]

**NARRATOR:**
One command.

[SCREEN: Output shows "Rolled back customer-support to v1. Live at edge."]

**NARRATOR:**
Version one. Back in production. No deploy. No hotfix. No 3 AM panic. Two seconds.

[SCREEN: Brief pause. The terminal sits there, calm. The problem is solved.]

**NARRATOR:**
Your prompts are finally under control.

---

## THE CLOSE (1:45 - 2:00)

[SCREEN: Dashboard view — minimal, clean. Shows the prompt list with versions and timestamps. No buttons except the prompt names. Read-only.]

**NARRATOR:**
This is what your prompts look like when you stop treating them like strings and start treating them like the product they actually are.

[SCREEN: Returns to terminal. Types `tuned push` — the cursor blinks, waiting.]

**NARRATOR:**
Tuned. Version control for the thing that matters most.

[SCREEN: Logo appears. "tuned" in clean lowercase. Below it: "Your prompts, finally under control."]

**NARRATOR:**
Sixty seconds from install to live. Try it.

[SCREEN: `npm install -g @tuned/cli` fades in below the logo]

---

*End demo.*
>>>>>>> feature/promptops-tuned
