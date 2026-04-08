-- Migration: 001_create_sites_table
-- Description: Create the sites table for storing monitored website information
-- Created: 2026-04-06
-- Requirement: REQ-004

BEGIN;

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_id UUID,
    tier VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on subscription_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_sites_subscription_id ON sites(subscription_id);

-- Create index on status for filtering active sites
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
