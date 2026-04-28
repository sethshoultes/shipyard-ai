export interface RenderJob {
  jobId: string;
  url: string;
  status: "pending" | "processing" | "ready" | "failed";
  outputUrl: string | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export async function insertJob(
  db: D1Database,
  job: Omit<RenderJob, "createdAt" | "updatedAt">
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO render_jobs (jobId, url, status, outputUrl, error, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      job.jobId,
      job.url,
      job.status,
      job.outputUrl ?? null,
      job.error ?? null,
      now,
      now
    )
    .run();
}

export async function getJob(
  db: D1Database,
  jobId: string
): Promise<RenderJob | null> {
  const row = await db
    .prepare(`SELECT * FROM render_jobs WHERE jobId = ?`)
    .bind(jobId)
    .first<Record<string, unknown>>();
  if (!row) return null;
  return {
    jobId: String(row.jobId),
    url: String(row.url),
    status: String(row.status) as RenderJob["status"],
    outputUrl: row.outputUrl ? String(row.outputUrl) : null,
    error: row.error ? String(row.error) : null,
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  };
}

export async function updateJobStatus(
  db: D1Database,
  jobId: string,
  status: RenderJob["status"],
  outputUrl?: string | null,
  error?: string | null
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `UPDATE render_jobs
       SET status = ?, outputUrl = ?, error = ?, updatedAt = ?
       WHERE jobId = ?`
    )
    .bind(status, outputUrl ?? null, error ?? null, now, jobId)
    .run();
}
