# Emdash CMS: Comprehensive How-To Guide

> A practical guide for building and managing sites with Emdash CMS, written for the Shipyard AI team.

Emdash is a full-stack TypeScript CMS built on [Astro](https://astro.build/) and [Cloudflare](https://www.cloudflare.com/). It takes the ideas that made WordPress dominant -- extensibility, admin UX, a plugin ecosystem -- and rebuilds them on serverless, type-safe foundations. Plugins run in sandboxed Worker isolates, solving the fundamental security problem with WordPress's plugin architecture.

**Key characteristics:**

- **Astro-native** -- not a headless CMS; tightly integrated with Astro's rendering pipeline
- **Database-first schema** -- collections and fields are defined in the database, not code
- **Live Collections** -- content changes appear immediately, no static rebuilds needed
- **Portable Text** -- structured JSON content format (not serialized HTML)
- **Cloud-portable** -- runs on Cloudflare (Workers + D1 + R2), Node.js, SQLite, PostgreSQL, and any S3-compatible storage
- **Sandboxed plugins** -- on Cloudflare, plugins run in isolated V8 Worker isolates with enforced capability restrictions

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Content Management](#2-content-management)
3. [Admin Panel](#3-admin-panel)
4. [Querying Content in Templates](#4-querying-content-in-templates)
5. [Deployment](#5-deployment)
6. [Plugin System](#6-plugin-system)
7. [Theming](#7-theming)
8. [Real Examples from Shipyard Sites](#8-real-examples-from-shipyard-sites)

---

## 1. Getting Started

### Prerequisites

- **Node.js** v22.12.0 or higher (even-numbered versions only)
- **npm**, **pnpm**, or **yarn**
- A code editor (VS Code recommended)
- For Cloudflare deployment: a Cloudflare account (paid plan required for sandboxed plugins, $5/mo)

### Create a New Site

```bash
npm create emdash@latest
```

Follow the prompts to pick a template and name your project. Emdash ships with three official starter templates:

| Template | Description | Use Case |
|----------|-------------|----------|
| **Blog** | Classic blog with sidebar widgets, search, RSS, categories/tags, dark/light mode | Personal blogs, simple sites |
| **Marketing** | Conversion-focused landing page with hero, features, pricing, FAQ, contact form | Landing pages, SaaS, product marketing |
| **Portfolio** | Visual portfolio with project grid, tag filtering, case study pages | Freelancers, agencies, creatives |

Each template comes in two variants:
- **Local** (SQLite + filesystem) -- for development and single-server deployments
- **Cloudflare** (D1 + R2) -- for production deployment on Cloudflare Workers

```bash
# Cloudflare variant example
npm create astro@latest -- --template @emdash-cms/template-marketing-cloudflare
```

### Start the Development Server

```bash
cd my-emdash-site
npm install
npm run dev
```

Open your browser to `http://localhost:4321`.

### Complete the Setup Wizard

On first visit to the admin panel, Emdash's Setup Wizard runs automatically:

1. Navigate to `http://localhost:4321/_emdash/admin`
2. You'll be redirected to the Setup Wizard. Enter:
   - **Site Title** -- your site's name
   - **Tagline** -- a short description
   - **Admin Email** -- your email address
3. Click **Create Site** to register your passkey
4. Your browser will prompt you to create a passkey using Touch ID, Face ID, Windows Hello, or a security key

Once your passkey is registered, you are logged in and redirected to the admin dashboard.

> Emdash uses passkey authentication (WebAuthn) instead of passwords. Passkeys are more secure and work with your browser's built-in credential manager. OAuth and magic link fallbacks are also available.

### Project Structure

```
my-emdash-site/
├── astro.config.mjs      # Astro + Emdash configuration
├── wrangler.jsonc         # Cloudflare Workers config (if using CF)
├── src/
│   ├── live.config.ts    # Live Collections configuration
│   ├── pages/
│   │   ├── index.astro   # Homepage
│   │   └── posts/
│   │       └── [slug].astro  # Dynamic post pages
│   ├── layouts/
│   │   └── Base.astro    # Base layout
│   └── components/       # Your Astro components
├── .emdash/
│   ├── seed.json         # Template seed file
│   └── types.ts          # Generated TypeScript types
├── seed/                  # Seed data (SQL exports, seed.json)
└── package.json
```

### Configuration Files

#### astro.config.mjs

This is the core configuration file. For a Cloudflare deployment (as used in Shipyard sites):

```js
// astro.config.mjs
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://your-site.example.com",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: true } },
});
```

For local development (SQLite + filesystem):

```js
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

export default defineConfig({
  integrations: [
    emdash({
      database: sqlite({ url: "file:./data.db" }),
      storage: local({
        directory: "./uploads",
        baseUrl: "/_emdash/api/media/file",
      }),
    }),
  ],
});
```

#### src/live.config.ts

This connects Emdash to Astro's content system:

```ts
import { defineLiveCollection } from "astro:content";
import { emdashLoader } from "emdash/runtime";

export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
```

Emdash uses a single `_emdash` collection that internally routes to your content types (posts, pages, products, etc.).

#### Environment Variables

```bash
# Required for authentication in production
EMDASH_AUTH_SECRET=your-secret-here

# Optional: for content preview
EMDASH_PREVIEW_SECRET=your-preview-secret
```

Generate a secure auth secret:

```bash
npx emdash auth secret
```

### Generate TypeScript Types

For full type safety, generate types from your database schema:

```bash
npx emdash types
```

This creates `.emdash/types.ts` with interfaces for all your collections. Your editor will autocomplete field names and catch type errors.

---

## 2. Content Management

### Creating Content

1. In the admin sidebar, click a collection name (e.g., **Posts**)
2. Click **New Post** (or the equivalent for your collection)
3. Fill in the required fields:
   - **Title** -- the content's display name
   - **Slug** -- URL identifier (auto-generated from title, editable)
4. Add content using the rich text editor
5. Set metadata in the sidebar:
   - **Status** -- Draft, Published, or Archived
   - **Publication date** -- when to publish
   - **Categories and tags** -- taxonomy assignments
6. Click **Save**

### Content Statuses

| Status | Visibility | Use Case |
|--------|------------|----------|
| **Draft** | Admin only | Work in progress |
| **Published** | Public | Live content |
| **Archived** | Admin only | Retired content |

### The Rich Text Editor

Emdash uses TipTap (ProseMirror) for rich text editing, storing content as Portable Text (structured JSON). The editor supports:

- **Headings** (H2-H6), **bold**, **italic**, **underline**, **strikethrough**
- **Ordered and unordered lists**
- **Links** (internal and external)
- **Images** from the media library
- **Code blocks** with syntax highlighting
- **Embeds** (YouTube, Vimeo, Twitter)
- **Sections** -- reusable content blocks via `/section` slash command

#### Slash Commands

Type `/` in the editor to access quick insert commands:

| Command | Action |
|---------|--------|
| `/section` | Insert a reusable section |
| `/image` | Insert an image from media library |
| `/code` | Insert a code block |

#### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Bold | `Ctrl/Cmd + B` |
| Italic | `Ctrl/Cmd + I` |
| Link | `Ctrl/Cmd + K` |
| Undo | `Ctrl/Cmd + Z` |
| Redo | `Ctrl/Cmd + Shift + Z` |
| Save | `Ctrl/Cmd + S` |

### Editing and Revisions

Changes to published content appear immediately on your site -- no rebuild required. Emdash tracks revision history:

1. Click **Revisions** in the editor sidebar
2. View previous versions with timestamps
3. Click a revision to preview it
4. Click **Restore** to revert (this creates a new revision, preserving history)

### Bulk Operations

1. Use checkboxes to select entries in the content list
2. Click **Bulk Actions** dropdown
3. Select: **Publish**, **Archive**, or **Delete**
4. Confirm the action

### Searching and Filtering

- **Search** by title or content (case-insensitive, partial word matching)
- **Filter** by status, date range, author, or taxonomy term
- Click **Clear Filters** to reset

### Scheduling Content

1. Set status to **Draft**
2. Set the **Publication date** to a future date and time
3. Save -- content automatically publishes when the date arrives

### Collections and Content Types

Emdash uses a **database-first content model**. Collections (content types) are defined in the database, not in code. This means:

- Non-developers can create and modify content types through the admin UI
- Each collection gets a real SQL table with typed columns (`ec_posts`, `ec_products`, etc.)
- Fields get real SQL columns (not WordPress-style EAV/meta tables)
- Schema changes appear immediately without rebuilds

Every content table includes system columns automatically:

| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `slug` | URL identifier (unique) |
| `status` | draft / published / archived |
| `author_id` | Content author |
| `created_at` | Creation timestamp |
| `updated_at` | Last modified timestamp |
| `published_at` | Publication date |
| `deleted_at` | Soft delete marker |
| `version` | Optimistic locking counter |

#### Creating a New Collection via Admin UI

1. Open **Content Types** in the admin panel (admin-only route)
2. Click **Add Collection**
3. Define fields through the visual schema builder
4. Start creating content immediately

#### Field Types

| Field Type | Widget | Description |
|------------|--------|-------------|
| `string` | Text input | Single-line text |
| `text` | Textarea | Multi-line plain text |
| `number` | Number input | Numeric values |
| `boolean` | Toggle switch | True/false |
| `datetime` | Date/time picker | Date and time |
| `select` | Dropdown | Single selection |
| `multiSelect` | Multi-select | Multiple selections |
| `portableText` | TipTap editor | Rich text content |
| `image` | Media picker | Image from media library |
| `reference` | Entry picker | Link to another entry |

### Taxonomies (Categories, Tags, Custom)

Emdash includes two built-in taxonomies:

| Taxonomy | Type | Description |
|----------|------|-------------|
| **Categories** | Hierarchical | Nested classification with parent-child relationships |
| **Tags** | Flat | Simple labels without hierarchy |

#### Managing Terms

Via the admin dashboard:
1. Go to `/_emdash/admin/taxonomies/category`
2. Enter the term name in the **Add New** form
3. Optionally set slug, parent (for hierarchical), description
4. Click **Add**

Via the content editor sidebar:
- For categories: check applicable boxes or click **+ Add New**
- For tags: type tag names separated by commas

Via the API:
```bash
POST /_emdash/api/taxonomies/category/terms
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN

{
  "slug": "tutorials",
  "label": "Tutorials",
  "description": "How-to guides and tutorials"
}
```

#### Custom Taxonomies

Create taxonomies beyond categories and tags:

```bash
POST /_emdash/api/taxonomies
Content-Type: application/json

{
  "name": "genre",
  "label": "Genres",
  "labelSingular": "Genre",
  "hierarchical": true,
  "collections": ["books", "movies"]
}
```

### Navigation Menus

Menus are ordered lists of links managed through the admin UI. They support nesting for dropdown navigation.

Create menus at `/_emdash/admin/menus`.

Menu item types:

| Type | Description | URL Resolution |
|------|-------------|----------------|
| `page` | Link to a page | `/{collection}/{slug}` |
| `post` | Link to a post | `/{collection}/{slug}` |
| `taxonomy` | Link to a category/tag | `/{taxonomy}/{slug}` |
| `collection` | Link to a collection archive | `/{collection}/` |
| `custom` | External or custom URL | Used as-is |

### Widget Areas

Widget areas are named regions in your templates (sidebars, footer columns, promotional banners) where administrators can place content blocks.

Widget types:
- **Content widgets** -- rich text stored as Portable Text
- **Menu widgets** -- render a navigation menu
- **Component widgets** -- render a registered component

### Sections (Reusable Content Blocks)

Sections are reusable content blocks that editors can insert into any Portable Text field using the `/section` slash command. Common uses: CTAs, testimonials, feature grids, newsletter signups.

### Media Management

The media library supports images, documents, videos, and audio files.

| Category | Supported Extensions |
|----------|---------------------|
| Images | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.svg` |
| Documents | `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx` |
| Video | `.mp4`, `.webm`, `.mov` |
| Audio | `.mp3`, `.wav`, `.ogg` |

**Uploading files:**
- From the media library: click **Upload** or drag-and-drop files
- From the content editor: click the image button and upload inline
- Default max file size: 10MB

**How uploads work** (R2/S3):
1. Client requests an upload URL from the API
2. Server generates a signed URL with expiration
3. Client uploads directly to storage (bypasses Workers body size limits)
4. Server records file metadata in the database

**Organizing:** Create folders, search by filename, filter by type/date/folder.

**Storage backends:**

| Backend | Configuration | Use Case |
|---------|--------------|----------|
| Local filesystem | `local({ directory: "./uploads" })` | Development |
| Cloudflare R2 | `r2({ binding: "MEDIA" })` | Production on Cloudflare |
| S3-compatible | `s3({ endpoint, bucket, ... })` | AWS, MinIO, etc. |

**Media providers** (optional, appear as tabs in the media picker):
- **Cloudflare Images** -- automatic optimization, resizing, format conversion
- **Cloudflare Stream** -- video hosting with HLS/DASH adaptive streaming

### Site Settings

Global settings managed through the admin under **Settings**:

```ts
interface SiteSettings {
  title: string;
  tagline?: string;
  logo?: MediaReference;
  favicon?: MediaReference;
  url?: string;
  postsPerPage: number;
  dateFormat: string;
  timezone: string;
  social?: {
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}
```

### SEO Metadata

Emdash supports SEO through:
- Per-page title, description, and OpenGraph images
- Plugin-powered SEO (e.g., `@emdash-cms/plugin-seo` for sitemaps, meta tags, JSON-LD)
- The `<EmDashHead>` component for plugin-contributed `<head>` content
- The `page:metadata` hook for structured metadata contributions

---

## 3. Admin Panel

### Overview

The admin panel is a React SPA mounted at `/_emdash/admin/`. It uses:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Routing | TanStack Router | Type-safe client-side routing |
| Data | TanStack Query | Server state, caching, mutations |
| UI | Kumo (Cloudflare's design system) | Accessible components |
| Tables | TanStack Table | Sorting, filtering, pagination |
| Forms | React Hook Form + Zod | Validation matching server schema |
| Editor | TipTap | Rich text editing (Portable Text) |
| Icons | Phosphor | Consistent iconography |

### Admin Routes

| Path | Screen |
|------|--------|
| `/` | Dashboard |
| `/content/:collection` | Content list |
| `/content/:collection/:id` | Content editor |
| `/content/:collection/new` | New entry |
| `/media` | Media library |
| `/content-types` | Schema builder (admin only) |
| `/menus` | Navigation menus |
| `/widgets` | Widget areas |
| `/taxonomies` | Category/tag management |
| `/settings` | Site settings |
| `/plugins/:pluginId/*` | Plugin pages |

### Manifest-Driven UI

The admin fetches a manifest from `GET /_emdash/api/manifest` that describes all collections, plugins, and taxonomies. The admin builds its navigation, forms, and editors entirely from this manifest. Schema changes appear immediately without admin rebuild.

### Role-Based Access

| Role | Visible Sections |
|------|-----------------|
| **Editor** | Dashboard, assigned collections, media |
| **Admin** | + Content Types, all collections, settings |
| **Developer** | + CLI access, generated types |

Roles: Administrator, Editor, Author, Contributor.

### User Management

Authentication is passkey-first (WebAuthn) with OAuth and magic link fallbacks. Cloudflare Access SSO is also supported for enterprise environments.

### Import/Export

- **WordPress migration**: Import posts, pages, media, and taxonomies from WXR exports, WordPress REST API, or WordPress.com
- **Seed files**: Export schema as JSON for version control, import in new environments
- **CLI tools**:
  ```bash
  npx emdash export-seed > seed.json
  npx emdash types
  ```

### REST API

All admin operations go through REST APIs at `/_emdash/api/*`:

**Content:** `GET/POST/PUT/DELETE /api/content/:collection/:id`
**Schema:** `GET/POST/PUT/DELETE /api/schema/collections/:slug`
**Media:** `GET/POST/DELETE /api/media`
**Settings:** `GET/POST /api/settings`
**Menus:** CRUD at `/api/menus/*`
**Taxonomies:** CRUD at `/api/taxonomies/*`
**Plugins:** `/api/admin/plugins/*`

All list endpoints use cursor-based pagination.

---

## 4. Querying Content in Templates

### Core Query Functions

```ts
import { getEmDashCollection, getEmDashEntry } from "emdash";
```

#### Get All Entries

```astro
---
import { getEmDashCollection } from "emdash";

const { entries: posts, error } = await getEmDashCollection("posts", {
  status: "published",
  limit: 10,
  where: { category: "news" },
});
---

<ul>
  {posts.map((post) => (
    <li><a href={`/posts/${post.slug}`}>{post.data.title}</a></li>
  ))}
</ul>
```

#### Get a Single Entry

```astro
---
import { getEmDashEntry } from "emdash";
import { PortableText } from "emdash/ui";

const { slug } = Astro.params;
const { entry: post, error, isPreview } = await getEmDashEntry("posts", slug);

if (!post) return Astro.redirect("/404");
---

{isPreview && <div class="preview-banner">Viewing preview</div>}
<h1>{post.data.title}</h1>
<PortableText value={post.data.content} />
```

### Taxonomy Queries

```ts
import { getTaxonomyTerms, getTerm, getEntryTerms, getEntriesByTerm } from "emdash";

// Get all categories (returns tree structure for hierarchical)
const categories = await getTaxonomyTerms("category");

// Get a single term
const category = await getTerm("category", "news");

// Get terms for an entry
const postCategories = await getEntryTerms("posts", "post-123", "category");

// Get entries by term
const newsPosts = await getEntriesByTerm("posts", "category", "news");
```

### Menu Queries

```ts
import { getMenu, getMenus } from "emdash";

const primaryMenu = await getMenu("primary");
// Returns: { id, name, label, items: [{ id, label, url, target, children }] }

const allMenus = await getMenus();
// Returns: [{ id, name, label }, ...]
```

### Site Settings

```ts
import { getSiteSettings, getSiteSetting } from "emdash";

const settings = await getSiteSettings();
const title = await getSiteSetting("title");
```

### Widget Areas and Sections

```ts
import { getWidgetArea } from "emdash";
import { getSection, getSections } from "emdash";

const sidebar = await getWidgetArea("sidebar");
const cta = await getSection("newsletter-cta");
```

### Visual Editing

Every entry includes an `edit` proxy for inline editing annotations:

```astro
<article {...entry.edit}>
  <h1 {...entry.edit.title}>{entry.data.title}</h1>
  <div {...entry.edit.content}>
    <PortableText value={entry.data.content} />
  </div>
</article>
```

In edit mode, this enables inline editing via the visual editing toolbar. In production, the proxy produces no output (zero runtime cost).

### Type-Safe Queries

```bash
npx emdash types
```

```ts
import type { Post } from "../.emdash/types";

const { entries: posts } = await getEmDashCollection<Post>("posts");
const { entry: post } = await getEmDashEntry<Post>("posts", "my-post");
```

---

## 5. Deployment

### Local Development

```bash
npm run dev
# Opens at http://localhost:4321
# Admin at http://localhost:4321/_emdash/admin
```

For local dev with SQLite (no Cloudflare account needed):

```bash
# If using the emdash monorepo demo
pnpm --filter emdash-demo seed
pnpm --filter emdash-demo dev
```

### Deploying to Cloudflare Workers

#### Step 1: Create Cloudflare Resources

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Create a D1 database
wrangler d1 create my-site-db
# Note the database_id from the output

# Create an R2 bucket
wrangler r2 bucket create my-site-media
```

#### Step 2: Configure wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-emdash-site",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-site-db",
      "database_id": "your-database-id-here"
    }
  ],

  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "my-site-media"
    }
  ],

  "observability": { "enabled": true }
}
```

Here is a real example from the Shipyard Bella's Bistro site:

```jsonc
{
  "name": "bellas-bistro",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "bellas-bistro",
      "database_id": "9eac689d-5d78-4c9b-8064-2bcb881ba759"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "bellas-bistro-media"
    }
  ],
  "observability": { "enabled": true }
}
```

#### Step 3: Configure astro.config.mjs

```js
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://your-site.example.com",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
});
```

#### Step 4: Run Database Migrations

D1 migrations must be run via Wrangler CLI before deployment (DDL statements are not allowed at runtime).

```bash
# Export and apply the core schema
npx emdash init --database ./data.db
wrangler d1 migrations apply my-site-db

# Or apply the core schema directly
wrangler d1 execute my-site-db --file=./node_modules/emdash/migrations/0001_core.sql
```

#### Step 5: Set Secrets

```bash
npx emdash auth secret
wrangler secret put EMDASH_AUTH_SECRET
wrangler secret put EMDASH_PREVIEW_SECRET
```

#### Step 6: Deploy

```bash
wrangler deploy
```

Your site is now live at `https://my-emdash-site.<your-subdomain>.workers.dev`.

### Custom Domains

1. Go to **Workers & Pages** > your worker in the Cloudflare dashboard
2. Click **Custom Domains** > **Add Custom Domain**
3. Follow the DNS setup instructions

### Public R2 Access (Recommended for Performance)

1. In the Cloudflare dashboard, go to **R2** > your bucket > **Settings** > **Public access**
2. Enable public access and note the public URL
3. Update your storage config:

```js
storage: r2({
  binding: "MEDIA",
  publicUrl: "https://pub-xxx.r2.dev"
}),
```

For production, connect a custom domain to your R2 bucket for better URLs and caching control.

### D1 Read Replicas

For globally distributed sites, enable read replication to reduce latency:

```js
emdash({
  database: d1({
    binding: "DB",
    session: "auto",
  }),
  storage: r2({ binding: "MEDIA" }),
}),
```

Enable read replication on the D1 database in the Cloudflare dashboard.

### Preview Deployments

```bash
wrangler deploy --env preview
```

Add an environment section to `wrangler.jsonc`:

```jsonc
{
  "env": {
    "preview": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "my-site-db-preview",
          "database_id": "your-preview-db-id"
        }
      ]
    }
  }
}
```

### Troubleshooting Deployment

**"D1 binding not found"** -- Verify the binding name in `wrangler.jsonc` matches your database configuration (`d1({ binding: "DB" })` must match `"binding": "DB"`).

**"R2 binding not found"** -- Same check for R2 bucket binding names.

**Migration errors** -- Check migrations were applied with `wrangler d1 migrations list my-site-db`, re-apply if needed.

---

## 6. Plugin System

### Overview

Emdash plugins extend the CMS without modifying core code. They can:

- Hook into content lifecycle events (before/after save, delete, publish)
- Store their own data in indexed collections
- Expose settings with auto-generated admin UI
- Add custom admin pages and dashboard widgets
- Create REST API endpoints
- Make HTTP requests with declared host restrictions

### How Plugins Work

Every plugin has two parts running in different contexts:

1. **Plugin descriptor** (`PluginDescriptor`) -- runs at build time in Vite (imported in `astro.config.mjs`). Tells Emdash where to find the plugin and what admin UI it provides.
2. **Plugin definition** (`definePlugin()`) -- runs at request time on the deployed server. Contains runtime logic: hooks, routes, storage.

### Registering Plugins in astro.config.mjs

```js
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import seoPlugin from "@emdash-cms/plugin-seo";
import auditLogPlugin from "@emdash-cms/plugin-audit-log";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [
        seoPlugin({ generateSitemap: true }),
        auditLogPlugin({ retentionDays: 90 }),
      ],
    }),
  ],
});
```

Plugins are resolved at build time. Order matters for hooks with the same priority.

### Plugin Capabilities

Capabilities determine what APIs are available in the plugin context. On Cloudflare with sandboxing, these are enforced at runtime. On Node.js, they are advisory.

| Capability | Grants Access To |
|------------|-----------------|
| `read:content` | `ctx.content.get()`, `ctx.content.list()` |
| `write:content` | `ctx.content.create()`, `ctx.content.update()`, `ctx.content.delete()` |
| `read:media` | `ctx.media.get()`, `ctx.media.list()` |
| `write:media` | `ctx.media.getUploadUrl()`, `ctx.media.upload()`, `ctx.media.delete()` |
| `network:fetch` | `ctx.http.fetch()` (restricted to `allowedHosts`) |
| `network:fetch:any` | `ctx.http.fetch()` (unrestricted) |
| `read:users` | `ctx.users.get()`, `ctx.users.getByEmail()`, `ctx.users.list()` |
| `email:send` | `ctx.email.send()` |
| `page:inject` | Register `page:metadata` / `page:fragments` hooks |

### Plugin Context

Every hook and route handler receives a `PluginContext` object:

| Property | Description |
|----------|-------------|
| `ctx.storage` | Plugin's document collections |
| `ctx.kv` | Key-value store for settings and state |
| `ctx.content` | Read/write site content (capability-gated) |
| `ctx.media` | Read/write media files (capability-gated) |
| `ctx.http` | HTTP client for external requests (capability-gated) |
| `ctx.log` | Structured logger (debug, info, warn, error) |
| `ctx.plugin` | Plugin metadata (id, version) |
| `ctx.site` | Site info: name, url, locale |
| `ctx.users` | User management (capability-gated) |
| `ctx.cron` | Schedule tasks |
| `ctx.email` | Send email (capability-gated) |

### Available Hooks

| Hook | Trigger | Return |
|------|---------|--------|
| `plugin:install` | First plugin installation | `void` |
| `plugin:activate` | Plugin enabled | `void` |
| `plugin:deactivate` | Plugin disabled | `void` |
| `plugin:uninstall` | Plugin removed | `void` |
| `content:beforeSave` | Before content save | Modified content or `void` |
| `content:afterSave` | After content save | `void` |
| `content:beforeDelete` | Before content delete | `false` to cancel |
| `content:afterDelete` | After content delete | `void` |
| `content:afterPublish` | After content publish | `void` |
| `content:afterUnpublish` | After content unpublish | `void` |
| `media:beforeUpload` | Before file upload | Modified file info or `void` |
| `media:afterUpload` | After file upload | `void` |
| `page:metadata` | Page render | Metadata contributions |
| `page:fragments` | Page render (trusted only) | HTML/script fragments |

Hook configuration options: `priority` (execution order, lower = first), `timeout` (ms), `dependencies` (plugin IDs), `errorPolicy` ("abort" or "continue").

### Sandbox vs. Trusted Execution

| | Trusted | Sandboxed |
|---|---------|-----------|
| **Runs in** | Main process | Isolated V8 isolate (Dynamic Worker Loader) |
| **Capabilities** | Advisory (not enforced) | Enforced at runtime |
| **Resource limits** | None | CPU (50ms), memory (~128MB), subrequests (10), wall-time (30s) |
| **Network access** | Unrestricted | Blocked; only via `ctx.http` with host allowlist |
| **Available on** | All platforms | Cloudflare Workers only |

To enable sandboxing, configure `worker_loaders` in `wrangler.jsonc`:

```jsonc
{
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

> Sandboxed plugins require Cloudflare Workers with paid plan ($5/mo minimum).

### Block Kit (Admin UI for Sandboxed Plugins)

Sandboxed plugins describe their admin UI as JSON using Block Kit. The host renders the blocks -- no plugin-supplied JavaScript runs in the browser.

Block types: `header`, `section`, `divider`, `fields`, `table`, `actions`, `stats`, `form`, `image`, `context`, `columns`.

Element types: `button`, `text_input`, `number_input`, `select`, `toggle`, `secret_input`.

```typescript
routes: {
  admin: {
    handler: async (ctx, { request }) => {
      const interaction = await request.json();
      if (interaction.type === "page_load") {
        return {
          blocks: [
            { type: "header", text: "My Plugin Settings" },
            {
              type: "form",
              block_id: "settings",
              fields: [
                { type: "text_input", action_id: "api_url", label: "API URL" },
                { type: "toggle", action_id: "enabled", label: "Enabled", initial_value: true },
              ],
              submit: { label: "Save", action_id: "save" },
            },
          ],
        };
      }
    },
  },
}
```

### Building a Custom Plugin -- Complete Example

Here is a complete audit log plugin:

```
my-plugin/
├── src/
│   ├── descriptor.ts     # Build-time descriptor
│   ├── index.ts           # Runtime definition (definePlugin)
│   └── admin.tsx          # Admin UI (React components) -- optional
├── package.json
└── tsconfig.json
```

**descriptor.ts** (build time):

```typescript
import type { PluginDescriptor } from "emdash";

export function auditLog(): PluginDescriptor {
  return {
    id: "audit-log",
    version: "0.1.0",
    entrypoint: "@my-org/plugin-audit-log",
    adminEntry: "@my-org/plugin-audit-log/admin",
    adminPages: [{ path: "/history", label: "Audit History", icon: "history" }],
    adminWidgets: [{ id: "recent-activity", title: "Recent Activity", size: "half" }],
  };
}
```

**index.ts** (runtime):

```typescript
import { definePlugin } from "emdash";

export function createPlugin() {
  return definePlugin({
    id: "audit-log",
    version: "0.1.0",

    storage: {
      entries: {
        indexes: ["timestamp", "action", "collection"],
      },
    },

    admin: {
      settingsSchema: {
        retentionDays: {
          type: "number",
          label: "Retention (days)",
          default: 90,
          min: 0,
          max: 365,
        },
      },
      pages: [{ path: "/history", label: "Audit History", icon: "history" }],
      widgets: [{ id: "recent-activity", title: "Recent Activity", size: "half" }],
    },

    hooks: {
      "plugin:install": async (_event, ctx) => {
        ctx.log.info("Audit log plugin installed");
      },

      "content:afterSave": {
        priority: 200,
        timeout: 2000,
        handler: async (event, ctx) => {
          const entryId = `${Date.now()}-${event.content.id}`;
          await ctx.storage.entries!.put(entryId, {
            timestamp: new Date().toISOString(),
            action: event.isNew ? "create" : "update",
            collection: event.collection,
            resourceId: event.content.id,
          });
        },
      },

      "content:afterDelete": {
        priority: 200,
        handler: async (event, ctx) => {
          const entryId = `${Date.now()}-${event.id}`;
          await ctx.storage.entries!.put(entryId, {
            timestamp: new Date().toISOString(),
            action: "delete",
            collection: event.collection,
            resourceId: event.id,
          });
        },
      },
    },

    routes: {
      recent: {
        handler: async (ctx) => {
          const result = await ctx.storage.entries!.query({
            orderBy: { timestamp: "desc" },
            limit: 10,
          });
          return { entries: result.items.map((item) => ({ id: item.id, ...item.data })) };
        },
      },
    },
  });
}

export default createPlugin;
```

**package.json** exports:

```json
{
  "name": "@my-org/plugin-audit-log",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./descriptor": { "types": "./dist/descriptor.d.ts", "import": "./dist/descriptor.js" },
    "./admin": { "types": "./dist/admin.d.ts", "import": "./dist/admin.js" }
  },
  "peerDependencies": {
    "emdash": "^0.1.0",
    "react": "^18.0.0"
  }
}
```

### Portable Text Block Types (Plugin-Provided)

Plugins can add custom block types to the rich text editor:

```typescript
admin: {
  portableTextBlocks: [
    {
      type: "youtube",
      label: "YouTube Video",
      icon: "video",
      placeholder: "Paste YouTube URL...",
      fields: [
        { type: "text_input", action_id: "id", label: "YouTube URL" },
        { type: "text_input", action_id: "title", label: "Title" },
      ],
    },
  ],
}
```

Site-side rendering uses Astro components exported from `componentsEntry`:

```typescript
// src/astro/index.ts
import YouTube from "./YouTube.astro";
export const blockComponents = { youtube: YouTube };
```

---

## 7. Theming

### What is an Emdash Theme?

An Emdash theme is a complete Astro site (pages, layouts, components, styles) distributed via `create-astro`. It also includes a **seed file** that bootstraps the database with collections, fields, menus, and sample content on first run.

There is no theme API or abstraction layer. You build a working site and ship it as a template. The seed file tells Emdash what to create.

### Theme Structure

```
my-emdash-theme/
├── package.json              # Theme metadata + emdash config
├── astro.config.mjs          # Astro + Emdash configuration
├── src/
│   ├── live.config.ts        # Live Collections setup
│   ├── pages/
│   │   ├── index.astro       # Homepage
│   │   ├── [...slug].astro   # Pages (catch-all)
│   │   ├── posts/
│   │   │   ├── index.astro   # Post archive
│   │   │   └── [slug].astro  # Single post
│   │   ├── categories/
│   │   │   └── [slug].astro  # Category archive
│   │   ├── tags/
│   │   │   └── [slug].astro  # Tag archive
│   │   ├── search.astro      # Search page
│   │   └── 404.astro         # Not found
│   ├── layouts/
│   │   └── Base.astro        # Base layout
│   └── components/
├── .emdash/
│   ├── seed.json             # Schema + sample content
│   └── uploads/              # Optional local media files
└── public/                   # Static assets
```

### Key Theme Rules

1. **Theme content pages must be server-rendered** -- do NOT use `getStaticPaths()` in theme content routes
2. **No hard-coded content** -- site title, tagline, navigation come from the CMS via API calls
3. **Image fields are objects** -- `post.data.featured_image` is `{ src, alt }`, not a string

### The Seed File

The seed file (`.emdash/seed.json` or `seed/seed.json`) is the heart of a theme. It declares exactly what collections, fields, menus, taxonomies, sections, and sample content the theme needs.

```json
{
  "$schema": "https://emdashcms.com/seed.schema.json",
  "version": "1",
  "meta": {
    "name": "My Theme",
    "description": "A clean theme",
    "author": "Your Name"
  },
  "settings": {
    "title": "My Site",
    "tagline": "A tagline",
    "postsPerPage": 10
  },
  "collections": [
    {
      "slug": "posts",
      "label": "Posts",
      "labelSingular": "Post",
      "supports": ["drafts", "revisions"],
      "fields": [
        { "slug": "title", "label": "Title", "type": "string", "required": true },
        { "slug": "content", "label": "Content", "type": "portableText" },
        { "slug": "excerpt", "label": "Excerpt", "type": "text" },
        { "slug": "featured_image", "label": "Featured Image", "type": "image" }
      ]
    },
    {
      "slug": "pages",
      "label": "Pages",
      "labelSingular": "Page",
      "supports": ["drafts", "revisions"],
      "fields": [
        { "slug": "title", "label": "Title", "type": "string", "required": true },
        { "slug": "content", "label": "Content", "type": "portableText" }
      ]
    }
  ],
  "taxonomies": [
    {
      "name": "category",
      "label": "Categories",
      "hierarchical": true,
      "collections": ["posts"],
      "terms": [
        { "slug": "news", "label": "News" },
        { "slug": "tutorials", "label": "Tutorials" }
      ]
    }
  ],
  "menus": [
    {
      "name": "primary",
      "label": "Primary Navigation",
      "items": [
        { "type": "custom", "label": "Home", "url": "/" },
        { "type": "custom", "label": "Blog", "url": "/posts" }
      ]
    }
  ],
  "sections": [
    {
      "slug": "hero-centered",
      "title": "Centered Hero",
      "keywords": ["hero", "banner"],
      "content": [
        {
          "_type": "block",
          "style": "h1",
          "children": [{ "_type": "span", "text": "Welcome" }]
        }
      ]
    }
  ],
  "redirects": [
    { "source": "/old-path", "destination": "/new-path" }
  ]
}
```

### Page Templates

Add a `template` select field to the pages collection for multiple layouts:

```json
{
  "slug": "template",
  "label": "Page Template",
  "type": "string",
  "widget": "select",
  "options": {
    "choices": [
      { "value": "default", "label": "Default" },
      { "value": "full-width", "label": "Full Width" },
      { "value": "landing", "label": "Landing Page" }
    ]
  },
  "defaultValue": "default"
}
```

Then in the catch-all route:

```astro
---
import { getEmDashEntry } from "emdash";
import PageDefault from "../layouts/PageDefault.astro";
import PageFullWidth from "../layouts/PageFullWidth.astro";
import PageLanding from "../layouts/PageLanding.astro";

const { slug } = Astro.params;
const { entry: page } = await getEmDashEntry("pages", slug!);
if (!page) return Astro.redirect("/404");

const layouts = {
  "default": PageDefault,
  "full-width": PageFullWidth,
  "landing": PageLanding,
};
const Layout = layouts[page.data.template] ?? PageDefault;
---

<Layout page={page} />
```

### Custom Portable Text Blocks in Themes

Themes can define custom block types for marketing pages, landing pages, etc.:

```json
{
  "_type": "marketing.hero",
  "headline": "Build something amazing",
  "subheadline": "The all-in-one platform.",
  "primaryCta": { "label": "Get Started", "url": "/signup" }
}
```

Create Astro components and pass them to the `PortableText` renderer:

```astro
---
import { PortableText } from "emdash/ui";
import Hero from "./blocks/Hero.astro";
import Features from "./blocks/Features.astro";

const marketingTypes = {
  "marketing.hero": Hero,
  "marketing.features": Features,
};
---

<PortableText value={value} components={{ types: marketingTypes }} />
```

### Search

Include search in your theme with the `LiveSearch` component:

```astro
---
import LiveSearch from "emdash/ui/search";
---

<LiveSearch
  placeholder="Search posts and pages..."
  collections={["posts", "pages"]}
/>
```

Provides debounced instant search with prefix matching, Porter stemming, and highlighted snippets.

### Publishing a Theme

```bash
# Publish to npm
npm publish --access public

# Users install with:
npm create astro@latest -- --template @your-org/emdash-theme-name
```

For GitHub-hosted themes:

```bash
npm create astro@latest -- --template github:your-org/emdash-theme-name
```

---

## 8. Real Examples from Shipyard Sites

### Bella's Bistro (Marketing Template)

**Site URL:** `https://bellas.shipyard.company`

**astro.config.mjs:**
```js
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://bellas.shipyard.company",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: true } },
});
```

**wrangler.jsonc:**
```jsonc
{
  "name": "bellas-bistro",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "bellas-bistro",
      "database_id": "9eac689d-5d78-4c9b-8064-2bcb881ba759"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "bellas-bistro-media"
    }
  ],
  "observability": { "enabled": true }
}
```

**Homepage pattern** (`src/pages/index.astro`):
```astro
---
import { getEmDashEntry } from "emdash";
import Base from "../layouts/Base.astro";
import MarketingBlocks from "../components/MarketingBlocks.astro";

const { entry: page, cacheHint } = await getEmDashEntry("pages", "home");
try { Astro.cache.set(cacheHint); } catch {}

const pageTitle = page?.data.title;
const pageContent = page?.data.content;
---

<Base title={pageTitle !== "Home" ? pageTitle : undefined}>
  {pageContent ? (
    <MarketingBlocks value={pageContent} />
  ) : (
    <div class="empty-state">
      <h1>Welcome</h1>
      <a href="/_emdash/admin" class="btn btn-primary">Open Admin</a>
    </div>
  )}
</Base>
```

**Base layout pattern** -- uses `getMenu("primary")` and `getSiteSettings()` for dynamic navigation and site branding, `EmDashHead` for plugin-contributed head content, CSS custom properties for design tokens, and dark/light mode toggle.

**Key scripts:**
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "start": "node ./dist/server/entry.mjs",
  "bootstrap": "emdash init && emdash seed",
  "seed": "emdash seed"
}
```

### Sunrise Yoga (Marketing Template)

**Site URL:** `https://yoga.shipyard.company`

Follows the same pattern as Bella's Bistro -- same astro.config.mjs structure, same Emdash integration, different D1 database and R2 bucket, different content and styling.

### Common Patterns Across Shipyard Sites

1. **All use Cloudflare deployment** with D1 + R2
2. **All use the marketing template** as base (`@emdash-cms/template-marketing`)
3. **Content is page-based** with custom Portable Text marketing blocks (hero, features, pricing, testimonials, FAQ)
4. **Navigation is menu-driven** via `getMenu("primary")`
5. **Settings are CMS-driven** via `getSiteSettings()`
6. **Bootstrap workflow**: `emdash init && emdash seed` to initialize database and apply seed data
7. **`live.config.ts`** is identical across all sites (single `_emdash` collection with `emdashLoader()`)

---

## Quick Reference

### CLI Commands

| Command | Purpose |
|---------|---------|
| `npm create emdash@latest` | Create a new Emdash site |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npx emdash types` | Generate TypeScript types from DB schema |
| `npx emdash auth secret` | Generate auth secret |
| `npx emdash export-seed > seed.json` | Export schema as seed file |
| `npx emdash init` | Initialize database |
| `npx emdash seed` | Apply seed data |
| `wrangler d1 create <name>` | Create D1 database |
| `wrangler r2 bucket create <name>` | Create R2 bucket |
| `wrangler d1 migrations apply <db>` | Apply DB migrations |
| `wrangler secret put <name>` | Set secret |
| `wrangler deploy` | Deploy to Cloudflare Workers |

### Key Imports

```ts
// Content queries
import { getEmDashCollection, getEmDashEntry } from "emdash";

// Taxonomy queries
import { getTaxonomyTerms, getTerm, getEntryTerms, getEntriesByTerm } from "emdash";

// Navigation and settings
import { getMenu, getMenus, getSiteSettings, getSiteSetting } from "emdash";

// Widget areas and sections
import { getWidgetArea } from "emdash";
import { getSection, getSections } from "emdash";

// UI components
import { PortableText, EmDashHead, Image } from "emdash/ui";
import LiveSearch from "emdash/ui/search";

// Page context
import { createPublicPageContext } from "emdash/page";

// Plugin development
import { definePlugin } from "emdash";

// Astro integration
import emdash from "emdash/astro";

// Cloudflare adapters
import { d1, r2 } from "@emdash-cms/cloudflare";

// Runtime loader
import { emdashLoader } from "emdash/runtime";
```

### Admin API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/_emdash/api/manifest` | GET | Admin manifest (collections, plugins, taxonomies) |
| `/_emdash/api/content/:collection` | GET, POST | List/create content |
| `/_emdash/api/content/:collection/:id` | GET, PUT, DELETE | Get/update/delete content |
| `/_emdash/api/schema/collections` | GET, POST | List/create collections |
| `/_emdash/api/media` | GET | List media |
| `/_emdash/api/media/upload-url` | POST | Get signed upload URL |
| `/_emdash/api/settings` | GET, POST | Get/update site settings |
| `/_emdash/api/menus` | GET, POST | List/create menus |
| `/_emdash/api/taxonomies` | GET, POST | List/create taxonomies |
| `/_emdash/api/taxonomies/:name/terms` | GET, POST | List/create terms |

### Portable Storage Layer

| Layer | Cloudflare | Also works with |
|-------|-----------|-----------------|
| Database | D1 | SQLite, Turso/libSQL, PostgreSQL |
| Storage | R2 | AWS S3, any S3-compatible, local filesystem |
| Sessions | KV | Redis, file-based |
| Plugins | Worker isolates (sandboxed) | In-process (trusted mode) |

---

## Further Resources

- **Emdash GitHub**: https://github.com/emdash-cms/emdash
- **Emdash Documentation**: https://github.com/emdash-cms/emdash/tree/main/docs
- **Shipyard AI Repo**: https://github.com/sethshoultes/shipyard-ai
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Astro Docs**: https://docs.astro.build/
- **Portable Text Spec**: https://www.portabletext.org/
- **Block Kit Playground**: https://emdash-blocks.cto.cloudflare.dev/
