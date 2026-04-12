# PRD: Emdash Theme Marketplace

## Overview
Build the first theme marketplace for Emdash CMS. Themes are installable Astro projects that swap into any Emdash site. Browse, preview, install — one command.

## Problem
Emdash launched April 1, 2026 with no theme marketplace. Themes are code-level — you build your own or use the 3 starter templates. There's no way to browse, preview, or install community themes. Every Emdash site looks the same.

## Solution
A web-based marketplace at themes.shipyard.company with:
- Theme gallery with live previews and screenshots
- One-command install: npx emdash-themes install ember
- CLI that swaps src/ directory, preserves content (D1 stays untouched)
- 5 launch themes (Ember, Drift, Forge, Bloom, Slate)
- Each theme: full Astro project (layouts, components, pages, CSS, fonts)
- Theme preview server: click "Preview" to see the theme with your content

## The 5 Launch Themes

### Ember — Bold and Editorial
Magazine-style, serif headings, dark navy + burnt orange, asymmetric grids
Best for: restaurants, creative studios, magazines

### Drift — Minimal and Airy
Whitespace, thin sans-serif, sage green accent, content floats freely
Best for: spas, yoga studios, wellness brands

### Forge — Industrial and Technical
Dark mode, monospace, neon green accents, terminal-inspired, data-dense
Best for: SaaS, developer tools, tech companies

### Bloom — Warm and Organic
Rounded corners, cream background, terracotta accents, playful typography
Best for: bakeries, florists, local shops

### Slate — Corporate and Clean
Gray palette, blue accents, system fonts, sidebar nav, structured hierarchy
Best for: law firms, consulting, finance

## Technical Requirements
- Marketplace website: Next.js or Astro, deployed to Cloudflare Pages
- CLI tool: npx emdash-themes (npm package)
- Each theme: self-contained Astro src/ directory
- Theme format: tarball on R2 or npm package
- Preview: screenshot gallery + live demo site per theme
- Install preserves existing D1 content — only swaps presentation layer

## MVP Scope
1. Marketplace website with 5 theme cards (screenshot, description, install command)
2. Live demo site for each theme (deployed to Cloudflare Workers)
3. CLI installer: npx emdash-themes install [theme-name]
4. Theme package format (src/ directory as tarball)
5. README with setup instructions

## Success Metrics
- 5 themes live with demos
- CLI installs a theme in under 30 seconds
- Theme swap preserves all existing content
- Marketplace loads in under 2 seconds
