-- Migration: Create projects table
-- Description: Projects table with foreign key relationship to clients
-- Created: 2026-04-15

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

-- Add comments for documentation
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
