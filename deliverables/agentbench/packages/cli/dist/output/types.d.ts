/**
 * AgentBench CLI Output Types
 *
 * TypeScript type definitions for CLI benchmark results.
 * These types correspond to result.schema.json v1.0 (LOCKED)
 *
 * @version 1.0
 * @status LOCKED - Breaking changes require major version bump
 */
/**
 * Schema version constant - must match result.schema.json
 */
export declare const SCHEMA_VERSION: "1.0";
/**
 * Valid run status values
 */
export type RunStatus = 'completed' | 'failed' | 'partial' | 'timeout' | 'cancelled';
/**
 * Metadata about the CLI output and execution environment
 */
export interface OutputMeta {
    /**
     * Version of the output schema (semver format)
     */
    schema_version: typeof SCHEMA_VERSION;
    /**
     * ISO 8601 timestamp when the result was generated
     */
    timestamp: string;
    /**
     * Version of the AgentBench CLI that produced this output
     */
    cli_version: string;
}
/**
 * Information about the benchmark run execution
 */
export interface RunInfo {
    /**
     * Unique identifier for this benchmark run
     */
    id: string;
    /**
     * Name of the benchmark suite executed
     */
    suite: string;
    /**
     * Identifier of the agent being benchmarked
     */
    agent: string;
    /**
     * Total execution duration in milliseconds
     */
    duration: number;
    /**
     * Overall run status
     */
    status: RunStatus;
}
/**
 * Custom metrics for individual benchmarks
 */
export interface BenchmarkMetrics {
    [key: string]: string | number | boolean | null | undefined;
}
/**
 * Benchmark-specific details
 */
export interface BenchmarkDetails {
    /**
     * Individual benchmark duration in milliseconds
     */
    duration_ms?: number;
    /**
     * Error message if benchmark failed
     */
    error?: string | null;
    /**
     * Number of attempts made
     */
    attempts?: number;
    /**
     * Custom metrics for this benchmark
     */
    metrics?: BenchmarkMetrics;
    /**
     * Additional benchmark-specific properties
     */
    [key: string]: unknown;
}
/**
 * Individual benchmark result
 */
export interface BenchmarkResult {
    /**
     * Unique identifier for this benchmark
     */
    id: string;
    /**
     * Human-readable name of the benchmark
     */
    name: string;
    /**
     * Normalized score from 0 to 100
     */
    score: number;
    /**
     * Whether the benchmark met passing criteria
     */
    passed: boolean;
    /**
     * Additional benchmark-specific details
     */
    details: BenchmarkDetails;
}
/**
 * Aggregated summary of all benchmark results
 */
export interface ResultSummary {
    /**
     * Total number of benchmarks executed
     */
    total: number;
    /**
     * Number of benchmarks that passed
     */
    passed: number;
    /**
     * Number of benchmarks that failed
     */
    failed: number;
    /**
     * Overall aggregate score (0-100)
     */
    score: number;
}
/**
 * Complete CLI output result structure
 *
 * This is the root type for all AgentBench CLI JSON output.
 * Corresponds to result.schema.json v1.0 (LOCKED)
 */
export interface CLIOutputResult {
    /**
     * Metadata about the CLI output and execution environment
     */
    meta: OutputMeta;
    /**
     * Information about the benchmark run execution
     */
    run: RunInfo;
    /**
     * Individual benchmark results
     */
    benchmarks: BenchmarkResult[];
    /**
     * Aggregated summary of all benchmark results
     */
    summary: ResultSummary;
}
/**
 * Type guard to check if a value is a valid RunStatus
 */
export declare function isRunStatus(value: unknown): value is RunStatus;
/**
 * Type guard to check if a value matches the expected schema version
 */
export declare function isValidSchemaVersion(version: unknown): version is typeof SCHEMA_VERSION;
/**
 * Creates a new OutputMeta object with current timestamp
 */
export declare function createOutputMeta(cliVersion: string): OutputMeta;
/**
 * Creates an empty/initial ResultSummary
 */
export declare function createEmptySummary(): ResultSummary;
/**
 * Calculates summary from benchmark results
 */
export declare function calculateSummary(benchmarks: BenchmarkResult[]): ResultSummary;
//# sourceMappingURL=types.d.ts.map