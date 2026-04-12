/**
 * AgentBench Error System
 *
 * A comprehensive error handling system designed to teach, not punish.
 * Every error includes actionable suggestions to help developers fix issues quickly.
 *
 * @example
 * ```typescript
 * import {
 *   AgentBenchError,
 *   AgentError,
 *   TimeoutError,
 *   ErrorCode,
 *   ErrorCategory
 * } from '@agentbench/core/errors';
 *
 * // Throw a specific error with context
 * throw TimeoutError.execution(45000, 30000);
 *
 * // Wrap unknown errors
 * catch (e) {
 *   throw AgentBenchError.wrap(e);
 * }
 *
 * // Check error types
 * if (isTimeoutError(error)) {
 *   // Handle timeout specifically
 * }
 * ```
 */

// Export taxonomy (error codes, categories, definitions)
export {
  ErrorCategory,
  ErrorCode,
  ERROR_TAXONOMY,
  getErrorDefinition,
  getErrorsByCategory,
  getErrorSuggestion,
  isRecoverable,
  formatErrorWithContext,
  type ErrorDefinition,
} from './taxonomy';

// Export base error class
export {
  AgentBenchError,
  type AgentBenchErrorOptions,
  type SerializedError,
} from './base';

// Export category-specific error classes
export {
  AgentError,
  TimeoutError,
  ValidationError,
  ScoringError,
  SetupError,
  NetworkError,
} from './categories';

// Export type guards
export {
  isAgentError,
  isTimeoutError,
  isValidationError,
  isScoringError,
  isSetupError,
  isNetworkError,
} from './categories';
