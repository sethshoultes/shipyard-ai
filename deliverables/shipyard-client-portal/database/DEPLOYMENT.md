# Database Schema Deployment Guide

## Overview

This guide provides instructions for deploying the Shipyard Client Portal database schema to Supabase.

## Database Schema

The Shipyard Client Portal uses PostgreSQL with 5 core tables:

1. **clients** - Client account information
2. **projects** - Project details and status tracking
3. **retainers** - Subscription management for AI update retainers
4. **retainer_updates** - Individual updates completed under retainer subscriptions
5. **status_events** - Event log for project status changes (from pipeline webhooks)

## Deployment Methods

### Method 1: Consolidated Schema (Recommended for Quick Setup)

This is the fastest way to deploy all tables, constraints, and indexes at once.

1. Log in to your [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Navigate to **SQL Editor** > **New Query**
4. Open `/database/migrations/00_consolidated_schema.sql`
5. Copy the entire contents
6. Paste into the Supabase SQL Editor
7. Click **Run**

**Advantages:**
- Single transaction deployment
- Guaranteed consistency
- Fastest setup time
- All tables and indexes created together

### Method 2: Sequential Migrations (Recommended for Version Control)

Use this method if your team needs granular version control of schema changes.

1. Log in to your Supabase Dashboard
2. For each migration file in order, create a new query:
   - `001_create_clients_table.sql`
   - `002_create_projects_table.sql`
   - `003_create_retainers_table.sql`
   - `004_create_retainer_updates_table.sql`
   - `005_create_status_events_table.sql`
   - `006_create_indexes.sql`

3. For each file:
   - Navigate to **SQL Editor** > **New Query**
   - Copy and paste the file contents
   - Click **Run**

**Advantages:**
- Better for version control tracking
- Each migration is independent
- Can verify each step
- Easier to rollback individual steps

### Method 3: Supabase CLI

If you have the Supabase CLI installed locally:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref [YOUR_PROJECT_ID]

# Push migrations
supabase db push
```

Note: This requires migrations to be in `supabase/migrations/` directory and follows Supabase's migration naming convention.

## Verification

After deploying the schema, verify all tables were created:

```sql
-- List all tables
\dt

-- Check table structure
\d clients
\d projects
\d retainers
\d retainer_updates
\d status_events

-- List all indexes
\di
```

In Supabase, you can also verify by:
1. Going to **SQL Editor** > **Saved Queries**
2. Running this query to check all tables exist:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Schema Details

### clients Table
- Primary key: `id` (UUID)
- Unique constraint: `email`
- Stores client account information
- Referenced by: projects, retainers

### projects Table
- Primary key: `id` (UUID)
- Foreign key: `client_id` → clients(id)
- Deletion cascade: When client is deleted, associated projects are deleted
- Stores project details and status tracking
- Status values: 'intake', 'payment_pending', 'in_progress', 'review', 'live', 'failed'
- Referenced by: status_events

### retainers Table
- Primary key: `id` (UUID)
- Foreign key: `client_id` → clients(id)
- Unique constraint: `stripe_subscription_id`
- Deletion cascade: When client is deleted, associated retainers are deleted
- Stores subscription information
- Default token budget: 500000

### retainer_updates Table
- Primary key: `id` (UUID)
- Foreign key: `retainer_id` → retainers(id)
- Deletion cascade: When retainer is deleted, associated updates are deleted
- Tracks individual updates completed under retainer subscriptions

### status_events Table
- Primary key: `id` (UUID)
- Foreign key: `project_id` → projects(id)
- Deletion cascade: When project is deleted, associated events are deleted
- Event log for project status changes (from pipeline webhooks)

## Indexes

The following indexes are created for query performance:

| Index Name | Table | Column(s) | Purpose |
|-----------|-------|-----------|---------|
| idx_projects_client_id | projects | client_id | Fast client project lookups |
| idx_projects_status | projects | status | Fast project filtering by status |
| idx_projects_created_at | projects | created_at | Fast project filtering by date |
| idx_retainers_client_id | retainers | client_id | Fast client retainer lookups |
| idx_retainers_status | retainers | status | Fast subscription status filtering |
| idx_status_events_project_id | status_events | project_id | Fast event lookup by project |
| idx_status_events_created_at | status_events | created_at | Fast event filtering by date |
| idx_retainer_updates_retainer_id | retainer_updates | retainer_id | Fast update lookup by retainer |

## Rollback Instructions

If needed, you can delete all tables:

```sql
DROP TABLE IF EXISTS status_events CASCADE;
DROP TABLE IF EXISTS retainer_updates CASCADE;
DROP TABLE IF EXISTS retainers CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
```

Warning: This will delete all data. Use only in development or testing environments.

## Constraints and Relationships

All foreign keys use `ON DELETE CASCADE`, meaning:
- Deleting a client deletes all associated projects and retainers
- Deleting a retainer deletes all associated updates
- Deleting a project deletes all associated status events

This ensures data integrity and prevents orphaned records.

## Column Constraints

All tables include:
- `created_at` - Automatically set to current timestamp on insert
- `updated_at` - Automatically set to current timestamp (requires trigger for updates)

Note: Update triggers are not included in the base schema. If needed, they can be added separately.

## Next Steps

After deploying the schema:

1. Test table creation by running sample queries
2. Verify all indexes are created (check performance)
3. Update environment variables with database connection details
4. Run application tests to verify data access layer works correctly
5. Set up database backups and monitoring

## Support

For issues with deployment:
1. Check Supabase documentation: https://supabase.com/docs
2. Review SQL syntax in the migration files
3. Verify all foreign key references are correct
4. Check Supabase project status and permissions

---

**Last Updated:** 2026-04-15
**Version:** 1.0
**Status:** Ready for Production Deployment
