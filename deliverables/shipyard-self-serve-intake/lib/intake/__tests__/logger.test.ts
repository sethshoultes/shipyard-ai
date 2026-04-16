/**
 * Test Suite for Structured Logging Module
 *
 * Validates:
 * - Logging with all required fields
 * - Error logging with stack traces
 * - Graceful degradation (never crashes on logging errors)
 * - Structured JSON output format
 */

import { Logger, LogLevel, getLogger } from "../logger";

// Mock console methods to capture output
let capturedLogs: any[] = [];

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  capturedLogs = [];

  console.log = jest.fn((message) => {
    if (typeof message === "string") {
      try {
        capturedLogs.push(JSON.parse(message));
      } catch {
        capturedLogs.push({ raw: message });
      }
    }
  });

  console.warn = jest.fn((message) => {
    if (typeof message === "string") {
      try {
        capturedLogs.push(JSON.parse(message));
      } catch {
        capturedLogs.push({ raw: message });
      }
    }
  });

  console.error = jest.fn((message) => {
    if (typeof message === "string") {
      try {
        capturedLogs.push(JSON.parse(message));
      } catch {
        capturedLogs.push({ raw: message });
      }
    }
  });
});

afterEach(() => {
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});

describe("Logger", () => {
  describe("Log Levels", () => {
    test("should log DEBUG level messages", () => {
      const logger = new Logger(LogLevel.DEBUG);
      logger.debug("Test debug message", { testId: "123" });

      expect(capturedLogs.length).toBeGreaterThan(0);
      const log = capturedLogs[0];
      expect(log.level).toBe("DEBUG");
      expect(log.message).toBe("Test debug message");
      expect(log.testId).toBe("123");
    });

    test("should log INFO level messages", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.info("Test info message", { component: "TestComponent" });

      expect(capturedLogs.length).toBeGreaterThan(0);
      const log = capturedLogs[0];
      expect(log.level).toBe("INFO");
      expect(log.message).toBe("Test info message");
      expect(log.component).toBe("TestComponent");
    });

    test("should log WARN level messages", () => {
      const logger = new Logger(LogLevel.WARN);
      logger.warn("Test warning message", { reason: "test" });

      expect(capturedLogs.length).toBeGreaterThan(0);
      const log = capturedLogs[0];
      expect(log.level).toBe("WARN");
      expect(log.message).toBe("Test warning message");
      expect(log.reason).toBe("test");
    });

    test("should log ERROR level messages", () => {
      const logger = new Logger(LogLevel.ERROR);
      const error = new Error("Test error");
      const result = logger.error("Test error message", error, {
        component: "TestComponent",
      });

      expect(capturedLogs.length).toBeGreaterThan(0);
      const log = capturedLogs[0];
      expect(log.level).toBe("ERROR");
      expect(log.message).toBe("Test error message");
      expect(log.component).toBe("TestComponent");
      expect(log.error_message).toBe("Test error");

      expect(result.error_type).toBe("Error");
      expect(result.error_message).toBe("Test error");
      expect(result.stack_trace).toBeDefined();
    });
  });

  describe("Structured Logging", () => {
    test("should include timestamp in all logs", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.info("Test message");

      const log = capturedLogs[0];
      expect(log.timestamp).toBeDefined();
      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test("should include all context fields in logs", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.info("Test message", {
        component: "WebhookHandler",
        requestId: "req-123",
        issue_id: 456,
        repo: "test/repo",
      });

      const log = capturedLogs[0];
      expect(log.component).toBe("WebhookHandler");
      expect(log.requestId).toBe("req-123");
      expect(log.issue_id).toBe(456);
      expect(log.repo).toBe("test/repo");
    });

    test("should format logs as valid JSON", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.info("Test message", { key: "value" });

      expect(capturedLogs.length).toBeGreaterThan(0);
      const log = capturedLogs[0];
      expect(typeof log).toBe("object");
      expect(log.timestamp).toBeDefined();
      expect(log.level).toBeDefined();
      expect(log.message).toBeDefined();
    });
  });

  describe("Error Logging", () => {
    test("should include error type and message", () => {
      const logger = new Logger(LogLevel.ERROR);
      const error = new TypeError("Test type error");
      const result = logger.error("Error occurred", error, { component: "Test" });

      expect(result.error_type).toBe("TypeError");
      expect(result.error_message).toBe("Test type error");
      expect(result.component).toBe("Test");
    });

    test("should include stack trace in error logs", () => {
      const logger = new Logger(LogLevel.ERROR);
      const error = new Error("Stack trace test");
      const result = logger.error("Error with stack", error);

      expect(result.stack_trace).toBeDefined();
      expect(result.stack_trace).toContain("Stack trace test");
    });

    test("should handle non-Error objects gracefully", () => {
      const logger = new Logger(LogLevel.ERROR);
      const result = logger.error("Error with string", "Just a string", {
        component: "Test",
      });

      expect(result.error_type).toBe("UnknownError");
      expect(result.error_message).toBe("Just a string");
    });

    test("should return ErrorLogEntry from error method", () => {
      const logger = new Logger(LogLevel.ERROR);
      const error = new Error("Test");
      const result = logger.error("Test error", error, {
        component: "WebhookHandler",
        requestId: "req-123",
      });

      expect(result.timestamp).toBeDefined();
      expect(result.component).toBe("WebhookHandler");
      expect(result.error_type).toBe("Error");
      expect(result.error_message).toBe("Test");
      expect(result.level).toBe(LogLevel.ERROR);
      expect(result.context.requestId).toBe("req-123");
    });
  });

  describe("Graceful Degradation", () => {
    test("should not throw on logging errors", () => {
      const logger = new Logger(LogLevel.INFO);

      expect(() => {
        logger.info("Test message", { testValue: undefined });
        logger.warn("Test warning", { value: null });
        logger.error("Test error", new Error("Test"));
      }).not.toThrow();
    });

    test("should handle circular references gracefully", () => {
      const logger = new Logger(LogLevel.INFO);
      const obj: any = { a: 1 };
      obj.self = obj; // Create circular reference

      expect(() => {
        logger.info("Message with circular ref", obj);
      }).not.toThrow();
    });
  });

  describe("Log Level Filtering", () => {
    test("should respect minimum log level", () => {
      const logger = new Logger(LogLevel.WARN);
      capturedLogs = [];

      logger.debug("Debug message");
      logger.info("Info message");
      expect(capturedLogs.length).toBe(0);

      logger.warn("Warn message");
      logger.error("Error message");
      expect(capturedLogs.length).toBe(2);
    });

    test("should allow changing minimum log level", () => {
      const logger = new Logger(LogLevel.ERROR);
      capturedLogs = [];

      logger.info("Info message");
      expect(capturedLogs.length).toBe(0);

      logger.setMinLogLevel(LogLevel.INFO);
      logger.info("Info message");
      expect(capturedLogs.length).toBe(1);
    });
  });

  describe("Special Methods", () => {
    test("should log GitHub API calls with endpoint and params", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.logGitHubAPICall({
        requestId: "req-123",
        endpoint: "issues.createComment",
        method: "POST",
        params: { owner: "test", repo: "repo", issue_number: 1 },
        responseCode: 201,
        rateLimit: { remaining: 4999, limit: 5000, resetAt: Date.now() + 3600000 },
        durationMs: 150,
      });

      const log = capturedLogs[0];
      expect(log.component).toBe("GitHubAPI");
      expect(log.endpoint).toBe("issues.createComment");
      expect(log.method).toBe("POST");
      expect(log.response_code).toBe(201);
      expect(log.duration_ms).toBe(150);
    });

    test("should log webhook receipts with all fields", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.logWebhookReceipt({
        requestId: "req-123",
        githubEvent: "issues",
        githubDelivery: "delivery-123",
        issueId: 456,
        issueUrl: "https://github.com/test/repo/issues/456",
        action: "opened",
        repo: "test/repo",
        signaturePresent: true,
        signatureValid: true,
      });

      const log = capturedLogs[0];
      expect(log.component).toBe("WebhookHandler");
      expect(log.requestId).toBe("req-123");
      expect(log.github_event).toBe("issues");
      expect(log.issue_id).toBe(456);
      expect(log.signature_valid).toBe(true);
    });

    test("should log retry attempts with backoff timing", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.logRetryAttempt({
        component: "GitHubClient",
        operation: "postComment",
        attemptNumber: 2,
        backoffMs: 2000,
        reason: "Rate limit exceeded",
      });

      const log = capturedLogs[0];
      expect(log.component).toBe("GitHubClient");
      expect(log.operation).toBe("postComment");
      expect(log.attempt_number).toBe(2);
      expect(log.backoff_ms).toBe(2000);
      expect(log.reason).toBe("Rate limit exceeded");
    });

    test("should log processing steps with status", () => {
      const logger = new Logger(LogLevel.INFO);
      logger.logProcessingStep({
        requestId: "req-123",
        component: "WebhookHandler",
        step: "parse_payload",
        status: "completed",
        issueId: 456,
        details: { itemsProcessed: 10 },
      });

      const log = capturedLogs[0];
      expect(log.component).toBe("WebhookHandler");
      expect(log.requestId).toBe("req-123");
      expect(log.step).toBe("parse_payload");
      expect(log.status).toBe("completed");
      expect(log.itemsProcessed).toBe(10);
    });
  });

  describe("Singleton Pattern", () => {
    test("should return same instance from getLogger", () => {
      const logger1 = getLogger();
      const logger2 = getLogger();

      expect(logger1).toBe(logger2);
    });
  });
});
