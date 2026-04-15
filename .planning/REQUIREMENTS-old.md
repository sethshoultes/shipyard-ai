# Requirements Traceability Matrix — Blog Infrastructure (FIX BROKEN BUILD)

**Project:** blog-infrastructure
**Generated:** 2026-04-15 (UPDATED)
**Phase:** 1 — FIX PHASE (Post-Mortem Recovery)
**Current Status:** BROKEN BUILD — 70% built, 0% shipped
**Board Score:** 2.67/10 (HOLD pending immediate fixes)
**Sources:**
- `/home/agent/shipyard-ai/prds/blog-infrastructure.md`
- `/home/agent/shipyard-ai/rounds/blog-infrastructure/decisions.md` (RISK-001, RISK-002)

---

## CRITICAL CONTEXT

**What Happened:**
The blog infrastructure was built in a previous session but shipped broken:
- ✅ Code exists: `lib/blog.ts`, `blog/[slug]/page.tsx`, 6 markdown posts
- ❌ Build fails: Frontmatter parsing errors cause `generateStaticParams()` to crash
- ❌ Posts 404: Individual post pages return 404 in production
- ❌ Never tested: `npm run build` was never executed before deployment

**Root Cause (decisions.md RISK-001):**
5 of 6 markdown files have unquoted YAML date fields that break gray-matter parser.

**This Phase Focus:**
Fix the broken build, add validation, verify everything works, document evidence.

---

## PHASE 1 REQUIREMENTS (FIX BLOCKERS)

| ID | Description | Source | Acceptance Criteria |
|---|---|---|---|
| FR-001 | Blog index at `/blog` lists all published posts | PRD §4, Decisions §MVP-2 | HTTP GET `/blog` returns HTML with all published posts displayed with title, date, description |
| FR-002 | Individual posts render at `/blog/[slug]` with dynamic routing | PRD §3, Decisions §III | Can access `/blog/the-night-shift`, `/blog/model-selection-multi-agent` etc. with full post content |
| FR-003 | Blog index shows "Read more" links to individual post pages | PRD §4 | Each post on index links to `/blog/${post.slug}` instead of inline content |
| FR-004 | Parse YAML frontmatter from markdown files | PRD §2, Decisions §MVP-1 | `.md` files with frontmatter are correctly parsed |
| FR-005 | Render markdown content to HTML | PRD §2, Decisions §MVP-3 | Code blocks, headings, links all render correctly |
| FR-006 | Syntax highlighting for code blocks | PRD Success §6, Decisions §MVP-3 | Code blocks render with syntax highlighting or at minimum as `<pre><code>` |
| FR-007 | Individual post pages include OpenGraph meta tags | PRD §3, Decisions §MVP-3 | og:title, og:description, og:url, og:type, article:publishedTime present |
| FR-008 | Individual post pages include HTML `<title>` tag | PRD §3 | `<title>${post.title} — Shipyard AI</title>` in document head |
| FR-009 | Individual post pages have working back link to `/blog` | PRD §3 | Back link visible and clickable on post page |
| FR-010 | Individual post pages display date, title | PRD §3 | Post metadata displayed above content |
| FR-011 | Existing hardcoded posts migrated to markdown files | PRD §5 | 4 existing posts from array exist as `.md` files |
| FR-012 | New daemon posts migrated to markdown files | PRD §5 | `the-night-shift.md` and `model-selection-multi-agent.md` in `blog/posts/` |
| FR-013 | Total of 6 markdown posts in `blog/posts/` directory | PRD §5 | Exactly 6 `.md` files present in `website/src/app/blog/posts/` |
| FR-014 | Hero section and subscribe CTA preserved | PRD §4 | Existing blog index hero/CTA elements remain unchanged |
| FR-015 | Orphaned markdown files cleaned up | PRD Notes | Remove .md files from blog root after migration to posts/ |

---

## TECHNICAL REQUIREMENTS (MUST)

