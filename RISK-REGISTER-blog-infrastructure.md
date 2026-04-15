# Blog Infrastructure Risk Register

**Project:** Converting hardcoded Next.js blog to markdown-driven with dynamic routing
**Constraints:** Static export, Next.js 16.2.2, Cloudflare Pages
**Scan Date:** 2026-04-15

---

## CRITICAL RISKS (Block Shipping)

### RISK-001: Decision Document vs. PRD Implementation Mismatch

**Probability:** High (70%)
**Impact:** High (broken build, requires rework)
**Severity:** CRITICAL

#### Description
The **Decisions document specifies `react-markdown` + `rehype-highlight`** for markdown rendering, but the **PRD specifies `remark-html`**. These are mutually exclusive:
- `remark-html`: Converts markdown to HTML string (works with static export, but outputs raw HTML)
- `react-markdown`: React component that renders markdown (requires client runtime)

The PRD's example code shows `remark().use(html).processSync(content).toString()`, which produces an HTML string. If implemented as written, the individual post pages will use `dangerouslySetInnerHTML` to render this HTML, violating the decision's security and extensibility requirements.

#### Blocker Details
- **Decision winner:** "Elon Musk" chose `react-markdown` for "component composability" and to "avoid dangerouslySetInnerHTML"
- **PRD example code:** Uses `remark-html` and returns `.toString()` (HTML string)
- **Conflict:** Can't achieve both "structured React components" AND "remark-html string output"

#### Technical Implications
- If `react-markdown` is used: PRD's code example is incorrect and won't compile (missing type)
- If `remark-html` is used: Violates documented decision and creates security/extensibility limitations

#### Mitigation Strategy
**ACTION REQUIRED BEFORE BUILD:**
1. Explicitly confirm which approach is final: `react-markdown` or `remark-html`
2. Update PRD or Decisions document to match the chosen approach
3. Provide correct code example for the chosen path

**Detection:** Will be immediately caught at build time if wrong approach is coded. Error message will be clear (missing React component vs. dangerouslySetInnerHTML warning).

---

### RISK-002: Build-Time Access to `fs` Module with Static Export

**Probability:** High (90%)
**Impact:** High (build fails or silently breaks)
**Severity:** CRITICAL

#### Description
The PRD shows `lib/blog.ts` using Node.js `fs` module:
```typescript
import fs from 'fs';
const files = fs.readdirSync(postsDirectory);
const fileContents = fs.readFileSync(filePath, 'utf-8');
```

With `output: "export"` (static export mode), this code **must be server-side only** and called during static generation, not in client components. However:

1. The PRD doesn't explicitly mark `blog/[slug]/page.tsx` with `'use server'` directive
2. It's unclear if `getPostBySlug()` is being called at build-time (in `generateStaticParams`) or render-time
3. If any client component tries to import these utilities, the build will fail with "fs module not available in edge runtime"

#### Current State Indicators
- No `/home/agent/shipyard-ai/website/src/lib/blog.ts` exists yet
- The existing blog page uses hardcoded arrays (no fs calls)
- Cloudflare Pages deployment will strip out Node.js runtime

#### Blocker Details
The PRD's code structure suggests:
```typescript
// Inside blog/[slug]/page.tsx
export function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug })); // ✓ Build-time, OK
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug); // ⚠️ When does this run?
  // ... render
}
```

In static export mode, `getPostBySlug()` is called at build-time for each slug (because Next.js pre-renders all static params). But if the code isn't structured correctly, Next.js might try to call it at request time, which fails.

#### Mitigation Strategy
1. Mark all blog utility functions with clear intent: add JSDoc comments specifying "build-time only"
2. Use Next.js's `notFound()` for missing slugs (works in static export)
3. Add TypeScript guard: ensure `fs` imports only appear in files that never export client components
4. Test locally with `next build && next start` before deploying

#### Detection Method
- Build will fail with error: "fs is not defined" or "fs module not available in edge runtime"
- Check the build output log for `ReferenceError: fs is not defined`
- Cloudflare Pages deploy will fail with runtime error if fs is called at request time

---

### RISK-003: Missing `generateStaticParams` Implementation

