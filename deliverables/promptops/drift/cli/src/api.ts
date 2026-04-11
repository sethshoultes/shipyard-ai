/**
 * Drift CLI - API Client
 *
 * Handles all HTTP communication with the Drift API
 */

import { getApiKey, getApiUrl } from "./config.js";

export interface ApiError {
  error: string;
}

export interface CreateProjectResponse {
  id: string;
  name: string;
  api_key: string;
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

export interface PushResponse {
  name: string;
  version: number;
  message: string | null;
  created_at: number;
}

export interface RollbackResponse {
  name: string;
  active_version: number;
  message: string;
}

/**
 * Create a new project (unauthenticated)
 */
export async function createProject(
  name?: string
): Promise<CreateProjectResponse> {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(name ? { name } : {}),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): Record<string, string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Not authenticated. Run 'drift init' first or set DRIFT_KEY environment variable."
    );
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * List all prompts
 */
export async function listPrompts(): Promise<PromptListItem[]> {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/prompts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Authentication failed. Check your API key or run 'drift init' again."
      );
    }
    const error: ApiError = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.prompts;
}

/**
 * Get a single prompt with content
 */
export async function getPrompt(name: string): Promise<PromptDetail> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/prompts/${encodeURIComponent(name)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Check your API key.");
    }
    if (response.status === 404) {
      throw new Error(`Prompt "${name}" not found.`);
    }
    const error: ApiError = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Push a new prompt version
 */
export async function pushPrompt(
  name: string,
  content: string,
  message?: string
): Promise<PushResponse> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/prompts/${encodeURIComponent(name)}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, message }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Check your API key.");
    }
    const error: ApiError = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Rollback to a specific version
 */
export async function rollbackPrompt(
  name: string,
  version: number
): Promise<RollbackResponse> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/prompts/${encodeURIComponent(name)}/rollback`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ version }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Check your API key.");
    }
    if (response.status === 404) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `Prompt or version not found.`);
    }
    const error: ApiError = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
