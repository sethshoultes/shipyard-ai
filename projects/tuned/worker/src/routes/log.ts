interface LogEvent {
  promptName: string;
  version: number;
  timestamp: string;
  event: "read" | "error";
}

/**
 * Handle POST /log - Async logging endpoint
 *
 * This endpoint accepts log events from the SDK and processes them asynchronously.
 * The response is immediate (fire-and-forget) to avoid blocking prompt delivery.
 *
 * For MVP: Events are console.logged
 * Analytics Engine integration will be added in v1.1
 *
 * @param request - The incoming request containing the log event payload
 * @param ctx - Execution context used to schedule async tasks via waitUntil
 * @param origin - CORS origin for response headers
 * @returns Immediate 200 response (processing happens async)
 */
export async function handlePostLog(
  request: Request,
  ctx: ExecutionContext,
  origin: string
): Promise<Response> {
  try {
    const logEvent: LogEvent = await request.json();

    // Validate required fields
    if (
      !logEvent.promptName ||
      typeof logEvent.version !== "number" ||
      !logEvent.timestamp ||
      !["read", "error"].includes(logEvent.event)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid log event: missing or invalid fields",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
          },
        }
      );
    }

    // Schedule async processing (fire-and-forget)
    // The response is returned immediately, but processing continues in the background
    ctx.waitUntil(
      (async () => {
        try {
          // MVP: Console.log the event
          console.log(
            `[LOG] Event: ${logEvent.event} | Prompt: ${logEvent.promptName} v${logEvent.version} | Time: ${logEvent.timestamp}`
          );

          // TODO: v1.1 - Analytics Engine integration
          // Send to Cloudflare Analytics Engine for durable storage:
          // 1. Use ctx.env.LOGS (Analytics Engine binding)
          // 2. Batch events in memory before sending
          // 3. Implement exponential backoff for failed writes
          // Example (future):
          // await ctx.env.LOGS.writeDataPoint({
          //   indexes: [logEvent.promptName, logEvent.event],
          //   blobs: [logEvent.timestamp],
          // });
        } catch (asyncError) {
          // Log async processing errors without blocking the response
          console.error("[LOG] Async processing error:", asyncError);
        }
      })()
    );

    // Return 200 immediately (fire-and-forget)
    return new Response(
      JSON.stringify({
        message: "Log event received",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  } catch (error) {
    console.error("[LOG] Request parsing error:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid JSON payload",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  }
}
