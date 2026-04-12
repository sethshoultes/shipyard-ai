import { getActivePrompt, setActivePrompt } from './lib/kv';
import { handleGetKVPrompt, syncToKv } from './routes/kv';
import { handlePostLog } from './routes/log';
import {
  handlePostPrompts as handlePostPromptsRoute,
  handleGetPrompts,
  handleGetPromptByName,
} from './routes/prompts';
import {
  handlePostVersion,
  handleGetVersions as handleGetVersionsRoute,
  handleActivateVersion,
} from './routes/versions';

// Define environment interface for Cloudflare Worker bindings
interface Env {
  DB: D1Database;
  PROMPTS_KV: KVNamespace;
}

// CORS helper function
function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '*';

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Route handling
    const pathname = url.pathname;

    // POST /api/prompts - Create a new prompt
    if (pathname === '/api/prompts' && request.method === 'POST') {
      return handlePostPromptsRoute(request, env, origin);
    }

    // GET /api/prompts - List all prompts
    if (pathname === '/api/prompts' && request.method === 'GET') {
      return handleGetPrompts(request, env, origin);
    }

    // GET /api/prompts/:name - Get prompt by name with active version
    const getPromptMatch = pathname.match(/^\/api\/prompts\/([^\/]+)$/) && request.method === 'GET';
    if (getPromptMatch) {
      const name = pathname.split('/').pop()!;
      return handleGetPromptByName(name, request, env, origin);
    }

    // POST /api/prompts/:name/versions - Create a new version
    const postVersionMatch = pathname.match(/^\/api\/prompts\/([^\/]+)\/versions$/);
    if (postVersionMatch && request.method === 'POST') {
      const name = postVersionMatch[1];
      return handlePostVersion(name, request, env, origin);
    }

    // GET /api/prompts/:name/versions - List all versions for a prompt
    const getVersionsMatch = pathname.match(/^\/api\/prompts\/([^\/]+)\/versions$/);
    if (getVersionsMatch && request.method === 'GET') {
      const name = getVersionsMatch[1];
      return handleGetVersionsRoute(name, request, env, origin);
    }

    // PUT /api/prompts/:name/versions/:version/activate - Set version as active
    const activateVersionMatch = pathname.match(/^\/api\/prompts\/([^\/]+)\/versions\/(\d+)\/activate$/);
    if (activateVersionMatch && request.method === 'PUT') {
      const name = activateVersionMatch[1];
      const version = parseInt(activateVersionMatch[2], 10);
      return handleActivateVersion(name, version, request, env, origin);
    }

    // GET /kv/prompt/:name - Retrieve active prompt by name from KV
    if (pathname.match(/^\/kv\/prompt\/[^\/]+$/) && request.method === 'GET') {
      const name = pathname.split('/').pop()!;
      return handleGetKVPrompt(name, env, origin);
    }

    // POST /log - Async logging endpoint (fire-and-forget)
    if (pathname === '/log' && request.method === 'POST') {
      return handlePostLog(request, ctx, origin);
    }

    // GET /log - Retrieve logs
    if (pathname === '/log' && request.method === 'GET') {
      return handleGetLog(request, env, origin);
    }

    // Not found
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });
  },
};

// Stub handler for GET /log
async function handleGetLog(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  // Stub: Retrieve logs
  return new Response(JSON.stringify({ message: 'GET /log stub' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}
