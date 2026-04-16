/**
 * index-ts.ts
 *
 * Generates the main Hono application entry point for Cloudflare Workers.
 * Supports conditional routes based on feature flags:
 * - Always: GET /health, GET /
 * - If needsAuth: GET /protected with auth middleware
 * - If needsDatabase: GET /api/users with D1 query example
 * - If needsAI: POST /api/chat with Workers AI example
 * - If needsPayments: POST /api/checkout with Stripe example
 *
 * REQ-013, REQ-014, REQ-015, REQ-016 compliance:
 * - Hono framework with typed bindings
 * - Hot reload support via wrangler dev
 * - Example routes demonstrating best practices
 * - Cloudflare Workers export format (export default app)
 */

export interface IndexTsConfig {
  projectName: string;
  needsAuth?: boolean;
  needsDatabase?: boolean;
  needsAI?: boolean;
  needsPayments?: boolean;
}

/**
 * Generates the main Hono application (src/index.ts) with conditional routes
 *
 * @param config Configuration object with project name and feature flags
 * @returns Complete TypeScript source code for the Hono application
 *
 * @example
 * const indexTs = generateIndexTs({
 *   projectName: 'my-app',
 *   needsAuth: true,
 *   needsDatabase: true,
 *   needsAI: true,
 *   needsPayments: true
 * });
 * // Returns complete TypeScript source code
 */
export function generateIndexTs(config: IndexTsConfig): string {
  const {
    projectName,
    needsAuth = false,
    needsDatabase = false,
    needsAI = false,
    needsPayments = false,
  } = config;

  let source = `/**
 * ${projectName} - Cloudflare Workers API
 *
 * This is the main entry point for your Hono application.
 * Hot reload enabled: Changes are automatically reloaded during \`npm run dev\`
 *
 * Routes:
 * - GET /health - Health check endpoint (always available)
 * - GET / - Welcome endpoint (always available)
`;

  // Document conditional routes in the header comment
  if (needsAuth) {
    source += ` * - GET /protected - Auth-protected endpoint (requires valid auth token)\n`;
  }
  if (needsDatabase) {
    source += ` * - GET /api/users - List all users from D1 database\n`;
  }
  if (needsAI) {
    source += ` * - POST /api/chat - AI chat endpoint using Workers AI\n`;
  }
  if (needsPayments) {
    source += ` * - POST /api/checkout - Stripe checkout session creation\n`;
  }

  source += ` */

import { Hono } from 'hono';
`;

  // Add conditional imports
  if (needsAuth) {
    source += `import { bearerAuth } from 'hono/bearer-auth';
`;
  }

  source += `
// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Bindings interface defines environment variables and Cloudflare service bindings
 * available to this Worker. These are configured in wrangler.toml
 */
interface Env {
`;

  if (needsDatabase) {
    source += `  // D1 Database binding - access via c.env.DB
  DB: D1Database;
`;
  }

  if (needsAI) {
    source += `  // Workers AI binding - access via c.env.AI
  AI: Ai;
`;
  }

  if (needsPayments) {
    source += `  // Stripe API key from environment
  STRIPE_SECRET_KEY?: string;
`;
  }

  if (needsAuth) {
    source += `  // Clerk API secret for JWT validation
  CLERK_SECRET_KEY?: string;
`;
  }

  source += `}

/**
 * Create Hono app instance with typed environment bindings
 * This enables TypeScript autocomplete for c.env throughout your routes
 */
const app = new Hono<{ Bindings: Env }>();

// ============================================================================
// MIDDLEWARE
// ============================================================================

`;

  // Add auth middleware if needed
  if (needsAuth) {
    source += `/**
 * Authentication middleware for protected routes
 * Validates Bearer token (e.g., "Authorization: Bearer <token>")
 *
 * In production, you would validate against Clerk or another auth provider.
 * For local development, you can use any test token.
 */
async function validateAuth(token: string): Promise<boolean> {
  // TODO: Validate token against Clerk using CLERK_SECRET_KEY
  // Example: const decoded = await clerkClient.verifyToken(token);
  // For now, any non-empty token is accepted in development
  return token.length > 0;
}

`;
  }

  source += `// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /health
 * Health check endpoint - useful for uptime monitoring and load balancers
 * Returns: { status: 'ok', timestamp: number }
 */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

/**
 * GET /
 * Welcome endpoint - greet users with project information
 * Returns: { message: string, project: string }
 */
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to ${projectName}',
    project: '${projectName}',
    docs: '/api/docs',
    built_with: 'Hono + Cloudflare Workers',
  });
});

`;

  // Add auth-protected route if needed
  if (needsAuth) {
    source += `/**
 * GET /protected
 * Auth-protected endpoint - requires valid Bearer token in Authorization header
 * Example: curl -H "Authorization: Bearer <token>" http://localhost:8787/protected
 * Returns: { message: string, authenticated: boolean }
 */
app.get('/protected', async (c) => {
  // Extract Bearer token from Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const isValid = await validateAuth(token);

  if (!isValid) {
    return c.json({ error: 'Invalid authentication token' }, 401);
  }

  return c.json({
    message: 'You are authenticated!',
    authenticated: true,
    timestamp: Date.now(),
  });
});

`;
  }

  // Add database route if needed
  if (needsDatabase) {
    source += `/**
 * GET /api/users
 * Fetch all users from D1 database
 * Demonstrates: Database binding, SQL queries, error handling
 * Returns: { users: Array<User>, count: number }
 */
app.get('/api/users', async (c) => {
  try {
    // Access D1 database via c.env.DB (configured in wrangler.toml)
    const result = await c.env.DB.prepare(
      'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    ).all();

    return c.json({
      users: result.results || [],
      count: result.results?.length || 0,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching users:', message);
    return c.json({ error: 'Failed to fetch users', details: message }, 500);
  }
});

`;
  }

  // Add AI route if needed
  if (needsAI) {
    source += `/**
 * POST /api/chat
 * AI chat endpoint using Workers AI
 * Demonstrates: Workers AI binding, streaming responses, error handling
 *
 * Example request:
 * curl -X POST http://localhost:8787/api/chat \\
 *   -H "Content-Type: application/json" \\
 *   -d '{"message": "What is the capital of France?"}'
 *
 * Returns: { response: string, model: string, tokens_used: number }
 */
app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json<{ message: string }>();
    const { message } = body;

    if (!message) {
      return c.json({ error: 'message field is required' }, 400);
    }

    // Use Workers AI to process the message
    // Model: @cf/meta/llama-2-7b-chat-int8 (open source, fast, free tier generous)
    // Docs: https://developers.cloudflare.com/workers-ai/models/
    const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt: message,
      max_tokens: 256,
    });

    return c.json({
      response: response,
      model: '@cf/meta/llama-2-7b-chat-int8',
      message_received: message,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in AI endpoint:', message);
    return c.json(
      { error: 'Failed to process AI request', details: message },
      500
    );
  }
});

`;
  }

  // Add payments route if needed
  if (needsPayments) {
    source += `/**
 * POST /api/checkout
 * Create a Stripe checkout session for a one-time payment
 * Demonstrates: Stripe integration, environment secrets, webhook setup
 *
 * Example request:
 * curl -X POST http://localhost:8787/api/checkout \\
 *   -H "Content-Type: application/json" \\
 *   -d '{"amount": 9999, "description": "Pro Plan"}'
 *
 * Returns: { session_id: string, checkout_url: string }
 */
app.post('/api/checkout', async (c) => {
  try {
    const body = await c.req.json<{ amount: number; description: string }>();
    const { amount, description } = body;

    if (!amount || !description) {
      return c.json(
        { error: 'amount and description fields are required' },
        400
      );
    }

    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json(
        {
          error: 'Stripe is not configured',
          hint: 'Set STRIPE_SECRET_KEY in .env',
        },
        500
      );
    }

    // TODO: Create Stripe checkout session using Stripe SDK
    // Example:
    // const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'usd',
    //       product_data: { name: description },
    //       unit_amount: amount,
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: 'https://example.com/success',
    //   cancel_url: 'https://example.com/cancel',
    // });

    return c.json({
      message: 'Checkout endpoint ready',
      note: 'Implement Stripe integration with your API key',
      amount,
      description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in checkout endpoint:', message);
    return c.json(
      { error: 'Failed to create checkout session', details: message },
      500
    );
  }
});

`;
  }

  // Add 404 handler
  source += `// ============================================================================
// 404 HANDLER
// ============================================================================

/**
 * Catch-all route for undefined endpoints
 * Returns helpful error message with status 404
 */
app.notFound((c) => {
  return c.json(
    {
      error: 'Not found',
      path: c.req.path,
      method: c.req.method,
      hint: 'Check the API documentation for available endpoints',
    },
    404
  );
});

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export the Hono app as the default export
 * This is the standard Cloudflare Workers export format
 * The app is automatically initialized by Wrangler
 */
export default app;
`;

  return source;
}

