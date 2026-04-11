/**
 * Drift API - Prompts Routes
 *
 * GET /prompts - List all prompts for authenticated project
 * GET /prompts/:name - Get single prompt with active version content
 * POST /prompts/:name - Push new version
 * POST /prompts/:name/rollback - Rollback to specific version
 */

import type { D1Database } from "@cloudflare/workers-types";
import type { Project } from "../middleware/auth";
import { generateId } from "../middleware/auth";

export interface Prompt {
  id: string;
  project_id: string;
  name: string;
  active_version: number;
  created_at: number;
}

export interface Version {
  id: string;
  prompt_id: string;
  version: number;
  content: string;
  message: string | null;
  created_at: number;
}

export interface PromptListItem {
  name: string;
  active_version: number;
  created_at: number;
}

export interface PromptDetail {
  name: string;
  active_version: number;
  content: string;
  created_at: number;
  versions: VersionInfo[];
}

export interface VersionInfo {
  version: number;
  message: string | null;
  created_at: number;
}

export interface PushPromptRequest {
  content: string;
  message?: string;
}

export interface RollbackRequest {
  version: number;
}

/**
 * GET /prompts - List all prompts
 */
export async function listPrompts(
  project: Project,
  db: D1Database
): Promise<Response> {
  try {
    const results = await db
      .prepare(
        "SELECT name, active_version, created_at FROM prompts WHERE project_id = ? ORDER BY created_at DESC"
      )
      .bind(project.id)
      .all<PromptListItem>();

    return new Response(JSON.stringify({ prompts: results.results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing prompts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to list prompts" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * GET /prompts/:name - Get single prompt with content
 */
export async function getPrompt(
  project: Project,
  name: string,
  db: D1Database
): Promise<Response> {
  try {
    // Get prompt
    const prompt = await db
      .prepare(
        "SELECT id, name, active_version, created_at FROM prompts WHERE project_id = ? AND name = ?"
      )
      .bind(project.id, name)
      .first<Prompt>();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: `Prompt "${name}" not found` }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get active version content
    const activeVersion = await db
      .prepare(
        "SELECT content FROM versions WHERE prompt_id = ? AND version = ?"
      )
      .bind(prompt.id, prompt.active_version)
      .first<{ content: string }>();

    // Get all versions
    const versions = await db
      .prepare(
        "SELECT version, message, created_at FROM versions WHERE prompt_id = ? ORDER BY version DESC"
      )
      .bind(prompt.id)
      .all<VersionInfo>();

    const response: PromptDetail = {
      name: prompt.name,
      active_version: prompt.active_version,
      content: activeVersion?.content || "",
      created_at: prompt.created_at,
      versions: versions.results,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting prompt:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get prompt" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * POST /prompts/:name - Push new version
 */
export async function pushPrompt(
  project: Project,
  name: string,
  request: Request,
  db: D1Database
): Promise<Response> {
  let body: PushPromptRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!body.content || typeof body.content !== "string") {
    return new Response(
      JSON.stringify({ error: "Missing required field: content" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Check if prompt exists
    let prompt = await db
      .prepare(
        "SELECT id, active_version FROM prompts WHERE project_id = ? AND name = ?"
      )
      .bind(project.id, name)
      .first<{ id: string; active_version: number }>();

    let newVersion: number;
    const now = Math.floor(Date.now() / 1000);

    if (!prompt) {
      // Create new prompt
      const promptId = generateId();
      newVersion = 1;

      await db.batch([
        db
          .prepare(
            "INSERT INTO prompts (id, project_id, name, active_version, created_at) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(promptId, project.id, name, newVersion, now),
        db
          .prepare(
            "INSERT INTO versions (id, prompt_id, version, content, message, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .bind(
            generateId(),
            promptId,
            newVersion,
            body.content,
            body.message || null,
            now
          ),
      ]);
    } else {
      // Get next version number
      const maxVersion = await db
        .prepare(
          "SELECT MAX(version) as max_version FROM versions WHERE prompt_id = ?"
        )
        .bind(prompt.id)
        .first<{ max_version: number }>();

      newVersion = (maxVersion?.max_version || 0) + 1;

      // Create new version and update active version
      await db.batch([
        db
          .prepare(
            "INSERT INTO versions (id, prompt_id, version, content, message, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .bind(
            generateId(),
            prompt.id,
            newVersion,
            body.content,
            body.message || null,
            now
          ),
        db
          .prepare(
            "UPDATE prompts SET active_version = ? WHERE id = ?"
          )
          .bind(newVersion, prompt.id),
      ]);
    }

    return new Response(
      JSON.stringify({
        name,
        version: newVersion,
        message: body.message || null,
        created_at: now,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error pushing prompt:", error);
    return new Response(
      JSON.stringify({ error: "Failed to push prompt" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * POST /prompts/:name/rollback - Rollback to specific version
 */
export async function rollbackPrompt(
  project: Project,
  name: string,
  request: Request,
  db: D1Database
): Promise<Response> {
  let body: RollbackRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (typeof body.version !== "number" || body.version < 1) {
    return new Response(
      JSON.stringify({ error: "Invalid version number" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get prompt
    const prompt = await db
      .prepare(
        "SELECT id, active_version FROM prompts WHERE project_id = ? AND name = ?"
      )
      .bind(project.id, name)
      .first<{ id: string; active_version: number }>();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: `Prompt "${name}" not found` }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if version exists
    const versionExists = await db
      .prepare(
        "SELECT id FROM versions WHERE prompt_id = ? AND version = ?"
      )
      .bind(prompt.id, body.version)
      .first();

    if (!versionExists) {
      return new Response(
        JSON.stringify({ error: `Version ${body.version} not found` }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update active version
    await db
      .prepare("UPDATE prompts SET active_version = ? WHERE id = ?")
      .bind(body.version, prompt.id)
      .run();

    return new Response(
      JSON.stringify({
        name,
        active_version: body.version,
        message: `Rolled back to v${body.version}. Live now.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error rolling back prompt:", error);
    return new Response(
      JSON.stringify({ error: "Failed to rollback prompt" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
