# create-workerkit

**Zero-to-deployed business app in under 60 seconds**

A production-ready scaffold generator for full-stack AI applications on Cloudflare Workers. Answer 5 questions, get a deployable app with authentication, database, AI integration, and payments pre-wired.

## Installation

```bash
npm install -g create-workerkit
```

Or use it directly with npx:

```bash
npx create-workerkit@latest my-app
```

## Quick Start

```bash
# Interactive setup
npx create-workerkit my-app

# Direct usage
npx create-workerkit my-app --skip-prompts
```

The CLI will ask you 5 questions:

1. Project name
2. Include authentication (Clerk)?
3. Include database (D1)?
4. Include AI (Workers AI + Claude fallback)?
5. Include payments (Stripe)?

Then it generates a complete, production-ready project:

```bash
cd my-app
npm install
npm run dev
```

Visit [http://localhost:8787](http://localhost:8787) to see your app running.

## Features

- **Zero Dependencies** - CLI uses only Node.js built-in modules
- **TypeScript** - Strict mode enabled by default
- **Production Ready** - Includes authentication, database, AI, and payments
- **Fully Documented** - Every file has clear comments explaining what it does
- **Cloudflare Workers** - Deploys to the edge in seconds
- **Hono Framework** - Fast, lightweight, Workers-native framework

## Project Structure

The generated project includes:

```
my-app/
├── src/
│   ├── index.ts           # Main Hono application
│   ├── routes/            # API routes
│   └── types/             # TypeScript bindings
├── migrations/            # D1 database migrations
├── wrangler.toml          # Cloudflare Workers config
├── .env.example           # Environment variables template
└── package.json
```

## Architecture

WorkerKit generates projects with:

- **Framework**: Hono (ultra-lightweight, Workers-optimized)
- **Database**: D1 (SQLite at the edge)
- **Auth**: Clerk (JWT validation middleware)
- **AI**: Workers AI (primary) + Claude API (fallback)
- **Payments**: Stripe (checkout + webhook handling)
- **Language**: TypeScript (strict mode)

## Deploying

```bash
npm run deploy
```

Your app deploys to Cloudflare Workers instantly.

## What You Get

- ✅ Working API server running locally
- ✅ TypeScript configuration
- ✅ Database migrations template
- ✅ Authentication middleware (if selected)
- ✅ AI service abstraction (if selected)
- ✅ Stripe webhook handler (if selected)
- ✅ Comprehensive README in generated project

## Philosophy

- **Zero dependencies** in the CLI - your generated projects own 100% of their code
- **Opinionated but flexible** - one way to do things well, with clear comments for customization
- **Transparent configuration** - all config files editable with helpful inline comments
- **Ship fast** - from idea to deployed app in under 5 minutes

## Requirements

- Node.js 18 or higher
- npm or yarn
- Cloudflare account (free tier works great)

## Troubleshooting

### "Command not found: create-workerkit"

If installed globally:

```bash
npm install -g create-workerkit
```

Or use npx (no installation needed):

```bash
npx create-workerkit my-app
```

### TypeScript errors after generation

Make sure TypeScript is installed:

```bash
npm install
npm run build
```

### Can't deploy to Cloudflare

1. Install wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Create a D1 database (if using): `wrangler d1 create my_db`
4. Update `wrangler.toml` with your account ID and database name

## Next Steps

After generating your project:

1. **Development**: `npm run dev` runs your app locally with hot reload
2. **Configuration**: Add API keys to `.env` for Clerk, AI, and Stripe
3. **Customization**: Edit files in `src/` to build your features
4. **Deployment**: `npm run deploy` ships to production

## License

MIT

## Support

- [WorkerKit GitHub](https://github.com/shipyard-ai/create-workerkit)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev)

---

**Built for founders and indie hackers who want to ship fast.**
