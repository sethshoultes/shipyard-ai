/**
 * Custom error classes for Proof
 *
 * Per locked decision #11: "Terse, confident, zero apologies."
 * Errors are clear and actionable without being verbose.
 */
export declare abstract class ProofError extends Error {
    abstract readonly code: string;
    abstract readonly exitCode: number;
    readonly hint?: string;
    constructor(message: string, hint?: string);
}
/**
 * Config file not found
 */
export declare class ConfigNotFoundError extends ProofError {
    readonly code = "CONFIG_NOT_FOUND";
    readonly exitCode = 2;
    constructor(filePath: string);
}
/**
 * Config file has invalid structure or syntax
 */
export declare class ConfigValidationError extends ProofError {
    readonly code = "CONFIG_VALIDATION";
    readonly exitCode = 2;
    constructor(message: string, hint?: string);
}
/**
 * Agent execution failed (subprocess or HTTP)
 */
export declare class AgentExecutionError extends ProofError {
    readonly code = "AGENT_EXECUTION";
    readonly exitCode = 1;
    readonly timedOut: boolean;
    constructor(message: string, hint?: string, timedOut?: boolean);
}
/**
 * Unknown evaluator type requested
 */
export declare class EvaluatorError extends ProofError {
    readonly code = "EVALUATOR_ERROR";
    readonly exitCode = 2;
    constructor(evaluatorType: string);
}
/**
 * LLM API key missing when --llm flag used
 */
export declare class ApiKeyMissingError extends ProofError {
    readonly code = "API_KEY_MISSING";
    readonly exitCode = 2;
    constructor();
}
/**
 * LLM API call failed
 */
export declare class LLMError extends ProofError {
    readonly code = "LLM_ERROR";
    readonly exitCode = 1;
    constructor(message: string, hint?: string);
}
//# sourceMappingURL=errors.d.ts.map