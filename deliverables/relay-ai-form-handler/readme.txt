=== Relay — AI Form Handler & Lead Router ===
Contributors: shipyardai
Tags: ai, forms, leads, contact-form-7, routing
Requires at least: 5.8
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0+
License URI: http://www.gnu.org/licenses/gpl-2.0.txt

Turn every form submission into a classified, routed opportunity using Claude AI.

== Description ==

Relay replaces your "dumb" WordPress contact form backend with an AI-native lead intelligence engine. Every submission is instantly stored, classified by Claude AI into Sales, Support, Spam, or General, and routed to the right team member — automatically.

**Built for agencies.** One agency managing 50 sites? Relay scales with you. Classification caching, shared-hosting compatibility, and zero setup complexity.

= Features =
* **Contact Form 7 interception** — Capture CF7 submissions without changing visitor UX.
* **Generic REST endpoint** — Accept leads from any form or external system via secure token.
* **AI classification** — Claude AI categorizes intent (Sales / Support / Spam / General) and urgency (High / Medium / Low).
* **Async processing** — Store instantly &lt; 100ms. Classify in the background via WP Cron.
* **Classification cache** — Hash-based deduplication survives agency scale.
* **Admin inbox** — Color-coded badges, sortable table, filtering, pagination, one-click reply.
* **Encrypted API key** — Stored encrypted at rest; supports `RELAY_API_KEY` constant in `wp-config.php`.

= Perfect For =
* Marketing agencies managing client WordPress sites.
* Businesses receiving high-volume contact form submissions.
* Teams that need lead routing without expensive CRM overhead.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/relay-ai-form-handler/` or install via the WordPress plugin screen.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to **Relay → Settings** and enter your Claude API key.
4. Configure routing emails for Sales, Support, and General categories.
5. Enable Contact Form 7 or REST integration as needed.
6. Submit a form and watch Relay classify and route your first lead.

== Frequently Asked Questions ==

= Do I need a Claude API key? =
Yes. Relay uses Anthropic's Claude API to classify submissions. You can obtain a key at https://console.anthropic.com/

= Does Relay work without Contact Form 7? =
Yes. Relay provides a generic REST endpoint (`/wp-json/relay/v1/submit`) that accepts submissions from any source. You can also hook into it programmatically.

= What happens if Claude API is down? =
Relay retries classification up to 3 times with exponential backoff. If all retries fail, the lead is marked "failed" and can be reprocessed manually.

= Is my API key secure? =
Yes. Keys are encrypted at rest using OpenSSL with a secret derived from your `wp-config.php` salts. You can also define `RELAY_API_KEY` directly in `wp-config.php` to skip database storage entirely.

= Will this slow down my site? =
No. Relay stores submissions instantly and processes classification asynchronously via WP Cron. Visitors never wait for AI classification.

== Changelog ==

= 1.0.0 =
* Initial release.
* CF7 interception, REST endpoint, Claude classification, cache, async routing.
* Admin inbox with badges, filtering, sort, pagination.
* Dashboard widget with manual "Process Now" button.
* Encrypted API key storage and `RELAY_API_KEY` constant support.
