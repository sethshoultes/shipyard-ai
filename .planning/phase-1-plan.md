# Phase 1 Plan — Palette Themes

**Generated**: 2025
**Project Slug**: emdash-themes
**Product Name**: Palette
**Requirements**: .planning/REQUIREMENTS.md
**Total Tasks**: 16
**Waves**: 3

---

## The Essence

> **What is this product really about?**
> Helping people stop being embarrassed by their website.
>
> **What feeling should it evoke?**
> Recognition. "This is me."
>
> **What must be perfect?**
> The first three seconds.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Palette One independent codebase | phase-1-task-1 | 1 |
| REQ-002: Palette Two independent codebase | phase-1-task-2 | 1 |
| REQ-003: Single index.html per theme | phase-1-task-5, phase-1-task-9 | 2 |
| REQ-004: CSS files (style.css, variables.css) | phase-1-task-3, phase-1-task-4, phase-1-task-7, phase-1-task-8 | 1-2 |
| REQ-005-006: Fonts and images directories | phase-1-task-1, phase-1-task-2 | 1 |
| REQ-007: docs/customization.md | phase-1-task-14 | 3 |
| REQ-008: README.md | phase-1-task-15 | 3 |
| REQ-009: Palette One warm color palette | phase-1-task-3, phase-1-task-5 | 1-2 |
| REQ-010: Palette Two dark color palette | phase-1-task-7, phase-1-task-9 | 1-2 |
| REQ-011-012: Light/dark mode commitment | phase-1-task-3, phase-1-task-7 | 1 |
| REQ-013: Emotional resonance in 3 seconds | phase-1-task-5, phase-1-task-9 | 2 |
| REQ-014-016: CSS-only animations, no parallax | phase-1-task-6, phase-1-task-10 | 2 |
| REQ-017: Scroll-snap CSS | phase-1-task-6, phase-1-task-10 | 2 |
| REQ-018: Mobile-responsive design | phase-1-task-6, phase-1-task-10 | 2 |
| REQ-019-020: Theme-specific imagery | phase-1-task-11, phase-1-task-12 | 2 |
| REQ-021-026: Font performance requirements | phase-1-task-4, phase-1-task-8 | 1 |
| REQ-027-030: Accessibility basics | phase-1-task-5, phase-1-task-9 | 2 |
| REQ-031-033: Image sourcing | phase-1-task-11, phase-1-task-12 | 2 |
| REQ-034-041: Documentation | phase-1-task-14, phase-1-task-15 | 3 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Foundation & CSS Variables

