/**
 * Aura Validators
 *
 * Zod schemas for validating portfolio data structures.
 * These schemas ensure type safety and provide helpful error messages.
 */

import { z } from 'zod';

/**
 * Schema for validating a single prompt
 */
export const promptSchema = z.object({
  id: z.string().uuid('Prompt ID must be a valid UUID'),
  content: z.string().min(1, 'Prompt content cannot be empty'),
  response: z.string().min(1, 'Response content cannot be empty'),
  timestamp: z.string().datetime('Timestamp must be a valid ISO datetime'),
  title: z.string().optional(),
  metadata: z
    .object({
      model: z.string().optional(),
      tokens: z.number().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for validating OG image metadata
 */
export const ogImageMetadataSchema = z.object({
  path: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  alt: z.string(),
});

/**
 * Schema for validating a portfolio
 */
export const portfolioSchema = z.object({
  id: z.string().uuid('Portfolio ID must be a valid UUID'),
  title: z.string().min(1, 'Portfolio title cannot be empty'),
  prompts: z.array(promptSchema).min(1, 'Portfolio must have at least one prompt'),
  createdAt: z.string().datetime('Creation timestamp must be a valid ISO datetime'),
  ogImage: ogImageMetadataSchema.optional(),
});

/**
 * Schema for validating Claude conversation turns
 */
export const claudeTurnSchema = z.object({
  role: z.enum(['human', 'assistant'], {
    errorMap: () => ({ message: 'Role must be either "human" or "assistant"' }),
  }),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().datetime().optional(),
  metadata: z
    .object({
      model: z.string().optional(),
      tokens: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for validating Claude export format
 */
export const claudeExportSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().datetime().optional(),
  title: z.string().optional(),
  conversation: z.array(claudeTurnSchema).min(1, 'Export must contain at least one message'),
  metadata: z
    .object({
      model: z.string().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
});

/**
 * Type inference from schemas
 */
export type PromptInput = z.infer<typeof promptSchema>;
export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type ClaudeTurnInput = z.infer<typeof claudeTurnSchema>;
export type ClaudeExportInput = z.infer<typeof claudeExportSchema>;

/**
 * Validation helper for portfolios
 */
export function validatePortfolio(data: unknown): { valid: boolean; error?: string } {
  const result = portfolioSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors.map((e) => e.message).join(', '),
    };
  }
  return { valid: true };
}

/**
 * Validation helper for Claude exports
 */
export function validateClaudeExport(data: unknown): { valid: boolean; error?: string } {
  const result = claudeExportSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors.map((e) => e.message).join(', '),
    };
  }
  return { valid: true };
}
