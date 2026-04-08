# Bloom — Warm, Organic Design System

**Personality:** Optimistic. Inviting. Playfully warm.

## The Vibe

Bloom wraps your content in warmth. A cream background, rounded corners, and terracotta accents create an inviting, organic atmosphere. This is a theme for creators who believe in joy, connection, and generosity.

Your story deserves to bloom.

## Design Characteristics

- **Colors:** Cream background (#fdf6e3), terracotta accent (#c2704e), warm supporting palette
- **Corners:** Generous border radius (16px+) throughout—nothing feels sharp or cold
- **Typography:** Inter 400-700 weights, warm and approachable
- **Shadows:** Soft, warm-tinted shadows that suggest depth without coldness
- **Interactions:** Cards lift on hover, buttons transform with enthusiasm
- **Overall Feel:** Like stepping into a sun-filled studio or a friend's welcoming home

## File Structure

```
bloom/
├── src/
│   ├── pages/
│   │   └── index.astro          # Home page with card-based content
│   ├── layouts/
│   │   └── Base.astro           # Base layout with header, footer, theme switcher
│   ├── components/
│   │   ├── Header.astro         # Rounded card header component
│   │   └── Footer.astro         # Custom footer with rounded styling
│   ├── styles/
│   │   └── theme.css            # Complete theme CSS variables and base styles
│   └── live.config.ts           # EmDash content loader config
├── README.md                     # This file
```

## Installation

```bash
npx wardrobe install bloom
```

This replaces your `src/` directory with Bloom's warm structure.

## Customization

All design tokens are CSS custom properties in `src/styles/theme.css`. Override any value in your own styles:

```css
:root {
	--color-accent: #c2704e; /* Change to your brand warmth */
	--radius: 16px; /* Adjust corner roundness */
	--color-background: #fdf6e3; /* Customize the cream tone */
}
```

## Dark Mode

Bloom includes a thoughtful dark mode. Light backgrounds shift to warm dark browns, maintaining the warm personality. Users control this via the theme switcher in the footer.

## What's Included

- **Rounded header** with sticky navigation
- **Card-based layout** for content—everything feels curated and presentable
- **Warm color palette** with terracotta accent
- **Flexible footer** with rounded edges and subtle styling
- **Responsive design** that works beautifully on mobile
- **Theme switcher** for light/dark/system preference
- **Accessibility** with semantic HTML and ARIA labels
- **Phosphor icons** included (optional)

## What's Not Included

- Pre-built page components (use Bloom as a starting point)
- Icon library (but Phosphor is loaded if you want to use it)
- JavaScript frameworks beyond vanilla
- Complex state management

## Philosophy

Bloom believes your content is beautiful on its own. The design is generous—plenty of breathing room, soft edges, warm touches. Nothing overwhelms the story.

Install it. Watch your content glow.
