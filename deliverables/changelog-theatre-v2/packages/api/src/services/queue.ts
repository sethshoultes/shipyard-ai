import type { QueueMessage } from '../types.js';

export interface QueueEnv {
  JOB_QUEUE: Queue;
}

export async function enqueueRender(env: QueueEnv, message: QueueMessage): Promise<void> {
  await env.JOB_QUEUE.send(message);
}
