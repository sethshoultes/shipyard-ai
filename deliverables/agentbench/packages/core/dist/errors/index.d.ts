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
export { ErrorCategory, ErrorCode, ERROR_TAXONOMY, getErrorDefinition, getErrorsByCategory, getErrorSuggestion, isRecoverable, formatErrorWithContext, type ErrorDefinition, } from './taxonomy';
export { AgentBenchError, type AgentBenchErrorOptions, type SerializedError, } from './base';
export { AgentError, TimeoutError, ValidationError, ScoringError, SetupError, NetworkError, } from './categories';
export { isAgentError, isTimeoutError, isValidationError, isScoringError, isSetupError, isNetworkError, } from './categories';
//# sourceMappingURL=index.d.ts.map