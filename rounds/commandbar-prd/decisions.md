# Beam — Locked Decisions

*The following is the game plan. No more debate. Execute with precision.*

---

## Locked Decisions

### 1. Product Name: Beam
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Steve made this a non-negotiable in Round 2. Elon dismissed it as "marketing fluff" but never blocked it architecturally. The name aligns with the essence doc: teleportation, not bureaucracy. The plugin header will read **Beam**.

### 2. Architecture: Client-Side Index, Zero REST API
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Steve conceded in Round 2: "I was wrong to accept the PRD's API-first assumption without questioning it." The performance argument was decisive—eliminating HTTP round-trips removes latency entirely and prevents shared-host throttling at scale. The searchable index is built once per admin page load via `wp_localize_script` and filtered in-browser with `Array.filter()`.

### 3. No Settings Page
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Unanimous. Elon: "Every option is a support ticket." Steve: "A settings page is a confession that you don't know who you're building for." Sensible defaults or death. No configuration UI ships in v1.

### 4. Zero Onboarding
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Unanimous. Steve: "Tutorials are confessions of failure." Elon agreed. If the user can't figure out Beam in ten seconds, the design is broken—not the user.

### 5. No Recent Commands / No localStorage
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Unanimous. Steve actually argued this more passionately: "Nothing is more beautiful than a blank search field full of possibility. Memory is the enemy of momentum." No state persistence in v1.

### 6. Dark-Only UI
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Elon conceded because "it's one CSS block instead of two" (smaller payload). Steve's design argument held: the dark stage is what makes the spotlight a spotlight. No light mode. No theme switching.

### 7. Minimal File Structure: ~200 Lines PHP, ~300 Lines JS, Inline CSS
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Non-negotiable #2. "If it requires more files, more classes, or a build step, it doesn't ship." Steve pushed back on inline CSS ("the path to spaghetti") but did not elevate it to a non-negotiable. The one-session constraint wins. Bureaucracy is the enemy.

### 8. Hardcode Top 20 Admin URLs + Clean Filter Hook
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Dynamic admin menu parsing was deemed "edge-case hell" by both. Steve agreed: "Hardcode the top URLs, offer a clean filter hook, and move on." The extensibility hook is the distribution multiplier—other plugins inject items, Beam parasitizes their install base.

### 9. No Cache-Clearing Integrations
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Unanimous. "Fragile, edge-case hell, and provides minimal user value." CUT.

### 10. No Plugin Activation Inside the Palette
- **Proposed by:** Steve (Round 1), Elon independently concurred
- **Winner:** Steve
- **Why:** Unanimous. Steve: "Navigation and administration are different planets." Elon: "The white-screen argument is the correct technical reason." Stay in your lane.

### 11. Animated, Chromeless Modal
- **Proposed by:** Steve
- **Winner:** Steve
- **Why:** Steve's non-negotiable #2: "The modal is dark, chromeless, and animated." Elon dismissed animation as "paint job" and "poetry" but his non-negotiables were architectural, not UX-blocking. The 200ms fade is the transition from chaos to intent. It ships.

### 12. Distribution via Extensibility Hook
- **Proposed by:** Elon
- **Winner:** Elon
- **Why:** Both agree. WordPress.org organic discovery is a graveyard. The real multiplier is making the plugin extensible so popular plugins adopt it. The hook must be ~5 lines of PHP, not a registry abstraction.

---

## MVP Feature Set (What Ships in v1)

