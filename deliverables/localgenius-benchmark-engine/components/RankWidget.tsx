/**
 * RANK Widget — The "Punch"
 *
 * Core component displaying rank number, cohort size, direction arrow,
 * and one actionable insight. Implements "Mirror, Not Dashboard" philosophy.
 *
 * Requirements:
 *   REQ-UI-001: RankWidget display elements
 *   REQ-UI-005: "Why this rank?" breakdown
 *   REQ-BL-005: Bottom-rank handling (never shame)
 *   REQ-BL-006: Coach voice insights
 *
 * Per decisions.md line 30:
 *   "Big number. Your rank. What to do next. This is correct UX."
 *
 * Per decisions.md line 273:
 *   "Never show 'You're last.' Show 'Room to climb. Here's your next move.'"
 */

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RankWidgetProps {
  /**
   * Current rank position (1 = best).
   */
  rank: number;

  /**
   * Total businesses in the cohort.
   */
  totalInCohort: number;

  /**
   * Percentile ranking (0-100, higher is better).
   */
  percentile: number;

  /**
   * Change from previous week. Positive = moved up, negative = dropped.
   */
  rankChange: number;

  /**
   * Human-readable cohort label. E.g., "Austin Mexican Restaurants"
   */
  cohortLabel: string;

  /**
   * One actionable insight. E.g., "2 reviews away from #7"
   */
  insight: string;

  /**
   * Component scores for "Why this rank?" breakdown.
   */
  componentScores?: {
    reviewCount: number;
    avgRating: number;
    reviewVelocity: number;
    responseRate: number;
    responseTime: number;
  };

  /**
   * True if insufficient data for ranking.
   */
  isInsufficientData?: boolean;

  /**
   * Explanation if cohort expanded beyond city level.
   */
  cohortExpansionNote?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RankWidget({
  rank,
  totalInCohort,
  percentile,
  rankChange,
  cohortLabel,
  insight,
  componentScores,
  isInsufficientData = false,
  cohortExpansionNote,
}: RankWidgetProps) {
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  // Handle insufficient data state
  if (isInsufficientData) {
    return <InsufficientDataCard cohortLabel={cohortLabel} />;
  }

  // Determine if this is bottom rank (special handling per REQ-BL-005)
  const isBottomRank = rank === totalInCohort;

  // Calculate direction for arrow
  const direction = rankChange > 0 ? "up" : rankChange < 0 ? "down" : "none";

  // Calculate "Top X%" label
  const topPercentLabel = percentile >= 50 ? `Top ${Math.round(100 - percentile + 1)}%` : null;

  return (
    <div className="rank-widget bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Main Rank Display */}
      <div className="p-6 text-center">
        {/* Cohort Label */}
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          {cohortLabel}
        </p>

        {/* The Big Number */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-6xl font-bold text-gray-900">#{rank}</span>

          {/* Direction Arrow */}
          {direction !== "none" && (
            <DirectionArrow direction={direction} change={Math.abs(rankChange)} />
          )}
        </div>

        {/* Cohort Size */}
        <p className="text-2xl text-gray-400 mb-4">of {totalInCohort}</p>

        {/* Percentile Bar */}
        <PercentileBar percentile={percentile} topPercentLabel={topPercentLabel} />

        {/* Cohort Expansion Note */}
        {cohortExpansionNote && (
          <p className="text-xs text-gray-400 mt-2 italic">{cohortExpansionNote}</p>
        )}
      </div>

      {/* Insight Section — Coach Voice */}
      <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
        <p className="text-base text-gray-800 font-medium">
          {isBottomRank ? (
            // Never show "You're last" — per decisions.md line 273
            <>Room to climb. Here&apos;s your next move.</>
          ) : (
            insight
          )}
        </p>
      </div>

      {/* Why This Rank? Expandable Section */}
      {componentScores && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            aria-expanded={showBreakdown}
          >
            <span>Why this rank?</span>
            <ChevronIcon expanded={showBreakdown} />
          </button>

          {showBreakdown && (
            <ComponentBreakdown scores={componentScores} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function DirectionArrow({
  direction,
  change,
}: {
  direction: "up" | "down";
  change: number;
}) {
  const isUp = direction === "up";

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
        isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isUp ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
      <span>{change}</span>
    </div>
  );
}

function PercentileBar({
  percentile,
  topPercentLabel,
}: {
  percentile: number;
  topPercentLabel: string | null;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Ranking</span>
        {topPercentLabel && (
          <span className="text-xs font-semibold text-amber-600">
            {topPercentLabel}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(5, percentile)}%` }}
          role="progressbar"
          aria-valuenow={percentile}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${Math.round(percentile)}th percentile`}
        />
      </div>
    </div>
  );
}

function ComponentBreakdown({
  scores,
}: {
  scores: NonNullable<RankWidgetProps["componentScores"]>;
}) {
  const components = [
    { label: "Review Count", score: scores.reviewCount, icon: "📊" },
    { label: "Average Rating", score: scores.avgRating, icon: "⭐" },
    { label: "Review Velocity", score: scores.reviewVelocity, icon: "📈" },
    { label: "Response Rate", score: scores.responseRate, icon: "💬" },
    { label: "Response Time", score: scores.responseTime, icon: "⏱️" },
  ];

  // Sort by score descending to show strengths first
  const sorted = [...components].sort((a, b) => b.score - a.score);

  return (
    <div className="px-6 py-4 bg-gray-50 space-y-3">
      {sorted.map((comp) => (
        <div key={comp.label} className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">
            {comp.icon}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{comp.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(comp.score)}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  comp.score >= 70
                    ? "bg-green-500"
                    : comp.score >= 40
                    ? "bg-amber-500"
                    : "bg-red-400"
                }`}
                style={{ width: `${comp.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 pt-2">
        Higher scores in each area improve your overall rank.
      </p>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
        expanded ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function InsufficientDataCard({ cohortLabel }: { cohortLabel: string }) {
  return (
    <div className="rank-widget bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Not Enough Data Yet
        </h3>

        <p className="text-gray-600 mb-4">
          We need at least 10 similar businesses in your area to calculate a
          meaningful ranking.
        </p>

        <p className="text-sm text-gray-500">
          Cohort: <span className="font-medium">{cohortLabel}</span>
        </p>
      </div>

      <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
        <p className="text-sm text-gray-700">
          Keep building your presence — as more businesses join, your ranking
          will appear.
        </p>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default RankWidget;
