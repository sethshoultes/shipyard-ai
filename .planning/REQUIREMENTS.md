# Palette v1 Requirements Specification

> Extracted from decisions.md and emdash-themes.md
> Generated: 2025
> Project Slug: emdash-themes
> Product Name: Palette (2 HTML/CSS themes for v1)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Requirements | 41 |
| Must-Have (Critical/High) | 37 |
| Should-Have (Medium) | 4 |
| Nice-to-Have | 0 |
| Deferred to v2 | 10+ features |

---

## The Essence (from decisions.md)

> **What is this product really about?**
> Helping people stop being embarrassed by their website.
>
> **What feeling should it evoke?**
> Recognition. "This is me."
>
> **What must be perfect?**
> The first three seconds.
>
> **Creative direction:**
> Identity, not decoration.

---

## Requirements by Category

### STRUCTURE (File/Folder Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-001 | Create independent codebase for Palette One with separate HTML/CSS files | "Each theme gets its own structural decisions" | One | Must |
| REQ-002 | Create independent codebase for Palette Two with separate HTML/CSS files | "Each theme gets its own structural decisions" | Two | Must |
| REQ-003 | Deliver single index.html file per theme (no multi-page templates) | "ONE page per theme... One index.html per theme that nails the first 3 seconds" | Both | Must |
| REQ-004 | Organize CSS files into style.css and variables.css per theme | File structure: "css/style.css" and "css/variables.css" | Both | Must |
| REQ-005 | Create fonts/ directory with self-hosted, subsetted font files per theme | "Self-Hosted, Subsetted" + "fonts/" folder structure | Both | Must |
| REQ-006 | Create images/ directory containing theme-specific imagery per theme | "Theme-specific imagery (no generic stock)" | Both | Must |
| REQ-007 | Create root-level docs/ folder with customization.md documentation | "docs/customization.md" + "CSS variable reference" | Both | Must |
| REQ-008 | Create root-level README.md with install, customization, and deploy instructions | "README.md - Install, customize, deploy" | Both | Must |

### DESIGN (Visual/UI Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-009 | Design Palette One with warm color palette suitable for restaurant/hospitality | "Palette One - Warm, restaurant, hospitality - Light" | One | Must |
| REQ-010 | Design Palette Two with dark color palette suitable for developer tools | "Palette Two - Dark, terminal, developer tools - Dark" | Two | Must |
| REQ-011 | Implement Palette One in light mode only (no dark mode variant) | "Palette One ships light-only. No toggles." | One | Must |
| REQ-012 | Implement Palette Two in dark mode only (no light mode variant) | "Palette Two ships dark-only. No toggles." | Two | Must |
| REQ-013 | Design homepage to evoke recognition and emotional resonance within 3 seconds | "Personality hits in 3 seconds" + "Your website finally feels like you" | Both | Must |
| REQ-014 | Implement CSS-only animations and motion effects (no JavaScript-driven animations) | "CSS-Only Effects" + "No JS for visual effects" | Both | Must |
| REQ-015 | Use GPU-composited CSS transforms (no parallax effects on any device) | "GPU-composited transforms, no parallax on mobile" | Both | Must |
| REQ-016 | Prohibit horizontal scroll sections in design | "NO to horizontal scroll sections. Clever gimmicks that frustrate users." | Both | Must |
| REQ-017 | Use scroll-snap CSS for smooth scrolling behavior where applicable | "CSS scroll-snap, GPU-composited transforms" | Both | Should |
| REQ-018 | Ensure mobile-responsive design across all viewport sizes | "Mobile-responsive" in MVP Feature Set | Both | Must |
| REQ-019 | Use real food photography for Palette One (no generic stock images) | "Theme-specific imagery (no generic stock)" | One | Must |
| REQ-020 | Use real code screenshots/developer-appropriate imagery for Palette Two | "Theme-specific imagery (no generic stock)" | Two | Must |

### PERFORMANCE (Speed/Size Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-021 | Keep self-hosted fonts under 100KB total per theme | "Self-hosted, subsetted" + "Budget: <100KB per theme" | Both | Must |
| REQ-022 | Use Latin character subset for self-hosted fonts | "Self-host with Latin subset" | Both | Must |
| REQ-023 | Implement font-display: swap for self-hosted fonts | "font-display: swap" | Both | Must |
| REQ-024 | Eliminate JavaScript-based visual effects to maintain performance | "No JS for visual effects" + "JS scroll listeners = perf disaster" | Both | Must |
| REQ-025 | Deliver zero loading spinners or blocking content on initial load | "No loading spinners, no cookie banners, no newsletter pop-ups" | Both | Must |
| REQ-026 | Avoid Google Fonts integration (blocks performance with 400-800KB requests) | "Google Fonts = 400-800KB blocking requests" | Both | Must |

