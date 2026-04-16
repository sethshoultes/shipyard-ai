/**
 * env-dts.ts
 *
 * Generates a TypeScript environment types file (src/types/env.d.ts) with type definitions
 * for all Cloudflare Workers bindings: D1Database, Ai, KVNamespace, and environment variables.
 *
 * The generated env.d.ts provides:
 * - Env interface with typed bindings (DB, AI, KV)
 * - Environment variable types with type safety
 * - Imports from @cloudflare/workers-types for proper typing
 *
 * Documentation: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
 */

export interface EnvDtsConfig {
  needsDatabase: boolean;
  needsAI: boolean;
  needsKV: boolean;
  needsAuth: boolean;
  needsPayments: boolean;
}

/**
 * Generates src/types/env.d.ts with TypeScript interface definitions for Cloudflare Workers bindings
 *
 * Creates an Env interface that matches the bindings defined in wrangler.toml:
 * - D1Database binding (DB) if needsDatabase
 * - Workers AI binding (AI) if needsAI
 * - KV namespace binding (KV) as optional commented example
 * - Environment variables typed as string | undefined
 *
 * The generated file imports types from @cloudflare/workers-types for full type safety.
 *
 * @param config Configuration options for env.d.ts generation
 * @returns env.d.ts content as a string
 */
export function generateEnvDts(config: EnvDtsConfig): string {
  let dts = `/**
 * src/types/env.d.ts
 *
 * Global TypeScript type definitions for Cloudflare Workers environment.
 * This file provides type safety for all bindings and environment variables
 * defined in wrangler.toml and your Cloudflare account.
 *
 * The Env interface is automatically injected by Cloudflare Workers runtime.
 * Access environment in your handlers via the Hono context: c.env
 *
 * Documentation: https://developers.cloudflare.com/workers/wrangler/configuration/
 */

declare global {
  /**
   * Env interface defines all Cloudflare Workers bindings and environment variables
   * This interface matches the bindings and env vars configured in wrangler.toml
   *
   * Usage in Hono routes:
   *   app.get('/', (c) => {
   *     const db = c.env.DB;           // D1 Database binding
   *     const ai = c.env.AI;           // Workers AI binding
   *     const apiKey = c.env.API_KEY;  // Environment variable
   *     // ... use bindings and env vars
   *   });
   */
  interface Env {
`;

  // Add D1 Database binding
  if (config.needsDatabase) {
    dts += `    /**
     * D1 Database binding
     * Named binding in wrangler.toml: [[d1_databases]] binding = "DB"
     * D1 is Cloudflare's serverless SQLite database available at the edge
     *
     * Usage:
     *   const result = await c.env.DB.prepare("SELECT * FROM users").all();
     *
     * Documentation: https://developers.cloudflare.com/d1/
     */
    DB: D1Database;

`;
  }

  // Add Workers AI binding
  if (config.needsAI) {
    dts += `    /**
     * Workers AI binding
     * Named binding in wrangler.toml: [ai] binding = "AI"
     * Workers AI provides serverless LLMs running at the edge (Llama, Mistral, etc.)
     *
     * Usage:
     *   const response = await c.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
     *     prompt: "Your prompt here"
     *   });
     *
     * Documentation: https://developers.cloudflare.com/workers-ai/
     */
    AI: Ai;

`;
  }

  // Add optional KV namespace binding (commented out)
  dts += `    /**
     * KV Namespace binding (optional)
     * Uncomment and add binding below if you need KV storage
     * Named binding in wrangler.toml: [[kv_namespaces]] binding = "KV"
     * KV provides globally distributed, low-latency key-value storage
     *
     * Usage:
     *   await c.env.KV.put("key", "value");
     *   const value = await c.env.KV.get("key");
     *   await c.env.KV.delete("key");
     *
     * Documentation: https://developers.cloudflare.com/workers/runtime-apis/kv/
     */
    // KV: KVNamespace;

`;

  // Add environment variables
  dts += `    // ============================================================================
    // Environment Variables
    // ============================================================================
    // All environment variables are typed as string | undefined
    // Missing variables will be undefined - always check before use
    //
    // Set these in:
    //   - Local dev: .env.local file (git-ignored)
    //   - Production: Cloudflare Workers dashboard or wrangler secret
    //   - Example values: .env.example (git-tracked)
    //

`;

  if (config.needsAuth) {
    dts += `    /**
     * Clerk Authentication - Secret Key
     * Get from: https://dashboard.clerk.com/api-keys
     * Used to verify JWT tokens from Clerk in your API routes
     *
     * Local dev: Leave empty to use mock authentication
     * Production: Required for real Clerk auth to work
     */
    CLERK_SECRET_KEY?: string;

`;
  }

  if (config.needsPayments) {
    dts += `    /**
     * Stripe API Key - Secret Key
     * Get from: https://dashboard.stripe.com/apikeys
     * Used to communicate with Stripe's API (create charges, subscriptions, etc.)
     */
    STRIPE_API_KEY?: string;

    /**
     * Stripe Webhook Secret
     * Get from: https://dashboard.stripe.com/webhooks
     * Used to verify incoming webhook requests from Stripe
     */
    STRIPE_WEBHOOK_SECRET?: string;

`;
  }

  dts += `    /**
     * Stripe Publishable Key
     * Get from: https://dashboard.stripe.com/apikeys
     * Safe to expose in client-side code (JavaScript, HTML)
     * Used by Stripe.js library for payment forms and Elements
     */
    STRIPE_PUBLISHABLE_KEY?: string;

`;

  if (config.needsAI) {
    dts += `    /**
     * Anthropic API Key (optional, for Claude fallback)
     * Get from: https://console.anthropic.com/
     * Optional fallback if Workers AI quota is exceeded
     * If set, your ai.ts can fall back to Claude API
     *
     * Usage in ai.ts:
     *   if (!response) {
     *     // Workers AI failed, try Claude API
     *     const message = await fetch('https://api.anthropic.com/messages', {
     *       headers: { 'x-api-key': c.env.ANTHROPIC_API_KEY },
     *       ...
     *     });
     *   }
     */
    ANTHROPIC_API_KEY?: string;

`;
  }

  dts += `  }
}

export {};
`;

  return dts;
}

