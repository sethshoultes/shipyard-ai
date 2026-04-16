/**
 * readme-md.ts
 *
 * Generates a comprehensive README.md for a Cloudflare Workers project.
 *
 * Features:
 * - Hero section with project name and "Built with WorkerKit" tagline
 * - 30-second quickstart with exact commands
 * - "Local dev (no keys needed)" section explaining mock mode
 * - "Deploy (keys required)" section with dashboard links
 * - D1 database setup with exact commands
 * - 🔒 CRITICAL security section for Stripe webhooks
 * - AI troubleshooting section (quota, fallback)
 * - Comprehensive troubleshooting with dashboard links
 * - Deployment guide
 * - "Want to swap X?" sections for alternatives
 * - "Built with WorkerKit" badge with GitHub link
 *
 * REQ-041 to REQ-050 compliance:
 * - Excellent documentation with clear sections
 * - 30-second quickstart for rapid setup
 * - D1 setup instructions with exact commands
 * - API key setup with dashboard URLs
 * - Troubleshooting with direct dashboard links
 * - Security warnings for Stripe webhooks
 * - Deployment steps
 * - Brand attribution badge
 */

export interface ReadmeMdConfig {
  projectName: string;
  needsAuth?: boolean;
  needsDatabase?: boolean;
  needsAI?: boolean;
  needsPayments?: boolean;
}

/**
 * Generate a comprehensive README.md for a Cloudflare Workers project
 *
 * @param config Configuration object with project name and feature flags
 * @returns Complete README.md content as a string
 *
 * @example
 * const readme = generateReadme({
 *   projectName: 'my-api',
 *   needsAuth: true,
 *   needsDatabase: true,
 *   needsAI: true,
 *   needsPayments: true
 * });
 * // Returns complete README.md content
 */