/**
 * Generate index.ts and validate it compiles
 * Ensures the output is valid TypeScript before writing
 *
 * @param config Configuration object with project name and feature flags
 * @returns Valid TypeScript source code for index.ts
 * @throws Error if generation fails or produces invalid syntax
 */
export function generateIndexTsString(config: IndexTsConfig): string {
  const source = generateIndexTs(config);

  // Validate basic TypeScript syntax (no external parser)
  // Check for matching braces, parentheses, and quotes
  const checks = [
    { pattern: /\{/g, name: 'opening braces', close: /\}/g },
    { pattern: /\(/g, name: 'opening parentheses', close: /\)/g },
    { pattern: /\[/g, name: 'opening brackets', close: /\]/g },
    { pattern: /`/g, name: 'backticks' },
    { pattern: /'/g, name: 'single quotes' },
    { pattern: /"/g, name: 'double quotes' },
  ];

  for (const check of checks) {
    const opens = (source.match(check.pattern) || []).length;
    const closes = check.close
      ? (source.match(check.close) || []).length
      : opens;
    if (opens !== closes) {
      throw new Error(
        `Invalid TypeScript syntax: unmatched ${check.name} (${opens} opens, ${closes} closes)`
      );
    }
  }

  // Verify key patterns exist
  if (!source.includes('export default app')) {
    throw new Error('Missing "export default app" - required for Cloudflare Workers');
  }

  if (!source.includes('const app = new Hono')) {
    throw new Error('Missing "const app = new Hono" - required Hono initialization');
  }

  if (!source.includes('app.get(\'/health\'')) {
    throw new Error('Missing GET /health route - required for all templates');
  }

  if (!source.includes('app.get(\'/\'')) {
    throw new Error('Missing GET / route - required for all templates');
  }

  return source;
}
