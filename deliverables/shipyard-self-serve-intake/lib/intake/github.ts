import { Octokit } from "@octokit/rest";
import { getLogger } from "./logger";

/**
 * GitHub API Client with Rate Limiting & Error Handling
 *
 * Features:
 * - Exponential backoff for 429 errors
 * - Comment queue when rate limit approaching (<100 remaining)
 * - Human-like delays between comments
 * - Circuit breaker for sustained failures
 * - Rate limit monitoring on all responses
 * - Structured logging of all API calls and errors
 */

const logger = getLogger();

interface RateLimitState {
  remaining: number;
  limit: number;
  resetAt: number;
  lastCheck: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  pausedUntil: number;
}

interface CommentQueueItem {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  timestamp: number;
  retries: number;
}

class GitHubClient {
  private octokit: Octokit;
  private rateLimitState: RateLimitState;
  private circuitBreaker: CircuitBreakerState;
  private commentQueue: Map<string, CommentQueueItem>;
  private readonly QUEUE_KEY_PREFIX = "github-comment-queue";
  private readonly CIRCUIT_BREAKER_PAUSE_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_THRESHOLD = 100; // Queue when < 100 remaining

  constructor(authToken?: string) {
    // Initialize Octokit with GitHub PAT
    this.octokit = new Octokit({
      auth: authToken || process.env.GITHUB_PAT,
    });

    // Initialize rate limit state
    this.rateLimitState = {
      remaining: 5000,
      limit: 5000,
      resetAt: Date.now() + 3600000, // 1 hour
      lastCheck: Date.now(),
    };

    // Initialize circuit breaker
    this.circuitBreaker = {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
      pausedUntil: 0,
    };

    // Initialize comment queue
    this.commentQueue = new Map();
  }

  /**
   * Monitor rate limit state from response headers
   */
  private updateRateLimitFromResponse(response: any): void {
    const remaining = response.headers["x-ratelimit-remaining"];
    const limit = response.headers["x-ratelimit-limit"];
    const reset = response.headers["x-ratelimit-reset"];

    if (remaining !== undefined) {
      this.rateLimitState.remaining = parseInt(remaining, 10);
      this.rateLimitState.limit = parseInt(limit, 10);
      this.rateLimitState.resetAt = parseInt(reset, 10) * 1000;
      this.rateLimitState.lastCheck = Date.now();

      if (this.rateLimitState.remaining < this.RATE_LIMIT_THRESHOLD) {
        logger.warn("GitHub API rate limit approaching", {
          component: "GitHubClient",
          remaining: this.rateLimitState.remaining,
          limit: this.rateLimitState.limit,
          reset_at: new Date(this.rateLimitState.resetAt).toISOString(),
        });
      }
    }
  }

  /**
   * Exponential backoff for retries
   */
  private calculateBackoffMs(retryCount: number): number {
    const baseDelayMs = 1000;
    const maxDelayMs = 60 * 1000; // 60 seconds max
    const delayMs = Math.min(baseDelayMs * Math.pow(2, retryCount), maxDelayMs);
    return delayMs + Math.random() * 1000; // Add jitter
  }

  /**
   * Human-like delay to avoid spam detection
   */
  private getHumanLikeDelayMs(): number {
    // Random delay between 1-3 seconds
    return 1000 + Math.random() * 2000;
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker.isOpen) {
      return false;
    }

