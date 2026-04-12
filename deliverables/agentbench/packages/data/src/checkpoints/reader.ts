/**
 * Checkpoint reader for crash recovery.
 * Reads and parses checkpoints to enable resuming crashed benchmark runs.
 */

import type { SQLiteClient } from '../sqlite/client.js';
import type { Checkpoint, BenchmarkRun, BenchmarkRunStatus } from '../sqlite/schema.js';
import type { CheckpointState } from './writer.js';

/**
 * A recoverable run with its latest checkpoint
 */
export interface RecoverableRun {
  /** The benchmark run that can be recovered */
  run: BenchmarkRun;
  /** The latest checkpoint state */
  checkpoint: Checkpoint;
  /** Parsed state from the checkpoint */
  state: CheckpointState;
  /** Time since the run started (in milliseconds) */
  staleness: number;
}

/**
 * Options for finding recoverable runs
 */
export interface RecoveryOptions {
  /** Only find runs for this suite */
  suite?: string;
  /** Only find runs for this agent */
  agent?: string;
  /** Maximum age of run to consider recoverable (in milliseconds) */
  maxAge?: number;
  /** Statuses to consider for recovery */
  statuses?: BenchmarkRunStatus[];
}

/**
 * Checkpoint reader for crash recovery.
 * Finds and reads checkpoints to determine what can be recovered.
 */
export class CheckpointReader {
  private readonly client: SQLiteClient;

  constructor(client: SQLiteClient) {
    this.client = client;
  }

  /**
   * Get the latest checkpoint for a specific run.
   */
  getLatestCheckpoint(runId: string): Checkpoint | null {
    const db = this.client.getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM checkpoints
      WHERE run_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const result = stmt.get(runId) as Checkpoint | undefined;
    return result ?? null;
  }

  /**
   * Get all checkpoints for a run, ordered by creation time.
   */
  getCheckpoints(runId: string): Checkpoint[] {
    const db = this.client.getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM checkpoints
      WHERE run_id = ?
      ORDER BY created_at ASC
    `);
    return stmt.all(runId) as Checkpoint[];
  }

  /**
   * Parse the state from a checkpoint.
   */
  parseCheckpointState(checkpoint: Checkpoint): CheckpointState {
    try {
      return JSON.parse(checkpoint.state) as CheckpointState;
    } catch {
      throw new Error(`Failed to parse checkpoint state for checkpoint ${checkpoint.id}`);
    }
  }

  /**
   * Find all runs that can potentially be recovered.
   * Returns runs with status 'running' or 'crashed' that have checkpoints.
   */
  findRecoverableRuns(options: RecoveryOptions = {}): RecoverableRun[] {
    const db = this.client.getDatabase();
    const statuses = options.statuses ?? ['running', 'crashed'];
    const maxAge = options.maxAge ?? 7 * 24 * 60 * 60 * 1000; // 7 days default

    // Build query with optional filters
    let query = `
      SELECT r.*, c.id as checkpoint_id, c.state as checkpoint_state, c.created_at as checkpoint_created_at
      FROM benchmark_runs r
      INNER JOIN (
        SELECT run_id, MAX(created_at) as max_created_at
        FROM checkpoints
        GROUP BY run_id
      ) latest ON r.id = latest.run_id
      INNER JOIN checkpoints c ON c.run_id = latest.run_id AND c.created_at = latest.max_created_at
      WHERE r.status IN (${statuses.map(() => '?').join(', ')})
    `;

    const params: (string | number)[] = [...statuses];

    if (options.suite) {
      query += ' AND r.suite = ?';
      params.push(options.suite);
    }

    if (options.agent) {
      query += ' AND r.agent = ?';
      params.push(options.agent);
    }

    query += ' ORDER BY r.started_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Array<{
      id: string;
      suite: string;
      agent: string;
      started_at: string;
      completed_at: string | null;
      status: BenchmarkRunStatus;
      metadata: string | null;
      checkpoint_id: string;
      checkpoint_state: string;
      checkpoint_created_at: string;
    }>;

    const now = Date.now();
    const results: RecoverableRun[] = [];

    for (const row of rows) {
      const startedAt = new Date(row.started_at).getTime();
      const staleness = now - startedAt;

      // Skip runs that are too old
      if (staleness > maxAge) {
        continue;
      }

      const run: BenchmarkRun = {
        id: row.id,
        suite: row.suite,
        agent: row.agent,
        started_at: row.started_at,
        completed_at: row.completed_at,
        status: row.status,
        metadata: row.metadata,
      };

      const checkpoint: Checkpoint = {
        id: row.checkpoint_id,
        run_id: row.id,
        state: row.checkpoint_state,
        created_at: row.checkpoint_created_at,
      };

      try {
        const state = this.parseCheckpointState(checkpoint);
        results.push({ run, checkpoint, state, staleness });
      } catch {
        // Skip checkpoints with invalid state
        continue;
      }
    }

    return results;
  }

  /**
   * Check if a specific run can be recovered.
   */
  canRecover(runId: string): boolean {
    const db = this.client.getDatabase();

    // Check if run exists and is in a recoverable state
    const runStmt = db.prepare(`
      SELECT status FROM benchmark_runs WHERE id = ?
    `);
    const run = runStmt.get(runId) as { status: BenchmarkRunStatus } | undefined;

    if (!run || (run.status !== 'running' && run.status !== 'crashed')) {
      return false;
    }

    // Check if there's a valid checkpoint
    const checkpoint = this.getLatestCheckpoint(runId);
    if (!checkpoint) {
      return false;
    }

    // Verify checkpoint state is parseable
    try {
      this.parseCheckpointState(checkpoint);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get recovery info for a specific run.
   */
  getRecoveryInfo(runId: string): RecoverableRun | null {
    const db = this.client.getDatabase();

    // Get the run
    const runStmt = db.prepare('SELECT * FROM benchmark_runs WHERE id = ?');
    const run = runStmt.get(runId) as BenchmarkRun | undefined;

    if (!run) {
      return null;
    }

    // Get the latest checkpoint
    const checkpoint = this.getLatestCheckpoint(runId);
    if (!checkpoint) {
      return null;
    }

    try {
      const state = this.parseCheckpointState(checkpoint);
      const staleness = Date.now() - new Date(run.started_at).getTime();

      return { run, checkpoint, state, staleness };
    } catch {
      return null;
    }
  }

  /**
   * Mark a run as crashed (for detection of orphaned runs).
   */
  markAsCrashed(runId: string): void {
    const db = this.client.getDatabase();
    const stmt = db.prepare(`
      UPDATE benchmark_runs
      SET status = 'crashed'
      WHERE id = ? AND status = 'running'
    `);
    stmt.run(runId);
  }

  /**
   * Find orphaned runs that are still marked as 'running' but likely crashed.
   * A run is considered orphaned if it's been running longer than the threshold.
   */
  findOrphanedRuns(thresholdMs: number = 60 * 60 * 1000): BenchmarkRun[] {
    const db = this.client.getDatabase();
    const cutoff = new Date(Date.now() - thresholdMs).toISOString();

    const stmt = db.prepare(`
      SELECT * FROM benchmark_runs
      WHERE status = 'running'
      AND started_at < ?
      ORDER BY started_at DESC
    `);

    return stmt.all(cutoff) as BenchmarkRun[];
  }
}

/**
 * Create a checkpoint reader.
 */
export function createCheckpointReader(client: SQLiteClient): CheckpointReader {
  return new CheckpointReader(client);
}
