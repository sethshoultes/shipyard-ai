// Bootstrap Cloudflare Worker — Streaming LLM Inference
// Works out of the box with the Cloudflare Workers AI binding

export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse request body for prompt or messages
    let prompt: string;
    try {
      const body = await request.json<{ prompt?: string; messages?: Array<{ role: string; content: string }> }>();
      if (body.messages && body.messages.length > 0) {
        prompt = body.messages[body.messages.length - 1].content;
      } else if (body.prompt) {
        prompt = body.prompt;
      } else {
        return new Response(JSON.stringify({ error: "Missing prompt or messages" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream response from Cloudflare Workers AI
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [{ role: "user", content: prompt }],
            stream: true,
          });

          for await (const chunk of response) {
            if (chunk.response) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.response })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