**Probability:** Medium (60%)
**Impact:** High (static export produces incomplete site)
**Severity:** CRITICAL

#### Description
Next.js static export **requires** `generateStaticParams()` for dynamic routes like `[slug]`. Without it:
- The build succeeds but produces only `/blog/index.html`
- Individual post routes (`/blog/the-night-shift/index.html`) are NOT generated
- Users navigating to `/blog/the-night-shift` get a 404 (even on static export)

#### Current State
- `/home/agent/shipyard-ai/website/src/app/blog/[slug]/page.tsx` does NOT exist yet
- Will be created during implementation
- Risk: Implementer might forget `generateStaticParams` or implement it incorrectly

#### Why This Matters for Static Export
The PRD correctly shows:
```typescript
export function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }));
}
```

But if this is omitted or returns an empty array, Cloudflare will deploy a site where blog posts exist but are unreachable.

#### Mitigation Strategy
1. Make `generateStaticParams` non-optional in the code review checklist
2. Add a validation check: count generated routes (`ls -R out/blog/`) to match post count
3. Test static export locally: `npm run build` then verify `ls out/blog/*/index.html` shows all posts

#### Detection Method
- Local test: `npm run build && find out/blog -name "index.html" | wc -l` should equal post count
- Cloudflare Pages deploy: manually visit `/blog/the-night-shift` after deploy; if 404, `generateStaticParams` failed
- Check Next.js build output for warning: "route [...] is not statically generated"

---

## HIGH-RISK ITEMS (Likely to Cause Issues)

### RISK-004: Frontmatter Schema Mismatch Across Files

**Probability:** High (75%)
**Impact:** Medium (runtime errors, missing metadata)
**Severity:** HIGH

#### Description
Existing markdown files in `/home/agent/shipyard-ai/website/src/app/blog/` already have YAML frontmatter, but the schema differs:

**Current (existing files):**
```yaml
---
title: "Post Title"
date: 2026-04-15          # ← number, not string
tags: [ai, code]          # ← array syntax (unquoted)
---
```

**PRD specifies:**
```yaml
---
title: "Post Title"
date: "2026-04-15"        # ← quoted string
tags: ["ai", "code"]      # ← quoted array
---
```

**Decisions specify:**
```yaml
---
title: "Post Title"
date: "2024-04-15"
excerpt: "Brief summary"  # ← 'excerpt' not 'description'
published: true           # ← required for content gating
tags: ["ai"]
---
```

#### Current Files State
Checked files show:
- `the-night-shift.md`: has `author`, no `published` flag
- `seven-plugins-zero-errors.md`: uses unquoted date `2026-04-15` (number)
- `model-selection-multi-agent.md`: no `description` field

#### Problem
When `gray-matter` parses these files, type mismatches occur:
- `data.date` might be number vs. string (causes comparison failures in sorting)
- `data.published` is undefined → all files treated as `published: true` (defeats content gating)
- `data.description` vs `data.excerpt` mismatch → metadata rendered incorrectly

#### Mitigation Strategy
1. **Normalize all existing files** to match final schema before implementation starts
2. **Add schema validation** in `lib/blog.ts`:
   ```typescript
   function validateFrontmatter(data: any): BlogPost {
     if (typeof data.date === 'number') data.date = data.date.toString();
     if (!data.published) data.published = true; // default
     if (!data.description && data.excerpt) data.description = data.excerpt;
     return data as BlogPost;
   }
   ```
3. **Document canonical schema** in a comment in `blog.ts` for future posts

#### Detection Method
- Test: `npm run build && grep -r "undefined description\|NaN date" .next/logs/`
- Runtime: Check browser console for missing `description` in metadata
- Manual: Run `node -e "const matter = require('gray-matter'); console.log(matter.parse(fs.readFileSync('blog/posts/the-night-shift.md')).data)"` for each file

---

### RISK-005: Missing `published` Field Logic Not Implemented

**Probability:** High (85%)
**Impact:** Medium (content policy violation)
**Severity:** HIGH

#### Description
The Decisions document states:
> "Default `published: false` for new posts; only published posts appear in blog index"

This is a **core feature for AI content gating**—daemon writes drafts, humans review before publication.

