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
export declare class CheckpointReader {
    private readonly client;
    constructor(client: SQLiteClient);
    /**
     * Get the latest checkpoint for a specific run.
     */
    getLatestCheckpoint(runId: string): Checkpoint | null;
    /**
     * Get all checkpoints for a run, ordered by creation time.
     */
    getCheckpoints(runId: string): Checkpoint[];
    /**
     * Parse the state from a checkpoint.
     */
    parseCheckpointState(checkpoint: Checkpoint): CheckpointState;
    /**
     * Find all runs that can potentially be recovered.
     * Returns runs with status 'running' or 'crashed' that have checkpoints.
     */
    findRecoverableRuns(options?: RecoveryOptions): RecoverableRun[];
    /**
     * Check if a specific run can be recovered.
     */
    canRecover(runId: string): boolean;
    /**
     * Get recovery info for a specific run.
     */
    getRecoveryInfo(runId: string): RecoverableRun | null;
    /**
     * Mark a run as crashed (for detection of orphaned runs).
     */
    markAsCrashed(runId: string): void;
    /**
     * Find orphaned runs that are still marked as 'running' but likely crashed.
     * A run is considered orphaned if it's been running longer than the threshold.
     */
    findOrphanedRuns(thresholdMs?: number): BenchmarkRun[];
}
/**
 * Create a checkpoint reader.
 */
export declare function createCheckpointReader(client: SQLiteClient): CheckpointReader;
//# sourceMappingURL=reader.d.ts.map