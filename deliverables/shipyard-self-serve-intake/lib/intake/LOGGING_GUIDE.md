# Structured Logging & Observability Guide

## Overview

The intake system implements comprehensive structured logging to enable debugging, monitoring, and root cause analysis. All logs are output as structured JSON with full context, enabling aggregation and analysis by observability tools (Datadog, New Relic, CloudWatch, etc.).

## Log Levels

The logger supports four log levels:

- **DEBUG**: Detailed diagnostic information (e.g., parsed webhooks, method entry/exit)
- **INFO**: General informational messages (e.g., successful operations, lifecycle events)
- **WARN**: Warning messages for potentially problematic conditions (e.g., rate limit approaching)
- **ERROR**: Error messages for failures (e.g., API errors, database failures)

## Architecture

### Core Logger Module (`lib/intake/logger.ts`)

The logger is a singleton providing:

1. **Structured JSON Output**: All logs are valid JSON with timestamp, level, message, and context
2. **Log Levels**: DEBUG, INFO, WARN, ERROR with filtering
3. **Graceful Degradation**: Logging errors never crash the application
4. **Specialized Methods**: Custom methods for GitHub API, webhooks, retries, and processing steps

### Key Features

- **Timestamp Tracking**: ISO 8601 format for all logs
- **Request ID Correlation**: Trace requests through the entire system
- **Stack Traces**: Full stack traces for all errors
- **Context Preservation**: Custom fields for domain-specific information
- **Error Log Entries**: Structured error data for database storage

## Usage Examples

### Basic Logging

```typescript
import { getLogger } from "@/lib/intake/logger";

const logger = getLogger();

// Info log
logger.info("Processing started", {
  component: "Analyzer",
  requestId: "req-123",
  issueId: 456,
});

// Warning log
logger.warn("Rate limit approaching", {
  component: "GitHubClient",
  remaining: 95,
  threshold: 100,
});

// Error log with context
logger.error("Failed to save request", error, {
  component: "Database",
  issueId: 456,
  repo: "test/repo",
});
```

### Log Output Example

```json
{
  "timestamp": "2026-04-16T10:30:45.123Z",
  "level": "INFO",
  "message": "Processing started",
  "component": "Analyzer",
  "requestId": "req-123",
  "issueId": 456
}
```

## Specialized Logging Methods

### Webhook Receipt Logging

Log all incoming webhook events with validation status:

```typescript
logger.logWebhookReceipt({
  requestId: "req-123",
  githubEvent: "issues",
  githubDelivery: "delivery-id",
  issueId: 456,
  issueUrl: "https://github.com/...",
  action: "opened",
  repo: "test/repo",
  signaturePresent: true,
  signatureValid: true,
});
```

**Output Fields**:
- `timestamp`: When webhook was received
- `component`: "WebhookHandler"
- `requestId`: Unique request ID for tracing
- `github_event`: Type of GitHub event (issues, pull_request, etc.)
- `github_delivery`: GitHub delivery ID
- `issue_id`: GitHub issue number
- `issue_url`: Full URL to the issue
- `action`: GitHub action (opened, closed, edited)
- `repo`: Repository name
- `signature_present`: Whether signature header was provided
- `signature_valid`: Whether signature validation passed

### Error Logging

Log errors with full context and stack trace:

```typescript
const errorLogEntry = logger.error(
  "Failed to post comment",
  error,
  {
    component: "GitHubClient",
    requestId: "req-123",
    endpoint: "issues.createComment",
    issueId: 456,
    repo: "test/repo",
  }
);

// ErrorLogEntry contains:
// - timestamp: ISO 8601 timestamp
// - component: Component that logged the error
// - error_type: Error constructor name
// - error_message: Error message
// - stack_trace: Full stack trace
// - context: All provided context fields
// - level: LogLevel.ERROR
```

### GitHub API Call Logging

Log all GitHub API calls with endpoint, parameters, and rate limit info:

```typescript
logger.logGitHubAPICall({
  requestId: "req-123",
  endpoint: "issues.createComment",
  method: "POST",
  params: {
    owner: "test",
    repo: "repo",
    issue_number: 456,
  },
  responseCode: 201,
  rateLimit: {
    remaining: 4999,
    limit: 5000,
    resetAt: resetTimestamp,
  },
  durationMs: 150,
});
```

### Retry Attempt Logging

Log retry attempts with exponential backoff timing:

```typescript
logger.logRetryAttempt({
  requestId: "req-123",
  component: "GitHubClient",
  operation: "issues.createComment",
  attemptNumber: 2,
  backoffMs: 2000,
  reason: "Rate limit (429) exceeded",
});
```

### Processing Step Logging

Log major processing steps with status and details:

```typescript
logger.logProcessingStep({
  requestId: "req-123",
  component: "WebhookHandler",
  step: "parse_payload",
  status: "completed", // or "started", "failed"
  issueId: 456,
  details: {
    itemsProcessed: 10,
    duration: 150,
  },
});
```

