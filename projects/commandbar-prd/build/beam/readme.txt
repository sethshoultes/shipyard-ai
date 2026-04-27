=== Beam ===
Contributors: shipyardai
Tags: command palette, admin, navigation, keyboard, productivity
Requires at least: 5.8
Tested up to: 6.5
Requires PHP: 5.6
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A fast command palette for WordPress admin. Press Cmd/Ctrl+K to search posts, pages, users, and admin pages instantly.

== Description ==

Beam adds a keyboard-driven command palette to wp-admin. Press Cmd+K (macOS) or Ctrl+K (Windows/Linux) to open the palette, type a few characters to filter, and press Enter to navigate.

* Search published posts and pages by title.
* Search users by display name or email.
* Jump to any of the top 20 admin pages (filtered by your capabilities).
* Quick actions: Add New Post, Add New Page, View Site.
* Fully keyboard accessible with focus trapping and ARIA attributes.
* Zero configuration — no settings page, no onboarding wizard.

Beam works entirely client-side. On every admin page load, WordPress localizes a searchable index of posts, pages, users, admin URLs, and quick actions directly into the page. There are no REST API calls, no AJAX requests, and no external dependencies.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/beam/`.
2. Activate the plugin through the Plugins menu in WordPress.
3. Press Cmd+K (or Ctrl+K) in wp-admin to open the command palette.

== Frequently Asked Questions ==

= Why is new content not showing up in the palette? =

The searchable index is built when the admin page loads. If you publish a new post, page, or user, reload the admin page to refresh the index.

= Is there a settings page? =

No. Beam is intentionally zero-configuration. There are no options to set or toggles to manage.

= Will Beam ever support a light mode? =

Not in v1.0. Beam is designed as a dark-only overlay to match the focused, distraction-free aesthetic of modern command palettes. A light mode may be considered in a future release if there is demand.

== Changelog ==

= 1.0.0 =
* Initial release.
* Global Cmd/Ctrl+K hotkey to open the command palette.
* Search posts, pages, users, admin pages, and quick actions.
* Client-side filtering with zero network requests.
* Full keyboard navigation, focus trap, and ARIA support.
* Extensibility hook: `beam_items` filter.
