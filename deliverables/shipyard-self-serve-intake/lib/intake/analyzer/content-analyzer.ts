/**
 * Content Extraction & Analysis Module
 * Extracts and structures key information from GitHub issue body and metadata
 * Feeds the PRD generator in Wave 3
 *
 * Features:
 * - Extract title from issue
 * - Extract description (first 500 chars or first paragraph)
 * - Preserve raw_content for audit trail
 * - Handle multi-line content and code blocks gracefully
 * - Extract and store links without dominating description
 */

export interface ParsedEvent {
  title: string;
  body?: string;
  raw_content?: any;
  labels?: Array<{ name: string }>;
  number?: number;
  user?: { login: string };
  html_url?: string;
}

export interface AnalyzedContent {
  title: string;
  description: string;
  raw_content: any;
  request_type: "bug" | "feature" | "enhancement" | "docs" | "unknown";
  extracted_links: string[];
  code_blocks: CodeBlock[];
  metadata: {
    issue_number?: number;
    author?: string;
    issue_url?: string;
    label_count: number;
  };
}

export interface CodeBlock {
  language: string;
  content: string;
}

/**
 * Extracts links from text content
 * Returns array of unique URLs found in the text
 */
function extractLinks(content: string): string[] {
  const urlRegex =
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)/g;
  const matches = content.match(urlRegex) || [];
  // Return unique URLs
  return Array.from(new Set(matches));
}

/**
 * Extracts code blocks from markdown content
 * Handles triple-backtick code blocks with optional language specification
 */
function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      content: match[2].trim(),
    });
  }

  return codeBlocks;
}

/**
 * Infers request type from keywords in the content
 * Priority: bug > feature > enhancement > docs > unknown
 */
function inferRequestType(
  title: string,
  body: string
): "bug" | "feature" | "enhancement" | "docs" | "unknown" {
  const lowerContent = `${title} ${body}`.toLowerCase();

  // Check for bug keywords
  if (
    /\bbug\b|\berror\b|\ncrash\b|\nbroken\b|\nnot\s+work/i.test(lowerContent)
  ) {
    return "bug";
  }

  // Check for feature keywords
  if (
    /\bfeature\b|\badd\s+support\b|\bnew\s+capability\b|\brequesting\s+feature\b/i.test(
      lowerContent
    )
  ) {
    return "feature";
  }

  // Check for enhancement keywords
  if (/\benhance\b|\bimprove\b|\boptimize\b|\bupgrade\b/i.test(lowerContent)) {
    return "enhancement";
  }

  // Check for documentation keywords
  if (
    /\bdocumentation\b|\bdocs\b|\bREADME\b|\bguide\b|\btutorial\b/i.test(
      lowerContent
    )
  ) {
    return "docs";
  }

  return "unknown";
}

/**
 * Extracts first paragraph from content (up to double newline)
 */
function getFirstParagraph(content: string): string {
  if (!content) return "";

  // Split by double newline (paragraph break)
  const paragraphs = content.split(/\n\n+/);
  const firstParagraph = paragraphs[0].trim();

  return firstParagraph;
}

/**
 * Extracts description from issue body
 * Strategy: first 500 chars or first paragraph, whichever is shorter
 * Excludes links and code blocks to prevent them from dominating the description
 */
function extractDescription(body: string): string {
  if (!body) return "";

  // Get first paragraph
  const firstParagraph = getFirstParagraph(body);

  // If first paragraph is less than 500 chars, use it
  if (firstParagraph.length <= 500) {
    return firstParagraph;
  }

  // Otherwise, truncate to 500 chars
  return firstParagraph.substring(0, 500).trim() + "...";
}

/**
 * Main content analyzer function
 * Takes parsed GitHub event and returns structured analyzed content
 */
export function analyzeContent(parsedEvent: ParsedEvent): AnalyzedContent {
  if (!parsedEvent.title) {
    throw new Error("parsedEvent.title is required");
  }

  const body = parsedEvent.body || "";
  const title = parsedEvent.title.trim();
  const description = extractDescription(body);
  const extracted_links = extractLinks(body);
  const code_blocks = extractCodeBlocks(body);
  const request_type = inferRequestType(title, body);

  return {
    title,
    description,
    raw_content: parsedEvent.raw_content || parsedEvent,
    request_type,
    extracted_links,
    code_blocks,
    metadata: {
      issue_number: parsedEvent.number,
      author: parsedEvent.user?.login,
      issue_url: parsedEvent.html_url,
      label_count: parsedEvent.labels?.length || 0,
    },
  };
}
