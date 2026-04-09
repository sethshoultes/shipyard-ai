-- Wardrobe Analytics Database Schema
-- D1 database for anonymous install telemetry

CREATE TABLE IF NOT EXISTS installs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme TEXT NOT NULL,
  os TEXT NOT NULL,
  country TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  cli_version TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_installs_created_at ON installs(created_at);

-- Index on theme for theme popularity analysis
CREATE INDEX IF NOT EXISTS idx_installs_theme ON installs(theme);

-- Index on os for OS distribution analysis
CREATE INDEX IF NOT EXISTS idx_installs_os ON installs(os);

-- Index on country for geographic analysis
CREATE INDEX IF NOT EXISTS idx_installs_country ON installs(country);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_installs_theme_created ON installs(theme, created_at);
