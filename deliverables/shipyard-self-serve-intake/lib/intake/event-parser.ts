/**
 * GitHub Webhook Event Parser & Validator
 * Extracts and validates relevant data from GitHub webhook payloads.
 *
 * This module implements REQ-INFRA-004 and handles edge cases per Decision 7 (fail gracefully).
 * Prevents malformed events from crashing the system (RISK-009) by validating required fields
 * and handling edge cases gracefully (empty body, emoji-only content, etc.).
 */

/**
 * Parsed GitHub Issue Event
 * Represents validated data extracted from a GitHub webhook payload
 */
export interface GitHubIssueEvent {
  // Core fields
  issue_id: number;
  title: string;
  body: string;

  // Metadata
  labels: string[];
  created_by: string;
  repo_name: string;

  // Raw content for audit trail
  raw_content: string;

  // Additional metadata
  issue_url?: string;
  html_url?: string;
}

/**
 * Validation error for webhook payloads
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly reason: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Parse GitHub webhook payload and extract relevant data
 *
 * Implements edge case handling per RISK-009:
 * - Empty body → set to empty string
 * - Emoji-only body → log warning
 * - Missing optional fields → use defaults
 * - Malformed JSON → throw ValidationError
 *
 * @param payload The raw GitHub webhook payload
 * @returns Validated ParsedIssueEvent
 * @throws ValidationError if required fields are missing
 */
export function parseGitHubWebhook(payload: unknown): GitHubIssueEvent {
  // Step 3: Extract core fields
  const issue = getIssueObject(payload);
  const repository = getRepositoryObject(payload);

  const issue_id = issue.number;
  const title = issue.title;
  const body = issue.body ?? ""; // Handle empty/undefined body
  const html_url = issue.html_url;

  // Step 4: Extract metadata
  const labels = extractLabels(issue.labels);
  const created_by = issue.user?.login ?? "unknown";
  const repo_name = repository.full_name;

  // Step 5: Validate required fields
  validateRequiredFields(title, repo_name);

  // Step 6: Handle edge cases
  const processedBody = handleBodyEdgeCases(body, title);

  // Step 7: Store raw content unchanged for audit trail
  const raw_content = JSON.stringify(issue);

  // Step 8: Return validated object
  return {
    issue_id,
    title,
    body: processedBody,
    labels,
    created_by,
    repo_name,
    raw_content,
    issue_url: html_url,
    html_url,
  };
}

/**
 * Safely extract the issue object from payload
 */
function getIssueObject(payload: unknown): any {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError(
      "Payload must be a valid object",
      "payload",
      "Payload is not an object"
    );
  }

  const issueObj = (payload as any).issue;
  if (!issueObj || typeof issueObj !== "object") {
    throw new ValidationError(
      "Webhook payload missing issue object",
      "issue",
      "issue field not found or invalid"
    );
  }

  return issueObj;
}

/**
 * Safely extract the repository object from payload
 */
function getRepositoryObject(payload: unknown): any {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError(
      "Payload must be a valid object",
      "payload",
      "Payload is not an object"
    );
  }

  const repoObj = (payload as any).repository;
  if (!repoObj || typeof repoObj !== "object") {
    throw new ValidationError(
      "Webhook payload missing repository object",
      "repository",
      "repository field not found or invalid"
    );
  }

  return repoObj;
}

/**
 * Extract label names from issue labels array
 * Handles edge case where labels might be undefined or malformed
 */
function extractLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) {
    return [];
  }

  return labels
    .map((label: any) => {
      if (typeof label === "object" && label !== null && "name" in label) {
        return String(label.name);
      }
      return null;
    })
    .filter((name): name is string => name !== null);
}

/**
 * Validate that required fields are present
 * Throws ValidationError if validation fails
 */
function validateRequiredFields(title: string, repo_name: string): void {
  // Validate title
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new ValidationError(
      "Issue title is required",
      "title",
      "title is missing or empty"
    );
  }

  // Validate repo_name
  if (
    !repo_name ||
    typeof repo_name !== "string" ||
    repo_name.trim() === ""
  ) {
    throw new ValidationError(
      "Repository name is required",
      "repo_name",
      "repo_name is missing or empty"
    );
  }
}

/**
 * Handle edge cases in issue body
 * - Empty body → return empty string
 * - Emoji-only body → log warning, return text
 * - Body with links → extract text content
 * - Normal body → return as-is
 */
function handleBodyEdgeCases(body: string, issueTitle: string): string {
  // Edge case 1: Empty body
  if (!body || body.trim() === "") {
    return "";
  }

  // Edge case 2: Emoji-only body detection
  const emojiOnlyMatch = body.match(/^[\s\p{Emoji}\p{Emoji_Component}]+$/u);
  if (emojiOnlyMatch) {
    console.warn("Edge case detected: issue body contains only emoji", {
      issue_title: issueTitle,
      body_preview: body.substring(0, 100),
    });
    return "";
  }

  // Edge case 3: Body with markdown links - extract URL text
  // This preserves readability while extracting content
  let processedBody = body;

  // Extract text from markdown links [text](url)
  processedBody = processedBody.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Extract text from HTML links <a href="...">text</a>
  processedBody = processedBody.replace(/<a\s+href="[^"]*"[^>]*>([^<]+)<\/a>/gi, "$1");

  return processedBody;
}

/**
 * Validate GitHub webhook payload structure
 * Used for early validation before parsing
 *
 * @param payload Raw payload to validate
 * @returns true if payload structure is valid
 */
export function isValidWebhookPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const p = payload as any;

  // Check for required top-level objects
  if (!p.issue || typeof p.issue !== "object") {
    return false;
  }

  if (!p.repository || typeof p.repository !== "object") {
    return false;
  }

  // Check for required issue fields
  if (
    typeof p.issue.number !== "number" ||
    typeof p.issue.title !== "string"
  ) {
    return false;
  }

  // Check for required repository fields
  if (typeof p.repository.full_name !== "string") {
    return false;
  }

  return true;
}
