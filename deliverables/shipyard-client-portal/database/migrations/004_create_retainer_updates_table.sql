-- Migration: Create retainer_updates table
-- Description: Tracks individual updates completed under retainer subscriptions
-- Created: 2026-04-15

CREATE TABLE IF NOT EXISTS retainer_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retainer_id UUID NOT NULL REFERENCES retainers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE retainer_updates IS 'Individual updates/changes completed under retainer subscriptions';
COMMENT ON COLUMN retainer_updates.id IS 'Unique identifier for each update';
COMMENT ON COLUMN retainer_updates.retainer_id IS 'Foreign key reference to retainers table';
COMMENT ON COLUMN retainer_updates.description IS 'Description of the update performed';
COMMENT ON COLUMN retainer_updates.tokens_used IS 'Tokens consumed for this update';
COMMENT ON COLUMN retainer_updates.completed_at IS 'Timestamp when update was completed';
