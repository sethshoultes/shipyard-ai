-- Tuned Prompt Version Control System
-- D1 Database Schema

-- Prompts table: stores prompt metadata
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Versions table: stores prompt versions with active flag
CREATE TABLE IF NOT EXISTS versions (
  id TEXT PRIMARY KEY,
  prompt_id TEXT REFERENCES prompts(id),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient version lookups by prompt_id and version number
CREATE INDEX IF NOT EXISTS idx_versions_prompt_version
  ON versions(prompt_id, version);

-- Index for efficient active version queries
CREATE INDEX IF NOT EXISTS idx_versions_is_active
  ON versions(is_active);
