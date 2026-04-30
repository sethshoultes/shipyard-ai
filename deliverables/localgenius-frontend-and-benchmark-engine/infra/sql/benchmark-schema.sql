-- SPARK Benchmark Engine Lite — D1 Schema
-- Compatible with SQLite (Cloudflare D1)

-- Businesses table (opt-out flag for benchmarks)
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE NOT NULL,
  vertical TEXT,
  geography TEXT,
  opt_out_benchmarks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark aggregates (broad buckets: vertical + geography)
CREATE TABLE IF NOT EXISTS benchmark_aggregates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical TEXT NOT NULL,
  sub_vertical TEXT,
  geography TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  business_count INTEGER DEFAULT 0,
  avg_questions_answered REAL,
  p50_response_time REAL,
  p90_response_time REAL,
  top_faq_patterns TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_lookup ON businesses(external_id);
CREATE INDEX IF NOT EXISTS idx_businesses_opt_out ON businesses(opt_out_benchmarks);
CREATE INDEX IF NOT EXISTS idx_benchmarks_lookup ON benchmark_aggregates(vertical, geography, period_end);
CREATE INDEX IF NOT EXISTS idx_benchmarks_period ON benchmark_aggregates(period_end);

-- Seed a generic bucket for testing suppression (2 businesses)
INSERT OR IGNORE INTO businesses (external_id, vertical, geography, opt_out_benchmarks) VALUES
('demo-biz-001', 'restaurant', 'Demo City', 0),
('demo-biz-002', 'restaurant', 'Demo City', 0),
('demo-biz-003', 'restaurant', 'Chicago', 0),
('demo-biz-004', 'restaurant', 'Chicago', 0),
('demo-biz-005', 'restaurant', 'Chicago', 0),
('demo-biz-006', 'restaurant', 'Chicago', 0),
('demo-biz-007', 'restaurant', 'Chicago', 0),
('demo-biz-008', 'restaurant', 'Chicago', 0),
('demo-biz-009', 'restaurant', 'Chicago', 0),
('demo-biz-010', 'restaurant', 'Chicago', 0),
('demo-biz-011', 'retail', 'Austin', 0),
('demo-biz-012', 'retail', 'Austin', 0),
('demo-biz-013', 'retail', 'Austin', 0),
('demo-biz-014', 'retail', 'Austin', 0),
('demo-biz-015', 'retail', 'Austin', 0),
('demo-biz-016', 'service', 'Denver', 0),
('demo-biz-017', 'service', 'Denver', 0),
('demo-biz-018', 'service', 'Denver', 0),
('demo-biz-019', 'service', 'Denver', 0),
('demo-biz-020', 'service', 'Denver', 0);