However:
1. The PRD does NOT mention `published` field in the frontmatter schema
2. The PRD code example doesn't filter by `published: true`
3. The current hardcoded posts will have no `published` field
4. Implementation risk: someone might ship without this logic

#### Example Gap
PRD's `getAllPosts()` is shown as:
```typescript
export function getAllPosts(): BlogPost[] {
  const slugs = getAllPostSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
```

But it should be:
```typescript
export function getAllPosts(): BlogPost[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter(post => post.published); // ← Missing in PRD
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
```

#### Mitigation Strategy
1. Update PRD to explicitly include `published` field in frontmatter schema
2. Add explicit `.filter(post => post.published)` in `getAllPosts()` function
3. Note: Draft posts should still be accessible via direct URL (`/blog/draft-post-slug`) for review

#### Detection Method
- Review test: Check that adding `published: false` to a post removes it from `/blog` index
- Manual test: Create a draft post, verify it doesn't appear in index, but direct URL works
- Build validation: Count posts in rendered HTML vs. `.md` files; should be fewer if drafts exist

---

### RISK-006: RSS Feed Not Mentioned in PRD Code

**Probability:** High (80%)
**Impact:** Medium (missing feature from scope)
**Severity:** HIGH

#### Description
The Decisions document prioritizes RSS as a V1 feature:
> "Ship RSS at `/blog/rss.xml` in V1" — "Unanimous" decision

However:
1. The PRD contains **NO code example** for RSS generation
2. No `blog/rss.xml/route.ts` is shown in the PRD
3. The file structure section doesn't mention `rss.xml` route
4. Implementation risk: RSS might be forgotten or shipped incorrectly

#### Current State
- No RSS generation exists in codebase
- Decisions specify RSS 2.0 format, full content, static generation

#### Impact if Missed
- Hacker News readers, RSS aggregators won't syndicate content
- Loses one of the strategic goals ("free syndication matters")
- Requires post-ship rework to add

#### Mitigation Strategy
1. Add explicit RSS generation to PRD (or reference Decisions)
2. Implement as Next.js dynamic route: `blog/rss.xml/route.ts`
3. Return static XML (not HTML)
4. Validate with feedvalidator.org before deploy

#### Detection Method
- Test: `curl https://www.shipyard.company/blog/rss.xml` should return valid XML
- Validation: Use https://validator.w3.org/feed/ to verify feed structure
- Build check: `grep -r "rss" .next/` should show route exists

---

### RISK-007: Bundle Size Impact Not Quantified

**Probability:** Medium (70%)
**Impact:** Medium (slower page loads, potential deploy failure)
**Severity:** HIGH

#### Description
The Decisions document flags bundle size as a risk:
> "React component weight increases bundle size"
> "Monitor bundle size (target: <500KB total)"

But:
1. No baseline bundle size is established for the current site
2. No monitoring is set up to track `react-markdown` + `rehype-highlight` overhead
3. Cloudflare Pages has a **25MB deploy size limit**—unlikely to hit, but CSS/JS creep is cumulative
4. Unknown: whether tree-shaking `react-markdown` will work effectively

#### Known Dependencies to Add
- `gray-matter`: ~5KB
- `react-markdown`: ~30-40KB (depending on plugins)
- `rehype-highlight`: ~50KB (includes Prism.js highlighting)
- **Total estimated:** ~85-95KB additional JS to the bundle

#### Risk Trigger
If the final bundle (blog page + all markdown posts rendered) exceeds ~200KB, page load time degradation becomes noticeable.

#### Mitigation Strategy
1. **Establish baseline:** Run `npm run build && du -sh out/` before implementation
2. **Add monitoring:** Create a build script that logs bundle size after each build
3. **Lazy load markdown rendering:** Only load `react-markdown` when visiting `/blog` or `/blog/[slug]`
4. **Consider alternatives if bloat:** `remark-html` + static HTML would be lighter

#### Detection Method
- Build check: `npm run build && du -sh out/_next/static/chunks/` (should be < 200KB increase)
- Local: `npm run build && ls -lh out/_next/static/chunks/*.js | awk '{sum+=$5} END {print sum}'`
- Cloudflare deploy: Check deployment stats in dashboard
- Runtime: Open DevTools Network tab, check JS bundle sizes

