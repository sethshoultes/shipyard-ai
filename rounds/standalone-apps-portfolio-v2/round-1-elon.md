# Elon — Round 1 Review

## Architecture

Three apps, four pages total. Static export with `generateStaticParams` is the only rational choice. We are generating HTML, not running a SaaS platform. The "self-contained deliverables" pattern is integration friction, not architecture. If the agent cannot write directly to `website/src/`, fix the agent, not the file path.

The simplest system that works: one `portfolio.ts` array, one section component for `/work`, one `[slug]/page.tsx` template. No database, no CMS, no API layer, no auth, no edge functions. Seven pages of text do not justify infrastructure. Complexity should be proportional to user value; this is an index page, not a platform. Reuse the existing card component verbatim; do not invent new UI. If the component doesn't exist, copy the pattern from `/work` and parameterize it. Do not create a "design system" for three cards. The locked decision to use Server Components only is correct—no hydration tax for read-only content.

## Performance
The bottleneck is build-time ceremony, not runtime. This PRD demands 7 files for ~200 lines of actual code—2.3 meta-files per app. `spec.md`, `todo.md`, and `MIGRATION.md` are process overhead masquerading as rigor. The `node --test` validation of static data the agent just wrote is a tautology; TypeScript already proves structure. Cut the cargo-cult tests.

The 10× path is elimination: fewer files, fewer instructions, fewer handoffs. Static HTML serves from a CDN infinitely. The only thing that can slow it down is the build pipeline itself. If the build exceeds 30 seconds, audit package.json for parasites. The PRD already banned gradients and pulses—good. Now ban the meta-files too.

## Distribution
A portfolio of three apps has even less organic gravity than seven. Nobody bookmarks an agency work page. Nobody shares a portfolio on Twitter. Distribution comes from the apps themselves—GitHub stars, HN Show HN, utility, word-of-mouth. The portfolio is residue. If you want 10,000 users, ship tools that solve problems, not pages that describe them. Generic "AI portfolio" keywords are worthless. The only SEO that matters is branded search and the slugs themselves (`/portfolio/tuned`). If the apps aren't link-worthy, no page wrapper will save them.

## What to CUT
- **spec.md & todo.md**: The PRD already exists. A checklist to remind the agent to write files means the agent is broken, not the spec.
- **MIGRATION.md**: 10-minute human integration is fantasy. It takes 30 seconds. But at 100 PRDs, you have 100 orphaned directories waiting for manual merge. This pattern manufactures stale code.
- **Live URL curl checks**: Making build success depend on GitHub's 200 responses is insanity. Rate limits will flake. A build gate should not fail because GitHub hiccuped.
- **Retrospective requirement**: Documentation is not shipping. Re-adding it is scope creep.
- **Lighthouse 95 theater**: 90 is fine. The last 5 points cost more than they convert on static text pages.
- **SCAFFOLD entries on `/work`**: If an app has no detail page and no live demo, listing it is resume padding, not product. Cut it. Only shipped or demo-able tools get real estate.
- **Accent color audits**: Six disallowed colors and a custom enum for three cards is bike-shedding. Pick a color, move on.
- **`node --test` with TypeScript**: The PRD says "zero install steps" then demands TypeScript tests run natively in Node. That is fragile fantasy. Either use plain JS for tests or accept that `tsx` is a dependency. Stop pretending TypeScript is free.
- **Screenshots / live demos**: Already cut. Keep them cut. Do not let v2 anxiety re-open doors v1 correctly closed.

## Technical Feasibility
Yes—one session can build this. The code is trivial: one data file, one section, one dynamic route, ~200 lines. The risk is the agent drowning in its own process instructions. Force the agent to read source (non-negotiable), but do not make it write four documents to prove it wrote three files. If the agent runs out of context reading repos, it will hallucinate bullets. Budget tokens accordingly.

The v1 failure mode was skipped Write calls, not complexity. Adding bureaucratic files treats the symptom; the root cause is agent behavior. This PRD is 80% process instructions, 20% product spec. Flip that ratio. The build should complete in under 30 seconds of actual coding time.

## Scaling
Traffic is irrelevant; HTML on a CDN is infinite. What breaks at 100× is the editorial pipeline—hand-curating TypeScript arrays does not scale. And the deliverables-dir pattern breaks at 100× because no human will merge 100 MIGRATION.md backlogs. Either automate integration or write directly to the target repo.

At 100× apps, `generateStaticParams` with 300 slugs is still fine, but build time becomes noticeable. The real breakage is cognitive: nobody can keep 300 app descriptions honest without automated source auditing. A monorepo is convenient for scaffolds; it is a prison for mature applications. Plan the content model, not the load balancer.

## Bottom Line
Build the three files. Validate by existence, not bureaucracy. Ship. A portfolio with 3 strong entries beats a page with 3 strong and 4 weak ones. Weak entries dilute credibility. That's math. If the build agent finishes with empty hands again, the problem is not the PRD—it's the agent.
