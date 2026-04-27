# AgentPipe — Locked Decisions
## Blueprint for the Build Phase

*Consolidated by Phil Jackson, Zen Master*
*Synthesized from Elon (CPGO) and Steve Jobs (Chief Design & Brand Officer)*

---

## Decisions

### 1. Transport: Stateless POST (MCP over HTTP), SSE Deferred to v2
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve conceded that SSE is a "support ticket avalanche" on GoDaddy, Bluehost, SiteGround, and WP Engine. Shared hosting is 60% of WordPress. PHP-FPM worker exhaustion (default pools of 5–10 workers) makes SSE non-viable at launch. The 30-second awakening is *only* achievable if the transport is natively invisible to the host.
- **Locked:** v1 uses stateless HTTP POST for MCP. SSE is a v2 feature after the hosting matrix is mapped.

### 2. Admin UI: Zero Screens
- **Proposed by:** Elon
- **Winner:** Elon (unanimous)
- **Why:** Both agree that dashboards, charts, query-volume analytics, and transport-configuration screens are vanity metrics that write to the database and break the 30-second rule. Steve's "invisibility" principle and Elon's "zero admin UI" converge perfectly.
- **Locked:** No tabs. No toggles. No configuration panels. Activate → copy URL → done. A text log file is acceptable for debugging.

### 3. The 30-Second Awakening
- **Proposed by:** Steve
- **Winner:** Steve (unanimous)
- **Why:** Elon reframed it as an *engineering outcome* rather than a design choice, but both agree on the exact UX: install, activate, one dialog with a URL, paste into Claude Desktop, ask a question. If it takes longer, it's a toolkit, not a product.
- **Locked:** The entire first-run experience must complete in under 30 seconds with zero configuration.

### 4. Distribution: Agencies and wp.org
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve conceded that ProductHunt and MCP directories are the wrong audience. The user is a freelancer managing 12 client sites. Agencies are the distribution engine. White-label-ready version for agencies ships free.
- **Locked:** Launch on wp.org. Distribution through WordPress agency Facebook groups and agency Slack channels. A 90-second demo video is the primary marketing asset.

