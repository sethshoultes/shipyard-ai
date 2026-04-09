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

## Cloudflare R2 Distribution (V1 - Recommended)

Per architectural decisions, R2 is the recommended distribution method for V1 due to:
- CDN-backed fast downloads for sub-3-second installs
- Simple URL structure and scalability
- Cost-effective for theme distribution

### R2 URL Format

All theme tarballs are served through Cloudflare's CDN:

```
https://pub-{ACCOUNT_ID}.r2.dev/{theme}@{version}.tar.gz
```

Example:
```
https://pub-abc123def456.r2.dev/ember@1.0.0.tar.gz
https://pub-abc123def456.r2.dev/forge@1.0.0.tar.gz
```

### Setup Process

#### 1. Create the R2 Bucket

First, ensure you have Wrangler CLI installed:

```bash
npm install -g @cloudflare/wrangler
wrangler login
```

Then create the bucket:

```bash
bash scripts/create-r2-bucket.sh emdash-themes
```

Or manually using Wrangler:

```bash
wrangler r2 bucket create emdash-themes
```

#### 2. Configure R2 Credentials

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with:
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (32-char hex)
- `R2_ACCESS_KEY_ID`: API token access key
- `R2_SECRET_ACCESS_KEY`: API token secret key

Get credentials from Cloudflare Dashboard:
1. Go to https://dash.cloudflare.com/?to=/:account/r2
2. Click Settings > API tokens
3. Create new R2 API token with "Edit" permissions
4. Copy credentials to `.env`

#### 3. Upload Tarballs to R2

Ensure tarballs are built:

```bash
npm run build:tarballs
```

Upload to R2:

```bash
npm run upload:themes
```

This will:
- Validate R2 credentials
- Upload all tarballs from `dist/themes/`
- Display CDN URLs for each theme
- Verify successful uploads

Example output:
```
🚀 Uploading 5 theme tarballs to R2...
   Bucket: emdash-themes
   Account: abc123def456...

✓ Uploaded ember@1.0.0.tar.gz (6.27 KB)
✓ Uploaded forge@1.0.0.tar.gz (5.08 KB)
✓ Uploaded slate@1.0.0.tar.gz (5.18 KB)
✓ Uploaded drift@1.0.0.tar.gz (5.32 KB)
✓ Uploaded bloom@1.0.0.tar.gz (5.45 KB)

✓ All tarballs uploaded successfully!

R2 URLs:
  https://pub-abc123def456.r2.dev/ember@1.0.0.tar.gz
  https://pub-abc123def456.r2.dev/forge@1.0.0.tar.gz
  https://pub-abc123def456.r2.dev/slate@1.0.0.tar.gz
  https://pub-abc123def456.r2.dev/drift@1.0.0.tar.gz
  https://pub-abc123def456.r2.dev/bloom@1.0.0.tar.gz
```

#### 4. Update Registry

Update `registry/themes.json` with the R2 URLs:

```json
{
  "themes": [
    {
      "id": "ember",
      "name": "Ember",
      "version": "1.0.0",
      "url": "https://pub-{ACCOUNT_ID}.r2.dev/ember@1.0.0.tar.gz"
    }
  ]
}
```

### Performance

With R2 + Cloudflare CDN:
- Download speeds: < 1 second globally
- Install time: < 3 seconds total
- Bandwidth cost: Efficient with Cloudflare's global network

## Local Distribution (Development)

For V1 development/testing, tarballs are stored locally in the `dist/themes/` directory:

```
/home/agent/shipyard-ai/deliverables/emdash-marketplace/wardrobe/dist/themes/
├── ember@1.0.0.tar.gz
├── forge@1.0.0.tar.gz
├── slate@1.0.0.tar.gz
├── drift@1.0.0.tar.gz
└── bloom@1.0.0.tar.gz
```

The CLI can reference these local paths for testing before deployment to R2.

## Alternative Distribution Methods (Not Recommended for V1)

### Option A: npm Packages
```
npm install @wardrobe/{theme}@{version}
```
(More complex setup, better for later versions)

### Option B: GitHub Releases
```
https://github.com/emdash-app/wardrobe/releases/download/v{version}/{theme}@{version}.tar.gz
```
(Manual release management, slower than CDN)

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
