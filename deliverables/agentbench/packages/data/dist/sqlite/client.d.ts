/**
 * SQLite client with connection management and WAL mode for crash safety.
 * Per Decision 2: SQLite for v1, checkpoint writes for crash recovery.
 */
import { type Database as DatabaseType } from 'better-sqlite3';
/**
 * Options for creating a SQLite client
 */
export interface SQLiteClientOptions {
    /** Path to the database file. Use ':memory:' for in-memory database. */
    dbPath: string;
    /** Whether to enable WAL mode (default: true for crash safety) */
    walMode?: boolean;
    /** Whether to run migrations on connect (default: true) */
    autoMigrate?: boolean;
    /** Busy timeout in milliseconds (default: 5000) */
    busyTimeout?: number;
}
/**
 * SQLite client wrapper with connection management and WAL mode support.
 * Provides crash-safe database operations for benchmark runs.
 */
export declare class SQLiteClient {
    private db;
    private readonly options;
    private isConnected;
    constructor(options: SQLiteClientOptions);
    /**
     * Connect to the database and configure it for crash safety.
     * Enables WAL mode for better concurrency and crash recovery.
     */
    connect(): void;
    /**
     * Close the database connection and ensure data is flushed.
     */
    close(): void;
    /**
     * Get the underlying database instance.
     * Throws if not connected.
     */
    getDatabase(): DatabaseType;
    /**
     * Check if the client is connected to the database.
     */
    isOpen(): boolean;
    /**
     * Execute a function within a transaction.
     * Automatically commits on success or rolls back on error.
     * This provides crash safety for multi-statement operations.
     */
    transaction<T>(fn: (db: DatabaseType) => T): T;
    /**
     * Execute a raw SQL statement.
     */
    exec(sql: string): void;
    /**
     * Prepare a SQL statement for repeated execution.
     */
    prepare(sql: string): ReturnType<DatabaseType['prepare']>;
    /**
     * Force a WAL checkpoint to ensure durability.
     * Call this after critical operations to ensure data is persisted.
     */
    checkpoint(): void;
    /**
     * Get the path to the database file.
     */
    getPath(): string;
}
/**
 * Default database path for agentbench data.
 */
export declare function getDefaultDbPath(): string;
/**
 * Create a SQLite client with default settings.
 */
export declare function createClient(dbPath?: string): SQLiteClient;
/**
 * Create an in-memory SQLite client for testing.
 */
export declare function createMemoryClient(): SQLiteClient;
//# sourceMappingURL=client.d.ts.map