    // Check if pause period has expired
    if (Date.now() >= this.circuitBreaker.pausedUntil) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      console.log("[GitHub] Circuit breaker reset");
      return false;
    }

    return true;
  }

  /**
   * Record failure and potentially trip circuit breaker
   */
  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= 5) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.pausedUntil = Date.now() + this.CIRCUIT_BREAKER_PAUSE_MS;
      logger.error(
        "Circuit breaker triggered after 5 consecutive failures",
        new Error("Circuit breaker activated"),
        {
          component: "GitHubClient",
          failure_count: this.circuitBreaker.failures,
          pause_duration_ms: this.CIRCUIT_BREAKER_PAUSE_MS,
        }
      );
    }
  }

  /**
   * Reset failure count on success
   */
  private recordSuccess(): void {
    if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = 0;
      logger.debug("Failure count reset on success", {
        component: "GitHubClient",
      });
    }
  }

  /**
   * Generate queue key for a comment
   */
  private getQueueKey(owner: string, repo: string, issueNumber: number): string {
    return `${this.QUEUE_KEY_PREFIX}:${owner}/${repo}#${issueNumber}`;
  }

  /**
   * Post or queue a comment on a GitHub issue
   */
  async postComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
    retryCount: number = 0
  ): Promise<{ success: boolean; commentUrl?: string; queued?: boolean; error?: string }> {
    // Check if circuit breaker is open
    if (this.isCircuitBreakerOpen()) {
      const errorMsg = "Circuit breaker is open. Request paused.";
      logger.error(errorMsg, new Error(errorMsg), {
        component: "GitHubClient",
        issue_id: issueNumber,
        repo: `${owner}/${repo}`,
        endpoint: "issues.createComment",
      });
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Check if we should queue instead of posting
    if (this.rateLimitState.remaining < this.RATE_LIMIT_THRESHOLD) {
      logger.info("Rate limit low, queueing comment", {
        component: "GitHubClient",
        issue_id: issueNumber,
        repo: `${owner}/${repo}`,
        remaining: this.rateLimitState.remaining,
        threshold: this.RATE_LIMIT_THRESHOLD,
      });
      return this.queueComment(owner, repo, issueNumber, body);
    }

    try {
      // Add human-like delay
      const delayMs = this.getHumanLikeDelayMs();
      await this.sleep(delayMs);

      logger.logGitHubAPICall({
        endpoint: "issues.createComment",
        method: "POST",
        params: {
          owner,
          repo,
          issue_number: issueNumber,
        },
        rateLimit: {
          remaining: this.rateLimitState.remaining,
          limit: this.rateLimitState.limit,
          resetAt: this.rateLimitState.resetAt,
        },
      });

      // Post the comment
      const response = await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body,
      });

      // Update rate limit state
      this.updateRateLimitFromResponse(response);

      // Record success
      this.recordSuccess();

      const commentUrl = response.data.html_url;
      logger.info("Comment posted successfully", {
        component: "GitHubClient",
        issue_id: issueNumber,
        repo: `${owner}/${repo}`,
        comment_url: commentUrl,
        remaining_requests: this.rateLimitState.remaining,
      });

      return {
        success: true,
        commentUrl,
      };
    } catch (error: any) {
      // Log error with context
      const errorCode = error.status || error.code;
      const isRateLimit = errorCode === 429;

      if (isRateLimit) {
        const backoffMs = this.calculateBackoffMs(retryCount);
        logger.logRetryAttempt({
          component: "GitHubClient",
          operation: "issues.createComment",
          attemptNumber: retryCount + 1,
          backoffMs,
          reason: "Rate limit (429) exceeded",
        });
        await this.sleep(backoffMs);
        return this.postComment(owner, repo, issueNumber, body, retryCount + 1);
      }

      // Log non-rate-limit errors
      logger.logGitHubAPIError({
        endpoint: "issues.createComment",
        error,
        responseCode: errorCode,
        retryCount,
      });

      // Record failure for circuit breaker
      this.recordFailure();

      // For other errors, queue the comment
      return this.queueComment(owner, repo, issueNumber, body);
    }
  }

  /**
   * Queue a comment for later processing
   */
  private queueComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): { success: boolean; queued: boolean } {
    const key = this.getQueueKey(owner, repo, issueNumber);

    const queueItem: CommentQueueItem = {
      owner,
      repo,
      issueNumber,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    this.commentQueue.set(key, queueItem);

    console.log(
      `[GitHub] Comment queued for ${owner}/${repo}#${issueNumber}. Queue size: ${this.commentQueue.size}`
    );

    return {
      success: false,
      queued: true,
    };
  }

  /**
   * Process queued comments (should be called periodically)
   */
  async processQueuedComments(): Promise<{
    processed: number;
    failed: number;
    remaining: number;
  }> {
    let processed = 0;
    let failed = 0;

    // Create array of entries to iterate over (avoid modifying map during iteration)
    const entries = Array.from(this.commentQueue.entries());

    for (const [key, item] of entries) {
      if (item.retries > 5) {
        // Skip items with too many retries
        this.commentQueue.delete(key);
        failed++;
        logger.warn("Gave up on queued comment after 5 retries", {
          component: "GitHubClient",
          queue_key: key,
          retry_count: item.retries,
        });
        continue;
      }

      // Check if enough time has passed since last attempt
      const timeSinceQueued = Date.now() - item.timestamp;
      if (timeSinceQueued < 10000) {
        // Wait at least 10 seconds before retrying
        continue;
      }

      const result = await this.postComment(
        item.owner,
        item.repo,
        item.issueNumber,
        item.body,
        item.retries
      );

      if (result.success) {
        this.commentQueue.delete(key);
        processed++;
        logger.info("Queued comment processed successfully", {
          component: "GitHubClient",
          queue_key: key,
          issue_id: item.issueNumber,
          repo: `${item.owner}/${item.repo}`,
          retry_count: item.retries,
        });
      } else {
        // Increment retry count
        item.retries++;
        logger.debug("Queued comment retry", {
          component: "GitHubClient",
          queue_key: key,
          retry_count: item.retries,
        });
      }
    }

    logger.info("Queue processing complete", {
      component: "GitHubClient",
      processed,
      failed,
      remaining: this.commentQueue.size,
    });

    return {
      processed,
      failed,
      remaining: this.commentQueue.size,
    };
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitState {
    return { ...this.rateLimitState };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): CircuitBreakerState {
    return {
      ...this.circuitBreaker,
      isOpen: this.isCircuitBreakerOpen(),
    };
  }

  /**
   * Get queued comments count
   */
  getQueuedCommentsCount(): number {
    return this.commentQueue.size;
  }

  /**
   * Utility: Sleep for N milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch issue details from GitHub
   */
  async getIssue(owner: string, repo: string, issueNumber: number) {
    try {
      logger.logGitHubAPICall({
        endpoint: "issues.get",
        method: "GET",
        params: {
          owner,
          repo,
          issue_number: issueNumber,
        },
        rateLimit: {
          remaining: this.rateLimitState.remaining,
          limit: this.rateLimitState.limit,
          resetAt: this.rateLimitState.resetAt,
        },
      });

      const response = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      this.updateRateLimitFromResponse(response);
      this.recordSuccess();

      logger.info("Issue fetched successfully", {
        component: "GitHubClient",
        issue_id: issueNumber,
        repo: `${owner}/${repo}`,
        remaining_requests: this.rateLimitState.remaining,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.logGitHubAPIError({
        endpoint: "issues.get",
        error,
        responseCode: error.status || error.code,
      });
      this.recordFailure();

      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
let clientInstance: GitHubClient | null = null;

export function getGitHubClient(authToken?: string): GitHubClient {
  if (!clientInstance) {
    clientInstance = new GitHubClient(authToken);
  }
  return clientInstance;
}

// Also export the class for testing
export { GitHubClient };
