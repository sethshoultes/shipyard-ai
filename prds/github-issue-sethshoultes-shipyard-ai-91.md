# PRD: [dream] Promptfolio

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#91
> https://github.com/sethshoultes/shipyard-ai/issues/91

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #91
- **Author:** sethshoultes
- **Labels:** dream-candidate, p1
- **Created:** 2026-04-30T11:21:49Z
- **Priority:** p1

## Problem
AI practitioners (prompt engineers, AI consultants, developers showcasing AI integrations) need a beautiful portfolio generator that can:
1. One-click import Claude/ChatGPT conversation exports
2. Automatically create visual hierarchy with prompts as hero cards
3. Include a "Try this prompt" widget for visitor interaction
4. Provide a genuinely good dark mode (not just inverted colors)

Current solutions require manual HTML/CSS work or generic portfolio templates that don't understand AI workflow presentation.

## Success Criteria
- WordPress plugin that installs via standard WP plugin directory
- One-click import from Claude/ChatGPT conversation JSON exports
- Automatic generation of hero cards from prompts with elegant typography
- Built-in "Try this prompt" widget (iframe or API integration)
- Dark mode that looks designed, not inverted
- Mobile-responsive Apple-esque design
- Demo site deployed and working

## Technical Approach
- WP plugin architecture: PHP backend + React frontend blocks
- Import parser: Handle both Claude (.json) and ChatGPT (.json) export formats
- Design system: Tailwind CSS with custom Apple-inspired component library
- Widget: Embed sandboxed prompt runner (iframe to Shipyard AI or local inference)

## Acceptance Criteria
- [ ] Plugin installs cleanly on fresh WP 6.5+
- [ ] Import produces at least 3 portfolio cases from sample export
- [ ] Dark mode toggle works across all pages
- [ ] Lighthouse score > 90 on mobile and desktop
- [ ] Demo site live at promptfolio.pages.dev
