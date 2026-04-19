/**
 * SPARK Error Handling
 * User-friendly error messages and error handling utilities
 */

export function handleError(error) {
  console.error('SPARK Worker Error:', error);

  if (error.status === 429) {
    return {
      error: "I'm getting too many questions right now. Please wait a moment and try again.",
      status: 429,
      retryAfter: 60
    };
  }

  if (error.status === 408 || error.message?.includes('timeout')) {
    return {
      error: "That took too long. Please try again.",
      status: 408
    };
  }

  if (error.status >= 500) {
    return {
      error: "Something went wrong on my end. Please try again in a moment.",
      status: 500
    };
  }

  // Generic error
  return {
    error: "Sorry, I couldn't answer that. Please try again.",
    status: 500
  };
}

export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
    this.status = 408;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
    this.retryAfter = retryAfter;
  }
}
