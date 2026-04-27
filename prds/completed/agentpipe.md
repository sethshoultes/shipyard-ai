# PRD: AgentPipe
**Product Requirement Document**
**Version:** 1.0
**Date:** 2026-04-23
**Status:** Ready for Build

---

## Executive Summary

AgentPipe is a WordPress plugin that turns any WordPress site into an AI-native data source by implementing the Model Context Protocol (MCP). Install the plugin, and your site's content — posts, pages, products, users, and media — becomes queryable context for Claude Desktop, Cursor, or any MCP-compatible client. No migration. No new stack. One plugin, one URL, infinite agents.

---

## Problem Statement

AI agents need context to be useful. Today, giving an AI agent access to a WordPress site's content means:
- Exporting static JSON and hoping the format matches what the agent expects
- Building custom scrapers that break when themes update
- Paying for expensive RAG pipelines that duplicate content you already own
- Hand-cranking API integrations that require developer hours per site

**Result:** The world's most popular CMS is invisible to the emerging ecosystem of AI agents.

---

## Solution

`WP Admin → Plugins → Add New → "AgentPipe" → Activate → Copy MCP URL → Paste into Claude Desktop`

AgentPipe exposes a standards-compliant MCP endpoint from within WordPress. AI clients connect via Server-Sent Events (SSE), authenticate with a site-generated API key, and query structured site data using MCP's `resources/list` and `resources/read` primitives.

---

## Target User

**Primary:** WordPress developers and agencies building AI-powered features for clients
**Secondary:** Power users who want Claude Desktop to reason over their site's content
**Tertiary:** SaaS founders building tools that need to ingest WordPress content

**User Persona — "Jordan":**
- Freelance developer managing 12 WordPress client sites
- Wants to build a support chatbot that actually knows the site's content
- Doesn't want to export, transform, and sync data manually
- Values standards over custom integrations

---

## Core Features

### 1. MCP Endpoint (SSE Transport)
```
GET /wp-json/agentpipe/v1/mcp
```

**Capabilities:**
- `resources/list` — Returns all available site resources (posts, pages, products, users, media)
- `resources/read` — Returns the content of a specific resource by URI
- `prompts/list` — Returns built-in prompt templates for common WordPress queries
- `tools/list` — Returns available tools (search, summarize, compare)

**Authentication:** Site-generated API keys with capability-based access control

### 2. Structured Resource Mapping

**Post Resource (`site://post/{id}`):**
```json
{
  "uri": "site://post/42",
  "mimeType": "application/json",
  "text": "{\"title\":\"Hello World\",\"content\":\"...\",\"author\":\"...\",\"date\":\"...\",\"categories\":[\"...\"],\"tags\":[\"...\"]}"
}
```

**Available Resources:**
| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Posts | `site://post/{id}` | Full post content with meta |
| Pages | `site://page/{id}` | Page content with template info |
| Products | `site://product/{id}` | WooCommerce product data |
| Users | `site://user/{id}` | Public author profiles |
| Media | `site://media/{id}` | Attachment metadata and URLs |
| Site Info | `site://site` | Site name, description, URL |

### 3. Semantic Search (Hybrid AI)
```json
// MCP tool: site_search
{
  "query": "pricing plans compared",
  "content_types": ["post", "page"],
  "limit": 5
}
```

- **Fast path:** WordPress native search + full-text index
- **Smart path:** Hybrid Claude + Workers AI for intent understanding
- **Fallback:** Pure SQL LIKE query if AI services unavailable

### 4. One-Click Setup Wizard
```
Welcome to AgentPipe
✓ Generate API key
✓ Select exposed content types
✓ Copy MCP server URL
✓ Test connection with sample query
Done! Your site is now an AI data source.
```

### 5. Admin Dashboard
- Connection status and last query timestamp
- Query volume chart (free tier: 100/day, Pro: unlimited)
- Resource indexing status
- API key rotation
- Access log (who queried what, when)

---

## Technical Architecture

### Stack
- **Platform:** WordPress plugin (PHP 7.4+)
- **API:** WordPress REST API (`register_rest_route`)
- **Transport:** Server-Sent Events (SSE) for MCP stream
- **AI Search:** Cloudflare Workers AI (embedding) + Claude (re-ranking)
- **Storage:** WordPress postmeta (index metadata), optional D1 for analytics
- **Auth:** WordPress nonces + custom API keys (capabilities-based)

