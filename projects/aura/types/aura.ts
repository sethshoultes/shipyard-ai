/**
 * Aura Domain Types
 *
 * Core type definitions for the Aura portfolio generator.
 * These types represent the domain model for portfolios generated from Claude exports.
 */

/**
 * A single prompt extracted from a Claude conversation
 */
export interface Prompt {
  /** Unique identifier for the prompt */
  id: string;
  /** The user's prompt text */
  content: string;
  /** Claude's response to the prompt */
  response: string;
  /** Timestamp when the prompt was created */
  timestamp: string;
  /** Optional title extracted from content or generated */
  title?: string;
  /** Metadata about the conversation turn */
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
  };
}

/**
 * A portfolio generated from a Claude export
 */
export interface Portfolio {
  /** Unique identifier (UUID) for the portfolio */
  id: string;
  /** Title of the portfolio (derived from first prompt or default) */
  title: string;
  /** Collection of prompts in the portfolio */
  prompts: Prompt[];
  /** Timestamp when the portfolio was created */
  createdAt: string;
  /** OG image metadata */
  ogImage?: OGImageMetadata;
}

/**
 * Metadata for pre-generated OG images
 */
export interface OGImageMetadata {
  /** Path to the OG image file */
  path: string;
  /** Width of the OG image */
  width: number;
  /** Height of the OG image */
  height: number;
  /** Alt text for accessibility */
  alt: string;
}

/**
 * Raw Claude export format (what users export from Claude)
 * This represents the structure of Claude's conversation export JSON
 */
export interface ClaudeExport {
  /** Export format version */
  version?: string;
  /** Export timestamp */
  exportedAt?: string;
  /** The conversation title */
  title?: string;
  /** Array of conversation turns */
  conversation: ClaudeConversationTurn[];
  /** Optional metadata about the export */
  metadata?: {
    model?: string;
    totalTokens?: number;
  };
}

/**
 * A single turn in a Claude conversation
 */
export interface ClaudeConversationTurn {
  /** Role of the speaker: 'human' or 'assistant' */
  role: 'human' | 'assistant';
  /** The message content */
  content: string;
  /** Timestamp of the message */
  timestamp?: string;
  /** Optional metadata */
  metadata?: {
    model?: string;
    tokens?: number;
  };
}

/**
 * Result of parsing a Claude export
 */
export interface ParseResult {
  /** Whether the parse was successful */
  success: boolean;
  /** The parsed portfolio (if successful) */
  portfolio?: Portfolio;
  /** Error message (if failed) */
  error?: string;
  /** Error details for debugging */
  errorDetails?: unknown;
}

/**
 * Generation result after creating a portfolio
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** The generated portfolio */
  portfolio?: Portfolio;
  /** URL to the deployed portfolio */
  url?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Props for OG image generation
 */
export interface OGImageProps {
  /** Portfolio title */
  title: string;
  /** First prompt content (truncated for display) */
  promptPreview: string;
  /** Creation date */
  createdAt: string;
  /** Aura branding */
  branding: 'Aura';
}
