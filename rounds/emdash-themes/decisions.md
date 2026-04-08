# Palette: Consolidated Decisions

> Blueprint for Build Phase | Zen Master's Final Synthesis

---

## Locked Decisions

### 1. Product Name: **Palette**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve Jobs |
| **Why** | "What do artists use? A palette. What holds the colors that define your brand? A palette." Steve rejected "Ember, Drift, Forge" as "thesaurus noise—placeholder words someone grabbed from a thesaurus." Elon countered that users search "restaurant website template," not "Palette Three"—SEO requires descriptive naming. **Resolution:** Palette wins as brand; SEO-friendly slugs (`palette-restaurant`, `palette-developer`) may be used for discoverability in marketing. Internal codenames (Ember, Forge) persist in development only. |

### 2. Theme Naming: **Palette One through Five**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (Round 1, Round 2) |
| **Winner** | Steve Jobs |
| **Why** | "Let the design speak, not clever words. Numbers imply hierarchy without hierarchy. They're confident. Apple didn't name the iPhone colors 'Moonrise,' 'Eclipse,' and 'Twilight.' They named them 1, 2, 3." Elon's SEO objection noted but overruled—marketing can use descriptive slugs without polluting the brand. |

### 3. Theme Count for v1: **2 Themes**

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | "Five mediocre themes help no one. Two extraordinary ones change everything." |
| **Elon's Position** | "Ship Ember + Forge. Prove traction. Then build the rest." |
| **Winner** | Unanimous |
| **Why** | Both agreed on constraint over breadth. **Palette One** (warm/restaurant/hospitality) and **Palette Two** (dark/developer/terminal) ship in v1. Palette Three/Four/Five deferred to v2. |

### 4. Pages Per Theme: **ONE Page**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (Round 2) |
| **Winner** | Steve Jobs |
| **Elon's Position** | Initially proposed 4 pages per theme. |
| **Why** | "Not 4-5 pages. Not blog templates. ONE page that makes you gasp. When that page is undeniable, we've earned the right to build more. Until then, we're decorating." Elon's concern about shipping speed is addressed by the reduced scope—one perfect page ships faster than four adequate ones. |

### 5. Architecture: **Independent Codebases Per Theme**

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | "A magazine layout doesn't use the same hero structure as a dashboard. Forcing them into shared semantics produces themes that feel *generated*, not *designed*." |
| **Elon's Position** | "One semantic HTML base + CSS skins = 1,500 lines vs 10,000 lines. In 18 months, we'll be maintaining five products that hate each other." |
| **Winner** | Steve Jobs |
| **Why** | "Design drives architecture, not the other way around. If Forge needs a different HTML structure than Ember to feel right, it gets a different HTML structure." Elon's maintenance concern is valid but accepted as tradeoff. Steve: "This is more expensive. That's why competitors won't do it." |

### 6. Font Strategy: **Self-Hosted, Subsetted**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Steve's Concession** | "He's right about fonts. Self-hosted, subsetted, under 100KB. Non-negotiable. I should have caught this." |
| **Why** | Google Fonts = 400-800KB blocking requests. Violates Steve's "first 3 seconds" mandate. Self-host with Latin subset, `font-display: swap`. **Budget: <100KB per theme.** Steve: "Performance IS design." |

### 7. Motion/Animation: **CSS-Only Effects**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Unanimous |
| **Why** | Steve (Round 1): "NO to horizontal scroll sections. Clever gimmicks that frustrate users." Elon: "JS scroll listeners = perf disaster. CSS-only effects. `scroll-snap` for horizontal. No parallax on mobile." Both arrived at same conclusion from different angles—Steve from UX, Elon from performance. No JS for visual effects. |

### 8. Dark Mode: **Commit, Don't Toggle**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (Round 1, Round 2) |
| **Winner** | Unanimous |
| **Steve's Rationale** | "Toggling between modes means you haven't committed to either. A theme should have ONE lighting philosophy, executed completely. Forge is dark because Forge *is* dark." |
| **Elon's Rationale** | "Adds JS, localStorage, FOUC bugs." |
| **Why** | Same conclusion, different reasons. **Palette One ships light-only. Palette Two ships dark-only.** No toggles. |

### 9. Customization: **Documented CSS Custom Properties**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon Musk |
| **Steve's Concession** | "He's right about customization. CSS custom properties are smart. Users shouldn't fork to change a color. Document the variables. Make customization trivial." |
| **Steve's Condition** | "Defaults must be perfect. Variables are for power users, not escape hatches." |
| **Variables** | `--primary`, `--accent`, `--font-heading`, `--radius`, etc. |