---

## MEDIUM-RISK ITEMS (Probable Issues)

### RISK-008: Markdown Content with Backticks and Special Characters

**Probability:** Medium (65%)
**Impact:** Low-Medium (rendering bugs, display corruption)
**Severity:** MEDIUM

#### Description
The blog already contains code blocks with complex syntax. When parsing with `gray-matter` + `react-markdown`, special characters can cause issues:

**Current state in hardcoded posts:**
- Backticks within code blocks: `` `code` ``
- Template literals: `` `${variable}` ``
- Escaped characters: `\n`, `\\`
- YAML-incompatible strings

**Example problematic content** (from page.tsx):
```typescript
// Inside template literal:
throw new Response(...);
throw new Response(...);  // double backticks in comments
```

When migrated to `.md` files:
```markdown
\`\`\`typescript
throw new Response(...)  // backticks might not parse correctly
\`\`\`
```

#### Why This Matters
- `gray-matter` parses the frontmatter only, but content is passed to markdown parser
- `react-markdown` or `remark-html` might misinterpret unescaped backticks
- Result: code blocks render with wrong syntax highlighting or broken layout

#### Mitigation Strategy
1. Test each existing post's markdown rendering locally after migration
2. Use triple backticks ` ``` ` with language specifier (already in posts)
3. Don't escape backticks inside code blocks—let markdown handle them
4. Use `rehype-highlight` for syntax highlighting (handles code properly)

#### Detection Method
- Visual: After deploy, check each blog post renders code correctly
- Test command: `npm run build && grep -A 10 "code" out/blog/*/index.html | head -30`
- Browser check: Load `/blog/seven-plugins-zero-errors`, verify code blocks are highlighted

---

### RISK-009: Design Consistency: "Calm" Aesthetic Not Defined

**Probability:** Medium (60%)
**Impact:** Low (rework may be required)
**Severity:** MEDIUM

#### Description
The Decisions document states:
> "Typography and readability are non-negotiable"
> "Use Tailwind prose defaults as baseline, refine for craft"

But:
1. No specific design specs (line-height, font-size, contrast ratios)
2. No visual reference or Figma link
3. The existing blog page uses `prose prose-invert` (Tailwind defaults)
4. Risk: Individual post pages might not match existing blog aesthetic

#### Current Design Pattern (from page.tsx)
```tsx
className="prose prose-invert max-w-none text-lg leading-relaxed text-foreground"
```

#### Unknown
- Will the same `prose prose-invert` classes work for individual post pages?
- Are there custom Tailwind typography settings beyond `prose`?
- What is "calm"? (no popups, no ads, no dark patterns—per Decisions)

#### Mitigation Strategy
1. Copy existing prose styling directly to post pages (maintain consistency)
2. Test rendering of code blocks, lists, headings, quotes in post pages
3. Get Steve Jobs' approval on typography before shipping (mentioned in Decisions)
4. Accept first iteration, refine manually if needed

#### Detection Method
- Visual comparison: Load `/blog/page.tsx` and `/blog/[slug]/page.tsx` side-by-side
- Check font sizes, line heights, spacing are identical
- Verify code blocks have syntax highlighting (via `rehype-highlight`)

---

### RISK-010: Cloudflare Pages Deploy Validation Missing

**Probability:** Medium (55%)
**Impact:** Medium (silent deployment failures)
**Severity:** MEDIUM

#### Description
The PRD shows a deployment command:
```bash
cd website && npm run build
CLOUDFLARE_API_TOKEN=... npx wrangler pages deploy out --project-name=shipyard-ai
```

But:
1. No verification steps are documented
2. Unknown if the `out/` directory structure matches Cloudflare's expectations
3. No health check after deployment (e.g., curl `/blog` post-deploy)
4. Risk: Site deploys but blog is broken, no one notices immediately

#### Why This Matters
Cloudflare Pages is a static host. If the build output is malformed:
- Routes won't be accessible
- Rewrites might fail
- 404s will silently appear

#### Mitigation Strategy
1. Test locally: `npm run build && npx wrangler pages dev out`
2. Verify static output has expected structure:
   - `out/blog/index.html` exists
   - `out/blog/the-night-shift/index.html` exists (for each post)
   - `out/blog/rss.xml` exists
3. Add post-deploy validation script

#### Detection Method
- Post-deploy curl test:
  ```bash
  curl -I https://www.shipyard.company/blog  # should be 200
  curl -I https://www.shipyard.company/blog/the-night-shift  # should be 200
  curl https://www.shipyard.company/blog/rss.xml | head -20  # should contain <?xml
  ```

---

### RISK-011: Existing Hardcoded Post Migration Gaps

**Probability:** Medium (60%)
**Impact:** Medium (content loss or duplication)
**Severity:** MEDIUM

#### Description
The PRD requires migrating 4 hardcoded posts from `page.tsx` array to markdown files, but:

**Current hardcoded posts in `page.tsx`:**
1. "Seven Plugins, Zero Errors" — `seven-plugins-zero-errors.md` exists (7084 bytes)
2. "Why We Bet on EmDash" — NO `.md` file exists
3. "Portable Text for Agents" — NO `.md` file exists
4. "How We Built 3 Sites" — NO `.md` file exists

**Markdown files that exist:**
- `the-night-shift.md` (7084 bytes)
- `seven-plugins-zero-errors.md` (10668 bytes)
- `model-selection-multi-agent.md` (8046 bytes)

#### Mismatch
- `seven-plugins-zero-errors.md` exists but content might differ from hardcoded version
- 3 hardcoded posts have no corresponding `.md` files
- 2 markdown files exist but aren't in hardcoded array

#### Risk
1. Content loss: Hardcoded versions might have been edited; markdown versions are out of sync
2. Duplication: Posts appearing twice if both hardcoded and markdown versions are used
3. Confusion: Which version is source of truth?

#### Mitigation Strategy
1. Compare hardcoded vs. `.md` content for each post (diff command)
2. Remove hardcoded array entirely (don't keep both)
3. Create markdown files for missing posts, or remove from visible blog
4. Single source of truth: markdown files only

#### Detection Method
- Manual: Diff `/home/agent/shipyard-ai/website/src/app/blog/page.tsx` content vs. `.md` files
- Check count: `ls src/app/blog/*.md | wc -l` should equal number of visible posts

---

### RISK-012: TypeScript Types for BlogPost Incomplete

**Probability:** Medium (50%)
**Impact:** Low-Medium (type errors during build)
**Severity:** MEDIUM

#### Description
The PRD shows `BlogPost` interface:
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string; // rendered HTML
}
```

But missing fields:
- `published?: boolean` (for content gating)
- `author?: string` (mentioned in existing posts)
- `excerpt?: string` (mentioned in Decisions)

#### Implementation Risk
When `gray-matter` parses files, additional fields exist but aren't typed. Accessing `post.published` will cause TypeScript error if not in interface.

#### Mitigation Strategy
1. Update interface to include all documented fields:
   ```typescript
   export interface BlogPost {
     slug: string;
     title: string;
     description: string;
     date: string;
     tags: string[];
     published: boolean;
     author?: string;
     excerpt?: string;
     content: string;
   }
   ```
2. Mark optional fields with `?:`
3. Provide default values in parsing logic

#### Detection Method
- Build: `npm run build` should show no TypeScript errors
- Test: `tsc --noEmit` should pass without warnings

---

## MEDIUM RISKS (Watch, But Not Blocking)

### RISK-013: Syntax Highlighting Plugin Compatibility

**Probability:** Low-Medium (40%)
**Impact:** Low (feature degradation)
**Severity:** MEDIUM

#### Description
`rehype-highlight` requires Prism.js as peer dependency. Version mismatches between `rehype-highlight`, `react-markdown`, and `unified` ecosystem can cause:
- Syntax highlighting not applying to code blocks
- Missing language support (TypeScript, YAML, etc.)
- Bundle bloat if all language grammars are included

#### Current State
- `rehype-highlight` not yet installed
- No package-lock.json version pinning for markdown stack

#### Mitigation Strategy
1. Install with explicit versions: `npm install rehype-highlight@^6`
2. Test build locally: `npm run build && grep -r "highlight" out/blog/*/index.html | head -5`
3. Verify TypeScript syntax highlighting works (used heavily in posts)

#### Detection Method
- Visual: After deploy, check code blocks have colored keywords/types
- Fallback: Ensure code blocks at minimum render as `<pre><code>` even if highlighting fails

---

### RISK-014: Performance: fs.readdirSync on Large Post Count

**Probability:** Low-Medium (35% at V1, High at 100+ posts)
**Impact:** Low-Medium (slow builds)
**Severity:** MEDIUM

#### Description
The Decisions document already flags this:
> "V1: Simple fs.readFileSync (sufficient for 6-50 posts)"
> "V2 (100+ posts): Enable ISR with edge caching"

Current implementation uses:
```typescript
export function getAllPostSlugs(): string[] {
  const files = fs.readdirSync(postsDirectory);  // Synchronous I/O
  return files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
}
```

At V1 (6 posts): ~5ms
At 50 posts: ~25-50ms
At 600 posts: Build time becomes 3-8 minutes (unacceptable for CI/CD)

#### Why This Matters for Static Export
Every build reads all `.md` files synchronously. With static export, the entire site is pre-rendered at build time, so all posts are read.

#### Current Scope
- V1 ships with 6 posts (acceptable)
- Risk is future-facing (when daemon writes hundreds of posts)

#### Mitigation Strategy
1. Monitor build time metric: `npm run build 2>&1 | grep "Generated .* pages"`
2. When build time exceeds 2 minutes, switch to ISR (next.js 13+)
3. Or implement parallel file reading if JavaScript async isn't sufficient

#### Detection Method
- Build perf check: `time npm run build` — should be < 30s at V1
- Future: Set alarm at 100 posts; if build > 1min, plan ISR migration

---

## LOW-RISK ITEMS (Monitor)

### RISK-015: Next.js 16.2.2 API Stability

**Probability:** Low (20%)
**Impact:** Medium (API changes, deprecated features)
**Severity:** LOW

#### Description
The project uses Next.js 16.2.2. This is a recent version (2026 release). Risks:
- `generateStaticParams` is well-established, but edge cases might exist
- Static export is stable in Next.js 14+, but updates might introduce bugs
- Unknown: any breaking changes in 16.2.2 not yet discovered

#### Current State
- `package.json` specifies `"next": "16.2.2"`
- The exact Next.js APIs (generateMetadata, generateStaticParams) are documented in PRD

#### Mitigation Strategy
1. Test with local build: `npm run build` before deploying to Cloudflare
2. Check Next.js release notes for 16.2.2 for any static export changes
3. Monitor Next.js GitHub for issues related to static export + markdown

#### Detection Method
- Build: `npm run build` should succeed without deprecation warnings
- Test: `npx tsc --noEmit` should pass

---

### RISK-016: Content Scaling: Pagination Not Planned

**Probability:** Low-Medium (30%)
**Impact:** Low (UX degradation at scale)
**Severity:** LOW

#### Description
The blog index currently will list all posts on one page. At 6 posts, this is fine. At 100+ posts, it becomes unwieldy.

The Decisions document explicitly defers pagination:
> "V1: No pagination, tags, search, comments, analytics"

So this is intentional scope cut, not a risk. But it's worth noting:
- If daemon writes 50+ posts in a week, blog index becomes very long
- No ability to filter by date or category (also deferred to V2)

#### Why Not a Risk
This is a documented, intentional limitation. Not a bug.

#### Mitigation Strategy
Defer to V2 as planned. Monitor content volume; if blog index exceeds 1000px vertical, plan pagination.

---

### RISK-017: RSS Feed Format Validation

**Probability:** Low (25%)
**Impact:** Low (syndication issues)
**Severity:** LOW

#### Description
RSS feeds have strict XML formatting requirements. If malformed:
- Feedreaders won't parse the feed
- Hacker News scraper might not pick up posts
- Validation is easy but not automated

#### Risk is Low Because
- RSS 2.0 format is well-defined and simple
- Validation tool (feedvalidator.org) is readily available
- Can be tested post-deployment

#### Mitigation Strategy
1. Implement RSS generation (planned in Decisions)
2. Validate with: https://validator.w3.org/feed/
3. Test with common readers (Feedly, Apple News)

#### Detection Method
- Post-deploy: `curl https://www.shipyard.company/blog/rss.xml | xmllint --noout -` should pass

