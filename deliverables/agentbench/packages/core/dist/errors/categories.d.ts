/**
 * Category-Specific Error Classes
 *
 * Each class provides typed constructors for specific error scenarios,
 * with helpful factory methods that include contextual details.
 */
import { AgentBenchError, type AgentBenchErrorOptions } from './base';
import { ErrorCode } from './taxonomy';
/**
 * Agent Error - when the agent fails to respond or produces an error
 *
 * @example
 * ```typescript
 * throw AgentError.noResponse('my-agent');
 * throw AgentError.crashed('my-agent', 1, 'Segmentation fault');
 * ```
 */
export declare class AgentError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Agent did not produce any response
     */
    static noResponse(agentId?: string): AgentError;
    /**
     * Agent process crashed with exit code
     */
    static crashed(agentId: string, exitCode: number, stderr?: string): AgentError;
    /**
     * Agent produced output that could not be parsed
     */
    static invalidOutput(agentId: string, rawOutput: string, parseError?: string): AgentError;
    /**
     * Agent threw an unhandled exception
     */
    static exception(agentId: string, cause: Error): AgentError;
}
/**
 * Timeout Error - when the agent exceeds time limits
 *
 * @example
 * ```typescript
 * throw TimeoutError.execution(45000, 30000);
 * throw TimeoutError.connection('http://localhost:3000', 5000);
 * ```
 */
export declare class TimeoutError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Agent exceeded execution time limit
     */
    static execution(actualDurationMs: number, limitMs: number, testName?: string): TimeoutError;
    /**
     * Connection to agent timed out
     */
    static connection(endpoint: string, timeoutMs: number): TimeoutError;
    /**
     * Response from agent timed out after connection was established
     */
    static response(endpoint: string, timeoutMs: number, partialResponse?: string): TimeoutError;
}
/**
 * Validation Error - when the response format is wrong
 *
 * @example
 * ```typescript
 * throw ValidationError.missingField('action', { result: 'ok' });
 * throw ValidationError.invalidType('count', 'number', 'string');
 * ```
 */
export declare class ValidationError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Required field is missing from response
     */
    static missingField(fieldName: string, actualResponse: unknown): ValidationError;
    /**
     * Field has incorrect type
     */
    static invalidType(fieldName: string, expectedType: string, actualType: string, actualValue?: unknown): ValidationError;
    /**
     * Response doesn't match expected schema
     */
    static schemaMismatch(schemaName: string, errors: string[], actualResponse?: unknown): ValidationError;
    /**
     * Response format is invalid (e.g., malformed JSON)
     */
    static formatError(expectedFormat: string, rawOutput: string, parseError?: string): ValidationError;
}
/**
 * Scoring Error - when evaluation fails
 *
 * @example
 * ```typescript
 * throw ScoringError.evaluatorFailed('semantic', new Error('API error'));
 * throw ScoringError.noMatcher('custom-scorer');
 * ```
 */
export declare class ScoringError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Evaluator encountered an error while scoring
     */
    static evaluatorFailed(evaluatorType: string, cause: Error): ScoringError;
    /**
     * No matcher found for expected output type
     */
    static noMatcher(outputType: string): ScoringError;
    /**
     * Rubric scoring failed
     */
    static rubricError(rubricName: string, reason: string): ScoringError;
    /**
     * Semantic evaluation is not available
     */
    static semanticUnavailable(reason?: string): ScoringError;
}
/**
 * Setup Error - when configuration is invalid
 *
 * @example
 * ```typescript
 * throw SetupError.invalidConfig('benchmark.yaml', ['missing "name" field']);
 * throw SetupError.missingBenchmark('my-benchmark');
 * ```
 */
export declare class SetupError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Benchmark configuration is invalid
     */
    static invalidConfig(configPath: string, errors: string[]): SetupError;
    /**
     * Specified benchmark not found
     */
    static missingBenchmark(benchmarkName: string, searchedPaths?: string[]): SetupError;
    /**
     * Agent configuration is invalid
     */
    static invalidAgent(reason: string, config?: unknown): SetupError;
    /**
     * Required dependency is not installed
     */
    static missingDependency(dependencyName: string, installCommand?: string): SetupError;
}
/**
 * Network Error - when agent can't be reached
 *
 * @example
 * ```typescript
 * throw NetworkError.unreachable('http://localhost:3000');
 * throw NetworkError.connectionRefused('http://localhost:8080', 8080);
 * ```
 */
export declare class NetworkError extends AgentBenchError {
    constructor(options: Omit<AgentBenchErrorOptions, 'code'> & {
        code: ErrorCode;
    });
    /**
     * Agent endpoint is unreachable
     */
    static unreachable(endpoint: string, cause?: Error): NetworkError;
    /**
     * DNS lookup failed for agent endpoint
     */
    static dnsFailure(hostname: string): NetworkError;
    /**
     * Connection to agent was refused
     */
    static connectionRefused(endpoint: string, port: number): NetworkError;
    /**
     * SSL/TLS connection failed
     */
    static sslError(endpoint: string, reason: string): NetworkError;
    /**
     * Create appropriate network error from a fetch/http error
     */
    static fromFetchError(endpoint: string, error: Error): NetworkError;
}
/**
 * Type guard functions for error categories
 */
export declare function isAgentError(error: unknown): error is AgentError;
export declare function isTimeoutError(error: unknown): error is TimeoutError;
export declare function isValidationError(error: unknown): error is ValidationError;
export declare function isScoringError(error: unknown): error is ScoringError;
export declare function isSetupError(error: unknown): error is SetupError;
export declare function isNetworkError(error: unknown): error is NetworkError;
//# sourceMappingURL=categories.d.ts.map