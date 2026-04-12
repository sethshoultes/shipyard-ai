/**
 * Category-Specific Error Classes
 *
 * Each class provides typed constructors for specific error scenarios,
 * with helpful factory methods that include contextual details.
 */
import { AgentBenchError } from './base';
import { ErrorCode, ErrorCategory } from './taxonomy';
/**
 * Agent Error - when the agent fails to respond or produces an error
 *
 * @example
 * ```typescript
 * throw AgentError.noResponse('my-agent');
 * throw AgentError.crashed('my-agent', 1, 'Segmentation fault');
 * ```
 */
export class AgentError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'AgentError';
    }
    /**
     * Agent did not produce any response
     */
    static noResponse(agentId) {
        return new AgentError({
            code: ErrorCode.AGENT_NO_RESPONSE,
            details: agentId ? { agentId } : {},
        });
    }
    /**
     * Agent process crashed with exit code
     */
    static crashed(agentId, exitCode, stderr) {
        return new AgentError({
            code: ErrorCode.AGENT_CRASHED,
            details: {
                agentId,
                exitCode,
                ...(stderr && { stderr: stderr.slice(0, 1000) }),
            },
        });
    }
    /**
     * Agent produced output that could not be parsed
     */
    static invalidOutput(agentId, rawOutput, parseError) {
        return new AgentError({
            code: ErrorCode.AGENT_INVALID_OUTPUT,
            details: {
                agentId,
                rawOutput: rawOutput.slice(0, 500),
                ...(parseError && { parseError }),
            },
        });
    }
    /**
     * Agent threw an unhandled exception
     */
    static exception(agentId, cause) {
        return new AgentError({
            code: ErrorCode.AGENT_EXCEPTION,
            cause,
            details: {
                agentId,
                exceptionType: cause.name,
                exceptionMessage: cause.message,
            },
        });
    }
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
export class TimeoutError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'TimeoutError';
    }
    /**
     * Agent exceeded execution time limit
     */
    static execution(actualDurationMs, limitMs, testName) {
        const seconds = (ms) => (ms / 1000).toFixed(1);
        return new TimeoutError({
            code: ErrorCode.TIMEOUT_EXECUTION,
            details: {
                actualDurationMs,
                limitMs,
                ...(testName && { testName }),
            },
            suggestionOverride: `Your agent took ${seconds(actualDurationMs)}s, but the limit is ${seconds(limitMs)}s. Try: reduce context size, simplify prompts, or increase timeout in your config.`,
        });
    }
    /**
     * Connection to agent timed out
     */
    static connection(endpoint, timeoutMs) {
        return new TimeoutError({
            code: ErrorCode.TIMEOUT_CONNECTION,
            details: { endpoint, timeoutMs },
        });
    }
    /**
     * Response from agent timed out after connection was established
     */
    static response(endpoint, timeoutMs, partialResponse) {
        return new TimeoutError({
            code: ErrorCode.TIMEOUT_RESPONSE,
            details: {
                endpoint,
                timeoutMs,
                ...(partialResponse && { partialResponse: partialResponse.slice(0, 200) }),
            },
        });
    }
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
export class ValidationError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'ValidationError';
    }
    /**
     * Required field is missing from response
     */
    static missingField(fieldName, actualResponse) {
        return new ValidationError({
            code: ErrorCode.VALIDATION_MISSING_FIELD,
            details: {
                missingField: fieldName,
                actualResponse: JSON.stringify(actualResponse).slice(0, 500),
            },
            suggestionOverride: `Response missing '${fieldName}' field. Expected format includes: { ${fieldName}: ... }`,
        });
    }
    /**
     * Field has incorrect type
     */
    static invalidType(fieldName, expectedType, actualType, actualValue) {
        return new ValidationError({
            code: ErrorCode.VALIDATION_INVALID_TYPE,
            details: {
                field: fieldName,
                expectedType,
                actualType,
                ...(actualValue !== undefined && { actualValue: String(actualValue).slice(0, 100) }),
            },
            suggestionOverride: `Field '${fieldName}' should be ${expectedType}, but got ${actualType}. Check your agent's output serialization.`,
        });
    }
    /**
     * Response doesn't match expected schema
     */
    static schemaMismatch(schemaName, errors, actualResponse) {
        return new ValidationError({
            code: ErrorCode.VALIDATION_SCHEMA_MISMATCH,
            details: {
                schema: schemaName,
                validationErrors: errors.slice(0, 10),
                ...(actualResponse && { actualResponse: JSON.stringify(actualResponse).slice(0, 500) }),
            },
        });
    }
    /**
     * Response format is invalid (e.g., malformed JSON)
     */
    static formatError(expectedFormat, rawOutput, parseError) {
        return new ValidationError({
            code: ErrorCode.VALIDATION_FORMAT_ERROR,
            details: {
                expectedFormat,
                rawOutput: rawOutput.slice(0, 500),
                ...(parseError && { parseError }),
            },
            suggestionOverride: `Expected ${expectedFormat} format but couldn't parse the response. Raw output starts with: "${rawOutput.slice(0, 50)}..."`,
        });
    }
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
export class ScoringError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'ScoringError';
    }
    /**
     * Evaluator encountered an error while scoring
     */
    static evaluatorFailed(evaluatorType, cause) {
        return new ScoringError({
            code: ErrorCode.SCORING_EVALUATOR_FAILED,
            cause,
            details: {
                evaluatorType,
                errorMessage: cause.message,
            },
        });
    }
    /**
     * No matcher found for expected output type
     */
    static noMatcher(outputType) {
        return new ScoringError({
            code: ErrorCode.SCORING_NO_MATCHER,
            details: { outputType },
            suggestionOverride: `No matcher registered for output type '${outputType}'. Available types: exact, contains, regex, semantic, tool-call, custom.`,
        });
    }
    /**
     * Rubric scoring failed
     */
    static rubricError(rubricName, reason) {
        return new ScoringError({
            code: ErrorCode.SCORING_RUBRIC_ERROR,
            details: { rubricName, reason },
        });
    }
    /**
     * Semantic evaluation is not available
     */
    static semanticUnavailable(reason = 'ANTHROPIC_API_KEY not set') {
        return new ScoringError({
            code: ErrorCode.SCORING_SEMANTIC_UNAVAILABLE,
            details: { reason },
        });
    }
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
export class SetupError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'SetupError';
    }
    /**
     * Benchmark configuration is invalid
     */
    static invalidConfig(configPath, errors) {
        return new SetupError({
            code: ErrorCode.SETUP_INVALID_CONFIG,
            details: {
                configPath,
                validationErrors: errors.slice(0, 10),
            },
            suggestionOverride: `Configuration file '${configPath}' has errors:\n${errors.map((e) => `  - ${e}`).join('\n')}\nRun "agentbench validate" for details.`,
        });
    }
    /**
     * Specified benchmark not found
     */
    static missingBenchmark(benchmarkName, searchedPaths) {
        return new SetupError({
            code: ErrorCode.SETUP_MISSING_BENCHMARK,
            details: {
                benchmarkName,
                ...(searchedPaths && { searchedPaths }),
            },
            suggestionOverride: `Benchmark '${benchmarkName}' not found. Use "agentbench list" to see available benchmarks.`,
        });
    }
    /**
     * Agent configuration is invalid
     */
    static invalidAgent(reason, config) {
        return new SetupError({
            code: ErrorCode.SETUP_INVALID_AGENT,
            details: {
                reason,
                ...(config && { providedConfig: JSON.stringify(config).slice(0, 500) }),
            },
        });
    }
    /**
     * Required dependency is not installed
     */
    static missingDependency(dependencyName, installCommand) {
        return new SetupError({
            code: ErrorCode.SETUP_MISSING_DEPENDENCY,
            details: {
                dependency: dependencyName,
                ...(installCommand && { installCommand }),
            },
            suggestionOverride: installCommand
                ? `Missing dependency '${dependencyName}'. Install it with: ${installCommand}`
                : `Missing dependency '${dependencyName}'. Please install it before running the benchmark.`,
        });
    }
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
export class NetworkError extends AgentBenchError {
    constructor(options) {
        super(options);
        this.name = 'NetworkError';
    }
    /**
     * Agent endpoint is unreachable
     */
    static unreachable(endpoint, cause) {
        return new NetworkError({
            code: ErrorCode.NETWORK_UNREACHABLE,
            cause,
            details: { endpoint },
        });
    }
    /**
     * DNS lookup failed for agent endpoint
     */
    static dnsFailure(hostname) {
        return new NetworkError({
            code: ErrorCode.NETWORK_DNS_FAILURE,
            details: { hostname },
            suggestionOverride: `Cannot resolve hostname '${hostname}'. Check for typos in the URL or verify DNS configuration.`,
        });
    }
    /**
     * Connection to agent was refused
     */
    static connectionRefused(endpoint, port) {
        return new NetworkError({
            code: ErrorCode.NETWORK_CONNECTION_REFUSED,
            details: { endpoint, port },
            suggestionOverride: `Connection refused on port ${port}. Ensure your agent is running and listening on the correct port.`,
        });
    }
    /**
     * SSL/TLS connection failed
     */
    static sslError(endpoint, reason) {
        return new NetworkError({
            code: ErrorCode.NETWORK_SSL_ERROR,
            details: { endpoint, reason },
        });
    }
    /**
     * Create appropriate network error from a fetch/http error
     */
    static fromFetchError(endpoint, error) {
        const message = error.message.toLowerCase();
        if (message.includes('econnrefused') || message.includes('connection refused')) {
            const url = new URL(endpoint);
            return NetworkError.connectionRefused(endpoint, parseInt(url.port) || 80);
        }
        if (message.includes('enotfound') || message.includes('getaddrinfo')) {
            const url = new URL(endpoint);
            return NetworkError.dnsFailure(url.hostname);
        }
        if (message.includes('ssl') || message.includes('certificate') || message.includes('tls')) {
            return NetworkError.sslError(endpoint, error.message);
        }
        return NetworkError.unreachable(endpoint, error);
    }
}
/**
 * Type guard functions for error categories
 */
export function isAgentError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.AGENT_ERROR;
}
export function isTimeoutError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.TIMEOUT_ERROR;
}
export function isValidationError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.VALIDATION_ERROR;
}
export function isScoringError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.SCORING_ERROR;
}
export function isSetupError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.SETUP_ERROR;
}
export function isNetworkError(error) {
    return error instanceof AgentBenchError && error.category === ErrorCategory.NETWORK_ERROR;
}
//# sourceMappingURL=categories.js.map