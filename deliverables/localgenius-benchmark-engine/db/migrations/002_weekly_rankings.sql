-- ============================================================================
-- Migration: 002_weekly_rankings
-- RANK Feature — Weekly Rankings Materialized View
-- ============================================================================
--
-- Purpose: Compute business rankings with composite score algorithm.
--          Materialized view refreshed weekly before email send.
--
-- Requirements:
--   REQ-DB-002: weekly_rankings view
--   REQ-BL-001: Composite score weights
--
-- Algorithm Weights (from decisions.md line 115):
--   - Review count:     25% (commodity signal from GBP)
--   - Average rating:   25% (commodity signal from GBP)
--   - Review velocity:  20% (calculated momentum indicator)
--   - Response rate:    15% (PROPRIETARY LocalGenius signal)
--   - Response time:    15% (PROPRIETARY LocalGenius signal)
--
-- Cohort Sizing (from decisions.md line 103):
--   - Primary: city-level cohort
--   - Fallback 1: metro-level if city N < 10
--   - Fallback 2: state-level if metro N < 10
--   - Final: "Insufficient data" if state N < 10
--
-- ============================================================================

-- Create weekly_rankings table (not a true materialized view for flexibility)
-- This table is populated by the rank_businesses.sql function
CREATE TABLE IF NOT EXISTS weekly_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to business
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Week start date (Monday)
    week_of DATE NOT NULL,

    -- Category for this ranking
    category TEXT NOT NULL,

    -- ─────────────────────────────────────────────────────────────────────────
    -- Cohort Information
    -- Per decisions.md line 103: dynamic cohort sizing
    -- ─────────────────────────────────────────────────────────────────────────

    -- Final cohort level used (city | metro | state)
    cohort_level TEXT NOT NULL,

    -- Human-readable cohort label: "Austin Mexican Restaurants"
    cohort_label TEXT NOT NULL,

    -- Total businesses in this cohort
    cohort_size INTEGER NOT NULL,

    -- ─────────────────────────────────────────────────────────────────────────
    -- Ranking Data
    -- ─────────────────────────────────────────────────────────────────────────

    -- Position in cohort (1 = best)
    rank INTEGER NOT NULL,

    -- Percentile (100 = top, 0 = bottom)
    -- Formula: 100 - ((rank - 1) / cohort_size * 100)
    percentile DECIMAL(5, 2) NOT NULL,

    -- Change from previous week (+2 = moved up 2 spots, -1 = dropped 1)
    rank_change INTEGER NOT NULL DEFAULT 0,

    -- ─────────────────────────────────────────────────────────────────────────
    -- Composite Score
    -- Per REQ-BL-001 weights
    -- ─────────────────────────────────────────────────────────────────────────

    composite_score DECIMAL(8, 4) NOT NULL,

    -- Component scores for "Why this rank?" breakdown
    -- JSON: { reviewCount: 85, avgRating: 90, reviewVelocity: 75, responseRate: 95, responseTime: 80 }
    component_scores JSONB NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one ranking per business per week
    CONSTRAINT weekly_rankings_unique UNIQUE (business_id, week_of)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for efficient queries
-- ─────────────────────────────────────────────────────────────────────────────

-- Index for dashboard queries: get latest rank for a business
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_business_latest
    ON weekly_rankings (business_id, week_of DESC);

-- Index for cohort leaderboard queries
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_cohort
    ON weekly_rankings (category, cohort_label, week_of, rank);

-- Index for trend line queries (4 weeks of history)
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_history
    ON weekly_rankings (business_id, week_of DESC)
    INCLUDE (rank, rank_change, composite_score);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper View: Cohort Counts
-- Used to check N >= 10 constraint before computing rankings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW cohort_counts AS
SELECT
    category,
    location_city,
    location_metro,
    location_state,
    date,
    COUNT(DISTINCT business_id) AS city_count,
    SUM(COUNT(DISTINCT business_id)) OVER (
        PARTITION BY category, location_metro, date
    ) AS metro_count,
    SUM(COUNT(DISTINCT business_id)) OVER (
        PARTITION BY category, location_state, date
    ) AS state_count
FROM business_metrics
GROUP BY category, location_city, location_metro, location_state, date;

COMMENT ON VIEW cohort_counts IS 'RANK: Helper view to check cohort size >= 10 threshold';

-- ─────────────────────────────────────────────────────────────────────────────
-- Rank Email Preferences Table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rank_email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Whether to receive weekly rank emails
    weekly_email_enabled INTEGER NOT NULL DEFAULT 1,

    -- Last rank sent (to avoid duplicate sends)
    last_email_sent_at TIMESTAMPTZ,

    -- Last known rank (preserved for OAuth failure fallback)
    -- Per decisions.md line 270: preserve last-known rank with timestamp
    last_known_rank INTEGER,
    last_known_rank_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT rank_email_preferences_business_unique UNIQUE (business_id)
);

CREATE INDEX IF NOT EXISTS idx_rank_email_preferences_business
    ON rank_email_preferences (business_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Comments
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE weekly_rankings IS 'RANK: Computed weekly rankings for competitive benchmarking';
COMMENT ON COLUMN weekly_rankings.composite_score IS 'Weighted score: review_count 25%, avg_rating 25%, review_velocity 20%, response_rate 15%, response_time 15%';
COMMENT ON COLUMN weekly_rankings.cohort_level IS 'Geographic level used: city, metro, or state';
COMMENT ON COLUMN weekly_rankings.component_scores IS 'Breakdown for "Why this rank?" UI component';
COMMENT ON TABLE rank_email_preferences IS 'RANK: Per-business email preferences for weekly digest';
