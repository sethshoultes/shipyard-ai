interface Env {
  AFTERCARE_KV: KVNamespace;
  FROM_EMAIL: string;
}

interface ProjectData {
  email: string;
  name: string;
  project_url: string;
  ship_date: string;
  project_name?: string;
  unsubscribed?: boolean;
}

export default {
  // Scheduled handler - runs on cron trigger (daily at UTC midnight)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Daily check for projects hitting Day 7, 30, 90, 180, 365
    // Send emails via Resend API
    // Implementation in Wave 2
  },

  // HTTP handler - serves GET /unsub unsubscribe endpoint
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle unsubscribe requests
    if (url.pathname === "/unsub" && request.method === "GET") {
      // Parse token and mark email as unsubscribed in KV
      // Implementation in Wave 2
      return new Response("Unsubscribe successful", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
};
