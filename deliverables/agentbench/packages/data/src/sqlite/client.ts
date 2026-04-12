/**
 * SQLite client with connection management and WAL mode for crash safety.
 * Per Decision 2: SQLite for v1, checkpoint writes for crash recovery.
 */

import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

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
export class SQLiteClient {
  private db: DatabaseType | null = null;
  private readonly options: Required<SQLiteClientOptions>;
  private isConnected = false;

  constructor(options: SQLiteClientOptions) {
    this.options = {
      dbPath: options.dbPath,
      walMode: options.walMode ?? true,
      autoMigrate: options.autoMigrate ?? true,
      busyTimeout: options.busyTimeout ?? 5000,
    };
  }

  /**
   * Connect to the database and configure it for crash safety.
   * Enables WAL mode for better concurrency and crash recovery.
   */
  connect(): void {
    if (this.isConnected) {
      return;
    }

    // Ensure directory exists for file-based databases
    if (this.options.dbPath !== ':memory:') {
      const dir = this.options.dbPath.substring(0, this.options.dbPath.lastIndexOf('/'));
      if (dir && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new Database(this.options.dbPath);

    // Set busy timeout to wait for locks instead of failing immediately
    this.db.pragma(`busy_timeout = ${this.options.busyTimeout}`);

    // Enable WAL mode for crash safety and better concurrency
    // WAL mode ensures transactions are durable even if the process crashes
    if (this.options.walMode) {
      this.db.pragma('journal_mode = WAL');
    }

    // Enable foreign key constraints
    this.db.pragma('foreign_keys = ON');

    // Synchronous NORMAL provides good crash safety with WAL mode
    // Full synchronous would be safer but much slower
    this.db.pragma('synchronous = NORMAL');

    this.isConnected = true;
  }

  /**
   * Close the database connection and ensure data is flushed.
   */
  close(): void {
    if (this.db) {
      // Checkpoint WAL to ensure all changes are in the main database file
      if (this.options.walMode) {
        try {
          this.db.pragma('wal_checkpoint(TRUNCATE)');
        } catch {
          // Ignore checkpoint errors during close
        }
      }
      this.db.close();
      this.db = null;
      this.isConnected = false;
    }
  }

  /**
   * Get the underlying database instance.
   * Throws if not connected.
   */
  getDatabase(): DatabaseType {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Check if the client is connected to the database.
   */
  isOpen(): boolean {
    return this.isConnected && this.db !== null;
  }

  /**
   * Execute a function within a transaction.
   * Automatically commits on success or rolls back on error.
   * This provides crash safety for multi-statement operations.
   */
  transaction<T>(fn: (db: DatabaseType) => T): T {
    const db = this.getDatabase();
    const transaction = db.transaction(fn);
    return transaction(db);
  }

  /**
   * Execute a raw SQL statement.
   */
  exec(sql: string): void {
    const db = this.getDatabase();
    db.exec(sql);
  }

  /**
   * Prepare a SQL statement for repeated execution.
   */
  prepare(sql: string): ReturnType<DatabaseType['prepare']> {
    const db = this.getDatabase();
    return db.prepare(sql);
  }

  /**
   * Force a WAL checkpoint to ensure durability.
   * Call this after critical operations to ensure data is persisted.
   */
  checkpoint(): void {
    if (!this.options.walMode) {
      return;
    }
    const db = this.getDatabase();
    db.pragma('wal_checkpoint(PASSIVE)');
  }

  /**
   * Get the path to the database file.
   */
  getPath(): string {
    return this.options.dbPath;
  }
}

/**
 * Default database path for agentbench data.
 */
export function getDefaultDbPath(): string {
  const dataDir = process.env['AGENTBENCH_DATA_DIR'] ?? join(process.cwd(), '.agentbench');
  return join(dataDir, 'agentbench.db');
}

/**
 * Create a SQLite client with default settings.
 */
export function createClient(dbPath?: string): SQLiteClient {
  return new SQLiteClient({
    dbPath: dbPath ?? getDefaultDbPath(),
    walMode: true,
    autoMigrate: true,
  });
}

/**
 * Create an in-memory SQLite client for testing.
 */
export function createMemoryClient(): SQLiteClient {
  return new SQLiteClient({
    dbPath: ':memory:',
    walMode: false, // WAL not needed for in-memory
    autoMigrate: true,
  });
}
