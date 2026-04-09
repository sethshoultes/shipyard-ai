# Wardrobe Scripts

Utility scripts for the Wardrobe theme marketplace.

## Available Scripts

### build-tarballs.ts

Builds distributable tarballs for all themes.

```bash
npm run build:tarballs
```

Creates `.tar.gz` files for each theme in the `dist/` directory for distribution.

### upload-tarballs.ts

Uploads theme tarballs to cloud storage (Cloudflare R2).

**Prerequisites:**
- Cloudflare account with R2 bucket configured
- AWS credentials configured for R2

```bash
npm run upload:themes
```

### generate-screenshots.ts

Generates automated theme screenshots using Playwright.

**Purpose:**
- Captures desktop (1280x800) and mobile (375x667) screenshots of each theme
- Optimizes images to < 100KB for web delivery
- Standardizes demo content across all theme screenshots
- Creates showcase images for the wardrobe website

**Prerequisites:**
- Node.js with Playwright installed
- Running local or remote server hosting the themes
- Themes accessible via HTTP

**Usage:**

```bash
npm run screenshots
```

The script will:
1. Launch Playwright browser instances
2. Navigate to each theme's demo page
3. Capture desktop and mobile viewports
4. Optimize images using Sharp compression
5. Save to `showcase/screenshots/{theme}-{viewport}.png`

**Configuration:**

Edit the theme list and viewport sizes in `scripts/generate-screenshots.ts`:

```typescript
const themes = ['bloom', 'drift', 'ember', 'forge', 'slate'];

const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 },
};
```

**Output:**

Screenshots are saved to: `showcase/screenshots/`

```
showcase/screenshots/
├── bloom-desktop.png
├── bloom-mobile.png
├── drift-desktop.png
├── drift-mobile.png
├── ember-desktop.png
├── ember-mobile.png
├── forge-desktop.png
├── forge-mobile.png
├── slate-desktop.png
└── slate-mobile.png
```

Each image is optimized and compressed to less than 100KB.

## Demo Content

The screenshot generator uses standardized demo content defined in `fixtures/demo-content.ts`:

- **Blog posts**: Sample articles with realistic typography and content
- **About page**: Team information and value statements
- **Contact form**: Example contact form with all fields
- **Homepage**: Headline, tagline, and feature showcase

This ensures all themes showcase the same content, making theme comparisons fair and consistent.

## Fixtures

### demo-content.ts

Provides standardized content objects for screenshot generation:

```typescript
import { demoContent } from './fixtures/demo-content';

// Access demo content
demoContent.blogPosts        // Blog post samples
demoContent.aboutPage        // About page content
demoContent.contact          // Contact form structure
demoContent.homepage         // Homepage content
demoContent.demoHTML         // Pre-rendered demo HTML
```

## Future Enhancements

- [ ] Add support for custom demo content templates
- [ ] Implement parallel screenshot generation for faster processing
- [ ] Add screenshot diff comparison for design reviews
- [ ] Support for dark mode screenshots
- [ ] Automated screenshot scheduling via GitHub Actions
