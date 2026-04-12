/**
 * Storage abstraction interface for agentbench.
 * Provides a unified interface for data persistence, enabling future migration
 * from SQLite to other backends (e.g., Postgres) without changing application code.
 */

import type {
  BenchmarkRun,
  BenchmarkResult,
  Checkpoint,
  BenchmarkRunStatus,
  CreateBenchmarkRunInput,
  CreateBenchmarkResultInput,
  CreateCheckpointInput,
  BenchmarkRunFilters,
} from './sqlite/schema.js';

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
  // Connection management
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

  // Benchmark runs
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
  updateRun(
    id: string,
    updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>
  ): Promise<BenchmarkRun | null>;

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

  // Benchmark results
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

  // Checkpoints
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

  // Transactions
  /**
   * Execute a function within a transaction.
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>;

  // Maintenance
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
  // Connection management
  connect(): void;
  close(): void;
  isConnected(): boolean;

  // Benchmark runs
  createRun(input: CreateBenchmarkRunInput): BenchmarkRun;
  getRun(id: string): BenchmarkRun | null;
  updateRun(
    id: string,
    updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>
  ): BenchmarkRun | null;
  deleteRun(id: string): boolean;
  listRuns(filters?: BenchmarkRunFilters): PaginatedResult<BenchmarkRun>;
  findRunsByStatus(status: BenchmarkRunStatus): BenchmarkRun[];

  // Benchmark results
  createResult(input: CreateBenchmarkResultInput): BenchmarkResult;
  getResult(id: string): BenchmarkResult | null;
  getResultsForRun(runId: string): BenchmarkResult[];
  deleteResultsForRun(runId: string): number;

  // Checkpoints
  createCheckpoint(input: CreateCheckpointInput): Checkpoint;
  getLatestCheckpoint(runId: string): Checkpoint | null;
  getCheckpointsForRun(runId: string): Checkpoint[];
  deleteCheckpointsForRun(runId: string): number;

  // Transactions
  transaction<T>(fn: () => T): T;

  // Maintenance
  migrate(): void;
  sync(): void;
}

/**
 * Adapter to convert SyncStorage to async Storage.
 * Useful for providing a consistent interface while using SQLite internally.
 */
export class AsyncStorageAdapter implements Storage {
  private readonly syncStorage: SyncStorage;

  constructor(syncStorage: SyncStorage) {
    this.syncStorage = syncStorage;
  }

  async connect(): Promise<void> {
    this.syncStorage.connect();
  }

  async close(): Promise<void> {
    this.syncStorage.close();
  }

  isConnected(): boolean {
    return this.syncStorage.isConnected();
  }

  async createRun(input: CreateBenchmarkRunInput): Promise<BenchmarkRun> {
    return this.syncStorage.createRun(input);
  }

  async getRun(id: string): Promise<BenchmarkRun | null> {
    return this.syncStorage.getRun(id);
  }

  async updateRun(
    id: string,
    updates: Partial<Pick<BenchmarkRun, 'status' | 'completed_at' | 'metadata'>>
  ): Promise<BenchmarkRun | null> {
    return this.syncStorage.updateRun(id, updates);
  }

  async deleteRun(id: string): Promise<boolean> {
    return this.syncStorage.deleteRun(id);
  }

  async listRuns(filters?: BenchmarkRunFilters): Promise<PaginatedResult<BenchmarkRun>> {
    return this.syncStorage.listRuns(filters);
  }

  async findRunsByStatus(status: BenchmarkRunStatus): Promise<BenchmarkRun[]> {
    return this.syncStorage.findRunsByStatus(status);
  }

  async createResult(input: CreateBenchmarkResultInput): Promise<BenchmarkResult> {
    return this.syncStorage.createResult(input);
  }

  async getResult(id: string): Promise<BenchmarkResult | null> {
    return this.syncStorage.getResult(id);
  }

  async getResultsForRun(runId: string): Promise<BenchmarkResult[]> {
    return this.syncStorage.getResultsForRun(runId);
  }

  async deleteResultsForRun(runId: string): Promise<number> {
    return this.syncStorage.deleteResultsForRun(runId);
  }

  async createCheckpoint(input: CreateCheckpointInput): Promise<Checkpoint> {
    return this.syncStorage.createCheckpoint(input);
  }

  async getLatestCheckpoint(runId: string): Promise<Checkpoint | null> {
    return this.syncStorage.getLatestCheckpoint(runId);
  }

  async getCheckpointsForRun(runId: string): Promise<Checkpoint[]> {
    return this.syncStorage.getCheckpointsForRun(runId);
  }

  async deleteCheckpointsForRun(runId: string): Promise<number> {
    return this.syncStorage.deleteCheckpointsForRun(runId);
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // Note: This doesn't provide true async transaction support
    // For SQLite, transactions are synchronous anyway
    return fn();
  }

  async migrate(): Promise<void> {
    this.syncStorage.migrate();
  }

  async sync(): Promise<void> {
    this.syncStorage.sync();
  }
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
 * Registry of storage factories
 */
const storageFactories = new Map<StorageProvider, StorageFactory>();

/**
 * Register a storage factory for a provider.
 */
export function registerStorageFactory(
  provider: StorageProvider,
  factory: StorageFactory
): void {
  storageFactories.set(provider, factory);
}

/**
 * Create a storage instance based on configuration.
 */
export function createStorage(config: StorageConfig): Storage {
  const factory = storageFactories.get(config.provider);
  if (!factory) {
    throw new Error(
      `No storage factory registered for provider: ${config.provider}. ` +
        `Available providers: ${Array.from(storageFactories.keys()).join(', ')}`
    );
  }
  return factory(config);
}

/**
 * Check if a storage provider is available.
 */
export function isProviderAvailable(provider: StorageProvider): boolean {
  return storageFactories.has(provider);
}

/**
 * Get all available storage providers.
 */
export function getAvailableProviders(): StorageProvider[] {
  return Array.from(storageFactories.keys());
}
