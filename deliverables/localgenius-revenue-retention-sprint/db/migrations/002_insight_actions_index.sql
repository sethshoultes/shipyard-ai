-- Migration: 002_insight_actions_index
-- Project: LocalGenius Revenue & Retention Sprint
-- DECISION (LOCKED): Add (user_id, created_at) composite index on insight_actions for digest query.
-- Rationale: At 10K users x ~100 actions/month = 1M rows, the GROUP BY DATE_TRUNC query
-- must stay under 12ms.

BEGIN;

-- Drop the index if it already exists to make this migration idempotent
DROP INDEX IF EXISTS idx_insight_actions_user_created;

-- Create the composite index that supports the weekly digest MoM query
-- The query pattern is:
--   SELECT DATE_TRUNC('week', created_at), COUNT(*) ...
--   FROM insight_actions
--   WHERE user_id = $1 AND created_at > $2
--   GROUP BY DATE_TRUNC('week', created_at)
--
-- user_id is first for equality filter; created_at is second for range scan
CREATE INDEX idx_insight_actions_user_created
    ON insight_actions (user_id, created_at);

-- Add a partial index hint for the last-60-days query pattern used by the digest
-- This keeps the index lean and fast for the hot query path
DROP INDEX IF EXISTS idx_insight_actions_user_created_recent;
CREATE INDEX idx_insight_actions_user_created_recent
    ON insight_actions (user_id, created_at)
    WHERE created_at > NOW() - INTERVAL '60 days';

COMMIT;
