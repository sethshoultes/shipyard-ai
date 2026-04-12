/**
 * Storage abstraction interface for agentbench.
 * Provides a unified interface for data persistence, enabling future migration
 * from SQLite to other backends (e.g., Postgres) without changing application code.
 */
import type { BenchmarkRun, BenchmarkResult, Checkpoint, BenchmarkRunStatus, CreateBenchmarkRunInput, CreateBenchmarkResultInput, CreateCheckpointInput, BenchmarkRunFilters } from './sqlite/schema.js';
/**
 * Result of a paginated query
 */
export interface PaginatedResult<T> {
    /** The items in this page */
    items: T[];
    /** Total count of items matching the query */
    total: number;
    /** Whether there are more items after this page */
    hasMore: boolean;
}
/**
 * Storage interface for benchmark data.
 * Implementations can use SQLite, Postgres, or any other storage backend.
 */
export interface Storage {
    /**
     * Connect to the storage backend.
     */
    connect(): Promise<void>;
    /**
     * Close the connection to the storage backend.
     */
    close(): Promise<void>;
    /**
     * Check if connected to the storage backend.
     */
    isConnected(): boolean;
    /**
     * Create a new benchmark run.
     */
    createRun(input: CreateBenchmarkRunInput): Promise<BenchmarkRun>;
    /**
     * Get a benchmark run by ID.
     */
    getRun(id: string): Promise<BenchmarkRun | null>;
    /**
     * Update a benchmark run.
     */
    updateRun(id: string, updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>): Promise<BenchmarkRun | null>;
    /**
     * Delete a benchmark run and all associated data.
     */
    deleteRun(id: string): Promise<boolean>;
    /**
     * List benchmark runs with optional filters.
     */
    listRuns(filters?: BenchmarkRunFilters): Promise<PaginatedResult<BenchmarkRun>>;
    /**
     * Find runs by status.
     */
    findRunsByStatus(status: BenchmarkRunStatus): Promise<BenchmarkRun[]>;
    /**
     * Create a new benchmark result.
     */
    createResult(input: CreateBenchmarkResultInput): Promise<BenchmarkResult>;
    /**
     * Get a benchmark result by ID.
     */
    getResult(id: string): Promise<BenchmarkResult | null>;
    /**
     * Get all results for a run.
     */
    getResultsForRun(runId: string): Promise<BenchmarkResult[]>;
    /**
     * Delete all results for a run.
     */
    deleteResultsForRun(runId: string): Promise<number>;
    /**
     * Create a new checkpoint.
     */
    createCheckpoint(input: CreateCheckpointInput): Promise<Checkpoint>;
    /**
     * Get the latest checkpoint for a run.
     */
    getLatestCheckpoint(runId: string): Promise<Checkpoint | null>;
    /**
     * Get all checkpoints for a run.
     */
    getCheckpointsForRun(runId: string): Promise<Checkpoint[]>;
    /**
     * Delete all checkpoints for a run.
     */
    deleteCheckpointsForRun(runId: string): Promise<number>;
    /**
     * Execute a function within a transaction.
     */
    transaction<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Run any necessary migrations.
     */
    migrate(): Promise<void>;
    /**
     * Force data to be persisted (e.g., WAL checkpoint for SQLite).
     */
    sync(): Promise<void>;
}
/**
 * Synchronous storage interface (for SQLite which is synchronous).
 * This is the primary interface used internally.
 */
export interface SyncStorage {
    connect(): void;
    close(): void;
    isConnected(): boolean;
    createRun(input: CreateBenchmarkRunInput): BenchmarkRun;
    getRun(id: string): BenchmarkRun | null;
    updateRun(id: string, updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>): BenchmarkRun | null;
    deleteRun(id: string): boolean;
    listRuns(filters?: BenchmarkRunFilters): PaginatedResult<BenchmarkRun>;
    findRunsByStatus(status: BenchmarkRunStatus): BenchmarkRun[];
    createResult(input: CreateBenchmarkResultInput): BenchmarkResult;
    getResult(id: string): BenchmarkResult | null;
    getResultsForRun(runId: string): BenchmarkResult[];
    deleteResultsForRun(runId: string): number;
    createCheckpoint(input: CreateCheckpointInput): Checkpoint;
    getLatestCheckpoint(runId: string): Checkpoint | null;
    getCheckpointsForRun(runId: string): Checkpoint[];
    deleteCheckpointsForRun(runId: string): number;
    transaction<T>(fn: () => T): T;
    migrate(): void;
    sync(): void;
}
/**
 * Adapter to convert SyncStorage to async Storage.
 * Useful for providing a consistent interface while using SQLite internally.
 */
export declare class AsyncStorageAdapter implements Storage {
    private readonly syncStorage;
    constructor(syncStorage: SyncStorage);
    connect(): Promise<void>;
    close(): Promise<void>;
    isConnected(): boolean;
    createRun(input: CreateBenchmarkRunInput): Promise<BenchmarkRun>;
    getRun(id: string): Promise<BenchmarkRun | null>;
    updateRun(id: string, updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>): Promise<BenchmarkRun | null>;
    deleteRun(id: string): Promise<boolean>;
    listRuns(filters?: BenchmarkRunFilters): Promise<PaginatedResult<BenchmarkRun>>;
    findRunsByStatus(status: BenchmarkRunStatus): Promise<BenchmarkRun[]>;
    createResult(input: CreateBenchmarkResultInput): Promise<BenchmarkResult>;
    getResult(id: string): Promise<BenchmarkResult | null>;
    getResultsForRun(runId: string): Promise<BenchmarkResult[]>;
    deleteResultsForRun(runId: string): Promise<number>;
    createCheckpoint(input: CreateCheckpointInput): Promise<Checkpoint>;
    getLatestCheckpoint(runId: string): Promise<Checkpoint | null>;
    getCheckpointsForRun(runId: string): Promise<Checkpoint[]>;
    deleteCheckpointsForRun(runId: string): Promise<number>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
    migrate(): Promise<void>;
    sync(): Promise<void>;
}
/**
 * Storage provider types
 */
export type StorageProvider = 'sqlite' | 'postgres' | 'memory';
/**
 * Configuration for storage backends
 */
export interface StorageConfig {
    /** The storage provider to use */
    provider: StorageProvider;
    /** Connection string or path (interpretation depends on provider) */
    connectionString?: string;
    /** Additional provider-specific options */
    options?: Record<string, unknown>;
}
/**
 * Factory function type for creating storage instances
 */
export type StorageFactory = (config: StorageConfig) => Storage;
/**
 * Register a storage factory for a provider.
 */
export declare function registerStorageFactory(provider: StorageProvider, factory: StorageFactory): void;
/**
 * Create a storage instance based on configuration.
 */
export declare function createStorage(config: StorageConfig): Storage;
/**
 * Check if a storage provider is available.
 */
export declare function isProviderAvailable(provider: StorageProvider): boolean;
/**
 * Get all available storage providers.
 */
export declare function getAvailableProviders(): StorageProvider[];
//# sourceMappingURL=storage.d.ts.map