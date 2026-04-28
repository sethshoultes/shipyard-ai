export interface QueueMessage {
  jobId: string;
  url: string;
}

export async function enqueueRenderJob(
  queue: Queue,
  message: QueueMessage
): Promise<void> {
  await queue.send(message);
}
