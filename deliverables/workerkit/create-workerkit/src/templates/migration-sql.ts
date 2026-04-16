/**
 * migration-sql.ts
 *
 * Generates the initial D1 database migration file (migrations/0001_create_users.sql).
 * Includes a CREATE TABLE users with proper SQLite syntax, indexes for performance,
 * and inline SQL comments explaining the D1 migration workflow.
 */

export interface MigrationConfig {
  projectName: string;
}

/**
 * Generates migrations/0001_create_users.sql with example users table
 *
 * Features:
 * - CREATE TABLE users with id (TEXT PRIMARY KEY), email (UNIQUE), created_at (TIMESTAMP)
 * - CREATE INDEX on email column for query performance
 * - Inline SQL comments explaining D1 migration workflow
 * - Pure SQLite syntax (no PostgreSQL-specific features)
 *
 * @param config Configuration with project name for helpful comments
 * @returns Migration SQL content as a string
 */
export function generateMigration(config: MigrationConfig): string {
  return `-- ============================================================================
-- D1 Database Migration
-- File: migrations/0001_create_users.sql
--
-- This is a D1 (SQLite) database migration that creates the initial schema.
-- D1 uses SQLite, so all SQL syntax must be SQLite-compatible.
--
-- ============================================================================
-- HOW TO RUN THIS MIGRATION
-- ============================================================================
--
-- 1. Ensure D1 database exists:
--    wrangler d1 create ${config.projectName}_db
--
-- 2. Run this migration file against the database:
--    wrangler d1 execute ${config.projectName}_db --local --file migrations/0001_create_users.sql
--
-- 3. For production deployment:
--    wrangler d1 execute ${config.projectName}_db --remote --file migrations/0001_create_users.sql
--
-- Learn more: https://developers.cloudflare.com/d1/manage/migrations/
--
-- ============================================================================

-- Create users table
-- This is the primary table for user data.
--
-- Schema design:
-- - id: TEXT PRIMARY KEY
--   Use UUIDs or nanoid for distributed primary keys (database-generated IDs don't work well with edge replicas)
--
-- - email: TEXT UNIQUE NOT NULL
--   Email is unique to prevent duplicates. Indexed separately for fast lookups.
--   In production, normalize email to lowercase before insertion.
--
-- - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--   Automatically set when row is inserted. Useful for sorting and auditing.
--
-- Example insert in your code:
-- const db = c.env.DB;
-- await query(db, 'INSERT INTO users (id, email) VALUES (?, ?)', [nanoid(), 'user@example.com'])
--
CREATE TABLE IF NOT EXISTS users (
  -- Unique identifier for each user
  -- Use nanoid() or crypto.randomUUID() to generate IDs in your application
  -- Example: const userId = nanoid(); // generates: V1StGXR_Z5j
  id TEXT PRIMARY KEY,

  -- User's email address
  -- Must be unique across the table (prevents duplicate accounts)
  -- Recommended: normalize to lowercase before insertion
  -- Example: email = 'John@Example.com' -> normalized to 'john@example.com'
  email TEXT UNIQUE NOT NULL,

  -- Timestamp when user was created
  -- Automatically set to current time if not provided
  -- Stored in ISO 8601 format: 2024-04-16T12:34:56.000Z
  -- Example query: SELECT * FROM users WHERE created_at > datetime('now', '-7 days')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CREATE INDEX ON EMAIL COLUMN
-- ============================================================================
--
-- Indexes improve query performance for frequently searched columns.
-- Without this index, queries like "SELECT * FROM users WHERE email = ?"
-- would require a full table scan (slow as the table grows).
--
-- Index performance:
-- - Without index: O(n) - scans every row
-- - With index: O(log n) - binary search in index
--
-- Index size: Minimal (SQLite indexes are B-tree structures)
--
-- Example queries that benefit from this index:
-- - SELECT * FROM users WHERE email = 'user@example.com'
-- - SELECT * FROM users WHERE email = 'user@example.com' AND created_at > datetime('now', '-30 days')
--
-- Note: The email column already has a UNIQUE constraint, which creates an implicit index,
-- but we're being explicit here for clarity.
--
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- EXAMPLE QUERIES YOU'LL USE IN YOUR CODE
-- ============================================================================
--
-- Insert a new user:
-- INSERT INTO users (id, email) VALUES ('user123', 'alice@example.com')
--
-- Select by email:
-- SELECT * FROM users WHERE email = 'alice@example.com'
--
-- List users created in last 7 days:
-- SELECT * FROM users WHERE created_at > datetime('now', '-7 days') ORDER BY created_at DESC
--
-- Update a user (note: id and email are immutable in this schema):
-- UPDATE users SET created_at = datetime('now') WHERE id = 'user123'
--
-- Delete a user:
-- DELETE FROM users WHERE id = 'user123'
--
-- Count total users:
-- SELECT COUNT(*) as total FROM users
--
-- ============================================================================
-- D1-SPECIFIC NOTES
-- ============================================================================
--
-- Timezone handling:
-- D1 (SQLite) stores timestamps in UTC. Use datetime('now') for current UTC time.
-- For local time: datetime('now', 'localtime') - but this is not recommended for production
--
-- Data types:
-- - TEXT: strings
-- - INTEGER: whole numbers
-- - REAL: floating point numbers
-- - BLOB: binary data
-- - TIMESTAMP: stored as TEXT or INTEGER (SQLite has no native TIMESTAMP type)
--
-- NULL values:
-- If a column allows NULL (no NOT NULL constraint), you can insert NULL
-- Example: INSERT INTO users (id, email) VALUES ('user123', NULL) -- email is NOT NULL, so this fails
--
-- Transactions:
-- D1 supports transactions for atomicity:
-- BEGIN; INSERT INTO users ...; UPDATE users ...; COMMIT;
--
-- Learn more: https://developers.cloudflare.com/d1/
--
`;
}

