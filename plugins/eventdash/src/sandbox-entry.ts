import { definePlugin } from "emdash";

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: string;
}

/**
 * Safely parse an event value that may be double-serialized (old data) or an object (new data).
 * This function handles legacy data that was stored with JSON.stringify wrapping.
 *
 * @param value - The value retrieved from KV storage (may be string or object)
 * @returns Parsed Event object or null if invalid
 */
function parseEvent(value: unknown): Event | null {
  if (!value) return null;
  let obj: any = value;
  if (typeof obj === "string") {
    try { obj = JSON.parse(obj); } catch { return null; }
  }
  // Must have at minimum a title and date to be a valid event
  if (!obj || typeof obj !== "object" || !obj.title || !obj.date) return null;
  return obj as Event;
}

/** Load all events from KV, handling legacy data gracefully. */
async function loadEvents(kv: any): Promise<Event[]> {
  const items = await kv.list("event:");
  return (items ?? [])
    .map((item: any) => parseEvent(item.value))
    .filter((e: Event | null): e is Event => e !== null)
    .sort((a: Event, b: Event) => a.date.localeCompare(b.date));
}

function createPlugin() { return definePlugin({
  routes: {
    events: {
      public: true,
      handler: async (_routeCtx: unknown, ctx: any) => {
        return { events: await loadEvents(ctx.kv) };
      },
    },

    createEvent: {
      handler: async (routeCtx: any, ctx: any) => {
        const input = routeCtx.input as Record<string, unknown>;
        const title = String(input.title ?? "");
        const date = String(input.date ?? "");
        const description = String(input.description ?? "");

        if (!title || !date) {
          return { error: "title and date are required" };
        }

        const id = crypto.randomUUID();
        const event: Event = {
          id,
          title,
          date,
          description,
          createdAt: new Date().toISOString(),
        };

        await ctx.kv.set(`event:${id}`, event);
        return { ok: true, event };
      },
    },

    admin: {
      handler: async (routeCtx: any, ctx: any) => {
        const input = routeCtx.input as Record<string, unknown>;
        const type = String(input.type ?? "page_load");
        const page = String(input.page ?? "/events");

        // Handle create event form submission
        const actions = input.actions as Array<{ action_id: string; values?: Record<string, string> }> | undefined;
        if (type === "block_actions" && actions?.[0]?.action_id === "create_event_submit") {
          const values = actions[0].values ?? (input.values as Record<string, string> | undefined);
          if (values) {
            const id = crypto.randomUUID();
            const event: Event = {
              id,
              title: values.title ?? "",
              date: values.date ?? "",
              description: values.description ?? "",
              createdAt: new Date().toISOString(),
            };
            await ctx.kv.set(`event:${id}`, event);
            return {
              toast: { type: "success", text: "Created." },
              navigate: "/events",
            };
          }
        }

        // Create event page
        if (page === "/create") {
          return {
            blocks: [
              { type: "header", text: "Create Event" },
              {
                type: "form",
                block_id: "create_event",
                fields: [
                  { type: "text_input", action_id: "title", label: "Name" },
                  { type: "text_input", action_id: "date", label: "Date (YYYY-MM-DD)" },
                  { type: "text_input", action_id: "description", label: "Description" },
                ],
                submit: { label: "Create", action_id: "create_event_submit" },
              },
            ],
          };
        }

        // Events list page (default)
        const events = await loadEvents(ctx.kv);
        const rows = events.map((e: Event) => ({
          cells: [e.title, e.date, e.description || "-"],
        }));

        return {
          blocks: [
            { type: "header", text: "Events" },
            rows.length > 0
              ? {
                  type: "table",
                  columns: ["Name", "Date", "Description"],
                  rows,
                }
              : { type: "section", text: "No events yet." },
          ],
        };
      },
    },
  },
});
}
export { createPlugin };
export default createPlugin;

