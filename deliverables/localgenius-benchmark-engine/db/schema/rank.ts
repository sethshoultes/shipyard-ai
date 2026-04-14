/**
 * RANK Database Schema — Drizzle ORM
 *
 * Extends LocalGenius schema with RANK-specific tables for competitive benchmarking.
 *
 * Tables:
 *   - business_metrics: Append-only daily metric snapshots per business
 *
 * Per decisions.md:
 *   - Reviews only (no social/website data)
 *   - 3 categories: restaurants, home_services, retail
 *   - Dynamic cohort sizing: city -> metro -> state
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  numeric,
  date,
  jsonb,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { businesses } from "../schema";

// ─── RANK Categories ──────────────────────────────────────────────────────────
// V1 locked scope: exactly 3 categories per decisions.md line 55

export const RANK_CATEGORIES = ["restaurants", "home_services", "retail"] as const;
export type RankCategory = (typeof RANK_CATEGORIES)[number];

// ─── Business Metrics ─────────────────────────────────────────────────────────
// Append-only table storing daily metric snapshots for each business.
// Foundation for all ranking calculations.
//
// REQ-DB-001: business_metrics table
// REQ-DB-003: append-only with timestamps
// REQ-DB-004: indexed for cohort queries

export const businessMetrics = pgTable(
  "business_metrics",
  {
    // Foreign key to businesses table
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    // Snapshot date (one row per business per day)
    date: date("date", { mode: "date" }).notNull(),

    // Category for cohort grouping
    // V1: restaurants | home_services | retail
    category: text("category").notNull(),

    // Geographic hierarchy for dynamic cohort sizing
    // per decisions.md line 103: city -> metro -> state
    locationCity: text("location_city").notNull(),
    locationMetro: text("location_metro"),
    locationState: text("location_state").notNull(),

    // ─── Commodity Signals (from GBP API) ─────────────────────────────────────
    // Per decisions.md line 115: these are commodity data everyone can scrape

    // Total review count on Google Business Profile
    reviewCount: integer("review_count").notNull().default(0),

    // Average star rating (1.0 - 5.0)
    avgRating: numeric("avg_rating", { precision: 2, scale: 1 }).notNull().default("0.0"),

    // Reviews per 30 days (velocity indicator)
    // Higher = more active, trending business
    reviewVelocity: numeric("review_velocity", { precision: 4, scale: 1 }).notNull().default("0.0"),

    // ─── Proprietary Signals (from LocalGenius platform) ──────────────────────
    // Per decisions.md line 115: these are the moat

    // Percentage of reviews responded to (0-100)
    responseRate: numeric("response_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),

    // Average hours to respond to reviews
    avgResponseTimeHours: integer("avg_response_time_hours"),

    // Insertion timestamp
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Composite primary key: one row per business per day
    primaryKey({ columns: [table.businessId, table.date] }),

    // Index for category-based cohort queries
    index("idx_business_metrics_category_date").on(table.category, table.date),

    // Index for geographic cohort queries
    index("idx_business_metrics_location_category").on(
      table.locationCity,
      table.category,
      table.date
    ),

    // Index for metro-level cohort fallback
    index("idx_business_metrics_metro_category").on(
      table.locationMetro,
      table.category,
      table.date
    ),

    // Index for state-level cohort fallback
    index("idx_business_metrics_state_category").on(
      table.locationState,
      table.category,
      table.date
    ),

    // Category constraint: V1 locked to 3 categories
    check(
      "category_check",
      sql`${table.category} IN ('restaurants', 'home_services', 'retail')`
    ),
  ]
);

// ─── Weekly Rankings Cache ────────────────────────────────────────────────────
// Stores computed weekly rankings. Updated via cron job refreshing
// the materialized view. This table is the "read model" for fast dashboard access.
//
// REQ-DB-002: weekly_rankings

export const weeklyRankings = pgTable(
  "weekly_rankings",
  {
    // Primary key
    id: uuid("id").primaryKey().defaultRandom(),

    // Foreign key to business
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    // Week start date (Monday)
    weekOf: date("week_of", { mode: "date" }).notNull(),

    // Category for this ranking
    category: text("category").notNull(),

    // ─── Cohort Info ──────────────────────────────────────────────────────────
    // Per decisions.md line 103: dynamic cohort sizing

    // Final cohort level used (city | metro | state)
    cohortLevel: text("cohort_level").notNull(),

    // Human-readable cohort label: "Austin Mexican Restaurants"
    cohortLabel: text("cohort_label").notNull(),

    // Total businesses in this cohort
    cohortSize: integer("cohort_size").notNull(),

    // ─── Ranking Data ─────────────────────────────────────────────────────────

    // Position in cohort (1 = best)
    rank: integer("rank").notNull(),

    // Percentile (100 = top, 0 = bottom)
    // Formula: 100 - ((rank - 1) / cohort_size * 100)
    percentile: numeric("percentile", { precision: 5, scale: 2 }).notNull(),

    // Change from previous week (+2 = moved up 2 spots, -1 = dropped 1)
    rankChange: integer("rank_change").notNull().default(0),

    // ─── Composite Score ──────────────────────────────────────────────────────
    // Per REQ-BL-001 weights: review_count 25%, avg_rating 25%,
    // review_velocity 20%, response_rate 15%, response_time 15%

    compositeScore: numeric("composite_score", { precision: 8, scale: 4 }).notNull(),

    // Component scores for "Why this rank?" breakdown
    // { reviewCount: 85, avgRating: 90, reviewVelocity: 75, responseRate: 95, responseTime: 80 }
    componentScores: jsonb("component_scores").notNull(),

    // ─── Timestamps ───────────────────────────────────────────────────────────

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Unique constraint for upsert: one ranking per business per week
    index("idx_weekly_rankings_business_week").on(table.businessId, table.weekOf),

    // Index for dashboard queries: get latest rank for a business
    index("idx_weekly_rankings_business_latest").on(table.businessId, table.weekOf),

    // Index for leaderboard queries (if we add public leaderboards later)
    index("idx_weekly_rankings_cohort").on(
      table.category,
      table.cohortLabel,
      table.weekOf,
      table.rank
    ),
  ]
);

// ─── Rank Email Preferences ───────────────────────────────────────────────────
// Per-business email preferences for RANK weekly digest

export const rankEmailPreferences = pgTable(
  "rank_email_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    // Whether to receive weekly rank emails
    weeklyEmailEnabled: integer("weekly_email_enabled").notNull().default(1),

    // Last rank sent (to avoid duplicate sends)
    lastEmailSentAt: timestamp("last_email_sent_at", { withTimezone: true }),

    // Last known rank (preserved for OAuth failure fallback)
    // Per decisions.md line 270: preserve last-known rank with timestamp
    lastKnownRank: integer("last_known_rank"),
    lastKnownRankAt: timestamp("last_known_rank_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_rank_email_preferences_business").on(table.businessId),
  ]
);

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type NewBusinessMetric = typeof businessMetrics.$inferInsert;
export type WeeklyRanking = typeof weeklyRankings.$inferSelect;
export type NewWeeklyRanking = typeof weeklyRankings.$inferInsert;
export type RankEmailPreference = typeof rankEmailPreferences.$inferSelect;
