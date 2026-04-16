/**
 * Priority Detector - Confidence-Based Priority Detection
 * Implements REQ-ANALYSIS-001: Priority Detection Engine with confidence scoring
 *
 * Confidence Calculation:
 * - Exact keyword match in title: 1.0
 * - Exact keyword match in body: 0.8
 * - Partial match or context-based: 0.5
 * - No clear signals: 0.0
 *
 * Threshold: If confidence < 0.7, defaults to p2 and requests user clarification
 * Addresses RISK-005: Over-Confidence prevention through conservative defaults
 */

/**
 * Priority level type
 */
export type Priority = 'p0' | 'p1' | 'p2';

/**
 * Detection result with confidence scoring
 */
export interface DetectionResult {
  priority: Priority;
  confidence: number;
  needs_clarification: boolean;
  reasoning: string;
}

/**
 * Priority keywords mapped to priority level
 * Used for exact and partial matching
 */
interface PriorityKeywords {
  p0: {
    exact: string[];
    partial: string[];
  };
  p1: {
    exact: string[];
    partial: string[];
  };
  p2: {
    exact: string[];
    partial: string[];
  };
}

/**
 * Default priority keywords configuration
 */
const PRIORITY_KEYWORDS: PriorityKeywords = {
  p0: {
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
    partial: [
      'critical',
      'urgent',
      'emergency',
      'crash',
      'broken',
      'failure',
      'outage',
      'down',
    ],
  },
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
  p2: {
    exact: [
      'nice to have',
      'enhancement',
      'feature request',
      'low priority',
      'low-priority',
      'minor',
      'documentation',
    ],
    partial: [
      'feature',
      'request',
      'improvement',
      'nice to have',
      'enhancement',
    ],
  },
};

/**
 * Confidence thresholds
 */
const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Priority Detector Class
 * Analyzes GitHub issue content to detect priority with confidence scoring
 */
export class PriorityDetector {
  private keywords: PriorityKeywords;

  constructor(keywords?: PriorityKeywords) {
    this.keywords = keywords || PRIORITY_KEYWORDS;
  }

  /**
   * Detect priority from issue title and body
   * Returns priority, confidence, and clarification flag
   */
  detectPriority(
    title: string,
    body: string = ''
  ): DetectionResult {
    // Normalize input
    const normalizedTitle = this.normalize(title);
    const normalizedBody = this.normalize(body);

    // Calculate scores for each priority level
    const p0Score = this.calculateScore(normalizedTitle, normalizedBody, 'p0');
    const p1Score = this.calculateScore(normalizedTitle, normalizedBody, 'p1');
    const p2Score = this.calculateScore(normalizedTitle, normalizedBody, 'p2');

    // Find highest scoring priority
    const scores = {
      p0: p0Score.confidence,
      p1: p1Score.confidence,
      p2: p2Score.confidence,
    };

    let detectedPriority: Priority = 'p2';
    let maxConfidence = 0;
    let maxReasoning = '';

    for (const [priority, confidence] of Object.entries(scores)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedPriority = priority as Priority;
        maxReasoning = this.getReasoning(priority as Priority, confidence, scores);
      }
    }

    // Apply threshold
    if (maxConfidence < CONFIDENCE_THRESHOLD) {
      const confStr = maxConfidence.toFixed(2);
      const hint = maxReasoning || 'No clear priority signals found';
      return {
        priority: 'p2',
        confidence: maxConfidence,
        needs_clarification: true,
        reasoning: `Low confidence detected (${confStr}). Defaulting to p2 and requesting clarification. Hint: ${hint}`,
      };
    }

    return {
      priority: detectedPriority,
      confidence: maxConfidence,
      needs_clarification: false,
      reasoning: maxReasoning,
    };
  }

  /**
   * Calculate confidence score for a specific priority level
   * Score structure: confidence, titleMatch, bodyMatch
   */
  private calculateScore(
    normalizedTitle: string,
    normalizedBody: string,
    priority: Priority
  ): { confidence: number; titleMatch: boolean; bodyMatch: boolean } {
    const keywords = this.keywords[priority];

    // Check for exact matches in title (1.0 confidence)
    for (const keyword of keywords.exact) {
      if (normalizedTitle.includes(keyword)) {
        return {
          confidence: 1.0,
          titleMatch: true,
          bodyMatch: false,
        };
      }
    }

    // Check for exact matches in body (0.8 confidence)
    for (const keyword of keywords.exact) {
      if (normalizedBody.includes(keyword)) {
        return {
          confidence: 0.8,
          titleMatch: false,
          bodyMatch: true,
        };
      }
    }

    // Check for partial matches in title (0.5 confidence)
    for (const keyword of keywords.partial) {
      if (normalizedTitle.includes(keyword)) {
        return {
          confidence: 0.5,
          titleMatch: true,
          bodyMatch: false,
        };
      }
    }

    // Check for partial matches in body (0.5 confidence)
    for (const keyword of keywords.partial) {
      if (normalizedBody.includes(keyword)) {
        return {
          confidence: 0.5,
          titleMatch: false,
          bodyMatch: true,
        };
      }
    }

    // No matches (0.0 confidence)
    return {
      confidence: 0.0,
      titleMatch: false,
      bodyMatch: false,
    };
  }

  /**
   * Get human-readable reasoning for the detection
   */
  private getReasoning(
    _priority: Priority,
    confidence: number,
    _allScores: { [key: string]: number }
  ): string {
    const confStr = confidence.toFixed(2);

    if (confidence === 1.0) {
      return `Exact keyword match in title (confidence: ${confStr})`;
    } else if (confidence === 0.8) {
      return `Exact keyword match in body (confidence: ${confStr})`;
    } else if (confidence === 0.5) {
      return `Partial keyword match or contextual signals (confidence: ${confStr})`;
    }

    return `Insufficient signals for confident classification (confidence: ${confStr})`;
  }

  /**
   * Normalize text for matching
   * Convert to lowercase, remove extra whitespace
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Get default keywords configuration
   */
  static getDefaultKeywords(): PriorityKeywords {
    return JSON.parse(JSON.stringify(PRIORITY_KEYWORDS));
  }

  /**
   * Get confidence threshold
   */
  static getConfidenceThreshold(): number {
    return CONFIDENCE_THRESHOLD;
  }
}

/**
 * Factory function for creating a priority detector with default configuration
 */
export function createPriorityDetector(
  keywords?: PriorityKeywords
): PriorityDetector {
  return new PriorityDetector(keywords);
}

/**
 * Convenience function for one-off detection
 */
export function detectPriority(
  title: string,
  body?: string
): DetectionResult {
  const detector = createPriorityDetector();
  return detector.detectPriority(title, body || '');
}
