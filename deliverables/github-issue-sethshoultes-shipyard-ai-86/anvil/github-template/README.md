# My Cloudflare Worker

Deploy AI-powered workers to Cloudflare in seconds.

## Deploy to Workers

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-org/my-worker)

## Quick Start (10 seconds)

1. Click the "Deploy to Workers" button above
2. Authorize the GitHub app
3. Your worker is live at `https://my-worker.<your-subdomain>.workers.dev`

## Custom Deployment

For AI workers with streaming support:

```bash
npx anvil create --llm --stream
```

This generates:
- Streaming LLM handler (`index.ts`)
- AI binding configuration (`wrangler.toml`)
- Rate limiting setup

## Development

```bash
npm install
npm run dev
```

## License

MIT
