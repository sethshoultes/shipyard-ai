# Forge Theme

**Dark mode, monospace, neon green accents, terminal-inspired**

Forge is for builders and hackers. It's the aesthetic of a command line that means business—high contrast, data-dense layouts, and neon accents that pop against deep blacks.

## The Vibe

Forge commands respect. Every pixel serves a purpose. The typography is monospace (JetBrains Mono). The color palette is dark mode all the way: near-black backgrounds (#0d1117), with neon green accents (#39ff14) that glow like a terminal at midnight.

This is the theme for technical founders, engineers, and anyone who spends more time in their editor than anywhere else.

## Colors

- **Background:** #0d1117 (near-black)
- **Surface:** #161b22 (slightly lighter)
- **Text:** #e6edf3 (bright gray)
- **Accent:** #39ff14 (neon green)
- **Success:** #3fb950
- **Warning:** #d29922
- **Danger:** #f85149

## Typography

- **Primary Font:** JetBrains Mono (monospace for everything)
- **Fallback:** System monospace fonts
- **Line heights:** Tight to normal (1.15–1.5)
- **All headings use monospace for that technical edge**

## Layout

Forge uses a data-dense grid system:
- Hero section with dark gradient and neon border
- Feature cards with hover effects and accent highlights
- Sidebar-compatible layouts
- Grid-based navigation

## Installation

```bash
npx wardrobe install forge
```

Your content stays. Your design changes. That's the promise.

## File Structure

```
forge/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── styles/
│   │   └── theme.css
│   └── live.config.ts
└── README.md
```

## Customization

All colors and spacing are CSS variables in `src/styles/theme.css`. Override any variable to retheme:

```css
:root {
	--color-accent: #00ff00; /* Change neon accent */
	--color-background: #000000; /* Darker black */
	--font-mono: 'Courier New', monospace; /* Different monospace font */
}
```

## The Philosophy

Forge is opinionated. It looks like what it is: a tool. Not decorative. Not gentle. Technical. Precise. For people who ship code and don't have time for unnecessary design flourishes.

Install it. Your audience will know they're in the presence of builders.