## Database Error Storage

Errors are stored in the `intake_requests.error_log` JSONB column for persistent tracking:

```typescript
import { logErrorToDatabase } from "@/lib/intake/db";

// After logging an error
const errorLogEntry = logger.error("API call failed", error, {
  component: "GitHubAPI",
  issueId: 456,
});

// Store in database for long-term tracking
await logErrorToDatabase({
  issueId: 456,
  repoName: "test/repo",
  errorLogEntry,
});
```

The `error_log` column stores an array of error entries:

```json
[
  {
    "timestamp": "2026-04-16T10:30:45.123Z",
    "component": "GitHubAPI",
    "error_type": "GitHubError",
    "error_message": "API rate limited",
    "stack_trace": "...",
    "context": {
      "issueId": 456,
      "endpoint": "issues.createComment"
    },
    "level": "ERROR"
  }
]
```

## Log Filtering & Configuration

### Setting Minimum Log Level

```typescript
import { getLogger, LogLevel } from "@/lib/intake/logger";

const logger = getLogger();

// Only log WARN and ERROR levels
logger.setMinLogLevel(LogLevel.WARN);

// Check current level
const currentLevel = logger.getMinLogLevel();
```

## Best Practices

### 1. Always Include Context

Always provide relevant context with every log:

```typescript
// Good
logger.info("Processing issue", {
  component: "Analyzer",
  issueId: 456,
  repo: "test/repo",
  requestId: "req-123",
});

// Avoid
logger.info("Processing issue");
```

### 2. Use Consistent Component Names

Use the same component name throughout a file:

```typescript
const COMPONENT = "WebhookHandler";

logger.info("Webhook received", { component: COMPONENT });
logger.error("Webhook failed", error, { component: COMPONENT });
```

### 3. Never Log Sensitive Data

Avoid logging secrets, tokens, or user credentials:

```typescript
// Good
logger.info("Request validated", { requestId: "req-123" });

// Avoid
logger.info("Request validated", { apiKey: "sk-xxx" });
```

### 4. Use Appropriate Log Levels

```typescript
// DEBUG: Entry/exit of functions, variable values
logger.debug("Parsing issue content", { issueId: 456 });

// INFO: Significant lifecycle events
logger.info("Issue processed successfully", { issueId: 456 });

// WARN: Potentially problematic conditions
logger.warn("Rate limit approaching", { remaining: 95 });

// ERROR: Failures and exceptions
logger.error("Failed to save request", error, { issueId: 456 });
```

### 5. Log Errors Immediately After Catch

```typescript
try {
  await someOperation();
} catch (error) {
  // Log immediately with full context
  logger.error("Operation failed", error, {
    component: "MyComponent",
    requestId: "req-123",
  });

  // Then decide on recovery/retry
}
```

## Observability Integration

### Structured Log Output

All logs output to stdout as JSON, compatible with:

- **Datadog**: Parse JSON logs and extract fields for monitoring
- **CloudWatch**: Ingest JSON logs with automatic field parsing
- **ELK Stack**: Index JSON logs for searching and analysis
- **Grafana Loki**: Query logs by label (component, level, etc.)

### Recommended Queries

**Find all errors for an issue**:
```
level: ERROR AND issueId: 456
```

**Find GitHub API rate limit events**:
```
component: GitHubAPI AND remaining < 100
```

**Find webhook processing failures**:
```
component: WebhookHandler AND status: failed
```

**Timeline of events for a request**:
```
requestId: "req-123"
```

## Error Recovery Patterns

### Graceful Degradation

The logging system never crashes the application:

```typescript
try {
  // Even if logging fails, app continues
  logger.error("Critical error", error, context);
} catch (loggingError) {
  // Logging errors are caught and silent (graceful degradation)
}
```

### Error Retry Tracking

Log every retry attempt to understand failure patterns:

```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    return await operation();
  } catch (error) {
    if (attempt < maxRetries) {
      const backoffMs = calculateBackoff(attempt);
      logger.logRetryAttempt({
        component: "MyComponent",
        operation: "criticalOp",
        attemptNumber: attempt,
        backoffMs,
        reason: error.message,
      });
      await sleep(backoffMs);
    } else {
      logger.error("Operation failed after retries", error, {
        component: "MyComponent",
        maxAttempts: maxRetries,
      });
      throw error;
    }
  }
}
```

## Verification Checklist

- [x] All logs output as valid JSON
- [x] All logs include timestamp in ISO 8601 format
- [x] All logs include level (DEBUG/INFO/WARN/ERROR)
- [x] All logs include message
- [x] Errors include error_type and error_message
- [x] Errors include stack_trace
- [x] All logs include component name
- [x] Request tracing via requestId
- [x] Graceful degradation (logging never crashes)
- [x] Database storage of errors in error_log JSONB
