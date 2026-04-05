# PRD: AdminPulse — WordPress Site Health Dashboard Widget

## Overview
AdminPulse is a WordPress dashboard widget that surfaces the five most actionable site health signals in a single glance — no drilling into menus, no plugin sprawl. It turns WordPress buried diagnostic data into a prioritized to-do list that any site owner can act on immediately.

## Problem
WordPress buries critical health information across Site Health, Security, Updates, and third-party plugin screens — most site owners never see it until something breaks. Non-technical users lack a single, prioritized view that tells them what to fix first and why it matters.

## Solution
- Dashboard widget showing top 5 health issues ranked by severity (critical > warning > info)
- Each issue displays: what it is, why it matters, and a direct action link to fix it
- Color-coded severity badges (red / amber / green) for instant visual scanning
- All Clear state with last-checked timestamp when no issues exist
- Manual refresh button to re-run checks on demand
- Dismissible notices for issues the admin has acknowledged
- Lightweight settings page to configure which check categories to include

## Technical Requirements
- PHP 8.0+, WordPress 6.2+
- No external HTTP requests — pulls exclusively from WP core APIs
- Zero dependencies: no Composer, no NPM
- Single plugin file + one assets file (vanilla JS)
- Multisite compatible
- Follows WordPress Coding Standards

## MVP Scope
1. Register dashboard widget via wp_dashboard_setup
2. Aggregate issues from WP_Site_Health::get_tests() output
3. Inject update nag data (core, plugin, theme counts)
4. Render prioritized list with severity badges and direct admin links
5. Dismiss/acknowledge individual issues stored in user meta
6. Manual refresh via AJAX with nonce verification
7. Settings page: toggle check categories

## Success Metrics
- Widget renders in under 200ms
- Zero JavaScript errors in console
- Passes WordPress Plugin Review automated checks
- Plugin activates and deactivates cleanly
