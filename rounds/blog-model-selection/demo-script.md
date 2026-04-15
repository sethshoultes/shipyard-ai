# Demo Script: Model Selection for Multi-Agent Pipelines

**NARRATOR:**
You just shipped a plugin. It compiled. Types checked. You felt good.

[SCREEN: Terminal showing successful build]

**NARRATOR:**
Then production happened.

[SCREEN: Error logs flooding in - "Response is not defined", "KV.put is not a function", "handler.auth is not a method"]

**NARRATOR:**
Your AI hallucinated APIs that don't exist. A hundred of them.

[SCREEN: Diff view showing Haiku-generated code with highlighted fake API calls]

**NARRATOR:**
Four fix cycles later—two hours of your life you won't get back—you realize the problem wasn't the code. It was the model.

[SCREEN: Cost breakdown appears]

```
Haiku build:    $0.50 (fast, cheap, wrong)
Fix cycle 1:    $0.50
Fix cycle 2:    $0.50
Fix cycle 3:    $0.50
Fix cycle 4:    $0.50
Your time:      $200 (2 hours debugging)
────────────────────────
Total damage:   $202.50
```

**NARRATOR:**
Here's what nobody tells you: different phases need different brains.

[SCREEN: Split-screen showing four agent configs side by side]

**NARRATOR:**
Planning? That's architecture. Use Sonnet. Wrong abstractions compound.

[SCREEN: Zoom into plan agent config - `model: 'sonnet'`]

**NARRATOR:**
Building? That's code generation. Use Sonnet. API hallucinations cascade.

[SCREEN: Zoom into build agent config - `model: 'sonnet'`]

**NARRATOR:**
Reviewing? That's pattern matching. Use Haiku. Finding `throw new Response` doesn't require genius.

[SCREEN: Zoom into review agent config - `model: 'haiku'`, instruction starts with "TERSE:"]

**NARRATOR:**
One more thing—that TERSE prefix?

[SCREEN: Side-by-side comparison of verbose vs TERSE review output]

```
VERBOSE (3200 tokens):
"I found a violation on line 47 where you use
throw new Response(). This is incorrect because..."

TERSE (800 tokens):
sandbox-entry.ts:47:throw_response
sandbox-entry.ts:121:throw_response
```

**NARRATOR:**
Seventy-five percent token savings. Same information. Four times cheaper.

[SCREEN: Return to full pipeline view with all four agents]

**NARRATOR:**
Change one parameter. Ship the phase. Watch what happens.

[SCREEN: New build running with Sonnet - progress bars moving]

**NARRATOR:**
Zero hallucinations. One pass. Fifteen minutes.

[SCREEN: Clean build output, green checkmarks, deployment successful]

**NARRATOR:**
Thirteen dollars per plugin instead of two hundred.

[SCREEN: Final cost comparison - before/after bars]

```
BEFORE: $207.50 per plugin (with fix cycles + your time)
AFTER:  $13.50 per plugin

93% cost reduction
```

**NARRATOR:**
The seven-plugin build that took fourteen hours? Ninety minutes.

[SCREEN: Time comparison visualization - 14 hours collapsed into 90 minutes]

**NARRATOR:**
You already have the tools. The Claude Agent SDK. The model parameter. The TERSE format.

[SCREEN: Simple code snippet]

```typescript
const buildAgent = new Agent({
  model: 'sonnet',  // ← This line changed everything
  name: 'build',
});
```

**NARRATOR:**
Stop using one LLM for everything. Match models to cognitive load.

[SCREEN: Final principle on black background]

**Creation requires precision.
Validation requires speed.**

**NARRATOR:**
Build something.

[SCREEN: Fade to Shipyard AI logo]
