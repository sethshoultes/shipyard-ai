import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Event schema for NDJSON storage
 */
export interface TraceEventRecord {
  id: string;
  type: 'span' | 'tool' | 'thought';
  name: string;
  timestamp: string; // ISO8601 format
  duration?: number; // milliseconds, null for thought/tool
  input?: unknown; // tool/span only
  output?: unknown; // tool/span only
  content?: string; // thought only
  error?: string; // span only, if thrown
  parentId?: string;
}

/**
 * NDJSONWriter persists trace events to .trace/sessions/{sessionId}.ndjson
 * One JSON object per line, no array wrapping.
 * Uses only Node.js fs module - zero external dependencies.
 */
export class NDJSONWriter {
  private sessionId: string;
  private filePath: string;

  /**
   * Initialize NDJSONWriter
   * @param sessionId - Unique session identifier (ISO8601 timestamp format for human readability)
   * @param baseDir - Base directory for trace storage
   */
  constructor(sessionId: string, baseDir: string) {
    this.sessionId = sessionId;

    // Create directory structure: baseDir/.trace/sessions/
    const traceDir = join(baseDir, '.trace');
    const sessionsDir = join(traceDir, 'sessions');

    // Ensure directories exist (recursive: true for cross-platform compatibility)
    mkdirSync(sessionsDir, { recursive: true });

    // Set file path: baseDir/.trace/sessions/{sessionId}.ndjson
    this.filePath = join(sessionsDir, `${sessionId}.ndjson`);
  }

  /**
   * Write an event to the NDJSON file
   * Appends JSON.stringify(event) + '\n' to file
   * Uses sync writes to prevent interleaving
   * @param event - TraceEventRecord to persist
   */
  public write(event: TraceEventRecord): void {
    // Ensure timestamp is ISO8601 string format
    if (typeof event.timestamp !== 'string') {
      throw new Error('Event timestamp must be ISO8601 string format');
    }

    // Serialize event to JSON and append with newline
    const jsonLine = JSON.stringify(event);
    appendFileSync(this.filePath, jsonLine + '\n', 'utf8');
  }

  /**
   * Flush pending writes (no-op for sync writes, exists for future async support)
   */
  public flush(): void {
    // No-op: fs.appendFileSync is synchronous, so writes are already flushed
  }

  /**
   * Close the writer and perform cleanup (currently no-op, for future streaming support)
   */
  public close(): void {
    // No-op: No resources held, but method exists for future async support
  }

  /**
   * Get the file path for this session
   */
  public getFilePath(): string {
    return this.filePath;
  }

  /**
   * Get the session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

/**
 * Generate a human-readable session ID using ISO8601 timestamp
 * Format: YYYY-MM-DDTHH-mm-ss-sss
 * @returns ISO8601-based session ID string
 */
export function generateSessionId(): string {
  const now = new Date();

  // Format: YYYY-MM-DDTHH-mm-ss-sss
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}-${milliseconds}`;
}
