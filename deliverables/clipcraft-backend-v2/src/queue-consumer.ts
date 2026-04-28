import { renderPipeline, type RenderJobPayload } from "./render";
import { updateJobStatus } from "./db";

export interface QueueEnv {
  RENDER_OUTPUT: R2Bucket;
  RENDER_CACHE: R2Bucket;
  RENDER_DB: D1Database;
  RENDER_QUEUE: Queue;
  OPENAI_API_KEY: string;
  R2_PUBLIC_URL?: string;
}

export default {
  async queue(batch: MessageBatch<RenderJobPayload>, env: QueueEnv): Promise<void> {
    for (const message of batch.messages) {
      const { jobId, url } = message.body;
      try {
        await updateJobStatus(env.RENDER_DB, jobId, "processing", null, null);
        await renderPipeline({ jobId, url }, env);
        // renderPipeline updates status to ready on success
      } catch (err: any) {
        await updateJobStatus(
          env.RENDER_DB,
          jobId,
          "failed",
          null,
          err?.message ?? String(err)
        );
      }
    }
  },
};
