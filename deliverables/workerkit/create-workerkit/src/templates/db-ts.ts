/**
 * db-ts.ts
 *
 * Generates a simple D1 query wrapper (src/db.ts) for the generated project.
 * Provides a thin wrapper around D1's prepare().bind().all() API with error handling
 * and inline comments explaining D1 binding usage and Cloudflare env.DB access.
 */

export interface DbConfig {
  projectName: string;
}

/**
 * Generates src/db.ts with a simple query helper function
 *
 * The query() function wraps D1's prepare().bind().all() to:
 * - Handle parameterized queries safely
 * - Provide consistent error messages
 * - Explain D1 binding access via c.env.DB in Hono context
 *
 * @param config Configuration with project name for error messages
 * @returns src/db.ts content as a string
 */
export function generateDbTs(config: DbConfig): string {
  return `/**
 * src/db.ts
 *
 * Simple D1 query wrapper providing type-safe database operations.
 * D1 is Cloudflare's SQLite database available at the edge.
 *
 * Documentation: https://developers.cloudflare.com/d1/
 */

/**
 * D1Database type definition
 * This type is provided by Cloudflare Workers environment
 * Access it via: c.env.DB (where c is the Hono context)
 */
type D1Database = any; // Type is provided by Cloudflare Workers env

/**
 * Query result returned by D1
 * Contains the array of rows and metadata
 */
interface QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
  };
}

/**
 * Simple helper function to execute parameterized D1 queries
 *
 * How it works:
 * 1. Takes your SQL query and parameters
 * 2. Prepares the statement with D1.prepare(sql)
 * 3. Binds parameters safely to prevent SQL injection
 * 4. Executes the query with .all() to return all results
 * 5. Handles errors with helpful messages pointing to D1 setup
 *
 * Usage example in your Hono routes:
 *
 *   import { query } from './db';
 *
 *   app.post('/api/users', async (c) => {
 *     const { email, name } = await c.req.json();
 *
 *     try {
 *       const result = await query(
 *         c.env.DB,
 *         'INSERT INTO users (email, name) VALUES (?, ?)',
 *         [email, name]
 *       );
 *       return c.json({ success: true, data: result });
 *     } catch (error) {
 *       return c.json({ error: error.message }, 500);
 *     }
 *   });
 *
 * D1 Binding Setup:
 * 1. Create a D1 database: wrangler d1 create ${config.projectName}_db
 * 2. The database_id is shown in the output - copy it to wrangler.toml
 * 3. In wrangler.toml, you should have:
 *
 *    [[d1_databases]]
 *    binding = "DB"
 *    database_name = "${config.projectName}_db"
 *    database_id = "your_database_id_here"
 *
 * 4. Access it in Hono: const db = c.env.DB
 * 5. All queries go through this query() helper for consistency
 *
 * Error Handling:
 * - If D1 is not bound in wrangler.toml, you'll see: "Cannot read property 'prepare' of undefined"
 *   Fix: Ensure [[d1_databases]] section exists and database_id is set
 *
 * - If the database doesn't exist on Cloudflare, you'll see a 503 error
 *   Fix: Run: wrangler d1 create ${config.projectName}_db
 *
 * - If SQL is invalid, you'll see a specific SQLite error message
 *   Fix: Check your SQL syntax (D1 uses SQLite)
 */
export async function query<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    // D1 API: prepare(sql) returns a prepared statement
    const statement = db.prepare(sql);

    // Bind parameters safely (prevents SQL injection)
    // Parameters are replaced in order with ? placeholders in your SQL
    const bound = statement.bind(...params);

    // Execute the prepared statement and return all results
    // .all() returns { results: [...], success: true, meta: {...} }
    const result = await bound.all<T>();

    if (!result.success) {
      throw new Error('Database query execution failed');
    }

    return result.results || [];
  } catch (error) {
    // Provide helpful error message with setup instructions
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common D1 setup issues
    if (errorMessage.includes('Cannot read property')) {
      throw new Error(
        \`Database query failed. Ensure D1 is created: wrangler d1 create \${process.env.PROJECT_NAME || '${config.projectName}'}_db\`
      );
    }

    // Re-throw with additional context
    throw new Error(\`Database query failed: \${errorMessage}\`);
  }
}

/**
 * Helper: Execute a query and return the first row only
 * Useful for SELECT queries that should return exactly one result
 */
export async function queryOne<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const results = await query<T>(db, sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Helper: Execute a query that returns no results (INSERT, UPDATE, DELETE)
 * Returns the number of rows affected
 */
export async function execute(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<number> {
  try {
    const statement = db.prepare(sql);
    const bound = statement.bind(...params);
    const result = await bound.run();

    if (!result.success) {
      throw new Error('Database execution failed');
    }

    return result.meta?.changes || 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Database execution failed: \${errorMessage}\`);
  }
}
`;
}

/**
 * Validates the generated db.ts content
 * @param content The generated TypeScript content
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateDbTs(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required exports
  if (!content.includes('export async function query')) {
    errors.push('Missing query() function export');
  }
  if (!content.includes('export async function queryOne')) {
    errors.push('Missing queryOne() helper function export');
  }
  if (!content.includes('export async function execute')) {
    errors.push('Missing execute() helper function export');
  }

  // Check for error handling
  if (!content.includes('catch (error)')) {
    errors.push('Missing error handling in query functions');
  }

  // Check for D1 binding documentation
  if (!content.includes('c.env.DB')) {
    errors.push('Missing documentation about D1 binding access');
  }

  // Check for inline comments explaining D1 setup
  if (!content.includes('wrangler d1 create')) {
    errors.push('Missing inline comments about D1 database creation');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