Eight independent tasks creating project structure and CSS foundations.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create Palette One project structure</title>
  <requirement>REQ-001: Create independent codebase for Palette One; REQ-005-006: Create fonts/ and images/ directories</requirement>
  <description>
    Create the complete folder structure for Palette One theme.
    This establishes the independent codebase per Steve Jobs' decision
    that "each theme gets its own structural decisions."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="File structure specification in §File Structure" />
  </context>

  <steps>
    <step order="1">Create palette/ root directory in /home/agent/shipyard-ai/</step>
    <step order="2">Create palette/palette-one/ directory</step>
    <step order="3">Create palette/palette-one/css/ directory</step>
    <step order="4">Create palette/palette-one/fonts/ directory</step>
    <step order="5">Create palette/palette-one/images/ directory</step>
    <step order="6">Create empty placeholder files: index.html, css/style.css, css/variables.css</step>
    <step order="7">Add .gitkeep to fonts/ and images/ directories</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-one/</check>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-one/css/</check>
    <check type="manual">Directory structure matches decisions.md specification</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>feat(palette): create Palette One project structure

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create Palette Two project structure</title>
  <requirement>REQ-002: Create independent codebase for Palette Two; REQ-005-006: Create fonts/ and images/ directories</requirement>
  <description>
    Create the complete folder structure for Palette Two theme.
    This establishes the independent codebase per Steve Jobs' decision
    that "each theme gets its own structural decisions."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="File structure specification in §File Structure" />
  </context>

  <steps>
    <step order="1">Create palette/palette-two/ directory</step>
    <step order="2">Create palette/palette-two/css/ directory</step>
    <step order="3">Create palette/palette-two/fonts/ directory</step>
    <step order="4">Create palette/palette-two/images/ directory</step>
    <step order="5">Create empty placeholder files: index.html, css/style.css, css/variables.css</step>
    <step order="6">Add .gitkeep to fonts/ and images/ directories</step>
    <step order="7">Create palette/docs/ directory for shared documentation</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-two/</check>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-two/css/</check>
    <check type="manual">Directory structure matches decisions.md specification</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 task -->
  </dependencies>

  <commit-message>feat(palette): create Palette Two project structure

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Create Palette One CSS variables (warm/light)</title>
  <requirement>REQ-009: Warm color palette for restaurant; REQ-011: Light mode only; REQ-034-035: Documented CSS custom properties</requirement>
  <description>
    Create the CSS custom properties for Palette One with warm, restaurant-appropriate
    colors. Light mode only per "commit, don't toggle" decision. Variables must be
    documented for customization per Elon's requirement.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Palette One identity: warm, restaurant, light" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/blog/src/styles/theme.css" reason="CSS variable naming patterns reference" />
  </context>

  <steps>
    <step order="1">Create palette/palette-one/css/variables.css</step>
    <step order="2">Define :root selector with all CSS custom properties</step>
    <step order="3">Add color variables: --color-bg (#fdfaf6 warm white), --color-text (#2d2a26 warm black), --color-primary (#c45c26 terracotta), --color-accent (#8b6914 gold), --color-surface (#f5efe6 cream)</step>
    <step order="4">Add typography variables: --font-heading (serif), --font-body (clean sans-serif), --font-size-base (1rem)</step>
    <step order="5">Add type scale: --font-size-xs through --font-size-5xl (9 sizes)</step>
    <step order="6">Add spacing variables: --spacing-1 through --spacing-24</step>
    <step order="7">Add layout variables: --content-width (680px), --wide-width (1200px), --radius (4px), --radius-lg (8px)</step>
    <step order="8">Add transition variables: --transition-fast (120ms), --transition-base (180ms)</step>
    <step order="9">Add CSS comments documenting each variable group</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-one/css/variables.css</check>
    <check type="manual">Variables use warm color palette (terracotta, cream, gold)</check>
    <check type="manual">No dark mode media queries or .dark class (light-only)</check>
    <check type="manual">All variables have descriptive comments</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Directory structure must exist" />
  </dependencies>

  <commit-message>feat(palette-one): add CSS variables with warm color palette

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Add self-hosted fonts for Palette One</title>
  <requirement>REQ-021: Fonts under 100KB; REQ-022: Latin subset; REQ-023: font-display: swap; REQ-026: No Google Fonts; REQ-032: License compliance</requirement>
  <description>
    Add self-hosted, subsetted fonts for Palette One. Must be under 100KB total.
    Use serif for headings (editorial feel) and clean sans for body.
    Google Fonts CDN blocked per performance decision.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Font strategy: self-hosted, subsetted, &lt;100KB" />
    <file path="/home/agent/shipyard-ai/palette/palette-one/css/variables.css" reason="Font family variables to update" />
  </context>

  <steps>
    <step order="1">Download Libre Baskerville (serif, OFL license) Regular and Bold weights</step>
    <step order="2">Download Inter (sans-serif, OFL license) Regular, Medium, SemiBold weights</step>
    <step order="3">Subset fonts to Latin characters only using pyftsubset or fontsource</step>
    <step order="4">Convert to WOFF2 format for optimal compression</step>
    <step order="5">Save to palette/palette-one/fonts/ directory</step>
    <step order="6">Verify total font size is under 100KB</step>
    <step order="7">Create @font-face declarations in style.css with font-display: swap</step>
    <step order="8">Update variables.css with actual font family names</step>
    <step order="9">Add LICENSE.txt documenting font licenses (OFL for both)</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-one/fonts/</check>
    <check type="bash">du -sh /home/agent/shipyard-ai/palette/palette-one/fonts/</check>
    <check type="manual">Total font size is under 100KB</check>
    <check type="bash">grep "font-display: swap" /home/agent/shipyard-ai/palette/palette-one/css/style.css</check>
    <check type="manual">@font-face declarations exist for all weights</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="fonts/ directory must exist" />
    <depends-on task-id="phase-1-task-3" reason="variables.css must exist for font family updates" />
  </dependencies>

  <commit-message>feat(palette-one): add self-hosted fonts (Libre Baskerville + Inter, &lt;100KB)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="1">
  <title>Create Palette Two CSS variables (dark/terminal)</title>
  <requirement>REQ-010: Dark color palette for developer tools; REQ-012: Dark mode only; REQ-034-035: Documented CSS custom properties</requirement>
  <description>
    Create the CSS custom properties for Palette Two with dark, terminal-inspired
    colors. Dark mode only per "commit, don't toggle" decision. Neon accents
    on near-black background for developer aesthetic.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Palette Two identity: dark, terminal, developer" />
    <file path="/home/agent/shipyard-ai/prds/emdash-themes.md" reason="Forge theme spec: neon green on #0a0a0a" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/blog/src/styles/theme.css" reason="CSS variable naming patterns" />
  </context>

  <steps>
    <step order="1">Create palette/palette-two/css/variables.css</step>
    <step order="2">Define :root selector with dark-mode CSS custom properties</step>
    <step order="3">Add color variables: --color-bg (#0d0d0d near-black), --color-text (#ededed light gray), --color-primary (#00ff88 neon green), --color-accent (#00d4ff cyan), --color-surface (#1a1a1a dark gray)</step>
    <step order="4">Add terminal accent colors: --color-warning (#ffcc00 yellow), --color-error (#ff5555 red), --color-comment (#6b7280 muted)</step>
    <step order="5">Add typography variables: --font-heading (monospace), --font-body (monospace), --font-size-base (1rem)</step>
    <step order="6">Add type scale: --font-size-xs through --font-size-5xl (9 sizes)</step>
    <step order="7">Add spacing variables: --spacing-1 through --spacing-24</step>
    <step order="8">Add layout variables: --content-width (800px), --wide-width (1280px), --radius (2px), --radius-lg (4px)</step>
    <step order="9">Add transition variables and CSS comments documenting each variable group</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-two/css/variables.css</check>
    <check type="manual">Variables use dark background (#0d0d0d) with neon accents</check>
    <check type="manual">No light mode media queries or .light class (dark-only)</check>
    <check type="manual">All variables have descriptive comments</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Directory structure must exist" />
  </dependencies>

  <commit-message>feat(palette-two): add CSS variables with dark terminal palette

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="1">
  <title>Add self-hosted fonts for Palette Two</title>
  <requirement>REQ-021: Fonts under 100KB; REQ-022: Latin subset; REQ-023: font-display: swap; REQ-026: No Google Fonts; REQ-032: License compliance</requirement>
  <description>
    Add self-hosted, subsetted monospace fonts for Palette Two. Must be under 100KB total.
    Use monospace typography throughout for terminal/developer aesthetic.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Font strategy: self-hosted, subsetted, &lt;100KB" />
    <file path="/home/agent/shipyard-ai/prds/emdash-themes.md" reason="Forge theme: JetBrains Mono" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/css/variables.css" reason="Font family variables to update" />
  </context>

  <steps>
    <step order="1">Download JetBrains Mono (monospace, OFL license) Regular, Medium, Bold weights</step>
    <step order="2">Subset fonts to Latin characters only using pyftsubset or fontsource</step>
    <step order="3">Convert to WOFF2 format for optimal compression</step>
    <step order="4">Save to palette/palette-two/fonts/ directory</step>
    <step order="5">Verify total font size is under 100KB</step>
    <step order="6">Create @font-face declarations in style.css with font-display: swap</step>
    <step order="7">Update variables.css with actual font family name (JetBrains Mono)</step>
    <step order="8">Add LICENSE.txt documenting font license (OFL)</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-two/fonts/</check>
    <check type="bash">du -sh /home/agent/shipyard-ai/palette/palette-two/fonts/</check>
    <check type="manual">Total font size is under 100KB</check>
    <check type="bash">grep "font-display: swap" /home/agent/shipyard-ai/palette/palette-two/css/style.css</check>
    <check type="manual">@font-face declarations exist for all weights</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="fonts/ directory must exist" />
    <depends-on task-id="phase-1-task-7" reason="variables.css must exist for font family updates" />
  </dependencies>

  <commit-message>feat(palette-two): add self-hosted fonts (JetBrains Mono, &lt;100KB)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — HTML & Styling

Six tasks building the actual theme pages and visual styling.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Build Palette One index.html (THE page)</title>
  <requirement>REQ-003: Single index.html; REQ-013: Emotional resonance in 3 seconds; REQ-027-030: Accessibility basics; REQ-030: Semantic HTML5</requirement>
  <description>
    Create THE single perfect page for Palette One. Restaurant/hospitality theme
    with warm, editorial feel. Must evoke recognition in first 3 seconds per
    "Sacred First 3 Seconds" decision. Semantic HTML5 with accessibility basics.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="One perfect page mandate; emotional resonance" />
    <file path="/home/agent/shipyard-ai/palette/palette-one/css/variables.css" reason="CSS custom properties to use" />
    <file path="/home/agent/shipyard-ai/prds/emdash-themes.md" reason="Ember theme: magazine-style, large images, pull quotes" />
  </context>

  <steps>
    <step order="1">Create palette/palette-one/index.html with HTML5 doctype</step>
    <step order="2">Add semantic structure: header, nav, main, sections, footer</step>
    <step order="3">Create hero section with large featured image area and tagline</step>
    <step order="4">Add restaurant-appropriate sections: About, Menu highlights, Reservations, Contact</step>
    <step order="5">Include pull quotes and editorial typography elements</step>
    <step order="6">Link CSS files: variables.css, then style.css</step>
    <step order="7">Add proper meta tags: viewport, description, charset</step>
    <step order="8">Ensure all images have alt text placeholders</step>
    <step order="9">Add skip-to-content link for keyboard accessibility</step>
    <step order="10">Ensure heading hierarchy (h1 > h2 > h3) is logical</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-one/index.html</check>
    <check type="manual">HTML uses semantic elements: header, nav, main, section, footer</check>
    <check type="manual">Hero section is prominent and immediately visible</check>
    <check type="manual">All images have alt attributes</check>
    <check type="manual">Heading hierarchy is correct (single h1, logical h2/h3)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="CSS variables must exist" />
    <depends-on task-id="phase-1-task-4" reason="Fonts must be available" />
  </dependencies>

  <commit-message>feat(palette-one): build index.html with semantic structure

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Create Palette One style.css (main styles)</title>
  <requirement>REQ-014: CSS-only animations; REQ-015: GPU-composited transforms; REQ-016: No horizontal scroll; REQ-017: Scroll-snap; REQ-018: Mobile-responsive</requirement>
  <description>
    Create the main stylesheet for Palette One. Warm, editorial aesthetic with
    serif headings and asymmetric layouts. CSS-only animations, no JavaScript.
    Must be mobile-responsive (375px to 1440px).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/palette/palette-one/index.html" reason="HTML structure to style" />
    <file path="/home/agent/shipyard-ai/palette/palette-one/css/variables.css" reason="CSS variables to consume" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/blog/src/styles/theme.css" reason="Responsive patterns reference" />
  </context>

  <steps>
    <step order="1">Add CSS reset (box-sizing, margin reset)</step>
    <step order="2">Create @font-face declarations for self-hosted fonts</step>
    <step order="3">Add base styles using CSS variables (body, typography)</step>
    <step order="4">Style header/nav with warm color palette</step>
    <step order="5">Style hero section: large imagery, editorial typography</step>
    <step order="6">Create asymmetric grid layouts for content sections</step>
    <step order="7">Add CSS-only hover effects (transform: scale, opacity transitions)</step>
    <step order="8">Add scroll-snap-type for smooth section scrolling</step>
    <step order="9">Create responsive breakpoints: @media (max-width: 900px), @media (max-width: 640px)</step>
    <step order="10">Ensure no horizontal overflow at any viewport size</step>
    <step order="11">Add focus states with visible outlines for accessibility</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-one/css/style.css</check>
    <check type="bash">grep "transform\|transition" /home/agent/shipyard-ai/palette/palette-one/css/style.css</check>
    <check type="manual">Animations use CSS only (no @keyframes with JS triggers)</check>
    <check type="manual">Responsive breakpoints exist for tablet (900px) and mobile (640px)</check>
    <check type="bash">grep ":focus" /home/agent/shipyard-ai/palette/palette-one/css/style.css</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="HTML must exist to style" />
  </dependencies>

  <commit-message>feat(palette-one): add style.css with warm editorial styling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="2">
  <title>Build Palette Two index.html (THE page)</title>
  <requirement>REQ-003: Single index.html; REQ-013: Emotional resonance in 3 seconds; REQ-027-030: Accessibility basics; REQ-030: Semantic HTML5</requirement>
  <description>
    Create THE single perfect page for Palette Two. Developer tools/terminal theme
    with dark, technical aesthetic. Must evoke recognition in first 3 seconds.
    Semantic HTML5 with accessibility basics.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="One perfect page mandate; emotional resonance" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/css/variables.css" reason="CSS custom properties to use" />
    <file path="/home/agent/shipyard-ai/prds/emdash-themes.md" reason="Forge theme: terminal UI, code-block styling, grid-heavy" />
  </context>

  <steps>
    <step order="1">Create palette/palette-two/index.html with HTML5 doctype</step>
    <step order="2">Add semantic structure: header, nav, main, sections, footer</step>
    <step order="3">Create hero section with terminal/code snippet motif</step>
    <step order="4">Add developer-appropriate sections: Features, Code examples, API docs, Pricing</step>
    <step order="5">Include code blocks and terminal-style UI elements</step>
    <step order="6">Link CSS files: variables.css, then style.css</step>
    <step order="7">Add proper meta tags: viewport, description, charset</step>
    <step order="8">Ensure all images have alt text placeholders</step>
    <step order="9">Add skip-to-content link for keyboard accessibility</step>
    <step order="10">Ensure heading hierarchy (h1 > h2 > h3) is logical</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-two/index.html</check>
    <check type="manual">HTML uses semantic elements: header, nav, main, section, footer</check>
    <check type="manual">Hero section has terminal/code aesthetic</check>
    <check type="manual">All images have alt attributes</check>
    <check type="manual">Heading hierarchy is correct (single h1, logical h2/h3)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="CSS variables must exist" />
    <depends-on task-id="phase-1-task-8" reason="Fonts must be available" />
  </dependencies>

  <commit-message>feat(palette-two): build index.html with semantic structure

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="2">
  <title>Create Palette Two style.css (main styles)</title>
  <requirement>REQ-014: CSS-only animations; REQ-015: GPU-composited transforms; REQ-016: No horizontal scroll; REQ-017: Scroll-snap; REQ-018: Mobile-responsive</requirement>
  <description>
    Create the main stylesheet for Palette Two. Dark, terminal aesthetic with
    monospace typography and neon accents. CSS-only animations, no JavaScript.
    Must be mobile-responsive (375px to 1440px).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/palette/palette-two/index.html" reason="HTML structure to style" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/css/variables.css" reason="CSS variables to consume" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/blog/src/styles/theme.css" reason="Responsive patterns reference" />
  </context>

  <steps>
    <step order="1">Add CSS reset (box-sizing, margin reset)</step>
    <step order="2">Create @font-face declarations for JetBrains Mono</step>
    <step order="3">Add base styles using CSS variables (body, typography)</step>
    <step order="4">Style header/nav with dark palette and neon accents</step>
    <step order="5">Style hero section: terminal window motif, code syntax highlighting</step>
    <step order="6">Create grid-heavy layouts for feature sections</step>
    <step order="7">Style code blocks with syntax highlighting colors</step>
    <step order="8">Add CSS-only hover effects (glow, color transitions)</step>
    <step order="9">Add scroll-snap-type for smooth section scrolling</step>
    <step order="10">Create responsive breakpoints: @media (max-width: 900px), @media (max-width: 640px)</step>
    <step order="11">Ensure no horizontal overflow at any viewport size</step>
    <step order="12">Add focus states with neon glow for accessibility</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-two/css/style.css</check>
    <check type="bash">grep "transform\|transition" /home/agent/shipyard-ai/palette/palette-two/css/style.css</check>
    <check type="manual">Animations use CSS only (no @keyframes with JS triggers)</check>
    <check type="manual">Responsive breakpoints exist for tablet (900px) and mobile (640px)</check>
    <check type="bash">grep ":focus" /home/agent/shipyard-ai/palette/palette-two/css/style.css</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="HTML must exist to style" />
  </dependencies>

  <commit-message>feat(palette-two): add style.css with dark terminal styling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="2">
  <title>Source and add images for Palette One</title>
  <requirement>REQ-019: Real food photography; REQ-031: Unsplash/Pexels with attribution; REQ-033: Theme-specific imagery</requirement>
  <description>
    Source and add high-quality food photography for Palette One.
    Use Unsplash/Pexels with proper attribution. Images must be
    theme-specific (restaurant/hospitality), not generic stock.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Real food photography requirement" />
    <file path="/home/agent/shipyard-ai/palette/palette-one/index.html" reason="Image placeholders to fill" />
  </context>

  <steps>
    <step order="1">Search Unsplash/Pexels for high-quality restaurant/food images</step>
    <step order="2">Select 4-6 images: hero image, food dishes (2-3), interior/ambiance (1-2)</step>
    <step order="3">Download images at appropriate resolution (1920px max width)</step>
    <step order="4">Optimize images for web (compress to &lt;500KB each for hero, &lt;200KB for thumbnails)</step>
    <step order="5">Save to palette/palette-one/images/ with descriptive names</step>
    <step order="6">Create ATTRIBUTION.md documenting photographer credits and licenses</step>
    <step order="7">Update index.html img src attributes with actual image paths</step>
    <step order="8">Add descriptive alt text for each image</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-one/images/</check>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-one/images/ATTRIBUTION.md</check>
    <check type="manual">Images are restaurant/food themed, not generic</check>
    <check type="manual">All images have attribution documented</check>
    <check type="bash">grep -o 'alt="[^"]*"' /home/agent/shipyard-ai/palette/palette-one/index.html</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="HTML with image placeholders must exist" />
  </dependencies>

  <commit-message>feat(palette-one): add food photography with proper attribution

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="2">
  <title>Source and add images for Palette Two</title>
  <requirement>REQ-020: Real code screenshots; REQ-031: Unsplash/Pexels with attribution; REQ-033: Theme-specific imagery</requirement>
  <description>
    Source and add developer-appropriate imagery for Palette Two.
    Use code screenshots, terminal windows, and tech-themed images.
    Create original code screenshots for authenticity.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Real code screenshots requirement" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/index.html" reason="Image placeholders to fill" />
  </context>

  <steps>
    <step order="1">Create code screenshots from VS Code or terminal with theme-appropriate syntax</step>
    <step order="2">Search Unsplash/Pexels for developer workspace/tech images (1-2)</step>
    <step order="3">Create 3-4 code snippet screenshots with syntax highlighting</step>
    <step order="4">Create terminal window mockup for hero section</step>
    <step order="5">Optimize images for web (compress, use PNG for screenshots, JPG for photos)</step>
    <step order="6">Save to palette/palette-two/images/ with descriptive names</step>
    <step order="7">Create ATTRIBUTION.md (credit any sourced photos, note original screenshots)</step>
    <step order="8">Update index.html img src attributes with actual image paths</step>
    <step order="9">Add descriptive alt text for each image</step>
  </steps>

  <verification>
    <check type="bash">ls -la /home/agent/shipyard-ai/palette/palette-two/images/</check>
    <check type="bash">cat /home/agent/shipyard-ai/palette/palette-two/images/ATTRIBUTION.md</check>
    <check type="manual">Images are developer/code themed, not generic</check>
    <check type="manual">Code screenshots are readable and professionally styled</check>
    <check type="bash">grep -o 'alt="[^"]*"' /home/agent/shipyard-ai/palette/palette-two/index.html</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="HTML with image placeholders must exist" />
  </dependencies>

  <commit-message>feat(palette-two): add code screenshots and developer imagery

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (After Wave 2) — Documentation & Verification

Four tasks for documentation and final QA.

```xml
<task-plan id="phase-1-task-13" wave="3">
  <title>Verify accessibility requirements</title>
  <requirement>REQ-027: Color contrast; REQ-028: Focus states; REQ-029: Alt text; REQ-030: Semantic HTML</requirement>
  <description>
    Verify both themes meet basic accessibility requirements.
    Check color contrast ratios, focus state visibility, alt text
    completeness, and semantic HTML structure.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/palette/palette-one/index.html" reason="Theme 1 to verify" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/index.html" reason="Theme 2 to verify" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Basic accessibility scope" />
  </context>

  <steps>
    <step order="1">Check Palette One color contrast: text on background (minimum 4.5:1 for normal text)</step>
    <step order="2">Check Palette Two color contrast: text on background (minimum 4.5:1)</step>
    <step order="3">Verify focus states are visible on both themes (tab through all links/buttons)</step>
    <step order="4">Verify all images have descriptive alt text</step>
    <step order="5">Verify heading hierarchy (h1 > h2 > h3) is logical on both themes</step>
    <step order="6">Verify semantic landmarks are present (header, nav, main, footer)</step>
    <step order="7">Test keyboard navigation works (can reach all interactive elements)</step>
    <step order="8">Document any issues found in QA-NOTES.md</step>
    <step order="9">Fix any critical accessibility failures</step>
  </steps>

  <verification>
    <check type="manual">Color contrast meets WCAG 2.1 Level A (4.5:1 minimum)</check>
    <check type="manual">Focus states are visible without mouse</check>
    <check type="manual">All images have alt text</check>
    <check type="manual">Keyboard navigation reaches all elements</check>
    <check type="bash">cat /home/agent/shipyard-ai/palette/QA-NOTES.md 2>/dev/null || echo "No issues documented"</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Palette One must be complete" />
    <depends-on task-id="phase-1-task-10" reason="Palette Two must be complete" />
    <depends-on task-id="phase-1-task-11" reason="Images with alt text must exist" />
    <depends-on task-id="phase-1-task-12" reason="Images with alt text must exist" />
  </dependencies>

  <commit-message>chore(palette): verify accessibility requirements

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="3">
  <title>Create docs/customization.md</title>
  <requirement>REQ-007: docs/customization.md; REQ-034-035: Document CSS custom properties</requirement>
  <description>
    Create comprehensive documentation for CSS custom properties.
    Document all variables for both themes with examples of
    how to customize colors, typography, and spacing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/palette/palette-one/css/variables.css" reason="Palette One variables to document" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/css/variables.css" reason="Palette Two variables to document" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="CSS variable documentation requirement" />
  </context>

  <steps>
    <step order="1">Create palette/docs/customization.md</step>
    <step order="2">Add overview section explaining CSS custom properties</step>
    <step order="3">Document Palette One variables: colors, typography, spacing, layout</step>
    <step order="4">Document Palette Two variables: colors, typography, spacing, layout</step>
    <step order="5">Add examples: changing --primary color, swapping font families</step>
    <step order="6">Include code snippets showing how to override variables</step>
    <step order="7">Add table of all variables with default values</step>
    <step order="8">Include common customization recipes (brand color swap, font swap)</step>
    <step order="9">Add FAQ section for common customization questions</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/docs/customization.md</check>
    <check type="manual">All CSS variables from both themes are documented</check>
    <check type="manual">Examples show how to customize colors and fonts</check>
    <check type="manual">Documentation is clear for non-technical users</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Palette One variables must exist" />
    <depends-on task-id="phase-1-task-7" reason="Palette Two variables must exist" />
  </dependencies>

  <commit-message>docs(palette): add CSS customization guide

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="3">
  <title>Create README.md with install/deploy instructions</title>
  <requirement>REQ-008: README with install, customize, deploy; REQ-036-039: Documentation requirements</requirement>
  <description>
    Create the main README with installation instructions, customization
    guide overview, and deployment options. Include deploy buttons for
    Vercel and Netlify per distribution decision.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="README requirements, deploy buttons" />
    <file path="/home/agent/shipyard-ai/palette/docs/customization.md" reason="Link to detailed customization docs" />
  </context>

  <steps>
    <step order="1">Create palette/README.md</step>
    <step order="2">Add project title: "Palette - Two Themes, Done Right"</step>
    <step order="3">Add description explaining the product essence</step>
    <step order="4">Add theme previews section with screenshots</step>
    <step order="5">Add installation instructions (download, clone)</step>
    <step order="6">Add quick start guide for each theme</step>
    <step order="7">Link to docs/customization.md for detailed customization</step>
    <step order="8">Add deploy buttons: Vercel, Netlify, Cloudflare Pages</step>
    <step order="9">Add tech specs: file sizes, font sizes, browser support</step>
    <step order="10">Add credits and license section</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/palette/README.md</check>
    <check type="manual">README includes installation instructions</check>
    <check type="manual">README includes deploy button badges</check>
    <check type="manual">README links to customization guide</check>
    <check type="bash">grep -i "vercel\|netlify" /home/agent/shipyard-ai/palette/README.md</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-14" reason="Customization docs to link to" />
    <depends-on task-id="phase-1-task-13" reason="Accessibility verification complete" />
  </dependencies>

  <commit-message>docs(palette): add README with install and deploy instructions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-16" wave="3">
  <title>Final verification: responsive and "first 3 seconds" test</title>
  <requirement>REQ-013: Emotional resonance in 3 seconds; REQ-018: Mobile-responsive; REQ-025: No loading spinners</requirement>
  <description>
    Final verification that both themes pass the "first 3 seconds" test
    and are fully responsive. Test at 375px (mobile) and 1440px (desktop).
    Verify no blocking content or popups.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/palette/palette-one/index.html" reason="Theme 1 to test" />
    <file path="/home/agent/shipyard-ai/palette/palette-two/index.html" reason="Theme 2 to test" />
    <file path="/home/agent/shipyard-ai/rounds/emdash-themes/decisions.md" reason="Sacred first 3 seconds requirement" />
  </context>

  <steps>
    <step order="1">Test Palette One at 375px width (mobile): verify no horizontal overflow</step>
    <step order="2">Test Palette One at 1440px width (desktop): verify layout is correct</step>
    <step order="3">Test Palette Two at 375px width (mobile): verify no horizontal overflow</step>
    <step order="4">Test Palette Two at 1440px width (desktop): verify layout is correct</step>
    <step order="5">Verify no loading spinners on initial load (both themes)</step>
    <step order="6">Verify no cookie banners or popups (both themes)</step>
    <step order="7">Verify personality/identity hits in 3 seconds (warm feel for One, tech feel for Two)</step>
    <step order="8">Verify hero section is above the fold on both mobile and desktop</step>
    <step order="9">Document any issues in QA-NOTES.md</step>
    <step order="10">Create SHIP-REPORT.md with completion status</step>
  </steps>

  <verification>
    <check type="manual">Both themes render correctly at 375px (mobile)</check>
    <check type="manual">Both themes render correctly at 1440px (desktop)</check>
    <check type="manual">No horizontal scrollbar at any tested viewport</check>
    <check type="manual">Personality hits in first 3 seconds (warm/editorial or dark/technical)</check>
    <check type="manual">No loading spinners, banners, or popups</check>
    <check type="bash">cat /home/agent/shipyard-ai/palette/SHIP-REPORT.md</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Palette One styling complete" />
    <depends-on task-id="phase-1-task-10" reason="Palette Two styling complete" />
    <depends-on task-id="phase-1-task-11" reason="Palette One images added" />
    <depends-on task-id="phase-1-task-12" reason="Palette Two images added" />
    <depends-on task-id="phase-1-task-13" reason="Accessibility verified" />
    <depends-on task-id="phase-1-task-15" reason="README complete" />
  </dependencies>

  <commit-message>test(palette): verify responsive layout and first 3 seconds test

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 6 | Foundation: project structure, CSS variables, fonts | 4 parallel + 2 dependent |
| 2 | 6 | HTML & Styling: index.html, style.css, images | 4 parallel + 2 dependent |
| 3 | 4 | Documentation & QA: accessibility, docs, README, final test | 2 parallel + 2 dependent |

**Total Tasks**: 16
**Maximum Parallelism**: Wave 1 & 2 (4 concurrent tasks each)
**Estimated Duration**: 2-3 sessions (per agent context limits)

---

## Risk Notes

### Critical (Address before Wave 1)

1. **Font Selection Unresolved**: This plan assumes Libre Baskerville + Inter for Palette One and JetBrains Mono for Palette Two. If different fonts are chosen, tasks 4 and 8 need updates.

2. **Image Sourcing Unresolved**: Tasks 11-12 assume Unsplash/Pexels. If commissioned photography is required, timeline extends significantly.

### High (Monitor during execution)

3. **"One Perfect Page" Scope Creep**: Steve Jobs' perfectionism could extend design iteration indefinitely. Hard deadline required per decisions.md.

4. **Font Size Budget**: 100KB per theme is tight for serif + sans-serif. May need aggressive subsetting or weight reduction.

### Medium (Acceptable risk)

5. **EmDash Compatibility**: Themes are standalone HTML/CSS, not EmDash templates. If EmDash integration is expected, additional tasks needed.

6. **Browser Testing**: Plan assumes modern browsers. No IE11 support per modern CSS approach.

---

## Dependencies Diagram

```
Wave 1:  [task-1]  [task-2]
              |        |
              v        v
         [task-3]  [task-7]
              |        |
              v        v
         [task-4]  [task-8]

Wave 2:  [task-5] ---> [task-6] ---> [task-11]
         [task-9] ---> [task-10] --> [task-12]

Wave 3:  [task-13] ---> [task-14] ---> [task-15] ---> [task-16]
```

---

## Open Items for Founder

Before execution begins, founder must confirm:

1. **Font Choices**: Libre Baskerville + Inter for One, JetBrains Mono for Two?
2. **Image Strategy**: Unsplash/Pexels or commissioned?
3. **Accessibility Level**: WCAG 2.1 Level A confirmed?

---

## Post-Plan Checklist

- [x] All 41 requirements in REQUIREMENTS.md have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Risk mitigations addressed in relevant tasks
- [x] Locked decisions respected (independent codebases, CSS-only animations, no toggles)
- [x] Cut features NOT included (no multi-page, no Palette 3-5, no theme switcher)
- [x] "Sacred first 3 seconds" threaded through verification tasks
- [x] Font budget (<100KB) tracked in verification

---

*Generated by Great Minds Agency - Phase Planning Skill*
*Source: rounds/emdash-themes/decisions.md, prds/emdash-themes.md*
