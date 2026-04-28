# Aria — Changelog Theatre v2

Turn any GitHub repository's commit history into a ~60-second cinematic MP4 with dramatic narration and an ambient score.

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Demo

```bash
# Create a changelog video
curl -X POST https://your-worker.dev/api/changelog \
  -H "Content-Type: application/json" \
  -d '{"repo":"sethshoultes/shipyard-ai","since":"2026-04-21","until":"2026-04-28","voice":"alloy"}'

# Poll for completion
curl https://your-worker.dev/api/changelog/:jobId
```

## Architecture

- `packages/api` — Cloudflare Workers REST API (Hono)
- `packages/renderer` — Fly.io Node.js renderer (Remotion + Puppeteer + FFmpeg)
- `packages/web` — Cloudflare Pages static SPA

## Infra Setup

1. Deploy API: `cd packages/api && wrangler deploy`
2. Deploy Renderer: `cd packages/renderer && fly deploy`
3. Deploy Web: `cd packages/web && wrangler pages deploy dist`

Set these environment variables:
- `GITHUB_TOKEN` — GitHub personal access token
- `OPENAI_API_KEY` — OpenAI API key
- `R2_BUCKET` — Cloudflare R2 bucket name
- `API_URL` — Public API URL (for renderer callbacks)
