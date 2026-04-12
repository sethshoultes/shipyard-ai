/**
 * CRUD endpoints for prompt versions
 *
 * - POST /api/prompts/:name/versions: Create a new version (auto-increment)
 * - GET /api/prompts/:name/versions: List all versions for a prompt
 * - PUT /api/prompts/:name/versions/:version/activate: Set version as active (rollback)
 */

import { validateApiKey } from '../lib/auth';
import { setActivePrompt } from '../lib/kv';

interface Env {
  DB: D1Database;
  PROMPTS_KV: KVNamespace;
}

interface VersionCreateRequest {
  content: string;
}

/**
 * POST /api/prompts/:name/versions - Create a new version with auto-increment
 */
export async function handlePostVersion(
  name: string,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    // Validate API key for write operations
    const authHeader = request.headers.get('Authorization');
    const authValidation = validateApiKey(authHeader);

    if (!authValidation.valid) {
      const statusCode = !authHeader ? 401 : 403;
      return new Response(
        JSON.stringify({ error: authValidation.error }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    const body = (await request.json()) as VersionCreateRequest;

    if (!body.content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    // Get prompt by name
    const promptResult = await env.DB.prepare(
      'SELECT id FROM prompts WHERE name = ? LIMIT 1'
    )
      .bind(name)
      .first();

    if (!promptResult) {
      return new Response(
        JSON.stringify({ error: 'Prompt not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    const promptId = promptResult.id;

    // Get max version number and auto-increment
    const maxVersionResult = await env.DB.prepare(
      'SELECT MAX(version) as max_version FROM versions WHERE prompt_id = ?'
    )
      .bind(promptId)
      .first() as any;

    const newVersion = ((maxVersionResult?.max_version as number) || 0) + 1;
    const versionId = crypto.randomUUID();

    // Set is_active = false on all existing versions
    const updateExisting = await env.DB.prepare(
      'UPDATE versions SET is_active = false WHERE prompt_id = ?'
    )
      .bind(promptId)
      .run();

    if (!updateExisting.success) {
      throw new Error(updateExisting.error);
    }

    // Create new version with is_active = true
    const insertVersion = await env.DB.prepare(
      'INSERT INTO versions (id, prompt_id, version, content, is_active, created_at) VALUES (?, ?, ?, ?, true, CURRENT_TIMESTAMP)'
    )
      .bind(versionId, promptId, newVersion, body.content)
      .run();

    if (!insertVersion.success) {
      throw new Error(insertVersion.error);
    }

    // Update KV cache with new active version
    await setActivePrompt(env.PROMPTS_KV, name, newVersion, body.content);

    return new Response(
      JSON.stringify({
        id: versionId,
        prompt_name: name,
        version: newVersion,
        is_active: true,
        created_at: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  } catch (error) {
    console.error('Error creating version:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create version' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  }
}

/**
 * GET /api/prompts/:name/versions - List all versions for a prompt
 */
export async function handleGetVersions(
  name: string,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    // Get prompt by name
    const promptResult = await env.DB.prepare(
      'SELECT id FROM prompts WHERE name = ? LIMIT 1'
    )
      .bind(name)
      .first();

    if (!promptResult) {
      return new Response(
        JSON.stringify({ error: 'Prompt not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    // Get all versions for this prompt
    const result = await env.DB.prepare(
      `SELECT id, version, is_active, created_at
      FROM versions
      WHERE prompt_id = ?
      ORDER BY version DESC`
    )
      .bind(promptResult.id)
      .all();

    if (!result.success) {
      throw new Error(result.error);
    }

    const versions = (result.results || []).map((row: any) => ({
      id: row.id,
      version: row.version,
      is_active: row.is_active,
      created_at: row.created_at,
    }));

    return new Response(
      JSON.stringify({
        prompt_name: name,
        versions,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  } catch (error) {
    console.error('Error listing versions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list versions' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  }
}

/**
 * PUT /api/prompts/:name/versions/:version/activate - Set version as active (rollback)
 */
export async function handleActivateVersion(
  name: string,
  version: number,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    // Validate API key for write operations
    const authHeader = request.headers.get('Authorization');
    const authValidation = validateApiKey(authHeader);

    if (!authValidation.valid) {
      const statusCode = !authHeader ? 401 : 403;
      return new Response(
        JSON.stringify({ error: authValidation.error }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    // Get prompt by name
    const promptResult = await env.DB.prepare(
      'SELECT id FROM prompts WHERE name = ? LIMIT 1'
    )
      .bind(name)
      .first();

    if (!promptResult) {
      return new Response(
        JSON.stringify({ error: 'Prompt not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    const promptId = promptResult.id;

    // Get the version to activate
    const versionResult = await env.DB.prepare(
      'SELECT id, content FROM versions WHERE prompt_id = ? AND version = ? LIMIT 1'
    )
      .bind(promptId, version)
      .first();

    if (!versionResult) {
      return new Response(
        JSON.stringify({ error: 'Version not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    // Set all versions to inactive
    const updateAllInactive = await env.DB.prepare(
      'UPDATE versions SET is_active = false WHERE prompt_id = ?'
    )
      .bind(promptId)
      .run();

    if (!updateAllInactive.success) {
      throw new Error(updateAllInactive.error);
    }

    // Activate the target version
    const updateActive = await env.DB.prepare(
      'UPDATE versions SET is_active = true WHERE id = ?'
    )
      .bind(versionResult.id)
      .run();

    if (!updateActive.success) {
      throw new Error(updateActive.error);
    }

    // Update KV cache with reactivated version
    await setActivePrompt(env.PROMPTS_KV, name, version, versionResult.content as string);

    return new Response(
      JSON.stringify({
        prompt_name: name,
        version,
        is_active: true,
        activated_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  } catch (error) {
    console.error('Error activating version:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to activate version' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        },
      }
    );
  }
}
