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
export enum ErrorCategory {
  /** Agent failed to respond or produced an error */
  AGENT_ERROR = 'AGENT_ERROR',
  /** Agent exceeded the configured time limit */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** Response didn't match the expected format or schema */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Couldn't evaluate or score the response */
  SCORING_ERROR = 'SCORING_ERROR',
  /** Benchmark configuration is invalid */
  SETUP_ERROR = 'SETUP_ERROR',
  /** Failed to reach agent via network */
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Specific error codes within each category
 */
export enum ErrorCode {
  // Agent errors (1xxx)
  AGENT_NO_RESPONSE = 'AGENT_NO_RESPONSE',
  AGENT_CRASHED = 'AGENT_CRASHED',
  AGENT_INVALID_OUTPUT = 'AGENT_INVALID_OUTPUT',
  AGENT_EXCEPTION = 'AGENT_EXCEPTION',

  // Timeout errors (2xxx)
  TIMEOUT_EXECUTION = 'TIMEOUT_EXECUTION',
  TIMEOUT_CONNECTION = 'TIMEOUT_CONNECTION',
  TIMEOUT_RESPONSE = 'TIMEOUT_RESPONSE',

  // Validation errors (3xxx)
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_TYPE = 'VALIDATION_INVALID_TYPE',
  VALIDATION_SCHEMA_MISMATCH = 'VALIDATION_SCHEMA_MISMATCH',
  VALIDATION_FORMAT_ERROR = 'VALIDATION_FORMAT_ERROR',

  // Scoring errors (4xxx)
  SCORING_EVALUATOR_FAILED = 'SCORING_EVALUATOR_FAILED',
  SCORING_NO_MATCHER = 'SCORING_NO_MATCHER',
  SCORING_RUBRIC_ERROR = 'SCORING_RUBRIC_ERROR',
  SCORING_SEMANTIC_UNAVAILABLE = 'SCORING_SEMANTIC_UNAVAILABLE',

  // Setup errors (5xxx)
  SETUP_INVALID_CONFIG = 'SETUP_INVALID_CONFIG',
  SETUP_MISSING_BENCHMARK = 'SETUP_MISSING_BENCHMARK',
  SETUP_INVALID_AGENT = 'SETUP_INVALID_AGENT',
  SETUP_MISSING_DEPENDENCY = 'SETUP_MISSING_DEPENDENCY',

