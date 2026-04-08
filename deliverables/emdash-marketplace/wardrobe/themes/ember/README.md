# Ember

**Bold. Editorial. For people with something to say.**

Ember is a magazine-style theme that brings authoritative confidence to your content. Dark navy foundations with burnt orange accents create visual tension that captures attention. Serif headings command the page. Asymmetric grids invite exploration.

Perfect for creative studios, magazines, independent publishers, and anyone building a platform where design and voice matter equally.

## Design Philosophy

Ember embodies one idea: **editorial confidence**. Every element—from the dark navy (#1a2234) to the burnt orange (#c45d2c)—reinforces this personality. The magazine-inspired layout, asymmetric grids, and serif typography (Libre Baskerville) work together to say: *This is intentional. This is important.*

## The Details

- **Primary Color:** Dark Navy (#1a2234) — Foundation, authority, grounding
- **Accent Color:** Burnt Orange (#c45d2c) — Energy, intrigue, editorial voice
- **Typography:** Libre Baskerville for headings (serif, editorial), Source Sans Pro for body (modern, readable)
- **Grid:** Asymmetric, flowing between 2-column and 1-column layouts
- **Layout Style:** Magazine—pull quotes, article sections, feature cards with visual hierarchy

## Best For

- Creative studios and design agencies
- Magazines and editorial platforms
- Independent publishers with distinct voice
- Restaurants and hospitality brands with personality
- Galleries and art collectives
- Consulting practices and thought leadership

## Features

✓ Dark mode support (system preference + manual toggle)
✓ Magazine-style article layouts with pull quotes
✓ Asymmetric grid system for visual interest
✓ Bold hero section with accent accent color
✓ Responsive design (mobile-first, tested at 540px and up)
✓ Sticky navigation with animated link underlines
✓ Editorial footer with organized link structure
✓ Component-based architecture (Header, Footer, BaseLayout)

## Installation

```bash
npx wardrobe install ember
```

This replaces your `src/` directory with Ember while preserving your EmDash content. Your content, in a new skin.

## Customization

All colors are CSS variables in `src/layouts/BaseLayout.astro`:

```css
:root {
	--color-primary: #1a2234;      /* Dark navy */
	--color-accent: #c45d2c;       /* Burnt orange */
	--color-bg: #faf8f5;           /* Light background */
	--color-text: #1a2234;         /* Text color */
	--color-muted: #6b5d54;        /* Secondary text */
	--color-border: #e8ddd6;       /* Borders */
	--color-surface: #f5f1ed;      /* Card surfaces */
}
```

### Font Customization

Ember uses Google Fonts for optimal performance:
- **Headings:** Libre Baskerville (serif)
- **Body:** Source Sans Pro (sans-serif)

To use different fonts, update the `<link>` tags in `src/layouts/BaseLayout.astro` and change the CSS variables:

```css
--font-heading: "Your Font", serif;
--font-sans: "Your Font", sans-serif;
```

## File Structure

```
ember/
├── src/
│   ├── pages/
│   │   └── index.astro           # Landing page
│   ├── layouts/
│   │   └── BaseLayout.astro      # Main layout with theme variables
│   ├── components/
│   │   ├── Header.astro          # Sticky navigation
│   │   └── Footer.astro          # Editorial footer
│   ├── styles/
│   │   └── theme.css             # Magazine-style utilities
│   └── live.config.ts            # EmDash content loader
└── README.md                      # This file
```

## The Feeling

Installing Ember should feel like putting on something that fits. Your content stays exactly the same—the same words, the same structure—but suddenly it's wearing clothes that make it feel more powerful.

That moment, when you see your site with Ember? That's what we built for.

---

Made for people with something to say.
