# Blog Infrastructure — Locked Decisions
**Zen Master Consolidation | Build Phase Blueprint**

---

## I. LOCKED DECISIONS

### Decision 1: Product Name & Positioning
**Proposed by:** Steve Jobs (Round 1)
**Contested by:** Elon Musk (Round 2)
**Winner:** Steve Jobs (with caveats)
**Resolution:** "Shipyard Journal" as brand name, `/blog` as technical implementation

**Why Steve Won:**
- Names shape behavior and respect level
- "Journal" connotes permanence over disposability
- Aligns with "captain's log" metaphor for builders
- Daemon will write hundreds of posts — framing matters

**Elon's Valid Critique:**
- URL structure remains `/blog/` (implementation reality)
- Code references stay technical (`blog/posts/`, `BlogPost`)
- Branding doesn't change core functionality

**Implementation Directive:**
- External-facing: "Shipyard Journal"
- Internal code: standard `/blog` conventions
- No over-engineering for aesthetic rebrand

---

### Decision 2: Markdown Rendering Technology
**Proposed by:** Elon Musk (Round 1)
**Contested by:** Steve Jobs (Round 2)
**Winner:** Elon Musk
**Resolution:** React-based markdown (`react-markdown` or MDX) over `remark-html`

**Why Elon Won:**
- Component composability for future interactive posts
- Avoids `dangerouslySetInnerHTML` security/extensibility limits
- One-line change now vs. full rewrite later
- Scale-conscious engineering

**Steve's Valid Critique:**
- React component weight increases bundle size
- Performance hit for hypothetical future features
- "Solve tomorrow's problem today" risk

**Implementation Directive:**
- Use `react-markdown` + `rehype-highlight` for syntax highlighting
- Optimize for extensibility without premature feature bloat
- Monitor bundle size impact

---

### Decision 3: RSS Feed
**Proposed by:** Elon Musk (Round 1)
**Accepted by:** Steve Jobs (Round 2)
**Winner:** Unanimous
**Resolution:** Ship RSS at `/blog/rss.xml` in V1

**Why This Won:**
- Table stakes for technical audience
- Free syndication and searchability
- Invisible infrastructure that drives inbound links
- 10-minute implementation, 10x ROI

**Implementation Directive:**
- Static generation script (zero runtime cost)
- Standard RSS 2.0 format
- Include full post content in feed

---

### Decision 4: Published Flag for AI Content Gate
**Proposed by:** Elon Musk (Round 1)
**Accepted by:** Steve Jobs (Round 2)
**Winner:** Unanimous
**Resolution:** `published: boolean` in frontmatter, daemon writes to drafts by default

**Why This Won:**
- Trust-but-verify model for AI-generated content
- Human review gate before publishing
- Non-negotiable if shipping daemon-written posts
- Prevents auto-publishing untrusted content

**Implementation Directive:**
- Default `published: false` for new posts
- Only published posts appear in blog index
- Draft posts accessible via direct URL for review

---

### Decision 5: Build-Time Optimization Strategy
**Proposed by:** Elon Musk (Round 1 — caching)
**Contested by:** Steve Jobs (Round 2 — ISR instead)
**Winner:** Steve Jobs (deferred to Next.js platform)
**Resolution:** Use Next.js Incremental Static Regeneration when scale demands it

**Why Steve Won:**
- Caching introduces cache invalidation complexity
- ISR already solved by Next.js platform
- No custom build tooling maintenance
- Zero build-time penalty at scale

**Elon's Valid Critique:**
- 600 posts = 8-minute builds with naive fs.readFileSync
- Scale concerns are real and measurable
- Math doesn't lie

**Implementation Directive:**
- V1: Simple fs.readFileSync (sufficient for 6-50 posts)
- V2 (100+ posts): Enable ISR with edge caching
- Monitor build times as content scales

---

