-- Migration: 006_create_uptime_checks_table
-- Description: Create the uptime_checks table for storing uptime monitoring results
-- Created: 2026-04-06
-- Requirement: REQ-013

BEGIN;

-- Create uptime_checks table
CREATE TABLE IF NOT EXISTS uptime_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    url VARCHAR(2048) NOT NULL,
    is_up BOOLEAN NOT NULL,
    status_code INTEGER,
    response_time DECIMAL(10, 2) NOT NULL,
    error TEXT,
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create composite index for efficient site uptime queries
CREATE INDEX IF NOT EXISTS idx_uptime_checks_site_id_checked_at
    ON uptime_checks(site_id, checked_at DESC);

-- Create index on site_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_uptime_checks_site_id ON uptime_checks(site_id);

-- Create index on checked_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_uptime_checks_checked_at ON uptime_checks(checked_at DESC);

COMMIT;
