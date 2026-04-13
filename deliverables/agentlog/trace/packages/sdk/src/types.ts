/**
 * Trace SDK type definitions
 * Defines all public TypeScript types for the SDK
 */

/**
 * SpanEvent represents a span (operation) event
 * REQ-SDK-009: Comprehensive event tracking
 */
export interface SpanEvent {
  id: string;
  type: 'span';
  name: string;
  timestamp: number;
  duration?: number;
  error?: string;
  parentId?: string;
}

/**
 * ToolEvent represents a tool invocation event
 * REQ-SDK-009: Comprehensive event tracking
 */
export interface ToolEvent {
  id: string;
  type: 'tool';
  name: string;
  timestamp: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

/**
 * ThoughtEvent represents a thought/reasoning event
 * REQ-SDK-009: Comprehensive event tracking
 */
export interface ThoughtEvent {
  id: string;
  type: 'thought';
  timestamp: number;
  content: string;
}

/**
 * TraceEvent is a union type of all possible event types
 * REQ-SDK-009: Type safety for all event structures
 */
export type TraceEvent = SpanEvent | ToolEvent | ThoughtEvent;

/**
 * TraceInstance provides methods to record different types of events
 * REQ-SDK-009: Type safety for all SDK methods
 */
export interface TraceInstance {
  /**
   * Record a span event
   */
  span(event: Omit<SpanEvent, 'type'>): void;

  /**
   * Record a tool invocation event
   */
  tool(event: Omit<ToolEvent, 'type'>): void;

  /**
   * Record a thought event
   */
  thought(event: Omit<ThoughtEvent, 'type'>): void;
}

/**
 * InitOptions for initializing the trace SDK
 * REQ-PROJ-002: Extensible configuration
 */
export interface InitOptions {
  /**
   * Project name for identifying traces
   */
  projectName: string;
}