---

## DEPENDENCY RISKS

### RISK-018: gray-matter Version Compatibility

**Probability:** Low (15%)
**Impact:** Low (frontmatter parsing failures)
**Severity:** LOW

#### Description
`gray-matter` is a stable library, but version selection matters:
- gray-matter 4.0+: Works well with YAML frontmatter
- gray-matter 5.0+ (beta): Potential breaking changes

The PRD doesn't specify a version.

#### Mitigation Strategy
1. Install latest stable: `npm install gray-matter@^4`
2. Test parsing with existing markdown files
3. Verify YAML parsing handles unquoted values

#### Detection Method
- Test: `npm install && npm run build && npm run lint`

---

### RISK-019: react-markdown + Next.js 16 Compatibility

**Probability:** Low (20%)
**Impact:** Medium (component rendering issues)
**Severity:** LOW

#### Description
`react-markdown` is designed for React 16+, but compatibility with Next.js 16's server/client component boundaries might have issues:
- If `react-markdown` is used in a Server Component, it must be marked `'use client'`
- Mixing Server + Client components incorrectly causes hydration errors

#### Current State
- `react-markdown` not installed yet
- Blog page structure not yet created

#### Mitigation Strategy
1. Mark post page as `'use client'` at the top if using `react-markdown`
2. Test hydration: `npm run build && npm run dev`, load blog page, check console for warnings

