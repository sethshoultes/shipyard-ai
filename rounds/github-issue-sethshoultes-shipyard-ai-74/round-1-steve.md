# Steve Jobs — Design & Brand Position
## Issue #74: EventDash Entrypoint Fix

---

## Product Naming
**EventDash is PERFECT.** One word. Kinetic. It evokes speed, movement, energy — exactly what event management should feel like. The dash is the sprint to make your event happen. Keep it.

## Design Philosophy: Invisible Infrastructure
This fix is about **trust**. When you flip a light switch, you don't think about the electrical grid. When you use EventDash, you shouldn't think about bundlers, npm aliases, or entrypoint resolution.

The plugin should work *everywhere*, *immediately*, *without explanation*. That's what "it just works" means. This bug violates our core design principle: **technology should disappear**.

## User Experience: The First 30 Seconds
A developer adds `eventdashPlugin()` to their config. They run build. **It works.** That's the entire experience. No error messages. No Stack Overflow searches. No "works locally but fails in production" nightmares.

The first 30 seconds should feel like *relief* — the relief of not having to fight your tools.

## Brand Voice
EventDash speaks with *confidence and clarity*. It doesn't apologize. It doesn't explain itself. It registers, it builds, it ships. The code is self-documenting. The paths are explicit. No magic strings. No clever abstractions that leak.

## What to Say NO To
**NO to npm aliases for unpublished packages.** This is architectural dishonesty — pretending something is published when it isn't. It's a lie that creates fragility.

**NO to "it works in dev."** Dev is not production. If it doesn't work everywhere, it doesn't work.

**NO to following Membership's pattern "sort of."** Either copy the exact pattern that works, or have a damn good reason not to. Consistency is not the hobgoblin of small minds — it's the foundation of reliability.

## The Emotional Hook
Developers will LOVE EventDash because **it respects their time**.

Every minute spent debugging bundler configuration is a minute stolen from building something meaningful. This fix is about giving that time back. It's about treating developers like they deserve tools that work, not puzzles to solve.

When EventDash just works — in local dev, in Cloudflare Workers, in every environment — developers feel *powerful*. They feel like they can build anything. That's the emotional promise: **we handle the infrastructure so you can focus on your craft**.

## The Standard We're Setting
This isn't just a bug fix. It's a statement about what quality means at Great Minds Agency. Quality means file paths that resolve. Quality means builds that succeed. Quality means keeping promises.

If we ship EventDash with this bug, we're telling users: "Close enough." And close enough is the enemy of great.

**Fix the entrypoint. Use file paths. Ship something that works. That's the job.**

---

*"Real artists ship." — But they ship things that work.*
