# EmDash Platform Research

**Researched by:** Haiku sub-agent (Sara Blakely)
**Date:** 2026-04-03
**Status:** Complete

---

## What is EmDash?

EmDash is a modern, open-source CMS developed by **Cloudflare**, launched April 2026 as the "spiritual successor to WordPress." Full-stack TypeScript, AI-native, security-focused.

- **Version:** 0.1.0 (early developer preview)
- **License:** MIT
- **GitHub:** github.com/emdash-cms/emdash

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (end-to-end) |
| Web Framework | Astro 6 (content-driven) |
| Database ORM | Kysely (type-safe SQL) |
| Content Format | Portable Text (structured JSON) |
| Rich Text Editor | TipTap (admin panel) |
| Plugin Runtime | Cloudflare Workers (V8 isolates) |
| Databases | SQLite, Cloudflare D1, PostgreSQL, Turso |
| Object Storage | Cloudflare R2, AWS S3, local files |

## Themes

- Astro projects that define routes for rendering content
- Integrate with EmDash Content APIs
- Portable Text content can render as web pages, mobile apps, emails, or API responses
- Cloudflare provides porting guides for converting WordPress themes (with AI-agent-friendly mapping tables)

## Plugins

- **Sandboxed:** Each plugin runs in its own Cloudflare Worker (Dynamic Worker Loaders)
- **Capability manifest:** Declare exactly what permissions needed (`read:content`, `email:send`, network to specific hosts)
- **No raw access:** Cannot access filesystem, raw database, or other plugins
- **TypeScript:** Full type safety

## Deployment Targets

| Platform | Notes |
|----------|-------|
| Cloudflare Workers | Primary. Scales to zero. Pay-as-you-go CPU. |
| Netlify | Supported |
| Vercel | Supported |
| Any Node.js server | Self-hosted option |

## AI-Native Features (Critical for Shipyard AI)

### MCP Server (Model Context Protocol)
Every EmDash instance exposes a built-in MCP server. AI tools can:
- Create content types and manage entries
- Configure plugins
- Deploy changes
- All via natural language through AI assistants

### CLI
- JSON-based output for machine consumption
- Designed for AI agents to manage content and schema
- Can configure plugins and deploy remotely

### Agent Skills
- Built-in capabilities for AI agent interaction
- First-class support for programmatic site management

## Pricing

Fully open-source and free. Costs come from hosting:
- Cloudflare: generous free tier, pay-as-you-go after
- Self-hosted: zero software cost

## Ecosystem Status (v0.1.0)

- **Themes:** Emerging, not mature. Few community themes.
- **Plugins:** Early stage. Capability manifest system is new.
- **No built-in e-commerce** — must be built as plugins
- **Community:** Growing but small compared to WordPress

## Strategic Implications for Shipyard AI

1. **MCP server = our deploy interface.** We don't need custom scripts. Our agents can talk to EmDash directly via MCP to create content types, populate content, configure plugins, and deploy.

2. **Thin ecosystem = opportunity.** We can be the first agency building production EmDash themes and plugins at scale. First-mover advantage in the theme/plugin marketplace.

3. **TypeScript everywhere = agent-friendly.** Our haiku sub-agents can write TypeScript for themes, plugins, and configuration. No PHP/SQL impedance mismatch.

4. **Plugin sandboxing = confidence.** We can ship plugins knowing they can't break sites. Capability manifests make security review trivial.

5. **Astro 6 = modern SSG.** Fast sites by default. Content-driven architecture matches our PRD-to-site pipeline perfectly.

## Sources

- [Cloudflare Blog: Introducing EmDash](https://blog.cloudflare.com/emdash-wordpress/)
- [GitHub: emdash-cms/emdash](https://github.com/emdash-cms/emdash)
- [SiliconANGLE: Cloudflare debuts EmDash](https://siliconangle.com/2026/04/02/cloudflare-debuts-emdash-challenge-aging-wordpress-ai-native-cms/)
- [Joost.blog: EmDash CMS review](https://joost.blog/emdash-cms/)
- [EmDash CMS Guide](https://www.emdashcms.dev/)
- [The Register: Cloudflare previews EmDash](https://www.theregister.com/2026/04/02/cloudflare_previews_emdash_an_aidriven/)
