# Phase 1 Plan — Blog Infrastructure

**Generated**: 2026-04-15
**Project Slug**: blog-infrastructure
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 8
**Waves**: 3
**Estimated Timeline**: 2-3 hours

---

## Project Overview

Convert the Shipyard AI blog from hardcoded posts to markdown-driven posts with dynamic routing. The blog currently has 4 hardcoded posts in `page.tsx` with inline content. After this phase, the blog will read from 6 markdown files in `blog/posts/` and render individual post pages at `/blog/[slug]`.

**Critical Constraint**: Next.js static export (`output: "export"`) - all routes must be pre-generated at build time.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| TR-009 (Install dependencies) | phase-1-task-1 | 1 |
| TR-010 (Create blog utility) | phase-1-task-2 | 1 |
| TR-012 (Create posts directory) | phase-1-task-3 | 1 |
| FR-011, FR-012, FR-013 (Migrate posts to markdown) | phase-1-task-4 | 2 |
| TR-011 (Create dynamic route page) | phase-1-task-5 | 2 |
| FR-001, FR-003 (Update blog index) | phase-1-task-6 | 2 |
| TR-008, QA-007 (Build and verify) | phase-1-task-7 | 3 |
| QA-001, QA-008 (Deploy to Cloudflare Pages) | phase-1-task-8 | 3 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Setup & Infrastructure

These three tasks can run in parallel to set up the foundation for markdown-driven posts.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Install Markdown Dependencies</title>
  <requirement>TR-009: Add gray-matter, remark, and remark-html to package.json</requirement>
  <description>
Install the required npm packages for parsing YAML frontmatter and converting markdown to HTML. These are build-time dependencies that run during static generation.

Per PRD §1: gray-matter parses frontmatter, remark + remark-html converts markdown to HTML.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/package.json" reason="Dependencies file to update" />
  </context>

  <steps>
    <step order="1">Navigate to website directory: cd /home/agent/shipyard-ai/website</step>
    <step order="2">Install dependencies: npm install gray-matter remark remark-html</step>
    <step order="3">Verify installation succeeded (check package.json and package-lock.json)</step>
    <step order="4">Check for any peer dependency warnings or version conflicts</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/shipyard-ai/website && npm list gray-matter remark remark-html</check>
    <check type="manual">package.json shows all 3 dependencies in dependencies section</check>
    <check type="build">npm run build</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>deps: add markdown processing dependencies

Install gray-matter, remark, and remark-html for blog infrastructure:
- gray-matter: Parse YAML frontmatter from markdown files
- remark: Markdown processor
- remark-html: Convert markdown AST to HTML

Required for markdown-driven blog posts with dynamic routing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create Blog Utility Module</title>
  <requirement>TR-006, TR-010: Create lib/blog.ts with markdown parsing functions</requirement>
  <description>
Create the blog utility module that exports getAllPostSlugs(), getAllPosts(), getPostBySlug(), and the BlogPost interface. This module handles all filesystem access and markdown parsing.

Per PRD §2, this module uses gray-matter for frontmatter parsing and remark for HTML conversion.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/blog-infrastructure.md" reason="Contains exact code specification for lib/blog.ts in §2" />
    <file path="/home/agent/shipyard-ai/website/next.config.ts" reason="Confirms static export configuration" />
  </context>

  <steps>
    <step order="1">Create directory: mkdir -p /home/agent/shipyard-ai/website/src/lib</step>
    <step order="2">Create file: /home/agent/shipyard-ai/website/src/lib/blog.ts</step>
    <step order="3">Implement BlogPost interface with fields: slug, title, description, date, tags[], content</step>
    <step order="4">Implement getAllPostSlugs(): read files from src/app/blog/posts/, filter by .md extension, return slugs</step>
    <step order="5">Implement getAllPosts(): map slugs to BlogPost objects, sort by date descending</step>
    <step order="6">Implement getPostBySlug(slug): read file, parse frontmatter with gray-matter, convert markdown with remark+remark-html</step>
    <step order="7">Set postsDirectory path: path.join(process.cwd(), 'src/app/blog/posts')</step>
    <step order="8">Add TypeScript types and export all functions and interfaces</step>
  </steps>

  <verification>
    <check type="manual">File exists at /home/agent/shipyard-ai/website/src/lib/blog.ts</check>
    <check type="manual">Exports BlogPost interface with correct fields</check>
    <check type="manual">Exports getAllPostSlugs(), getAllPosts(), getPostBySlug() functions</check>
    <check type="manual">Uses gray-matter for frontmatter parsing</check>
    <check type="manual">Uses remark().use(html).processSync() for markdown conversion</check>
    <check type="build">cd /home/agent/shipyard-ai/website && npx tsc --noEmit</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 (can run in parallel with task 1) -->
  </dependencies>

  <commit-message>feat(blog): create blog utility module for markdown parsing

