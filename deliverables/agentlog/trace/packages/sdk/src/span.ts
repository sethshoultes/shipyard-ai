import { randomUUID } from "crypto";

export interface SpanEvent {
  type: "span_start" | "span_end" | "span_error";
  spanId: string;
  parentId?: string;
  name: string;
  timestamp: number;
  duration?: number;
  errorMessage?: string;
  errorStack?: string;
}

export class Span {
  private id: string;
  private name: string;
  private parentId?: string;
  private startTime?: number;
  private endTime?: number;
  private error?: Error;

  constructor(name: string, parentId?: string) {
    this.id = randomUUID();
    this.name = name;
    this.parentId = parentId;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getParentId(): string | undefined {
    return this.parentId;
  }

  start(): void {
    this.startTime = Date.now();
  }

  end(): void {
    if (!this.startTime) {
      throw new Error("Span must be started before ending");
    }
    this.endTime = Date.now();
  }

  setError(error: Error): void {
    this.error = error;
  }

  getDuration(): number {
    if (!this.startTime || !this.endTime) {
      throw new Error("Span must be started and ended to get duration");
    }
    return this.endTime - this.startTime;
  }

  getStartTime(): number | undefined {
    return this.startTime;
  }

  getEndTime(): number | undefined {
    return this.endTime;
  }

  getError(): Error | undefined {
    return this.error;
  }

  toStartEvent(): SpanEvent {
    if (!this.startTime) {
      throw new Error("Span must be started to create start event");
    }
    return {
      type: "span_start",
      spanId: this.id,
      parentId: this.parentId,
      name: this.name,
      timestamp: this.startTime,
    };
  }

  toEndEvent(): SpanEvent {
    if (!this.startTime || !this.endTime) {
      throw new Error("Span must be started and ended to create end event");
    }
    return {
      type: "span_end",
      spanId: this.id,
      parentId: this.parentId,
      name: this.name,
      timestamp: this.endTime,
      duration: this.getDuration(),
    };
  }

  toErrorEvent(): SpanEvent {
    if (!this.startTime) {
      throw new Error("Span must be started to create error event");
    }
    if (!this.error) {
      throw new Error("Span must have an error to create error event");
    }
    return {
      type: "span_error",
      spanId: this.id,
      parentId: this.parentId,
      name: this.name,
      timestamp: this.endTime || Date.now(),
      errorMessage: this.error.message,
      errorStack: this.error.stack,
    };
  }
}
