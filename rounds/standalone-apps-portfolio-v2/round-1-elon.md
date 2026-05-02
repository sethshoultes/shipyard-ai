# Elon — Round 1 Review: Standalone Apps Portfolio v2

## Architecture
Three apps, four pages total. Static export with `generateStaticParams` is still the only rational choice. The "self-contained deliverables" pattern is integration friction, not architecture. If the agent cannot write directly to `website/src/`, fix the agent, not the file path.

The simplest system that works: one `portfolio.ts` array, one section component for `/work`, one `[slug]/page.tsx` template. No database, no CMS, no API layer, no auth, no edge functions. Seven pages of text do not justify infrastructure. Complexity should be proportional to user value; this is an index page, not a platform. Reuse the existing card component verbatim; do not invent new UI.

## Performance
The bottleneck is build-time ceremony, not runtime. This PRD demands 7 files for ~200 lines of actual code—2.3 meta-files per app. `spec.md`, `todo.md`, and `MIGRATION.md` are process overhead masquerading as rigor. The `node --test` validation of static data the agent just wrote is a tautology; TypeScript already proves structure. Cut the cargo-cult tests.

The 10× path is elimination: fewer files, fewer instructions, fewer handoffs. Static HTML serves from a CDN infinitely. The only thing that can slow it down is the build pipeline itself. Every meta-document is a tax on cognitive bandwidth. If the build exceeds 30 seconds, audit package.json for parasites.

## Distribution
A portfolio of three apps has even less organic gravity than seven. Nobody bookmarks an agency work page. Nobody shares a portfolio on Twitter and says "look at this agency's work section." Distribution comes from the apps themselves—GitHub stars, HN Show HN, utility, word-of-mouth. The portfolio is residue. If you want 10,000 users, ship tools that solve problems, not pages that describe them. Generic "AI portfolio" keywords are worthless. The only SEO that matters is branded search.

## What to CUT
- **spec.md & todo.md**: The PRD already exists. A checklist to remind the agent to write files means the agent is broken, not the spec.
- **MIGRATION.md**: 10-minute human integration is fantasy. It takes 30 seconds. But the real cost is the queue: at 100 PRDs, you have 100 orphaned directories waiting for manual merge. This pattern manufactures stale code.
- **Live URL curl checks**: Making build success depend on GitHub's 200 responses is insanity. Rate limits and private repos will flake. A build gate should not fail because GitHub hiccuped.
- **Retrospective requirement**: I already cut this in v1. "Documentation is not shipping." Re-adding it is scope creep.
- **4 remaining apps**: Correctly deferred. Do not let follow-up anxiety inflate v2.
- **Lighthouse 95 theater**: 90 is fine. The last 5 points cost more than they convert on static text pages.
- **Feature bullet archaeology**: The PRD demands reading 3 source files per app. Correct in principle, but if the code is stubs, the honest output is "Not enough substance to describe." Do not send the agent on a snipe hunt through half-built repos.
- **SCAFFOLD entries on `/work`**: If an app has no detail page and no live demo, listing it is resume padding, not product. Cut it. Only shipped or demo-able tools get real estate.

## Technical Feasibility
Yes—one session can build this. The code is trivial: one data file, one section, one dynamic route, ~200 lines. The risk is the agent drowning in its own process instructions. Force the agent to read source (non-negotiable), but do not make it write four documents to prove it wrote three files. If the agent runs out of context reading repos, it will hallucinate bullets. Budget tokens accordingly.

The v1 failure mode was skipped Write calls, not complexity. Adding bureaucratic files treats the symptom; the root cause is agent behavior. This PRD is 80% process instructions, 20% product spec. Flip that ratio. The build should complete in under 30 seconds.

## Scaling
Traffic is irrelevant; HTML on a CDN is infinite. What breaks at 100× is the editorial pipeline—hand-curating TypeScript arrays does not scale. And the deliverables-dir pattern breaks at 100× because no human will merge 100 MIGRATION.md backlogs. Either automate integration or write directly to the target repo.

At 100× apps, `generateStaticParams` with 300 slugs is still fine, but build time becomes noticeable. The real breakage is cognitive: nobody can keep 300 app descriptions honest without automated source auditing. Plan the content model, not the load balancer. A monorepo is convenient for scaffolds; it is a prison for mature applications.

## Bottom Line
Build the three files. Validate by existence, not bureaucracy. Ship. A portfolio with 3 strong entries beats a page with 3 strong and 4 weak ones. Weak entries dilute credibility. That's math.