Add lib/blog.ts with functions for markdown-driven blog:
- getAllPostSlugs(): List all markdown files from blog/posts/
- getAllPosts(): Parse all posts and sort by date
- getPostBySlug(slug): Load and parse individual post
- BlogPost interface: Type definition for post data

Uses gray-matter for YAML frontmatter, remark for HTML conversion.
Posts directory: src/app/blog/posts/

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Create Posts Directory</title>
  <requirement>TR-012: Create blog/posts/ directory for markdown files</requirement>
  <description>
Create the directory where all blog post markdown files will live. This establishes the canonical location for blog content.

Per PRD architecture, posts go in src/app/blog/posts/ (not at the blog root).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/src/app/blog/" reason="Parent directory for posts/" />
  </context>

  <steps>
    <step order="1">Create directory: mkdir -p /home/agent/shipyard-ai/website/src/app/blog/posts</step>
    <step order="2">Verify directory exists and is accessible</step>
    <step order="3">Add .gitkeep file to ensure directory is tracked by git (optional)</step>
  </steps>

  <verification>
    <check type="manual">Directory exists at /home/agent/shipyard-ai/website/src/app/blog/posts/</check>
    <check type="build">ls -la /home/agent/shipyard-ai/website/src/app/blog/posts/</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>feat(blog): create posts directory for markdown files

Add src/app/blog/posts/ directory as canonical location for blog content.
All blog posts will be stored as .md files in this directory.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Content & Routes

These three tasks depend on Wave 1 completing but can run in parallel with each other.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Migrate Blog Posts to Markdown Files</title>
  <requirement>FR-011, FR-012, FR-013, FR-015: Create 6 markdown files and clean up orphans</requirement>
  <description>
Migrate the 4 existing hardcoded posts to markdown files and add the 2 new daemon posts. This creates exactly 6 markdown files in blog/posts/ with proper YAML frontmatter.

Existing posts (from page.tsx array):
1. seven-plugins-zero-errors
2. why-we-bet-on-emdash
3. portable-text-for-agents
4. three-sites-one-session

New posts (from deliverables):
5. the-night-shift
6. model-selection-multi-agent

