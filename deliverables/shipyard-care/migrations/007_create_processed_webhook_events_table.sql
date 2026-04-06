-- Migration: 007_create_processed_webhook_events_table
-- Description: Create the processed_webhook_events table for webhook idempotency
-- Created: 2026-04-06
-- Requirement: REQ-003

BEGIN;

-- Create processed_webhook_events table for idempotent webhook handling
CREATE TABLE IF NOT EXISTS processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on event_id for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_id
    ON processed_webhook_events(event_id);

-- Create index on processed_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_processed_at
    ON processed_webhook_events(processed_at);

COMMIT;
