/**
 * SPARK Rate Limiting
 * Multi-layer rate limiting: per site_id and per IP
 */

import { RateLimitError } from './errors.js';

// In-memory rate limit tracking
const rateLimits = new Map();

const LIMITS = {
  SITE_ID: {
    max: 10,
    window: 60000 // 60 seconds
  }
};

export function checkSiteIdLimit(siteId) {
  const now = Date.now();
  const key = `site:${siteId}`;

  let limiter = rateLimits.get(key);

  if (!limiter || now > limiter.resetAt) {
    // Create new or reset limiter
    limiter = {
      count: 0,
      resetAt: now + LIMITS.SITE_ID.window
    };
    rateLimits.set(key, limiter);
  }

  // Check if exceeded
  if (limiter.count >= LIMITS.SITE_ID.max) {
    const retryAfter = Math.ceil((limiter.resetAt - now) / 1000);
    throw new RateLimitError(
      `Rate limit exceeded: ${LIMITS.SITE_ID.max} requests per minute`,
      retryAfter
    );
  }

  // Increment counter
  limiter.count++;

  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limiter] of rateLimits.entries()) {
    if (now > limiter.resetAt + LIMITS.SITE_ID.window) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Run every minute
