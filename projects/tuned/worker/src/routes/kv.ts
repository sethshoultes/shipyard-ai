/**
 * KV read endpoint for retrieving active prompts
 * Target latency: <5ms for KV reads (Edge Cache)
 * No authentication required - SDK clients read directly from KV
 */

import { getActivePrompt, setActivePrompt } from '../lib/kv';

/**
 * GET /kv/prompt/:name
 * Retrieve active prompt version and content from KV
 * Returns: { version: number, content: string }
 * Returns 404 if prompt not found: { error: "Prompt not found" }
 *
 * Latency target: <5ms
 * - Direct KV read with no database queries
 * - Edge-cached response
 * - No authentication required
 */
export async function handleGetKVPrompt(
  name: string,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    const prompt = await getActivePrompt(env.PROMPTS_KV, name);

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // Cache 404s for 60s
          ...corsHeaders(origin),
        },
      });
    }

    return new Response(JSON.stringify(prompt), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache successful responses for 5 minutes
        ...corsHeaders(origin),
      },
    });
  } catch (error) {
    console.error(`Failed to retrieve prompt from KV for name ${name}:`, error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve prompt' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });
  }
}

/**
 * Sync active version to KV after D1 writes
 * Called after version create/activate/rollback operations
 * Uses ctx.waitUntil() for background sync without blocking response
 *
 * Latency impact: None (background operation)
 */
export async function syncToKv(
  kv: KVNamespace,
  name: string,
  version: number,
  content: string
): Promise<void> {
  try {
    await setActivePrompt(kv, name, version, content);
    console.log(`Synced prompt ${name} v${version} to KV`);
  } catch (error) {
    console.error(`Failed to sync prompt ${name} v${version} to KV:`, error);
    // Don't throw - KV sync failure shouldn't block the main operation
  }
}

// CORS helper
function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Environment interface
interface Env {
  DB: D1Database;
  PROMPTS_KV: KVNamespace;
}
