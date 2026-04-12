/**
 * @agentbench/data - Data models and schemas for agentbench
 *
 * This package contains TypeScript types and schemas for:
 * - Test configurations
 * - Test results
 * - Agent configurations
 * - Evaluator definitions
 * - SQLite data layer with checkpoint recovery
 * - Storage abstraction for future Postgres migration
 */
export { SQLiteClient, createClient, createMemoryClient, getDefaultDbPath, CREATE_BENCHMARK_RUNS_TABLE, CREATE_BENCHMARK_RESULTS_TABLE, CREATE_CHECKPOINTS_TABLE, ALL_TABLES, ALL_INDEXES, FULL_SCHEMA, runInitialMigration, rollbackInitialMigration, isMigrationApplied, } from './sqlite/index.js';
export type { SQLiteClientOptions, BenchmarkRunStatus, BenchmarkRun, BenchmarkResult, Checkpoint, CreateBenchmarkRunInput, CreateBenchmarkResultInput, CreateCheckpointInput, BenchmarkRunFilters, } from './sqlite/index.js';
export { CheckpointWriter, createCheckpointWriter, CheckpointReader, createCheckpointReader, } from './checkpoints/index.js';
export type { CheckpointState, CheckpointWriterOptions, RecoverableRun, RecoveryOptions, } from './checkpoints/index.js';
export { AsyncStorageAdapter, registerStorageFactory, createStorage, isProviderAvailable, getAvailableProviders, } from './storage.js';
export type { Storage, SyncStorage, PaginatedResult, StorageProvider, StorageConfig, StorageFactory, } from './storage.js';
/**
 * Version of the configuration schema
 */
export declare const SCHEMA_VERSION = 1;
/**
 * Agent execution mode
 */
export type AgentMode = 'subprocess' | 'http';
/**
 * Configuration for running an agent as a subprocess
 */
export interface SubprocessAgentConfig {
    command: string;
    timeout?: number;
}
/**
 * Configuration for running an agent via HTTP
 */
export interface HttpAgentConfig {
    endpoint: string;
    timeout?: number;
}
/**
 * Combined agent configuration
 */
export type AgentConfig = SubprocessAgentConfig | HttpAgentConfig;
/**
 * Check if agent config is subprocess mode
 */
export declare function isSubprocessAgent(config: AgentConfig): config is SubprocessAgentConfig;
/**
 * Check if agent config is HTTP mode
 */
export declare function isHttpAgent(config: AgentConfig): config is HttpAgentConfig;
/**
 * Evaluator types supported by agentbench
 */
export type EvaluatorType = 'contains' | 'does_not_contain' | 'matches_intent';
/**
 * Base interface for all expectations
 */
export interface BaseExpectation {
    type: EvaluatorType;
}
/**
 * Contains expectation - checks if output includes a substring
 */
export interface ContainsExpectation extends BaseExpectation {
    type: 'contains';
    value: string | string[];
}
/**
 * Does not contain expectation - checks if output excludes substrings
 */
export interface DoesNotContainExpectation extends BaseExpectation {
    type: 'does_not_contain';
    value: string | string[];
}
/**
 * Matches intent expectation - semantic evaluation using LLM
 */
export interface MatchesIntentExpectation extends BaseExpectation {
    type: 'matches_intent';
    intent: string;
}
/**
 * Union of all expectation types
 */
export type Expectation = ContainsExpectation | DoesNotContainExpectation | MatchesIntentExpectation;
/**
 * Single test case definition
 */
export interface TestCase {
    name: string;
    input: string;
    expect: Expectation[];
}
/**
 * Complete test configuration
 */
export interface TestConfig {
    version: number;
    name: string;
    agent: AgentConfig;
    tests: TestCase[];
}
/**
 * Result of a single expectation evaluation
 */
export interface ExpectationResult {
    type: EvaluatorType;
    passed: boolean;
    message?: string;
    skipped?: boolean;
}
/**
 * Result of a single test case
 */
export interface TestResult {
    name: string;
    passed: boolean;
    input: string;
    output: string;
    expectations: ExpectationResult[];
    duration: number;
    error?: string;
}
/**
 * Result of a complete test run
 */
export interface TestRunResult {
    config: TestConfig;
    tests: TestResult[];
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    timestamp: Date;
}
/**
 * Default timeout for agent execution in milliseconds
 */
export declare const DEFAULT_TIMEOUT = 30000;
/**
 * Exit codes for CLI
 */
export declare const EXIT_CODES: {
    readonly SUCCESS: 0;
    readonly TESTS_FAILED: 1;
    readonly CONFIG_ERROR: 2;
};
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
//# sourceMappingURL=index.d.ts.map