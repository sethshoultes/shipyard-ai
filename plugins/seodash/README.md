# @shipyard/seodash

SEO toolkit for EmDash CMS: meta tags, sitemaps, robots.txt, social previews, SEO auditing.

## Features

- **Page SEO Management** — Per-page title, description, canonical URL, robots directives, Open Graph, Twitter Cards, JSON-LD structured data
- **SEO Audit Engine** — Automated auditing with scoring (title length, description length, missing OG images, etc.)
- **XML Sitemap** — Auto-generated sitemap excluding noindex pages, with configurable changefreq/priority
- **Robots.txt** — Configurable robots.txt with custom rules and automatic sitemap inclusion
- **Social Preview** — OG and Twitter Card meta tag generation for server-side injection
- **Admin UI** — Dashboard widgets for SEO score and issues, pages list, audit report

## Installation

```bash
npm install @shipyard/seodash
```

## Usage

### Plugin Registration

```typescript
import { seodashPlugin } from "@shipyard/seodash";

// Register with EmDash
emdash.registerPlugin(seodashPlugin());
```

### Astro Components

```astro
---
import { SeoHead } from "@shipyard/seodash/astro";
---

<head>
  <SeoHead path={Astro.url.pathname} />
</head>
```

## Testing

```bash
npm test
```
