# PRD: Build Proper Blog Infrastructure — Markdown-Driven Posts with Dynamic Routing

> Priority: p0

## Problem

The Shipyard blog at `website/src/app/blog/page.tsx` hardcodes all posts as a TypeScript array with inline content strings. This means:
- Adding a post requires editing React code and escaping backticks in template literals
- No individual post URLs (everything renders on one page)
- No SEO — no per-post meta tags, no crawlable URLs
- Blog posts written by the daemon as `.md` files sit unused in the blog directory

The blog should read from markdown files with YAML frontmatter, render individual post pages at `/blog/[slug]`, and auto-discover new posts from the filesystem.

## CRITICAL: Do NOT Break the Existing Site

The website is a Next.js static export (`output: "export"` in `next.config.ts`) deployed to Cloudflare Pages. All changes must work with static export — no server-side rendering, no API routes. `generateStaticParams()` is required for dynamic routes.

## Architecture

```
website/src/app/blog/
├── page.tsx              ← Blog index (list all posts)
├── [slug]/
│   └── page.tsx          ← Individual post page
└── posts/
    ├── the-night-shift.md
    ├── seven-plugins-zero-errors.md
    ├── model-selection-multi-agent.md
    ├── why-we-bet-on-emdash.md
    ├── portable-text-for-agents.md
    └── three-sites-one-session.md
```

### Markdown Format

Each `.md` file in `blog/posts/` uses YAML frontmatter:

```markdown
---
title: "Post Title"
description: "One-line description for meta tags and index page"
date: "2026-04-15"
tags: ["ai", "architecture"]
---

Post content in standard markdown. Code blocks, headings, links all work.
```

## Requirements

### 1. Install Dependencies

Add markdown processing packages to `website/package.json`:

```bash
cd website && npm install gray-matter remark remark-html
```

- `gray-matter` — parse YAML frontmatter from `.md` files
- `remark` + `remark-html` — convert markdown to HTML

### 2. Create Blog Utility (`website/src/lib/blog.ts`)

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/app/blog/posts');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string; // rendered HTML
}

export function getAllPostSlugs(): string[] {
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getAllPosts(): BlogPost[] {
  const slugs = getAllPostSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);

  const processedContent = remark().use(html).processSync(content);

  return {
    slug,
    title: data.title,
    description: data.description || '',
    date: data.date,
    tags: data.tags || [],
    content: processedContent.toString(),
  };
}
```

### 3. Create Individual Post Page (`website/src/app/blog/[slug]/page.tsx`)

```typescript
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';

// Required for static export
export function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  return {
    title: `${post.title} — Shipyard AI`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.shipyard.company/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  // Render with the same styling as the existing blog page
  // Use prose classes for markdown content
  // Include back link to /blog
  // Include date, title, tags
}
```

Match the existing design: dark theme, `prose prose-invert`, mono font for dates, same max-width and spacing as current blog page. Look at the existing `page.tsx` for the exact CSS classes and layout patterns.

### 4. Update Blog Index (`website/src/app/blog/page.tsx`)

Replace the hardcoded `posts` array with:

```typescript
import { getAllPosts } from '@/lib/blog';

const posts = getAllPosts();
```

Each post on the index should link to `/blog/${post.slug}` instead of rendering inline content. Show: date, title, description, and a "Read more" link.

Keep the hero section and subscribe CTA exactly as they are.

### 5. Migrate Existing Posts to Markdown

Move the 4 existing hardcoded posts from the `posts` array into markdown files in `blog/posts/`:

- `why-we-bet-on-emdash.md`
- `portable-text-for-agents.md`
- `three-sites-one-session.md`
- `seven-plugins-zero-errors.md` (already exists as .md, verify content matches)

And add the 2 new posts that are currently only in deliverables:

- `the-night-shift.md` — copy from `deliverables/blog-daemon-architecture/the-night-shift.md`
- `model-selection-multi-agent.md` — copy from `deliverables/blog-model-selection/model-selection-multi-agent.md`

Total: 6 markdown files in `blog/posts/`.

### 6. Build and Deploy

```bash
cd website && npm run build
CLOUDFLARE_API_TOKEN=cfat_yVizuscq4XqHStwiGFwcl5ACexOUM83ZU93YIJiP67b278df CLOUDFLARE_ACCOUNT_ID=a02352ad1742197c106c1774fcbada2d npx wrangler pages deploy out --project-name=shipyard-ai
```

### 7. Verify

- `curl -s https://www.shipyard.company/blog` — lists all 6 posts with links
- `curl -s https://www.shipyard.company/blog/the-night-shift` — renders full post
- `curl -s https://www.shipyard.company/blog/model-selection-multi-agent` — renders full post
- Each post URL has proper `<title>` and OpenGraph meta tags

## Files to Create

| File | Purpose |
|------|---------|
| `website/src/lib/blog.ts` | Markdown parsing utility |
| `website/src/app/blog/[slug]/page.tsx` | Individual post page |
| `website/src/app/blog/posts/*.md` | 6 markdown blog posts |

## Files to Modify

| File | Change |
|------|--------|
| `website/src/app/blog/page.tsx` | Replace hardcoded array with `getAllPosts()`, add links to individual posts |
| `website/package.json` | Add gray-matter, remark, remark-html dependencies |

## Success Criteria

- [ ] `npm run build` succeeds with no errors
- [ ] Blog index at `/blog` lists all 6 posts with title, date, description
- [ ] Each post has its own URL at `/blog/[slug]`
- [ ] Individual post pages have proper meta tags
- [ ] Code blocks render with syntax highlighting (or at minimum as `<pre><code>`)
- [ ] Design matches existing blog aesthetic (dark theme, prose-invert, mono dates)
- [ ] Deployed to Cloudflare Pages and live at www.shipyard.company
- [ ] Adding a new post is as simple as dropping a `.md` file in `blog/posts/`
- [ ] Committed and pushed to GitHub

## Notes

This is a Next.js static export. Do NOT add API routes or server components that require a Node runtime. Everything must work with `output: "export"` and `generateStaticParams()`. Test the build locally before deploying.

Clean up the orphaned `.md` files in the blog directory root (`blog/seven-plugins-zero-errors.md`, `blog/model-selection-multi-agent.md`, `blog/the-night-shift.md`) after migrating them to `blog/posts/`.
