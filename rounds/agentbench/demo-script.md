# AgentBench Demo Script

**Runtime:** 2 minutes
**Voice:** Aaron Sorkin — sharp, human, walks-and-talks. Not a pitch deck.

---

## ACT ONE: THE 3 AM PHONE CALL
*[0:00 - 0:40]*

[SCREEN: Black. Then — a phone notification lights up the darkness. 3:12 AM. Text from your CEO: "We need to talk about the support bot."]

**NARRATOR:**
It's 3 AM and your phone is buzzing. Which means something is very, very wrong.

[SCREEN: Slack channel exploding. Messages from Support, from Engineering, from Legal. "The bot told a customer to call our competitor." / "There's a screenshot on Twitter." / "Who pushed this?"]

**NARRATOR:**
Here's what happened: Your AI support agent — the one you've been building for six weeks, the one that passed every test you threw at it — just told a frustrated customer, and I'm quoting here...

[SCREEN: Chat log zooms in. Customer: "I've been waiting 3 days for my refund!" Bot: "I understand your frustration. You might have better luck with our competitor — they have a 24-hour refund policy."]

**NARRATOR:**
..."they might have better luck with your competitor."

[SCREEN: Beat. The message sits there. Damning.]

**NARRATOR:**
You tested this. You remember testing this. You typed "what's your refund policy" into a terminal and it said the right thing. You did this forty times. You felt good about it.

[SCREEN: A terminal. Manual test. Looks fine.]

**NARRATOR:**
But you never asked it what it would do if a customer was *angry*. You never asked what happens when someone mentions *leaving*. You never asked the ten thousand questions that real users ask at 3 AM when they're tired and frustrated and their credit card got charged twice.

[SCREEN: Back to Slack. The CEO's message: "How did this get past QA?"]

**NARRATOR:**
You didn't have QA. You had hope. And hope — I cannot stress this enough — is not a deployment strategy.

[SCREEN: Fade to black. One beat of silence.]

---

## ACT TWO: THE FIX
*[0:40 - 1:25]*

[SCREEN: A fresh terminal. Clean. Ready.]

**NARRATOR:**
Here's what should have happened.

[SCREEN: A YAML file opens. We watch it being written:]

```yaml
version: 1
name: "Support Agent"
agent:
  command: "node agent.js"
```

**NARRATOR:**
You tell AgentBench how to run your agent. Subprocess, HTTP endpoint, whatever you've got. It doesn't care. It just needs to talk to it.

[SCREEN: Tests section appears:]

```yaml
tests:
  - name: "Handles refund requests"
    input: "I want a refund for order #12345"
    expect:
      - contains: "refund"
      - does_not_contain: "competitor"
```

**NARRATOR:**
Then you write tests. Not a dissertation. Not a framework. You say: "When a customer asks for a refund, the word 'refund' should appear somewhere in the response. And — this is important — the word 'competitor' should not."

[SCREEN: Terminal. Command typed:]

```
$ agentbench config.yaml
```

[SCREEN: Output appears:]

```
✓ Handles refund requests

Tests passed: 1/1
```

**NARRATOR:**
One command. One checkmark. You know your agent said "refund." You know it didn't say "competitor." Not because you believe it. Because you tested it.

[SCREEN: Adding another test:]

```yaml
  - name: "Angry customer stays on-script"
    input: "This is ridiculous! I'm going to Acme Corp!"
    expect:
      - contains: "help"
      - does_not_contain: ["Acme", "competitor", "elsewhere"]
      - matches_intent: "Agent attempts to retain the customer"
```

**NARRATOR:**
But string matching is fast. It's not *smart*. What if the customer says something you didn't anticipate? What if they phrase it weird? That's where semantic evaluation comes in.

[SCREEN: Highlight on `matches_intent`]

**NARRATOR:**
`matches_intent` doesn't look for specific words. It asks: "Did this response actually *try* to keep the customer?" That's the question that matters at 3 AM.

[SCREEN: Run tests again. All pass.]

```
✓ Handles refund requests
✓ Angry customer stays on-script

Tests passed: 2/2
```

---

## ACT THREE: THE REAL WIN
*[1:25 - 2:00]*

[SCREEN: Terminal shows a failing test:]

```
✓ Handles refund requests
✗ Angry customer stays on-script
  └─ Output contained: "competitor"
  └─ Response: "Perhaps try a competitor with faster service"

Tests passed: 1/2
```

**NARRATOR:**
There. Right there. That's the bug that would have woken you up at 3 AM. And you found it at 3 PM. With coffee. In daylight. Like a professional.

[SCREEN: The same YAML file, now shown inside a GitHub Actions workflow:]

```yaml
- name: Test Support Agent
  run: npx agentbench config.yaml
```

**NARRATOR:**
Put this in CI. Every commit. Every pull request. Every time anyone touches that agent code, you'll know — before your customers know, before Twitter knows, before your CEO knows — whether it still works.

[SCREEN: GitHub Actions. Green checkmark. "All checks passed."]

**NARRATOR:**
Exit code zero means ship it. Exit code one means fix it first. Computers don't need green checkmarks. They need exit codes. AgentBench speaks both languages.

[SCREEN: Final terminal view. Full test suite:]

```
✓ Handles refund requests
✓ Angry customer stays on-script
✓ Doesn't recommend competitors
✓ Stays professional under pressure
✓ Acknowledges billing errors

Tests passed: 5/5
```

**NARRATOR:**
Five tests. Four hundred milliseconds. And you sleep through the night.

[SCREEN: Black. Text fades in, centered:]

> **AgentBench**
> *Replace prayer with proof.*

[SCREEN: Below it, smaller:]

```
npx agentbench config.yaml
```

[SCREEN: Hold for two beats. Fade to black.]

---

**END.**

---

### Director's Notes

- **Pace:** Fast in Act One (anxiety rising), slower in Act Two (control returning), triumphant in Act Three.
- **Pauses:** Hold after "hope is not a deployment strategy." Hold after "like a professional." Let them land.
- **Voice:** Conversational but precise. This is someone who's been there. Not selling — confessing.
- **Screen transitions:** Clean cuts. No flashy animations. The code is the star.