### ACCESSIBILITY (A11y Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-027 | Implement sufficient color contrast throughout the design | "Basic accessibility (contrast, focus states, alt text)" | Both | Must |
| REQ-028 | Provide visible and keyboard-accessible focus states for all interactive elements | "Basic accessibility (contrast, focus states, alt text)" | Both | Must |
| REQ-029 | Include descriptive alt text for all images | "Basic accessibility (contrast, focus states, alt text)" | Both | Must |
| REQ-030 | Use semantic HTML5 structure (header, nav, main, section, footer) | Implied by accessibility requirements | Both | Must |

### CONTENT (Copy/Imagery Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-031 | Source imagery from Unsplash/Pexels with proper attribution or commission original | "Source from Unsplash/Pexels with attribution, or commission original" | Both | Must |
| REQ-032 | Verify font licensing compliance before implementation | "Verify licenses before build. Self-hosting requires proper license terms." | Both | Must |
| REQ-033 | Source authentic, theme-specific imagery (not generic stock photos) | "Theme-specific imagery (no generic stock)" | Both | Must |

### DOCUMENTATION (Docs Requirements)

| REQ-ID | Requirement | Source Quote | Applies To | Priority |
|--------|-------------|--------------|------------|----------|
| REQ-034 | Document all CSS custom properties with clear naming conventions | "Documented CSS Custom Properties" | Both | Must |
| REQ-035 | Provide CSS variable reference for --primary, --accent, --font-heading, --radius | "Variables (--primary, --accent, --font-heading, --radius)" | Both | Must |
| REQ-036 | Document installation instructions in README.md | "README.md - Install, customize, deploy" | Both | Must |
| REQ-037 | Document customization guide in README.md | "README.md - Install, customize, deploy" | Both | Must |
| REQ-038 | Document deployment options in README.md | "README.md - Install, customize, deploy" | Both | Must |
| REQ-039 | Include deploy buttons (Vercel/Netlify/Cloudflare) in documentation or README | "Minimum: deploy buttons + clear README install path in v1" | Both | Should |
| REQ-040 | Document target EmDash version compatibility | "Document which EmDash version themes target" | Both | Should |
| REQ-041 | Share and document design patterns across independent codebases | "Document shared patterns" | Both | Should |

---

## Explicitly Excluded from v1

Per decisions.md "What Does NOT Ship in v1":

| Item | Reason | Who Cut It |
|------|--------|------------|
| Palette Three/Four/Five | Focus over breadth | Both |
| Multi-page templates (About, Services, Contact) | ONE page per theme mandate | Steve |
| Blog templates | Content, not theme | Elon |
| Dark mode toggles | "Commit, don't toggle" decision | Both |
| Parallax effects | JS complexity, mobile perf | Both |
| Horizontal scroll sections | Clever gimmicks that frustrate | Steve |
| JS-driven animations | Performance disaster | Elon |
| Charts or complex components | Massive scope addition | Elon |
| Full WCAG 2.1 AA audit | Scope creep; basics first | Both |
| Theme comparison/switcher UI | Unresolved | - |
| Existing site redesigns | Separate PRD | Both |

---

## Open Questions Requiring Resolution

| # | Question | Impact | Blocking? | Recommendation |
|---|----------|--------|-----------|----------------|
| 1 | Specific fonts per theme? | **BLOCKING** - cannot design without typefaces | **YES** | Lock before build: Palette One (serif display + clean sans), Palette Two (monospace) |
| 2 | Image sourcing strategy? | Medium - affects asset gathering | No | Use Unsplash/Pexels with attribution for v1 |
| 3 | WCAG accessibility baseline? | **BLOCKING** - defines QA scope | **YES** | Lock to WCAG 2.1 Level A minimum |
| 4 | Distribution strategy? | Critical - affects launch plan | No | Include README + deploy buttons in v1, defer SEO pages |
| 5 | Deploy mechanism timing? | Low-Medium | No | Deploy button code in README for v1 |
| 6 | Theme comparison UI? | Medium | No | Defer to v2 |

