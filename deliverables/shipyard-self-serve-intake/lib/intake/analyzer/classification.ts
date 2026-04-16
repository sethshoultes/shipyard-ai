/**
 * Request Type Classification Module
 * Automatically categorizes intake requests into BUG_FIX, FEATURE, ENHANCEMENT, or DOCUMENTATION
 *
 * Classification Rules:
 * - BUG_FIX: "bug", "error", "broken", "issue", "fix"
 * - FEATURE: "feature", "add", "new"
 * - ENHANCEMENT: "improve", "enhance", "optimize", "update"
 * - DOCUMENTATION: "docs", "documentation", "readme", "guide"
 */

/**
 * Step 2: Define RequestType enum
 */
export enum RequestType {
  BUG_FIX = "BUG_FIX",
  FEATURE = "FEATURE",
  ENHANCEMENT = "ENHANCEMENT",
  DOCUMENTATION = "DOCUMENTATION",
}

/**
 * Classification result with confidence score
 */
export interface ClassificationResult {
  type: RequestType;
  confidence: number; // 0-1, higher = more confident
}

/**
 * Step 3: Define keyword maps for each type
 */
const KEYWORD_MAPS: Record<RequestType, string[]> = {
  [RequestType.BUG_FIX]: ["bug", "error", "broken", "issue", "fix", "crash", "fail", "problem"],
  [RequestType.FEATURE]: ["feature", "add", "new", "implement", "create"],
  [RequestType.ENHANCEMENT]: [
    "improve",
    "enhance",
    "optimize",
    "refactor",
    "performance",
    "speed",
    "efficiency",
  ],
  [RequestType.DOCUMENTATION]: [
    "docs",
    "documentation",
    "readme",
    "guide",
    "tutorial",
    "example",
    "api doc",
    "update docs",
  ],
};

/**
 * Step 4 & 5: Implement classifyRequest function
 * Checks keywords in title (higher weight) and body
 */
export function classifyRequest(title: string, body: string): ClassificationResult {
  const normalizedTitle = title.toLowerCase();
  const normalizedBody = body.toLowerCase();

  // Score each type based on keyword matches
  const typeScores: Record<RequestType, number> = {
    [RequestType.BUG_FIX]: 0,
    [RequestType.FEATURE]: 0,
    [RequestType.ENHANCEMENT]: 0,
    [RequestType.DOCUMENTATION]: 0,
  };

  // Check title keywords (higher weight: 2x)
  for (const [type, keywords] of Object.entries(KEYWORD_MAPS)) {
    for (const keyword of keywords) {
      if (normalizedTitle.includes(keyword)) {
        typeScores[type as RequestType] += 2;
      }
    }
  }

  // Check body keywords (normal weight: 1x)
  for (const [type, keywords] of Object.entries(KEYWORD_MAPS)) {
    for (const keyword of keywords) {
      if (normalizedBody.includes(keyword)) {
        typeScores[type as RequestType] += 1;
      }
    }
  }

  // Find the type with the highest score
  let maxScore = 0;
  let classifiedType = RequestType.FEATURE; // Step 7: Default to FEATURE

  for (const [type, score] of Object.entries(typeScores)) {
    if (score > maxScore) {
      maxScore = score;
      classifiedType = type as RequestType;
    }
  }

  // Step 6: Calculate confidence score
  // If no keywords matched (score is 0), confidence is low
  // Otherwise, calculate based on the distribution of scores
  let confidence = 0;

  if (maxScore === 0) {
    // No keywords found, using default
    confidence = 0.3;
  } else {
    // Calculate confidence based on how dominant the winner is
    const totalScore = Object.values(typeScores).reduce((a, b) => a + b, 0);
    confidence = maxScore / totalScore;

    // Boost confidence if title keywords were the primary match
    const titleOnlyScore = Object.values(KEYWORD_MAPS).reduce((acc, keywords) => {
      let score = 0;
      for (const keyword of keywords) {
        if (normalizedTitle.includes(keyword)) {
          score += 2;
        }
      }
      return acc + score;
    }, 0);

    if (titleOnlyScore > 0 && titleOnlyScore >= maxScore * 0.7) {
      confidence = Math.min(confidence + 0.2, 1);
    }
  }

  return {
    type: classifiedType,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
  };
}
