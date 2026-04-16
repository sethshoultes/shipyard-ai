-- Migration: Create intake_requests table
-- Description: Creates the single source of truth table for all intake requests
-- Status: Initial schema with integrity constraints

CREATE TABLE intake_requests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- GitHub fields
  github_issue_id INTEGER NOT NULL,
  github_issue_url TEXT NOT NULL,
  repo_name TEXT NOT NULL,

  -- Content fields
  title TEXT NOT NULL,
  description TEXT,
  raw_content TEXT NOT NULL,

  -- Classification fields
  priority TEXT CHECK (priority IN ('p0', 'p1', 'p2')),
  detected_type TEXT,
  confidence_score DECIMAL(3,2),

  -- PRD fields
  prd_content JSONB,
  prd_url TEXT,

  -- Metadata
  requested_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Tracking
  bot_comment_url TEXT,
  error_log JSONB,

  -- Constraints
  UNIQUE(github_issue_id, repo_name)
);

-- Indexes for query performance
CREATE INDEX idx_github_issue ON intake_requests(github_issue_id);
CREATE INDEX idx_status ON intake_requests(status);
CREATE INDEX idx_priority ON intake_requests(priority);
CREATE INDEX idx_created_at ON intake_requests(created_at DESC);
