# Steve Jobs — Round 2: Where Elon Gets It Wrong (And Right)

## Where Elon Is Optimizing for the Wrong Metric

**1. "react-markdown over remark-html for future extensibility"**

No. This is the classic engineer's trap: solving tomorrow's problem today. You're adding React component weight to every page load for a hypothetical feature we *might* need. `dangerouslySetInnerHTML` with clean HTML is **faster** than mounting React components for every code block and heading.

When we need interactive components in posts, we'll upgrade. Until then, ship the lighter bundle. Performance IS a feature.

**2. "Memoize post parsing at 100+ posts"**

Elon's right that build time will scale poorly. But he's wrong about the solution. Caching parsed frontmatter in a `.posts-cache.json` file creates a new problem: **cache invalidation complexity**. Now we're maintaining build tooling to track file hashes and diff changes.

The real fix? Incremental Static Regeneration. Next.js already has this. When we hit 100 posts, we generate on-demand and cache at the edge. Zero build-time penalty. This is *already solved* by the platform we chose.

**3. "Distribution doesn't matter, content does"**

This is where Elon reveals he's never shipped a consumer product. Of course content matters. But **discoverability is design**. A beautiful reading experience makes people *want* to share. Typography that respects the reader. URLs that are clean and memorable. Pages that load before you blink.

You don't get upvoted on Hacker News with "good enough" design. You get upvoted when engineers see craftsmanship and think, "I want to build like this."

The plumbing IS the product.

## Defending Design Quality HERE

**Why "Shipyard Journal" matters:**

Elon dismissed naming as bikeshedding. But names shape behavior. Call it a "blog" and people treat it like a commodity. Call it a "Journal" and they respect it like a craft.

We're building this for *ourselves first*. The daemon will write hundreds of posts. Do we want to say "check the blog" or "read the journal entry"? One sounds disposable. One sounds permanent.

**Why "calm" design is a moat:**

Every technical blog looks the same because everyone copies the same Tailwind prose defaults. Elon says "don't pixel-push." I say: the **details are the product**.

When our line-height is perfect, our contrast ratio is correct, and our monospace dates feel like craftsmanship — readers notice. They might not know *why* it feels better, but they feel it. That's why they come back.

Apple never won by shipping "good enough" design. Neither will we.

## Where Elon Is Right (Concessions)

**1. RSS feed is non-negotiable.**

He's absolutely right. I missed this. Every technical blog needs RSS. Ship it in V1. This is table stakes for our audience.

**2. `published: boolean` flag is brilliant.**

The daemon should write to drafts by default. Human review before publishing. This is the right trust-but-verify model. Stealing this.

**3. Build-time bottlenecks are real.**

I was wrong to ignore scaling concerns. Six posts to 600 posts WILL break the build. Elon's right that we need a plan. I just disagree on caching — ISR is the answer, not custom build tooling.

**4. One agent session is feasible.**

He called the timeline correctly. This is 2-4 hours of work. If we over-engineer it, we'll spend a week. Ship tight, ship fast.

## My Top 3 Non-Negotiables

**1. No categories/tags UI in V1.**

We don't have the content volume to justify this. When we hit 50 posts, we'll add it. Not before. Discipline beats features.

**2. Markdown-only authoring.**

No WYSIWYG. No rich text editor. Ever. This constraint keeps the writing sharp and the code simple. The day we add a visual editor is the day we've lost the plot.

**3. Typography and readability are NOT optional.**

I will not ship 16px gray-on-gray body text with default line-height. The prose must be a pleasure to read. This is not negotiable. If the agent can't implement readable typography, we do it by hand.

## Final Position

Elon's right that we should ship fast and cut scope. But speed without craft is just noise. We're building something *permanent* here. The daemon will write for years. Readers will judge us by the experience, not the git commits.

Ship the minimum. But make that minimum **insanely great**.

That's the discipline.
