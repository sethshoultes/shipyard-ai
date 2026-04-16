# Steve Jobs — Product Vision for WorkerKit

## Product Naming

The name is **wrong**. "WorkerKit" sounds like a toolbox you buy at Home Depot. It's forgettable. It's utilitarian. It doesn't make you feel anything.

We need **one word**. Something that captures the magic of going from zero to shipped in 60 seconds.

**My pick: SPARK**

Why? Because that's what this does — it sparks your idea into reality. A spark is fast, electric, the moment potential becomes kinetic. When developers say "I used Spark," they're not talking about scaffolding — they're talking about *ignition*.

## Design Philosophy

This isn't a CLI tool. It's a **time machine**.

Every great product removes friction between thought and reality. The iPhone removed the friction between "I wonder" and "I know." Spark removes the friction between "I have an idea" and "It's deployed."

**The philosophy:** Zero decisions until you're creating value.

No configuration files to edit. No documentation to read. No "getting started" guides. You run one command, answer five questions in plain English, and you're writing your product's actual code. Everything else — auth, databases, AI, payments — is already wired and working.

That's what makes it insanely great: **it respects your time like it's sacred**.

## User Experience — The First 30 Seconds

You type `npx spark my-app` and hit enter.

The terminal comes alive. Five questions, conversational, like a friend who knows what you need:
- "What are you building?" (Minimal / API / Full-stack)
- "Need user accounts?" (Clerk / Simple / Nope)
- "Need AI?" (Smart + fast / Fast only / Nope)
- "Need payments?" (Stripe / Nope)
- "Need a database?" (Edge SQL / Nope)

You answer in 10 seconds. Then you watch it build.

Not silent progress bars — *human feedback*. "Wiring authentication..." "Connecting AI..." "Configuring payments..."

**30 seconds later:** "Done. Run `npm run dev` to start building."

You feel **powerful**. Not overwhelmed. Not confused. *Powerful*.

## Brand Voice

Spark speaks like a **craftsman who respects craft**.

Not corporate. Not cutesy. Not trying to be your buddy. Confident, precise, and warm.

**Wrong:** "🎉 Yay! Your project is ready! Let's goooo! 🚀"
**Right:** "Done. Your app is running at localhost:8787. Ship something great."

**Wrong:** "ERROR: Missing API key in configuration file."
**Right:** "Add your Clerk API key to .env and we'll handle the rest."

The voice says: *I know what I'm doing. Trust me, and let's build.*

## What to Say NO To

1. **NO to customization during setup.** No "Choose your router: Hono / Express / Fastify." We picked Hono. It's the right choice. Move on.

2. **NO to templates.** No "Choose your UI framework: React / Vue / Svelte." That's not scaffolding, that's decision paralysis. Ship ONE opinionated template. Let them rip it out later if they want.

3. **NO to plugins.** The moment you add a plugin system, you've lost. You're building WordPress. We're building the iPhone.

4. **NO to config files.** If someone needs to edit `wrangler.toml` or `tsconfig.json`, we failed.

5. **NO to "optional features."** Either it's essential and we include it, or it's noise and we delete it.

**Simplicity is not minimalism. It's ruthless focus.**

## The Emotional Hook

People don't love tools. They love **what tools let them become**.

Spark makes you feel like a 10x engineer. You go from idea to deployed app in the time it takes to make coffee. You skip the boring stuff — the plumbing, the boilerplate, the "infrastructure work" — and go straight to the part that matters: building your product.

**The hook is this:** Momentum.

Every project dies in the setup phase. The excitement of the idea gets crushed under the weight of configuration. Spark gives you *momentum*. You're shipping features on day one. You're deploying to production before lunch. You feel unstoppable.

That's why people will love it. Not because it's clever. Because it makes *them* feel clever.

---

**Bottom line:** Rename it Spark. Ship one perfect template. Make the first 30 seconds feel like magic. Then get out of the way and let people build the future.

That's what insanely great looks like.
