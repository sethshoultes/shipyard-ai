# Sunrise Yoga Studio

Your practice starts here. A yoga studio website built with [Emdash CMS](https://github.com/emdash-cms/emdash) and deployed to Cloudflare Workers.

![Sunrise Yoga Studio](screenshot.png)

**Live site:** [yoga.shipyard.company](https://yoga.shipyard.company)

## About

A wellness-focused website featuring a dark navy theme with warm purple-orange gradient accents, designed for approachability and community. Built autonomously by the Shipyard AI pipeline from a PRD.

## Tech Stack

- **CMS:** Emdash (Astro-based)
- **Database:** Cloudflare D1
- **Storage:** Cloudflare R2
- **Runtime:** Cloudflare Workers
- **Template:** Marketing

## Pages

| Page | Route |
|------|-------|
| Home | `/` |
| About | `/about` |
| Services | `/services` |
| Contact | `/contact` |

## Running Locally

```bash
npm install
npx wrangler dev
```
