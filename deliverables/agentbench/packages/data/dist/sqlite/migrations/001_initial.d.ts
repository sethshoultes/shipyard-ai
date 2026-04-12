/**
 * Initial database migration for agentbench.
 * Creates all core tables and indexes for benchmark data storage.
 */
import type { Database as DatabaseType } from 'better-sqlite3';
/**
 * Migration metadata
 */
export declare const MIGRATION_ID = "001_initial";
export declare const MIGRATION_NAME = "Initial schema creation";
export declare const MIGRATION_VERSION = 1;
/**
 * Check if a migration has been applied.
 * Returns false if the _migrations table doesn't exist.
 */
export declare function isMigrationApplied(db: DatabaseType, migrationId: string): boolean;
/**
 * Record that a migration has been applied
 */
export declare function recordMigration(db: DatabaseType, migrationId: string, name: string, version: number): void;
/**
 * Run the initial migration.
 * Creates all tables and indexes for agentbench data storage.
 * This migration is idempotent - safe to run multiple times.
 */
export declare function up(db: DatabaseType): void;
/**
 * Rollback the initial migration.
 * Drops all tables created by this migration.
 * WARNING: This will delete all data!
 */
export declare function down(db: DatabaseType): void;
/**
 * Get migration info
 */
export declare function getMigrationInfo(): {
    id: string;
    name: string;
    version: number;
};
//# sourceMappingURL=001_initial.d.ts.map