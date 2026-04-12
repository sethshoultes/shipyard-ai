/**
 * Checkpoint writer for crash recovery.
 * Per Decision 2: Checkpoint writes for crash recovery.
 * Per Steve's concern: Transaction safety for crashed benchmark runs.
 */

import { randomUUID } from 'node:crypto';
import type { SQLiteClient } from '../sqlite/client.js';
import type { Checkpoint, CreateCheckpointInput } from '../sqlite/schema.js';

/**
 * State that can be checkpointed during a benchmark run
 */
export interface CheckpointState {
  /** Current benchmark index (which test we're on) */
  currentIndex: number;
  /** Total number of benchmarks in the run */
  totalBenchmarks: number;
  /** IDs of completed benchmarks */
  completedBenchmarks: string[];
  /** IDs of failed benchmarks */
  failedBenchmarks: string[];
  /** Custom data specific to the benchmark suite */
  customData?: Record<string, unknown>;
  /** Timestamp of this checkpoint */
  timestamp: string;
}

/**
 * Options for the checkpoint writer
 */
export interface CheckpointWriterOptions {
  /** Write a checkpoint every N benchmarks (default: 1 - after every benchmark) */
  writeInterval?: number;
  /** Maximum number of checkpoints to keep per run (default: 10) */
  maxCheckpoints?: number;
  /** Force checkpoint to disk immediately (default: true) */
  forceSync?: boolean;
}

/**
 * Checkpoint writer for persisting benchmark run state.
 * Enables crash recovery by storing intermediate state that can be restored.
 */
export class CheckpointWriter {
  private readonly client: SQLiteClient;
  private readonly options: Required<CheckpointWriterOptions>;
  private writeCount = 0;

  constructor(client: SQLiteClient, options: CheckpointWriterOptions = {}) {
    this.client = client;
    this.options = {
      writeInterval: options.writeInterval ?? 1,
      maxCheckpoints: options.maxCheckpoints ?? 10,
      forceSync: options.forceSync ?? true,
    };
  }

  /**
   * Write a checkpoint for a benchmark run.
   * The checkpoint captures the current state so the run can be resumed after a crash.
   *
   * @param runId - The benchmark run ID
   * @param state - The current state to checkpoint
   * @returns The created checkpoint, or null if skipped due to interval
   */
  write(runId: string, state: CheckpointState): Checkpoint | null {
    this.writeCount++;

    // Only write at configured intervals (except for first and last checkpoint)
    const isFirst = state.currentIndex === 0;
    const isLast = state.currentIndex >= state.totalBenchmarks - 1;
    const atInterval = this.writeCount % this.options.writeInterval === 0;

    if (!isFirst && !isLast && !atInterval) {
      return null;
    }

    const db = this.client.getDatabase();

    const checkpoint: Checkpoint = this.client.transaction(() => {
      // Create the checkpoint
      const input: CreateCheckpointInput = {
        id: randomUUID(),
        run_id: runId,
        state: {
          ...state,
          timestamp: state.timestamp || new Date().toISOString(),
        },
      };

      const insertStmt = db.prepare(`
        INSERT INTO checkpoints (id, run_id, state, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);

      insertStmt.run(input.id, input.run_id, JSON.stringify(input.state));

      // Clean up old checkpoints if we exceed the limit
      this.pruneOldCheckpoints(runId);

      // Get the created checkpoint
      const selectStmt = db.prepare('SELECT * FROM checkpoints WHERE id = ?');
      return selectStmt.get(input.id) as Checkpoint;
    });

    // Force sync to disk if configured
    if (this.options.forceSync) {
      this.client.checkpoint();
    }

    return checkpoint;
  }

  /**
   * Write an immediate checkpoint, ignoring the interval.
   * Use this for critical state changes that must be persisted.
   */
  writeImmediate(runId: string, state: CheckpointState): Checkpoint {
    const db = this.client.getDatabase();

    const checkpoint: Checkpoint = this.client.transaction(() => {
      const input: CreateCheckpointInput = {
        id: randomUUID(),
        run_id: runId,
        state: {
          ...state,
          timestamp: state.timestamp || new Date().toISOString(),
        },
      };

      const insertStmt = db.prepare(`
        INSERT INTO checkpoints (id, run_id, state, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);

      insertStmt.run(input.id, input.run_id, JSON.stringify(input.state));
      this.pruneOldCheckpoints(runId);

      const selectStmt = db.prepare('SELECT * FROM checkpoints WHERE id = ?');
      return selectStmt.get(input.id) as Checkpoint;
    });

    // Always sync immediate checkpoints
    this.client.checkpoint();

    return checkpoint;
  }

  /**
   * Remove old checkpoints keeping only the most recent ones.
   */
  private pruneOldCheckpoints(runId: string): void {
    const db = this.client.getDatabase();

    // Get count of checkpoints for this run
    const countStmt = db.prepare(
      'SELECT COUNT(*) as count FROM checkpoints WHERE run_id = ?'
    );
    const result = countStmt.get(runId) as { count: number };

    if (result.count > this.options.maxCheckpoints) {
      // Delete oldest checkpoints beyond the limit
      const deleteStmt = db.prepare(`
        DELETE FROM checkpoints
        WHERE run_id = ?
        AND id NOT IN (
          SELECT id FROM checkpoints
          WHERE run_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        )
      `);
      deleteStmt.run(runId, runId, this.options.maxCheckpoints);
    }
  }

  /**
   * Delete all checkpoints for a run (called on successful completion).
   */
  clearCheckpoints(runId: string): void {
    const db = this.client.getDatabase();
    const stmt = db.prepare('DELETE FROM checkpoints WHERE run_id = ?');
    stmt.run(runId);
  }

  /**
   * Reset the write counter (useful for testing).
   */
  resetCounter(): void {
    this.writeCount = 0;
  }
}

/**
 * Create a checkpoint writer with default settings.
 */
export function createCheckpointWriter(
  client: SQLiteClient,
  options?: CheckpointWriterOptions
): CheckpointWriter {
  return new CheckpointWriter(client, options);
}
