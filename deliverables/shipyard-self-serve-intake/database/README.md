# Database Schema & Migrations

This directory contains all Postgres schema definitions and migrations for the Shipyard Self-Serve Intake system.

## Overview

The intake system uses a single `intake_requests` table to store all intake data from GitHub issues. This table is the source of truth for all intake submissions.

## Running Migrations

### Prerequisites

- PostgreSQL 13+ with UUID extension enabled
- Database connection details (host, port, database name, credentials)

### Manual Migration (Development)

To apply migrations manually via `psql`:

```bash
psql -h <host> -U <user> -d <database> -f migrations/001_create_intake_requests.sql
```

### Automated Migration (Production)

For automated migrations in production, use your preferred migration tool:

#### Option 1: Using Flyway
```bash
flyway -url=jdbc:postgresql://<host>:5432/<database> \
       -user=<user> \
       -password=<password> \
       -locations=filesystem:./migrations \
       migrate
```

#### Option 2: Using Migrate
```bash
migrate -path ./migrations -database postgresql://<user>:<password>@<host>:5432/<database> up
```

#### Option 3: Using Node.js Migration Tool
For a Node.js environment (recommended for our stack):

```bash
# Install dependency
npm install pg-migrations

# Run migrations
node -e "require('pg-migrations').migrate({
  connectionString: process.env.DATABASE_URL,
  migrationsFolder: './migrations'
})"
```

## Schema Design

### Table: `intake_requests`

The core table storing all intake request data.

#### Fields

**Primary Key & Identification:**
- `id` (UUID) - Unique identifier, auto-generated
- `github_issue_id` (INTEGER) - GitHub issue number (required)
- `repo_name` (TEXT) - Repository name (required)
- `github_issue_url` (TEXT) - Full GitHub issue URL (required)

**Content:**
- `title` (TEXT) - Issue title (required)
- `description` (TEXT) - User description or extracted summary
- `raw_content` (TEXT) - Complete issue body (required)

**Classification:**
- `priority` (TEXT) - Priority level: 'p0', 'p1', 'p2' (optional, CHECK constraint)
- `detected_type` (TEXT) - Detected request type (feature, bug, etc.)
- `confidence_score` (DECIMAL(3,2)) - Confidence in detection (0.00-1.00)

**PRD Data:**
- `prd_content` (JSONB) - Generated PRD as JSON
- `prd_url` (TEXT) - URL to PRD document

**Metadata:**
- `requested_by` (TEXT) - GitHub username who opened the issue (required)
- `status` (TEXT) - Request status: 'pending', 'in_progress', 'completed', etc. (default: 'pending')
- `created_at` (TIMESTAMP) - Record creation time (auto-set)
- `updated_at` (TIMESTAMP) - Last update time (auto-set)

**Tracking:**
- `bot_comment_url` (TEXT) - URL to bot's comment on the issue
- `error_log` (JSONB) - Error details if processing failed

#### Constraints

- **PRIMARY KEY**: `id` - Ensures uniqueness of each intake request
- **UNIQUE**: `(github_issue_id, repo_name)` - Prevents duplicate processing of the same issue
- **CHECK**: `priority IN ('p0', 'p1', 'p2')` - Enforces valid priority values

#### Indexes

Created for query performance optimization:
- `idx_github_issue` on `(github_issue_id)` - Fast lookup by issue ID
- `idx_status` on `(status)` - Filter requests by status
- `idx_priority` on `(priority)` - Filter requests by priority
- `idx_created_at` on `(created_at DESC)` - Fast chronological queries

## Data Integrity

### UNIQUE Constraint (github_issue_id, repo_name)

This constraint prevents duplicate processing of the same GitHub issue. If an issue is reopened or reprocessed, it will violate this constraint. Handle duplicates with:

- UPDATE existing record instead of INSERT
- Or check for existence before insertion

Example (pseudo-code):
```javascript
// Check if intake already exists
const existing = await db.query(
  'SELECT id FROM intake_requests WHERE github_issue_id = $1 AND repo_name = $2',
  [issueId, repoName]
);

if (existing.rows.length > 0) {
  // Update existing
  await db.query(
    'UPDATE intake_requests SET updated_at = NOW() WHERE id = $1',
    [existing.rows[0].id]
  );
} else {
  // Insert new
  await db.query('INSERT INTO intake_requests (...) VALUES (...)', [...]);
}
```

### CHECK Constraint (priority)

The `priority` field only accepts: 'p0', 'p1', 'p2'

Attempting to insert an invalid priority will be rejected at the database level.

## Querying Examples

### Find all pending p0 requests
```sql
SELECT * FROM intake_requests
WHERE status = 'pending' AND priority = 'p0'
ORDER BY created_at DESC;
```

### Get intake for a specific GitHub issue
```sql
SELECT * FROM intake_requests
WHERE github_issue_id = 12345 AND repo_name = 'shipyard-ai';
```

### Count intakes by priority
```sql
SELECT priority, COUNT(*) as count
FROM intake_requests
GROUP BY priority;
```

### Recent intakes with PRD generated
```sql
SELECT id, title, priority, prd_url, created_at
FROM intake_requests
WHERE prd_content IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Backup & Recovery

### Backup
```bash
pg_dump -h <host> -U <user> <database> > backup.sql
```

### Restore
```bash
psql -h <host> -U <user> <database> < backup.sql
```

## Monitoring

### Check table size
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename = 'intake_requests';
```

### Check index usage
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE tablename = 'intake_requests'
ORDER BY idx_scan DESC;
```

## Future Migrations

As the system evolves, new migrations should:
1. Use sequential numbering (002, 003, etc.)
2. Include descriptive comments
3. Be tested against a copy of production data
4. Include rollback instructions
5. Be versioned with git

Example naming: `002_add_user_notes_column.sql`
