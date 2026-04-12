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
import type { CLIOutputResult, OutputMeta, RunInfo, BenchmarkResult, BenchmarkDetails, ResultSummary, RunStatus } from './types.js';
/**
 * Validation for run status enum
 */
export declare const RunStatusSchema: z.ZodEnum<["completed", "failed", "partial", "timeout", "cancelled"]>;
/**
 * Validation for output metadata
 */
export declare const OutputMetaSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.0">;
    timestamp: z.ZodString;
    cli_version: z.ZodString;
}, "strict", z.ZodTypeAny, {
    schema_version: "1.0";
    timestamp: string;
    cli_version: string;
}, {
    schema_version: "1.0";
    timestamp: string;
    cli_version: string;
}>;
/**
 * Validation for run information
 */
export declare const RunInfoSchema: z.ZodObject<{
    id: z.ZodString;
    suite: z.ZodString;
    agent: z.ZodString;
    duration: z.ZodNumber;
    status: z.ZodEnum<["completed", "failed", "partial", "timeout", "cancelled"]>;
}, "strict", z.ZodTypeAny, {
    status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
    id: string;
    suite: string;
    agent: string;
    duration: number;
}, {
    status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
    id: string;
    suite: string;
    agent: string;
    duration: number;
}>;
/**
 * Validation for custom benchmark metrics
 */
export declare const BenchmarkMetricsSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
/**
 * Validation for benchmark details
 */
export declare const BenchmarkDetailsSchema: z.ZodObject<{
    duration_ms: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    attempts: z.ZodOptional<z.ZodNumber>;
    metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    duration_ms: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    attempts: z.ZodOptional<z.ZodNumber>;
    metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    duration_ms: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    attempts: z.ZodOptional<z.ZodNumber>;
    metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
}, z.ZodTypeAny, "passthrough">>;
/**
 * Validation for individual benchmark result
 */
