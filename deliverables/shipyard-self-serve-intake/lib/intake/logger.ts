/**
 * Structured Logging Module for Intake System
 *
 * Provides comprehensive structured logging with:
 * - Log levels: DEBUG, INFO, WARN, ERROR
 * - Structured JSON output with full context
 * - Error tracking with stack traces
 * - Graceful degradation (never crashes on logging errors)
 *
 * Logs to stdout/console for centralized logging aggregation.
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogContext {
  component?: string;
  requestId?: string;
  timestamp?: string;
  issueId?: number;
  issueUrl?: string;
  action?: string;
  repo?: string;
  userId?: string;
  [key: string]: any;
}

export interface ErrorLogEntry {
  timestamp: string;
  component: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  context: LogContext;
  level: LogLevel;
}

class Logger {
  private minLogLevel: LogLevel;

  constructor(minLogLevel: LogLevel = LogLevel.DEBUG) {
    this.minLogLevel = minLogLevel;
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Determine if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levelPriority: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };

    return levelPriority[level] >= levelPriority[this.minLogLevel];
  }

  /**
   * Format log entry as structured JSON
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ): string {
    const timestamp = context.timestamp || this.getTimestamp();

    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    try {
      return JSON.stringify(logEntry);
    } catch (stringifyError) {
      // If JSON.stringify fails, fall back to string representation
      return `{"timestamp":"${timestamp}","level":"${level}","message":"${message}","error":"Failed to stringify log context"}`;
    }
  }

  /**
   * Output log to console with proper level routing
   */
  private output(level: LogLevel, formattedLog: string): void {
    try {
      // Route to appropriate console method
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(formattedLog);
          break;
        case LogLevel.WARN:
          console.warn(formattedLog);
          break;
        case LogLevel.ERROR:
          console.error(formattedLog);
          break;
      }
    } catch (outputError) {
      // Graceful degradation: if logging itself fails, try basic fallback
      try {
        console.log(`LOGGING_ERROR: Could not output log entry at ${level}`);
      } catch {
        // Silent fallback - never crash due to logging
      }
    }
  }

  /**
   * Log DEBUG level message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const logContext = {
      ...context,
      timestamp: context?.timestamp || this.getTimestamp(),
    };

    const formattedLog = this.formatLogEntry(LogLevel.DEBUG, message, logContext);
    this.output(LogLevel.DEBUG, formattedLog);
  }

  /**
   * Log INFO level message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const logContext = {
      ...context,
      timestamp: context?.timestamp || this.getTimestamp(),
    };

    const formattedLog = this.formatLogEntry(LogLevel.INFO, message, logContext);
    this.output(LogLevel.INFO, formattedLog);
  }

  /**
   * Log WARN level message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const logContext = {
      ...context,
      timestamp: context?.timestamp || this.getTimestamp(),
    };

    const formattedLog = this.formatLogEntry(LogLevel.WARN, message, logContext);
    this.output(LogLevel.WARN, formattedLog);
  }

  /**
   * Log ERROR level message with full context and stack trace
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): ErrorLogEntry {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return {
        timestamp: this.getTimestamp(),
        component: context?.component || "unknown",
        error_type: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
        context: context || {},
        level: LogLevel.ERROR,
      };
    }

    const timestamp = this.getTimestamp();
    const component = context?.component || "unknown";
    const errorType = error instanceof Error ? error.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const logContext = {
      ...context,
      timestamp,
      component,
      error_type: errorType,
      error_message: errorMessage,
      ...(stackTrace && { stack_trace: stackTrace }),
    };

    const formattedLog = this.formatLogEntry(LogLevel.ERROR, message, logContext);
    this.output(LogLevel.ERROR, formattedLog);

    // Return structured error log entry for database storage
    return {
      timestamp,
      component,
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      context: context || {},
      level: LogLevel.ERROR,
    };
  }

  /**
   * Log GitHub API call with endpoint, params, and response
   */
  logGitHubAPICall(context: {
    requestId?: string;
    endpoint: string;
    method: string;
    params?: Record<string, any>;
    responseCode?: number;
    rateLimit?: {
      remaining: number;
      limit: number;
      resetAt: number;
    };
    durationMs?: number;
  }): void {
    this.info("GitHub API call", {
      component: "GitHubAPI",
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      params: context.params,
      response_code: context.responseCode,
      rate_limit: context.rateLimit,
      duration_ms: context.durationMs,
    });
  }

  /**
   * Log GitHub API error with full context
   */
  logGitHubAPIError(context: {
    requestId?: string;
    endpoint: string;
    error: Error | unknown;
    responseCode?: number;
    retryCount?: number;
  }): ErrorLogEntry {
    return this.error("GitHub API error", context.error, {
      component: "GitHubAPI",
      requestId: context.requestId,
      endpoint: context.endpoint,
      response_code: context.responseCode,
      retry_count: context.retryCount,
    });
  }

  /**
   * Log webhook receipt with all relevant data
   */
  logWebhookReceipt(context: {
    requestId: string;
    githubEvent: string | null;
    githubDelivery: string | null;
    issueId?: number;
    issueUrl?: string;
    action?: string;
    repo?: string;
    signaturePresent: boolean;
    signatureValid?: boolean;
  }): void {
    this.info("Webhook received", {
      component: "WebhookHandler",
      requestId: context.requestId,
      github_event: context.githubEvent,
      github_delivery: context.githubDelivery,
      issue_id: context.issueId,
      issue_url: context.issueUrl,
      action: context.action,
      repo: context.repo,
      signature_present: context.signaturePresent,
      signature_valid: context.signatureValid,
    });
  }

  /**
   * Log retry attempt with backoff timing
   */
  logRetryAttempt(context: {
    requestId?: string;
    component: string;
    operation: string;
    attemptNumber: number;
    backoffMs: number;
    reason?: string;
  }): void {
    this.info("Retry attempt", {
      component: context.component,
      requestId: context.requestId,
      operation: context.operation,
      attempt_number: context.attemptNumber,
      backoff_ms: context.backoffMs,
      reason: context.reason,
    });
  }

  /**
   * Log processing step with progress
   */
  logProcessingStep(context: {
    requestId: string;
    component: string;
    step: string;
    status: "started" | "completed" | "failed";
    issueId?: number;
    details?: Record<string, any>;
  }): void {
    const level = context.status === "failed" ? LogLevel.WARN : LogLevel.INFO;
    const message = `Processing step: ${context.step} (${context.status})`;

    if (level === LogLevel.WARN && this.shouldLog(LogLevel.WARN)) {
      this.warn(message, {
        component: context.component,
        requestId: context.requestId,
        issue_id: context.issueId,
        step: context.step,
        status: context.status,
        ...context.details,
      });
    } else if (level === LogLevel.INFO && this.shouldLog(LogLevel.INFO)) {
      this.info(message, {
        component: context.component,
        requestId: context.requestId,
        issue_id: context.issueId,
        step: context.step,
        status: context.status,
        ...context.details,
      });
    }
  }

  /**
   * Set minimum log level
   */
  setMinLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }

  /**
   * Get current minimum log level
   */
  getMinLogLevel(): LogLevel {
    return this.minLogLevel;
  }
}

// Export singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(minLogLevel?: LogLevel): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(minLogLevel || LogLevel.DEBUG);
  }
  return loggerInstance;
}

// Also export the class for testing
export { Logger };
