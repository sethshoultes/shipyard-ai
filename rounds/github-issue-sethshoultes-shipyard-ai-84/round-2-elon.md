# Round 2: Elon — Poster Child

## Where Steve Is Wrong

**"Poster" is unsearchable.** Try Googling "Poster GitHub." You get GitHub's own poster projects. A name must be memorable *and* discoverable. "Poster Child" is distinctive. "Poster" is a commodity word. One-word naming is fashion, not physics.

**"One inevitable layout" is perfectionism with better branding.** You can't know what's inevitable until 1,000 repos have rendered through it. Steve wants to spend a week on white space before a single user sees the product. That's how you ship nothing. One template for v1 is correct — but call it what it is: a shipping constraint, not divine taste.

**"PNG only, because JPG is for amateurs" is user-hostile snobbery.** If a platform compresses PNGs poorly, we lose. The output is a utility. Form follows function.

**Color extraction from repo DNA:** Fragile, expensive, and often ugly. What if the dominant color is `#CCCCCC`? Now every Rails repo looks like a hospital wall. A curated palette with 12 presets beats an algorithm that guesses.

## Where Simplicity Wins

Statelessness compounds. Every database you add is a team member you didn't hire who wakes you up at 3am. A read-only, cache-first Worker with R2 is a machine that sleeps while you sleep.

Cutting Claude isn't anti-AI — it's pro-physics. Three seconds of latency kills sharing. `repo.description` exists. Use it. If the description is bad, the poster reflects reality. We don't need to hallucinate a better tagline.

The output-as-distribution strategy scales without ad spend. Shields.io didn't grow because of Product Hunt. It grew because every README became a billboard. That's gravitational pull, not marketing spend.

## Where Steve Is Right

The template we ship must be *excellent.* Not good. Excellent. Typography, spacing, hierarchy — these are the 30-second moment. One perfect render beats five mediocre ones. I'm conceding taste, not process.

And the emotional hook is real. Developers do judge books by covers. The poster must feel like respect. But respect requires the image to *load instantly* and *render reliably.* A beautiful 6-second failure is still a failure.

## Non-Negotiables

1. **No Claude in v1.** Use `repo.description`. Ship in days, not weeks.
2. **No database. No auth. No state.** Cache-first, R2-backed, sleep-at-night architecture.
3. **One template at launch.** Not because it's "inevitable" — because two templates means a choice, a build step, and a maintenance tax we pay before we have users.

Ship the tool. Let the users tell us what's beautiful.
