/**
 * Drift API - Cloudflare Worker Entry Point
 *
 * The undo button for your AI's soul.
 *
 * Routes:
 * - POST /projects - Create project (unauthenticated)
 * - GET /prompts - List prompts (authenticated)
 * - GET /prompts/:name - Get prompt with content (authenticated)
 * - POST /prompts/:name - Push new version (authenticated)
 * - POST /prompts/:name/rollback - Rollback to version (authenticated)
 */

import type { D1Database } from "@cloudflare/workers-types";
import { authenticateRequest, unauthorizedResponse } from "./middleware/auth";
import { createProject } from "./routes/projects";
import {
  listPrompts,
  getPrompt,
  pushPrompt,
  rollbackPrompt,
} from "./routes/prompts";

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

// CORS headers for dashboard access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Route: POST /projects (unauthenticated)
      if (method === "POST" && path === "/projects") {
        const response = await createProject(request, env.DB);
        return addCorsHeaders(response);
      }

      // All other routes require authentication
      const { project, error } = await authenticateRequest(request, env.DB);

      if (!project) {
        return addCorsHeaders(unauthorizedResponse(error || "Unauthorized"));
      }

      // Route: GET /prompts
      if (method === "GET" && path === "/prompts") {
        const response = await listPrompts(project, env.DB);
        return addCorsHeaders(response);
      }

      // Route: GET /prompts/:name
      const getPromptMatch = path.match(/^\/prompts\/([^\/]+)$/);
      if (method === "GET" && getPromptMatch) {
        const name = decodeURIComponent(getPromptMatch[1]);
        const response = await getPrompt(project, name, env.DB);
        return addCorsHeaders(response);
      }

      // Route: POST /prompts/:name/rollback
      const rollbackMatch = path.match(/^\/prompts\/([^\/]+)\/rollback$/);
      if (method === "POST" && rollbackMatch) {
        const name = decodeURIComponent(rollbackMatch[1]);
        const response = await rollbackPrompt(project, name, request, env.DB);
        return addCorsHeaders(response);
      }

      // Route: POST /prompts/:name
      const pushPromptMatch = path.match(/^\/prompts\/([^\/]+)$/);
      if (method === "POST" && pushPromptMatch) {
        const name = decodeURIComponent(pushPromptMatch[1]);
        const response = await pushPrompt(project, name, request, env.DB);
        return addCorsHeaders(response);
      }

      // 404 Not Found
      return addCorsHeaders(
        new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );
    } catch (error) {
      console.error("Unhandled error:", error);
      return addCorsHeaders(
        new Response(
          JSON.stringify({ error: "Internal server error" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
  },
};