export function generateReadme(config: ReadmeMdConfig): string {
  const {
    projectName,
    needsAuth = false,
    needsDatabase = false,
    needsAI = false,
    needsPayments = false,
  } = config;

  let readme = `# ${projectName}

Built with **WorkerKit** — Zero-to-deployed in under 60 seconds.

## ⚡ 30-Second Quickstart

Get this project running locally in 30 seconds:

\`\`\`bash
npm install
wrangler d1 create ${projectName}_db
npm run dev
\`\`\`

Your API is now running at \`localhost:8787\`.

Test it:
\`\`\`bash
curl http://localhost:8787/health
\`\`\`

## 🚀 Local Dev (No Keys Needed)

You can run this project **without any API keys** for local development:

- **Auth:** Uses mock authentication (no Clerk key needed)
- **Payments:** Mock mode (no Stripe key needed)
- **AI:** Works with Workers AI free tier (up to 10k calls/day)
- **Database:** Local D1 database (free)

Just run:
\`\`\`bash
npm install
npm run dev
\`\`\`

Your app starts at \`localhost:8787\` with no configuration needed.

## 🌐 Deploy (Keys Required)

To deploy to Cloudflare Workers with full functionality, you'll need API keys:
`;

  // Add auth setup instructions
  if (needsAuth) {
    readme += `
### 1. Clerk Authentication

Get your Clerk API keys:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **API Keys** in the left sidebar
3. Copy \`CLERK_SECRET_KEY\` and \`CLERK_PUBLISHABLE_KEY\`
4. Add them to your \`.env\` file (copy from \`.env.example\`)

\`\`\`bash
# .env
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
\`\`\`

Clerk provides:
- ✅ JWT authentication for protected routes
- ✅ User management dashboard
- ✅ SSO support (Google, GitHub, etc.)
- ✅ Free tier: up to 10k monthly active users
`;
  }

  // Add AI setup instructions
  if (needsAI) {
    readme += `
### ${needsAuth ? '2' : '1'}. Anthropic API (Optional, for Claude Fallback)

This project uses **Workers AI** (free tier: 10k calls/day). For Claude fallback:

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Click **API Keys** in the left sidebar
3. Click **Create Key** and copy it
4. Add it to your \`.env\` file:

\`\`\`bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
\`\`\`

If your Workers AI quota exceeds 10k calls/day, this fallback kicks in automatically.

**Claude costs:** ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
See [Anthropic pricing](https://www.anthropic.com/pricing) for details.
`;
  }

  // Add payments setup instructions
  if (needsPayments) {
    readme += `
### ${needsAuth ? (needsAI ? '3' : '2') : (needsAI ? '2' : '1')}. Stripe Payments

Enable payments in production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys** in the left sidebar
3. Copy your \`Secret Key\` (starts with \`sk_\`)
4. Add to \`.env\`:

\`\`\`bash
# .env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
\`\`\`

Get your **Webhook Secret**:

1. In [Stripe Dashboard](https://dashboard.stripe.com), go to **Developers** → **Webhooks**
2. Click **Add an endpoint**
3. Enter your Workers URL: \`https://your-project.workers.dev/webhook/stripe\`
4. Select event: \`checkout.session.completed\`
5. Copy the **Signing Secret** (starts with \`whsec_\`)
6. Add to \`.env\`:

\`\`\`bash
# .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
\`\`\`

**Important:** See "🔒 CRITICAL: Secure Your Stripe Webhooks" section below.
`;
  }

  // Add D1 database setup
  if (needsDatabase) {
    readme += `

## 📊 D1 Database Setup

This project uses **Cloudflare D1** (SQLite at the edge).

### Create Database

First, create your D1 database:

\`\`\`bash
wrangler d1 create ${projectName}_db
\`\`\`

Output will show your \`database_id\`. Copy it and add to \`wrangler.toml\`:

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "${projectName}_db"
database_id = "your_database_id_here"  # Paste here
\`\`\`

### Run Migrations

Create the initial schema:

\`\`\`bash
# Local development
wrangler d1 execute ${projectName}_db --local --file migrations/0001_create_users.sql

# Production
wrangler d1 execute ${projectName}_db --remote --file migrations/0001_create_users.sql
\`\`\`

### Query Your Database

In your code, use the \`DB\` binding:

\`\`\`typescript
// In a route handler
const users = await c.env.DB.prepare('SELECT * FROM users').all();
return c.json(users);
\`\`\`

**D1 Pricing:**
- Free tier: 100k read queries/day, 1M write queries/day
- See [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) for details

### D1 Dashboard

View your data in real-time:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **D1**
4. Click your database name to explore tables
`;
  }

  // Add critical security section for Stripe
  if (needsPayments) {
    readme += `

## 🔒 CRITICAL: Secure Your Stripe Webhooks

**This is NOT optional.** Webhook signature verification prevents payment fraud.

If you skip this, attackers can simulate payment events and give free access to your product.

### How to Verify Webhook Signatures

Your generated code includes webhook verification. Make sure it's enabled:

\`\`\`typescript
// In your webhook handler (src/index.ts or separate file)
import Stripe from 'stripe';

const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

export async function handleStripeWebhook(
  request: Request,
  stripeWebhookSecret: string
): Promise<void> {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    throw new Error('Missing stripe-signature header');
  }

  const body = await request.text();

  // This is CRITICAL — it verifies the signature
  const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

  // Now it's safe to process the event
  if (event.type === 'checkout.session.completed') {
    // Handle successful payment
  }
}
\`\`\`

**If you ignore signature verification:**
- ❌ Anyone can POST fake payment events
- ❌ Attackers grant themselves free access
- ❌ Your revenue disappears
- ❌ You never know because logs don't match Stripe's records

**Test your webhook:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click your endpoint
3. Click **Send test event**
4. Select \`checkout.session.completed\`
5. Your handler should process it without errors

If it fails, you forgot the signature verification. Fix it before deploying.

### Webhook Debug

View real-time webhook events:

1. [Stripe Webhook Dashboard](https://dashboard.stripe.com/developers/webhooks)
2. Click your endpoint to see event history
3. Click any event to see the payload and response

Errors appear here — use this to debug webhook issues.
`;
  }

  // Add AI troubleshooting section
  if (needsAI) {
    readme += `

## 🤖 AI Troubleshooting

### Workers AI Quota Exceeded

**Error:** \`Error: AI API limit exceeded\`

Workers AI free tier allows 10k calls/day. If you exceed this:

1. ✅ **Fallback:** If \`ANTHROPIC_API_KEY\` is in \`.env\`, switches to Claude automatically
2. ❓ **Check quota:** [Workers AI Dashboard](https://dash.cloudflare.com/workers-ai)
3. 🔄 **Quota resets:** Midnight UTC daily

### Enable Claude Fallback

Automatic fallback requires API key:

\`\`\`bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
\`\`\`

Your code automatically tries:
1. Workers AI (fast, free tier generous)
2. Claude fallback (if quota exceeded)

### Test AI Endpoint

\`\`\`bash
curl -X POST http://localhost:8787/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hello!"}'
\`\`\`

Expected response:
\`\`\`json
{
  "prompt": "Hello!",
  "response": "...",
  "provider": "Workers AI (or Claude fallback)"
}
\`\`\`

### Debug AI

Check \`src/ai.ts\` to see how it routes between providers:

\`\`\`typescript
// Primary: Workers AI
// Fallback: Claude (if API key exists)
export async function chat(prompt: string, env: Env): Promise<string> {
  try {
    // Try Workers AI first
    return await c.env.AI.run(...);
  } catch (error) {
    // Fall back to Claude if available
    if (env.ANTHROPIC_API_KEY) {
      return await anthropic.messages.create(...);
    }
  }
}
\`\`\`

For more details, see [Workers AI docs](https://developers.cloudflare.com/workers-ai/).
`;
  }

  // Add main troubleshooting section
  readme += `

## 🔧 Troubleshooting

### Error: Database not created

\`\`\`
Error: D1 database not found
\`\`\`

**Fix:**

\`\`\`bash
wrangler d1 create ${projectName}_db
\`\`\`

Then add the \`database_id\` to \`wrangler.toml\`.

### Error: Missing API keys in production

\`\`\`
Error: CLERK_SECRET_KEY is undefined
\`\`\`

**Fix:**

1. Copy \`.env.example\` to \`.env\`
2. Fill in all required keys (see "Deploy (Keys Required)" section above)
3. For production, set environment variables in Cloudflare Dashboard:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select your account
   - Go to **Workers & Pages** → **Your Worker** → **Settings** → **Environment Variables**
   - Add all keys from \`.env\`

### Error: Local dev needs CLERK_SECRET_KEY

You don't need it for local dev. If you get this error:

1. Check \`src/auth.ts\` — it should use mock auth if key is missing
2. Verify \`.env\` is in \`.gitignore\` (secrets aren't committed)
3. For production only, add keys via Cloudflare Dashboard

### Debug mode

Check real-time logs:

\`\`\`bash
wrangler tail
\`\`\`

Or view in Cloudflare Dashboard:
- Go to [Workers Real-time Logs](https://dash.cloudflare.com)
- Select your Worker
- Click **Real-time logs** tab

### Dashboard Links (Quick Reference)

- 🔗 [Cloudflare Dashboard](https://dash.cloudflare.com) — Main account hub
- 🔗 [Clerk API Keys](https://dashboard.clerk.com/api-keys) — Auth setup
- 🔗 [Stripe Dashboard](https://dashboard.stripe.com) — Payments \& webhooks
- 🔗 [Anthropic Console](https://console.anthropic.com) — AI API keys
- 🔗 [D1 Databases](https://dash.cloudflare.com/workers/d1) — Manage databases
- 🔗 [Workers AI](https://dash.cloudflare.com/workers-ai) — Check quota

## 🚀 Deployment

### Deploy to Cloudflare Workers

\`\`\`bash
wrangler deploy
\`\`\`

Your worker is now live at:
\`\`\`
https://${projectName}.workers.dev
\`\`\`

### Deploy to Custom Domain

If you own a domain on Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Go to **Workers Routes**
4. Create a route: \`https://your-domain.com/*\` → Your Worker

For detailed steps, see [Cloudflare Workers routing docs](https://developers.cloudflare.com/workers/platform/routing/).

### Deploy with Environment

Deploy to production with specific environment variables:

\`\`\`bash
wrangler deploy --env production
\`\`\`

Different environments can have different secrets (see \`wrangler.toml\` for env config).

## 🔄 Want to Swap X?

WorkerKit generates an opinionated stack, but you can replace parts:

### Want to use Auth.js instead of Clerk?

Auth.js provides Credentials, Google, GitHub, Discord auth:

1. Replace \`src/auth.ts\` with Auth.js middleware
2. Update \`wrangler.toml\` to remove Clerk bindings
3. Update \`.env.example\` with Auth.js secrets
4. Update \`src/index.ts\` route protection

See [Auth.js Cloudflare integration](https://authjs.dev/guides/configuring-oauth-providers).

### Want to use Anthropic Claude directly instead of Workers AI?

Remove Workers AI, use Claude for everything:

1. Delete the \`[ai]\` section from \`wrangler.toml\`
2. Replace \`src/ai.ts\` with pure Anthropic client
3. Update \`.env.example\` to require \`ANTHROPIC_API_KEY\` only

See [Anthropic API docs](https://docs.anthropic.com).

### Want to use Turso instead of D1?

Turso provides serverless SQLite with more features:

1. Create a Turso database at [turso.tech](https://turso.tech)
2. Replace D1 references with Turso client
3. Update \`wrangler.toml\` to remove D1 binding
4. Update \`src/db.ts\` to use Turso SDK

See [Turso documentation](https://docs.turso.tech).

### Want to add Express instead of Hono?

Express works on Workers, but Hono is lighter:

1. Install Express: \`npm install express\`
2. Replace Hono app with Express
3. Update \`src/index.ts\` to export Express handler

See [Express on Cloudflare Workers](https://developers.cloudflare.com/workers/examples/).

## 📚 Learn More

- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** — Platform reference
- **[Hono Docs](https://hono.dev)** — Web framework
- **[D1 Docs](https://developers.cloudflare.com/d1/)** — Database
- **[Clerk Docs](https://clerk.com/docs)** — Authentication
- **[Stripe Docs](https://stripe.com/docs/api)** — Payments
- **[Workers AI Docs](https://developers.cloudflare.com/workers-ai/)** — On-demand AI models

## 📦 Built with WorkerKit

This project was generated with **[WorkerKit](https://github.com/shipyard-ai/create-workerkit)**.

WorkerKit generates zero-dependency Cloudflare Workers projects with:
- ⚡ Hono for lightweight HTTP routing
- 🗄️ D1 for serverless SQLite
- 🔐 Clerk for authentication
- 🤖 Workers AI + Claude fallback for LLMs
- 💳 Stripe for payments

**Get started:** \`npx create-workerkit\`

---

**Ships something great.** Enjoy!
`;

  return readme;
}

