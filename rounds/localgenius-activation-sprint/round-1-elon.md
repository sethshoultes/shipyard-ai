# Elon Review: LocalGenius Activation Sprint

## Architecture
The simplest system that works is a single admin page with three collapsible sections, not a "progressive wizard" with 3 PHP view files and step-state machines. Users don't want a narrative arc—they want to see their business detected and their widget live in under 60 seconds. One `admin.php`, one `widget.js`, one `templates.json`. If you need a state machine to onboard someone to a chat widget, you've already failed.

## Performance
The bottleneck isn't the widget. It's scraping schema.org **synchronously on plugin activation** inside shared WordPress hosting. That HTTP call will timeout on 30% of cheap hosts before the user sees anything. Move detection to an async admin-ajax call fired after the page loads, or skip it entirely and let them paste their URL. The 10x path is: render first, detect second.

## Distribution
10,000 users without paid ads is trivial for a WordPress plugin if activation actually works. The distribution mechanism is the wordpress.org plugin repository + one genuinely useful blog post ("I installed this on my dentist's site"). WordPress users are desperate for anything that doesn't look like homework. If minute-3 value is real, admin-bar word of mouth does the rest. No ads needed. No "growth hacks" needed. Just a product that doesn't show an empty table.

## What to CUT
- **The 3-step wizard.** Replace with one editable screen. "Wizard" is scope creep masquerading as UX design.
- **First-run tooltip.** v2 engagement theater. Cut.
- **"Quick win" email at 24 hours.** v2 retention feature. Cut.
- **Empty state illustration.** If you pre-populate FAQs correctly, the empty state doesn't exist. Don't design for a failure mode you can eliminate.
- **Widget preview panel.** Load the actual widget on their actual site. An admin-preview iframe is duplicated code that will drift from reality.

## Technical Feasibility
Can one agent session build this? **Only if you cut the above.** The scoped version is: schema scraper (~100 lines PHP), FAQ templates (~200 lines JSON), widget (~300 lines vanilla JS/CSS), admin page (~200 lines PHP/JS), digest hook (~50 lines). ~850 lines total. That's a single session. Add the wizard, tooltips, and emails and you're shipping empty directories again.

## Scaling
What breaks at 100x? **The benchmark percentile query.** `PERCENT_RANK() OVER (PARTITION BY category, city)` is O(n log n) and requires a full table scan per user per weekly digest. At 10,000 users you're fine. At 100,000 users, D1 will timeout or bankrupt you on compute. Pre-compute category/city percentile tables nightly, or use approximate percentiles. Don't run ranking queries in the hot path.
