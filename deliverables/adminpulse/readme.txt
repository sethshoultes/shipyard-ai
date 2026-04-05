=== AdminPulse ===
Contributors: adminpulseteam
Tags: dashboard, site health, admin, monitoring, widget
Requires at least: 6.2
Tested up to: 6.5
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight dashboard widget that surfaces WordPress Site Health issues at a glance.

== Description ==

AdminPulse brings your WordPress Site Health status front and center. Instead of navigating to the Site Health page to check on issues, AdminPulse shows you what needs attention right on your dashboard.

**Features:**

* **At-a-Glance Health Overview** - See critical and recommended issues without leaving the dashboard
* **Color-Coded Severity** - Critical issues are highlighted in red, recommendations in yellow
* **Action Links** - Direct links to fix issues or learn more about each problem
* **Performance Optimized** - Loads asynchronously so your dashboard stays fast
* **Smart Caching** - Results are cached for 1 hour to reduce server load
* **Multisite Ready** - Works on individual sites within a multisite network
* **Zero Configuration** - Works out of the box, no settings needed

AdminPulse is designed to be simple and helpful. If your site is healthy, you'll see a friendly "Everything looks good!" message. If there are issues, you'll know exactly what they are and how to fix them.

== Installation ==

1. Upload the `adminpulse` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Visit your WordPress dashboard to see the Site Health widget

That's it! No configuration required.

== Frequently Asked Questions ==

= Why are there no settings? =

AdminPulse is designed to "just work." It displays the same health information that WordPress already collects, just in a more convenient location. If you need to configure a health monitor, something has gone wrong with the health monitor.

= How often does it check site health? =

AdminPulse caches health data for 1 hour to minimize server load. You can click the "Refresh" button at any time to get fresh results.

= Can I dismiss issues from the widget? =

No, and that's intentional. The philosophy is "fix it or see it." Issues should be addressed, not hidden. Once you fix an issue, it will automatically disappear from the widget.

= Does this work on multisite? =

Yes! AdminPulse shows health information for the current site only. It does not display on the Network Admin dashboard and does not aggregate network-wide health data.

= Will this slow down my dashboard? =

No. AdminPulse loads its content asynchronously after the dashboard page loads, so it doesn't affect your initial page load time. Cached results are served in milliseconds.

= Does this make external requests? =

No. AdminPulse only uses WordPress's built-in Site Health API. It does not make any external HTTP requests or send data anywhere.

== Screenshots ==

1. The AdminPulse widget showing site health issues on the dashboard
2. A healthy site with no issues to report
3. Critical issues are prominently highlighted

== Changelog ==

= 1.0.0 =
* Initial release
* Dashboard widget for WordPress Site Health
* Color-coded severity badges (critical/recommended)
* Action links to fix issues
* AJAX lazy-loading for performance
* 1-hour transient caching
* Multisite support (current site only)
* Manual refresh button
* WordPress.org coding standards compliance

== Upgrade Notice ==

= 1.0.0 =
Initial release of AdminPulse. Install to see your Site Health status at a glance.
