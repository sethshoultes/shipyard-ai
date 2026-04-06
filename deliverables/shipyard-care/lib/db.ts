/**
 * Database Connection Module
 * Requirement: REQ-007 - Database connection with connection pooling
 *
 * Provides PostgreSQL connection pooling with configurable settings
 * for optimal performance and resource management.
 */

import { Pool, PoolConfig, PoolClient, QueryResult } from 'pg';

/**
 * Database configuration from environment variables
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

/**
 * Pool configuration with sensible defaults for production use
 */
const DEFAULT_POOL_CONFIG = {
  // Connection pool settings
  min: 2, // Minimum number of connections in pool
  max: 20, // Maximum number of connections in pool

  // Connection lifecycle settings
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Wait 10 seconds for connection

  // Keep-alive settings
  allowExitOnIdle: false, // Keep pool alive even when idle
};

/**
 * Get database configuration from environment variables
 * @throws {Error} If required environment variables are missing
 */
function getDatabaseConfig(): DatabaseConfig {
  const requiredVars = [
    'DATABASE_HOST',
    'DATABASE_NAME',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missing.join(', ')}`
    );
  }

  return {
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    ssl: process.env.DATABASE_SSL === 'true',
  };
}

// Singleton pool instance
let poolInstance: Pool | null = null;

/**
 * Initialize and return the database connection pool
 * Creates a singleton pool instance on first call
 *
 * @returns {Pool} PostgreSQL connection pool
 * @throws {Error} If database configuration is invalid
 */
export function getPool(): Pool {
  if (!poolInstance) {
    const config = getDatabaseConfig();

    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      ...DEFAULT_POOL_CONFIG,
    };

    poolInstance = new Pool(poolConfig);

    // Handle pool errors
    poolInstance.on('error', (err: Error) => {
      console.error('[Database] Unexpected error on idle client:', err.message);
    });

    // Log pool connection
    poolInstance.on('connect', () => {
      console.log('[Database] New client connected to pool');
    });

    console.log(
      `[Database] Connection pool initialized (min: ${DEFAULT_POOL_CONFIG.min}, max: ${DEFAULT_POOL_CONFIG.max})`
    );
  }

  return poolInstance;
}

/**
 * Get a client from the pool for transaction handling
 * Remember to call client.release() when done
 *
 * @returns {Promise<PoolClient>} Database client from pool
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute a query using the connection pool
 *
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms for p95 target - REQ-014)
    if (duration > 100) {
      console.warn(`[Database] Slow query detected (${duration}ms):`, text);
    }

    return result;
  } catch (error) {
    console.error('[Database] Query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction with automatic commit/rollback
 *
 * @param callback - Function to execute within transaction
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connectivity
 *
 * @returns {Promise<boolean>} True if database is reachable
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0;
  } catch (error) {
    console.error('[Database] Health check failed:', error);
    return false;
  }
}

/**
 * Close the connection pool gracefully
 * Should be called during application shutdown
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    console.log('[Database] Connection pool closed');
  }
}

/**
 * Get current pool statistics
 */
export function getPoolStats(): {
  total: number;
  idle: number;
  waiting: number;
} {
  const pool = getPool();
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}
