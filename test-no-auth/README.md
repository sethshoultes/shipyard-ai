# test-no-auth

Built with [WorkerKit](https://github.com/shipyard-ai/create-workerkit) - Zero-to-deployed business app in under 60 seconds.

## Quick Start

1. ```bash
   npm install
   ```

2. ```bash
   cp .env.example .env
   # Edit .env and add your configuration
   ```

3. ```bash
   npm run dev
   ```

4. Visit [http://localhost:8787](http://localhost:8787)

## Deploying

```bash
npm run deploy
```

## Project Structure

```
test-no-auth/
├── src/
│   ├── index.ts           # Main Hono application
│   ├── routes/            # API routes
│   └── types/             # TypeScript type definitions
├── wrangler.toml        # Cloudflare Workers configuration
├── package.json
└── tsconfig.json
```

## Documentation

- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers](https://workers.cloudflare.com)


- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Stripe Integration](https://stripe.com)

## License

MIT
