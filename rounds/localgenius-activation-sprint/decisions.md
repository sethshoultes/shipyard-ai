# Locked Decisions — LocalGenius Activation Sprint (Sous v1)

> *"The strength of the team is each individual member. The strength of each member is the team."*
> — Phil Jackson

---

## Decision Register

### 1. Product Name: Sous
- **Proposed by**: Steve Jobs
- **Winner**: Steve Jobs
- **Why**: Elon's "paint the car later" logic fails here. A name is not paint; it is the compass the team navigates by. Building for "LocalGenius" produces a feature list. Building for "Sous" produces a partner. The string change costs zero lines of architecture but determines every copy decision downstream. The product is Sous.

### 2. Onboarding Architecture: Single Pre-Populated Admin Screen
- **Proposed by**: Elon Musk (architecture) + Steve Jobs (emotion)
- **Winner**: Synthesis
- **Why**: Elon wins on implementation — one `admin.php`, zero wizard state machines, zero step-state drift. Steve wins on experience — the screen must open with recognition ("We found Maria's Trattoria. Does this look like you?"), not a blank form. The result: one collapsible admin page, pre-populated via async detection, where the user reviews rather than creates. No "Next" buttons. Auto-save. Continuous gesture preserved in single-page physics.

### 3. Schema Detection: Async, Post-Render
- **Proposed by**: Elon Musk
- **Winner**: Elon Musk (unanimous)
- **Why**: Thirty percent of cheap shared hosts timeout on synchronous activation hooks. The screen renders first with a warm "Finding your business..." state, then populates. Never block the user on a network call they didn't request.

