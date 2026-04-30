import { ClaudeExportSchema, type Portfolio, type Prompt } from "@/lib/validators";

export function parseClaudeExport(raw: unknown): Portfolio | null {
  try {
    const parsed = ClaudeExportSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Claude export validation failed:", parsed.error.flatten());
      return null;
    }

    const data = parsed.data;
    const conversations = data.conversations ?? [];
    if (conversations.length === 0) {
      return null;
    }

    const conversation = conversations[0];
    const messages = conversation.messages ?? [];

    const prompts: Prompt[] = messages
      .filter((m) => m.sender === "human" && m.text && m.text.trim().length > 0)
      .map((m, index) => ({
        id: m.uuid || `prompt-${index}`,
        title: conversation.name || "Untitled Prompt",
        body: m.text.trim(),
        createdAt: m.created_at,
      }));

    if (prompts.length === 0) {
      return null;
    }

    const slug = conversation.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "untitled";

    return {
      slug,
      title: conversation.name,
      author: undefined,
      bio: undefined,
      prompts,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    };
  } catch (err) {
    console.error("Claude parser crashed:", err);
    return null;
  }
}
