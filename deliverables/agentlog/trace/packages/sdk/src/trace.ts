import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { join } from "path";
import { Span, SpanEvent } from "./span.js";
import { NDJSONWriter, generateSessionId, TraceEventRecord } from "./writer.js";

export interface ToolEvent {
  type: "tool";
  id: string;
  timestamp: number;
  name: string;
  input: unknown;
  output: unknown;
}

export interface ThoughtEvent {
  type: "thought";
  id: string;
  timestamp: number;
  content: string;
}

export type TraceEvent = SpanEvent | ToolEvent | ThoughtEvent;

/**
 * TraceInstance returned by init() with all tracing methods
 */
export interface TraceInstance {
  span<T>(name: string, fn: () => Promise<T>): Promise<T>;
  tool(name: string, input: unknown, output: unknown): void;
  thought(content: string): void;
  getSessionId(): string;
  flush(): void;
}

/**
 * Initialize the trace SDK for a project
 * Creates .trace/sessions/ directory and returns a TraceInstance
 *
 * @param projectName - Name of the project (must be non-empty)
 * @returns TraceInstance with span, tool, thought methods
 */
export function init(projectName: string): TraceInstance {
  // Validate projectName is non-empty
  if (!projectName || typeof projectName !== "string" || projectName.trim() === "") {
    throw new Error("projectName must be a non-empty string");
  }

  // Create .trace/sessions/ directory (cross-platform compatible)
  const baseDir = process.cwd();
  const sessionsDir = join(baseDir, ".trace", "sessions");
  mkdirSync(sessionsDir, { recursive: true });

  // Create session with human-readable ID
  const sessionId = generateSessionId();
  const writer = new NDJSONWriter(sessionId, baseDir);

  // Create Trace instance
  const trace = new Trace(writer, projectName);

  return {
    span: trace.span.bind(trace),
    tool: trace.tool.bind(trace),
    thought: trace.thought.bind(trace),
    getSessionId: () => sessionId,
    flush: () => writer.flush(),
  };
}

export class Trace {
  private writer: NDJSONWriter;
  private projectName: string;
  private currentSpan?: Span;
  private spanStack: Span[] = [];

  constructor(writer: NDJSONWriter, projectName: string) {
    this.writer = writer;
    this.projectName = projectName;
  }

  /**
   * Wraps an async operation in a span that captures start, end, and error events.
   * Supports nested spans by maintaining a stack of current spans.
   */
  async span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const parentId = this.currentSpan?.getId();
    const span = new Span(name, parentId);

    // Push current span to stack
    if (this.currentSpan) {
      this.spanStack.push(this.currentSpan);
    }
    this.currentSpan = span;

    try {
      span.start();
      this.writeEvent(span.toStartEvent());

      const result = await fn();

      span.end();
      this.writeEvent(span.toEndEvent());

      return result;
    } catch (error) {
      span.setError(error instanceof Error ? error : new Error(String(error)));
      span.end();
      this.writeEvent(span.toErrorEvent());
      throw error;
    } finally {
      // Pop span from stack and restore previous span
      if (this.spanStack.length > 0) {
        this.currentSpan = this.spanStack.pop();
      } else {
        this.currentSpan = undefined;
      }
    }
  }

  /**
   * Records a tool invocation with input and output.
   * Tool events are created with timestamps and JSON serializable data.
   */
  tool(name: string, input: unknown, output: unknown): void {
    const event: TraceEventRecord = {
      id: randomUUID(),
      type: "tool",
      name,
      timestamp: new Date().toISOString(),
      input,
      output,
    };
    this.writer.write(event);
  }

  /**
   * Records an agent thought or reasoning step.
   * Thought events capture the reasoning content as a string.
   */
  thought(content: string): void {
    const event: TraceEventRecord = {
      id: randomUUID(),
      type: "thought",
      name: "thought",
      timestamp: new Date().toISOString(),
      content,
    };
    this.writer.write(event);
  }

  /**
   * Convert span event to record format and write to NDJSON
   */
  private writeEvent(spanEvent: SpanEvent): void {
    const record: TraceEventRecord = {
      id: spanEvent.spanId,
      type: "span",
      name: spanEvent.name,
      timestamp: new Date(spanEvent.timestamp).toISOString(),
      parentId: spanEvent.parentId,
      duration: spanEvent.duration,
      error: spanEvent.errorMessage,
    };
    this.writer.write(record);
  }
}
