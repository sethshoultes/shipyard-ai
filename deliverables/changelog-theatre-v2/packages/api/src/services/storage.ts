import type { Job } from '../types.js';

export interface StorageEnv {
  R2_BUCKET: R2Bucket;
}

export async function getJob(env: StorageEnv, jobId: string): Promise<Job | null> {
  const obj = await env.R2_BUCKET.get(`jobs/${jobId}.json`);
  if (!obj) return null;
  const text = await obj.text();
  return JSON.parse(text) as Job;
}

export async function putJob(env: StorageEnv, job: Job): Promise<void> {
  await env.R2_BUCKET.put(`jobs/${job.jobId}.json`, JSON.stringify(job), {
    httpMetadata: { contentType: 'application/json' },
  });
}

export async function listCompletedJobs(env: StorageEnv, limit = 20): Promise<Job[]> {
  const list = await env.R2_BUCKET.list({ prefix: 'jobs/' });
  const jobs: Job[] = [];
  for (const item of list.objects.slice(0, limit)) {
    const obj = await env.R2_BUCKET.get(item.key);
    if (!obj) continue;
    const job = JSON.parse(await obj.text()) as Job;
    if (job.status === 'complete') jobs.push(job);
  }
  return jobs;
}

export async function getRateLimit(env: StorageEnv, ip: string, date: string): Promise<number> {
  const obj = await env.R2_BUCKET.get(`rate:${ip}:${date}.json`);
  if (!obj) return 0;
  return JSON.parse(await obj.text()) as number;
}

export async function incrementRateLimit(env: StorageEnv, ip: string, date: string): Promise<void> {
  const current = await getRateLimit(env, ip, date);
  await env.R2_BUCKET.put(`rate:${ip}:${date}.json`, JSON.stringify(current + 1), {
    httpMetadata: { contentType: 'application/json' },
  });
}
