# AdminPulse — Locked Decisions
## The Zen Master's Consolidation

*"The strength of the team is each individual member. The strength of each member is the team."*

---

## Decision Log

### 1. Product Name
| | |
|---|---|
| **Proposed by** | Steve (Pulse) vs. Elon (AdminPulse) |
| **Winner** | **Elon** |
| **Decision** | Ship as **"AdminPulse"** on WordPress.org |
| **Reasoning** | "Pulse" has 847+ trademark conflicts. A cease-and-desist six months post-launch kills momentum. Defensible name > beautiful name. Rebrand is possible after traction if trademark clearance succeeds. |

---

### 2. Information Architecture
| | |
|---|---|
| **Proposed by** | Steve (one signal) vs. Elon (full list with badges) |
| **Winner** | **Elon (modified by Steve)** |
| **Decision** | Show all health issues with **severity badges** and **color-coded visual hierarchy** |
| **Reasoning** | Steve's "one thing" requires a prioritization algorithm that second-guesses WordPress core — arrogance disguised as simplicity. But Steve wins the *presentation* layer: glanceable color hierarchy (green/yellow/red), human-readable copy, information density without visual clutter. |

---

### 3. Settings Page
| | |
|---|---|
| **Proposed by** | Both (unanimous) |
| **Winner** | **Consensus** |
| **Decision** | **No settings page in v1** |
| **Reasoning** | Steve: "If you need to configure a health monitor, you've failed." Elon: "Settings add maintenance burden and test surface." Same conclusion, different paths. Ship smart defaults. |

---

### 4. Dismiss Functionality
| | |
|---|---|
| **Proposed by** | Both (unanimous) |
| **Winner** | **Consensus** |
| **Decision** | **No dismiss without fix** |
| **Reasoning** | Steve: "Dismissing problems is how trust erodes. Pulse tells the truth." Elon: "Adds complexity. v1 shows issues, period." The product holds the line — fix it or see it. |

---

### 5. Performance Architecture
| | |
|---|---|
| **Proposed by** | Elon |
| **Winner** | **Elon** |
| **Decision** | **Transient caching (1-hour TTL) + manual refresh button + AJAX lazy-load** |
| **Reasoning** | Real-time health checks add 2-3 seconds per dashboard load. Users will uninstall. Cached reads render in ~5ms. AJAX lazy-load means dashboard loads instantly, widget populates async. Target: <200ms widget render. |

---

### 6. Brand Voice
| | |
|---|---|
| **Proposed by** | Steve |
| **Winner** | **Steve** |
| **Decision** | **Direct. Warm. Zero jargon.** Rewrite all status messages. |
| **Reasoning** | WordPress outputs: "Critical security vulnerability detected in outdated plugin dependency." We output: "One plugin needs updating — it has a security hole." Every message speaks like a trusted friend who knows tech but doesn't show off. |

---

### 7. Multisite Behavior
| | |
|---|---|
| **Proposed by** | Elon |
| **Winner** | **Elon (Steve concedes)** |
| **Decision** | Widget checks **current site only** in network context |
| **Reasoning** | Running health checks on 500 sites in a multisite network is a performance bomb. One site, one pulse. Network-wide aggregation is a different product. |

---

## MVP Feature Set (v1 Ships With)

```
1. Dashboard Widget
   - Color-coded health status (green/yellow/red)
   - All issues displayed with severity badges
   - Human-readable status messages (Steve's voice)
   - Action links to fix issues directly

2. Performance
   - Transient caching (1-hour TTL)
   - Manual refresh button (clears cache, re-runs checks)
   - AJAX lazy-load (dashboard loads first, widget populates async)

3. Integration
   - Consumes WP_Site_Health API
   - Links to WordPress docs for "why it matters" (no duplication)
   - Current-site-only in multisite context
```

### What Does NOT Ship in v1
- Settings page
- Dismiss functionality
- Category toggles
- "Last checked" timestamps
- Custom prioritization algorithm
- Network-wide multisite aggregation

---

## File Structure (Build Specification)

```
adminpulse/
├── adminpulse.php              # Main plugin file (~300-400 lines)
│   ├── Plugin header/metadata
│   ├── Dashboard widget registration
│   ├── Health check aggregation (WP_Site_Health wrapper)
│   ├── Transient caching logic
│   ├── AJAX endpoint for refresh
│   └── Human-readable message transforms
│
├── assets/
│   └── js/
│       └── adminpulse.js       # AJAX refresh + lazy-load (~50 lines)
│
└── readme.txt                  # WordPress.org readme
    ├── Clear value prop (SEO: "WordPress dashboard widget," "site health," "security check")
    ├── Screenshots
    └── FAQ
```

**No additional files.** No Composer. No NPM. No external dependencies. Single plugin file + one JS asset.

---

## Open Questions (Require Resolution)

| # | Question | Owner | Impact |
|---|----------|-------|--------|
| 1 | Exact visual treatment (specific colors, iconography, animation on state change) | Design | Medium — affects perceived quality |
| 2 | Specific copy for each health status message | Steve/Copywriting | High — this IS the product voice |
| 3 | Whether "Why it matters" appears in-widget tooltip or only links to WP docs | Design/Dev | Low — either works |
| 4 | Exact severity thresholds (what's red vs. yellow vs. green?) | Dev | Medium — needs mapping to WP_Site_Health output |
| 5 | Support strategy for 100K+ installs | Business | High — "One person cannot handle support for 100K active installs. Plan for this or the plugin dies from 1-star reviews." |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Trademark conflict on "Pulse" rebrand** | High | Medium | Ship as "AdminPulse." Only rebrand after legal clearance + traction. |
| **Plugin abandonment post-launch** | High | Critical | "WordPress plugins die from neglect, not bad code." Commit to 6-month support runway before shipping. |
| **Support burden at scale** | Medium | High | First 50 reviews: personally respond to every support ticket. Build FAQ from common issues. Plan for help before 10K installs. |
| **WP_Site_Health API changes** | Low | Medium | Pin to documented public methods. Monitor WordPress core releases. |
| **Users expect real-time monitoring** | Medium | Medium | Clear readme copy: "Checks refresh hourly or on-demand." Set expectations. |
| **Performance regression from slow health tests** | Medium | High | Caching + AJAX lazy-load are non-negotiable. Never block dashboard render. |
| **Multisite edge cases** | Low | Low | Explicitly scope to current-site-only. Document limitation. |

---

## The Essence (Unchanged)

> **What is this product REALLY about?**
> Replacing the low-grade anxiety of site ownership with a single glance of knowing.
>
> **What's the feeling it should evoke?**
> Relief.
>
> **What's the one thing that must be perfect?**
> The moment of comprehension — instant, not interpreted.
>
> **Creative direction:**
> Silence until it matters.

---

## Build Authorization

**This document is the blueprint.**

Steve brought the soul: peace of mind in a glance, human voice, emotional clarity.
Elon brought the spine: defensible naming, honest architecture, ship-first discipline.

The triangle is complete. The ball moves.

*— Phil Jackson, The Zen Master*
