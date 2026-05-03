=== AgentPress ===
Contributors: emdash
Tags: ai, content generation, image generation, claude, cloudflare, automation
Requires at least: 6.0
Tested up to: 6.5
Stable tag: 1.0.0
Requires PHP: 8.0
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your WordPress site into an AI agent orchestration hub with built-in content and image generation.

== Description ==

AgentPress turns WordPress into a powerful AI agent orchestration platform. With a single REST endpoint, you can route tasks to specialized agents for content writing and image generation. The plugin uses local keyword matching for fast routing and falls back to Claude's intelligent routing for ambiguous tasks.

The plugin includes two built-in agents: ContentWriter for generating written content using Claude AI, and ImageGenerator for creating images using Cloudflare Workers AI. All configurations are managed through a simple settings screen under Tools → AgentPress, with support for wp-config.php constants for enterprise deployments.

AgentPress is designed with performance and security in mind, featuring auto-pruning activity logs, HTTPS-only image URLs, and comprehensive error handling. The minimalist admin interface keeps things simple while providing full visibility into agent executions and latency metrics.

== Installation ==

1. Upload the `agentpress` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to Tools → AgentPress to configure your API keys
4. Add your Claude API key and Cloudflare Worker URL to start generating content

== API Example ==

Use curl to test the endpoint:

curl -X POST "https://yoursite.com/wp-json/agentpress/v1/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'username:application_password' | base64)" \
  -d '{"task": "Write a blog post about WordPress plugins"}'

== Frequently Asked Questions ==

= What API keys do I need? =

You need a Claude API key from Anthropic for content generation and a Cloudflare Workers endpoint for image generation.

= Can I use my own image generation service? =

Yes, you can point the Cloudflare Worker URL to any compatible image generation API that returns HTTPS URLs.

= Does this work with multisite? =

Yes, AgentPress works with WordPress multisite installations. Each site can have its own API configuration.

= Is my data sent to third-party services? =

Yes, the plugin sends tasks to Claude's API for content generation and to your configured Cloudflare Worker for image generation.

== Changelog ==

= 1.0.0 =
* Initial release
* ContentWriter and ImageGenerator agents
* Single REST API endpoint
* Admin settings screen
* Activity logging with auto-prune
* Local keyword routing with Claude fallback

== Upgrade Notice ==

= 1.0.0 =
Initial release of AgentPress AI agent orchestration platform.

== Disclaimer ==

This plugin uses Anthropic's Claude API. Use of this API is subject to Anthropic's Terms of Service. Please review their terms before using this plugin.