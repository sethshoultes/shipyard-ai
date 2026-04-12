# Round 2: Steve Jobs

---

## Where Elon Is Optimizing for the Wrong Metric

**"Weekend project" is the wrong goal.** Elon wants to ship fast—I respect that. But he's optimizing for *time to first commit* when he should optimize for *time to first love*. A working CLI that nobody remembers is worse than shipping a week later with something people can't stop talking about.

**Cutting confidence scores is a mistake.** Elon says "pass/fail is what matters." Wrong. LLM outputs aren't binary—they're probabilistic. A test that passes with 51% confidence is qualitatively different from one that passes with 98%. Hiding this information doesn't make it go away; it just makes developers blind to risk. Confidence isn't vanity. It's honesty about the nature of what we're testing.

**"Copy-paste from README works fine."** This is the engineer's trap—assuming everyone is you. The developer who copies from a README is already bought in. The developer who types `npm init proof` and gets a working example in 10 seconds? That's someone who didn't even know they wanted this. First impressions compound. The scaffolding isn't for power users. It's for converting skeptics.

**GitHub Action in week 1 is premature.** Elon wants CI integration immediately. But CI amplifies whatever you've built—including your mistakes. Get the local experience perfect first. When developers *demand* CI integration, you've earned the right to build it.

---

## Why Design Quality Matters HERE

Elon would attack the name change as bikeshedding. Here's why he's wrong:

AI testing is a **new category**. There's no established player. The name isn't decoration—it's positioning. "AgentBench" sounds like one of twelve tools. "Proof" sounds like *the* answer. In a crowded market, you fight for attention. In an empty market, you define the category. We're in the second situation. The name is strategy.

The 30-second experience isn't polish—it's the product. If someone abandons Proof in the first minute, nothing else matters. Not your parallel execution, not your batched LLM calls, not your GitHub Action. Design isn't what happens after engineering. Design is what makes engineering matter.

---

## Where Elon Is Right

**Parallel execution is table stakes.** I was wrong to defer this. Sequential LLM calls at 1s each is a non-starter. Concede.

**HTTP + subprocess covers 99% of cases.** The SDK adapter is over-engineering. Cut it.

**Local-first is correct.** No hosted evaluation API. Stay on-machine. Privacy is a moat and a business model.

**Watch mode is vanity.** Nobody watches agent tests. They run before deploy. Cut.

---

## My 3 Non-Negotiables

1. **The name is Proof.** This is the hill. `npx proof` is what developers will type. The brand compounds from here.

2. **First run requires zero API keys.** Ship with string matching that works immediately. LLM evaluation is opt-in when you need semantic judgment. The first experience must feel free, fast, and magical.

3. **Confidence scores ship in v1.** Pass/fail with a confidence percentage. Not hidden. Not "later." Developers deserve to know how certain the evaluation is. This is what makes Proof honest, not just functional.

---

*Iteration is overrated. Getting it right is underrated.*