export declare const BenchmarkResultSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    details: z.ZodObject<{
        duration_ms: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        attempts: z.ZodOptional<z.ZodNumber>;
        metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        duration_ms: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        attempts: z.ZodOptional<z.ZodNumber>;
        metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        duration_ms: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        attempts: z.ZodOptional<z.ZodNumber>;
        metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strict", z.ZodTypeAny, {
    id: string;
    name: string;
    score: number;
    passed: boolean;
    details: {
        duration_ms?: number | undefined;
        error?: string | null | undefined;
        attempts?: number | undefined;
        metrics?: Record<string, string | number | boolean | null> | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    id: string;
    name: string;
    score: number;
    passed: boolean;
    details: {
        duration_ms?: number | undefined;
        error?: string | null | undefined;
        attempts?: number | undefined;
        metrics?: Record<string, string | number | boolean | null> | undefined;
    } & {
        [k: string]: unknown;
    };
}>;
/**
 * Validation for result summary
 */
export declare const ResultSummarySchema: z.ZodEffects<z.ZodObject<{
    total: z.ZodNumber;
    passed: z.ZodNumber;
    failed: z.ZodNumber;
    score: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    failed: number;
    score: number;
    passed: number;
    total: number;
}, {
    failed: number;
    score: number;
    passed: number;
    total: number;
}>, {
    failed: number;
    score: number;
    passed: number;
    total: number;
}, {
    failed: number;
    score: number;
    passed: number;
    total: number;
}>;
/**
 * Complete CLI output result validation schema
 */
export declare const CLIOutputResultSchema: z.ZodObject<{
    meta: z.ZodObject<{
        schema_version: z.ZodLiteral<"1.0">;
        timestamp: z.ZodString;
        cli_version: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        schema_version: "1.0";
        timestamp: string;
        cli_version: string;
    }, {
        schema_version: "1.0";
        timestamp: string;
        cli_version: string;
    }>;
    run: z.ZodObject<{
        id: z.ZodString;
        suite: z.ZodString;
        agent: z.ZodString;
        duration: z.ZodNumber;
        status: z.ZodEnum<["completed", "failed", "partial", "timeout", "cancelled"]>;
    }, "strict", z.ZodTypeAny, {
        status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
        id: string;
        suite: string;
        agent: string;
        duration: number;
    }, {
        status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
        id: string;
        suite: string;
        agent: string;
        duration: number;
    }>;
    benchmarks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        score: z.ZodNumber;
        passed: z.ZodBoolean;
        details: z.ZodObject<{
            duration_ms: z.ZodOptional<z.ZodNumber>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            attempts: z.ZodOptional<z.ZodNumber>;
            metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            duration_ms: z.ZodOptional<z.ZodNumber>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            attempts: z.ZodOptional<z.ZodNumber>;
            metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            duration_ms: z.ZodOptional<z.ZodNumber>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            attempts: z.ZodOptional<z.ZodNumber>;
            metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        name: string;
        score: number;
        passed: boolean;
        details: {
            duration_ms?: number | undefined;
            error?: string | null | undefined;
            attempts?: number | undefined;
            metrics?: Record<string, string | number | boolean | null> | undefined;
        } & {
            [k: string]: unknown;
        };
    }, {
        id: string;
        name: string;
        score: number;
        passed: boolean;
        details: {
            duration_ms?: number | undefined;
            error?: string | null | undefined;
            attempts?: number | undefined;
            metrics?: Record<string, string | number | boolean | null> | undefined;
        } & {
            [k: string]: unknown;
        };
    }>, "many">;
    summary: z.ZodEffects<z.ZodObject<{
        total: z.ZodNumber;
        passed: z.ZodNumber;
        failed: z.ZodNumber;
        score: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        failed: number;
        score: number;
        passed: number;
        total: number;
    }, {
        failed: number;
        score: number;
        passed: number;
        total: number;
    }>, {
        failed: number;
        score: number;
        passed: number;
        total: number;
    }, {
        failed: number;
        score: number;
        passed: number;
        total: number;
    }>;
}, "strict", z.ZodTypeAny, {
    meta: {
        schema_version: "1.0";
        timestamp: string;
        cli_version: string;
    };
    run: {
        status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
        id: string;
        suite: string;
        agent: string;
        duration: number;
    };
    benchmarks: {
        id: string;
        name: string;
        score: number;
        passed: boolean;
        details: {
            duration_ms?: number | undefined;
            error?: string | null | undefined;
            attempts?: number | undefined;
            metrics?: Record<string, string | number | boolean | null> | undefined;
        } & {
            [k: string]: unknown;
        };
    }[];
    summary: {
        failed: number;
        score: number;
        passed: number;
        total: number;
    };
}, {
    meta: {
        schema_version: "1.0";
        timestamp: string;
        cli_version: string;
    };
    run: {
        status: "completed" | "failed" | "partial" | "timeout" | "cancelled";
        id: string;
        suite: string;
        agent: string;
        duration: number;
    };
    benchmarks: {
        id: string;
        name: string;
        score: number;
        passed: boolean;
        details: {
            duration_ms?: number | undefined;
            error?: string | null | undefined;
            attempts?: number | undefined;
            metrics?: Record<string, string | number | boolean | null> | undefined;
        } & {
            [k: string]: unknown;
        };
    }[];
    summary: {
        failed: number;
        score: number;
        passed: number;
        total: number;
    };
}>;
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
export declare function validateCLIOutputResult(data: unknown): ValidationResult<CLIOutputResult>;
/**
 * Validates and throws on error
 *
 * @param data - The data to validate
 * @returns Parsed and validated CLI output result
 * @throws {z.ZodError} If validation fails
 */
export declare function parseAndValidate(data: unknown): CLIOutputResult;
/**
 * Validates output metadata only
 *
 * @param data - The metadata to validate
 * @returns Validation result
 */
export declare function validateMeta(data: unknown): ValidationResult<OutputMeta>;
/**
 * Validates run information only
 *
 * @param data - The run info to validate
 * @returns Validation result
 */
export declare function validateRunInfo(data: unknown): ValidationResult<RunInfo>;
/**
 * Validates a single benchmark result
 *
 * @param data - The benchmark result to validate
 * @returns Validation result
 */
export declare function validateBenchmarkResult(data: unknown): ValidationResult<BenchmarkResult>;
/**
 * Validates result summary
 *
 * @param data - The summary to validate
 * @returns Validation result
 */
export declare function validateSummary(data: unknown): ValidationResult<ResultSummary>;
/**
 * Formats validation errors for display
 *
 * @param errors - Zod validation errors
 * @returns Human-readable error messages
 */
export declare function formatValidationErrors(errors: z.ZodError): string[];
/**
 * Checks if data conforms to schema version 1.0
 *
 * @param data - The data to check
 * @returns True if data is valid schema v1.0
 */
export declare function isSchemaV1(data: unknown): data is CLIOutputResult;
export type { CLIOutputResult, OutputMeta, RunInfo, BenchmarkResult, BenchmarkDetails, ResultSummary, RunStatus, };
//# sourceMappingURL=validation.d.ts.map