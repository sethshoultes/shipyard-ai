-- Consolidated Database Schema Migration for Shipyard Client Portal
-- This file contains the complete schema setup that can be run as a single transaction
-- To apply all migrations at once, copy the contents into Supabase SQL editor and execute
-- Created: 2026-04-15
-- Version: 1.0

-- ============================================================================
-- TABLE: clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Core clients table storing account information for portal users';
COMMENT ON COLUMN clients.id IS 'Unique identifier for each client';
COMMENT ON COLUMN clients.email IS 'Client email address (unique)';
COMMENT ON COLUMN clients.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN clients.updated_at IS 'Last update timestamp';

-- ============================================================================
-- TABLE: projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL, -- 'intake', 'payment_pending', 'in_progress', 'review', 'live', 'failed'
  site_url TEXT,
  staging_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

COMMENT ON TABLE projects IS 'Projects table storing project information for each client';
COMMENT ON COLUMN projects.id IS 'Unique identifier for each project';
COMMENT ON COLUMN projects.client_id IS 'Foreign key reference to clients table';
COMMENT ON COLUMN projects.title IS 'Project name/title';
COMMENT ON COLUMN projects.status IS 'Current project status (intake, payment_pending, in_progress, review, live, failed)';
COMMENT ON COLUMN projects.site_url IS 'URL of live production site';
COMMENT ON COLUMN projects.staging_url IS 'URL of staging/preview site';
COMMENT ON COLUMN projects.created_at IS 'Project creation timestamp';
COMMENT ON COLUMN projects.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN projects.completed_at IS 'Project completion timestamp';

-- ============================================================================
-- TABLE: retainers
-- ============================================================================
CREATE TABLE IF NOT EXISTS retainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  token_budget INTEGER DEFAULT 500000,
  tokens_used INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE retainers IS 'Retainer subscription information for clients';
COMMENT ON COLUMN retainers.id IS 'Unique identifier for each retainer subscription';
COMMENT ON COLUMN retainers.client_id IS 'Foreign key reference to clients table';
COMMENT ON COLUMN retainers.stripe_subscription_id IS 'Stripe subscription ID for billing integration';
COMMENT ON COLUMN retainers.status IS 'Subscription status (active, canceled, past_due)';
COMMENT ON COLUMN retainers.token_budget IS 'Monthly token budget for AI updates (default 500000)';
COMMENT ON COLUMN retainers.tokens_used IS 'Tokens consumed in current billing cycle';
COMMENT ON COLUMN retainers.billing_cycle_start IS 'Start of current billing cycle';
COMMENT ON COLUMN retainers.billing_cycle_end IS 'End of current billing cycle';
COMMENT ON COLUMN retainers.created_at IS 'Subscription creation timestamp';
COMMENT ON COLUMN retainers.updated_at IS 'Last update timestamp';

-- ============================================================================
-- TABLE: retainer_updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS retainer_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retainer_id UUID NOT NULL REFERENCES retainers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE retainer_updates IS 'Individual updates/changes completed under retainer subscriptions';
COMMENT ON COLUMN retainer_updates.id IS 'Unique identifier for each update';
COMMENT ON COLUMN retainer_updates.retainer_id IS 'Foreign key reference to retainers table';
COMMENT ON COLUMN retainer_updates.description IS 'Description of the update performed';
COMMENT ON COLUMN retainer_updates.tokens_used IS 'Tokens consumed for this update';
COMMENT ON COLUMN retainer_updates.completed_at IS 'Timestamp when update was completed';

-- ============================================================================
-- TABLE: status_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE status_events IS 'Event log tracking status changes for projects (from pipeline webhooks)';
COMMENT ON COLUMN status_events.id IS 'Unique identifier for each status event';
COMMENT ON COLUMN status_events.project_id IS 'Foreign key reference to projects table';
COMMENT ON COLUMN status_events.status IS 'Status value at time of event';
COMMENT ON COLUMN status_events.message IS 'Human-readable message associated with status change';
COMMENT ON COLUMN status_events.created_at IS 'Timestamp when event was recorded';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Required indexes from schema spec
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_retainers_client_id ON retainers(client_id);
CREATE INDEX IF NOT EXISTS idx_status_events_project_id ON status_events(project_id);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_status_events_created_at ON status_events(created_at);
CREATE INDEX IF NOT EXISTS idx_retainers_status ON retainers(status);
CREATE INDEX IF NOT EXISTS idx_retainer_updates_retainer_id ON retainer_updates(retainer_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, foreign keys, and indexes have been created successfully
-- Schema is ready for application use