### Decision 6: V1 Scope Cuts
**Proposed by:** Elon Musk (Round 1)
**Reinforced by:** Steve Jobs (Round 1)
**Winner:** Unanimous
**Resolution:** NO categories, tags, search, comments, analytics in V1

**Cut Features:**
- ❌ Tags UI (`/blog/tags/[tag]`) — no ROI until 50+ posts
- ❌ Search — Ctrl+F works for 6 posts
- ❌ Related posts — no content clustering yet
- ❌ Author attribution — single-author blog
- ❌ Comments — "the internet is the comment section"
- ❌ Analytics dashboards — focus on content quality, not bounce rate
- ❌ WYSIWYG editor — markdown-only authoring constraint

**Why These Won:**
- Zero ROI for current content volume
- Discipline over feature bloat
- Ship tight, ship fast
- Add complexity only when problem exists

---

### Decision 7: Design Philosophy — Calm Over Clutter
**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** Elon Musk (Round 2)
**Winner:** Steve Jobs (with engineering constraints)
**Resolution:** Typography and readability are non-negotiable, but must be implementable in one session

**Why Steve Won:**
- Details ARE product
- Readable typography drives shareability
- Craftsmanship distinguishes from commodity blogs
- "Calm" design as competitive moat

**Elon's Valid Critique:**
- "Mood board" specs don't ship
- Optimize for 10,000 readers, not 1 writer
- Content quality > infrastructure aesthetics
- Don't bikeshed pixel-perfect design

**Implementation Directive:**
- Typography and readability: non-negotiable
- Use Tailwind prose defaults as baseline, refine for craft
- No pixel-pushing beyond one agent session
- Test: "Sunday morning coffee reading experience"

---

## II. MVP FEATURE SET (V1 Scope)

### What Ships:
1. **Markdown-based authoring**
   - Filesystem as CMS/database
   - Drop `.md` file → auto-publish (if `published: true`)
   - Gray-matter frontmatter parsing

2. **Static blog index (`/blog`)**
   - List all published posts
   - Display: title, date, excerpt
   - Monospace dates ("precision, craft")
   - Dark, quiet, focused design

3. **Dynamic post pages (`/blog/[slug]`)**
   - React-markdown rendering
   - Syntax highlighting (rehype-highlight)
   - Clean URLs, shareable, back-button works
   - OpenGraph tags for social sharing

4. **RSS feed (`/blog/rss.xml`)**
   - Static generation
   - Full post content
   - Standard RSS 2.0 format

5. **Published flag gate**
   - Frontmatter: `published: boolean`
   - Daemon writes drafts by default
   - Human review before publish

6. **Typography & readability**
   - Optimized line-height, contrast, font sizing
   - No gray-on-gray body text
   - Prose that "respects the reader's time"

### What DOESN'T Ship (V2+):
- Tags/categories UI
- Search functionality
- Comments system
- Analytics dashboard
- Related posts
- Author attribution

---

## III. FILE STRUCTURE (What Gets Built)

```
website/
├── src/
│   ├── app/
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog index (list all posts)
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx          # Individual post page
│   │   │   ├── rss.xml/
│   │   │   │   └── route.ts          # RSS feed generator
│   │   │   └── posts/
│   │   │       ├── the-night-shift.md
│   │   │       ├── model-selection-multi-agent.md
│   │   │       ├── daemon-mode-product-development.md
│   │   │       ├── local-first-software.md
│   │   │       ├── ai-code-review.md
│   │   │       └── building-in-public.md
│   │   └── lib/
│   │       └── blog.ts               # Markdown parsing utilities
│   │                                 # - getAllPosts()
│   │                                 # - getPostBySlug()
│   │                                 # - parseMarkdown()
├── package.json
└── next.config.js
```

### Frontmatter Schema:
```yaml
---
title: "Post Title"
date: "2024-04-15"
excerpt: "Brief summary for index page"
published: true                       # Gate for AI content
tags: ["engineering", "ai"]           # Stored but not rendered in V1
---
```