/**
 * Validate README structure
 * Checks for required sections and formatting
 *
 * @param readme The README markdown content
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateReadme(readme: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required sections
  const requiredSections = [
    { name: 'Hero/Title', pattern: /^#\s+/ },
    { name: 'Quickstart', pattern: /30-Second Quickstart|30-second quickstart/i },
    { name: 'Local Dev', pattern: /Local Dev|local dev/i },
    { name: 'Deploy', pattern: /Deploy|keys required/i },
    { name: 'Troubleshooting', pattern: /Troubleshooting|troubleshooting/i },
    { name: 'Deployment section', pattern: /Deployment|deployment/i },
    { name: 'Built with WorkerKit', pattern: /Built with WorkerKit|built with.*workerkit/i },
  ];

  for (const section of requiredSections) {
    if (!section.pattern.test(readme)) {
      errors.push(`Missing section: ${section.name}`);
    }
  }

  // Check for code blocks
  const codeBlockCount = (readme.match(/```/g) || []).length;
  if (codeBlockCount < 4) {
    errors.push(`Too few code examples (found ${codeBlockCount / 2}, expected at least 2)`);
  }

  // Check for links
  const linkCount = (readme.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
  if (linkCount < 5) {
    errors.push(`Too few reference links (found ${linkCount}, expected at least 5)`);
  }

  // Check for proper markdown formatting
  if (!readme.includes('# ')) {
    errors.push('Missing H1 heading');
  }

  if (!readme.includes('## ')) {
    errors.push('Missing H2 subheadings');
  }

  // Check for security section (if Stripe is included and security section should exist)
  if (readme.includes('STRIPE_WEBHOOK_SECRET') && !readme.includes('🔒')) {
    errors.push('Missing security emoji in Stripe webhook section');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
