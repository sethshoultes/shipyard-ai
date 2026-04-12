/**
 * Checkpoint writer for crash recovery.
 * Per Decision 2: Checkpoint writes for crash recovery.
 * Per Steve's concern: Transaction safety for crashed benchmark runs.
 */
import { randomUUID } from 'node:crypto';
/**
 * Checkpoint writer for persisting benchmark run state.
 * Enables crash recovery by storing intermediate state that can be restored.
 */
export class CheckpointWriter {
    client;
    options;
    writeCount = 0;
    constructor(client, options = {}) {
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
    write(runId, state) {
        this.writeCount++;
        // Only write at configured intervals (except for first and last checkpoint)
        const isFirst = state.currentIndex === 0;
        const isLast = state.currentIndex >= state.totalBenchmarks - 1;
        const atInterval = this.writeCount % this.options.writeInterval === 0;
        if (!isFirst && !isLast && !atInterval) {
            return null;
        }
        const db = this.client.getDatabase();
        const checkpoint = this.client.transaction(() => {
            // Create the checkpoint
            const input = {
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
            return selectStmt.get(input.id);
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
    writeImmediate(runId, state) {
        const db = this.client.getDatabase();
        const checkpoint = this.client.transaction(() => {
            const input = {
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
            return selectStmt.get(input.id);
        });
        // Always sync immediate checkpoints
        this.client.checkpoint();
        return checkpoint;
    }
    /**
     * Remove old checkpoints keeping only the most recent ones.
     */
    pruneOldCheckpoints(runId) {
        const db = this.client.getDatabase();
        // Get count of checkpoints for this run
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM checkpoints WHERE run_id = ?');
        const result = countStmt.get(runId);
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
    clearCheckpoints(runId) {
        const db = this.client.getDatabase();
        const stmt = db.prepare('DELETE FROM checkpoints WHERE run_id = ?');
        stmt.run(runId);
    }
    /**
     * Reset the write counter (useful for testing).
     */
    resetCounter() {
        this.writeCount = 0;
    }
}
/**
 * Create a checkpoint writer with default settings.
 */
export function createCheckpointWriter(client, options) {
    return new CheckpointWriter(client, options);
}
//# sourceMappingURL=writer.js.map