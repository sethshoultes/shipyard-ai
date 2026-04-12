/**
 * AgentBench Base Error Class
 *
 * Provides a foundation for all AgentBench errors with:
 * - Structured error information (code, message, suggestion, details)
 * - Error serialization for logging and reporting
 * - Stack trace preservation
 * - Category-based organization
 */
import { ErrorCode, ErrorCategory, type ErrorDefinition } from './taxonomy';
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
export declare class AgentBenchError extends Error {
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
    constructor(options: AgentBenchErrorOptions);
    /**
     * Get the error definition from the taxonomy
     */
    getDefinition(): ErrorDefinition;
    /**
     * Format the error for human-readable output
     */
    format(): string;
    /**
     * Serialize the error to a plain object (for JSON output)
     */
    toJSON(): SerializedError;
    /**
     * Create a string representation of the error
     */
    toString(): string;
    /**
     * Check if this error is of a specific category
     */
    isCategory(category: ErrorCategory): boolean;
    /**
     * Create a new error with additional details
     */
    withDetails(additionalDetails: Record<string, unknown>): AgentBenchError;
    /**
     * Wrap an unknown error as an AgentBenchError
     */
    static wrap(error: unknown, defaultCode?: ErrorCode): AgentBenchError;
    /**
     * Check if a value is an AgentBenchError
     */
    static isAgentBenchError(value: unknown): value is AgentBenchError;
}
//# sourceMappingURL=base.d.ts.map