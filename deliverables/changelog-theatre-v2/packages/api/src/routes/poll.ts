import { Hono } from 'hono';
import { getJob } from '../services/storage.js';

const poll = new Hono();

poll.get('/api/changelog/:jobId', async (c) => {
  const env = c.env as { R2_BUCKET: R2Bucket };
  const jobId = c.req.param('jobId');
  const job = await getJob({ R2_BUCKET: env.R2_BUCKET }, jobId);

  if (!job) {
    return c.json({ error: 'Job not found' }, 404);
  }

  return c.json({
    jobId: job.jobId,
    repo: job.repo,
    status: job.status,
    outputUrl: job.outputUrl,
    error: job.error,
    createdAt: job.createdAt,
  });
});

export default poll;
