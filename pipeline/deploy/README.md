# Deploy Pipeline — EmDash to Cloudflare Pages

This directory contains the Cloudflare Pages deployment pipeline for EmDash sites built by Shipyard AI.

## Overview

EmDash sites are built with Astro 6 and Cloudflare Workers, running on Cloudflare Pages. The deploy pipeline automates:

1. **Build validation** — Ensures site directory exists, dependencies are installed, Node version is compatible
2. **Astro build** — Generates static/server-rendered output via `astro build`
3. **Project setup** — Creates the Cloudflare Pages project if it doesn't exist
4. **Deployment** — Pushes the built site to Cloudflare Pages via Wrangler
5. **URL output** — Returns the live production URL

## Deploy Scripts

### `deploy.sh` — Deploy a single site

Deploys an EmDash site to Cloudflare Pages.

**Usage:**
```bash
./pipeline/deploy/deploy.sh <site-directory> <project-name>
```

**Example:**
```bash
./pipeline/deploy/deploy.sh ./examples/bellas-bistro bellas-bistro
```

**Requirements:**
- `CLOUDFLARE_API_TOKEN` environment variable (Cloudflare API token with Pages deploy permissions)
- `CLOUDFLARE_ACCOUNT_ID` environment variable (Cloudflare account ID)
- Node.js >= 22
- Wrangler CLI (installed via npm)

**Steps:**
1. Validates site directory exists
2. Checks Node version >= 22
3. Installs dependencies if `node_modules` missing
4. Builds with `npx astro build`
5. Checks if Cloudflare Pages project exists; creates if needed
6. Deploys to Cloudflare Pages with branch name `main`
7. Outputs the live URL

### `deploy-all.sh` — Deploy all example sites

Deploys all EmDash sites in the `examples/` directory to Cloudflare Pages.

**Usage:**
```bash
./pipeline/deploy/deploy-all.sh
```

**Behavior:**
- Loops through each directory in `examples/`
- Skips `emdash-templates` (template library, not a deployable site)
- Calls `deploy.sh` for each site
- Outputs a summary of all deployments

**Example output:**
```
Deploying all EmDash sites to Cloudflare Pages...

[1/3] Deploying bellas-bistro...
✓ bellas-bistro deployed: https://bellas-bistro.pages.dev

[2/3] Deploying craft-co-studio...
✓ craft-co-studio deployed: https://craft-co-studio.pages.dev

[3/3] Deploying peak-dental...
✓ peak-dental deployed: https://peak-dental.pages.dev

===== DEPLOYMENT SUMMARY =====
Total sites: 3
Successful: 3
Failed: 0
```

## Cloudflare Configuration

### Environment Variables

Set these before running the deploy scripts:

```bash
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
```

**Obtaining credentials:**
- API Token: [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) — create a token with "Pages Publish" scope
- Account ID: [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) — visible in account settings

### Project Naming

Cloudflare Pages projects use the project name passed to the deploy script. For consistency:
- Use lowercase with hyphens (e.g., `bellas-bistro`, `peak-dental`)
- Project name becomes part of the live URL: `https://{project-name}.pages.dev`

## Architecture

```
PRD Approved
    ↓
[BUILD] astro build → dist/
    ↓
[VALIDATE] Check Cloudflare project exists
    ↓
[DEPLOY] wrangler pages deploy dist --project-name {name}
    ↓
[OUTPUT] https://{name}.pages.dev
    ↓
LIVE
```

## Error Handling

The deploy scripts include validation and error handling:

- **Missing site directory** — Exit with error message
- **Node version too old** — Exit with version requirement
- **Build failure** — Exit with Astro error output
- **Cloudflare authentication** — Exit if API token or account ID missing or invalid
- **Deployment failure** — Exit with Wrangler error output

## Integration with CI/CD

These scripts are designed to be called from CI/CD pipelines (GitHub Actions, etc.):

```yaml
# Example GitHub Actions workflow
- name: Deploy to Cloudflare Pages
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: ./pipeline/deploy/deploy.sh ./examples/bellas-bistro bellas-bistro
```

## Token Usage

Deployments consume no pipeline tokens — they are purely infrastructure cost.

## Next Steps

- [ ] Add GitHub Actions workflow for automatic deployments on main branch
- [ ] Add preview environment deployments for feature branches
- [ ] Implement domain routing (e.g., bellas-bistro.com → Cloudflare)
- [ ] Add analytics and monitoring dashboard
