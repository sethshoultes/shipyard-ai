import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Lazy initialization pattern to prevent cold start issues
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create the database instance (singleton pattern)
 * Creates connection on first call, reuses thereafter
 */
export function getDb() {
  if (db !== null) {
    return db;
  }

  // Validate environment variable
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your Neon database connection string (with -pooler suffix for serverless).'
    );
  }

  // Initialize Neon HTTP client with pooled connection
  // Use -pooler suffix in connection string for Neon's connection pooler
  const sql = neon(databaseUrl);

  // Create drizzle instance with Neon HTTP driver
  db = drizzle(sql);

  return db;
}

/**
 * Check database connection health
 * Executes a simple query to verify connectivity
 * Returns true if connection successful, false on error
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const instance = getDb();

    // Execute simple health check query
    await instance.execute('SELECT 1');

    console.log('Database connected');
    return true;
  } catch (error) {
    console.error('Database connection failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error,
    });
    return false;
  }
}
