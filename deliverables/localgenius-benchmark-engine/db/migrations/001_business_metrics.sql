-- ============================================================================
-- Migration: 001_business_metrics
-- RANK Feature — Business Metrics Table
-- ============================================================================
--
-- Purpose: Append-only table storing daily metric snapshots for each business.
--          Foundation for all ranking calculations.
--
-- Requirements:
--   REQ-DB-001: business_metrics table
--   REQ-DB-003: append-only with timestamps
--   REQ-DB-004: indexed for cohort queries
--
-- Per decisions.md:
--   - Reviews only (no social/website data)
--   - 3 categories: restaurants, home_services, retail
--   - Dynamic cohort sizing: city -> metro -> state
--
-- ============================================================================

-- Create the business_metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
    -- Foreign key to businesses table
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Snapshot date (one row per business per day)
    date DATE NOT NULL,

    -- Category for cohort grouping
    -- V1 locked scope: exactly 3 categories per decisions.md line 55
    category TEXT NOT NULL,

    -- Geographic hierarchy for dynamic cohort sizing
    -- Per decisions.md line 103: city -> metro -> state
    location_city TEXT NOT NULL,
    location_metro TEXT,
    location_state TEXT NOT NULL,

    -- ─────────────────────────────────────────────────────────────────────────
    -- Commodity Signals (from GBP API)
    -- Per decisions.md line 115: these are commodity data everyone can scrape
    -- ─────────────────────────────────────────────────────────────────────────

    -- Total review count on Google Business Profile
    review_count INTEGER NOT NULL DEFAULT 0,

    -- Average star rating (1.0 - 5.0)
    avg_rating DECIMAL(2, 1) NOT NULL DEFAULT 0.0,

    -- Reviews per 30 days (velocity indicator)
    -- Higher = more active, trending business
    review_velocity DECIMAL(4, 1) NOT NULL DEFAULT 0.0,

    -- ─────────────────────────────────────────────────────────────────────────
    -- Proprietary Signals (from LocalGenius platform)
    -- Per decisions.md line 115: these are the moat
    -- ─────────────────────────────────────────────────────────────────────────

    -- Percentage of reviews responded to (0.00 - 100.00)
    response_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

    -- Average hours to respond to reviews
    avg_response_time_hours INTEGER,

    -- Insertion timestamp (append-only audit trail)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Composite primary key: one row per business per day
    PRIMARY KEY (business_id, date),

    -- Category constraint: V1 locked to 3 categories
    CONSTRAINT category_check CHECK (
        category IN ('restaurants', 'home_services', 'retail')
    )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for efficient cohort queries
-- Optimized for the ranking algorithm's access patterns
-- ─────────────────────────────────────────────────────────────────────────────

-- Index for category-based cohort queries
-- Used when: SELECT * WHERE category = 'restaurants' AND date = '2026-04-14'
CREATE INDEX IF NOT EXISTS idx_business_metrics_category_date
    ON business_metrics (category, date);

-- Index for city-level cohort queries (primary cohort)
-- Used when: SELECT * WHERE location_city = 'Austin' AND category = 'restaurants'
CREATE INDEX IF NOT EXISTS idx_business_metrics_location_category
    ON business_metrics (location_city, category, date);

-- Index for metro-level cohort fallback
-- Used when: city cohort N < 10, fall back to metro
CREATE INDEX IF NOT EXISTS idx_business_metrics_metro_category
    ON business_metrics (location_metro, category, date)
    WHERE location_metro IS NOT NULL;

-- Index for state-level cohort fallback
-- Used when: metro cohort N < 10, fall back to state
CREATE INDEX IF NOT EXISTS idx_business_metrics_state_category
    ON business_metrics (location_state, category, date);

-- Index for business history queries (trend line)
-- Used when: SELECT * WHERE business_id = ? ORDER BY date DESC LIMIT 4
CREATE INDEX IF NOT EXISTS idx_business_metrics_business_date
    ON business_metrics (business_id, date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Comments for documentation
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE business_metrics IS 'RANK: Append-only daily metric snapshots for competitive benchmarking';
COMMENT ON COLUMN business_metrics.category IS 'V1 scope: restaurants, home_services, retail only';
COMMENT ON COLUMN business_metrics.location_city IS 'Primary cohort level';
COMMENT ON COLUMN business_metrics.location_metro IS 'Fallback cohort when city N < 10';
COMMENT ON COLUMN business_metrics.location_state IS 'Final fallback cohort when metro N < 10';
COMMENT ON COLUMN business_metrics.review_velocity IS 'Reviews received in last 30 days';
COMMENT ON COLUMN business_metrics.response_rate IS 'Proprietary signal: % of reviews responded to';
COMMENT ON COLUMN business_metrics.avg_response_time_hours IS 'Proprietary signal: avg hours to respond';
