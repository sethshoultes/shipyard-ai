# Steve Jobs — Chief Design & Brand Officer
## Round 1 Position on Plugin System Completion

---

### Product Naming

**"Emdash"** — already perfect. It's a punctuation mark that connects ideas without interruption. That's exactly what a plugin system does. One word. Memorable. Literate. Keep it.

The plugins themselves? MemberShip, ReviewPulse, SEODash, FormForge, CommerceKit, EventDash. These names are *mediocre*. They smell like a committee. "Dash" appearing twice is lazy. "Kit" and "Forge" are developer jargon that means nothing to a business owner.

If I had my way: **Rolls, Stars, Rank, Forms, Shop, Events.** Simple nouns. Things you can touch. A yoga studio owner doesn't want "MemberShip" — they want to know who's in their Rolls.

---

### Design Philosophy

The philosophy here is correct but the execution is timid: **plugins should be invisible until needed.**

A great plugin system is like electricity in a building. You don't think about wiring — you flip a switch and the lights come on. These plugins have 4,000 lines of code throwing custom Response objects like they're building their own framework. That's not a plugin. That's a parasite competing with its host.

The real insight in this PRD? "Emdash handles auth." Yes! The plugin doesn't need to know who's logged in any more than a lightbulb needs to know about the power grid. **Defer everything you can. Own only what you must.**

---

### User Experience — The First 30 Seconds

Right now? A developer installs a plugin and hits a wall of cryptic errors. `.map() is not a function`. That's not an experience — it's a rejection.

The first 30 seconds should feel like plugging in a USB cable. Click. It works. The admin page loads instantly. The blocks appear. No configuration screens. No setup wizards. **Working is the default state.**

---

### Brand Voice

Emdash should speak with the confidence of someone who's already solved your problem. Not "Configure your membership settings" — that's asking for work. Instead: "Your members are ready. Here's how they're doing."

Every message should assume success. Every error should offer a single clear action. **Never explain the system. Explain the outcome.**

---

### What to Say NO To

This PRD lists six plugins. That's five too many for launch. Ship EventDash — it's the reference, it's closest to working, and events are what small businesses actually do every week.

Say no to:
- **Multiple response formats** — one format, enforce it
- **Plugin-level authentication** — the platform handles it, period
- **Manual JSON serialization** — if developers are calling `JSON.stringify`, your API failed them
- **Graceful degradation** — either the plugin works or it doesn't exist yet

The banned patterns list exists because someone said yes to complexity. Every "throw new Response" was a developer working around a limitation that shouldn't exist.

---

### The Emotional Hook

Small business owners are drowning in software that demands their attention. Every dashboard wants a login. Every tool wants configuration. Every plugin wants maintenance.

The emotional hook is **relief**. "I installed this, and it just... works. It knows my members. It knows my events. It doesn't ask me questions — it gives me answers."

People won't love this because it's powerful. They'll love it because it *disappears*. The best tools don't demand mastery. They grant capability. That's insanely great.

---

**Ship one perfect plugin. Let it prove the architecture. Then, and only then, fix the rest.**
