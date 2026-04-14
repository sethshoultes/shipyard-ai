/**
 * RANK TrendLine — SVG Sparkline Component
 *
 * Simple SVG sparkline showing 4 weeks of rank history.
 * No external chart library — pure SVG for minimal bundle size.
 *
 * Requirements:
 *   REQ-UI-002: TrendLine sparkline
 *
 * Color coding:
 *   - Green = improving (rank going down / moving up)
 *   - Red = declining (rank going up / moving down)
 */

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrendLineProps {
  /**
   * Array of rank positions over time (most recent last).
   * Lower numbers are better (rank 1 > rank 10).
   * Should contain 4 weeks of data.
   */
  data: number[];

  /**
   * SVG width in pixels. Default: 120
   */
  width?: number;

  /**
   * SVG height in pixels. Default: 40
   */
  height?: number;

  /**
   * Show week labels below the chart. Default: false
   */
  showLabels?: boolean;

  /**
   * Custom accessible label for screen readers.
   */
  ariaLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrendLine({
  data,
  width = 120,
  height = 40,
  showLabels = false,
  ariaLabel,
}: TrendLineProps) {
  // Handle edge cases
  if (!data || data.length === 0) {
    return <NotEnoughHistory width={width} height={height} />;
  }

  if (data.length === 1) {
    return <SinglePoint width={width} height={height} rank={data[0]} />;
  }

  // Padding for dots at edges
  const paddingX = 8;
  const paddingY = 6;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Find min/max for scaling (invert: lower rank = higher on chart)
  const minRank = Math.min(...data);
  const maxRank = Math.max(...data);
  const rankRange = maxRank - minRank || 1; // Avoid division by zero

  // Calculate points
  const points = data.map((rank, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    // Invert Y: lower rank (better) should be higher on the chart
    const normalizedRank = (rank - minRank) / rankRange;
    const y = paddingY + normalizedRank * chartHeight;
    return { x, y, rank };
  });

  // Create polyline path
  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Determine trend direction (comparing first and last)
  const firstRank = data[0];
  const lastRank = data[data.length - 1];
  const isImproving = lastRank < firstRank; // Lower rank = better
  const isStable = lastRank === firstRank;

  // Color based on trend
  const lineColor = isStable
    ? "#9CA3AF" // gray
    : isImproving
    ? "#10B981" // green
    : "#EF4444"; // red

  const dotColor = lineColor;

  // Build trend description for accessibility
  const trendDescription = isStable
    ? "Rank stable"
    : isImproving
    ? `Improved from #${firstRank} to #${lastRank}`
    : `Dropped from #${firstRank} to #${lastRank}`;

  const accessibleLabel =
    ariaLabel || `Rank trend over ${data.length} weeks. ${trendDescription}`;

  return (
    <div className="trend-line-container">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={accessibleLabel}
        className="trend-line-svg"
      >
        {/* Gradient for filled area (subtle) */}
        <defs>
          <linearGradient
            id={`trend-gradient-${isImproving ? "up" : "down"}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Filled area under line */}
        <polygon
          points={`${points[0].x},${height - paddingY} ${polylinePath} ${
            points[points.length - 1].x
          },${height - paddingY}`}
          fill={`url(#trend-gradient-${isImproving ? "up" : "down"})`}
        />

        {/* Main line */}
        <polyline
          points={polylinePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="white"
            stroke={dotColor}
            strokeWidth={2}
          />
        ))}
      </svg>

      {/* Week labels */}
      {showLabels && (
        <div
          className="flex justify-between px-2 mt-1"
          style={{ width }}
          aria-hidden="true"
        >
          {data.map((_, index) => (
            <span key={index} className="text-xs text-gray-400">
              W{data.length - index}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edge Case Components ─────────────────────────────────────────────────────

function NotEnoughHistory({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <div
      className="flex items-center justify-center text-gray-400 text-xs"
      style={{ width, height }}
      role="img"
      aria-label="Not enough history to show trend"
    >
      <span>Not enough history</span>
    </div>
  );
}

function SinglePoint({
  width,
  height,
  rank,
}: {
  width: number;
  height: number;
  rank: number;
}) {
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Current rank: #${rank}. More history needed to show trend.`}
      className="trend-line-svg"
    >
      {/* Single dot */}
      <circle
        cx={centerX}
        cy={centerY}
        r={4}
        fill="white"
        stroke="#9CA3AF"
        strokeWidth={2}
      />

      {/* Rank label */}
      <text
        x={centerX}
        y={centerY - 10}
        textAnchor="middle"
        className="text-xs fill-gray-500"
        fontSize={10}
      >
        #{rank}
      </text>
    </svg>
  );
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Calculate trend direction from rank data.
 *
 * @param data - Array of rank positions (most recent last)
 * @returns "improving" | "declining" | "stable"
 */
export function getTrendDirection(
  data: number[]
): "improving" | "declining" | "stable" {
  if (data.length < 2) return "stable";

  const firstRank = data[0];
  const lastRank = data[data.length - 1];

  if (lastRank < firstRank) return "improving"; // Lower rank = better
  if (lastRank > firstRank) return "declining";
  return "stable";
}

/**
 * Get human-readable trend summary.
 *
 * @param data - Array of rank positions (most recent last)
 * @returns Trend summary string
 */
export function getTrendSummary(data: number[]): string {
  if (data.length < 2) return "Not enough data";

  const direction = getTrendDirection(data);
  const change = Math.abs(data[data.length - 1] - data[0]);

  switch (direction) {
    case "improving":
      return `Up ${change} spot${change !== 1 ? "s" : ""} over ${
        data.length
      } weeks`;
    case "declining":
      return `Down ${change} spot${change !== 1 ? "s" : ""} over ${
        data.length
      } weeks`;
    case "stable":
      return "Holding steady";
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default TrendLine;
