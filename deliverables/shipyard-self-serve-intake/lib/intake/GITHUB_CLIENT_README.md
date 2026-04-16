# GitHub API Client - Rate Limiting & Authentication

## Overview

The GitHub API Client (`github.ts`) implements a robust, production-ready interface to the GitHub API with comprehensive rate limiting, error handling, and resilience patterns.

## Features Implemented

### 1. Octokit Integration with GitHub PAT Authentication
- Initializes Octokit with GitHub Personal Access Token (PAT)
- Token sourced from `process.env.GITHUB_PAT` environment variable
- Singleton pattern for client instance management

```typescript
const client = getGitHubClient();
// Or with custom token
const client = getGitHubClient(customToken);
```

### 2. Rate Limit Monitoring (REQ-INFRA-003)
- Monitors `X-RateLimit-Remaining` header on every API response
- Tracks remaining requests, total limit, and reset time
- Automatically warns when approaching limit (< 100 remaining)
- Provides rate limit status via `getRateLimitStatus()` getter

**Why This Matters:** GitHub enforces 5,000 requests/hour for authenticated requests. At scale, multiple comments + issue fetches could exceed this limit silently.

### 3. Exponential Backoff (RISK-001 Mitigation)
- Implements 2^n backoff strategy for 429 (Rate Limited) responses
- Base delay: 1 second, maximum: 60 seconds
- Adds random jitter (±1 second) to prevent thundering herd
- Automatic retry with incrementing attempt counter

```
Attempt 1: wait ~1s
Attempt 2: wait ~2s
Attempt 3: wait ~4s
Attempt 4: wait ~8s
... up to 60s
```

### 4. Comment Queue (RISK-007 Mitigation)
- Queues comments when rate limit approaches (< 100 remaining)
- Prevents bot account suspension due to sudden request spikes
- Queue items tracked with:
  - Original request data (owner, repo, issue#)
  - Timestamp for ordering
  - Retry counter to prevent infinite loops
- Maximum 5 retries per queued item
- Call `processQueuedComments()` periodically (recommended: every 30 seconds)

```typescript
// In a background job or middleware
const result = await client.processQueuedComments();
console.log(`Processed: ${result.processed}, Failed: ${result.failed}, Remaining: ${result.remaining}`);
```

### 5. Human-Like Delays (RISK-007 Mitigation)
- Adds random 1-3 second delays between bot comments
- Prevents GitHub spam detection algorithms from flagging bot
- Delay added before every `postComment()` call

### 6. Circuit Breaker (RISK-007 Mitigation)
- Tracks consecutive API failures
- Opens circuit (pauses all requests) after 5 consecutive failures
- Pause duration: 5 minutes
- Auto-resets on successful request
- Prevents cascading failures and bot suspension

```typescript
const status = client.getCircuitBreakerStatus();
if (status.isOpen) {
  console.log(`Circuit breaker open until ${new Date(status.pausedUntil)}`);
}
```

### 7. Comprehensive Error Logging
- All API errors logged with context:
  - `issue_id`: GitHub issue number
  - `endpoint`: GitHub API endpoint called
  - `error_code`: HTTP status code
  - `error_message`: Detailed error message
  - `retryCount`: Current attempt number

Example log:
```
[GitHub] Failed to post comment {
  issue_id: 123,
  repo: "owner/repo",
  endpoint: "issues.createComment",
  error_code: 403,
  error_message: "API rate limit exceeded",
  retryCount: 0
}
```

## Usage Examples

### Basic Comment Posting

```typescript
import { getGitHubClient } from "@/lib/intake/github";

const client = getGitHubClient();

const result = await client.postComment(
  "owner",
  "repo",
  123, // issue number
  "This is a bot comment with detected priority: **p0**"
);

if (result.success) {
  console.log(`Comment posted: ${result.commentUrl}`);
} else if (result.queued) {
  console.log("Rate limit approached. Comment queued for later.");
} else {
  console.error(`Failed: ${result.error}`);
}
```

### Fetching Issue Details

```typescript
const issueResult = await client.getIssue("owner", "repo", 123);

if (issueResult.success) {
  console.log(`Issue title: ${issueResult.data.title}`);
  console.log(`Issue body: ${issueResult.data.body}`);
} else {
  console.error(`Failed to fetch issue: ${issueResult.error}`);
}
```

### Monitoring Rate Limits

```typescript
const status = client.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}/${status.limit}`);
console.log(`Resets at: ${new Date(status.resetAt).toISOString()}`);