### Plugin Structure
```
agentpipe/
├── agentpipe.php           # Main plugin file
├── includes/
│   ├── class-mcp-server.php    # SSE transport + protocol handler
│   ├── class-resources.php     # Resource mapping (posts, pages, etc.)
│   ├── class-search.php        # Search logic (native + AI hybrid)
│   ├── class-auth.php          # API key generation + validation
│   └── class-admin.php         # Dashboard + settings page
├── assets/
│   ├── css/
│   └── js/
├── readme.txt
└── composer.json
```

### MCP Protocol Flow
```
1. MCP Client (Claude Desktop) → POST /wp-json/agentpipe/v1/mcp/initialize
2. Server responds with protocol version + capabilities
3. Client subscribes to SSE stream
4. Client sends: resources/list
5. Server queries WP DB → returns resource catalog
6. Client sends: resources/read site://post/42
7. Server fetches post → returns structured JSON
```

### AI Fallback Strategy
```php
function agentpipe_search($query) {
    // 1. Try Workers AI embedding search (fast, cheap)
    $results = workers_ai_search($query);
    if (!empty($results)) return $results;

    // 2. Fallback to Claude semantic re-ranking
    $results = claude_rerank($query, get_recent_posts(20));
    if (!empty($results)) return $results;

    // 3. Final fallback: SQL LIKE query
    return native_wp_search($query);
}
```

---

## Distribution Strategy

### Phase 1: Launch (Week 1)
- WordPress.org plugin repository submission
- GitHub repository with MCP integration examples
- ProductHunt launch: "Turn your WordPress site into an AI agent"
- Claude Desktop setup tutorial (video + written)

### Phase 2: Ecosystem (Month 1)
- Submit to MCP server registries and directories
- Partner with WordPress agency newsletters for reviews
- Build "AgentPipe + Claude" starter template
- Publish case study: "How we built a support bot from our own docs"

### Phase 3: Monetization (Month 2+)
- **Free:** Core MCP endpoint, native search, 100 AI queries/day
- **Pro ($9/mo per site):** Unlimited AI queries, semantic search, analytics dashboard, priority support
- **Agency ($49/mo):** Multi-site license, white-label, advanced auth (OAuth)

---

## Success Metrics

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Plugin Installs | 50 | 500 | 3000 |
| Active MCP Connections | 20 | 300 | 2000 |
| Pro Conversions | 0 | 25 | 150 |
| GitHub Stars | 50 | 300 | 1000 |

---

## Build Scope (Single Session)

### Must Ship
- [ ] WordPress plugin scaffold with activation/deactivation hooks
- [ ] REST API endpoint for MCP initialization (`POST /mcp/initialize`)
- [ ] SSE transport for MCP streaming (`GET /mcp/sse`)
- [ ] `resources/list` handler (posts, pages, site info)
- [ ] `resources/read` handler (fetch single resource by URI)
- [ ] API key generation + capability-based auth
- [ ] Admin dashboard with setup wizard
- [ ] Native WP search fallback
- [ ] readme.txt + WordPress.org-ready assets
- [ ] GitHub repo with Claude Desktop setup guide

### Nice-to-Haves (if tokens allow)
- [ ] Semantic search via Workers AI hybrid
- [ ] WooCommerce product resource support
- [ ] Query volume analytics in admin
- [ ] `tools/list` and `tools/call` handlers

### Post-Launch (Future Sessions)
- [ ] Prompts namespace (`prompts/list`, `prompts/get`)
- [ ] Write operations (draft creation, meta updates)
- [ ] Webhook triggers for content changes
- [ ] Multi-site network support
- [ ] OAuth 2.0 for enterprise

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MCP spec changes | Pin to current version; maintain compat layer |
| WordPress hosting blocks SSE | Document requirements; fallback to long-polling in v2 |
| Slow queries on large sites | Add query caching (transients); limit default batch size |
| Security concerns (exposing data) | Capability-based access; default to no sensitive user data |
| Low MCP adoption | Also expose standard REST API; MCP is value-add, not requirement |

---

## Timeline

**Hour 0-1:** Plugin scaffold + activation + admin menu
**Hour 1-2:** REST API endpoints + SSE transport foundation
**Hour 1.5-2.5:** MCP protocol handlers (initialize, resources/list, resources/read)
**Hour 2.5-3.5:** Resource mapping layer (posts, pages, site info)
**Hour 3.5-4.5:** Auth system (API key generation + validation)
**Hour 4.5-5.5:** Admin dashboard + setup wizard UI
**Hour 5.5-6:** Testing with Claude Desktop, README, plugin assets

---

## Approval

**DREAM Cycle Vote:** 3-1-1 (Phil, Elon, Warren)
**Status:** Approved for immediate build

---

*"The best integration is the one you don't have to build. AgentPipe makes WordPress speak AI natively."*