### 10. Demo Experience: **Sacred First 3 Seconds**

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Unanimous |
| **Why** | From essence.md: "What must be perfect? The first three seconds." Steve: "The experience should be: click, gasp, I know exactly what this is." Elon acknowledged: "Every 100ms of load time costs 7% conversion." No loading spinners, no cookie banners, no newsletter popups. Click, gasp, recognition. |

---

## MVP Feature Set (What Ships in v1)

### Themes

| Theme | Identity | Mode | Internal Codename |
|-------|----------|------|-------------------|
| **Palette One** | Warm, restaurant, hospitality | Light | Ember |
| **Palette Two** | Dark, terminal, developer tools | Dark | Forge |

### Scope Per Theme

- **ONE page** (`index.html`) that nails the emotional hook
- Independent HTML/CSS (no shared templates)
- Self-hosted, subsetted fonts (<100KB total)
- CSS-only animations (no JS for visual effects)
- CSS custom properties documented for customization
- Mobile-responsive
- Basic accessibility (contrast ratios, focus states, alt text)

### Demo Requirements

- Clean entry (zero popups, zero banners, zero loading spinners)
- Theme-specific imagery (real photography, not generic stock)
- Personality hits in 3 seconds
- Emotional hook: "Your website finally feels like you"

### What Does NOT Ship in v1

| Cut Item | Reason | Who Cut It |
|----------|--------|------------|
| Palette Three/Four/Five | Focus over breadth | Both |
| Multi-page templates | ONE perfect page first | Steve |
| Blog templates | Content, not theme | Elon |
| Dark mode toggles | Indecision masquerading as flexibility | Both |
| Parallax effects | JS complexity, mobile perf | Both |
| Horizontal scroll sections | Clever gimmicks that frustrate | Steve |
| JS-driven animations | Performance disaster | Elon |
| Charts/complex components | Massive scope addition | Elon |
| Full WCAG 2.1 AA audit | Scope creep; basics first | Both |
| Theme comparison/switcher UI | Unresolved | - |
| Existing site redesigns | Separate PRD | Both |

---

## File Structure (What Gets Built)

```
palette/
├── README.md                    # Install, customize, deploy
├── docs/
│   └── customization.md         # CSS variable reference
│
├── palette-one/
│   ├── index.html               # THE page (restaurant/warm)
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   └── variables.css        # --primary, --accent, etc.
│   ├── fonts/                   # Self-hosted, Latin subset
│   └── images/                  # Real food photography
│
└── palette-two/
    ├── index.html               # THE page (developer/dark)
    ├── css/
    │   ├── style.css
    │   └── variables.css
    ├── fonts/
    └── images/                  # Real code screenshots
```

**Total Deliverables:**
- 2 HTML files
- 4 CSS files
- 2 font directories (subsetted, <100KB each)
- 2 image directories
- 2 documentation files

---

## Open Questions (Require Resolution Before Build)

| # | Question | Steve's View | Elon's View | Impact |
|---|----------|--------------|-------------|--------|
| 1 | **Distribution strategy for v1?** | "Quality creates evangelists. Design creates word-of-mouth." | "No distribution plan = portfolio-ware. Get into Emdash docs, SEO landing pages, deploy buttons." | **Critical** — affects launch viability |
| 2 | **Theme comparison UI?** | "Analysis paralysis. Let people experience, not compare." | "ThemeForest data: 23% conversion lift with comparison view." | Medium — UX decision, deferred |
| 3 | **Specific fonts per theme?** | Typography must match identity (serif warmth vs mono precision) | Must be open-source with self-hosting license | **Medium** — must resolve before build |
| 4 | **Image sourcing?** | "Real photography required—not generic stock" | Unsplash/Pexels with attribution, or commission original | **Medium** — legal + authenticity |
| 5 | **Accessibility baseline?** | "Basics" agreed | "Basics" agreed | Medium — need to define which WCAG criteria constitute "basics" |
| 6 | **Deploy mechanism in v1?** | Not addressed | One-click buttons (Vercel/Netlify/Cloudflare) | Low-Medium — tied to distribution |

---

## Risk Register

