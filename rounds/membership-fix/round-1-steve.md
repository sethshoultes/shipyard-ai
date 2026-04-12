# Steve Jobs — Chief Design & Brand Officer
## Round 1 Positions: MemberShip Plugin Fix

---

### Product Naming

**MemberShip** is terrible. Two capital letters fighting each other in the middle of a word? It looks like a typo. It sounds like a boat club newsletter.

Call it **Belong**.

One word. A verb. An emotion. When someone joins your membership site, they don't want "membership" — they want to *belong*. The name should capture what we're selling: identity, community, access. Not paperwork.

---

### Design Philosophy

Here's what makes this insanely great: **the plugin disappears**.

The current codebase has 114 instances of `throw new Response` — that's 114 places where the developer is *fighting* the platform instead of *flowing* with it. Great design means the creator never thinks about the plumbing. They think about their members, their content, their community.

The philosophy is simple: **eliminate friction, not features**. The business logic is correct — JWT auth, Stripe billing, drip content, webhooks — that's the orchestra. But right now they're all playing in different keys because someone wrote against an imaginary API.

When we fix this, the plugin should feel *inevitable*. Like it was always meant to work this way.

---

### User Experience — The First 30 Seconds

An admin installs Belong, clicks "Manage Members" in their dashboard.

What happens? **Clarity in three glances**:
1. How many members do I have? (Number, big and bold)
2. What plans exist? (Names, prices, one line each)
3. What can I do right now? (Two buttons, not twelve)

No loading spinners. No error modals. No "double-encoded JSON strings" leaking into the UI like a broken sewer pipe.

The member's first 30 seconds? Even simpler. Email. Plan. Done. Welcome email arrives before they close the tab. They feel *recognized*, not processed.

---

### Brand Voice

**Confident, not clever. Warm, not corporate.**

Bad: "Your membership registration has been successfully processed."
Good: "You're in. Welcome to the community."

Bad: "Error: Invalid email format detected."
Good: "That email doesn't look right. Mind checking it?"

This plugin handles money and identity — two deeply personal things. The voice should feel like a trusted concierge, not a government form.

---

### What to Say NO To

**Say NO to defensive coding patterns.** Those 14 `rc.user` checks? Delete them. Emdash already handles auth. Trust the platform. Every redundant check is cognitive debt for the next developer.

**Say NO to JSON.stringify everywhere.** It's a nervous habit, like bubble wrap. The KV layer auto-serializes. When you wrap it again, you create bugs that look like demons: double-encoded strings, deserialization nightmares, hours lost debugging ghosts.

**Say NO to error verbosity.** `throw new Response(JSON.stringify({ error: "..." }), { status: 400, headers: { "Content-Type": "application/json" } })` — that's 150 characters to say "bad request." Replace it with `throw new Error("...")` and move on.

Simplicity is **subtraction**, not addition.

---

### The Emotional Hook

Here's why people will *love* this:

**Creators don't want to manage memberships. They want to build communities.**

A yoga instructor doesn't dream about Stripe webhooks. She dreams about her 6am class feeling like family. A newsletter writer doesn't obsess over drip content timing. He wants his readers to feel seen.

When Belong works — silently, invisibly, perfectly — it gives creators back their *attention*. And attention is the scarcest resource on Earth.

The hook isn't features. It's freedom.

---

*"Design is not just what it looks like and feels like. Design is how it works."*

This plugin has good bones. The business logic is sound. What's broken is the *interface* between intention and execution — 228 pattern violations standing between a creator and their community.

Fix them. Ship it. Let creators belong to their work again.
