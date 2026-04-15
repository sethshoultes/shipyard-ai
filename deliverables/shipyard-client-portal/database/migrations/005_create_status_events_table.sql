-- Migration: Create status_events table
-- Description: Event log for project status changes from pipeline webhooks
-- Created: 2026-04-15

CREATE TABLE IF NOT EXISTS status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE status_events IS 'Event log tracking status changes for projects (from pipeline webhooks)';
COMMENT ON COLUMN status_events.id IS 'Unique identifier for each status event';
COMMENT ON COLUMN status_events.project_id IS 'Foreign key reference to projects table';
COMMENT ON COLUMN status_events.status IS 'Status value at time of event';
COMMENT ON COLUMN status_events.message IS 'Human-readable message associated with status change';
COMMENT ON COLUMN status_events.created_at IS 'Timestamp when event was recorded';
