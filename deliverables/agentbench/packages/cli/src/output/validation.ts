/**
 * AgentBench CLI Output Validation
 *
 * Zod schema validation for CLI benchmark results.
 * Validates against result.schema.json v1.0 (LOCKED)
 *
 * @version 1.0
 * @status LOCKED - Breaking changes require major version bump
 */

import { z } from 'zod';
import { SCHEMA_VERSION } from './types.js';
import type {
  CLIOutputResult,
  OutputMeta,
  RunInfo,
  BenchmarkResult,
  BenchmarkDetails,
  ResultSummary,
  RunStatus,
} from './types.js';

/**
 * Validation for run status enum
 */
export const RunStatusSchema = z.enum([
  'completed',
  'failed',
  'partial',
  'timeout',
  'cancelled',
]);

/**
 * Validation for output metadata
 */
export const OutputMetaSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  timestamp: z.string().datetime({ message: 'timestamp must be ISO 8601 format' }),
  cli_version: z.string().regex(
    /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/,
    'cli_version must be valid semver format'
  ),
}).strict();

/**
 * Validation for run information
 */
export const RunInfoSchema = z.object({
  id: z.string().regex(
    /^[a-zA-Z0-9-]+$/,
    'id must contain only alphanumeric characters and hyphens'
  ),
  suite: z.string().min(1, 'suite cannot be empty'),
  agent: z.string().min(1, 'agent cannot be empty'),
  duration: z.number().nonnegative('duration must be non-negative'),
  status: RunStatusSchema,
}).strict();

/**
 * Validation for custom benchmark metrics
 */
export const BenchmarkMetricsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

/**
 * Validation for benchmark details
 */
export const BenchmarkDetailsSchema = z.object({
  duration_ms: z.number().nonnegative().optional(),
  error: z.string().nullable().optional(),
  attempts: z.number().int().min(1).optional(),
  metrics: BenchmarkMetricsSchema.optional(),
}).passthrough(); // Allow additional properties

/**
 * Validation for individual benchmark result
 */
export const BenchmarkResultSchema = z.object({
  id: z.string().regex(
    /^[a-zA-Z0-9-_]+$/,
    'id must contain only alphanumeric characters, hyphens, and underscores'
  ),
  name: z.string().min(1, 'name cannot be empty'),
  score: z.number().min(0, 'score must be >= 0').max(100, 'score must be <= 100'),
  passed: z.boolean(),
  details: BenchmarkDetailsSchema,
}).strict();

/**
 * Validation for result summary
 */
export const ResultSummarySchema = z.object({
  total: z.number().int().nonnegative('total must be non-negative integer'),
  passed: z.number().int().nonnegative('passed must be non-negative integer'),
  failed: z.number().int().nonnegative('failed must be non-negative integer'),
  score: z.number().min(0, 'score must be >= 0').max(100, 'score must be <= 100'),
}).strict().refine(
  (data) => data.passed + data.failed === data.total,
  { message: 'passed + failed must equal total' }
);

/**
 * Complete CLI output result validation schema
 */
export const CLIOutputResultSchema = z.object({
  meta: OutputMetaSchema,
  run: RunInfoSchema,
  benchmarks: z.array(BenchmarkResultSchema),
  summary: ResultSummarySchema,
}).strict();

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

/**
 * Validates a CLI output result object
 *
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCLIOutputResult(data: unknown): ValidationResult<CLIOutputResult> {
  const result = CLIOutputResultSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as CLIOutputResult,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Validates and throws on error
 *
 * @param data - The data to validate
 * @returns Parsed and validated CLI output result
 * @throws {z.ZodError} If validation fails
 */
export function parseAndValidate(data: unknown): CLIOutputResult {
  return CLIOutputResultSchema.parse(data) as CLIOutputResult;
}

/**
 * Validates output metadata only
 *
 * @param data - The metadata to validate
 * @returns Validation result
 */
export function validateMeta(data: unknown): ValidationResult<OutputMeta> {
  const result = OutputMetaSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as OutputMeta,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Validates run information only
 *
 * @param data - The run info to validate
 * @returns Validation result
 */
export function validateRunInfo(data: unknown): ValidationResult<RunInfo> {
  const result = RunInfoSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as RunInfo,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Validates a single benchmark result
 *
 * @param data - The benchmark result to validate
 * @returns Validation result
 */
export function validateBenchmarkResult(data: unknown): ValidationResult<BenchmarkResult> {
  const result = BenchmarkResultSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as BenchmarkResult,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Validates result summary
 *
 * @param data - The summary to validate
 * @returns Validation result
 */
export function validateSummary(data: unknown): ValidationResult<ResultSummary> {
  const result = ResultSummarySchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as ResultSummary,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Formats validation errors for display
 *
 * @param errors - Zod validation errors
 * @returns Human-readable error messages
 */
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : 'root';
    return `[${path}] ${err.message}`;
  });
}

/**
 * Checks if data conforms to schema version 1.0
 *
 * @param data - The data to check
 * @returns True if data is valid schema v1.0
 */
export function isSchemaV1(data: unknown): data is CLIOutputResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  const meta = obj.meta as Record<string, unknown> | undefined;

  return meta?.schema_version === SCHEMA_VERSION && validateCLIOutputResult(data).success;
}

// Re-export types for convenience
export type {
  CLIOutputResult,
  OutputMeta,
  RunInfo,
  BenchmarkResult,
  BenchmarkDetails,
  ResultSummary,
  RunStatus,
};
