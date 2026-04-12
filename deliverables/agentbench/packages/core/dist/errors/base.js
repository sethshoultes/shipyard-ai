/**
 * AgentBench Base Error Class
 *
 * Provides a foundation for all AgentBench errors with:
 * - Structured error information (code, message, suggestion, details)
 * - Error serialization for logging and reporting
 * - Stack trace preservation
 * - Category-based organization
 */
import { ErrorCode, ErrorCategory, getErrorDefinition, } from './taxonomy';
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
    code;
    /** The error category */
    category;
    /** Actionable suggestion for resolution */
    suggestion;
    /** Additional contextual details */
    details;
    /** Whether this error is recoverable */
    recoverable;
    /** Original cause of the error */
    cause;
    /** When the error occurred */
    timestamp;
    constructor(options) {
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
    getDefinition() {
        return getErrorDefinition(this.code);
    }
    /**
     * Format the error for human-readable output
     */
    format() {
        const lines = [
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
    toJSON() {
        const serialized = {
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
        }
        else if (this.cause) {
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
    toString() {
        return `${this.name}: [${this.code}] ${this.message}`;
    }
    /**
     * Check if this error is of a specific category
     */
    isCategory(category) {
        return this.category === category;
    }
    /**
     * Create a new error with additional details
     */
    withDetails(additionalDetails) {
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
    static wrap(error, defaultCode = ErrorCode.AGENT_EXCEPTION) {
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
    static isAgentBenchError(value) {
        return value instanceof AgentBenchError;
    }
}
//# sourceMappingURL=base.js.map