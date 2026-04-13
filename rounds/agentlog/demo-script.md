# AgentLog Demo Script
*Runtime: 2 minutes*

---

**NARRATOR:**
So here's the thing about AI agents. They're incredible — until they're not.

[SCREEN: A Slack thread. Someone posts: "Agent just deleted half our test suite. Anyone know why?"]

**NARRATOR:**
Last Tuesday, our agent ran a 40-step workflow. Somewhere around step 23, something went wrong. We know this because the output was garbage. But *what* went wrong? *Why?*

[SCREEN: A black terminal. Just a blinking cursor. The void.]

**NARRATOR:**
We had logs. We had... nothing, actually. We had the inputs. We had the outputs. And in between? A black box. An expensive, occasionally terrifying black box.

[SCREEN: A code editor opens. Simple TypeScript file.]

**NARRATOR:**
So we built AgentLog. And I want to show you what thirty seconds of setup gets you.

[SCREEN: Types `npm install @trace/sdk` in terminal. Returns immediately.]

**NARRATOR:**
One import. One init call. That's it.

[SCREEN: Code editor shows:
```typescript
import { init } from '@trace/sdk'
const trace = init('my-agent')
```
]

**NARRATOR:**
Now — here's where it gets good. You wrap your operations in spans.

[SCREEN: Code editor shows:
```typescript
await trace.span('process-document', async () => {
  const doc = await fetchDocument(url)

  trace.thought('Document looks like a legal contract, switching to legal parser')

  await trace.span('parse-content', async () => {
    return await parseAsLegal(doc)
  })
})
```
]

**NARRATOR:**
That `trace.thought`? That's the agent's reasoning. Its inner monologue. The thing you're always asking: *what was it thinking?*

[SCREEN: Terminal shows agent running. Normal output streaming by.]

**NARRATOR:**
Agent runs. Does its thing. You don't see anything different.

[SCREEN: File browser opens to `.trace/sessions/`. A single NDJSON file visible: `2024-03-15T14-23-45-001.ndjson`]

**NARRATOR:**
But now look. Every session. Timestamped. Human-readable. No database. No external service. Just a file, right there in your project.

[SCREEN: File opens. We see structured NDJSON:
```json
{"id":"abc-123","type":"span","name":"process-document","timestamp":"2024-03-15T14:23:45.001Z"}
{"id":"def-456","type":"thought","name":"thought","timestamp":"2024-03-15T14:23:45.123Z","content":"Document looks like a legal contract, switching to legal parser"}
{"id":"ghi-789","type":"span","name":"parse-content","timestamp":"2024-03-15T14:23:45.200Z","parentId":"abc-123"}
```
]

**NARRATOR:**
Every span. Every tool call. Every thought. Nested. Timed. Traceable.

[SCREEN: Back to that Slack thread from the opening. Same message: "Agent just deleted half our test suite."]

**NARRATOR:**
So Tuesday happens again. Agent does something weird.

[SCREEN: Opening the NDJSON file. Scrolling. We see spans nesting, then — an error span with `"error": "Permission denied: cannot write to protected directory"`]

**NARRATOR:**
Fourteen seconds. That's how long it takes to find it now. The agent hit a permission error on step 23, caught it, and tried to recover by... well, by doing exactly what you'd do if you couldn't write to the tests folder. It tried to clear space.

[SCREEN: The error span highlighted. Below it, a thought: "Write failed. Attempting to free up disk space in test directory."]

**NARRATOR:**
We can see it *thinking* that. We can watch it reason itself into a disaster.

[SCREEN: Back to clean code editor. The three lines of AgentLog setup.]

**NARRATOR:**
Three lines. Zero dependencies. No infrastructure. Just clarity — exactly when you need it most.

[SCREEN: Logo appears. "AgentLog. See what your agents are thinking."]

**NARRATOR:**
AgentLog. Because "it just stopped working" isn't a diagnosis.

---

*[END]*
