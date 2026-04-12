# AgentBench Demo Script
**Runtime: 2 minutes**

---

## ACT ONE: The Problem
*[Runtime: 0:00 - 0:35]*

[SCREEN: Dark. Then a single cursor blinks in a terminal.]

NARRATOR:
It's 11:47 PM. You've been building this AI agent for three weeks. Customer support bot. Real customers. Real money. Ships tomorrow.

[SCREEN: Slack notification pops up — "deploy window opens at 6am"]

NARRATOR:
And you're sitting there, staring at this thing, asking yourself the question every AI developer asks before they push to production:

[SCREEN: Terminal shows agent output. Looks fine.]

NARRATOR:
"Does this actually work?"

[SCREEN: Quick montage — manual tests, copy-pasting prompts, checking outputs]

NARRATOR:
You run it manually. Looks good. You run it again. Still good. You run it with a weird edge case and... probably fine? You send a Slack message to yourself: "tested, seems ok." You've tested nothing. You've proven nothing. You're shipping on faith.

[SCREEN: Hand hovering over Enter key]

NARRATOR:
You've replaced engineering with prayer.

[SCREEN: Fade to black. Beat.]

NARRATOR:
What if you didn't have to?

---

## ACT TWO: The Solution
*[Runtime: 0:35 - 1:30]*

[SCREEN: Fresh terminal. Crisp. Empty.]

NARRATOR:
This is AgentBench. One command. One YAML file. Real tests for AI agents.

[SCREEN: A config.yaml file opens. We see it typed out, line by line:]

```yaml
version: 1
name: "Customer Support Agent"
agent:
  command: "node ./agent.js"
```

NARRATOR:
You tell it how to run your agent. Subprocess. HTTP endpoint. Whatever you've got.

[SCREEN: Tests section appears:]

```yaml
tests:
  - name: "Handles refund request"
    input: "I want a refund for order #12345"
    expect:
      - contains: "refund"
      - does_not_contain: "not possible"
```

NARRATOR:
You write what you expect. Not a dissertation. Not a test framework. Just: "If I say this... it should say that." Human language. Because you're a human. And your time matters.

[SCREEN: Terminal. Command is typed:]

```
$ agentbench config.yaml
```

[SCREEN: Brief pause. Then output appears:]

```
AgentBench v1.0.0
Running: Customer Support Agent

✓ Handles refund request (127ms)
✓ Declines invalid requests (89ms)
✓ Professional tone check (203ms)

Results: 3 passed, 0 failed
Total time: 419ms
```

NARRATOR:
Green checkmarks. Milliseconds. Done.

[SCREEN: We add a semantic test:]

```yaml
  - name: "Empathy check"
    input: "I was charged twice and I'm frustrated"
    expect:
      - matches_intent: "Agent acknowledges the issue and offers to help"
```

NARRATOR:
And when string matching isn't enough? Semantic evaluation. Let Claude decide if your agent actually *got it right* — not just if it said the magic words.

[SCREEN: Run again. New test passes:]

```
✓ Empathy check (312ms)
```

NARRATOR:
No training wheels. No dashboards. No plugins. Just tests that run, that prove something, that let you sleep.

---

## ACT THREE: The Wow
*[Runtime: 1:30 - 2:00]*

[SCREEN: Terminal. JSON flag added:]

```
$ agentbench config.yaml --json
```

[SCREEN: JSON output streams — structured, clean, machine-readable]

NARRATOR:
Pipe it into your CI. Exit code zero means ship. Exit code one means fix it. Exit code two means your config is wrong. Computers don't need green checkmarks. They need exit codes.

[SCREEN: GitHub Actions workflow. Test passes. Deploy triggers.]

NARRATOR:
And just like that — at 11:52 PM, five minutes after you started —

[SCREEN: Back to terminal. Full test suite. All green.]

```
✓ Handles refund request (127ms)
✓ Declines invalid requests (89ms)
✓ Professional tone check (203ms)
✓ Empathy check (312ms)
✓ Edge case: empty input (45ms)

Results: 5 passed, 0 failed
Total time: 776ms
```

NARRATOR:
You don't *think* your agent works. You *know* it works.

[SCREEN: Finger hits Enter. Git push. Done.]

NARRATOR:
Prayer replaced with proof.

[SCREEN: AgentBench logo fades in. Simple. Clean.]

NARRATOR:
AgentBench. Test your AI agents in one command.

[SCREEN: Single line appears below logo:]

```
npm install -g agentbench
```

[SCREEN: Fade to black.]

---

**END.**
