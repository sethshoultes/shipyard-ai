/**
 * Initial database migration for agentbench.
 * Creates all core tables and indexes for benchmark data storage.
 */

import type { Database as DatabaseType } from 'better-sqlite3';
import {
  CREATE_BENCHMARK_RUNS_TABLE,
  CREATE_BENCHMARK_RESULTS_TABLE,
  CREATE_CHECKPOINTS_TABLE,
  CREATE_RESULTS_RUN_INDEX,
  CREATE_CHECKPOINTS_RUN_INDEX,
  CREATE_RUNS_STATUS_INDEX,
  CREATE_RUNS_SUITE_INDEX,
} from '../schema.js';

/**
 * Migration metadata
 */
export const MIGRATION_ID = '001_initial';
export const MIGRATION_NAME = 'Initial schema creation';
export const MIGRATION_VERSION = 1;

/**
 * Create the migrations tracking table
 */
const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

/**
 * Check if a migration has been applied.
 * Returns false if the _migrations table doesn't exist.
 */
export function isMigrationApplied(db: DatabaseType, migrationId: string): boolean {
  // First check if the _migrations table exists
  const tableExists = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='_migrations'")
    .get();

  if (!tableExists) {
    return false;
  }

  const stmt = db.prepare('SELECT 1 FROM _migrations WHERE id = ?');
  const result = stmt.get(migrationId);
  return result !== undefined;
}

/**
 * Record that a migration has been applied
 */
export function recordMigration(
  db: DatabaseType,
  migrationId: string,
  name: string,
  version: number
): void {
  const stmt = db.prepare(
    'INSERT INTO _migrations (id, name, version) VALUES (?, ?, ?)'
  );
  stmt.run(migrationId, name, version);
}

/**
 * Run the initial migration.
 * Creates all tables and indexes for agentbench data storage.
 * This migration is idempotent - safe to run multiple times.
 */
export function up(db: DatabaseType): void {
  // Ensure migrations table exists first
  db.exec(CREATE_MIGRATIONS_TABLE);

  // Check if already applied
  if (isMigrationApplied(db, MIGRATION_ID)) {
    return;
  }

  // Create all tables in a transaction for atomicity
  const migrate = db.transaction(() => {
    // Create core tables
    db.exec(CREATE_BENCHMARK_RUNS_TABLE);
    db.exec(CREATE_BENCHMARK_RESULTS_TABLE);
    db.exec(CREATE_CHECKPOINTS_TABLE);

    // Create indexes for common query patterns
    db.exec(CREATE_RESULTS_RUN_INDEX);
    db.exec(CREATE_CHECKPOINTS_RUN_INDEX);
    db.exec(CREATE_RUNS_STATUS_INDEX);
    db.exec(CREATE_RUNS_SUITE_INDEX);

    // Record successful migration
    recordMigration(db, MIGRATION_ID, MIGRATION_NAME, MIGRATION_VERSION);
  });

  migrate();
}

/**
 * Rollback the initial migration.
 * Drops all tables created by this migration.
 * WARNING: This will delete all data!
 */
export function down(db: DatabaseType): void {
  const rollback = db.transaction(() => {
    // Drop tables in reverse order of creation (respects foreign keys)
    db.exec('DROP TABLE IF EXISTS checkpoints');
    db.exec('DROP TABLE IF EXISTS benchmark_results');
    db.exec('DROP TABLE IF EXISTS benchmark_runs');

    // Remove migration record
    const stmt = db.prepare('DELETE FROM _migrations WHERE id = ?');
    stmt.run(MIGRATION_ID);
  });

  rollback();
}

/**
 * Get migration info
 */
export function getMigrationInfo(): {
  id: string;
  name: string;
  version: number;
} {
  return {
    id: MIGRATION_ID,
    name: MIGRATION_NAME,
    version: MIGRATION_VERSION,
  };
}
