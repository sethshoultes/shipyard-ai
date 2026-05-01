# Round 1 Review — Elon Musk

## Architecture
The PRD wants SSE over PHP with `sleep(1)` loops and transient-based message queues. This is architecturally broken. PHP is request/response; a persistent SSE connection holds a PHP-FPM worker doing nothing. On a $10 shared host with 10 workers, 10 concurrent users kills the site. The "simplest system that works" is honest about this constraint: ship it, but document that it caps at ~5 concurrent sessions on cheap hosting. Don't pretend transients are a message queue—they're database rows with TTL. Every message is a DB write.

## Performance
Bottleneck #1: PHP worker exhaustion from SSE sleeps. Bottleneck #2: `wp_options` transient spam under any real load. 10x path isn't optimization—it's deleting the plugin-token auth flow (CUT IT) and using WordPress Application Passwords natively, which removes a whole crypto surface. For media, `upload_media` fetching arbitrary URLs is synchronous blocking I/O; cap at 2MB and timeout hard at 10s or cut the feature entirely.

## Distribution
"WP.org plugin directory + Hacker News" is not a distribution strategy, it's a prayer. 100 active installs in 7 days is hard. 10,000 users with zero paid ads requires becoming the canonical answer to "how do I connect Claude to WordPress." That means GitHub SEO, 3-minute YouTube demos, and WordPress agencies installing it across client fleets. One agency with 50 sites beats 50 random bloggers. Target agencies, not end users. Build a one-click demo video, not a readme.txt novella.

## What to CUT
- **Plugin token auth**: Use Application Passwords only. Half the auth code, zero key storage risk.
- **Connection log**: Complete waste of an hour. Custom table or transients for vanity metrics? No.
- **CORS origins UI**: Default `*` for v1. If someone needs CORS lockdown, they're advanced enough to filter a header.
- **`list_users` / `get_user`**: An AI writing posts doesn't need to browse the staff directory. Low utility, high PII surface.
- **`upload_media`**: Fetching arbitrary URLs is a malware vector and abuse magnet. Defer to v1.1 or add a server-side allowlist.
- **ACF in `get_post`**: Scope creep masquerading as compatibility. If ACF is present, the standard REST API often exposes it already. Don't special-case plugins in v1.
- **8-hour timeline**: Delusional. Hour 1 alone (SSE session management in PHP) is 3 hours for a competent dev.

## Technical Feasibility
One agent session can build a *working prototype* with 4 core tools (`list_posts`, `get_post`, `create_post`, `update_post`), bare SSE, and App Password auth. It cannot build production-ready JSON-RPC compliance, 10 tools, admin UI, security audit, packaging, and WP.org submission in 6–8 hours. The hour-by-hour breakdown is fantasy. Pick 4 tools and ship a GitHub release, not WP.org.

## Scaling
At 100x usage, PHP-FPM worker pools exhaust first. The SSE endpoint is unauthenticated, so an attacker opens 1,000 connections and holds them—free DDoS. No rate limiting anywhere. The `upload_media` tool becomes a free file-hosting proxy. The transient table experiences write contention. If this succeeds, you'll need a companion Go/Node binary for the SSE hub, or accept that it only runs on hosts with 100+ workers (i.e. not the long tail of WordPress).

**Verdict:** Cut scope by 50%, ship the GitHub release today, WP.org later. If it takes more than one session, it doesn't ship today—and that's fine, as long as you're honest about it.