### 4. Widget Preview: Live Frontend, Zero Admin Simulation
- **Proposed by**: Elon Musk
- **Winner**: Elon Musk (Steve's concern acknowledged and redirected)
- **Why**: Steve's "no preview, no ship" is correct about trust, wrong about implementation. An admin preview panel is duplicated code that drifts. The widget renders on the actual frontend from minute one with a graceful default state. The admin page contains a single prominent "See Your Live Widget" action that opens the real site. Trust is earned by reality, not simulation.

### 5. Brand Voice: Warm, Specific, Human
- **Proposed by**: Steve Jobs
- **Winner**: Steve Jobs (unanimous)
- **Why**: Both agree. "Optimize your workflow" is poison. Copy passes the mom test or it is burned. Every template, label, and micro-interaction speaks like a person who likes people. This ships in the same JSON file; it costs nothing and differentiates everything.

### 6. MVP Cuts
- **Proposed by**: Elon Musk
- **Winner**: Elon Musk (Steve concurs on 2/4, Phil overrides on remainder)
- **Why**:
  - ❌ 3-step wizard → CUT. Replaced by single-screen synthesis above.
  - ❌ First-run tooltip → CUT. Theater for a product that should not need explanation.
  - ❌ 24-hour "quick win" email → CUT. Patch for a bad landing. Fix the landing.
  - ❌ Empty state illustration → CUT. Pre-populated data eliminates the empty state.
  - ❌ Admin preview panel → CUT. See Decision 4.

### 7. Scaling: Pre-Compute Percentiles Nightly
- **Proposed by**: Elon Musk
- **Winner**: Elon Musk (unanimous)
- **Why**: `PERCENT_RANK()` over category/city is O(n log n) and will bankrupt compute at scale. Pre-compute approximate percentile tables nightly. Not needed for v1 MVP, but the table schema must support it.

### 8. Technical Scope: ~850 Lines, Single Session
- **Proposed by**: Elon Musk
- **Winner**: Elon Musk
- **Why**: The MVP is: schema scraper (~100 lines PHP), FAQ templates (~200 lines JSON), widget (~300 lines vanilla JS/CSS), admin page (~200 lines PHP/JS), digest hook (~50 lines). Sous-level warmth and recognition are expressed within this footprint, not outside it.

---

## MVP Feature Set (What Ships in v1)

1. **WordPress Plugin Skeleton**
   - Standard plugin header, activation/deactivation hooks
   - Simple flat `require` structure — no autoloader complexity

2. **Async Business Detection**
   - Admin-ajax endpoint for schema.org scraping
   - Graceful fallback: manual URL paste if scraping fails
   - Results cached in WordPress options table

3. **Single Admin Page (`admin.php`)**
   - Collapsible sections: Business Profile, FAQ Templates, Widget Settings
   - Pre-populated with detected data
   - Auto-save (no explicit save buttons)
   - "We found [Business Name]. Does this look like you?" as first impression
   - Prominent "View Live Widget" external link

4. **Widget (`widget.js` + `widget.css`)**
   - Vanilla JS, zero dependencies
   - Renders on frontend via `wp_enqueue_scripts`
   - Graceful default state before configuration
   - Warm, specific copy from JSON templates
   - Mobile-responsive

5. **FAQ Templates (`templates.json`)**
   - ~200 lines of category-aware FAQ pairs
   - Restaurant / dental / legal / generic verticals
   - Voice: human, warm, mom-test approved

6. **Weekly Digest Hook**
   - `wp_schedule_event` for Monday 9am local time
   - Response time summary + category percentile
   - Exact computation for MVP; schema supports future pre-compute

---

## File Structure

```
sous/
├── sous.php                    # Main plugin file, headers, activation hooks
├── admin.php                   # Single admin page (Decision 2)
├── includes/
│   ├── detector.php            # Schema.org scraper + async handler
│   ├── data-store.php          # WP Options wrapper + caching
│   └── scheduler.php           # Weekly digest cron
├── assets/
│   ├── widget.js               # Frontend widget (~300 lines)
│   ├── widget.css              # Widget styles
│   └── admin.css               # Admin page styles (minimal)
├── data/
│   └── templates.json          # FAQ templates + copy (~200 lines)
└── readme.txt                  # wordpress.org repo ready
```

---

## Open Questions

1. **Default Widget State**: What does the widget show before business detection completes or if detection fails? A generic "Welcome" with Sous branding, or a collapsible minimal version?
2. **Auto-Save Mechanism**: WordPress heartbeat or individual ajax calls per field? Heartbeat is cleaner but may feel sluggish for "continuous gesture."
3. **Schema.org Fallback**: If no schema.org data is found, do we show a URL input inline or redirect? Inline preserves the single-screen philosophy.
4. **Digest Recipients**: Admin email only, or should we discover business contact email during detection?
5. **Vertical Coverage**: How many categories in v1 templates? Restaurant + dental + generic is safe, but we need a hard number.
6. **Percentile Baseline**: What is the seed data for category/city percentiles? MVP will compute exact over all users, but we need at least N users per category before the metric is meaningful.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|----------|
| **Shared host timeout on async detection** | Medium | High | Render first with default state; detection is enhancement, not gate. Timeout handled gracefully with manual fallback. |
| **Schema.org scraping fragility** | High | High | Sites without schema.org markup are common. Fallback to manual URL entry + business name input. Never block activation. |
| **Widget CSS conflicts with themes** | Medium | Medium | Aggressively namespaced BEM classes. Test on Twenty Twenty-Four, Astra, Divi. Shadow DOM deferred to v2. |
| **"Continuous gesture" feels broken on slow hosts** | Medium | Medium | All auto-save is optimistic UI. If heartbeat/ajax lags, show subtle "saved" confirmation, not blocking spinner. |
| **Category/city seed data too thin for percentiles** | High | Low | Percentiles hidden until N=10 users in category/city. Show absolute metrics only until then. |
| **Plugin rejected from wordpress.org repo** | Low | High | Follow repo guidelines strictly: no external calls without consent, sanitize all inputs, escape all outputs, GPLv2 compatible. |
| **Scope creep: "Sous means we need better design"** | Medium | Medium | The name sets the bar for copy and interaction, not visual assets. No custom illustration, no animation library. Working is beautiful. |

---

*This document is frozen. Build from it. Do not debate it. If a question arises, answer it within the constraints above or escalate to Phil.*
