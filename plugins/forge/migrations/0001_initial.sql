-- Forge Plugin D1 Schema
-- Migration 0001: Initial schema for forms and submissions

-- Forms table - stores form definitions
CREATE TABLE IF NOT EXISTS forge_forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields TEXT NOT NULL,       -- JSON array of FormFieldDefinition
  notify_emails TEXT,         -- JSON array of email strings
  primary_color TEXT DEFAULT '#C4704B',
  logo_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Submissions table - stores form submissions
CREATE TABLE IF NOT EXISTS forge_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  data TEXT NOT NULL,         -- JSON object of field values
  submitted_at TEXT NOT NULL,
  ip TEXT,
  FOREIGN KEY (form_id) REFERENCES forge_forms(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_forge_submissions_form_id ON forge_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_forge_submissions_submitted_at ON forge_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_forge_forms_created_at ON forge_forms(created_at);
