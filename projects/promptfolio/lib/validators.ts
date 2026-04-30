import { z } from "zod";

export const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Prompt title is required"),
  body: z.string().min(1, "Prompt body is required"),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

export const PortfolioSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only"),
  title: z.string().min(1, "Portfolio title is required"),
  author: z.string().optional(),
  bio: z.string().optional(),
  prompts: z.array(PromptSchema).min(1, "At least one prompt is required"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClaudeMessageSchema = z.object({
  uuid: z.string(),
  text: z.string(),
  sender: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ClaudeConversationSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  messages: z.array(ClaudeMessageSchema).optional(),
});

export const ClaudeExportSchema = z.object({
  conversations: z.array(ClaudeConversationSchema).optional(),
});

export const ExportPayloadSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const OGImageQuerySchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(1),
});

export type Prompt = z.infer<typeof PromptSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type ClaudeExport = z.infer<typeof ClaudeExportSchema>;
export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
