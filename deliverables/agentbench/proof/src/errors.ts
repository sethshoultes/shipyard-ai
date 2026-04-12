/**
 * Custom error classes for Proof
 *
 * Per locked decision #11: "Terse, confident, zero apologies."
 * Errors are clear and actionable without being verbose.
 */

export abstract class ProofError extends Error {
  abstract readonly code: string;
  abstract readonly exitCode: number;
  readonly hint?: string;

  constructor(message: string, hint?: string) {
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
  readonly code = 'CONFIG_NOT_FOUND';
  readonly exitCode = 2;

  constructor(filePath: string) {
    super(
      `Config not found: ${filePath}`,
      'Create proof.yaml or specify the correct path'
    );
  }
}

/**
 * Config file has invalid structure or syntax
 */
export class ConfigValidationError extends ProofError {
  readonly code = 'CONFIG_VALIDATION';
  readonly exitCode = 2;

  constructor(message: string, hint?: string) {
    super(message, hint);
  }
}

/**
 * Agent execution failed (subprocess or HTTP)
 */
export class AgentExecutionError extends ProofError {
  readonly code = 'AGENT_EXECUTION';
  readonly exitCode = 1;
  readonly timedOut: boolean;

  constructor(message: string, hint?: string, timedOut = false) {
    super(message, hint);
    this.timedOut = timedOut;
  }
}

/**
 * Unknown evaluator type requested
 */
export class EvaluatorError extends ProofError {
  readonly code = 'EVALUATOR_ERROR';
  readonly exitCode = 2;

  constructor(evaluatorType: string) {
    const validTypes = ['contains', 'does_not_contain', 'json_schema', 'sentiment', 'matches_intent'];
    super(
      `Unknown evaluator: "${evaluatorType}"`,
      `Valid evaluators: ${validTypes.join(', ')}`
    );
  }
}

/**
 * LLM API key missing when --llm flag used
 */
export class ApiKeyMissingError extends ProofError {
  readonly code = 'API_KEY_MISSING';
  readonly exitCode = 2;

  constructor() {
    super(
      'ANTHROPIC_API_KEY not set',
      'export ANTHROPIC_API_KEY=your-key or remove --llm flag'
    );
  }
}

/**
 * LLM API call failed
 */
export class LLMError extends ProofError {
  readonly code = 'LLM_ERROR';
  readonly exitCode = 1;

  constructor(message: string, hint?: string) {
    super(message, hint);
  }
}
