# Steve Jobs — Chief Design & Brand Officer
## Issue #74: EventDash Entrypoint Fix

---

## Product Naming

**EventDash** — It's perfect. One word. It MOVES. You hear it and you know: events, fast, now. Keep it.

But "entrypoint"? That's engineer-speak. Internally, call it what it is: **The Gateway**. Every plugin has one gateway. One path in. Simplicity.

---

## Design Philosophy: What Makes This Insanely Great?

**Consistency is the soul of craft.**

This isn't about fixing a bug. This is about creating a **pattern language** that every developer can trust. When you open Membership, you see file paths. When you open EventDash, you should see the SAME pattern. Not npm aliases. Not clever abstractions. Just: "Here's where the code lives."

The Membership plugin already nailed this. We're not inventing — we're **aligning**. That's design discipline.

---

## User Experience: The First 30 Seconds

A developer clones Shipyard. They open `plugins/eventdash/src/index.ts`. They see:

```typescript
const entrypointPath = join(currentDir, "sandbox-entry.ts");
```

**Instant clarity.** No magic. No confusion. They understand in 3 seconds what would take 30 minutes to debug on Cloudflare Workers.

That's the difference between frustration and flow. We're designing for **cognitive ease**.

---

## Brand Voice: How This Product Speaks

**"It just works."**

Shipyard doesn't apologize for complexity. It ELIMINATES it. Our plugins don't ask you to configure package.json, npm aliases, or bundler hacks. They say: "This file. Right here. Done."

Our voice is **confident silence**. When something works perfectly, you don't notice it. That's the highest compliment.

---

## What to Say NO To

**Say NO to:**
- npm aliases in entrypoints (they lie about where code lives)
- "It works locally" as a success metric (Cloudflare is reality)
- One-off solutions (if Membership solved it, EventDash copies it)
- Clever code (clarity beats cleverness every single time)

**Simplicity means removing.** We're not adding a feature. We're removing a point of failure.

---

## The Emotional Hook: Why Will People LOVE This?

Because **it doesn't break**.

Developers will deploy to Cloudflare Workers and their EventDash plugin will just... work. No 3am debugging. No "works on my machine" shame. No Stack Overflow rabbit holes.

They'll feel what we felt when the first iPhone woke up from sleep instantly: **"Wait, that's it? It just... works?"**

That shock of simplicity — THAT is the hook.

This isn't a bug fix. This is a **trust moment**.

---

## The Standard

From now on, EVERY plugin in Shipyard uses file paths. Not aliases. Not shortcuts. We set the pattern. Others follow.

**Great design is obvious in hindsight.**

Let's make this obvious.
