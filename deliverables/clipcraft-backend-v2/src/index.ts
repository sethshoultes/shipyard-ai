import { insertJob, getJob } from "./db";
import { enqueueRenderJob } from "./queue-producer";

export interface Env {
  RENDER_OUTPUT: R2Bucket;
  RENDER_CACHE: R2Bucket;
  RENDER_DB: D1Database;
  RENDER_QUEUE: Queue;
  OPENAI_API_KEY: string;
  R2_PUBLIC_URL?: string;
}

function generateJobId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      if (pathname === "/health" && request.method === "GET") {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (pathname === "/api/render" && request.method === "POST") {
        const body = (await request.json()) as { url?: string };
        const targetUrl = body?.url;
        if (!targetUrl || typeof targetUrl !== "string") {
          return new Response(
            JSON.stringify({ error: "Missing or invalid 'url' field" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const jobId = generateJobId();
        await insertJob(env.RENDER_DB, {
          jobId,
          url: targetUrl,
          status: "pending",
          outputUrl: null,
          error: null,
        });
        await enqueueRenderJob(env.RENDER_QUEUE, { jobId, url: targetUrl });

        return new Response(JSON.stringify({ jobId }), {
          status: 202,
          headers: corsHeaders,
        });
      }

      if (pathname.startsWith("/api/render/") && request.method === "GET") {
        const jobId = pathname.slice("/api/render/".length);
        const job = await getJob(env.RENDER_DB, jobId);
        if (!job) {
          return new Response(JSON.stringify({ error: "Job not found" }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(
          JSON.stringify({
            jobId: job.jobId,
            status: job.status,
            output_url: job.outputUrl,
            error: job.error,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Fallback route for existing frontend compatibility
      if (pathname === "/api/download" && request.method === "GET") {
        const jobId = url.searchParams.get("jobId");
        if (!jobId) {
          return new Response(JSON.stringify({ error: "Missing jobId" }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const job = await getJob(env.RENDER_DB, jobId);
        if (!job) {
          return new Response(JSON.stringify({ error: "Job not found" }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        return new Response(
          JSON.stringify({
            jobId: job.jobId,
            status: job.status,
            url: job.outputUrl,
            error: job.error,
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err?.message ?? "Internal server error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