  // Network errors (6xxx)
  NETWORK_UNREACHABLE = 'NETWORK_UNREACHABLE',
  NETWORK_DNS_FAILURE = 'NETWORK_DNS_FAILURE',
  NETWORK_CONNECTION_REFUSED = 'NETWORK_CONNECTION_REFUSED',
  NETWORK_SSL_ERROR = 'NETWORK_SSL_ERROR',
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
export const ERROR_TAXONOMY: Record<ErrorCode, ErrorDefinition> = {
  // Agent errors - when the agent fails to produce valid output
  [ErrorCode.AGENT_NO_RESPONSE]: {
    code: ErrorCode.AGENT_NO_RESPONSE,
    message: 'Agent did not produce any response',
    suggestion:
      'Your agent returned empty output. Check that your agent writes to stdout (not stderr) and doesn\'t exit before responding. Try running your agent command manually to verify it produces output.',
    category: ErrorCategory.AGENT_ERROR,
    recoverable: false,
  },
  [ErrorCode.AGENT_CRASHED]: {
    code: ErrorCode.AGENT_CRASHED,
    message: 'Agent process terminated unexpectedly',
    suggestion:
      'Your agent process exited with a non-zero code. Check your agent\'s error logs and stderr output for crash details. Common causes: unhandled exceptions, missing dependencies, or memory issues.',
    category: ErrorCategory.AGENT_ERROR,
    recoverable: false,
  },
  [ErrorCode.AGENT_INVALID_OUTPUT]: {
    code: ErrorCode.AGENT_INVALID_OUTPUT,
    message: 'Agent produced output that could not be parsed',
    suggestion:
      'Your agent\'s output couldn\'t be understood. If JSON is expected, verify your response is valid JSON without extra text. Try: JSON.stringify(response) or console.log(JSON.stringify(output)).',
    category: ErrorCategory.AGENT_ERROR,
    recoverable: false,
  },
  [ErrorCode.AGENT_EXCEPTION]: {
    code: ErrorCode.AGENT_EXCEPTION,
    message: 'Agent threw an unhandled exception',
    suggestion:
      'Your agent raised an exception during execution. Wrap your main logic in try/catch and ensure graceful error handling. The exception details are included in the error output.',
    category: ErrorCategory.AGENT_ERROR,
    recoverable: false,
  },

  // Timeout errors - when the agent exceeds time limits
  [ErrorCode.TIMEOUT_EXECUTION]: {
    code: ErrorCode.TIMEOUT_EXECUTION,
    message: 'Agent exceeded the execution time limit',
    suggestion:
      'Your agent took too long to respond. Try: reduce the context size, simplify your prompts, or increase the timeout in your benchmark config. Current timeout settings can be adjusted per-test.',
    category: ErrorCategory.TIMEOUT_ERROR,
    recoverable: false,
  },
  [ErrorCode.TIMEOUT_CONNECTION]: {
    code: ErrorCode.TIMEOUT_CONNECTION,
    message: 'Connection to agent timed out before establishing',
    suggestion:
      'Couldn\'t connect to your agent endpoint in time. Verify your agent server is running and the endpoint URL is correct. Check that no firewall is blocking the connection.',
    category: ErrorCategory.TIMEOUT_ERROR,
    recoverable: true,
  },
  [ErrorCode.TIMEOUT_RESPONSE]: {
    code: ErrorCode.TIMEOUT_RESPONSE,
    message: 'Agent connected but response timed out',
    suggestion:
      'Your agent accepted the request but didn\'t respond in time. This often means the request is being processed but taking too long. Consider streaming responses or increasing the timeout.',
    category: ErrorCategory.TIMEOUT_ERROR,
    recoverable: false,
  },

  // Validation errors - when the response format is wrong
  [ErrorCode.VALIDATION_MISSING_FIELD]: {
    code: ErrorCode.VALIDATION_MISSING_FIELD,
    message: 'Required field missing from response',
    suggestion:
      'Your response is missing a required field. Check the benchmark\'s expected output format. Example: if expecting { action: string, result: object }, ensure both fields are present.',
    category: ErrorCategory.VALIDATION_ERROR,
    recoverable: false,
  },
  [ErrorCode.VALIDATION_INVALID_TYPE]: {
    code: ErrorCode.VALIDATION_INVALID_TYPE,
    message: 'Field has incorrect type',
    suggestion:
      'A field in your response has the wrong type. For example, a number was expected but a string was provided. Check the benchmark schema for exact type requirements.',
    category: ErrorCategory.VALIDATION_ERROR,
    recoverable: false,
  },
  [ErrorCode.VALIDATION_SCHEMA_MISMATCH]: {
    code: ErrorCode.VALIDATION_SCHEMA_MISMATCH,
    message: 'Response does not match expected schema',
    suggestion:
      'Your response structure doesn\'t match what the benchmark expects. Review the benchmark\'s expected output specification and adjust your agent\'s response format accordingly.',
    category: ErrorCategory.VALIDATION_ERROR,
    recoverable: false,
  },
  [ErrorCode.VALIDATION_FORMAT_ERROR]: {
    code: ErrorCode.VALIDATION_FORMAT_ERROR,
    message: 'Response format is invalid',
    suggestion:
      'The response format is incorrect. If JSON was expected, check for syntax errors like trailing commas or unquoted keys. Use a JSON validator to verify your output format.',
    category: ErrorCategory.VALIDATION_ERROR,
    recoverable: false,
  },

  // Scoring errors - when evaluation fails
  [ErrorCode.SCORING_EVALUATOR_FAILED]: {
    code: ErrorCode.SCORING_EVALUATOR_FAILED,
    message: 'Evaluator encountered an error while scoring',
    suggestion:
      'The scoring system failed to evaluate your response. This is usually a benchmark issue, not an agent issue. Check if the evaluator requires specific setup or dependencies.',
    category: ErrorCategory.SCORING_ERROR,
    recoverable: true,
  },
  [ErrorCode.SCORING_NO_MATCHER]: {
    code: ErrorCode.SCORING_NO_MATCHER,
    message: 'No matcher found for expected output type',
    suggestion:
      'The benchmark specifies an output type that has no configured matcher. Verify the benchmark\'s expectedOutput.type is one of: exact, contains, regex, semantic, tool-call, custom.',
    category: ErrorCategory.SCORING_ERROR,
    recoverable: false,
  },
  [ErrorCode.SCORING_RUBRIC_ERROR]: {
    code: ErrorCode.SCORING_RUBRIC_ERROR,
    message: 'Rubric scoring failed',
    suggestion:
      'The rubric-based scoring couldn\'t be completed. Ensure the benchmark\'s rubric is properly defined with valid criteria and levels. Each criterion needs at least two scoring levels.',
    category: ErrorCategory.SCORING_ERROR,
    recoverable: false,
  },
  [ErrorCode.SCORING_SEMANTIC_UNAVAILABLE]: {
    code: ErrorCode.SCORING_SEMANTIC_UNAVAILABLE,
    message: 'Semantic evaluation is not available',
    suggestion:
      'Semantic scoring requires an API key. Set ANTHROPIC_API_KEY in your environment to enable semantic evaluation, or switch to a non-semantic scoring method.',
    category: ErrorCategory.SCORING_ERROR,
    recoverable: true,
  },

  // Setup errors - when configuration is invalid
  [ErrorCode.SETUP_INVALID_CONFIG]: {
    code: ErrorCode.SETUP_INVALID_CONFIG,
    message: 'Benchmark configuration is invalid',
    suggestion:
      'Your benchmark.yaml or config file has errors. Run "agentbench validate" to see specific issues. Common problems: missing required fields, invalid YAML syntax, or unsupported options.',
    category: ErrorCategory.SETUP_ERROR,
    recoverable: false,
  },
  [ErrorCode.SETUP_MISSING_BENCHMARK]: {
    code: ErrorCode.SETUP_MISSING_BENCHMARK,
    message: 'Specified benchmark not found',
    suggestion:
      'The benchmark you requested doesn\'t exist. Check the benchmark name and ensure the benchmark file is in the correct location. Use "agentbench list" to see available benchmarks.',
    category: ErrorCategory.SETUP_ERROR,
    recoverable: false,
  },
  [ErrorCode.SETUP_INVALID_AGENT]: {
    code: ErrorCode.SETUP_INVALID_AGENT,
    message: 'Agent configuration is invalid',
    suggestion:
      'Your agent configuration is missing or incorrect. Ensure you\'ve specified either a command (for subprocess agents) or an endpoint (for HTTP agents), but not both.',
    category: ErrorCategory.SETUP_ERROR,
    recoverable: false,
  },
  [ErrorCode.SETUP_MISSING_DEPENDENCY]: {
    code: ErrorCode.SETUP_MISSING_DEPENDENCY,
    message: 'Required dependency is not installed',
    suggestion:
      'A required package or tool is missing. Check the benchmark\'s requirements and install missing dependencies. For Node.js projects, run "npm install". For Python, check requirements.txt.',
    category: ErrorCategory.SETUP_ERROR,
    recoverable: true,
  },

  // Network errors - when agent can't be reached
  [ErrorCode.NETWORK_UNREACHABLE]: {
    code: ErrorCode.NETWORK_UNREACHABLE,
    message: 'Agent endpoint is unreachable',
    suggestion:
      'Cannot reach your agent\'s network endpoint. Verify the URL is correct and the server is running. If using localhost, ensure the port number matches your agent\'s listening port.',
    category: ErrorCategory.NETWORK_ERROR,
    recoverable: true,
  },
  [ErrorCode.NETWORK_DNS_FAILURE]: {
    code: ErrorCode.NETWORK_DNS_FAILURE,
    message: 'DNS lookup failed for agent endpoint',
    suggestion:
      'The hostname in your agent URL couldn\'t be resolved. Check the URL for typos. If using a custom domain, ensure DNS is properly configured.',
    category: ErrorCategory.NETWORK_ERROR,
    recoverable: true,
  },
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: {
    code: ErrorCode.NETWORK_CONNECTION_REFUSED,
    message: 'Connection to agent was refused',
    suggestion:
      'Your agent server refused the connection. This usually means the server isn\'t running on the expected port. Start your agent server and verify it\'s listening on the correct port.',
    category: ErrorCategory.NETWORK_ERROR,
    recoverable: true,
  },
  [ErrorCode.NETWORK_SSL_ERROR]: {
    code: ErrorCode.NETWORK_SSL_ERROR,
    message: 'SSL/TLS connection failed',
    suggestion:
      'Secure connection to your agent failed. Check that SSL certificates are valid and not expired. For local development, you may need to use http:// instead of https://.',
    category: ErrorCategory.NETWORK_ERROR,
    recoverable: true,
  },
};

/**
 * Get the error definition for a specific error code
 */
export function getErrorDefinition(code: ErrorCode): ErrorDefinition {
  return ERROR_TAXONOMY[code];
}

/**
 * Get all errors in a specific category
 */
export function getErrorsByCategory(category: ErrorCategory): ErrorDefinition[] {
  return Object.values(ERROR_TAXONOMY).filter((error) => error.category === category);
}

/**
 * Get suggestion for an error code
 */
export function getErrorSuggestion(code: ErrorCode): string {
  return ERROR_TAXONOMY[code].suggestion;
}

/**
 * Check if an error is recoverable
 */
export function isRecoverable(code: ErrorCode): boolean {
  return ERROR_TAXONOMY[code].recoverable;
}

/**
 * Format an error with context for display
 */
export function formatErrorWithContext(
  code: ErrorCode,
  details?: Record<string, unknown>
): {
  code: ErrorCode;
  message: string;
  suggestion: string;
  details?: Record<string, unknown>;
} {
  const definition = ERROR_TAXONOMY[code];
  return {
    code,
    message: definition.message,
    suggestion: definition.suggestion,
    ...(details && { details }),
  };
}
