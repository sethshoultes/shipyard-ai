import Queue from "bull";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Render job queue using Bull backed by Redis.
 * Concurrency is capped to floor(RAM_GB / 1) to prevent server crashes.
 */
export const renderQueue = new Queue("render", redisUrl, {
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

function getConcurrencyCap(): number {
  const memGB = Math.floor((process.memoryUsage().heapTotal || 0) / 1024 / 1024 / 1024);
  const safeCap = Math.max(1, Math.floor(memGB / 1));
  return safeCap;
}

export const MAX_CONCURRENT_RENDERS = getConcurrencyCap();

export function startQueueWorkers(
  processor: (job: Queue.Job) => Promise<any>
) {
  renderQueue.process(MAX_CONCURRENT_RENDERS, processor);
}

export async function getJobStatus(jobId: string) {
  const job = await renderQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    id: job.id,
    state,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}
