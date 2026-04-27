# Round 1 — Elon (CPGO)

## Architecture: Wrong Transport, Wrong Platform

PHP is request/response. SSE is long-lived connection. Every MCP client holds a PHP-FPM worker hostage. On shared hosting—where 60% of WordPress lives—that worker dies in 30 seconds. You just built a plugin that doesn't work on most WordPress sites.

**First principles:** What is the simplest system? Stateless HTTP POST. MCP over SSE is an implementation detail, not a law. If the spec demands SSE, we document "requires VPS or dedicated worker" and lose the market. Or we do stateless POST and accept a 200ms reconnect cost versus a 100% failure rate on cheap hosts.

## Performance: The Fallback Chain Is a Latency Death Spiral

Workers AI (500ms) → Claude re-rank (2-4s) → SQL LIKE (100ms). In the worst case, a user waits 5 seconds for search results that a basic SQL query could return in 50ms. That's not hybrid AI. That's denial of service.

`resources/list` on a site with 50,000 posts returns 50,000 URIs. No pagination in the spec? Then paginate at 1000 and document it. Otherwise you OOM on shared hosting.

## Distribution: Chasing the Wrong Audience

ProductHunt is a graveyard for WordPress plugins. MCP directories have 12 visitors. Your user is a freelancer managing 12 client sites. They find plugins on wp.org or in agency Slack channels.

**10,000 users without ads:** Make a 90-second video of Claude answering "what's my pricing" using the actual site content. Post it in 5 WordPress agency Facebook groups. Give agencies a white-label ready version for free. Agencies are your distribution, not Claude Desktop users.

## What to CUT

- **Semantic search (v1):** External APIs, keys, latency, cost. Native search works. Ship it. AI search is v2 when you have 1,000 users screaming for it.
- **WooCommerce support (v1):** 15% of WordPress sites. Cut. Add when asked.
- **Admin dashboard charts:** Vanity metrics that write to the DB on every request. Cut. A text log file is fine.
- **Monetization plan:** You have 50 installs in week 1. Planning Pro tiers is theater. Build something people use first.
- **Prompts namespace and tools/list:** Claude Desktop doesn't need these to read your posts. YAGNI.

## Technical Feasibility: One Session, Yes—If We Kill SSE

A WordPress REST plugin with resource handlers and API keys? 4 hours.

SSE transport across hosting environments? That's not a feature, that's a support ticket avalanche. One session can build the core. One session cannot debug SSE on GoDaddy, Bluehost, SiteGround, and WP Engine.

**Verdict:** Stateless POST for MCP. SSE is v2 after we know our hosting matrix.

## Scaling: What Breaks at 100x

- **PHP-FPM worker exhaustion:** 100 concurrent SSE connections = 100 workers. Default pool is 5-10. Site dies.
- **No object cache:** Transients in MySQL = database writes on reads. At 100x, the DB chokes.
- `resources/list` without cursors: Linear scan of post table. 100K posts = 30s+ query.

**What we need:** Connectionless transport, aggressive caching (WP object cache or nothing), and paginated resource listing with cursors.

## Bottom Line

The idea is sound—WordPress needs to talk to agents. The execution plan is over-engineered. Cut the AI search, cut the dashboards, cut the monetization theater. Build a rock-solid REST endpoint that maps posts to MCP resources and works on shared hosting. Everything else is v2.