---

## IV. OPEN QUESTIONS (Needs Resolution Before Build)

### Q1: Next.js Version Specification
**Question:** Which Next.js version are we targeting?
**Why It Matters:** API changes between 13/14/15 affect `generateMetadata`, static generation patterns
**Blocker Risk:** Agent might hallucinate incompatible APIs
**Resolution Needed:** Specify exact version in PRD

### Q2: Existing Design System Access
**Question:** Can agent read `website/src/app/blog/page.tsx` for styling patterns?
**Why It Matters:** "Match existing design" could mean copy-paste or inference
**Blocker Risk:** Agent guesses at styling, creates inconsistent UI
**Resolution Needed:** Confirm file access, provide design tokens if needed

### Q3: Daemon Content Volume Expectation
**Question:** Will daemon write 50 posts or 600 posts?
**Why It Matters:** Determines caching, pagination, moderation layer needs
**Strategic Impact:** Content scale vs. infrastructure scale trade-offs
**Resolution Needed:** Define content roadmap (6 months, 1 year volume)

### Q4: Build-Time Budget
**Question:** What's acceptable build time threshold? (30s? 2min? 8min?)
**Why It Matters:** Determines when to implement ISR vs. naive static gen
**Resolution Needed:** Set performance SLA for CI/CD pipeline

### Q5: Content Moderation Layer
**Question:** Who reviews daemon-written posts before `published: true`?
**Why It Matters:** Human-in-loop workflow design
**Resolution Needed:** Define review process, approval UX

---

## V. RISK REGISTER (What Could Go Wrong)

### Risk 1: Agent Hallucinates Next.js API
**Probability:** Medium
**Impact:** High (broken build, wasted session)
**Mitigation:**
- Specify exact Next.js version in PRD
- Provide code samples for `generateMetadata`, static gen patterns
- Test with minimal viable example first

### Risk 2: Typography Implementation Fails Quality Bar
**Probability:** Medium
**Impact:** High (Steve rejects output, requires manual rework)
**Mitigation:**
- Provide specific typography specs (line-height, font-size, contrast ratios)
- Define "readable" with measurable criteria
- Accept Tailwind prose defaults as baseline, iterate manually if needed

### Risk 3: Scale Breaks Cloudflare Pages Deploy Limit
**Probability:** Low (V1), High (V2 at 600 posts)
**Impact:** Critical (deploy failure)
**Trigger:** 25MB deploy size limit
**Mitigation:**
- Monitor bundle size in V1
- Implement pagination before hitting 100 posts
- Plan ISR + edge caching before 200 posts

### Risk 4: RSS Feed Format Errors
**Probability:** Low
**Impact:** Medium (broken syndication)
**Mitigation:**
- Validate RSS 2.0 compliance with feedvalidator.org
- Test with common RSS readers (Feedly, NewsBlur)
- Include full post content (not just excerpts)

### Risk 5: Daemon Writes Low-Quality Content
**Probability:** Unknown
**Impact:** Critical (defeats entire purpose)
**Test:** Can daemon-written post reach front page of Hacker News?
**Mitigation:**
- `published: false` default gate
- Human review workflow
- A/B test daemon vs. human posts for engagement

### Risk 6: React-Markdown Bundle Size Bloat
**Probability:** Medium
**Impact:** Low-Medium (slower page loads)
**Mitigation:**
- Monitor bundle size (target: <500KB total)
- Code-split markdown rendering
- Lazy-load syntax highlighting

### Risk 7: Build Time Scales Poorly
**Probability:** High (at 100+ posts)
**Impact:** Medium (slow CI/CD, developer frustration)
**Trigger:** fs.readFileSync on 100+ files = 2-8min builds
**Mitigation:**
- Switch to ISR when build time exceeds 2min
- Parallel file parsing if needed
- Monitor build time metrics from day one

