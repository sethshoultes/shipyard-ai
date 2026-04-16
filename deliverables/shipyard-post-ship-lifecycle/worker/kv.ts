/**
 * KV Store Operations for Homeport
 * Manages project data storage and retrieval
 */

export interface Project {
  project_id: string;
  customer_email: string;
  customer_name: string;
  project_url: string;
  ship_date: string; // ISO 8601 format: YYYY-MM-DD
  unsubscribed?: boolean;
  emails_sent?: {
    day_007?: string; // ISO timestamp
    day_030?: string;
    day_090?: string;
    day_180?: string;
    day_365?: string;
  };
}

/**
 * Store a project in KV
 */
export async function storeProject(
  kv: KVNamespace,
  project: Project
): Promise<void> {
  const key = `project:${project.project_id}`;
  await kv.put(key, JSON.stringify(project));
}

/**
 * Get a project from KV by project_id
 */
export async function getProject(
  kv: KVNamespace,
  projectId: string
): Promise<Project | null> {
  const key = `project:${projectId}`;
  const data = await kv.get(key);
  if (!data) return null;
  return JSON.parse(data) as Project;
}

/**
 * List all project IDs
 */
export async function listAllProjectIds(
  kv: KVNamespace
): Promise<string[]> {
  const list = await kv.list({ prefix: 'project:' });
  return list.keys.map(k => k.name.replace('project:', ''));
}

/**
 * Mark a project as unsubscribed
 */
export async function unsubscribeProject(
  kv: KVNamespace,
  projectId: string
): Promise<boolean> {
  const project = await getProject(kv, projectId);
  if (!project) return false;

  project.unsubscribed = true;
  await storeProject(kv, project);
  return true;
}

/**
 * Record that an email was sent
 */
export async function recordEmailSent(
  kv: KVNamespace,
  projectId: string,
  emailType: 'day_007' | 'day_030' | 'day_090' | 'day_180' | 'day_365'
): Promise<void> {
  const project = await getProject(kv, projectId);
  if (!project) return;

  if (!project.emails_sent) {
    project.emails_sent = {};
  }

  project.emails_sent[emailType] = new Date().toISOString();
  await storeProject(kv, project);
}

/**
 * Get all projects (for batch operations)
 */
export async function getAllProjects(
  kv: KVNamespace
): Promise<Project[]> {
  const projectIds = await listAllProjectIds(kv);
  const projects: Project[] = [];

  for (const id of projectIds) {
    const project = await getProject(kv, id);
    if (project) {
      projects.push(project);
    }
  }

  return projects;
}
