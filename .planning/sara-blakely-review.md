# Sara Blakely Gut-Check — Phase 1 Plan

**Verdict**: Useful painkiller, dressed like enterprise software. Cut the fat.

---

## Would a Customer Pay?

No. Internal plumbing. Value is invisible — avoiding broken-site embarrassment. Nobody buys DNS checks; they buy saved launches. Sell the outcome (no 404s), not the mechanism.

## What's Confusing / Bounce-Worthy

- **"R-PROOF-009"**, **"waves"**, **"parallel-ready"** — jargon bloat. Screams consultant billing by the hour. Founder bounces at line one.
- **3 waves, 4 tasks, 14 requirements** — 50-line script wearing a NASA spec. Over-planning is procrastination.
- **"Parallel-ready architecture"** — one domain. Imaginary future problems. Ship for one, refactor when pain is real.
- **domains.json schema** — `expected_origin`, `routes` array. Customer cares: does my URL load my site? Not where it originates.
- **Risk Notes** — 5 risks for a DNS check. Risk #1: "CF-RAY header might change." Update the script. Move on.

## 30-Second Elevator Pitch

> After every deploy, we hit your real domain and confirm it loads your site. If DNS still points at Vercel, deploy fails in 2 seconds. No 404s. No Twitter tells you first.

## $0 Marketing Budget — Test This First

1. Break DNS on purpose. Point `shipyard.company` somewhere random.
2. Run the script.
3. Does it fail the deploy? Does the message make sense at 2am?

Only test that matters. Skip mock configs, actionlint, temp JSON files. Test reality.

## Retention Hook

Weak as-is. Green checks become wallpaper. Hook is fear + clarity.
Make failure messages loud, human, unforgettable. Add 3-bullet recovery checklist in output. Developer bookmarks it for next panic.

## What I'd Cut

- Wave 3 dry-run verification. Test against real broken domains, not simulations.
- `routes` array in domains.json. v1.1 doesn't exist.
- 140-character error limit. Just be clear. "Your domain isn't pointing here" works.
- The word "essence" as a requirement name.

## Bottom Line

Build script in an afternoon. Wire into workflow. Test on broken domain. Ship. Stop documenting.
