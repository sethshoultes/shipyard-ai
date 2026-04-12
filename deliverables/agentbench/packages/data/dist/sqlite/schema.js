/**
 * SQLite schema definitions for agentbench.
 * Defines table structures for benchmark runs, results, and checkpoints.
 */
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
//# sourceMappingURL=schema.js.map