| ID | Description | Source | Acceptance Criteria |
|---|---|---|---|
| TR-001 | Use static export (no SSR) | PRD §15, CLAUDE.md | `output: "export"` in `next.config.ts` works |
| TR-002 | Use `generateStaticParams()` for dynamic routes | PRD §3, §15 | Function returns array of `{ slug: string }` |
| TR-003 | Use `generateMetadata()` for per-page meta tags | PRD §3 | Returns `Metadata` type with proper fields |
| TR-004 | Parse markdown with gray-matter | PRD §1, §2 | `matter()` correctly extracts frontmatter and content |
| TR-005 | Render markdown with remark + remark-html | PRD §1, §2 | Uses remark pipeline to convert markdown to HTML |
| TR-006 | `lib/blog.ts` exports required functions | PRD §2 | Exports: `getAllPostSlugs()`, `getAllPosts()`, `getPostBySlug()`, `BlogPost` interface |
| TR-007 | Posts read from `website/src/app/blog/posts/` directory | PRD §2 | Correct path: `path.join(process.cwd(), 'src/app/blog/posts')` |
| TR-008 | Build completes without errors | PRD Success §1 | `npm run build` exits with code 0 |
| TR-009 | Install required dependencies | PRD §1 | `npm install gray-matter remark remark-html` completes |
| TR-010 | Create blog utility module | PRD §2 | File exists at `website/src/lib/blog.ts` |
| TR-011 | Create dynamic route page | PRD §3 | File exists at `website/src/app/blog/[slug]/page.tsx` |
| TR-012 | Create posts directory | PRD Arch | Directory exists at `website/src/app/blog/posts/` |

---

## QUALITY REQUIREMENTS (MUST)

| ID | Description | Source | Acceptance Criteria |
|---|---|---|---|
| QA-001 | Deployed to Cloudflare Pages | PRD §6, Success §7 | Live at https://www.shipyard.company/blog |
| QA-002 | Blog index accessible via curl | PRD §7 | `curl -s https://www.shipyard.company/blog` returns HTML with 6 posts |
| QA-003 | Individual post accessible via curl | PRD §7 | All 6 post URLs return full HTML content |
| QA-004 | Meta tags present in HTTP response | PRD §7 | HTML source contains proper `<title>` and OpenGraph tags |
| QA-005 | Back button works on individual posts | PRD Success §2 | Browser back button returns to `/blog` index |
| QA-006 | Design matches existing blog aesthetic | PRD §3, §5, Decisions §VII | Dark theme, prose-invert, monospace dates, same spacing |
| QA-007 | Code blocks render properly | PRD Success §6 | Code blocks visible with readable formatting |
| QA-008 | Committed to GitHub | PRD Success §8 | All changes pushed with meaningful commit message |

---

## CRITICAL DECISION RESOLUTION

**RISK-001: react-markdown vs remark-html**

The PRD specifies using `remark` + `remark-html` for server-side markdown conversion to HTML:

```typescript
const processedContent = remark().use(html).processSync(content);
```

The Decisions document mentions `react-markdown` as part of the philosophical discussion about component-based rendering.

**RESOLUTION:** Following the PRD's technical specification since:
1. PRD provides explicit code samples with `remark-html`
2. Static export works best with build-time HTML generation
3. remark-html is lighter weight than react-markdown
4. The implementation is clearly documented in PRD §2

---

## FILES TO CREATE

| File | Purpose | Lines (est) |
|------|---------|-------------|
| `website/src/lib/blog.ts` | Markdown parsing utility | ~50 |
| `website/src/app/blog/[slug]/page.tsx` | Individual post page | ~80 |
| `website/src/app/blog/posts/*.md` | 6 markdown blog posts | 6 files |

---

## FILES TO MODIFY

| File | Change | Lines (est) |
|------|--------|-------------|
| `website/src/app/blog/page.tsx` | Replace hardcoded array with `getAllPosts()`, add links | ~10 |
| `website/package.json` | Add 3 dependencies | ~3 |

---

## SUCCESS CRITERIA SUMMARY

✅ All 6 posts migrated to markdown with proper frontmatter
✅ `/blog` index lists all posts with links to individual pages
✅ `/blog/[slug]` renders full post content with proper styling
✅ `npm run build` succeeds with no errors
✅ Meta tags present on all post pages
✅ Design matches existing aesthetic
✅ Deployed to Cloudflare Pages and accessible
✅ Committed and pushed to GitHub

---

## OUT OF SCOPE

- Tags UI rendering (tags stored in frontmatter but not displayed)
- Search functionality
- Comments system
- Analytics dashboard
- Related posts
- Author attribution
- RSS feed (not mentioned in PRD, may be future enhancement)

---

## Summary Statistics

- **Functional Requirements:** 15
- **Technical Requirements:** 12
- **Quality Requirements:** 8
- **Total MUST Requirements:** 35
