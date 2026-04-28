import { Hono } from 'hono';
import { getJob, putJob } from '../services/storage.js';

const complete = new Hono();

complete.post('/api/internal/complete', async (c) => {
  const env = c.env as { R2_BUCKET: R2Bucket };
  const body = (await c.req.json()) as { jobId: string; outputUrl: string };

  if (!body.jobId || !body.outputUrl) {
    return c.json({ error: 'Missing jobId or outputUrl' }, 400);
  }

  const job = await getJob({ R2_BUCKET: env.R2_BUCKET }, body.jobId);
  if (!job) {
    return c.json({ error: 'Job not found' }, 404);
  }

  job.status = 'complete';
  job.outputUrl = body.outputUrl;
  await putJob({ R2_BUCKET: env.R2_BUCKET }, job);

  return c.json({ success: true });
});

export default complete;
