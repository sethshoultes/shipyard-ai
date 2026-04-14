-- ============================================================================
-- Function: rank_businesses
-- RANK Feature — Core Ranking Algorithm
-- ============================================================================
--
-- Purpose: Implements the competitive ranking algorithm with dynamic cohort
--          expansion (city -> metro -> state).
--
-- Requirements:
--   REQ-BL-001: Composite score weights
--   REQ-BL-002: Dynamic cohort hierarchy
--   REQ-CONFIG-003: Documented algorithm weights
--
-- Algorithm Weights (from decisions.md line 115):
-- ─────────────────────────────────────────────────────────────────────────────
--   - Review count:     25% (commodity signal from GBP API)
--   - Average rating:   25% (commodity signal from GBP API)
--   - Review velocity:  20% (calculated momentum indicator)
--   - Response rate:    15% (PROPRIETARY LocalGenius signal)
--   - Response time:    15% (PROPRIETARY LocalGenius signal)
--
-- The proprietary signals (response rate, response time) are the moat.
-- Per decisions.md: "Review counts are commodity. Response times from
-- LocalGenius platform are the real moat."
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Cohort Sizing Rules (from decisions.md line 103):
-- ─────────────────────────────────────────────────────────────────────────────
--   1. First try city-level cohort (e.g., "Austin Mexican Restaurants")
--   2. If N < 10, expand to metro-level (e.g., "Austin Metro Mexican Restaurants")
--   3. If metro N < 10, expand to state-level (e.g., "Texas Mexican Restaurants")
--   4. If state N < 10, return "Insufficient data" — never show garbage rankings
-- ─────────────────────────────────────────────────────────────────────────────
--
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Constants: Algorithm Weights
-- ─────────────────────────────────────────────────────────────────────────────
-- These weights are intentionally hardcoded per decisions.md.
-- "No seasonal adjustments in V1" — simple rolling averages only.

-- Review count (25%): Commodity signal from GBP API. Volume indicator.
--   Higher review count = more established business, more trust signals.
--   Normalized to 0-100 scale within cohort using percentile ranking.

-- Average rating (25%): Commodity signal from GBP API. Quality perception.
--   Direct customer satisfaction indicator.
--   Already on 1-5 scale, converted to 0-100 for scoring.

-- Review velocity (20%): Calculated. Growth momentum indicator.
--   Reviews per 30 days. Shows business is active and generating engagement.
--   Normalized within cohort using percentile ranking.

-- Response rate (15%): PROPRIETARY LocalGenius signal. Engagement.
--   Percentage of reviews that received a response.
--   Already on 0-100 scale, used directly.

-- Response time (15%): PROPRIETARY LocalGenius signal. Customer service.
--   Average hours to respond. Lower = better.
--   Inverted and normalized: 100 - (hours / 72 * 100), capped at 0-100.

-- ─────────────────────────────────────────────────────────────────────────────
-- Minimum Cohort Size Constant
-- ─────────────────────────────────────────────────────────────────────────────
-- Per decisions.md line 103: N >= 10 required for valid rankings

CREATE OR REPLACE FUNCTION get_min_cohort_size()
RETURNS INTEGER AS $$
BEGIN
    RETURN 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_min_cohort_size() IS 'RANK: Minimum cohort size for valid rankings (10)';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Calculate component scores for a single business
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_component_scores(
    p_review_count INTEGER,
    p_avg_rating DECIMAL,
    p_review_velocity DECIMAL,
    p_response_rate DECIMAL,
    p_avg_response_time_hours INTEGER,
    p_cohort_review_count_pctl DECIMAL,
    p_cohort_velocity_pctl DECIMAL
)
RETURNS JSONB AS $$
DECLARE
    v_review_count_score DECIMAL;
    v_avg_rating_score DECIMAL;
    v_review_velocity_score DECIMAL;
    v_response_rate_score DECIMAL;
    v_response_time_score DECIMAL;
