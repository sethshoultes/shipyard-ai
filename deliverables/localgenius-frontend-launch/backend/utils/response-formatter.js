/**
 * Response Formatter for LocalGenius
 * Normalizes responses from cache and OpenAI
 */

export class ResponseFormatter {
  /**
   * Format successful chat response
   */
  static success(answer, metadata = {}) {
    return {
      success: true,
      answer,
      cached: metadata.cached || false,
      responseTime: metadata.responseTime || 0,
      timestamp: Date.now()
    };
  }

  /**
   * Format error response
   */
  static error(message, code = 'UNKNOWN_ERROR') {
    return {
      success: false,
      error: {
        code,
        message
      },
      timestamp: Date.now()
    };
  }

  /**
   * Format timeout fallback response
   */
  static timeout(businessEmail) {
    const message = businessEmail
      ? `I'm not sure about that. Please contact us at ${businessEmail} for more information.`
      : `I'm not sure about that. Please contact us for more information.`;

    return {
      success: true,
      answer: message,
      cached: false,
      fallback: true,
      timestamp: Date.now()
    };
  }

  /**
   * Sanitize and validate input
   */
  static sanitizeQuestion(question) {
    if (!question || typeof question !== 'string') {
      return null;
    }

    const sanitized = question.trim();

    if (sanitized.length === 0 || sanitized.length > 500) {
      return null;
    }

    return sanitized;
  }

  /**
   * Calculate similarity between two strings (simple Levenshtein distance)
   * Used for FAQ matching
   */
  static similarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
