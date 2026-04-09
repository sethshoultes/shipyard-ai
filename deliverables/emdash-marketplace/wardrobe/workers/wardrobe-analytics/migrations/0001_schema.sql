-- Wardrobe Analytics Schema
-- Stores anonymous install telemetry for theme analytics

CREATE TABLE IF NOT EXISTS installs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme TEXT NOT NULL,
  os TEXT,
  country TEXT,
  timestamp TEXT NOT NULL,
  cli_version TEXT
);

-- Index for theme-based aggregation queries
CREATE INDEX IF NOT EXISTS idx_theme ON installs(theme);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON installs(timestamp);

-- Composite index for theme + timestamp queries
CREATE INDEX IF NOT EXISTS idx_theme_timestamp ON installs(theme, timestamp);
