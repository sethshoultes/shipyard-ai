/**
 * Database Utilities for Intake System
 *
 * Handles logging errors to the intake_requests.error_log JSONB column
 * for permanent, queryable error tracking and observability.
 */

import { Pool, PoolClient } from "pg";
import { getLogger, ErrorLogEntry } from "./logger";

const logger = getLogger();

// Database connection pool
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString,
      max: parseInt(process.env.DATABASE_POOL_SIZE || "10", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      logger.error("Unexpected database pool error", err, {
        component: "DatabasePool",
      });
    });
  }

  return pool;
}

/**
 * Store error in the database error_log
 * This enables persistent error tracking and root cause analysis
 */
export async function logErrorToDatabase(context: {
  issueId?: number;
  issueUrl?: string;
  repoName?: string;
  errorLogEntry: ErrorLogEntry;
}): Promise<boolean> {
  try {
    const { issueId, issueUrl, repoName, errorLogEntry } = context;

    if (!issueId || !repoName) {
      logger.warn("Cannot log error to database: missing issueId or repoName", {
        component: "DatabaseLogger",
        issue_id: issueId,
        repo_name: repoName,
      });
      return false;
    }

    const db = getPool();

    const query = `
      UPDATE intake_requests
      SET error_log = COALESCE(error_log, '[]'::jsonb) || $1::jsonb,
          updated_at = NOW()
      WHERE github_issue_id = $2 AND repo_name = $3
    `;

    await db.query(query, [
      JSON.stringify([errorLogEntry]),
      issueId,
      repoName,
    ]);

    logger.debug("Error logged to database", {
      component: "DatabaseLogger",
      issue_id: issueId,
      issue_url: issueUrl,
      repo_name: repoName,
      error_type: errorLogEntry.error_type,
      error_message: errorLogEntry.error_message,
    });

    return true;
  } catch (error) {
    // Graceful degradation: log to console if database logging fails
    logger.error("Failed to log error to database", error, {
      component: "DatabaseLogger",
      issue_id: context.issueId,
      issue_url: context.issueUrl,
      repo_name: context.repoName,
    });

    return false;
  }
}

/**
 * Create a new intake_request record in the database
 */
export async function createIntakeRequest(data: {
  githubIssueId: number;
  githubIssueUrl: string;
  repoName: string;
  title: string;
  description?: string;
  rawContent: string;
  requestedBy: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = getPool();

    const query = `
      INSERT INTO intake_requests (
        github_issue_id,
        github_issue_url,
        repo_name,
        title,
        description,
        raw_content,
        requested_by,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
      ON CONFLICT (github_issue_id, repo_name)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        raw_content = EXCLUDED.raw_content,
        updated_at = NOW()
      RETURNING id
    `;

    const result = await db.query(query, [
      data.githubIssueId,
      data.githubIssueUrl,
      data.repoName,
      data.title,
      data.description || null,
      data.rawContent,
      data.requestedBy,
    ]);

    const id = result.rows[0]?.id;

    logger.info("Intake request created", {
      component: "DatabaseLogger",
      issue_id: data.githubIssueId,
      repo_name: data.repoName,
      title: data.title,
      requested_by: data.requestedBy,
      db_id: id,
    });

    return {
      success: true,
      id: id,
    };
  } catch (error) {
    logger.error("Failed to create intake request", error, {
      component: "DatabaseLogger",
      issue_id: data.githubIssueId,
      repo_name: data.repoName,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Update intake request with processing results
 */
export async function updateIntakeRequest(context: {
  githubIssueId: number;
  repoName: string;
  updates: {
    priority?: string;
    detectedType?: string;
    confidenceScore?: number;
    prdContent?: Record<string, any>;
    prdUrl?: string;
    botCommentUrl?: string;
    status?: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getPool();

    const query = `
      UPDATE intake_requests
      SET
        priority = COALESCE($1, priority),
        detected_type = COALESCE($2, detected_type),
        confidence_score = COALESCE($3, confidence_score),
        prd_content = COALESCE($4, prd_content),
        prd_url = COALESCE($5, prd_url),
        bot_comment_url = COALESCE($6, bot_comment_url),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE github_issue_id = $8 AND repo_name = $9
    `;

    await db.query(query, [
      context.updates.priority || null,
      context.updates.detectedType || null,
      context.updates.confidenceScore || null,
      context.updates.prdContent ? JSON.stringify(context.updates.prdContent) : null,
      context.updates.prdUrl || null,
      context.updates.botCommentUrl || null,
      context.updates.status || null,
      context.githubIssueId,
      context.repoName,
    ]);

    logger.info("Intake request updated", {
      component: "DatabaseLogger",
      issue_id: context.githubIssueId,
      repo_name: context.repoName,
      updates: Object.keys(context.updates),
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to update intake request", error, {
      component: "DatabaseLogger",
      issue_id: context.githubIssueId,
      repo_name: context.repoName,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Retrieve error log for an intake request
 */
export async function getErrorLog(context: {
  githubIssueId: number;
  repoName: string;
}): Promise<{ success: boolean; errorLog?: ErrorLogEntry[]; error?: string }> {
  try {
    const db = getPool();

    const query = `
      SELECT error_log
      FROM intake_requests
      WHERE github_issue_id = $1 AND repo_name = $2
    `;

    const result = await db.query(query, [
      context.githubIssueId,
      context.repoName,
    ]);

    const errorLog = result.rows[0]?.error_log || [];

    logger.debug("Error log retrieved", {
      component: "DatabaseLogger",
      issue_id: context.githubIssueId,
      repo_name: context.repoName,
      error_count: errorLog.length,
    });

    return {
      success: true,
      errorLog: errorLog,
    };
  } catch (error) {
    logger.error("Failed to retrieve error log", error, {
      component: "DatabaseLogger",
      issue_id: context.githubIssueId,
      repo_name: context.repoName,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get intake request by GitHub issue ID
 */
export async function getIntakeRequest(context: {
  githubIssueId: number;
  repoName: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const db = getPool();

    const query = `
      SELECT *
      FROM intake_requests
      WHERE github_issue_id = $1 AND repo_name = $2
    `;

    const result = await db.query(query, [
      context.githubIssueId,
      context.repoName,
    ]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "Intake request not found",
      };
    }

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    logger.error("Failed to retrieve intake request", error, {
      component: "DatabaseLogger",
      issue_id: context.githubIssueId,
      repo_name: context.repoName,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List all intake requests with optional filtering
 */
export async function listIntakeRequests(filters?: {
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: any[]; total?: number; error?: string }> {
  try {
    const db = getPool();

    let query = `SELECT * FROM intake_requests WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(filters.priority);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM intake_requests WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (filters?.status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(filters.status);
      countParamIndex++;
    }

    if (filters?.priority) {
      countQuery += ` AND priority = $${countParamIndex}`;
      countParams.push(filters.priority);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.count || "0", 10);

    return {
      success: true,
      data: result.rows,
      total,
    };
  } catch (error) {
    logger.error("Failed to list intake requests", error, {
      component: "DatabaseLogger",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Close the database connection pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info("Database connection pool closed", {
      component: "DatabasePool",
    });
  }
}
