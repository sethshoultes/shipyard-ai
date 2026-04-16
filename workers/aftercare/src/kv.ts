/**
 * KV Store Operations Module
 *
 * Provides abstraction layer for Cloudflare KV interactions.
 * Key structure:
 * - project:{id} → ProjectData JSON
 * - unsubscribed:{email} → "true"
 * - schedule:{id}:{day} → timestamp
 */

export interface ProjectData {
  email: string;
  name: string;
  project_url: string;
  ship_date: string;
  project_name?: string;
  unsubscribed?: boolean;
}

export interface Env {
  AFTERCARE_KV: KVNamespace;
  FROM_EMAIL: string;
  RESEND_API_KEY: string;
}

/**
 * Fetch project data by ID
 * @returns ProjectData or null if not found
 */
export async function getProject(kv: KVNamespace, projectId: string): Promise<ProjectData | null> {
  const key = `project:${projectId}`;
  const data = await kv.get(key, 'json');
  return data as ProjectData | null;
}

/**
 * Check if email address has unsubscribed
 */
export async function isUnsubscribed(kv: KVNamespace, email: string): Promise<boolean> {
  const key = `unsubscribed:${email}`;
  const value = await kv.get(key);
  return value !== null;
}

/**
 * Mark email address as unsubscribed
 */
export async function markUnsubscribed(kv: KVNamespace, email: string): Promise<void> {
  const key = `unsubscribed:${email}`;
  await kv.put(key, 'true');
}

/**
 * Record that an email was sent for deduplication
 */
export async function recordSentEmail(kv: KVNamespace, projectId: string, day: number): Promise<void> {
  const key = `schedule:${projectId}:${day}`;
  await kv.put(key, Date.now().toString());
}

/**
 * Check if email was already sent
 */
export async function hasSentEmail(kv: KVNamespace, projectId: string, day: number): Promise<boolean> {
  const key = `schedule:${projectId}:${day}`;
  const value = await kv.get(key);
  return value !== null;
}

/**
 * List all project IDs (for scheduler to iterate)
 * Note: KV doesn't have native list(), so this uses list() with prefix
 */
export async function listProjects(kv: KVNamespace): Promise<string[]> {
  const list = await kv.list({ prefix: 'project:' });
  return list.keys.map(key => key.name.replace('project:', ''));
}
