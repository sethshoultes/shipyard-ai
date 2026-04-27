=== AgentPipe ===
Contributors: shipyardai
Tags: ai, mcp, claude, wordpress, api
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Turn any WordPress site into an AI-native data source via the Model Context Protocol (MCP).

== Description ==

AgentPipe exposes your WordPress posts and pages as MCP resources, allowing AI assistants like Claude Desktop to query your site with zero configuration. Install, activate, copy the MCP URL, and talk to your site.

= Features =
* Standards-compliant MCP endpoint over HTTP POST
* Automatic API key generation on activation
* Cursor-based pagination for resources
* SQL search engine with LIKE and optional FULLTEXT
* WP Object Cache integration for performance
* Zero admin UI — one activation notice with copy button
* Agency-ready white-label support

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/agentpipe`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Copy the MCP URL from the dashboard notice into Claude Desktop

== Frequently Asked Questions ==

= Does this work without an external cache? =
Yes. The plugin detects whether your host supports external object caching and gracefully falls back to direct database queries if not.

= How do I regenerate the API key? =
Deactivate and reactivate the plugin.

= Can I white-label this for clients? =
Yes. Define `AGENTPIPE_WHITE_LABEL`, `AGENTPIPE_LABEL_NAME`, and `AGENTPIPE_LABEL_URL` in `wp-config.php`.

== Changelog ==

= 1.0.0 =
* Initial release with MCP resources/list, resources/read, and tools/search support.
* Automatic API key generation and zero-config activation.
* White-label agency support.