#### Detection Method
- Build: No "cannot find client component" errors
- Runtime: No hydration mismatch warnings in browser console

---

## ACCESSIBILITY & QUALITY RISKS

### RISK-020: Code Block Accessibility

**Probability:** Medium (50%)
**Impact:** Low-Medium (accessibility compliance)
**Severity:** MEDIUM

#### Description
The blog contains many code blocks. Accessibility risks:
- Code blocks must have proper `<pre><code>` structure
- Syntax highlighting shouldn't break screen reader parsing
- Long lines should not cause horizontal scroll on mobile (readability issue)

#### Current State
- Using `rehype-highlight` (good, provides proper HTML structure)
- Unknown: CSS overflow handling for long code lines

#### Mitigation Strategy
1. Ensure code blocks use semantic HTML: `<pre><code class="language-typescript">`
2. Add CSS class for code wrapping: `overflow-x-auto` on mobile
3. Test with screen reader (NVDA or JAWS) on a post

#### Detection Method
- Code check: `npm run build && grep -o '<pre>' out/blog/*/index.html | wc -l` should be > 0
- Accessibility audit: Run Lighthouse on `/blog/seven-plugins-zero-errors`

---

### RISK-021: SEO: Meta Tags and OpenGraph

**Probability:** Low-Medium (35%)
**Impact:** Low (minor SEO impact)
**Severity:** LOW