| Risk | Likelihood | Impact | Owner | Mitigation |
|------|------------|--------|-------|------------|
| **Scope creep from "one perfect page"** | High | High | Steve | Hard deadline required. "Perfect is shipped, not tweaked." Timeboxed iterations. |
| **Independent codebases = maintenance burden** | High | Medium | Elon | Accepted tradeoff. Document shared patterns. Worth it for emotional differentiation. |
| **No distribution = no users** | High | Critical | Elon | Minimum v1: deploy buttons + clear README install path. Distribution hooks required. |
| **Font licensing surprises** | Medium | Medium | Build team | Verify licenses before build. Self-hosting requires explicit license terms. |
| **Demo imagery legal issues** | Low | High | Build team | Source from Unsplash/Pexels with attribution, or commission original. Zero unlicensed images. |
| **EmDash version incompatibility** | Medium | Medium | Elon | Version-lock compatibility. Document which EmDash version themes target. |
| **"Customization hell" support load** | Medium | Medium | Elon | CSS variables + comprehensive docs mitigate. First 100 requests reveal gaps. |
| **2 themes feels incomplete to users** | Low | Medium | Steve | Accepted by both. Launch messaging: "Two themes, done right." Quality over quantity narrative. |
| **Steve's perfectionism delays shipping** | Medium | High | Phil | Timeboxed build phases. "When that page is undeniable, we've earned the right to build more." |

---

## Decision Summary Matrix

| # | Decision | Proposed By | Won By | Method |
|---|----------|-------------|--------|--------|
| 1 | Name: Palette | Steve | Steve | Elon conceded (SEO slugs as compromise) |
| 2 | Numbered themes (One, Two, etc.) | Steve | Steve | Elon conceded |
| 3 | 2 themes in v1 | Both | Both | Unanimous |
| 4 | 1 page per theme | Steve | Steve | Constraint over breadth |
| 5 | Independent codebases | Steve | Steve | Emotional differentiation over efficiency |
| 6 | Self-hosted fonts (<100KB) | Elon | Elon | Steve conceded ("I should have caught this") |
| 7 | CSS-only motion | Both | Both | Unanimous (different reasons, same conclusion) |
| 8 | No dark mode toggle | Both | Both | Unanimous (different reasons, same conclusion) |
| 9 | CSS custom properties | Elon | Elon | Steve conceded with "perfect defaults" condition |
| 10 | Sacred first 3 seconds | Steve | Both | Unanimous |

**Score:** Steve: 5 wins | Elon: 4 wins | Unanimous: 4 decisions

---

## The Essence

From `essence.md`:

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

## Philosophical Synthesis

**Steve optimizes for:** Emotional resonance, craft, brand, identity, the gasp moment.

**Elon optimizes for:** Distribution, simplicity, velocity, measurable outcomes.

**The synthesis:** Ship 2 independent, beautiful themes with technical pragmatism.

| Philosophy | Wins |
|------------|------|
| Design drives architecture | Steve |
| Performance is non-negotiable | Elon |
| Focus beats breadth | Both |
| Ship to learn | Both |

---

## Final Directives for Build Phase

1. **Build Palette One and Palette Two as independent codebases.** Do not share HTML structure.

2. **Each theme is ONE page.** `index.html` — the page that makes you gasp.

3. **Self-host fonts.** Latin subset. <100KB per theme. `font-display: swap`.

4. **CSS-only animations.** No JavaScript for visual effects. No parallax. No horizontal scroll.

5. **Document CSS custom properties.** `--primary`, `--accent`, `--font-heading`, `--radius`. Defaults must be perfect.

6. **No dark mode toggles.** Palette One is light. Palette Two is dark. Commit.

7. **First 3 seconds are sacred.** No loading spinners. No popups. No banners. Click, gasp, recognition.

8. **Real imagery.** Theme-specific photography. No generic stock.

9. **Basic accessibility.** Contrast ratios, focus states, alt text. Full WCAG audit is v2.

10. **Resolve open questions before building.** Fonts, imagery, accessibility baseline must be locked.

---

## Sign-Off

This document represents the locked decisions from Round 1 and Round 2 debates between Steve Jobs (Chief Creative Officer) and Elon Musk (Chief Product & Growth Officer).

Where they agreed: unanimous decisions stand.
Where they disagreed: the winner's position is locked.
Where resolution is pending: open questions must be resolved before build.

**The foundation:** Two themes that make people recognize themselves.

**The constraint:** One perfect page per theme.

**The standard:** The first three seconds.

Build accordingly.

---

*Compiled by Phil Jackson, Zen Master*
*Great Minds Agency*
