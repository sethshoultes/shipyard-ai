/**
 * SPARK Rate Limiting
 * Multi-layer rate limiting: per site_id and per IP
 */

// In-memory rate limit tracking
const rateLimits = new Map();

const LIMITS = {
  SITE_ID: {
    max: 10,
    window: 60000 // 60 seconds
  },
  IP: {
    max: 100,
    window: 3600000 // 1 hour
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
    return false;
  }

  // Increment counter
  limiter.count++;

  return true;
}

export function checkIPLimit(ip) {
  const now = Date.now();
  const key = `ip:${ip}`;

  let limiter = rateLimits.get(key);

  if (!limiter || now > limiter.resetAt) {
    // Create new or reset limiter
    limiter = {
      count: 0,
      resetAt: now + LIMITS.IP.window
    };
    rateLimits.set(key, limiter);
  }

  // Check if exceeded
  if (limiter.count >= LIMITS.IP.max) {
    return false;
  }

  // Increment counter
  limiter.count++;

  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limiter] of rateLimits.entries()) {
    const maxWindow = Math.max(LIMITS.SITE_ID.window, LIMITS.IP.window);
    if (now > limiter.resetAt + maxWindow) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Run every minute
