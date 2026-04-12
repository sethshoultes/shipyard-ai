/**
 * AgentBench Error Taxonomy
 *
 * Defines standard error codes, messages, and suggestions for all error types.
 * Per Decision 5: Error states get design investment.
 * Per essence: "The moment of failure must teach - not punish."
 *
 * Each error type includes actionable suggestions to help developers
 * understand what went wrong and how to fix it.
 */
/**
 * Error categories representing distinct failure domains
 */
export declare enum ErrorCategory {
    /** Agent failed to respond or produced an error */
    AGENT_ERROR = "AGENT_ERROR",
    /** Agent exceeded the configured time limit */
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    /** Response didn't match the expected format or schema */
    VALIDATION_ERROR = "VALIDATION_ERROR",
    /** Couldn't evaluate or score the response */
    SCORING_ERROR = "SCORING_ERROR",
    /** Benchmark configuration is invalid */
    SETUP_ERROR = "SETUP_ERROR",
    /** Failed to reach agent via network */
    NETWORK_ERROR = "NETWORK_ERROR"
}
/**
 * Specific error codes within each category
 */
export declare enum ErrorCode {
    AGENT_NO_RESPONSE = "AGENT_NO_RESPONSE",
    AGENT_CRASHED = "AGENT_CRASHED",
    AGENT_INVALID_OUTPUT = "AGENT_INVALID_OUTPUT",
    AGENT_EXCEPTION = "AGENT_EXCEPTION",
    TIMEOUT_EXECUTION = "TIMEOUT_EXECUTION",
    TIMEOUT_CONNECTION = "TIMEOUT_CONNECTION",
    TIMEOUT_RESPONSE = "TIMEOUT_RESPONSE",
    VALIDATION_MISSING_FIELD = "VALIDATION_MISSING_FIELD",
    VALIDATION_INVALID_TYPE = "VALIDATION_INVALID_TYPE",
    VALIDATION_SCHEMA_MISMATCH = "VALIDATION_SCHEMA_MISMATCH",
    VALIDATION_FORMAT_ERROR = "VALIDATION_FORMAT_ERROR",
    SCORING_EVALUATOR_FAILED = "SCORING_EVALUATOR_FAILED",
    SCORING_NO_MATCHER = "SCORING_NO_MATCHER",
    SCORING_RUBRIC_ERROR = "SCORING_RUBRIC_ERROR",
    SCORING_SEMANTIC_UNAVAILABLE = "SCORING_SEMANTIC_UNAVAILABLE",
    SETUP_INVALID_CONFIG = "SETUP_INVALID_CONFIG",
    SETUP_MISSING_BENCHMARK = "SETUP_MISSING_BENCHMARK",
    SETUP_INVALID_AGENT = "SETUP_INVALID_AGENT",
    SETUP_MISSING_DEPENDENCY = "SETUP_MISSING_DEPENDENCY",
    NETWORK_UNREACHABLE = "NETWORK_UNREACHABLE",
    NETWORK_DNS_FAILURE = "NETWORK_DNS_FAILURE",
    NETWORK_CONNECTION_REFUSED = "NETWORK_CONNECTION_REFUSED",
    NETWORK_SSL_ERROR = "NETWORK_SSL_ERROR"
}
/**
 * Structure for error definitions including teaching-focused suggestions
 */
export interface ErrorDefinition {
    /** Unique error code */
    code: ErrorCode;
    /** Human-readable error message */
    message: string;
    /** Actionable suggestion to help resolve the error */
    suggestion: string;
    /** Category this error belongs to */
    category: ErrorCategory;
    /** Whether this error is typically recoverable */
    recoverable: boolean;
}
/**
 * Complete error taxonomy with codes, messages, and suggestions.
 * Every error includes a teaching-focused suggestion that explains
 * what happened and how to fix it.
 */
export declare const ERROR_TAXONOMY: Record<ErrorCode, ErrorDefinition>;
/**
 * Get the error definition for a specific error code
 */
export declare function getErrorDefinition(code: ErrorCode): ErrorDefinition;
/**
 * Get all errors in a specific category
 */
export declare function getErrorsByCategory(category: ErrorCategory): ErrorDefinition[];
/**
 * Get suggestion for an error code
 */
export declare function getErrorSuggestion(code: ErrorCode): string;
/**
 * Check if an error is recoverable
 */
export declare function isRecoverable(code: ErrorCode): boolean;
/**
 * Format an error with context for display
 */
export declare function formatErrorWithContext(code: ErrorCode, details?: Record<string, unknown>): {
    code: ErrorCode;
    message: string;
    suggestion: string;
    details?: Record<string, unknown>;
};
//# sourceMappingURL=taxonomy.d.ts.map