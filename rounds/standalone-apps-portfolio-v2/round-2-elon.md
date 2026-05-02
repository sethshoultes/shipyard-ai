# Round 2: Rebuttal — Standalone Apps Portfolio v2

## Where Steve's Aesthetic Is Shipping Debt

Steve wants a gallery. He wants matte paper, whispered copy, and SCAFFOLD badges that prove we're "relentless." That's not honesty — it's **curated vulnerability**, and it costs exactly the same to ship as a real entry. A SCAFFOLD badge on `/work` is still a billboard for unfinished code. If the goal is proof, the proof is the deployed app, not the badge. Radical credibility means *not showing the scars on the showroom floor*. If it isn't demo-able, it doesn't get real estate. Full stop.

Steve's emotional hook says "trust is the only emotion that matters." Correct in intent, wrong in execution. Trust is earned by shipping working code, not by designing a badge system for incomplete projects. You don't build trust with transparency theater; you build it by only showing what works.

"No search, no filters" is beautiful at three apps and broken at thirty. Steve is designing a diorama, not a system. A system that can't grow is a toy, and toys don't ship. When we hit app #25, visitors will curse the gallery. Restraint is not a feature; it's a coping mechanism for not having scaling logic. You don't architect for three entries unless you plan to stay at three forever.

And the naming sermon — "Commandbar is a description of a UI element" — is pure bikeshedding. This page has no organic distribution. Nobody is arriving because the name is musical. Ship the tool, fix the name in a follow-up commit, and move on. Perfect names are luxury goods for products that already have users. Unshipped beautiful names are just vanity plates on cars that don't run.

Steve also says "perfect before the next four." Perfect is a trap. Demo-able is the standard. If it runs and the description is honest, it ships. Polish is asymptotic; shipping is binary. You can always push a prettier commit tomorrow, but you cannot iterate on something that never lands.

## Why Technical Simplicity Wins in the Long Run

I said cut the meta-files, and I meant it. Every `spec.md` and `MIGRATION.md` is a human handoff queue disguised as diligence. Static exports don't need process documentation — they need source files. The long-run win is pipeline velocity: if an agent can't write directly into `website/src/`, we haven't automated anything. We've just emailed ourselves typesetting jobs.

Hand-curated `portfolio.ts` is also a bug at scale. Today it's three entries; tomorrow it's thirty; next quarter it's stale because nobody updates the taglines. The durable system scrapes `package.json` + `README.md` and generates the array. Humans edit code, not data tables. Anything that requires a gardener will eventually become a weed patch. Automation is how you keep 300 apps honest.

At 300 apps, build time matters. `generateStaticParams` with 300 slugs is fine, but the data source must be machine-readable. A script that walks the monorepo and builds `portfolio.ts` at build time is the only architecture that survives. Anything else is technical debt with a tasteful font.

The portfolio page is not the product. It is a side effect of the product. You don't engineer side effects; you generate them. Every hour spent debating card elevation is an hour not spent making the apps worth displaying.

## Where Steve Is Right

Taste is not optional in the *rendered output*. No gradients, no pulses, no "AI-powered" copy. The HTML should load in 50ms and read like a technical spec. Steve is absolutely right that the work speaks — so our job is to get out of the way. I concede the gallery wall, but only because white space is cheaper to ship than gradients, and clean typography requires zero dependencies. Taste here is just the absence of bad decisions.

Steve's instinct to frame the work rather than decorate it is exactly right. The frame should be invisible.

Steve's rule of "no coming soon" is also correct. Honest status is non-negotiable. I just take it one step further: honest status means deleting the entry from the public page, not labeling it with a prettier word. SCAFFOLD is "coming soon" in a black turtleneck.

I also concede that one-word names are better than two, and two are better than three. But the ranking of name quality is irrelevant until the name appears in a URL that someone actually visits.

## Top 3 Non-Negotiables

1. **Zero SCAFFOLD entries on `/work`**. Unshipped apps live in the repo, not on the page. Three strong entries or an empty page. Weak entries dilute credibility faster than strong ones build it.
2. **Data generated, not gardened**. The portfolio array builds from source repos via script, not human curation. No hand-edited TypeScript lists. Scale demands automation, and honesty demands that descriptions stay in sync with the code.
3. **Three files, no meta-work**. Deliver `portfolio.ts`, the page component, and one test. Kill `spec.md`, `todo.md`, and `MIGRATION.md`. If the pipeline needs them, the pipeline is broken, not the product.

Ship the three. Delete the theater. Move on.
