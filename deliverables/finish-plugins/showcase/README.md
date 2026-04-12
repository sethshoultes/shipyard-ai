# Wardrobe Showcase Website

A modern, responsive showcase website for the Emdash theme marketplace. Displays five carefully curated themes: Ember, Forge, Slate, Drift, and Bloom.

## Overview

The Wardrobe Showcase allows users to:
- Browse five distinct Emdash themes
- Preview theme designs and personalities
- Copy installation commands with one click
- Learn about the theme installation process

## Project Structure

```
showcase/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # Interactive functionality (copy buttons, navigation)
├── wrangler.toml       # Cloudflare Pages configuration
├── _headers            # HTTP headers and cache control
├── _redirects          # URL redirect rules
├── verify.js           # Verification script for themes
└── screenshots/        # Theme preview images
    ├── ember.svg
    ├── forge.svg
    ├── slate.svg
    ├── drift.svg
    └── bloom.svg
```

## Features

- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation support
- **Interactive Copy Buttons**: One-click installation command copying with visual feedback
- **Performance**: Optimized CSS, lazy-loaded images, smooth scrolling
- **SEO-Friendly**: Meta tags, Open Graph, Twitter Card, JSON-LD structured data

## Deployment

### Cloudflare Pages

This website is configured for deployment to Cloudflare Pages using the Wrangler CLI.

#### Prerequisites

- Cloudflare account with Pages enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare API token and Account ID

#### Manual Deployment

```bash
cd showcase/
wrangler pages deploy . --project-name wardrobe-showcase
```

#### Automatic Deployment

The website automatically deploys to Cloudflare Pages when changes are pushed to the `main` branch. See `.github/workflows/deploy-showcase.yml` for the CI/CD configuration.

#### Environment Setup

To enable automatic deployments, add these secrets to your GitHub repository:

1. `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token (create at https://dash.cloudflare.com/profile/api-tokens)
2. `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare Account ID (visible in the Cloudflare dashboard)

### Expected Deployment URL

Once deployed to Cloudflare Pages, the showcase website will be available at:

**https://wardrobe-showcase.pages.dev**

You can also configure a custom domain by adding a CNAME record pointing to your Pages deployment.

## Configuration Files

### wrangler.toml

Defines the Cloudflare Pages project configuration:
- Project name: `wardrobe-showcase`
- Compatibility date: `2026-04-09`
- Build settings for static assets
- Production environment configuration

### _headers

Cloudflare Pages configuration for HTTP headers:
- Cache control policies (immutable for assets, revalidating for HTML)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Content-Type specifications for SVG images
- CORS headers for cross-origin requests

### _redirects

URL redirection rules for Cloudflare Pages:
- Handles trailing slash consistency
- Fallback routing for single-page app behavior
- API documentation redirects (if applicable)

## Local Development

To test the website locally:

```bash
# Simply open in a browser
open index.html

# Or use a local HTTP server
python -m http.server 8000
# Visit http://localhost:8000
```

## Themes

### Ember
Bold, editorial design for people with something to say.
- Magazine-style layout
- Serif headings
- Dark navy and burnt orange colors

### Forge
Dark and technical, built for builders.
- Dark mode optimized
- Monospace typography
- Neon green accents
- Terminal-inspired design

### Slate
Clean and professional design to build trust at first glance.
- Gray palette
- Blue accents
- System fonts
- Structured layout

### Drift
Minimal and airy design to let content breathe.
- Whitespace-focused
- Thin sans-serif typeface
- Sage green accent color

### Bloom
Warm and inviting design for community-focused sites.
- Rounded corners
- Cream background
- Terracotta accents
- Welcoming aesthetic

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers (IE11+)

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- ARIA labels for screen readers
- Semantic HTML structure
- Focus states for interactive elements
- Reduced motion support

## Performance

- Optimized CSS with critical path inlining
- Lazy-loaded images
- Efficient caching strategy
- Minified assets served from Cloudflare CDN
- Fast initial page load

## Maintenance

### Updating Theme Screenshots

To update theme preview images:

1. Replace the SVG files in `screenshots/`
2. Ensure filenames match: `ember.svg`, `forge.svg`, `slate.svg`, `drift.svg`, `bloom.svg`
3. Push changes to trigger automatic deployment

### Updating Theme Information

To modify theme descriptions or personalities:

1. Edit the theme card sections in `index.html`
2. Update the corresponding descriptions in this README
3. Push changes to trigger deployment

## Support

For issues or questions about the Wardrobe showcase, please refer to the main Emdash documentation or contact the development team.

## License

Part of the Emdash ecosystem. See main project for license details.
