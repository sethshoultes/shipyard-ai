# Steve Jobs — Product Vision: MemberShip Production Fix

## The Name: NO.

"MemberShip Production Fix" is not a product. It's a bug report dressed up as a PRD. This is infrastructure plumbing. You don't name the pipes in your house.

If we're shipping a **membership plugin system**, call it **Passport**. One word. Evocative. It grants access. It's personal. It travels with you.

## Design Philosophy: Invisible Infrastructure

The best infrastructure is invisible. When you flip a light switch, you don't think about the power grid. When this plugin loads, developers shouldn't think about entrypoints, worker loaders, or Cloudflare bindings.

This is insanely great when: **It just works. Period.**

No manifest debugging. No curl commands to verify deployment. If it builds, it ships. If it ships, it runs. The build system should make wrong things impossible and right things inevitable.

## User Experience: The First 30 Seconds

A developer adds `passport()` to their config. They deploy. **Done.**

Not: read EMDASH-GUIDE.md section 6. Not: compare three example configs. Not: fix entrypoints and worker loaders.

The first 30 seconds should feel like **magic**, not archaeology.

## Brand Voice: Confident, Not Apologetic

This system should say: "I've got this. Go build your app."

Not: "Please read the docs first. Check other examples. Verify with curl commands."

Documentation is an apology for bad design. If you need a 200-line guide to explain plugin registration, the abstraction failed.

## What to Say NO To

**NO** to exposing Cloudflare internals to developers. Worker loaders? That's implementation detail.

**NO** to manual verification steps. The deployment should verify itself or fail loudly.

**NO** to "compare with other sites" as a debugging strategy. There should be ONE way, and it should be obvious.

**NO** to npm package paths that don't resolve (`@shipyard/membership/sandbox`). Either publish it or use file paths. Don't pretend.

**NO** to separating "build-time" and "runtime" concepts in the developer's mental model. Make the distinction invisible.

## The Emotional Hook: Developer Joy

Why will people love this? Because **it respects their time.**

When you register a plugin and it works immediately — no debugging, no curl scripts, no reading docs — you feel powerful. You feel trusted. You feel like the system was built *for you*.

That's the bar. That's the only bar that matters.

Right now? This is a mess of implementation details leaking through broken abstractions. Fix the abstraction, and the bug fixes itself.

---

**Bottom line:** Stop fixing symptoms. Fix the design. Make plugin registration one line of code that never fails. Anything else is us admitting we built it wrong.