BEGIN
    -- Review count: percentile within cohort (0-100)
    v_review_count_score := COALESCE(p_cohort_review_count_pctl, 50);

    -- Average rating: convert 1-5 scale to 0-100
    -- (rating - 1) / 4 * 100
    v_avg_rating_score := GREATEST(0, LEAST(100,
        ((COALESCE(p_avg_rating, 3.0) - 1) / 4) * 100
    ));

    -- Review velocity: percentile within cohort (0-100)
    v_review_velocity_score := COALESCE(p_cohort_velocity_pctl, 50);

    -- Response rate: already 0-100
    v_response_rate_score := COALESCE(p_response_rate, 50);

    -- Response time: invert (lower is better)
    -- 100 - (hours / 72 * 100), capped at 0-100
    -- 72 hours (3 days) = 0 score, 0 hours = 100 score
    IF p_avg_response_time_hours IS NULL THEN
        v_response_time_score := 50; -- Default for unknown
    ELSE
        v_response_time_score := GREATEST(0, LEAST(100,
            100 - (p_avg_response_time_hours::DECIMAL / 72 * 100)
        ));
    END IF;

    RETURN jsonb_build_object(
        'reviewCount', ROUND(v_review_count_score, 1),
        'avgRating', ROUND(v_avg_rating_score, 1),
        'reviewVelocity', ROUND(v_review_velocity_score, 1),
        'responseRate', ROUND(v_response_rate_score, 1),
        'responseTime', ROUND(v_response_time_score, 1)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_component_scores IS 'RANK: Calculate individual metric scores for "Why this rank?" breakdown';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Calculate composite score from component scores
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_composite_score(
    p_component_scores JSONB
)
RETURNS DECIMAL AS $$
DECLARE
    -- Weights per decisions.md line 115
    W_REVIEW_COUNT CONSTANT DECIMAL := 0.25;
    W_AVG_RATING CONSTANT DECIMAL := 0.25;
    W_REVIEW_VELOCITY CONSTANT DECIMAL := 0.20;
    W_RESPONSE_RATE CONSTANT DECIMAL := 0.15;
    W_RESPONSE_TIME CONSTANT DECIMAL := 0.15;

    v_composite DECIMAL;
BEGIN
    v_composite := (
        (p_component_scores->>'reviewCount')::DECIMAL * W_REVIEW_COUNT +
        (p_component_scores->>'avgRating')::DECIMAL * W_AVG_RATING +
        (p_component_scores->>'reviewVelocity')::DECIMAL * W_REVIEW_VELOCITY +
        (p_component_scores->>'responseRate')::DECIMAL * W_RESPONSE_RATE +
        (p_component_scores->>'responseTime')::DECIMAL * W_RESPONSE_TIME
    );

    RETURN ROUND(v_composite, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_composite_score IS 'RANK: Weighted composite score (25/25/20/15/15)';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Determine cohort for a business with dynamic sizing
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION determine_cohort(
    p_business_id UUID,
    p_category TEXT,
    p_city TEXT,
    p_metro TEXT,
    p_state TEXT,
    p_date DATE
)
RETURNS TABLE (
    cohort_level TEXT,
    cohort_label TEXT,
    cohort_size INTEGER
) AS $$
DECLARE
    v_min_size INTEGER;
    v_city_count INTEGER;
    v_metro_count INTEGER;
    v_state_count INTEGER;
BEGIN
    v_min_size := get_min_cohort_size();

    -- Try city-level first
    SELECT COUNT(DISTINCT business_id) INTO v_city_count
    FROM business_metrics
    WHERE category = p_category
      AND location_city = p_city
      AND date = p_date;

    IF v_city_count >= v_min_size THEN
        RETURN QUERY SELECT
            'city'::TEXT,
            p_city || ' ' || INITCAP(REPLACE(p_category, '_', ' ')),
            v_city_count;
        RETURN;
    END IF;

    -- Try metro-level
    IF p_metro IS NOT NULL THEN
        SELECT COUNT(DISTINCT business_id) INTO v_metro_count
        FROM business_metrics
        WHERE category = p_category
          AND location_metro = p_metro
          AND date = p_date;

        IF v_metro_count >= v_min_size THEN
            RETURN QUERY SELECT
                'metro'::TEXT,
                p_metro || ' Metro ' || INITCAP(REPLACE(p_category, '_', ' ')),
                v_metro_count;
            RETURN;
        END IF;
    END IF;

    -- Try state-level
    SELECT COUNT(DISTINCT business_id) INTO v_state_count
    FROM business_metrics
    WHERE category = p_category
      AND location_state = p_state
      AND date = p_date;

    IF v_state_count >= v_min_size THEN
        RETURN QUERY SELECT
            'state'::TEXT,
            p_state || ' ' || INITCAP(REPLACE(p_category, '_', ' ')),
            v_state_count;
        RETURN;
    END IF;

    -- Insufficient data — return NULL (caller handles "Insufficient data" state)
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION determine_cohort IS 'RANK: Dynamic cohort sizing (city -> metro -> state)';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Rank a single business in its cohort
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION rank_business_in_cohort(
    p_business_id UUID,
    p_week_of DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE
)
RETURNS TABLE (
    business_id UUID,
    week_of DATE,
    category TEXT,
    cohort_level TEXT,
    cohort_label TEXT,
    cohort_size INTEGER,
    rank INTEGER,
    percentile DECIMAL,
    rank_change INTEGER,
    composite_score DECIMAL,
    component_scores JSONB
) AS $$
DECLARE
    v_metrics RECORD;
    v_cohort RECORD;
    v_prev_rank INTEGER;
    v_component_scores JSONB;
    v_composite_score DECIMAL;
    v_rank INTEGER;
    v_percentile DECIMAL;
BEGIN
    -- Get latest metrics for the business
    SELECT * INTO v_metrics
    FROM business_metrics bm
    WHERE bm.business_id = p_business_id
    ORDER BY bm.date DESC
    LIMIT 1;

    IF v_metrics IS NULL THEN
        RETURN; -- No metrics, cannot rank
    END IF;

    -- Determine cohort with dynamic sizing
    SELECT * INTO v_cohort
    FROM determine_cohort(
        p_business_id,
        v_metrics.category,
        v_metrics.location_city,
        v_metrics.location_metro,
        v_metrics.location_state,
        v_metrics.date
    );

    IF v_cohort IS NULL OR v_cohort.cohort_size IS NULL THEN
        RETURN; -- Insufficient data for ranking
    END IF;

    -- Calculate component scores with cohort percentiles
    WITH cohort_stats AS (
        SELECT
            PERCENT_RANK() OVER (ORDER BY review_count) * 100 AS review_count_pctl,
            PERCENT_RANK() OVER (ORDER BY review_velocity) * 100 AS velocity_pctl
        FROM business_metrics
        WHERE category = v_metrics.category
          AND (
              (v_cohort.cohort_level = 'city' AND location_city = v_metrics.location_city) OR
              (v_cohort.cohort_level = 'metro' AND location_metro = v_metrics.location_metro) OR
              (v_cohort.cohort_level = 'state' AND location_state = v_metrics.location_state)
          )
          AND date = v_metrics.date
          AND business_id = p_business_id
    )
    SELECT * INTO v_component_scores
    FROM (
        SELECT calculate_component_scores(
            v_metrics.review_count,
            v_metrics.avg_rating,
            v_metrics.review_velocity,
            v_metrics.response_rate,
            v_metrics.avg_response_time_hours,
            cs.review_count_pctl,
            cs.velocity_pctl
        )
        FROM cohort_stats cs
    ) AS scores;

    -- Default component scores if cohort stats unavailable
    IF v_component_scores IS NULL THEN
        v_component_scores := calculate_component_scores(
            v_metrics.review_count,
            v_metrics.avg_rating,
            v_metrics.review_velocity,
            v_metrics.response_rate,
            v_metrics.avg_response_time_hours,
            50, -- Default percentile
            50  -- Default percentile
        );
    END IF;

    v_composite_score := calculate_composite_score(v_component_scores);

    -- Calculate rank using DENSE_RANK
    WITH ranked AS (
        SELECT
            bm.business_id,
            DENSE_RANK() OVER (ORDER BY calculate_composite_score(
                calculate_component_scores(
                    bm.review_count,
                    bm.avg_rating,
                    bm.review_velocity,
                    bm.response_rate,
                    bm.avg_response_time_hours,
                    50, 50
                )
            ) DESC) AS rnk
        FROM business_metrics bm
        WHERE bm.category = v_metrics.category
          AND (
              (v_cohort.cohort_level = 'city' AND bm.location_city = v_metrics.location_city) OR
              (v_cohort.cohort_level = 'metro' AND bm.location_metro = v_metrics.location_metro) OR
              (v_cohort.cohort_level = 'state' AND bm.location_state = v_metrics.location_state)
          )
          AND bm.date = v_metrics.date
    )
    SELECT rnk INTO v_rank
    FROM ranked
    WHERE ranked.business_id = p_business_id;

    -- Calculate percentile: 100 - ((rank - 1) / cohort_size * 100)
    v_percentile := ROUND(100 - ((v_rank - 1)::DECIMAL / v_cohort.cohort_size * 100), 2);

    -- Get previous rank for rank_change calculation
    SELECT wr.rank INTO v_prev_rank
    FROM weekly_rankings wr
    WHERE wr.business_id = p_business_id
      AND wr.week_of < p_week_of
    ORDER BY wr.week_of DESC
    LIMIT 1;

    RETURN QUERY SELECT
        p_business_id,
        p_week_of,
        v_metrics.category,
        v_cohort.cohort_level,
        v_cohort.cohort_label,
        v_cohort.cohort_size,
        v_rank,
        v_percentile,
        COALESCE(v_prev_rank - v_rank, 0), -- Positive = moved up
        v_composite_score,
        v_component_scores;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION rank_business_in_cohort IS 'RANK: Calculate rank for a single business with dynamic cohort sizing';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Refresh all rankings for a category
-- Called by weekly cron job
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_rankings_for_category(
    p_category TEXT,
    p_week_of DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE
)
RETURNS TABLE (
    businesses_ranked INTEGER,
    businesses_insufficient_data INTEGER
) AS $$
DECLARE
    v_ranked INTEGER := 0;
    v_insufficient INTEGER := 0;
    v_business RECORD;
    v_result RECORD;
BEGIN
    -- Get all businesses with metrics in this category
    FOR v_business IN
        SELECT DISTINCT business_id
        FROM business_metrics
        WHERE category = p_category
    LOOP
        -- Rank the business
        SELECT * INTO v_result
        FROM rank_business_in_cohort(v_business.business_id, p_week_of);

        IF v_result IS NOT NULL AND v_result.rank IS NOT NULL THEN
            -- Upsert into weekly_rankings
            INSERT INTO weekly_rankings (
                business_id, week_of, category, cohort_level, cohort_label,
                cohort_size, rank, percentile, rank_change, composite_score,
                component_scores
            ) VALUES (
                v_result.business_id, v_result.week_of, v_result.category,
                v_result.cohort_level, v_result.cohort_label, v_result.cohort_size,
                v_result.rank, v_result.percentile, v_result.rank_change,
                v_result.composite_score, v_result.component_scores
            )
            ON CONFLICT (business_id, week_of) DO UPDATE SET
                category = EXCLUDED.category,
                cohort_level = EXCLUDED.cohort_level,
                cohort_label = EXCLUDED.cohort_label,
                cohort_size = EXCLUDED.cohort_size,
                rank = EXCLUDED.rank,
                percentile = EXCLUDED.percentile,
                rank_change = EXCLUDED.rank_change,
                composite_score = EXCLUDED.composite_score,
                component_scores = EXCLUDED.component_scores,
                created_at = NOW();

            v_ranked := v_ranked + 1;
        ELSE
            v_insufficient := v_insufficient + 1;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_ranked, v_insufficient;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_rankings_for_category IS 'RANK: Refresh rankings for all businesses in a category';

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Refresh all rankings (all categories)
-- Called by weekly cron job before email send
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_all_rankings(
    p_week_of DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE
)
RETURNS TABLE (
    category TEXT,
    businesses_ranked INTEGER,
    businesses_insufficient_data INTEGER
) AS $$
DECLARE
    v_category TEXT;
    v_result RECORD;
BEGIN
    -- V1 locked categories per decisions.md
    FOREACH v_category IN ARRAY ARRAY['restaurants', 'home_services', 'retail']
    LOOP
        SELECT * INTO v_result
        FROM refresh_rankings_for_category(v_category, p_week_of);

        RETURN QUERY SELECT
            v_category,
            v_result.businesses_ranked,
            v_result.businesses_insufficient_data;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_rankings IS 'RANK: Refresh rankings for all V1 categories (restaurants, home_services, retail)';
