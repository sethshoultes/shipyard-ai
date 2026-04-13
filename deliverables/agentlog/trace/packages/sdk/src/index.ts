// Main entry point and exports for Trace SDK
// REQ-SDK-009: Define and export all public TypeScript types
// REQ-PROJ-002: Ensure type safety for all SDK methods and event structures

// Export Span class
export { Span } from './span.js';

// Export Trace class
export { Trace } from './trace.js';

// Export all public types from types module
export type {
  TraceInstance,
  TraceEvent,
  SpanEvent,
  ToolEvent,
  ThoughtEvent,
  InitOptions,
} from './types.js';

// Export writer utilities and types
export { NDJSONWriter, generateSessionId } from './writer.js';
export type { TraceEventRecord } from './writer.js';