/**
 * Validates the generated migration SQL
 *
 * Checks for:
 * - SQLite syntax compatibility (no PostgreSQL features)
 * - Required CREATE TABLE statement
 * - CREATE INDEX statements
 * - Proper comment documentation
 *
 * @param sql The migration SQL to validate
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateMigrationSql(sql: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for PostgreSQL-specific features that aren't valid SQLite
  const postgresFeatures = [
    { pattern: /SERIAL\s/i, name: 'SERIAL (use INTEGER PRIMARY KEY AUTOINCREMENT)' },
    { pattern: /UUID\s/i, name: 'UUID (use TEXT and generate in application)' },
    { pattern: /BIGSERIAL\s/i, name: 'BIGSERIAL' },
    { pattern: /JSONB\s/i, name: 'JSONB (use TEXT and JSON functions)' },
    { pattern: /::[\w]+/g, name: 'type casting (::)' },
  ];

  for (const feature of postgresFeatures) {
    if (feature.pattern.test(sql)) {
      errors.push(`PostgreSQL-specific feature found: ${feature.name} (not valid in SQLite)`);
    }
  }

  // Check for required CREATE TABLE
  if (!sql.includes('CREATE TABLE') && !sql.includes('create table')) {
    errors.push('Missing CREATE TABLE statement');
  }

  // Check for users table
  if (!sql.toLowerCase().includes('users')) {
    errors.push('Missing users table definition');
  }

  // Check for inline documentation about D1
  if (!sql.includes('wrangler d1 execute')) {
    errors.push('Missing inline comments about running the migration');
  }

  // Check for index creation
  if (!sql.includes('CREATE INDEX')) {
    errors.push('Missing CREATE INDEX statement for email column');
  }

  // Check for email column
  if (!sql.toLowerCase().includes('email')) {
    errors.push('Missing email column in users table');
  }

  // Check for PRIMARY KEY
  if (!sql.includes('PRIMARY KEY')) {
    errors.push('Missing PRIMARY KEY definition');
  }

  // Validate syntax: matching comment dashes
  const dashedComments = (sql.match(/^--/gm) || []).length;
  if (dashedComments === 0) {
    errors.push('Missing SQL comments (--) for documentation');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
