/**
 * Custom error classes for Proof
 *
 * Per locked decision #11: "Terse, confident, zero apologies."
 * Errors are clear and actionable without being verbose.
 */
export class ProofError extends Error {
    constructor(message, hint) {
        super(message);
        this.name = this.constructor.name;
        this.hint = hint;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Config file not found
 */
export class ConfigNotFoundError extends ProofError {
    constructor(filePath) {
        super(`Config not found: ${filePath}`, 'Create proof.yaml or specify the correct path');
        this.code = 'CONFIG_NOT_FOUND';
        this.exitCode = 2;
    }
}
/**
 * Config file has invalid structure or syntax
 */
export class ConfigValidationError extends ProofError {
    constructor(message, hint) {
        super(message, hint);
        this.code = 'CONFIG_VALIDATION';
        this.exitCode = 2;
    }
}
/**
 * Agent execution failed (subprocess or HTTP)
 */
export class AgentExecutionError extends ProofError {
    constructor(message, hint, timedOut = false) {
        super(message, hint);
        this.code = 'AGENT_EXECUTION';
        this.exitCode = 1;
        this.timedOut = timedOut;
    }
}
/**
 * Unknown evaluator type requested
 */
export class EvaluatorError extends ProofError {
    constructor(evaluatorType) {
        const validTypes = ['contains', 'does_not_contain', 'json_schema', 'sentiment', 'matches_intent'];
        super(`Unknown evaluator: "${evaluatorType}"`, `Valid evaluators: ${validTypes.join(', ')}`);
        this.code = 'EVALUATOR_ERROR';
        this.exitCode = 2;
    }
}
/**
 * LLM API key missing when --llm flag used
 */
export class ApiKeyMissingError extends ProofError {
    constructor() {
        super('ANTHROPIC_API_KEY not set', 'export ANTHROPIC_API_KEY=your-key or remove --llm flag');
        this.code = 'API_KEY_MISSING';
        this.exitCode = 2;
    }
}
/**
 * LLM API call failed
 */
export class LLMError extends ProofError {
    constructor(message, hint) {
        super(message, hint);
        this.code = 'LLM_ERROR';
        this.exitCode = 1;
    }
}
//# sourceMappingURL=errors.js.map