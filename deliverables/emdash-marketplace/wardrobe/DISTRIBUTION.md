# Wardrobe Theme Distribution

## Overview

This document tracks the distribution infrastructure for Wardrobe themes. Tarballs are built from each theme's `src/` directory and stored in `dist/themes/` for CLI download.

## Build Process

Theme tarballs are generated using:

```bash
npm run build:tarballs
```

This script:
1. Reads each theme's `src/` directory
2. Packages it into a tarball (`.tar`)
3. Compresses with gzip (level 9 for optimal compression)
4. Outputs to `dist/themes/{theme}@{version}.tar.gz`

## Tarball Sizes

Generated: 2026-04-08

| Theme | File | Size | Compressed Size | Status |
|-------|------|------|-----------------|--------|
| Ember | `ember@1.0.0.tar.gz` | 6.27 KB | 6.27 KB | ✓ Under 500KB target |
| Forge | `forge@1.0.0.tar.gz` | 5.08 KB | 5.08 KB | ✓ Under 500KB target |
| Slate | `slate@1.0.0.tar.gz` | 5.18 KB | 5.18 KB | ✓ Under 500KB target |
| Drift | `drift@1.0.0.tar.gz` | 5.32 KB | 5.32 KB | ✓ Under 500KB target |
| Bloom | `bloom@1.0.0.tar.gz` | 5.45 KB | 5.45 KB | ✓ Under 500KB target |

**Average:** 5.46 KB
**Maximum:** 6.27 KB
**Target:** < 500 KB per tarball
**Hard limit:** < 5 MB per tarball

All tarballs meet the target and hard limit requirements.

## Current Distribution (V1)

For V1, tarballs are stored locally in the `dist/themes/` directory.

### Local Distribution Path

```
/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/
├── ember@1.0.0.tar.gz
├── forge@1.0.0.tar.gz
├── slate@1.0.0.tar.gz
├── drift@1.0.0.tar.gz
└── bloom@1.0.0.tar.gz
```

The CLI (in development/testing) can reference these local paths or they can be served by a development server.

## Future Distribution (V2+)

Once deployed, the registry (`registry/themes.json`) will point to:

### Option A: CDN (R2)
```
https://cdn.emdash.dev/themes/{theme}@{version}.tar.gz
```

### Option B: npm Packages
```
npm install @wardrobe/{theme}@{version}
```

### Option C: GitHub Releases
```
https://github.com/emdash-app/wardrobe/releases/download/v{version}/{theme}@{version}.tar.gz
```

Current registry entries are placeholders pointing to CDN:
- `https://cdn.emdash.dev/themes/{theme}@1.0.0.tar.gz`

These URLs will be updated once the distribution infrastructure is deployed.

## Extraction Verification

All tarballs have been verified to:
- Extract successfully with `tar -xzf`
- Contain a complete `src/` directory
- Include all required theme components (layouts, components, styles, pages, config)

Example extraction:
```bash
tar -xzf dist/themes/ember@1.0.0.tar.gz
# Produces: src/ directory with full theme structure
```

## CLI Integration

The `wardrobe install` command uses these tarballs to:
1. Fetch the appropriate tarball
2. Extract the `src/` directory
3. Replace the user's `src/` with the theme variant
4. Complete in < 3 seconds

## Maintenance

### Regenerating Tarballs

When themes are updated, regenerate all tarballs:

```bash
npm run build:tarballs
```

This will:
- Create fresh compressed tarballs from current theme source
- Output size statistics
- Verify all tarballs meet size constraints

### Updating Versions

To change theme versions:
1. Update `THEMES` array in `scripts/build-tarballs.ts`
2. Update version in `registry/themes.json`
3. Run `npm run build:tarballs`

## Notes

- Gzip compression level is set to 9 (maximum) for optimal distribution size
- Tarballs are designed to be minimal (only `src/` directory)
- No dependencies or node_modules are included in tarballs
- Each tarball is self-contained and can be extracted independently
