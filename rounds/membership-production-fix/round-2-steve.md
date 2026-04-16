# Steve Jobs — Round 2: Where Elon's Wrong (and Right)

## Challenging Elon: You're Optimizing for the Wrong Metric

Elon, you're measuring in **minutes to fix**, I'm measuring in **years of developer pain**.

Yes, changing `"@shipyard/membership/sandbox"` to `"./plugins/membership/dist/sandbox-entry.js"` is a 5-minute fix. **But it's the WRONG fix.**

You're treating the symptom. I'm treating the disease.

The disease is: **developers shouldn't know these paths exist.** They shouldn't debug npm aliases vs file paths vs monorepo workspace resolution. That's implementation detail bleeding through a broken abstraction.

Your "1-line fix" creates a precedent: when plugins break, developers dive into build configs and trace file paths. That's not 5 minutes—that's 5 hours times 100 future developers times 10 future plugins.

**You're optimizing for speed. I'm optimizing for never having to fix this again.**

## Where Elon's Right: I Concede

You're right about three things:

1. **The PRD is bloated.** 124 lines for "make the plugin load" is absurd. I fell into the trap of documenting the mess instead of demanding we clean it up.

2. **"Read all the docs" is theater.** If you need to read EMDASH-GUIDE.md section 6 to register a plugin, the plugin system failed. Documentation is an apology.

3. **Distribution skepticism.** Fixing this doesn't unlock viral growth. I got seduced by infrastructure elegance when we should be asking: does this plugin drive revenue? If not, cut it entirely.

**You're ruthlessly focused on what moves the needle. I respect that.**

## Defending Design Quality: Why It Matters HERE

But here's where you're wrong about speed vs quality:

**This isn't a one-off bug. It's a system design flaw.**

If we ship your "fix the entrypoint path" solution, what happens when:
- Developer adds a second plugin?
- That plugin has different entrypoint conventions?
- They need to debug why `@org/plugin/entry` works but `../plugin/dist/entry.js` doesn't?

Now they're comparing 3 examples, reading guides, tracing build configs. **Your 5-minute fix became a 5-hour debugging spiral.**

The right fix: **Make entrypoints convention-based, not configuration-based.**

```typescript
// Instead of:
plugins: [{
  type: "standard",
  entrypoint: "@shipyard/membership/sandbox", // ← mystery path
  workerLoader: "esm"
}]

// Just:
plugins: ["membership"] // ← it finds the entrypoint itself
```

The build system should know: "membership plugin? Look in `plugins/membership/sandbox.ts`. Build it. Bundle it. Done."

**This is 30 minutes of design work that eliminates 1000 hours of future debugging.**

That's not gold-plating. That's leverage.

## Top 3 Non-Negotiables

I'm locking these three principles:

### 1. **Zero-Config Plugin Registration**
Developers add `plugins: ["membership"]` to their config. The system handles entrypoint resolution, worker loaders, bundling, everything. No paths. No manual configuration.

**Why:** Every configuration knob is a future support ticket. Convention over configuration.

### 2. **Self-Verifying Deploys**
The build fails LOUDLY if the plugin won't work in production. No silent failures. No "curl the manifest to check." Build-time validation catches broken plugins before they deploy.

**Why:** Debugging production is 10x costlier than catching it at build time. Fast feedback loops.

### 3. **One Canonical Example**
There's ONE reference implementation. Not three sites with different patterns. Not "compare with other examples." ONE way that works, documented in 5 lines.

**Why:** Multiple examples fragment knowledge. Developers cargo-cult the wrong pattern and waste hours.

## The Synthesis: Speed AND Quality

Elon, you're right that 124-line PRDs are waste. But I'm right that quick fixes create slow systems.

**Here's the compromise:**

- **Your speed:** Fix the immediate issue in 10 minutes—hardcode the path if needed.
- **My quality:** Spend the next 30 minutes making entrypoints convention-based so this never happens again.

40 minutes total. One session. But we solve it once instead of 100 times.

**That's insanely great engineering: fast to ship, impossible to break.**

---

**Bottom line:** I'm not arguing for perfection. I'm arguing for *systems thinking*. Fix the root cause, not the symptom. Build it so it never breaks again. That's not slow—it's the fastest path to never touching this code again.
