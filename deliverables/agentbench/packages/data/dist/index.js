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
export { SQLiteClient, createClient, createMemoryClient, getDefaultDbPath, CREATE_BENCHMARK_RUNS_TABLE, CREATE_BENCHMARK_RESULTS_TABLE, CREATE_CHECKPOINTS_TABLE, ALL_TABLES, ALL_INDEXES, FULL_SCHEMA, runInitialMigration, rollbackInitialMigration, isMigrationApplied, } from './sqlite/index.js';
// Checkpoints module exports - classes and functions
export { CheckpointWriter, createCheckpointWriter, CheckpointReader, createCheckpointReader, } from './checkpoints/index.js';
// Storage abstraction exports - classes and functions
export { AsyncStorageAdapter, registerStorageFactory, createStorage, isProviderAvailable, getAvailableProviders, } from './storage.js';
/**
 * Version of the configuration schema
 */
export const SCHEMA_VERSION = 1;
/**
 * Check if agent config is subprocess mode
 */
export function isSubprocessAgent(config) {
    return 'command' in config;
}
/**
 * Check if agent config is HTTP mode
 */
export function isHttpAgent(config) {
    return 'endpoint' in config;
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
};
//# sourceMappingURL=index.js.map