# Wardrobe

**Theme marketplace for Emdash. One command. Instant transformation.**

---

## What is Wardrobe?

Install in one command. Your content stays untouched.

Wardrobe gives your Emdash site a new look in seconds. Pick a theme, run the command, and watch your site transform. Your posts, your pages, your settings — all exactly where you left them. Only the skin changes.

---

## Quick Start

```bash
# See what's available
npx wardrobe list

# Install a theme
npx wardrobe install ember

# Preview a theme before installing
npx wardrobe preview ember
```

That's it. Three seconds and your site looks completely different.

---

## Themes

Five themes. Five personalities. All free.

### Ember

**Bold. Editorial. For people with something to say.**

Dark navy meets burnt orange. Magazine-style layouts with serif headings that command attention. If your words carry weight, Ember gives them the stage they deserve.

```bash
npx wardrobe install ember
```

### Forge

**Dark and technical. Built for builders.**

Terminal-inspired dark mode with neon green accents. Monospace fonts. For developers, engineers, and anyone who thinks in code.

```bash
npx wardrobe install forge
```

### Slate

**Clean and professional. Trust at first glance.**

Gray palette with blue accents. System fonts. Structured layouts. Slate is for people who need to be trusted. The kind of design that lets the work speak first.

```bash
npx wardrobe install slate
```

### Drift

**Minimal and airy. Let your content breathe.**

Generous whitespace. Thin sans-serif typography. Sage green accents. When you want your words to land softly and linger.

```bash
npx wardrobe install drift
```

### Bloom

**Warm and inviting. Where community feels at home.**

Rounded corners. Cream backgrounds. Terracotta accents. Bloom feels like sitting down with a good friend. Cozy, personal, welcoming.

```bash
npx wardrobe install bloom
```

---

## How It Works

1. **Downloads the theme** — Wardrobe fetches the theme tarball from our CDN
2. **Backs up your current src/** — Your existing theme moves to `src.backup/`
3. **Swaps in the new theme** — The new `src/` directory takes its place
4. **Your content stays untouched** — Posts, pages, database, settings — all unchanged

The whole process takes under 3 seconds.

---

## Troubleshooting

### What if I don't like the theme?

Run install with a different theme. Try them all. That's the point.

```bash
npx wardrobe install drift
```

### Will I lose my content?

Never. Your content lives in your database. Wardrobe only changes the presentation layer. Your posts, pages, and settings stay exactly where they are.

### How do I rollback?

Your previous theme is saved in `src.backup/`. To restore it:

```bash
rm -rf src && mv src.backup src
```

---

## Telemetry

Wardrobe collects anonymous usage data to help us understand which themes resonate and where our users are. We track:

- Theme installed
- Operating system
- Country (from IP, not stored)

No personal data. No tracking across sessions. Just enough to make Wardrobe better.

### Opt Out

Set this environment variable to disable telemetry:

```bash
export WARDROBE_TELEMETRY_DISABLED=1
```

---

## Contributing

Want to create a theme for Wardrobe? We're building a small, curated collection — quality over quantity. If you've got a theme that brings something genuinely new to the table, we'd love to see it.

Reach out through the Emdash community channels or open an issue in this repository.

---

## License

MIT