---

## Design Constraints (Locked)

| ID | Constraint | Source |
|----|------------|--------|
| DC-001 | Product named "Palette" (not "EmDash Themes") | Steve Jobs won - Round 1 |
| DC-002 | Theme names: Palette One, Palette Two (numbered, not named) | Steve Jobs won - design speaks |
| DC-003 | ONE page per theme (not multi-page) | Steve Jobs won - Round 2 |
| DC-004 | Independent codebases per theme (not shared templates) | Steve Jobs won - emotional differentiation |
| DC-005 | Self-hosted fonts <100KB per theme | Elon Musk won - performance IS design |
| DC-006 | CSS-only animations (no JS motion) | Both agreed |
| DC-007 | No dark mode toggle (commit to light or dark) | Both agreed |
| DC-008 | CSS custom properties documented | Elon Musk won - customization requirement |
| DC-009 | Sacred first 3 seconds (no popups, no banners) | Both agreed |

---

## Target File Structure

```
palette/
├── README.md                           # Install, customize, deploy
├── docs/
│   └── customization.md               # CSS variable reference
│
├── palette-one/                       # Warm, restaurant, light theme
│   ├── index.html                     # THE page (single, perfect)
│   ├── css/
│   │   ├── style.css                 # Main stylesheet
│   │   └── variables.css             # CSS custom properties
│   ├── fonts/
│   │   └── [font-files].woff2        # Self-hosted, subsetted (<100KB)
│   └── images/
│       └── [food-photography]        # Real food imagery
│
└── palette-two/                       # Dark, developer, terminal theme
    ├── index.html                     # THE page (single, perfect)
    ├── css/
    │   ├── style.css
    │   └── variables.css
    ├── fonts/
    │   └── [monospace-font].woff2
    └── images/
        └── [code-screenshots]        # Real developer imagery
```

**Total Deliverables:** 2 HTML files, 4 CSS files, fonts, images, documentation.

---

## Requirements Traceability Matrix

| Category | Requirements | Must | Should | Total |
|----------|-------------|------|--------|-------|
| Structure | REQ-001 to REQ-008 | 8 | 0 | 8 |
| Design | REQ-009 to REQ-020 | 11 | 1 | 12 |
| Performance | REQ-021 to REQ-026 | 6 | 0 | 6 |
| Accessibility | REQ-027 to REQ-030 | 4 | 0 | 4 |
| Content | REQ-031 to REQ-033 | 3 | 0 | 3 |
| Documentation | REQ-034 to REQ-041 | 5 | 3 | 8 |
| **TOTAL** | **41** | **37** | **4** | **41** |

---

## Risk Register (from decisions.md)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep from "one perfect page" | High | High | Hard deadline required. "Perfect is shipped, not tweaked." |
| Independent codebases = maintenance burden | High | Medium | Accepted tradeoff. Document shared patterns. |
| No distribution = no users | High | Critical | Minimum: deploy buttons + clear README install path in v1. |
| Font licensing surprises | Medium | Medium | Verify licenses before build. |
| Demo imagery legal issues | Low | High | Source from Unsplash/Pexels with attribution. Zero unlicensed images. |
| EmDash version incompatibility | Medium | Medium | Version-lock compatibility. Document which EmDash version themes target. |
| "Customization hell" support | Medium | Medium | CSS variables + docs mitigate. |
| 2 themes feels incomplete | Low | Medium | Launch messaging: "Two themes, done right." |
| Steve's perfectionism delays shipping | Medium | High | Timeboxed build phases. Hard ship date. |

---

## Success Criteria for v1

- [ ] Both themes ship (Palette One + Palette Two)
- [ ] Each theme is ONE perfect page (index.html)
- [ ] Mobile-responsive (375px and 1440px)
- [ ] <100KB fonts per theme (self-hosted)
- [ ] CSS-only animations (no JavaScript for visual effects)
- [ ] Basic accessibility (contrast, focus states, alt text)
- [ ] CSS custom properties documented
- [ ] README with install/customize/deploy instructions
- [ ] Deploy buttons for Vercel/Netlify
- [ ] "First 3 seconds" test passes (instant recognition, no blocking content)

---

*Generated by Great Minds Agency - Requirements Analyst*
*Source: rounds/emdash-themes/decisions.md, prds/emdash-themes.md*