### 5. What Gets Cut from v1
- **Proposed by:** Elon
- **Winner:** Elon (Steve conceded all)
- **Locked cuts:**
  - WooCommerce support (15% of sites — add when asked)
  - Admin dashboard charts and analytics
  - Monetization plan / Pro tiers ("theater" until there are users)
  - Prompts namespace and `tools/list` (Claude Desktop doesn't need them to read posts)
  - Exposed WordPress settings or complexity

### 6. resources/list Pagination
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve conceded that `resources/list` without cursors is "suicide on any site with real content." A site with 50K posts returning 50K URIs will OOM on shared hosting.
- **Locked:** Paginate at 1,000 items with cursor-based navigation.

### 7. Caching: Object Cache or Nothing
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Transients in MySQL = database writes on reads. At 100x scale, the DB chokes.
- **Locked:** Use WP Object Cache. No MySQL transients for read-heavy paths.

### 8. Emotional Hook & Brand Voice
- **Proposed by:** Steve
- **Winner:** Steve (Elon agreed on the goal, Steve owns the articulation)
- **Why:** Elon acknowledged that when Claude answers from a user's 2019 blog post, "that's not a feature — that's intimacy." He reframed it as "reliability is the prerequisite," but both agree the core value is recognition: the site feels like it knows you.
- **Locked:** Product voice is confident simplicity. No jargon. No acronyms. No "empowering your workflow." The site wakes up. That is the whole game.

---

## 🔒 Deadlocks (Unresolved)

### D1. Semantic Search: v1 Core vs v2 Luxury
- **Steve's position:** Semantic search is the soul of the product. SQL LIKE is fast and useless — 50ms results that miss intent are worse than 2-second results that understand. "We ship understanding, or we don't ship." SQL is the fallback for edge cases only.
- **Elon's position:** Semantic search = external APIs, keys, latency, cost, and a fallback-chain death spiral (Workers AI 500ms → Claude re-rank 2–4s → SQL LIKE 100ms). Native search ships today. AI search is v2 when 1,000 users are screaming for it.
- **Status:** **DEADLOCK.** This is the central architectural tension. Builder must make the call or ship a hybrid that satisfies neither.

### D2. Product Name: Pulse vs AgentPipe
- **Steve's position:** AgentPipe sounds like a plumbing supply company in Fresno. Pulse is a promise — a heartbeat. The name is the first interface. Pulse is a product; AgentPipe is a cable.
- **Elon's position:** Naming is a month-six luxury. A beautiful name on a broken plugin is a faster death. The product earns the name after it works. When server logs are clean at 10,000 installs, you can afford a dictionary.
- **Status:** **DEADLOCK.** Builder ships with working title; final name is a marketing decision deferred to post-launch validation.

---

## MVP Feature Set (What Ships in v1)

| Feature | Status | Owner |
|---------|--------|-------|
| WordPress plugin (REST endpoint, stateless POST) | Locked | Engineering |
| MCP resource mapping (posts → resources) | Locked | Engineering |
| API key generation on activation | Locked | Engineering |
| `resources/list` with cursor pagination (1K/page) | Locked | Engineering |
| Native SQL search (`resources/search` or equivalent) | Locked | Engineering |
| WP Object Cache integration | Locked | Engineering |
| Zero-config activation flow (activate → copy URL) | Locked | Design |
| 90-second demo video | Locked | Marketing |
| Agency white-label version | Locked | Distribution |
| **Semantic search (AI-powered)** | **DEADLOCK** | — |
| **Dashboard / analytics** | **Cut** | — |
| **WooCommerce support** | **Cut** | — |
| **Monetization / Pro tiers** | **Cut** | — |
| **Prompts namespace / tools/list** | **Cut** | — |

### v1 Exclusions (Explicitly Cut)
1. **No admin dashboard.** No charts, no toggles, no analytics.
2. **No WooCommerce.** Standard posts/pages only.
3. **No monetization.** Free plugin until product-market fit is proven.
4. **No SSE transport.** Defer to v2.
5. **No prompts namespace or tools/list.** YAGNI for Claude Desktop reading posts.
6. **No AI search fallbacks (unless deadlock resolves).**

---

## File Structure

```
agentpipe/                    # Working title; name TBD
├── agentpipe.php            # Main plugin file, activation hook, API key gen
├── includes/
│   ├── class-mcp-server.php # Stateless POST handler, MCP protocol logic
│   ├── class-resources.php  # Post-to-resource mapping, pagination cursors
│   ├── class-search.php     # SQL search engine (native; semantic TBD)
│   └── class-cache.php      # WP Object Cache wrapper
├── assets/
│   └── js/
│       └── activation.js    # One-click copy URL, zero config
├── readme.txt               # wp.org compliant
└── LICENSE
```

### Build Notes
- Plugin footprint must be < 100KB (no external UI frameworks).
- One REST route for MCP POST requests.
- One lightweight admin notice on activation: "Your site is now an AI. Copy this URL."
- All caching via `wp_cache_*()` — no custom DB tables, no option writes on reads.

---

## Open Questions (Needs Resolution Before Code)

1. **Semantic Search — Builder's Call Required**
   - Do we ship v1 with native SQL only and bet on speed + simplicity?
   - Or do we integrate a lightweight local embedding model (e.g., SQLite VSS, tiny on-device) to avoid external API latency?
   - Or do we ship with a single external semantic provider and accept the latency/cost tradeoff?
   - **Impact:** This decision determines whether `class-search.php` is 50 lines or 500, and whether the plugin requires an API key for a third-party service.

2. **Authentication Model**
   - API key per site generated on activation? Per-user? Per-connection?
   - How is the key rotated? Is there a UI for rotation (violates zero-config)?
   - **Impact:** Security model for the REST endpoint.

3. **Scope of "Resources"**
   - Posts and pages only? Custom post types? Media attachments?
   - How do we handle draft/private content in `resources/list`?
   - **Impact:** `class-resources.php` query logic.

4. **Rate Limiting & Abuse**
   - Statelessness makes rate limiting harder. Do we rely on host-level (nginx/Apache) or implement WordPress-level throttling?
   - **Impact:** If the plugin is installed on shared hosting and hammered, who dies first?

5. **Name Finalization**
   - Does marketing block on "Pulse" vs continuing with "AgentPipe"?
   - **Impact:** Zero code impact. Deferred to post-MVP.

6. **Agency White-Label Mechanics**
   - How is white-label delivered? A separate ZIP? A constant in `wp-config.php`?
   - **Impact:** Distribution packaging.

---

## Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | **Semantic search deadlock delays v1.** Builder cannot choose between Steve's "product soul" and Elon's "physics." | High | Critical | Time-box the decision to 24 hours. If unresolved, ship SQL-only with a filter hook so semantic search can be added as a drop-in module later. |
| R2 | **Shared hosting kills performance anyway.** Even stateless POST + SQL can time out on cheap hosts with 10K+ posts if queries aren't optimized. | Medium | High | Index `post_title` and `post_content` for fulltext if MyISAM; use `LIKE` with `post_status='publish'` limits. Benchmark on a slow shared host before launch. |
| R3 | **The 30-second rule breaks on first install.** WordPress security plugins (Wordfence, Sucuri) block unknown REST routes or flag the plugin. | Medium | High | Document the REST route prefix clearly in readme. Test against top 5 security plugins. Provide a one-line `.htaccess` / nginx bypass in FAQ if needed. |
| R4 | **resources/list pagination feels broken to Claude Desktop.** If the client expects all resources at once, cursors may cause incomplete answers. | Medium | Medium | Test with Claude Desktop directly. If it paginates poorly, implement a "priority resources" heuristic (recent + most-viewed) surfaced first. |
| R5 | **Zero admin UI means zero discoverability.** Users install the plugin and don't know what to do next. | Low | Medium | The activation notice must be perfect. One sentence. One button. One URL. A/B test the copy if possible. |
| R6 | **MCP spec changes.** The protocol is young. A spec revision could invalidate our stateless POST approach or resource schema. | Medium | High | Keep the MCP protocol layer thin and isolated in `class-mcp-server.php`. Abstract the transport so v2 SSE is a swap, not a rewrite. |
| R7 | **No monetization = no resources.** If the plugin gains traction, there is no revenue to fund semantic search v2 or support. | Low | Medium | This is a deliberate bet. Monitor install velocity. If >1,000 active installs in 30 days, revisit monetization. Until then, optimize for love, not revenue. |
| R8 | **Object cache not available on shared hosts.** Many cheap hosts don't have Redis or Memcached. WP Object Cache falls back to transients → MySQL writes → death spiral. | Medium | High | Detect object cache availability at runtime. If absent, disable caching and warn in the activation notice (without breaking zero-config). |

---

## Zen Master's Synthesis

> *"The strength of the team is each individual member. The strength of each member is the team."*

Elon gave us the foundation: stateless POST, zero UI, shared-hosting physics. Steve gave us the soul: the 30-second awakening, invisibility, recognition. Where they agree — cuts, distribution, zero config — we move fast. Where they deadlock — semantic search, naming — we ship the pragmatic choice and leave the door open for the romantic one.

**The builder's mandate:** Ship a cable that feels like a brain. Start with the cable. Make it so reliable that the brain is possible.

---

*Blueprint status: LOCKED pending resolution of Open Questions 1 and 2.*