/**
 * Validates the generated env.d.ts content
 * Checks for:
 * - Proper TypeScript global declaration syntax
 * - Env interface definition
 * - Required bindings based on config
 * - Environment variable types
 *
 * @param content The generated TypeScript content
 * @param config The configuration used to generate the content
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateEnvDts(
  content: string,
  config: EnvDtsConfig
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required TypeScript syntax
  if (!content.includes('declare global {')) {
    errors.push('Missing "declare global" statement');
  }
  if (!content.includes('interface Env {')) {
    errors.push('Missing "interface Env" definition');
  }
  if (!content.includes('export {};')) {
    errors.push('Missing "export {}" statement at end of file');
  }

  // Check for required bindings based on config
  if (config.needsDatabase) {
    if (!content.includes('DB: D1Database;')) {
      errors.push('Missing D1Database binding (DB)');
    }
    if (!content.includes('D1 Database binding') && !content.includes('d1_databases')) {
      errors.push('Missing documentation for D1 binding');
    }
  }

  if (config.needsAI) {
    if (!content.includes('AI: Ai;')) {
      errors.push('Missing Workers AI binding (AI)');
    }
    if (!content.includes('Workers AI binding') && !content.includes('workers-ai')) {
      errors.push('Missing documentation for AI binding');
    }
  }

  // Check for KV namespace (should be commented)
  if (!content.includes('// KV: KVNamespace;')) {
    errors.push('Missing optional KV namespace binding comment');
  }

  // Check for environment variables
  if (config.needsAuth) {
    if (!content.includes('CLERK_SECRET_KEY')) {
      errors.push('Missing CLERK_SECRET_KEY environment variable');
    }
  }

  if (config.needsPayments) {
    if (!content.includes('STRIPE_API_KEY')) {
      errors.push('Missing STRIPE_API_KEY environment variable');
    }
    if (!content.includes('STRIPE_WEBHOOK_SECRET')) {
      errors.push('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }
  }

  if (config.needsAI) {
    if (!content.includes('ANTHROPIC_API_KEY')) {
      errors.push('Missing ANTHROPIC_API_KEY environment variable');
    }
  }

  // Check that env vars are typed as optional strings
  if (config.needsAuth && !content.includes('CLERK_SECRET_KEY?: string;')) {
    errors.push('CLERK_SECRET_KEY not properly typed as optional string');
  }

  if (config.needsAI && !content.includes('ANTHROPIC_API_KEY?: string;')) {
    errors.push('ANTHROPIC_API_KEY not properly typed as optional string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
