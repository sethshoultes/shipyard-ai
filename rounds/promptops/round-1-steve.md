# Steve Jobs — Design & Brand Vision for PromptOps

## Product Naming: Call It **Drift**

"PromptOps" is a term of art. It describes the category, not the feeling. Nobody ever fell in love with a category.

**Drift**. One syllable. It evokes version control—prompts *drift* over time, and you need to track that drift. It's memorable. It's ownable. When developers say "just Drift it," you've won.

The CLI becomes `drift push`, `drift rollback`. That's poetry compared to `promptops push`.

---

## Design Philosophy: The Unix Way Meets the Apple Way

This product must feel *inevitable*. Like it was always supposed to exist.

The Unix philosophy: do one thing well. The Apple philosophy: make that one thing disappear into pure intent.

Every interaction should have *zero* cognitive load. When a developer types `drift push`, the system should know what they mean without flags, without configuration, without thinking. Sensible defaults aren't a feature—they're the product.

The proxy is invisible. You point at it. It works. You forget it exists. That's the highest compliment.

---

## First 30 Seconds: The Aha Moment

Here's what happens:

1. `npm install -g drift` — 3 seconds
2. `drift init` — Prints an API key, nothing else
3. They change one line in their app: the API endpoint
4. They push a prompt
5. **They change the prompt in the dashboard and their app changes. No redeploy.**

That fifth moment is the lightning bolt. That's when they *get it*. The first time they tweak a prompt and see it live—without touching their code, without a deploy pipeline, without waiting—that's when this stops being a tool and starts being freedom.

Make that moment happen in under two minutes.

---

## Brand Voice: Confident, Not Clever

The voice is a senior engineer who respects your time.

- Not: "We're revolutionizing the prompt management space!"
- Yes: "Version your prompts. Deploy instantly. Rollback in one command."

Short sentences. Active voice. No adjectives unless they add information.

The README should be 50 lines or less. If you need a tutorial, the UX has failed.

---

## What to Say NO To

I'm killing these before they metastasize:

- **Prompt templates and variables.** Not our problem. Users have templating libraries. We store and serve text—that's it.
- **Analytics dashboards with 47 metrics.** Show version history. Show what's active. Show one "rollback" button. Done.
- **SDK wrappers for every language.** HTTP headers are the SDK. Every language already speaks HTTP.
- **Team collaboration features at launch.** One developer, one project, one API key. Solve *that* perfectly first.
- **Any UI that requires a walkthrough.** If we need to explain it, we've built the wrong thing.

Simplicity is not the absence of features. It's the presence of clarity.

---

## The Emotional Hook: Control Over Chaos

Here's the dirty secret of AI development: prompts are the soul of the product, and teams treat them like scratch notes.

A developer's deepest fear? Shipping a prompt change that breaks production, with no way back. They've all done it. They've all felt that 3am panic.

**Drift is the undo button for AI.**

One command. Instant rollback. Sleep through the night.

That's not a feature list. That's peace of mind. People will love this because it removes fear from their workflow. It turns prompt deployment from a gamble into a system.

When you remove fear, you unlock creativity. Developers will *experiment* more because they know they can always go back. That's the real magic—not the tool, but what the tool makes possible.

---

*Ship it. Ship it clean. Ship it now.*
