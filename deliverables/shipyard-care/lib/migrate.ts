/**
 * Database Migration Framework
 * Requirement: REQ-015 - Versioned, idempotent migration system
 *
 * Provides functionality to run database migrations in order,
 * track applied migrations, and ensure idempotency.
 */

import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration metadata
 */
interface Migration {
  id: number;
  name: string;
  filename: string;
  appliedAt?: Date;
}

/**
 * Migration result
 */
interface MigrationResult {
  success: boolean;
  migrationsApplied: string[];
  errors: string[];
}

/**
 * Initialize the migrations tracking table
 * Creates the table if it doesn't exist (idempotent)
 */
async function initMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
  const result = await client.query(
    'SELECT name FROM schema_migrations ORDER BY id'
  );
  return new Set(result.rows.map((row) => row.name));
}

/**
 * Get all migration files from the migrations directory
 */
function getMigrationFiles(migrationsDir: string): Migration[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs.readdirSync(migrationsDir);
  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

  return sqlFiles.map((filename, index) => ({
    id: index + 1,
    name: filename.replace('.sql', ''),
    filename,
  }));
}

/**
 * Apply a single migration
 */
async function applyMigration(
  client: PoolClient,
  migration: Migration,
  migrationsDir: string
): Promise<void> {
  const filePath = path.join(migrationsDir, migration.filename);
  const sql = fs.readFileSync(filePath, 'utf-8');

  // Execute the migration SQL
  await client.query(sql);

  // Record the migration as applied
  await client.query(
    'INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [migration.name]
  );
}

/**
 * Run all pending migrations
 *
 * @param pool - Database connection pool
 * @param migrationsDir - Path to migrations directory
 * @returns Migration result with list of applied migrations
 */
export async function runMigrations(
  pool: Pool,
  migrationsDir: string = path.join(__dirname, '../migrations')
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migrationsApplied: [],
    errors: [],
  };

  const client = await pool.connect();

  try {
    // Initialize migrations table
    await initMigrationsTable(client);

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(client);

    // Get all migration files
    const allMigrations = getMigrationFiles(migrationsDir);

    // Find pending migrations
    const pendingMigrations = allMigrations.filter(
      (m) => !appliedMigrations.has(m.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('[Migrations] No pending migrations');
      return result;
    }

    console.log(
      `[Migrations] Found ${pendingMigrations.length} pending migrations`
    );

    // Apply each pending migration
    for (const migration of pendingMigrations) {
      try {
        console.log(`[Migrations] Applying: ${migration.name}`);
        await applyMigration(client, migration, migrationsDir);
        result.migrationsApplied.push(migration.name);
        console.log(`[Migrations] Applied: ${migration.name}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`${migration.name}: ${errorMessage}`);
        result.success = false;
        console.error(`[Migrations] Failed: ${migration.name} - ${errorMessage}`);
        break; // Stop on first error
      }
    }
  } finally {
    client.release();
  }

  return result;
}

/**
 * Rollback the last applied migration
 * Note: Requires corresponding down migration files (not implemented in base version)
 */
export async function rollbackMigration(
  pool: Pool,
  _migrationsDir: string = path.join(__dirname, '../migrations')
): Promise<{ success: boolean; rolledBack?: string; error?: string }> {
  const client = await pool.connect();

  try {
    // Get the last applied migration
    const result = await client.query(
      'SELECT name FROM schema_migrations ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return { success: true, rolledBack: undefined };
    }

    const lastMigration = result.rows[0].name;

    // Note: In a full implementation, we would look for a down migration file
    // and execute it here. For now, we just remove the migration record.
    console.warn(
      `[Migrations] Rollback requested for ${lastMigration}. Manual intervention may be required.`
    );

    return {
      success: false,
      error:
        'Automatic rollback not supported. Please create and run a down migration manually.',
    };
  } finally {
    client.release();
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(
  pool: Pool,
  migrationsDir: string = path.join(__dirname, '../migrations')
): Promise<{ applied: string[]; pending: string[] }> {
  const client = await pool.connect();

  try {
    await initMigrationsTable(client);
    const appliedMigrations = await getAppliedMigrations(client);
    const allMigrations = getMigrationFiles(migrationsDir);

    const applied = allMigrations
      .filter((m) => appliedMigrations.has(m.name))
      .map((m) => m.name);

    const pending = allMigrations
      .filter((m) => !appliedMigrations.has(m.name))
      .map((m) => m.name);

    return { applied, pending };
  } finally {
    client.release();
  }
}
