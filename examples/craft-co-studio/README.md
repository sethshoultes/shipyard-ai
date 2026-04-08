# Craft & Co Studio

Design with intention. A creative portfolio built with [Emdash CMS](https://github.com/emdash-cms/emdash) and deployed to Cloudflare Workers.

![Craft & Co Studio](screenshot.png)

**Live site:** [craft.shipyard.company](https://craft.shipyard.company)

## About

A portfolio website for a design studio featuring elegant serif typography on dark backgrounds with curated project galleries. Built autonomously by the Shipyard AI pipeline from a PRD.

## Tech Stack

- **CMS:** Emdash (Astro-based)
- **Database:** Cloudflare D1
- **Storage:** Cloudflare R2
- **Runtime:** Cloudflare Workers
- **Template:** Portfolio

## Pages

| Page | Route |
|------|-------|
| Home | `/` |
| Work | `/work` |
| Contact | `/contact` |

## Running Locally

```bash
npm install
npx wrangler dev
```
