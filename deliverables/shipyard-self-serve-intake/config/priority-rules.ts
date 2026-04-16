/**
 * Priority Detection Keyword Mappings
 *
 * Defines the keywords that trigger p0, p1, and p2 priority detection.
 * This configuration is the transparency layer for "intelligent defaults" (Decision 5).
 *
 * Users and maintainers can see exactly what keywords influence priority detection.
 * REQ-ANALYSIS-001: Priority Detection Engine
 *
 * Confidence Scoring System:
 * - Exact matches in title: 1.0 (highest confidence)
 * - Exact matches in body: 0.8 (high confidence)
 * - Partial matches in title: 0.5 (medium confidence)
 * - Partial matches in body: 0.5 (medium confidence)
 * - No matches: 0.0 (no signal)
 *
 * Threshold: 0.7 confidence required; below threshold defaults to p2 with clarification request
 */

export const PRIORITY_RULES = {
  /**
   * P0 (Critical) Keywords
   * Exact matches that definitively indicate production-blocking issues
   */
  p0: {
    // Exact phrases (highest confidence when matched)
    exact: [
      'production down',
      'critical bug',
      'urgent bug',
      'production broken',
      'system outage',
      'critical outage',
      'data loss',
      'security breach',
      'security vulnerability',
      'down',
    ],
    // Partial keywords (medium confidence)
    partial: [
      'critical',
      'urgent',
      'emergency',
      'crash',
      'broken',
      'failure',
      'outage',
    ],
  },

  /**
   * P1 (Medium) Keywords
   * Indicate bugs, issues, or blocking work that needs attention
   */
  p1: {
    exact: [
      'high priority',
      'high-priority',
      'major bug',
      'significant bug',
      'blocking',
      'blocker',
      'regression',
      'performance issue',
    ],
    partial: [
      'bug',
      'issue',
      'problem',
      'blocking',
      'regression',
      'degradation',
      'major',
      'significant',
    ],
  },

  /**
   * P2 (Low) Keywords
   * Explicitly mark items as nice-to-have, enhancements, or feature requests
   */
  p2: {
    exact: [
      'nice to have',
      'nice-to-have',
      'enhancement',
      'feature request',
      'low priority',
      'low-priority',
      'minor',
      'documentation',
      'would be nice',
    ],
    partial: [
      'feature',
      'request',
      'improvement',
      'nice',
      'enhancement',
    ],
  },
} as const;

// Legacy compatibility exports
export const PRIORITY_KEYWORDS = {
  p0_keywords: [...PRIORITY_RULES.p0.exact, ...PRIORITY_RULES.p0.partial],
  p1_keywords: [...PRIORITY_RULES.p1.exact, ...PRIORITY_RULES.p1.partial],
  p2_keywords: [...PRIORITY_RULES.p2.exact, ...PRIORITY_RULES.p2.partial],
} as const;

/**
 * Priority Metadata
 * Provides context about each priority level
 */
export const PRIORITY_METADATA = {
  p0: {
    label: 'Critical',
    description: 'Production-blocking bugs, urgent issues, emergency fixes',
    sla: '< 1 hour',
    color: '#d32f2f', // Red
    icon: '🚨',
  },
  p1: {
    label: 'Medium',
    description: 'Feature requests, enhancements, non-blocking issues',
    sla: '< 1 day',
    color: '#f57c00', // Orange
    icon: '⚠️',
  },
  p2: {
    label: 'Low',
    description: 'Nice-to-have features, optional improvements, backlog items',
    sla: '< 1 week',
    color: '#558b2f', // Green
    icon: '💭',
  },
} as const;

/**
 * Confidence Thresholds
 * Used to determine how certain the detection algorithm is
 */
export const CONFIDENCE_THRESHOLDS = {
  high: 0.9, // Very confident in the detection
  medium: 0.7, // Reasonably confident
  low: 0.3, // Low confidence, likely a default
} as const;

/**
 * Default behavior when priority cannot be determined
 */
export const DEFAULT_PRIORITY = 'p2' as const;

/**
 * Reasoning templates for transparent communication
 */
export const DETECTION_MESSAGES = {
  p0_production_bug: 'Production bug detected - critical priority',
  p0_urgent: 'Urgent issue detected - critical priority',
  p0_emergency: 'Emergency issue detected - critical priority',
  p0_critical: 'Critical issue detected - critical priority',
  p0_blocking: 'Blocking issue detected - critical priority',
  p1_feature_request: 'Feature request detected - medium priority',
  p1_enhancement: 'Enhancement request detected - medium priority',
  p2_nice_to_have: 'Nice-to-have feature detected - low priority',
  p2_would_be_nice: 'Optional improvement detected - low priority',
  p2_optional: 'Optional feature detected - low priority',
  p2_default: 'No clear priority signals - defaulting to low priority (p2)',
} as const;
