/**
 * SQLite module exports
 */

// Client exports
export { SQLiteClient, createClient, createMemoryClient, getDefaultDbPath } from './client.js';
export type { SQLiteClientOptions } from './client.js';

// Schema exports - types
export type {
  BenchmarkRunStatus,
  BenchmarkRun,
  BenchmarkResult,
  Checkpoint,
  CreateBenchmarkRunInput,
  CreateBenchmarkResultInput,
  CreateCheckpointInput,
  BenchmarkRunFilters,
} from './schema.js';

// Schema exports - SQL statements
export {
  CREATE_BENCHMARK_RUNS_TABLE,
  CREATE_BENCHMARK_RESULTS_TABLE,
  CREATE_CHECKPOINTS_TABLE,
  CREATE_RESULTS_RUN_INDEX,
  CREATE_CHECKPOINTS_RUN_INDEX,
  CREATE_RUNS_STATUS_INDEX,
  CREATE_RUNS_SUITE_INDEX,
  ALL_TABLES,
  ALL_INDEXES,
  FULL_SCHEMA,
} from './schema.js';

// Migration exports
export {
  up as runInitialMigration,
  down as rollbackInitialMigration,
  isMigrationApplied,
  recordMigration,
  getMigrationInfo,
  MIGRATION_ID,
  MIGRATION_NAME,
  MIGRATION_VERSION,
} from './migrations/001_initial.js';
