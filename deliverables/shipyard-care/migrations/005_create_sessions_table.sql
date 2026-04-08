-- Migration: 005_create_sessions_table
-- Description: Create the sessions table for authentication
-- Created: 2026-04-06
-- Requirement: REQ-008

BEGIN;

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on token_hash for session validation lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- Create index on user_id for user session queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

COMMIT;
