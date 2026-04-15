-- Migration: Create database indexes
-- Description: Add indexes for optimal query performance
-- Created: 2026-04-15

-- Index on projects table for client lookups
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
COMMENT ON INDEX idx_projects_client_id IS 'Index for efficient project lookup by client_id';

-- Index on projects table for status filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
COMMENT ON INDEX idx_projects_status IS 'Index for efficient project filtering by status';

-- Index on retainers table for client lookups
CREATE INDEX IF NOT EXISTS idx_retainers_client_id ON retainers(client_id);
COMMENT ON INDEX idx_retainers_client_id IS 'Index for efficient retainer lookup by client_id';

-- Index on status_events table for event lookups by project
CREATE INDEX IF NOT EXISTS idx_status_events_project_id ON status_events(project_id);
COMMENT ON INDEX idx_status_events_project_id IS 'Index for efficient event lookup by project_id';

-- Additional useful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
COMMENT ON INDEX idx_projects_created_at IS 'Index for efficient project filtering by creation date';

CREATE INDEX IF NOT EXISTS idx_status_events_created_at ON status_events(created_at);
COMMENT ON INDEX idx_status_events_created_at IS 'Index for efficient event filtering by creation date';

CREATE INDEX IF NOT EXISTS idx_retainers_status ON retainers(status);
COMMENT ON INDEX idx_retainers_status IS 'Index for efficient retainer filtering by subscription status';

CREATE INDEX IF NOT EXISTS idx_retainer_updates_retainer_id ON retainer_updates(retainer_id);
COMMENT ON INDEX idx_retainer_updates_retainer_id IS 'Index for efficient update lookup by retainer_id';
