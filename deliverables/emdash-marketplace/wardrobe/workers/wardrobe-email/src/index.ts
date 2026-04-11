/**
 * Wardrobe Email Capture Cloudflare Worker
 *
 * Receives email signups from the showcase website for new theme notifications.
 * No spam. Just themes.
 *
 * Endpoints:
 * - POST /subscribe: Subscribe an email address
 * - GET /subscribers/count: Return subscriber count (public)
 */

interface Env {
  EMAILS: KVNamespace;
  ENVIRONMENT?: string;
}

interface SubscribePayload {
  email: string;
  source?: string;
}

interface SubscriberData {
  subscribedAt: string;
  source?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Add CORS headers for cross-origin requests from showcase domain
 */
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * POST /subscribe
 * Subscribe an email address
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "source": "wardrobe-showcase" // optional
 * }
 */
async function handleSubscribe(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return addCorsHeaders(new Response("Method not allowed", { status: 405 }));
  }

  try {
    const payload: SubscribePayload = await request.json();
    const email = payload.email?.trim().toLowerCase();

    // Validate email
    if (!email) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ success: false, error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      );
    }

    if (!isValidEmail(email)) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            success: false,
            error: "Please enter a valid email address",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      );
    }

    // Check if already subscribed
    const existing = await env.EMAILS.get(email);
    if (existing) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            success: true,
            message: "You're already on the list!",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    }

    // Store in KV
    const subscriberData: SubscriberData = {
      subscribedAt: new Date().toISOString(),
      source: payload.source || "wardrobe-showcase",
    };

    await env.EMAILS.put(email, JSON.stringify(subscriberData));

    return addCorsHeaders(
      new Response(
        JSON.stringify({
          success: true,
          message: "You're on the list! We'll let you know when new themes drop.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  } catch (error) {
    console.error("Subscribe handler error:", error);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ success: false, error: "Something went wrong. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
  }
}

/**
 * GET /subscribers/count
 * Return total subscriber count (public, cached)
 */
async function handleCount(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return addCorsHeaders(new Response("Method not allowed", { status: 405 }));
  }

  try {
    // List all keys and count them
    const list = await env.EMAILS.list();
    const count = list.keys.length;

    return addCorsHeaders(
      new Response(
        JSON.stringify({ count }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        }
      )
    );
  } catch (error) {
    console.error("Count handler error:", error);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
  }
}

/**
 * Main request router
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return addCorsHeaders(new Response(null, { status: 204 }));
    }

    // Route to handlers
    if (url.pathname === "/subscribe") {
      return handleSubscribe(request, env);
    } else if (url.pathname === "/subscribers/count") {
      return handleCount(request, env);
    } else {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ error: "Not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      );
    }
  },
};
