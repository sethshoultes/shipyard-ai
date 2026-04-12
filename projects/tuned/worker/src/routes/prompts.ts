/**
 * CRUD endpoints for prompts
 *
 * - POST /api/prompts: Create a new prompt
 * - GET /api/prompts: List all prompts
 * - GET /api/prompts/:name: Get prompt by name with active version
 */

import { validateApiKey } from '../lib/auth';
import { setActivePrompt } from '../lib/kv';

interface Env {
  DB: D1Database;
  PROMPTS_KV: KVNamespace;
}

interface PromptCreateRequest {
  name: string;
  content?: string;
}

/**
 * POST /api/prompts - Create a new prompt with initial version
 */
export async function handlePostPrompts(
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

    const body = (await request.json()) as PromptCreateRequest;

    if (!body.name) {
      return new Response(
        JSON.stringify({ error: 'Prompt name is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
          },
        }
      );
    }

    // Generate UUIDs for prompt and initial version
    const promptId = crypto.randomUUID();
    const versionId = crypto.randomUUID();

    // Create prompt in database
    const insertPrompt = await env.DB.prepare(
      'INSERT INTO prompts (id, name, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    )
      .bind(promptId, body.name)
      .run();

    if (!insertPrompt.success) {
      // Check if it's a unique constraint violation
      const errorMsg = typeof insertPrompt.error === 'string' ? insertPrompt.error : '';
      if (errorMsg.includes('UNIQUE')) {
        return new Response(
          JSON.stringify({ error: 'Prompt with this name already exists' }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': origin,
            },
          }
        );
      }
      throw new Error(errorMsg || 'Unknown database error');
    }

    // Create initial version (version 1) with is_active = true
    const defaultContent = body.content || '';
    const insertVersion = await env.DB.prepare(
      'INSERT INTO versions (id, prompt_id, version, content, is_active, created_at) VALUES (?, ?, 1, ?, true, CURRENT_TIMESTAMP)'
    )
      .bind(versionId, promptId, defaultContent)
      .run();

    if (!insertVersion.success) {
      throw new Error(insertVersion.error);
    }

    // Cache active prompt in KV
    await setActivePrompt(env.PROMPTS_KV, body.name, 1, defaultContent);

    return new Response(
      JSON.stringify({
        id: promptId,
        name: body.name,
        version: 1,
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
    console.error('Error creating prompt:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create prompt' }),
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
 * GET /api/prompts - List all prompts
 */
export async function handleGetPrompts(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    // Query all prompts with their active versions
    const result = await env.DB.prepare(
      `SELECT
        p.id,
        p.name,
        p.created_at,
        p.updated_at,
        (SELECT version FROM versions WHERE prompt_id = p.id AND is_active = true LIMIT 1) as active_version,
        (SELECT content FROM versions WHERE prompt_id = p.id AND is_active = true LIMIT 1) as active_content
      FROM prompts p
      ORDER BY p.created_at DESC`
    ).all();

    if (!result.success) {
      throw new Error(result.error);
    }

    const prompts = (result.results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      active_version: row.active_version,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return new Response(JSON.stringify({ prompts }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
    });
  } catch (error) {
    console.error('Error listing prompts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list prompts' }),
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
 * GET /api/prompts/:name - Get prompt by name with active version
 */
export async function handleGetPromptByName(
  name: string,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  try {
    // Get prompt and its active version
    const result = await env.DB.prepare(
      `SELECT
        p.id,
        p.name,
        p.created_at,
        p.updated_at,
        v.id as version_id,
        v.version,
        v.content,
        v.is_active
      FROM prompts p
      LEFT JOIN versions v ON p.id = v.prompt_id AND v.is_active = true
      WHERE p.name = ?
      LIMIT 1`
    )
      .bind(name)
      .first();

    if (!result) {
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

    const prompt = {
      id: result.id,
      name: result.name,
      active_version: result.version,
      content: result.content || '',
      created_at: result.created_at,
      updated_at: result.updated_at,
    };

    return new Response(JSON.stringify(prompt), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
    });
  } catch (error) {
    console.error('Error retrieving prompt:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve prompt' }),
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