**Core Experience**
- `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) keyboard trigger in wp-admin
- Dark, chromeless, animated modal overlay (200ms fade, spotlight aesthetic)
- Zero onboarding, zero settings, zero localStorage

**Search**
- Client-side `Array.filter()` on a JSON index delivered via `wp_localize_script`
- Searchable content: posts, pages, users, hardcoded admin URLs
- Real-time filtering as user types

**Admin URLs**
- Hardcoded top 20 WordPress admin URLs (exact list TBD under Open Questions)
- Clean PHP filter hook for third-party plugins to inject searchable items

**Accessibility**
- Focus trapping within modal
- `Escape` to close
- Basic ARIA attributes

**What is EXPLICITLY NOT in v1**
- REST API endpoints
- Cache plugin integrations (WP Rocket, W3TC, LiteSpeed)
- Dynamic admin menu parsing
- Plugin activation / deactivation
- Recent commands / command history
- localStorage of any kind
- Settings page
- Onboarding wizard / tooltips / tutorials
- AI suggestions
- Light mode
- Separate CSS file
- Build step / bundler

---

## File Structure (What Gets Built)

```
beam/
├── beam.php          # ~200 lines. Plugin header, enqueue, localize_script, filter hook
└── beam.js           # ~300 lines. Vanilla JS. Modal, search, inline CSS, animation, keyboard handler
```

**Constraints**
- Exactly two files. No subdirectories.
- No build step. No npm. No webpack.
- No separate CSS file. Styles are inline (injected via JS or PHP).
- No OOP class hierarchy. Procedural PHP, functional JS.
- No REST endpoint registration.

---

## Open Questions (What Still Needs Resolution)

1. **Exact Top 20 Admin URLs**
   The hardcoded list of admin URLs must be enumerated before coding starts. Which 20? Does `customize.php` make the cut? Does `site-health.php`?

2. **"Refreshed Intelligently"**
   Steve conceded client-side indexing but qualified it: "built on page load, refreshed intelligently." What does intelligent refresh mean? AJAX refresh on publish? Heartbeat poll? This phrase is scope creep if undefined. Lock it down or kill it for v1.

3. **Index Size Ceiling**
   At what post count does the localize_script payload become a performance liability? 1,000 posts? 10,000? Do we cap the index or paginate the dataset?

4. **Animation Spec Beyond Fade**
   "200ms fade" is mentioned, but easing curves, entrance direction, and exit behavior are undefined. Does the modal scale in? Slide? Steve says "carved from a single block of aluminum"—that implies a spec.

5. **Focus Trapping Implementation**
   Accessibility focus trapping is estimated at 30 minutes, but the exact pattern (roving tabindex, sentinel elements) is undecided.

6. **Filter Hook Signature**
   What is the exact PHP filter name and expected array shape? `add_filter( 'beam_items', callable )` returning what fields? (`title`, `url`, `icon`, `type`?)

7. **Capability Filtering**
   Should the localized index respect current user capabilities? If an Editor loads the page, do they see Administrator-only URLs? How is that filtered?

8. **Keyboard Shortcut Collisions**
   `Cmd+K` and `Ctrl+K` are claimed by Gutenberg link insertion, Yoast, and other plugins. Collision strategy is undefined.

9. **Media / CPT Inclusion**
   Do attachments, custom post types, and custom taxonomies appear in the index by default? Or only posts and pages?

10. **JS Failure Fallback**
    If JS fails to load or is blocked, is there any fallback? Or does the plugin silently degrade?

---

## Risk Register (What Could Go Wrong)

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Index Staleness** | High | High | User publishes a post; index is stale until next page load. Steve explicitly warned: "A 50KB client-side index that omits a post I published thirty seconds ago doesn't feel fast—it feels broken." Define a max staleness window or accept the UX hit. |
| **Index Bloat on Large Sites** | High | Medium | Sites with 10k+ posts could produce a 500KB+ localize_script payload, slowing every admin page load. Cap the index or add a post-count threshold. |
| **Capability Mismatch** | Medium | High | Hardcoded URLs don't respect dynamic capability checks. A user may see a link they cannot access, leading to frustration or security questions. Filter index by user caps before localizing. |
| **Accessibility Gap** | Medium | Medium | Focus trapping and ARIA implementation are non-trivial. Missing them blocks WordPress.org repo approval and excludes users. Allocate real time, not the fantasy 20-minute estimate. |
| **Keyboard Shortcut Collision** | Medium | High | `Cmd+K` / `Ctrl+K` conflicts with Gutenberg, Yoast, and others. Without a collision strategy, Beam may hijack or be hijacked. Define precedence and override rules. |
| **Maintenance Debt** | Medium | Medium | Inline CSS and single-file architecture optimize for ship speed, not longevity. Steve: "Inline styles are the path to spaghetti." Budget for a refactor in v2. |
| **Distribution Failure** | High | Medium | Without a dedicated launch push (blog post, WP Tavern, Post Status, Advanced WP group), the plugin dies in the WP.org graveyard. Marketing is not a feature; it is a dependency. |
| **Scope Creep from "Smart Refresh"** | Medium | Low | The undefined "refreshed intelligently" requirement could spawn AJAX polling, heartbeat integration, or WebSockets. Kill it for v1 or lock the definition. |
| **Shared-Host Query Strain** | Low | Medium | Building the index on every admin page load runs unindexed queries. If the post query is inefficient, cheap hosting suffers. Optimize the query or cache the index server-side. |
| **Design-Engineering Friction in Build** | Medium | Medium | Steve wants cathedral; Elon wants engine. The builder may freeze between "someone cared" and "ship it now." This document is the tie-breaker. Architecture wins disputes; feeling wins where architecture is silent. |

---

*The triangle is set. Build the engine. Honor the feeling. Ship in one session.*
