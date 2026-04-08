# Slate Theme

**Gray palette, blue accents, system fonts, structured**

Slate is for enterprises. It's the aesthetic of a company that means business—clean lines, structured layouts, and a professional bearing. Slate gray and corporate blue inspire trust.

## The Vibe

Slate whispers confidence. Nothing is accidental. Every element serves the information architecture. The typography is system fonts (for speed). The color palette is neutral: whites, grays, and a corporate blue (#3b82f6) that says "we've got this handled."

This is the theme for corporations, professional services, and anyone who needs to look trustworthy at first glance.

## Colors

- **Background:** #ffffff (clean white)
- **Surface:** #f8f9fa (subtle gray)
- **Text:** #1a1a1a (dark, readable)
- **Primary:** #64748b (slate gray)
- **Accent:** #3b82f6 (corporate blue)
- **Success:** #10b981
- **Warning:** #f59e0b
- **Danger:** #ef4444

## Typography

- **Primary Font:** System fonts (-apple-system, Segoe UI, etc.)
- **Fallback:** Helvetica, Arial, sans-serif
- **No custom font loading—everything is instant**
- **Line heights:** Normal to relaxed (1.5–1.7)
- **Clear hierarchy with grays and blues**

## Layout

Slate uses a professional grid system:
- Hero section with subtle gradient and border
- Feature cards with hover states
- Sidebar-compatible layouts
- Professional spacing and alignment

## Installation

```bash
npx wardrobe install slate
```

Your content stays. Your design becomes professional. That's the promise.

## File Structure

```
slate/
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
	--color-accent: #0066cc; /* Change primary accent */
	--color-primary: #555555; /* Change primary gray */
	--color-background: #fafbfc; /* Slightly warmer white */
}
```

## The Philosophy

Slate is corporate. Professional. Structured. It's for companies, agencies, and organizations that need to inspire trust on first impression.

Install it. Your audience will know they're dealing with professionals.
