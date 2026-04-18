/**
 * Cliffhanger Templates for Weekly Digest
 *
 * Purpose: Create anticipation and curiosity for next week's insights
 * Tone: First-person (AI speaking), curious, experimental, never promises
 * Placement: End of weekly digest (1-2 sentences)
 */

export interface CliffhangerContext {
  bestWeekDate?: string;
  recentJournalTopic?: string;
  competitorName?: string;
  trendingMetric?: string;
  upcomingFeature?: string;
  recentPostType?: string;
  performanceAnomaly?: string;
}

export interface CliffhangerTemplate {
  id: string;
  text: (context: Partial<CliffhangerContext>) => string;
  requiredContext: (keyof CliffhangerContext)[];
  weight: number; // Selection priority (higher = more likely)
}

/**
 * Cliffhanger template library
 * Each template is context-aware and requires specific data to render
 */
export const CLIFFHANGER_TEMPLATES: CliffhangerTemplate[] = [
  {
    id: 'trying-new-post-style',
    text: (ctx) =>
      `Next week, I'm trying a different approach to your ${ctx.recentPostType || 'social media'} posts. I'll let you know if it works.`,
    requiredContext: [],
    weight: 10,
  },
  {
    id: 'competitor-observation',
    text: (ctx) =>
      `I noticed ${ctx.competitorName || 'a competitor nearby'} is doing something interesting with their menu photos. I'm going to test a variation for you.`,
    requiredContext: ['competitorName'],
    weight: 8,
  },
  {
    id: 'best-week-analysis',
    text: (ctx) =>
      `Your best week was ${ctx.bestWeekDate || 'back in March'}. I'm studying what worked that week — might have spotted a pattern.`,
    requiredContext: ['bestWeekDate'],
    weight: 9,
  },
  {
    id: 'journal-callback',
    text: (ctx) =>
      `Based on your journal note about ${ctx.recentJournalTopic || 'what worked this week'}, I'm testing something related next week. Curious to see what happens.`,
    requiredContext: ['recentJournalTopic'],
    weight: 12,
  },
  {
    id: 'feature-experiment',
    text: (ctx) =>
      `I'm testing a new ${ctx.upcomingFeature || 'feature'} next week that might help with your ${ctx.trendingMetric || 'traffic'}. No promises, but the early data looks interesting.`,
    requiredContext: ['upcomingFeature'],
    weight: 7,
  },
  {
    id: 'anomaly-investigation',
    text: (ctx) =>
      `Something unusual happened with your ${ctx.performanceAnomaly || 'website traffic'} last Tuesday. I'm digging into what caused it.`,
    requiredContext: ['performanceAnomaly'],
    weight: 9,
  },
  {
    id: 'seasonal-pattern',
    text: () =>
      `I'm tracking a seasonal pattern in your bookings — if it holds, next week could be your strongest yet. Keeping an eye on it.`,
    requiredContext: [],
    weight: 8,
  },
  {
    id: 'timing-optimization',
    text: () =>
      `I noticed your posts get more engagement at certain times. Next week, I'm trying a different posting schedule to test it.`,
    requiredContext: [],
    weight: 7,
  },
  {
    id: 'content-format-test',
    text: () =>
      `I've been analyzing which types of content drive actual reservations for you. Testing a theory next week.`,
    requiredContext: [],
    weight: 8,
  },
  {
    id: 'customer-segment-insight',
    text: () =>
      `I'm starting to see patterns in which customer segments convert best for you. More on that next week.`,
    requiredContext: [],
    weight: 7,
  },
];

/**
 * Generate a contextually appropriate cliffhanger for the weekly digest
 *
 * @param context - Available context data about the user's business
 * @returns A 1-2 sentence cliffhanger string
 */
export function generateCliffhanger(context: Partial<CliffhangerContext>): string {
  // Filter templates based on available context
  const eligibleTemplates = CLIFFHANGER_TEMPLATES.filter(template => {
    // If template has no required context, it's always eligible
    if (template.requiredContext.length === 0) {
      return true;
    }

    // Check if all required context fields are present
    return template.requiredContext.every(field => {
      const value = context[field];
      return value !== undefined && value !== null && value !== '';
    });
  });

  if (eligibleTemplates.length === 0) {
    // Fallback if no templates match (should never happen with weight-based templates)
    return "I'm analyzing your data for next week. Talk soon.";
  }

  // Weighted random selection
  const totalWeight = eligibleTemplates.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;

  for (const template of eligibleTemplates) {
    random -= template.weight;
    if (random <= 0) {
      return template.text(context);
    }
  }

  // Fallback to first eligible template
  return eligibleTemplates[0].text(context);
}

/**
 * Extract cliffhanger context from user data
 * This function is called by the digest generator to prepare context
 *
 * @param userData - User's business metrics and journal data
 * @returns CliffhangerContext object
 */
export function extractCliffhangerContext(userData: {
  bestWeek?: { date: string; metric: string };
  recentJournal?: { topic: string };
  competitors?: Array<{ name: string }>;
  metrics?: { trending?: string; anomaly?: string };
  recentPosts?: { type?: string };
}): Partial<CliffhangerContext> {
  return {
    bestWeekDate: userData.bestWeek?.date,
    recentJournalTopic: userData.recentJournal?.topic,
    competitorName: userData.competitors?.[0]?.name,
    trendingMetric: userData.metrics?.trending,
    performanceAnomaly: userData.metrics?.anomaly,
    recentPostType: userData.recentPosts?.type,
  };
}

/**
 * Validate that cliffhanger follows brand voice guidelines
 * Used in tests to ensure copy quality
 */
export function validateCliffhangerTone(text: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for banned words (promises, guarantees)
  const bannedWords = ['promise', 'guarantee', 'will definitely', 'for sure', 'certainly will'];
  for (const word of bannedWords) {
    if (text.toLowerCase().includes(word)) {
      issues.push(`Contains banned word/phrase: "${word}"`);
    }
  }

  // Check for corporate jargon
  const corporateJargon = ['synergy', 'leverage', 'paradigm', 'utilize', 'robust'];
  for (const word of corporateJargon) {
    if (text.toLowerCase().includes(word)) {
      issues.push(`Contains corporate jargon: "${word}"`);
    }
  }

  // Check length (should be 1-2 sentences)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 2) {
    issues.push('Too long (should be 1-2 sentences)');
  }

  // Check for first-person voice (should contain "I" or "I'm")
  if (!text.includes("I'm") && !text.includes('I ') && !text.match(/\bI\b/)) {
    issues.push('Should use first-person voice (I/I\'m)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export default {
  generateCliffhanger,
  extractCliffhangerContext,
  validateCliffhangerTone,
  CLIFFHANGER_TEMPLATES,
};
