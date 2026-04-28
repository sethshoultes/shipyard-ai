CREATE TABLE IF NOT EXISTS render_jobs (
  jobId TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'ready', 'failed')),
  outputUrl TEXT,
  error TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_createdAt ON render_jobs(createdAt);
