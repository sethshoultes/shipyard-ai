import type { TunedConfig } from "./config";

/**
 * Check if a prompt exists in the registry
 */
export async function checkPromptExists(
  name: string,
  config: TunedConfig
): Promise<boolean> {
  try {
    const response = await fetch(config.backendUrl + "/api/prompts/" + name, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + config.apiKey,
      },
    });
    return response.ok;
  } catch (error) {
    throw new Error(
      "Failed to check if prompt exists: " + (error instanceof Error ? error.message : String(error))
    );
  }
}

/**
 * Create a new prompt in the registry
 */
export async function createPrompt(
  name: string,
  config: TunedConfig
): Promise<void> {
  try {
    const response = await fetch(config.backendUrl + "/api/prompts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + config.apiKey,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        "Failed to create prompt: " + response.status + " - " + error
      );
    }
  } catch (error) {
    throw new Error(
      "Failed to create prompt: " + (error instanceof Error ? error.message : String(error))
    );
  }
}

/**
 * Create a new version of a prompt
 * Returns the version number
 */
export async function createVersion(
  name: string,
  content: string,
  config: TunedConfig
): Promise<number> {
  try {
    const response = await fetch(
      config.backendUrl + "/api/prompts/" + name + "/versions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + config.apiKey,
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        "Failed to create version: " + response.status + " - " + error
      );
    }

    const data = (await response.json()) as { version: number };
    return data.version;
  } catch (error) {
    throw new Error(
      "Failed to create version: " + (error instanceof Error ? error.message : String(error))
    );
  }
}

interface Prompt {
  id: string;
  name: string;
  active_version: number;
  created_at: string;
  updated_at: string;
}

interface Version {
  id: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

interface ListPromptsResponse {
  prompts: Prompt[];
}

interface ListVersionsResponse {
  prompt_name: string;
  versions: Version[];
}

/**
 * List all prompts with their active versions
 * GET /api/prompts
 */
export async function listPrompts(config: TunedConfig): Promise<Prompt[]> {
  const url = config.backendUrl + "/api/prompts";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      "Failed to list prompts: " +
        response.status +
        " " +
        response.statusText +
        " - " +
        errorBody
    );
  }

  const data = (await response.json()) as ListPromptsResponse;
  return data.prompts;
}

/**
 * List all versions for a specific prompt
 * GET /api/prompts/:name/versions
 */
export async function listVersions(
  name: string,
  config: TunedConfig
): Promise<Version[]> {
  const url =
    config.backendUrl + "/api/prompts/" + encodeURIComponent(name) + "/versions";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      "Failed to list versions: " +
        response.status +
        " " +
        response.statusText +
        " - " +
        errorBody
    );
  }

  const data = (await response.json()) as ListVersionsResponse;
  return data.versions;
}

interface ActivateVersionResponse {
  prompt_name: string;
  version: number;
  is_active: boolean;
  activated_at: string;
}

/**
 * Activate a specific version (rollback)
 * PUT /api/prompts/:name/versions/:version/activate
 */
export async function activateVersion(
  name: string,
  version: number,
  config: TunedConfig
): Promise<ActivateVersionResponse> {
  const url =
    config.backendUrl +
    "/api/prompts/" +
    encodeURIComponent(name) +
    "/versions/" +
    version +
    "/activate";

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + config.apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        "Failed to activate version: " +
          response.status +
          " " +
          response.statusText +
          " - " +
          errorBody
      );
    }

    const data = (await response.json()) as ActivateVersionResponse;
    return data;
  } catch (error) {
    throw new Error(
      "Failed to activate version: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}
