import { Hono } from 'hono';
import { listCompletedJobs } from '../services/storage.js';

const gallery = new Hono();

gallery.get('/api/gallery', async (c) => {
  const env = c.env as { R2_BUCKET: R2Bucket };
  const jobs = await listCompletedJobs({ R2_BUCKET: env.R2_BUCKET }, 20);

  return c.json(
    jobs.map((job) => ({
      jobId: job.jobId,
      repo: job.repo,
      date: job.until,
      videoUrl: job.outputUrl,
      createdAt: job.createdAt,
    }))
  );
});

export default gallery;
