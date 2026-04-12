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

// SQLite module exports - classes and functions
export {
  SQLiteClient,
  createClient,
  createMemoryClient,
  getDefaultDbPath,
  CREATE_BENCHMARK_RUNS_TABLE,
  CREATE_BENCHMARK_RESULTS_TABLE,
  CREATE_CHECKPOINTS_TABLE,
  ALL_TABLES,
  ALL_INDEXES,
  FULL_SCHEMA,
  runInitialMigration,
  rollbackInitialMigration,
  isMigrationApplied,
} from './sqlite/index.js';

// SQLite module exports - types
export type {
  SQLiteClientOptions,
  BenchmarkRunStatus,
  BenchmarkRun,
  BenchmarkResult,
  Checkpoint,
  CreateBenchmarkRunInput,
  CreateBenchmarkResultInput,
  CreateCheckpointInput,
  BenchmarkRunFilters,
} from './sqlite/index.js';

// Checkpoints module exports - classes and functions
export {
  CheckpointWriter,
  createCheckpointWriter,
  CheckpointReader,
  createCheckpointReader,
} from './checkpoints/index.js';

// Checkpoints module exports - types
export type {
  CheckpointState,
  CheckpointWriterOptions,
  RecoverableRun,
  RecoveryOptions,
} from './checkpoints/index.js';

// Storage abstraction exports - classes and functions
export {
  AsyncStorageAdapter,
  registerStorageFactory,
  createStorage,
  isProviderAvailable,
  getAvailableProviders,
} from './storage.js';

// Storage abstraction exports - types
export type {
  Storage,
  SyncStorage,
  PaginatedResult,
  StorageProvider,
  StorageConfig,
  StorageFactory,
} from './storage.js';

/**
 * Version of the configuration schema
 */
export const SCHEMA_VERSION = 1;

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
export function isSubprocessAgent(config: AgentConfig): config is SubprocessAgentConfig {
  return 'command' in config;
}

/**
 * Check if agent config is HTTP mode
 */
export function isHttpAgent(config: AgentConfig): config is HttpAgentConfig {
  return 'endpoint' in config;
}

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
export const DEFAULT_TIMEOUT = 30000;

/**
 * Exit codes for CLI
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  TESTS_FAILED: 1,
  CONFIG_ERROR: 2,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