Also clean up orphaned .md files from blog root.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/src/app/blog/page.tsx" reason="Contains 4 hardcoded posts to migrate" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/the-night-shift.md" reason="Existing markdown file to move" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/model-selection-multi-agent.md" reason="Existing markdown file to move" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/seven-plugins-zero-errors.md" reason="Existing markdown file to move" />
    <file path="/home/agent/shipyard-ai/deliverables/blog-daemon-architecture/the-night-shift.md" reason="Source for night-shift post" />
    <file path="/home/agent/shipyard-ai/deliverables/blog-model-selection/model-selection-multi-agent.md" reason="Source for model-selection post" />
  </context>

  <steps>
    <step order="1">Read existing blog/page.tsx to extract hardcoded post content (4 posts)</step>
    <step order="2">For "seven-plugins-zero-errors": Move existing blog/seven-plugins-zero-errors.md to blog/posts/, verify frontmatter</step>
    <step order="3">For "why-we-bet-on-emdash": Create blog/posts/why-we-bet-on-emdash.md with frontmatter (title, date: 2026-04-04, description, tags) and content from page.tsx</step>
    <step order="4">For "portable-text-for-agents": Create blog/posts/portable-text-for-agents.md with frontmatter and content from page.tsx</step>
    <step order="5">For "three-sites-one-session": Create blog/posts/three-sites-one-session.md with frontmatter and content from page.tsx</step>
    <step order="6">For "the-night-shift": Move blog/the-night-shift.md to blog/posts/ (already has frontmatter)</step>
    <step order="7">For "model-selection-multi-agent": Move blog/model-selection-multi-agent.md to blog/posts/ (already has frontmatter)</step>
    <step order="8">Verify all 6 files exist in blog/posts/ with valid YAML frontmatter</step>
    <step order="9">Clean up: Remove any remaining .md files from blog/ root (orphaned files)</step>
    <step order="10">Verify frontmatter schema: title, description, date, tags fields present</step>
  </steps>

  <verification>
    <check type="manual">Exactly 6 .md files in /home/agent/shipyard-ai/website/src/app/blog/posts/</check>
    <check type="manual">Each file has valid YAML frontmatter with title, date, description, tags</check>
    <check type="manual">No .md files remain in /home/agent/shipyard-ai/website/src/app/blog/ root</check>
    <check type="build">ls -1 /home/agent/shipyard-ai/website/src/app/blog/posts/*.md | wc -l</check>
    <check type="manual">All slugs match: seven-plugins-zero-errors, why-we-bet-on-emdash, portable-text-for-agents, three-sites-one-session, the-night-shift, model-selection-multi-agent</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Needs posts/ directory to exist" />
  </dependencies>

  <commit-message>feat(blog): migrate posts to markdown files

Convert 4 hardcoded posts to markdown and add 2 new daemon posts:

Migrated from page.tsx:
- seven-plugins-zero-errors.md
- why-we-bet-on-emdash.md
- portable-text-for-agents.md
- three-sites-one-session.md

Added new posts:
- the-night-shift.md (daemon architecture)
- model-selection-multi-agent.md (model selection)

All posts now in src/app/blog/posts/ with YAML frontmatter.
Cleaned up orphaned .md files from blog root.

Total: 6 markdown files ready for dynamic routing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Create Dynamic Post Route Page</title>
  <requirement>TR-002, TR-003, TR-011, FR-002, FR-007-FR-010: Create blog/[slug]/page.tsx</requirement>
  <description>
Create the dynamic route page that renders individual blog posts at /blog/[slug]. This page uses generateStaticParams() to pre-generate all routes at build time and generateMetadata() for SEO.

Per PRD §3, this page must work with static export, so generateStaticParams() is mandatory.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/blog-infrastructure.md" reason="Contains exact code specification for [slug]/page.tsx in §3" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/page.tsx" reason="Reference for styling patterns and design tokens" />
    <file path="/home/agent/shipyard-ai/website/src/lib/blog.ts" reason="Blog utility functions to import" />
  </context>

  <steps>
    <step order="1">Create directory: mkdir -p /home/agent/shipyard-ai/website/src/app/blog/[slug]</step>
    <step order="2">Create file: /home/agent/shipyard-ai/website/src/app/blog/[slug]/page.tsx</step>
    <step order="3">Import getAllPostSlugs, getPostBySlug from @/lib/blog</step>
    <step order="4">Implement generateStaticParams(): return getAllPostSlugs().map(slug => ({ slug }))</step>
    <step order="5">Implement generateMetadata({ params }): call getPostBySlug(params.slug), return Metadata with title, description, openGraph</step>
    <step order="6">Implement default component: receive params.slug, call getPostBySlug(), render post</step>
    <step order="7">Add styling matching existing blog: prose prose-invert, dark theme, monospace dates, same spacing</step>
    <step order="8">Add back link to /blog at top of post</step>
    <step order="9">Display metadata: date (monospace), title, tags (optional)</step>
    <step order="10">Render content using dangerouslySetInnerHTML (content is already sanitized HTML from remark)</step>
    <step order="11">Add TypeScript types for params: { params: { slug: string } }</step>
  </steps>

  <verification>
    <check type="manual">File exists at /home/agent/shipyard-ai/website/src/app/blog/[slug]/page.tsx</check>
    <check type="manual">Exports generateStaticParams() function</check>
    <check type="manual">Exports generateMetadata() function</check>
    <check type="manual">Default component renders post content</check>
    <check type="manual">Styling matches existing blog (prose-invert, dark theme)</check>
    <check type="manual">Back link to /blog visible</check>
    <check type="manual">Date displayed in monospace font</check>
    <check type="build">cd /home/agent/shipyard-ai/website && npx tsc --noEmit</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Needs lib/blog.ts functions" />
    <depends-on task-id="phase-1-task-4" reason="Needs markdown files to generate routes" />
  </dependencies>

  <commit-message>feat(blog): create dynamic route for individual posts

Add blog/[slug]/page.tsx to render individual post pages:

Features:
- generateStaticParams(): Pre-generate all post routes at build time
- generateMetadata(): SEO with title, description, OpenGraph tags
- Dynamic rendering from markdown files
- Design matches existing blog (dark theme, prose-invert)
- Monospace dates, back link to /blog
- Works with static export (output: "export")

Routes: /blog/seven-plugins-zero-errors, /blog/the-night-shift, etc.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Update Blog Index to Use Markdown</title>
  <requirement>FR-001, FR-003, FR-014: Replace hardcoded posts array with getAllPosts()</requirement>
  <description>
Refactor blog/page.tsx to read posts from markdown files instead of hardcoded array. Replace inline content with "Read more" links to individual post pages. Preserve hero section and subscribe CTA.

Per PRD §4, keep existing hero/CTA sections unchanged - only modify the posts display logic.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/src/app/blog/page.tsx" reason="Blog index page to refactor" />
    <file path="/home/agent/shipyard-ai/website/src/lib/blog.ts" reason="Import getAllPosts() from here" />
  </context>

  <steps>
    <step order="1">Read current blog/page.tsx to understand structure</step>
    <step order="2">Import getAllPosts from @/lib/blog</step>
    <step order="3">Replace const posts = [...] with const posts = getAllPosts()</step>
    <step order="4">Update post rendering: Remove inline content display</step>
    <step order="5">Add "Read more" links: Link each post title or add explicit link to /blog/${post.slug}</step>
    <step order="6">Display: date (monospace), title, description (from frontmatter)</step>
    <step order="7">Keep hero section unchanged (lines ~214-228)</step>
    <step order="8">Keep subscribe CTA unchanged (lines ~261-280)</step>
    <step order="9">Verify styling remains consistent (same classes, same layout)</step>
    <step order="10">Test that all 6 posts appear in index</step>
  </steps>

  <verification>
    <check type="manual">Imports getAllPosts from @/lib/blog</check>
    <check type="manual">No hardcoded posts array (removed)</check>
    <check type="manual">Posts map includes Link to /blog/${post.slug}</check>
    <check type="manual">Hero section preserved (unchanged)</check>
    <check type="manual">Subscribe CTA preserved (unchanged)</check>
    <check type="manual">Display shows date, title, description (not full content)</check>
    <check type="build">cd /home/agent/shipyard-ai/website && npx tsc --noEmit</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Needs lib/blog.ts functions" />
    <depends-on task-id="phase-1-task-4" reason="Needs markdown files to display" />
  </dependencies>

  <commit-message>feat(blog): update index to use markdown files

Refactor blog/page.tsx to read from markdown instead of hardcoded array:

Changes:
- Replace hardcoded posts array with getAllPosts() from lib/blog
- Display title, date, description from frontmatter
- Add "Read more" links to /blog/[slug] pages
- Remove inline content display

Preserved:
- Hero section unchanged
- Subscribe CTA unchanged
- Design and styling consistent

Now shows all 6 markdown posts with links to individual pages.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Build & Deploy

These tasks must run sequentially after Wave 2 completes.

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Build and Verify Static Generation</title>
  <requirement>TR-001, TR-008, QA-007: Build succeeds and all routes generate correctly</requirement>
  <description>
Run npm run build to verify that static generation works correctly. All blog post routes should be pre-generated as static HTML files. Verify no build errors and inspect the output directory.

This is the critical verification that the markdown-driven blog works with Next.js static export.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/next.config.ts" reason="Confirms output: 'export' configuration" />
    <file path="/home/agent/shipyard-ai/website/package.json" reason="Build script definition" />
  </context>

  <steps>
    <step order="1">Navigate to website directory: cd /home/agent/shipyard-ai/website</step>
    <step order="2">Run build: npm run build</step>
    <step order="3">Verify build exits with code 0 (no errors)</step>
    <step order="4">Check build output for: "Exported X routes"</step>
    <step order="5">Inspect out/ directory: ls out/blog/</step>
    <step order="6">Verify individual post HTML files exist: ls out/blog/the-night-shift.html out/blog/model-selection-multi-agent.html</step>
    <step order="7">Verify blog index exists: ls out/blog.html or out/blog/index.html</step>
    <step order="8">Check for TypeScript errors: npx tsc --noEmit</step>
    <step order="9">Run lint if available: npm run lint (optional)</step>
  </steps>

  <verification>
    <check type="build">cd /home/agent/shipyard-ai/website && npm run build</check>
    <check type="manual">Build exits with code 0</check>
    <check type="manual">No error messages in build output</check>
    <check type="manual">out/blog/ directory contains HTML files for all posts</check>
    <check type="build">ls /home/agent/shipyard-ai/website/out/blog/*.html</check>
    <check type="manual">All 6 post routes generated as static HTML</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Needs markdown files" />
    <depends-on task-id="phase-1-task-5" reason="Needs dynamic route page" />
    <depends-on task-id="phase-1-task-6" reason="Needs updated index page" />
  </dependencies>

  <commit-message>test(blog): verify static build with markdown posts

Run npm run build to confirm:
✅ Static export works with markdown-driven blog
✅ All 6 post routes pre-generated as HTML
✅ Blog index renders correctly
✅ No TypeScript errors
✅ No build errors

Output directory contains all expected static files.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Deploy to Cloudflare Pages</title>
  <requirement>QA-001, QA-002, QA-003, QA-004, QA-008: Deploy and verify production</requirement>
  <description>
Deploy the static site to Cloudflare Pages and verify all blog routes are accessible. Test blog index and individual post pages with curl to confirm proper deployment.

Per PRD §6-7, this is the final success criteria - the blog must be live and accessible.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/out/" reason="Static build output to deploy" />
    <file path="/home/agent/shipyard-ai/prds/blog-infrastructure.md" reason="Deployment command in §6" />
  </context>

  <steps>
    <step order="1">Ensure build succeeded from previous task (out/ directory exists)</step>
    <step order="2">Navigate to website directory: cd /home/agent/shipyard-ai/website</step>
    <step order="3">Deploy using wrangler: CLOUDFLARE_API_TOKEN= CLOUDFLARE_ACCOUNT_ID=a02352ad1742197c106c1774fcbada2d npx wrangler pages deploy out --project-name=shipyard-ai</step>
    <step order="4">Wait for deployment to complete</step>
    <step order="5">Verify blog index: curl -s https://www.shipyard.company/blog | grep -i "night shift"</step>
    <step order="6">Verify individual post: curl -s https://www.shipyard.company/blog/the-night-shift | grep -i "title"</step>
    <step order="7">Verify another post: curl -s https://www.shipyard.company/blog/model-selection-multi-agent | grep -i "model"</step>
    <step order="8">Check meta tags: curl -s https://www.shipyard.company/blog/the-night-shift | grep "og:title"</step>
    <step order="9">Verify all 6 posts accessible (test each URL)</step>
  </steps>

  <verification>
    <check type="build">curl -s https://www.shipyard.company/blog</check>
    <check type="manual">Blog index returns HTML with all 6 posts</check>
    <check type="build">curl -s https://www.shipyard.company/blog/the-night-shift</check>
    <check type="manual">Individual post returns full HTML content</check>
    <check type="build">curl -s https://www.shipyard.company/blog/model-selection-multi-agent</check>
    <check type="manual">Another post returns full HTML content</check>
    <check type="manual">Meta tags present (title, og:title, og:description)</check>
    <check type="manual">All 6 post URLs accessible</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Needs successful build output" />
  </dependencies>

  <commit-message>deploy(blog): publish markdown-driven blog to production

Deploy blog infrastructure to Cloudflare Pages:

✅ Blog index live at https://www.shipyard.company/blog
✅ Individual posts at /blog/[slug]
✅ All 6 posts accessible:
   - seven-plugins-zero-errors
   - why-we-bet-on-emdash
   - portable-text-for-agents
   - three-sites-one-session
   - the-night-shift
   - model-selection-multi-agent

✅ Meta tags present for SEO
✅ Static generation working correctly
✅ Design matches existing aesthetic

Blog infrastructure complete and live.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

### Critical Risks

1. **remark-html vs react-markdown Conflict**
   - PRD specifies `remark-html`, Decisions mention `react-markdown`
   - **Resolution**: Following PRD specification (remark-html) as it's the authoritative technical document
   - remark-html is lighter and works better with static export
   - Mitigation: Documented in REQUIREMENTS.md

2. **Static Export Compatibility**
   - All dynamic routes must use `generateStaticParams()`
   - No server-side rendering or API routes allowed
   - Mitigation: Task 5 explicitly implements generateStaticParams(), Task 7 verifies build

3. **Content Migration Data Loss**
   - Risk of losing content when converting hardcoded posts to markdown
   - Mitigation: Task 4 carefully extracts content from page.tsx, verifies all 6 files

### Medium Risks

1. **Frontmatter Schema Inconsistency**
   - Existing markdown files may have inconsistent frontmatter
   - Mitigation: Task 4 normalizes frontmatter schema (title, description, date, tags)

2. **Build Time Regression**
   - Adding markdown parsing could slow build
   - Mitigation: Only 6 posts in V1, build time should be <30 seconds

3. **Design Consistency**
   - Individual post pages must match existing aesthetic
   - Mitigation: Task 5 explicitly copies styling from existing blog/page.tsx

### Low Risks

1. **Deployment Failure**
   - Cloudflare Pages deployment could fail
   - Mitigation: Task 7 verifies build locally first, Task 8 retries if needed

2. **Missing Dependencies**
   - npm install could fail due to version conflicts
   - Mitigation: Task 1 checks for peer dependency warnings

---

## Execution Strategy

### Wave 1: Parallel Setup (Est. 15-20 min)
- Tasks 1, 2, 3 run in parallel
- Set up infrastructure and utilities
- No cross-dependencies

### Wave 2: Parallel Implementation (Est. 1-1.5 hours)
- Tasks 4, 5, 6 can run in parallel after Wave 1
- Task 4 (content migration) is most time-consuming
- Task 5 and 6 are coding tasks

### Wave 3: Sequential Build & Deploy (Est. 20-30 min)
- Task 7 (build) must complete before Task 8 (deploy)
- Critical verification before going live

**Total Estimated Time:** 2-3 hours

---

## Quality Checkpoints

### After Wave 1 (Setup Complete)
- [ ] Dependencies installed (gray-matter, remark, remark-html)
- [ ] lib/blog.ts created with all required functions
- [ ] posts/ directory exists

### After Wave 2 (Implementation Complete)
- [ ] All 6 markdown files in posts/ with valid frontmatter
- [ ] [slug]/page.tsx created with generateStaticParams
- [ ] Blog index updated to use getAllPosts()
- [ ] No hardcoded posts array remaining
- [ ] TypeScript compiles with no errors

### After Wave 3 (Deployed)
- [ ] npm run build succeeds
- [ ] All 6 post routes generated as static HTML
- [ ] Deployed to Cloudflare Pages
- [ ] Blog index accessible at /blog
- [ ] All individual posts accessible at /blog/[slug]
- [ ] Meta tags present on post pages
- [ ] Design matches existing aesthetic

---

## Success Criteria

### Technical Success
✅ npm run build succeeds with no errors
✅ All 6 posts migrated to markdown with proper frontmatter
✅ Static generation works for all routes
✅ TypeScript types correct
✅ Dependencies installed correctly

### Functional Success
✅ Blog index lists all 6 posts with links
✅ Individual posts render at /blog/[slug]
✅ Meta tags present for SEO
✅ Design matches existing blog aesthetic
✅ Hero section and subscribe CTA preserved

### Deployment Success
✅ Live at https://www.shipyard.company/blog
✅ All posts accessible via curl
✅ No 404 errors on post routes
✅ Committed and pushed to GitHub

---

**Planning Phase Complete. Ready for Execution.**
