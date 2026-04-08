-- Migration: 002_create_metrics_table
-- Description: Create the metrics table for storing site performance data
-- Created: 2026-04-06
-- Requirement: REQ-005, REQ-014

BEGIN;

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    health_score DECIMAL(5, 2) CHECK (health_score >= 0 AND health_score <= 100),
    load_time DECIMAL(10, 2), -- in milliseconds
    uptime_percent DECIMAL(5, 2) CHECK (uptime_percent >= 0 AND uptime_percent <= 100),
    lighthouse_score INTEGER CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create composite index for efficient time-series queries (<100ms p95 target)
-- REQ-014: Indexes on (site_id, created_at DESC)
CREATE INDEX IF NOT EXISTS idx_metrics_site_id_created_at
    ON metrics(site_id, created_at DESC);

-- Create index for site_id foreign key
CREATE INDEX IF NOT EXISTS idx_metrics_site_id ON metrics(site_id);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at DESC);

COMMIT;
