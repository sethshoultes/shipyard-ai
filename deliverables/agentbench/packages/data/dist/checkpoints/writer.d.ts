/**
 * Checkpoint writer for crash recovery.
 * Per Decision 2: Checkpoint writes for crash recovery.
 * Per Steve's concern: Transaction safety for crashed benchmark runs.
 */
import type { SQLiteClient } from '../sqlite/client.js';
import type { Checkpoint } from '../sqlite/schema.js';
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
export declare class CheckpointWriter {
    private readonly client;
    private readonly options;
    private writeCount;
    constructor(client: SQLiteClient, options?: CheckpointWriterOptions);
    /**
     * Write a checkpoint for a benchmark run.
     * The checkpoint captures the current state so the run can be resumed after a crash.
     *
     * @param runId - The benchmark run ID
     * @param state - The current state to checkpoint
     * @returns The created checkpoint, or null if skipped due to interval
     */
    write(runId: string, state: CheckpointState): Checkpoint | null;
    /**
     * Write an immediate checkpoint, ignoring the interval.
     * Use this for critical state changes that must be persisted.
     */
    writeImmediate(runId: string, state: CheckpointState): Checkpoint;
    /**
     * Remove old checkpoints keeping only the most recent ones.
     */
    private pruneOldCheckpoints;
    /**
     * Delete all checkpoints for a run (called on successful completion).
     */
    clearCheckpoints(runId: string): void;
    /**
     * Reset the write counter (useful for testing).
     */
    resetCounter(): void;
}
/**
 * Create a checkpoint writer with default settings.
 */
export declare function createCheckpointWriter(client: SQLiteClient, options?: CheckpointWriterOptions): CheckpointWriter;
//# sourceMappingURL=writer.d.ts.map