# Elon — Round 1 Review: Standalone Apps Portfolio

## Architecture
This is a static website. The simplest system that works is a single `portfolio.ts` array consumed by `page.tsx` and `work/page.tsx`. No database. No CMS. No API layer. No auth. No state management. No edge functions.

Static export means we bake HTML at build time and serve from a CDN. That is the entire architecture. If you add a headless CMS, a PostgreSQL instance, or a GraphQL layer for seven pages, you are not engineering—you are cosplaying as a platform company. Complexity should be proportional to user value. Seven pages of text do not justify infrastructure.

## Performance
Runtime performance is a non-issue. Seven text-heavy pages cost nothing to serve. The real bottleneck is build-time entropy and client-side JavaScript bloat. Every React hook you add to a detail page is waste. Every unused import is debt. Every analytics script is sand in the gears.

The 10× path is ruthless: keep every detail page a Server Component with zero hydration overhead. Pre-render via `generateStaticParams`. No ISR. No revalidation. Static means static.

Do not use `next/image` with remote optimization in static export; it creates unnecessary `_next/image` handlers and build-time failures. Use standard `<img>` tags or inline SVGs. The build should complete in under 30 seconds. If it doesn't, your dependencies are obese and you should audit `package.json` for parasites.

## Distribution
A portfolio page is not a product. It has no viral coefficient, no retention loop, and no organic search moat for generic terms like "AI tools." It will not reach 10,000 users without paid ads because it provides zero standalone utility. Nobody shares a portfolio. Nobody bookmarks an agency work page.

The only SEO that matters is branded search for "Shipyard [AppName]." Generic "AI portfolio" keywords are worthless.

Distribution must come from the apps themselves—GitHub README backlinks, Hacker News Show HN posts, and word-of-mouth from tools people actually use. If five of seven apps are empty scaffolds, this page is a credibility cemetery that reduces trust in Shipyard's brand. Ship finished tools first; the portfolio is a side effect, not a strategy.

## What to CUT
- **SCAFFOLD apps with no code**: Do not give them detail pages. A "Read more" button that leads to an apology paragraph is user-hostile. List them as "Early stage" on `/work` and stop. Honesty does not require a 404-word obituary.
- **Unique gradient per app + browser mockups**: Design theater. Reuse the existing card component verbatim. Pick one accent color for the entire section. Maintaining seven bespoke gradients is debt, not delight. Users do not notice gradients; they notice broken links.
- **Screenshots and README snippets**: Conditional rendering logic ("only include if public/ exists") adds build-time branching and failure modes. Cut entirely for v1. You can add screenshots when the products are real.
- **Lighthouse ≥ 95 mandate**: 90 is the threshold of professionalism. Chasing 95 for a static content page is paralysis by analysis. The last 5 points cost more than they convert. Focus on content accuracy, not performance theater.
- **Stats section update**: Counting "sites + tools + apps" is a vanity metric. If you have 5 sites and 7 scaffolds, you don't have 12 assets. You have 5 sites and 2 shipped tools. Don't inflate totals. Cut the math.
- **Memory retrospectives**: Process overhead. The PRD already exists. Don't write a second document about writing the first document. Ship, then move on. Documentation is not shipping.

## Technical Feasibility
Yes. One agent session can absolutely build this. It is three files: a data definition, a dynamic route with `generateStaticParams`, and a section insertion on `/work`. Static export removes all runtime state. The only risk is the agent inventing features instead of reading source code. Mandate: if `projects/<name>/` has fewer than 200 lines of code, mark it `SCAFFOLD` and do not click into it. Reading source is non-negotiable.

The acceptance criteria requiring the agent to read every source file is correct but high-risk. The agent must fail gracefully: if a project directory is missing or empty, default to `SCAFFOLD`. Do not block the build on research.

## Scaling
At 100× apps (700 pages), hand-curating a TypeScript array breaks. You will need MDX, Contentlayer, or a lightweight CMS. Static export also breaks if you want live status badges or dynamic GitHub star counts—every metadata change requires a full rebuild and redeploy. Web traffic is irrelevant; HTML is trivially cacheable. What breaks is the editorial pipeline, not the server. Plan for the content model, not the load balancer.

At 100× usage, the GitHub monorepo itself may become unwieldy. Consider splitting apps into separate repos if they graduate to real products. A monorepo is convenient for scaffolds; it's a prison for mature applications.

## Bottom Line
Build the simplest honest version in one session. Reuse everything. Cut everything else. Ship.
