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
