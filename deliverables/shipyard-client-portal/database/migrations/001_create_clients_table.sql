-- Migration: Create clients table
-- Description: Core clients table to store client account information
-- Created: 2026-04-15

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE clients IS 'Core clients table storing account information for portal users';
COMMENT ON COLUMN clients.id IS 'Unique identifier for each client';
COMMENT ON COLUMN clients.email IS 'Client email address (unique)';
COMMENT ON COLUMN clients.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN clients.updated_at IS 'Last update timestamp';
