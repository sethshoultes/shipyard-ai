import { Hono } from 'hono';
import { fetchCommits } from '../services/github.js';
import { generateNarrative } from '../services/narrative.js';
import { generateSpeech } from '../services/tts.js';
import { enqueueRender } from '../services/queue.js';
import { putJob, getRateLimit, incrementRateLimit } from '../services/storage.js';
import type { ChangelogRequest, Job, QueueMessage } from '../types.js';

const jobs = new Hono();

function generateJobId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getClientIP(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP') ?? 'unknown';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

jobs.post('/api/changelog', async (c) => {
  const env = c.env as {
    R2_BUCKET: R2Bucket;
    JOB_QUEUE: Queue;
    GITHUB_TOKEN: string;
    OPENAI_API_KEY: string;
  };

  const body = (await c.req.json()) as ChangelogRequest;

  if (!body.repo || !body.since || !body.until) {
    return c.json({ error: 'Missing required fields: repo, since, until' }, 400);
  }

  const ip = getClientIP(c);
  const date = today();
  const rate = await getRateLimit({ R2_BUCKET: env.R2_BUCKET }, ip, date);
  if (rate >= 3) {
    return c.json({ error: 'Daily render limit reached. Try again tomorrow.' }, 429);
  }

  const jobId = generateJobId();
  const job: Job = {
    jobId,
    repo: body.repo,
    since: body.since,
    until: body.until,
    status: 'fetching',
    createdAt: new Date().toISOString(),
    outputUrl: null,
    error: null,
    voice: body.voice ?? 'alloy',
  };

  await putJob({ R2_BUCKET: env.R2_BUCKET }, job);
  await incrementRateLimit({ R2_BUCKET: env.R2_BUCKET }, ip, date);

  try {
    const commits = await fetchCommits(
      { GITHUB_TOKEN: env.GITHUB_TOKEN },
      body.repo,
      body.since,
      body.until
    );

    job.status = 'narrating';
    await putJob({ R2_BUCKET: env.R2_BUCKET }, job);

    const script = await generateNarrative({ OPENAI_API_KEY: env.OPENAI_API_KEY }, commits);
    job.script = script;

    const fullText = script.map((s) => s.text).join(' ');
    const audioBuffer = await generateSpeech(
      { OPENAI_API_KEY: env.OPENAI_API_KEY },
      fullText,
      job.voice
    );

    const audioKey = `jobs/${jobId}/audio.mp3`;
    await env.R2_BUCKET.put(audioKey, audioBuffer, {
      httpMetadata: { contentType: 'audio/mpeg' },
    });
    const audioUrl = `${c.env.API_BASE}/cdn/${audioKey}`;
    job.audioUrl = audioUrl;

    job.status = 'rendering';
    await putJob({ R2_BUCKET: env.R2_BUCKET }, job);

    const queueMessage: QueueMessage = {
      jobId,
      repo: body.repo,
      since: body.since,
      until: body.until,
      voice: job.voice,
      script,
      audioUrl,
    };
    await enqueueRender({ JOB_QUEUE: env.JOB_QUEUE }, queueMessage);

    return c.json({ jobId });
  } catch (err) {
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    await putJob({ R2_BUCKET: env.R2_BUCKET }, job);
    return c.json({ error: job.error }, 500);
  }
});

export default jobs;