#### Description
Individual post pages should have proper meta tags for SEO and social sharing. The PRD shows `generateMetadata`:

```typescript
export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    title: `${post.title} — Shipyard AI`,
    description: post.description,
    openGraph: { ... }
  };
}
```

Risk: If `generateMetadata` is omitted, posts won't have OpenGraph tags, and social shares won't have preview images/descriptions.

#### Mitigation Strategy
1. Implement `generateMetadata` as shown in PRD
2. Test: View page source after deploy, verify `<meta og:title>`, `<meta description>`
3. Test social sharing: Paste URL in Twitter/Slack, verify card preview

#### Detection Method
- Visual: Share `/blog/seven-plugins-zero-errors` on Twitter, check if preview renders
- Code check: `curl https://www.shipyard.company/blog/the-night-shift | grep '<meta'` should show og:title, og:description

---

## SUMMARY: RISK MATRIX

| Risk ID | Risk Name | Probability | Impact | Severity | Status |
|---------|-----------|-------------|--------|----------|--------|
| RISK-001 | Decision vs. PRD Mismatch (remark-html vs. react-markdown) | High (70%) | High | CRITICAL | Requires resolution |
| RISK-002 | fs Module in Static Export | High (90%) | High | CRITICAL | Requires careful implementation |
| RISK-003 | Missing generateStaticParams | Medium (60%) | High | CRITICAL | Requires explicit code |
| RISK-004 | Frontmatter Schema Mismatch | High (75%) | Medium | HIGH | Requires normalization |
| RISK-005 | Missing published Field Logic | High (85%) | Medium | HIGH | Requires PRD update |
| RISK-006 | RSS Feed Not in PRD | High (80%) | Medium | HIGH | Requires implementation plan |
| RISK-007 | Bundle Size Not Monitored | Medium (70%) | Medium | HIGH | Requires measurement |
| RISK-008 | Markdown Special Characters | Medium (65%) | Low-Medium | MEDIUM | Requires testing |
| RISK-009 | Design Consistency | Medium (60%) | Low | MEDIUM | Requires review |
| RISK-010 | Cloudflare Deploy Validation | Medium (55%) | Medium | MEDIUM | Requires test plan |
| RISK-011 | Post Migration Gaps | Medium (60%) | Medium | MEDIUM | Requires audit |
| RISK-012 | Incomplete TypeScript Types | Medium (50%) | Low-Medium | MEDIUM | Requires interface update |
| RISK-013 | Syntax Highlighting Plugin | Low-Medium (40%) | Low | MEDIUM | Requires version check |
| RISK-014 | fs.readdirSync Performance | Low-Medium (35%) | Low-Medium | MEDIUM | Deferred to V2 |
| RISK-015 | Next.js API Stability | Low (20%) | Medium | LOW | Monitor releases |
| RISK-016 | Pagination Not Planned | Low-Medium (30%) | Low | LOW | Documented as V2 |
| RISK-017 | RSS Validation | Low (25%) | Low | LOW | Post-deploy check |
| RISK-018 | gray-matter Version | Low (15%) | Low | LOW | Use semantic versioning |
| RISK-019 | react-markdown Compatibility | Low (20%) | Medium | LOW | Requires testing |
| RISK-020 | Code Block Accessibility | Medium (50%) | Low-Medium | MEDIUM | Requires audit |
| RISK-021 | SEO Meta Tags | Low-Medium (35%) | Low | LOW | Requires implementation |