### Risk 8: Agent Misinterprets "Calm" Design
**Probability:** Medium
**Impact:** Low (aesthetic mismatch, not functional failure)
**Mitigation:**
- Provide visual reference or code sample
- Define "calm" with concrete specs (no popups, no banners, etc.)
- Accept first iteration, manually refine if needed

---

## VI. SUCCESS CRITERIA (How We Know V1 Works)

### Technical Success:
- ✅ One agent session builds entire system
- ✅ Build completes in <30 seconds (6 posts)
- ✅ All pages load <100ms TTFB (CDN)
- ✅ RSS feed validates (feedvalidator.org)
- ✅ Published flag correctly gates content

### User Success:
- ✅ Writer drops `.md` file, post auto-appears
- ✅ Reader lands on `/blog`, finds content in <2 seconds
- ✅ Back button works, share URL works
- ✅ Typography is "Sunday morning coffee readable"

### Strategic Success:
- ✅ Daemon can write publishable post (human review passes)
- ✅ First daemon post gets shared on Twitter/HN
- ✅ Zero ops burden (static deploy, no server maintenance)

---

## VII. IMPLEMENTATION TIMELINE

### One Agent Session (2-4 hours):
1. **Install dependencies** (1 command)
   - `npm install gray-matter react-markdown rehype-highlight`

2. **Write `lib/blog.ts`** (~50 lines)
   - `getAllPosts()` — read all `.md` files, filter `published: true`
   - `getPostBySlug()` — parse single post
   - `parseMarkdown()` — gray-matter + react-markdown

3. **Write `blog/page.tsx`** (~80 lines)
   - Map over `getAllPosts()`
   - Display title, date, excerpt
   - Link to `/blog/[slug]`

4. **Write `blog/[slug]/page.tsx`** (~80 lines)
   - Read markdown file
   - Render with react-markdown
   - Generate metadata for SEO

5. **Write `blog/rss.xml/route.ts`** (~60 lines)
   - Static RSS 2.0 generation
   - Include all published posts

6. **Copy 6 markdown files** to `blog/posts/`
   - Set `published: true` for initial posts

7. **Test build and deploy**
   - `npm run build`
   - Verify static generation
   - Deploy to Cloudflare Pages

---

## VIII. PHILOSOPHICAL CONSENSUS

### What Both Steve & Elon Agreed On:

1. **Markdown as interface** — filesystem is CMS, no WYSIWYG ever
2. **No comments** — internet is the comment section
3. **Cut V1 scope** — no tags, search, analytics until needed
4. **Invisible infrastructure** — best tools disappear
5. **Respect reader's time** — no popups, no dark patterns
6. **RSS is table stakes** — free syndication matters
7. **Published flag gate** — trust but verify AI content
8. **Ship in one session** — 2-4 hours, no over-engineering

### Where They Differed (But Found Resolution):

**Steve:** "Craft and aesthetics create competitive moat"
**Elon:** "Content quality > infrastructure vibes"
**Resolution:** Ship tight with non-negotiable typography quality, but don't pixel-push beyond one session

**Steve:** "Optimize for Sunday morning reading experience"
**Elon:** "Optimize for 10,000 reads, not 1 write"
**Resolution:** Both are correct — readable design drives shareability

**Steve:** "Shipyard Journal as brand identity"
**Elon:** "Branding theater, just call it /blog"
**Resolution:** External brand is Journal, internal code stays `/blog`

---

## IX. THE MANDATE

**Ship the tightest possible system.**

- Markdown files become a publishing platform that disappears
- Typography and readability are non-negotiable
- RSS and published flag are table stakes
- No features until content volume justifies them
- One agent session builds the entire V1
- Let the content do the talking

**The test:** Can a daemon-written post hit the front page of Hacker News?

If yes, we've built distribution infrastructure.
If no, we've built a nice CMS for humans.

Either way, ship it.

---

**Zen Master Seal: This is the blueprint. Build from here.**
