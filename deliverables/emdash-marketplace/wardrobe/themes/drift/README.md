# Drift — Minimal, Airy Design System

**Personality:** Contemplative. Calm. Breathing room.

## The Vibe

Drift is for creators who believe less is more. A whitespace-rich, light-on-your-eyes design that lets content float freely. Thin typography, a gentle sage green accent, and carefully considered negative space create an atmosphere of calm contemplation.

Your words deserve room to breathe. Drift delivers.

## Design Characteristics

- **Colors:** Pure white background, sage green (#9caf88) accent, minimal borders
- **Typography:** Inter Light (300 weight), generous line-height, subtle letter-spacing
- **Spacing:** Expansive whitespace—2x to 3x the padding of standard layouts
- **Shadows:** Nearly invisible—0.02-0.05 opacity
- **Interactions:** Fade and simplicity; nothing draws attention away from content

## File Structure

```
drift/
├── src/
│   ├── pages/
│   │   └── index.astro          # Home page with floating content
│   ├── layouts/
│   │   └── Base.astro           # Base layout with header, footer, theme switcher
│   ├── components/
│   │   ├── Header.astro         # Optional page header
│   │   └── Footer.astro         # Optional custom footer
│   ├── styles/
│   │   └── theme.css            # Complete theme CSS variables and base styles
│   └── live.config.ts           # EmDash content loader config
├── README.md                     # This file
```

## Installation

```bash
npx wardrobe install drift
```

This replaces your `src/` directory with Drift's minimal structure.

## Customization

All colors, spacing, and typography are defined as CSS custom properties in `src/styles/theme.css`. Override any variable in your own styles:

```css
:root {
	--color-accent: #9caf88; /* Change this to your brand color */
	--spacing-lg: 2rem; /* Adjust spacing */
	--font-sans: "Inter", system-ui, sans-serif; /* Use different font */
}
```

## Dark Mode

Drift includes automatic dark mode support via `prefers-color-scheme` media query. Users can also explicitly set light/dark via the theme switcher in the footer.

## What's Included

- **Responsive header** with navigation and theme switcher
- **Flexible footer** with brand info and links
- **Home page template** with EmDash content integration
- **CSS reset and utilities** for consistent styling
- **Font loading** optimized for Inter Light weight
- **Accessibility** built in (ARIA labels, semantic HTML)

## What's Not Included

- Pre-built components (pages are intentionally minimal)
- JavaScript frameworks
- Icon systems
- Build dependencies (uses Astro's built-in features)

## Philosophy

Drift trusts content to speak for itself. The theme disappears. Readers see *your words*, not the design.

Install it. Your site becomes poetry.
