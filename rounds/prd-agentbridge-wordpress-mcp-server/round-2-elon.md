# Round 2 — Elon Musk

Steve, I admire your hatred of wizards and dark patterns. But you are polishing the trophy before we have won the race.

## Where Beauty Becomes Bottleneck

**"Relay" is a v1.1 problem.** Changing the name before a single GitHub star exists is bikeshedding. Ship `agentbridge-wordpress-mcp-server` today; rename after it works for 1,000 sites. The repo slug is SEO, not poetry.

**The "museum" admin screen conflicts with my cut list.** You want one card, one URL, one token, one copy button. That still requires a registered settings page, REST route for the snippet, enqueued CSS, and a copy-to-clipboard library. That is half a day of work to avoid showing the user a raw Application Password. If the UI is a single field, skip the UI entirely and print the URL in `admin_notices`. Twenty minutes.

**"No feature toggle grids" locks us to ten tools.** I want four. If you refuse toggles, you are implicitly refusing to cut scope. Pick one: either we ship only the obvious four, or we admit we are shipping ten and need a grid. You cannot have "no configuration" and "no cuts" simultaneously.

**"Documentation is a crutch" is reckless.** This is a protocol adapter for developers. If the SSE endpoint is unauthenticated and holds PHP workers open, the README *must* explain that. Hiding constraints behind "arrogant simplicity" is how you get 1-star reviews from hosts that crash.

## Why Technical Simplicity Wins

Application Passwords eliminate a whole class of key-storage bugs. Every line of custom auth is a liability. The WordPress core team already solved this; ignoring them to build a "Secret Key" label is reinventing the wheel with worse cryptography.

A GitHub release with four tools proves demand in 24 hours. WP.org submission is a weekend of SVN theater, readme validation, and screenshot bureaucracy. If nobody installs it from GitHub, WP.org will not save us. If everybody installs it from GitHub, WP.org becomes effortless because the plugin already works.

PHP-FPM workers are a hard ceiling. We do not SSE our way around it; we document it. Honest constraints build trust. Magical thinking builds refunds.

The `sleep(1)` loop in SSE is not elegant, but it is honest. Pretending PHP is Node.js is how projects die. We ship the constraint, then iterate toward a companion Go binary only if the GitHub stars justify the engineering month.

Cutting `upload_media` is not a taste decision; it is a survival decision. An open URL proxy on shared hosting becomes a warez box within a week. The emotional hook of "your site is now listening" dies when the host suspends the account.

## Where Steve Is Right

- No onboarding wizards. If it needs a wizard, the architecture is broken.
- No freemium banners or review nags. The admin screen is sacred.
- "Your site is now listening" is excellent copy. Cheap to implement, high emotional yield.

Taste is a multiplier, but zero times any multiplier is still zero. Ship the engine first; paint the hood later.

## Non-Negotiables

1. **Four tools, bare SSE, Application Passwords only.** Ship the GitHub release in one session. Everything else is v1.1.
2. **Zero custom authentication code.** No plugin tokens, no key tables, no "Secret Key" abstraction. Use what WordPress already ships.
3. **WP.org and renaming are rewards, not blockers.** We do not submit to SVN or debate product names until 100 real installs prove the protocol adapter is wanted.

Ship the rocket. Then make it pretty.