// Check circuit breaker
const cbStatus = client.getCircuitBreakerStatus();
if (cbStatus.isOpen) {
  console.warn("Circuit breaker is open - requests paused");
}

// Check queue
const queueSize = client.getQueuedCommentsCount();
console.log(`Queued comments: ${queueSize}`);
```

### Processing Queued Comments

```typescript
// Recommended: Run in background job every 30 seconds
setInterval(async () => {
  const result = await client.processQueuedComments();
  if (result.processed > 0) {
    console.log(`Processed ${result.processed} queued comments`);
  }
}, 30 * 1000);
```

## Environment Variables

```bash
# Required
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional (from webhook setup)
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Risk Mitigation Map

| Risk | ID | Mitigation | Implementation |
|------|----|-----------|----|
| Bot Account Suspension | RISK-007 | Rate limit monitoring, queue, human delays | Lines 75-92, 129-160, 104-107 |
| GitHub API Rate Limits | RISK-001 | Exponential backoff, queue, circuit breaker | Lines 97-101, 129-160, 113-130 |
| Cascading Failures | RISK-007 | Circuit breaker with 5-minute pause | Lines 113-130 |
| Request Storms | RISK-001 | Comment queue with processing loop | Lines 129-160 |

## Integration with Webhook Handler

The webhook handler (`/app/api/intake/webhook/github/route.ts`) should use the GitHub client to post acknowledgment comments:

```typescript
import { getGitHubClient } from "@/lib/intake/github";

// In webhook processing:
const client = getGitHubClient();
const result = await client.postComment(
  repo.owner,
  repo.name,
  issue.number,
  "PRD generated and linked above ↑"
);

if (!result.success && !result.queued) {
  console.error("Failed to post comment", result.error);
}
```

## Performance Considerations

1. **Rate Limit Exhaustion Timeline**
   - At 5 requests/second: exhausts 5,000 limit in ~16 minutes
   - With queue: spreads requests over multiple hours
   - Circuit breaker prevents suspension after failures

2. **Queue Processing**
   - Recommended interval: 30 seconds
   - Each interval checks all queued items
   - Respects human-like delays between attempts
   - Max 5 retries = max ~25 seconds per item

3. **Memory Usage**
   - Queue stored in memory (Map<string, CommentQueueItem>)
   - Each item ~200 bytes
   - 1,000 queued items = ~200KB
   - Consider persistent queue for production at scale

## Testing

Run unit tests:
```bash
npm test lib/intake/__tests__/github.test.ts
```

Manual testing:
```typescript
// In Node REPL or test file
const { GitHubClient } = require("./github.ts");
const client = new GitHubClient("ghp_test_token");

// Verify initialization
console.log(client.getRateLimitStatus());
console.log(client.getCircuitBreakerStatus());
console.log(client.getQueuedCommentsCount()); // Should be 0
```

## Future Enhancements (v2+)

1. **Persistent Queue**: Store queued comments in Postgres for recovery
2. **Adaptive Rate Limiting**: Adjust strategy based on API response patterns
3. **Metrics Export**: Prometheus metrics for rate limit tracking
4. **Multi-Account Support**: Handle multiple bot accounts
5. **Webhook Delivery Queue**: Track and retry failed webhook deliveries
6. **Cost Analysis**: Calculate and log API quota usage

## References

- [GitHub REST API Rate Limiting](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/v20)
- REQ-INFRA-003: GitHub API Authentication & Rate Limiting
- RISK-001: GitHub API Rate Limits
- RISK-007: Bot Account Suspension
