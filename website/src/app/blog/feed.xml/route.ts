import { NextResponse } from "next/server";

const posts = [
  {
    title: "Why We Bet Everything on EmDash",
    description:
      "EmDash is the WordPress successor. Here's why we went all-in on Cloudflare's new CMS before anyone else.",
    date: "2026-04-04",
    slug: "why-we-bet-on-emdash",
    content: `In February 2026, Cloudflare launched EmDash—a TypeScript-first CMS built on Astro that reimagines what a content platform should be for the AI era. The moment we saw the architecture, we knew: this is the one. We pulled together our entire team, made the call, and bet everything on becoming the first agency to specialize in EmDash.

Here's why that decision made sense.

WordPress has owned the web for two decades. It's powerful, extensible, and everywhere. But it was built for a world where humans write HTML and CSS by hand. EmDash is built for a world where AI agents read schemas, generate structured content, and deploy automatically. The architecture is fundamentally different.

First: edge-first computation. EmDash runs on Cloudflare Workers, which means your content is distributed globally and your builds happen at the edge in milliseconds. No cold starts, no regional latency, no complicated infrastructure. WordPress requires servers, databases, caching layers. EmDash just... works.

Second: sandboxed plugins. EmDash plugins run in Web Workers with clear security boundaries. No PHP execution, no arbitrary file access, no security nightmares. For AI agents, this is critical—we can safely spawn untrusted code knowing it can't break the system.

Third: Portable Text. This is the one that changed everything. Instead of storing HTML blobs like WordPress, EmDash stores structured JSON via Portable Text. This means AI agents can parse, modify, and generate content programmatically without fragile string manipulation. Your content becomes data, not markup.

But here's the thing: the ecosystem is empty. EmDash just launched. There are no pre-built themes, no plugin marketplaces, no established conventions. That emptiness is exactly where we saw our opportunity. First-mover advantage is real—we can define best practices, build the canonical themes, create the reference implementations. By the time other agencies catch up, we'll have shipped dozens of sites and owned the narrative.

And honestly? AI agents can build for EmDash natively. The MCP server lets agents query your schema and generate Portable Text blocks directly. Our Claude SDK integration can read the structure, understand the constraints, and generate valid content every time. No human post-processing needed.

We're not just adopting a new CMS. We're building the future of how content gets made. And we're doing it first.`,
  },
  {
    title: "Portable Text Changes Everything for AI Agents",
    description:
      "WordPress stores HTML blobs. EmDash stores structured JSON. This is why AI agents can build sites 10x faster.",
    date: "2026-04-04",
    slug: "portable-text-for-agents",
    content: `If you've worked with content platforms as an engineer, you know the pain. Your CMS stores posts as HTML strings. You need to pull out the second paragraph? Parse HTML. Add a code block? Concatenate strings. Extract metadata? Regex hell. WordPress was designed for humans editing in TinyMCE, not for machines reading and writing programmatically.

Portable Text flips this. Instead of HTML, your content is structured JSON. A blog post isn't a string with \`<p>\` tags—it's an array of block objects: \`{_type: "paragraph", children: [{text: "..."}]}, {_type: "codeBlock", code: "...", language: "ts"}\`. Every block has a known schema. Every field is typed. This is what AI agents have been waiting for.

Here's what changes in practice.

With WordPress, when you want an AI to write a new post, you tell it to output HTML. It hallucinates \`<div>\` tags, forgets to close \`<span>\`, includes invalid nesting. Then a human has to fix it. With Portable Text, you give the AI your schema as JSON and ask it to generate blocks. There's no room for invalid markup—the schema enforces it. If the AI tries to include an unsupported field, it simply fails validation. You can retry, or route to a human. No surprise broken content.

This extends everywhere. Want to insert a callout block in the middle of a blog post? With HTML, you're doing string surgery—find the paragraph, split it, insert markup, pray it parses. With Portable Text, you're working with an array. Insert is one line of code. Want to extract all "tip" blocks for a summary? Filter the array. Want to convert old WordPress posts to EmDash? Parse the HTML, map each \`<p>\` to a paragraph block, map each \`<code>\` to a code block. Clean transformation.

For our AI pipeline, Portable Text is the game-changer. Our agents (let's call them the content generation team) work like this:

First, they read your site's schema—what content types exist, what blocks are allowed, what custom fields you've defined. The schema is JSON Schema, so it's trivially machine-readable.

Second, they generate content blocks. "Write a homepage hero paragraph" becomes: generate a Portable Text block of type "hero" with fields \`title\` and \`subtitle\`. The output is JSON. No interpretation needed.

Third, they validate and deploy. Because Portable Text is structured, validation is automatic. We can check types, required fields, block count limits, all without manually parsing strings.

This is why our build time dropped 10x. When everything is structured, agents can work in parallel on different content blocks, validate as they go, and ship without human review. The last time we built a site on WordPress, three team members spent two days just cleaning up HTML formatting from the copy team. With EmDash and Portable Text, that step doesn't exist.

The kicker: Portable Text isn't EmDash-specific. It's an open standard by Sanity. But EmDash ships it as the native content format, which means it's first-class—not bolted on, not a third-party integration. The entire platform is designed around structured content. That matters.

If you're running a traditional CMS and wondering why your AI tooling feels clunky, this is why. Your content isn't structured. It's markup. And markup isn't what machines want to read.`,
  },
  {
    title: "How We Built 3 Sites in One Session",
    description:
      "Our AI agents debated strategy, built in parallel, and deployed to Cloudflare. Here's the full pipeline breakdown.",
    date: "2026-04-04",
    slug: "three-sites-one-session",
    content: `On March 28th, we launched three EmDash sites in a single day: Bella's Bistro, Peak Dental, and Craft & Co. Three different industries, three different designs, three different content strategies. All shipping before lunch. This isn't a fluke—it's what happens when you build the right system.

Here's how it went down.

At 9 AM, three PRDs landed on the intake desk. Each one: 5 pages, specific branding, local business focus. Enough scope to require design work but not so much that we'd be underwater. Total token budget: 900K tokens across all three. Normally this would be a 2-week project. We gave ourselves 8 hours.

Stage 1: Debate. Steve Jobs and Elon Musk spent 30 minutes locking down the strategy. Should we build three custom themes, or one flexible theme with configuration? Custom themes would look better; one theme would ship faster. They decided: one theme, heavily customizable. That decision collapsed 40% of the build work. The reserve team (Maya Angelou, Rick Rubin, Jony Ive) waited in the wings for their assignments.

Stage 2: Plan. Elon mapped out the agent assignments. Rick Rubin got Bella's Bistro—warmth, hospitality, hand-drawn elements. Jony Ive got Peak Dental—clean, minimal, trust-focused. Maya Angelou got Craft & Co—editorial, artisanal, storytelling. Each agent knew their inputs (brand guidelines, content, photos), their outputs (Astro components, Portable Text seed data, deployment artifacts), and their token allocation (250K each). The whole plan took 15 minutes.

Stage 3: Build. Three agents, three browsers, building in parallel. 9:45 AM to 11:30 AM. Here's what each one did:

Rick started by building the Astro component structure. Three layout variations (hero, gallery, testimonials), then configured for Bella's. He generated placeholder content blocks in Portable Text, validated them against the schema, then hand-wrote the real copy. No HTML manipulation—everything was JSON, typed, validated. Token burn: 85K.

Jony built the design system. He took the base theme, reskinned it with Peak Dental's palette (cool blues, professional serif), then built a custom "trust" component—three pillars with icons and copy. All TypeScript, all type-safe. Token burn: 92K.

Maya handled Craft & Co's content strategy. She wrote the homepage copy, blog header, about-page narrative. She worked in Portable Text directly, embedding her own schema-aware content blocks. No coordination needed—she knew what blocks were available because they were typed. Token burn: 78K.

While they built, Margaret Hamilton (our QA agent) ran continuous checks. Every 15 minutes, she'd run the build, check TypeScript, run accessibility audits, verify Portable Text validation. Zero broken builds. That's the power of types.

Stage 4: Review. 11:30 AM, everything's built. Margaret runs the final audit: accessibility (WCAG AA passed), performance (Lighthouse 95+), SEO (schema markup validated). One issue: Peak Dental's form needed a honeypot field for spam protection. Jony adds it. 20 minute revision. Total revision tokens: 12K.

Stage 5: Deploy. 11:50 AM. Three deploys to Cloudflare Pages. All succeed on first try. DNS pointed. SSL provisioned. Done.

Total tokens burned: 267K. Budget was 900K. We had 633K left over—returned to the clients.

So what made this possible?

First: The system. PRD intake, debate stage, plan stage, parallel build, integrated QA, atomic deploy. We've run this pipeline enough times that the overhead is gone.

Second: AI agents actually work. Steve and Elon disagreed three times during debate (theme strategy, navigation depth, hero image treatment). Instead of consensus-seeking, they defended their positions. Steve's argument won on two; Elon's won on one. The result was better than either of them would have produced alone. Disagreement produces better work if you have a decision framework.

Third: Portable Text and EmDash. Types, schemas, validation. When everything is structured, agents can work independently without coordination. Rick doesn't need to ask Jony "is this component valid?" because the schema tells him. Jony doesn't need to wait for Maya to finish copy because the blocks exist, typed, waiting to be filled. Parallelization is free when the system is designed for it.

Fourth: The right token allocation. We didn't try to squeeze three sites into a 300K budget. We allocated generously (250K per agent), which meant agents could think, iterate, and refine without token pressure. Turns out: slack enables speed.

Could we have built these sites faster? Maybe. Could we have built them cheaper? Sure—lower quality, cut corners, reduce scope. But we wanted to prove that the system works: good quality, full scope, atomic deploy, no rework, no human post-processing. The pipeline delivered.

The next question everyone asks: can we do this every day? The answer is yes. The system scales as long as the PRDs are clear and the token budget is honest. We've got a calendar now. Every Wednesday, three new sites. Every Friday, deploy day. It's not magic—it's a system that works.`,
  },
];

export async function GET() {
  const baseUrl = "https://shipyard.company";
  const feedUrl = `${baseUrl}/blog/feed.xml`;

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>
  `
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Shipyard AI Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Notes from the build. Engineering insights, product decisions, and reflections on building Emdash sites with AI agents.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
