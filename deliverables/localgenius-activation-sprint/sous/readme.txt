=== Sous ===
Contributors: localgenius
Tags: ai, chatbot, reviews, local-business, widget
Requires at least: 5.8
Tested up to: 6.5
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A warm AI assistant widget and weekly review digest for local businesses.

== Description ==

Sous helps local businesses connect with visitors through a friendly chat widget and a weekly digest of review metrics.

= Features =

* Auto-detects business metadata from schema.org and OpenGraph tags.
* Single-screen admin page with collapsible sections and auto-save.
* FAQ templates tailored to restaurants, dental, retail, services, and generic businesses.
* Frontend chat widget with zero dependencies, mobile-responsive design.
* Weekly digest cron with benchmark percentile ranking.

== Installation ==

1. Upload the `sous` folder to `/wp-content/plugins/`.
2. Activate the plugin through the Plugins menu.
3. Visit the Sous admin page to confirm your business details.
4. The widget appears automatically on your frontend.

== Frequently Asked Questions ==

= Does Sous require an external API key? =

No. The plugin connects to an existing Cloudflare Worker endpoint configured by your administrator.

= Can I customize the FAQ answers? =

Yes. Every FAQ template supports template variables like {business_name} and {hours}.

= Will this slow down my site? =

No. Detection runs asynchronously after the admin page loads. Frontend assets are minimal and enqueued only where needed.

== Changelog ==

= 1.0.0 =
* Initial release.
