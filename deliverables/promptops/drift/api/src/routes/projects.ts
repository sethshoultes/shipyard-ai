/**
 * Drift API - Projects Routes
 *
 * POST /projects - Create a new project (unauthenticated)
 */

import type { D1Database } from "@cloudflare/workers-types";
import { generateApiKey, hashApiKey, generateId } from "../middleware/auth";

export interface CreateProjectRequest {
  name?: string;
}

export interface CreateProjectResponse {
  id: string;
  name: string;
  api_key: string;
  created_at: number;
}

/**
 * Handle POST /projects
 * Creates a new project and returns the API key (shown only once)
 */
export async function createProject(
  request: Request,
  db: D1Database
): Promise<Response> {
  let body: CreateProjectRequest = {};

  try {
    const contentType = request.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate project details
  const id = generateId();
  const name = body.name || `project-${id.slice(0, 8)}`;
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);
  const createdAt = Math.floor(Date.now() / 1000);

  try {
    // Insert the new project
    await db
      .prepare(
        "INSERT INTO projects (id, name, api_key_hash, created_at) VALUES (?, ?, ?, ?)"
      )
      .bind(id, name, apiKeyHash, createdAt)
      .run();

    // Return the response with the API key (shown only once)
    const response: CreateProjectResponse = {
      id,
      name,
      api_key: apiKey,
      created_at: createdAt,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for unique constraint violation
    if (message.includes("UNIQUE constraint failed")) {
      return new Response(
        JSON.stringify({ error: "A project with this name already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error creating project:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create project" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
