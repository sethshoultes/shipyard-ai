-- Drift D1 Database Schema
-- Version: 1.0.0
-- Database: drift

-- Projects table
-- Each project has a unique API key for authentication
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for API key lookups (authentication)
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key_hash);

-- Prompts table
-- Each prompt belongs to a project and tracks which version is active
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  active_version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, name)
);

-- Index for prompt lookups by project
CREATE INDEX IF NOT EXISTS idx_prompts_project ON prompts(project_id);

-- Index for prompt lookups by name within project
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(project_id, name);

-- Versions table
-- Stores all versions of each prompt with content and optional message
CREATE TABLE IF NOT EXISTS versions (
  id TEXT PRIMARY KEY,
  prompt_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  message TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  UNIQUE(prompt_id, version)
);

-- Index for version lookups by prompt
CREATE INDEX IF NOT EXISTS idx_versions_prompt ON versions(prompt_id);

-- Index for version ordering
CREATE INDEX IF NOT EXISTS idx_versions_prompt_version ON versions(prompt_id, version DESC);