---

## CRITICAL PATH TO SAFE IMPLEMENTATION

**Before Implementation Starts:**
1. ✅ RESOLVE: Confirm final decision between `react-markdown` vs `remark-html` (RISK-001)
2. ✅ RESOLVE: Update PRD to include `published` field schema (RISK-005)
3. ✅ RESOLVE: Add RSS feed generation to PRD (RISK-006)
4. ✅ AUDIT: Normalize all existing `.md` files to canonical schema (RISK-004, RISK-011)
5. ✅ ESTABLISH: Baseline bundle size before adding dependencies (RISK-007)

**During Implementation:**
1. ✅ ADD: `generateStaticParams()` is non-negotiable in `[slug]/page.tsx` (RISK-003)
2. ✅ MARK: All `fs` imports must be in files that never export client components (RISK-002)
3. ✅ FILTER: `getAllPosts()` must filter by `published: true` (RISK-005)
4. ✅ TYPE: Complete `BlogPost` interface with all fields (RISK-012)
5. ✅ TEST: Each existing `.md` file renders correctly in post page (RISK-008)

**Before Deployment:**
1. ✅ BUILD: Local `npm run build` succeeds without errors
2. ✅ VALIDATE: Static output has all expected routes (`ls -R out/blog/`)
3. ✅ VERIFY: Bundle size increase is < 100KB (RISK-007)
4. ✅ PREVIEW: Local staging site looks identical to design specs (RISK-009)
5. ✅ RSS: Validate `/blog/rss.xml` with feedvalidator.org (RISK-006)

**After Deployment:**
1. ✅ SMOKE TEST: `curl https://www.shipyard.company/blog` returns 200
2. ✅ ROUTE TEST: Each post URL returns 200, not 404
3. ✅ SEO TEST: View page source, verify meta tags
4. ✅ SHARE TEST: Share post URL on Twitter, verify OpenGraph preview
5. ✅ MONITOR: Watch error logs for next 24 hours

---

**END OF RISK REGISTER**
