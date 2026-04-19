/**
 * SPARK Analytics
 * Usage logging for Cloudflare Analytics
 */

export function logRequest(event, data = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  };

  console.log(JSON.stringify(logData));
}

export function logError(siteId, errorType, errorMessage) {
  logRequest('error', {
    site_id: siteId,
    error_type: errorType,
    error_message: errorMessage
  });
}

export function logQuestion(siteId, latencyMs, error = null) {
  logRequest('question', {
    site_id: siteId,
    latency_ms: latencyMs,
    error
  });
}

export function logRateLimit(siteId, limitType) {
  logRequest('rate_limited', {
    site_id: siteId,
    limit_type: limitType
  });
}
