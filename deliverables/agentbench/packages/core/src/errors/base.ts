/**
 * AgentBench Base Error Class
 *
 * Provides a foundation for all AgentBench errors with:
 * - Structured error information (code, message, suggestion, details)
 * - Error serialization for logging and reporting
 * - Stack trace preservation
 * - Category-based organization
 */

import {
  ErrorCode,
  ErrorCategory,
  getErrorDefinition,
  type ErrorDefinition,
} from './taxonomy';

/**
 * Options for creating an AgentBenchError
 */
export interface AgentBenchErrorOptions {
  /** The specific error code */
  code: ErrorCode;
  /** Additional contextual details */
  details?: Record<string, unknown>;
  /** The original error that caused this error */
  cause?: Error;
  /** Override the default message */
  messageOverride?: string;
  /** Override the default suggestion */
  suggestionOverride?: string;
}

/**
 * Serialized error format for JSON output
 */
export interface SerializedError {
  name: string;
  code: ErrorCode;
  category: ErrorCategory;
  message: string;
  suggestion: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  stack?: string;
  cause?: SerializedError;
  timestamp: string;
}

/**
 * Base error class for all AgentBench errors.
 *
 * Extends the standard Error class with:
 * - Structured error codes and categories
 * - Actionable suggestions for resolution
 * - Additional details for debugging
 * - Serialization support
 *
 * @example
 * ```typescript
 * throw new AgentBenchError({
 *   code: ErrorCode.TIMEOUT_EXECUTION,
 *   details: { actualDuration: 45000, limit: 30000 }
 * });
 * ```
 */
export class AgentBenchError extends Error {
  /** The specific error code */
  readonly code: ErrorCode;

  /** The error category */
  readonly category: ErrorCategory;

  /** Actionable suggestion for resolution */
  readonly suggestion: string;

  /** Additional contextual details */
  readonly details: Record<string, unknown>;

  /** Whether this error is recoverable */
  readonly recoverable: boolean;

  /** Original cause of the error */
  readonly cause?: Error;

  /** When the error occurred */
  readonly timestamp: Date;

  constructor(options: AgentBenchErrorOptions) {
    const definition = getErrorDefinition(options.code);
    const message = options.messageOverride ?? definition.message;

    super(message);

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'AgentBenchError';
    this.code = options.code;
    this.category = definition.category;
    this.suggestion = options.suggestionOverride ?? definition.suggestion;
    this.details = options.details ?? {};
    this.recoverable = definition.recoverable;
    this.cause = options.cause;
    this.timestamp = new Date();

    // Capture stack trace, excluding constructor call
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get the error definition from the taxonomy
   */
  getDefinition(): ErrorDefinition {
    return getErrorDefinition(this.code);
  }

  /**
   * Format the error for human-readable output
   */
  format(): string {
    const lines: string[] = [
      `[${this.category}] ${this.code}`,
      ``,
      `Error: ${this.message}`,
      ``,
      `What to do: ${this.suggestion}`,
    ];

    if (Object.keys(this.details).length > 0) {
      lines.push(``, `Details:`);
      for (const [key, value] of Object.entries(this.details)) {
        lines.push(`  ${key}: ${JSON.stringify(value)}`);
      }
    }

    if (this.cause) {
      lines.push(``, `Caused by: ${this.cause.message}`);
    }

    return lines.join('\n');
  }

  /**
   * Serialize the error to a plain object (for JSON output)
   */
  toJSON(): SerializedError {
    const serialized: SerializedError = {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      suggestion: this.suggestion,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
    };

    if (Object.keys(this.details).length > 0) {
      serialized.details = this.details;
    }

    if (this.stack) {
      serialized.stack = this.stack;
    }

    if (this.cause instanceof AgentBenchError) {
      serialized.cause = this.cause.toJSON();
    } else if (this.cause) {
      serialized.cause = {
        name: this.cause.name,
        code: ErrorCode.AGENT_EXCEPTION,
        category: ErrorCategory.AGENT_ERROR,
        message: this.cause.message,
        suggestion: 'See the original error for details.',
        recoverable: false,
        stack: this.cause.stack,
        timestamp: this.timestamp.toISOString(),
      };
    }

    return serialized;
  }

  /**
   * Create a string representation of the error
   */
  toString(): string {
    return `${this.name}: [${this.code}] ${this.message}`;
  }

  /**
   * Check if this error is of a specific category
   */
  isCategory(category: ErrorCategory): boolean {
    return this.category === category;
  }

  /**
   * Create a new error with additional details
   */
  withDetails(additionalDetails: Record<string, unknown>): AgentBenchError {
    return new AgentBenchError({
      code: this.code,
      details: { ...this.details, ...additionalDetails },
      cause: this.cause,
      messageOverride: this.message,
      suggestionOverride: this.suggestion,
    });
  }

  /**
   * Wrap an unknown error as an AgentBenchError
   */
  static wrap(error: unknown, defaultCode: ErrorCode = ErrorCode.AGENT_EXCEPTION): AgentBenchError {
    if (error instanceof AgentBenchError) {
      return error;
    }

    if (error instanceof Error) {
      return new AgentBenchError({
        code: defaultCode,
        cause: error,
        details: { originalMessage: error.message },
      });
    }

    return new AgentBenchError({
      code: defaultCode,
      details: { originalError: String(error) },
    });
  }

  /**
   * Check if a value is an AgentBenchError
   */
  static isAgentBenchError(value: unknown): value is AgentBenchError {
    return value instanceof AgentBenchError;
  }
}
