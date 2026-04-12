/**
 * SQLite schema definitions for agentbench.
 * Defines table structures for benchmark runs, results, and checkpoints.
 */

/**
 * Status of a benchmark run
 */
export type BenchmarkRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'crashed';

/**
 * Benchmark run record - tracks a complete benchmark execution
 */
export interface BenchmarkRun {
  /** Unique identifier (UUID) */
  id: string;
  /** Name of the benchmark suite being run */
  suite: string;
  /** Agent identifier being benchmarked */
  agent: string;
  /** When the run started (ISO timestamp) */
  started_at: string;
  /** When the run completed (ISO timestamp, null if still running) */
  completed_at: string | null;
  /** Current status of the run */
  status: BenchmarkRunStatus;
  /** Optional metadata as JSON string */
  metadata: string | null;
}

/**
 * Benchmark result record - stores individual test results within a run
 */
export interface BenchmarkResult {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key to benchmark_runs.id */
  run_id: string;
  /** Identifier of the specific benchmark/test */
  benchmark_id: string;
  /** Numeric score (0-100 typically, or custom scale) */
  score: number;
  /** Detailed result data as JSON string */
  details: string;
  /** Execution duration in milliseconds */
  duration: number;
  /** When this result was recorded (ISO timestamp) */
  created_at: string;
}

/**
 * Checkpoint record - stores intermediate state for crash recovery
 */
export interface Checkpoint {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key to benchmark_runs.id */
  run_id: string;
  /** Serialized state as JSON string */
  state: string;
  /** When this checkpoint was created (ISO timestamp) */
  created_at: string;
}

/**
 * SQL statement to create the benchmark_runs table
 */
export const CREATE_BENCHMARK_RUNS_TABLE = `
CREATE TABLE IF NOT EXISTS benchmark_runs (
  id TEXT PRIMARY KEY NOT NULL,
  suite TEXT NOT NULL,
  agent TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'crashed')),
  metadata TEXT
)`;

/**
 * SQL statement to create the benchmark_results table
 */
export const CREATE_BENCHMARK_RESULTS_TABLE = `
CREATE TABLE IF NOT EXISTS benchmark_results (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  benchmark_id TEXT NOT NULL,
  score REAL NOT NULL,
  details TEXT NOT NULL DEFAULT '{}',
  duration INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
)`;

/**
 * SQL statement to create the checkpoints table
 */
export const CREATE_CHECKPOINTS_TABLE = `
CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
)`;

/**
 * Index for looking up results by run
 */
export const CREATE_RESULTS_RUN_INDEX = `
CREATE INDEX IF NOT EXISTS idx_benchmark_results_run_id ON benchmark_results(run_id)`;

/**
 * Index for looking up checkpoints by run
 */
export const CREATE_CHECKPOINTS_RUN_INDEX = `
CREATE INDEX IF NOT EXISTS idx_checkpoints_run_id ON checkpoints(run_id)`;

/**
 * Index for looking up runs by status (useful for finding crashed runs)
 */
export const CREATE_RUNS_STATUS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_status ON benchmark_runs(status)`;

/**
 * Index for looking up runs by suite
 */
export const CREATE_RUNS_SUITE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_suite ON benchmark_runs(suite)`;

/**
 * All table creation statements in order
 */
export const ALL_TABLES = [
  CREATE_BENCHMARK_RUNS_TABLE,
  CREATE_BENCHMARK_RESULTS_TABLE,
  CREATE_CHECKPOINTS_TABLE,
];

/**
 * All index creation statements
 */
export const ALL_INDEXES = [
  CREATE_RESULTS_RUN_INDEX,
  CREATE_CHECKPOINTS_RUN_INDEX,
  CREATE_RUNS_STATUS_INDEX,
  CREATE_RUNS_SUITE_INDEX,
];

/**
 * Complete schema - tables and indexes
 */
export const FULL_SCHEMA = [...ALL_TABLES, ...ALL_INDEXES];

/**
 * Input for creating a new benchmark run
 */
export interface CreateBenchmarkRunInput {
  id: string;
  suite: string;
  agent: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for creating a new benchmark result
 */
export interface CreateBenchmarkResultInput {
  id: string;
  run_id: string;
  benchmark_id: string;
  score: number;
  details: Record<string, unknown>;
  duration: number;
}

/**
 * Input for creating a new checkpoint
 */
export interface CreateCheckpointInput {
  id: string;
  run_id: string;
  state: Record<string, unknown>;
}

/**
 * Query filters for benchmark runs
 */
export interface BenchmarkRunFilters {
  status?: BenchmarkRunStatus;
  suite?: string;
  agent?: string;
  limit?: number;
  offset?: number;
}
