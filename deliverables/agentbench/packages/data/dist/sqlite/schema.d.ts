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
export declare const CREATE_BENCHMARK_RUNS_TABLE = "\nCREATE TABLE IF NOT EXISTS benchmark_runs (\n  id TEXT PRIMARY KEY NOT NULL,\n  suite TEXT NOT NULL,\n  agent TEXT NOT NULL,\n  started_at TEXT NOT NULL DEFAULT (datetime('now')),\n  completed_at TEXT,\n  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'crashed')),\n  metadata TEXT\n)";
/**
 * SQL statement to create the benchmark_results table
 */
export declare const CREATE_BENCHMARK_RESULTS_TABLE = "\nCREATE TABLE IF NOT EXISTS benchmark_results (\n  id TEXT PRIMARY KEY NOT NULL,\n  run_id TEXT NOT NULL,\n  benchmark_id TEXT NOT NULL,\n  score REAL NOT NULL,\n  details TEXT NOT NULL DEFAULT '{}',\n  duration INTEGER NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE\n)";
/**
 * SQL statement to create the checkpoints table
 */
export declare const CREATE_CHECKPOINTS_TABLE = "\nCREATE TABLE IF NOT EXISTS checkpoints (\n  id TEXT PRIMARY KEY NOT NULL,\n  run_id TEXT NOT NULL,\n  state TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE\n)";
/**
 * Index for looking up results by run
 */
export declare const CREATE_RESULTS_RUN_INDEX = "\nCREATE INDEX IF NOT EXISTS idx_benchmark_results_run_id ON benchmark_results(run_id)";
/**
 * Index for looking up checkpoints by run
 */
export declare const CREATE_CHECKPOINTS_RUN_INDEX = "\nCREATE INDEX IF NOT EXISTS idx_checkpoints_run_id ON checkpoints(run_id)";
/**
 * Index for looking up runs by status (useful for finding crashed runs)
 */
export declare const CREATE_RUNS_STATUS_INDEX = "\nCREATE INDEX IF NOT EXISTS idx_benchmark_runs_status ON benchmark_runs(status)";
/**
 * Index for looking up runs by suite
 */
export declare const CREATE_RUNS_SUITE_INDEX = "\nCREATE INDEX IF NOT EXISTS idx_benchmark_runs_suite ON benchmark_runs(suite)";
/**
 * All table creation statements in order
 */
export declare const ALL_TABLES: string[];
/**
 * All index creation statements
 */
export declare const ALL_INDEXES: string[];
/**
 * Complete schema - tables and indexes
 */
export declare const FULL_SCHEMA: string[];
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
//# sourceMappingURL=schema.d.ts.map