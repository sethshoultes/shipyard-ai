/**
 * Package.json Template Generator
 *
 * Generates a package.json for Cloudflare Workers projects with:
 * - Base dependencies: Hono, Wrangler, TypeScript, Cloudflare Workers types
 * - Conditional dependencies: Clerk SDK (if auth), Stripe SDK (if payments)
 * - Locked versions for stability (caret ranges)
 * - Zero WorkerKit runtime dependency
 *
 * REQ-011, REQ-062, REQ-063 compliance:
 * - Zero WorkerKit runtime dependencies
 * - Locked dependency versions
 * - Minimal, focused stack
 */

interface PackageJsonConfig {
  name: string;
  version?: string;
  needsAuth?: boolean;
  needsPayments?: boolean;
  needsDatabase?: boolean;
  needsAI?: boolean;
}

interface PackageJsonData {
  name: string;
  version: string;
  description: string;
  type: string;
  main: string;
  scripts: {
    dev: string;
    deploy: string;
    build: string;
    typecheck: string;
    test: string;
  };
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  engines: {
    node: string;
  };
}

/**
 * Generate package.json content for a Cloudflare Workers project
 *
 * @param config - Configuration object with project name and feature flags
 * @returns Complete package.json object ready to stringify
 *
 * @example
 * const pkgJson = generatePackageJson({
 *   name: 'my-api',
 *   needsAuth: true,
 *   needsPayments: true
 * });
 * JSON.stringify(pkgJson, null, 2); // Valid JSON
 */
export function generatePackageJson(config: PackageJsonConfig): PackageJsonData {
  const {
    name,
    version = '0.0.1',
    needsAuth = false,
    needsPayments = false,
  } = config;

  // Base dependencies: always included
  const dependencies: Record<string, string> = {
    hono: '^4.4.0',
    '@cloudflare/workers-types': '^4.20250225.0',
    wrangler: '^3.39.0',
  };

  // Dev dependencies: always included
  const devDependencies: Record<string, string> = {
    typescript: '^5.3.3',
  };

  // Conditional: Clerk SDK for authentication
  if (needsAuth) {
    dependencies['@clerk/backend'] = '^1.0.0';
  }

  // Conditional: Stripe SDK for payments
  if (needsPayments) {
    dependencies.stripe = '^15.0.0';
  }

  // Build the complete package.json object
  const packageJson: PackageJsonData = {
    name,
    version,
    description: 'Built with WorkerKit',
    type: 'module',
    main: 'src/index.ts',
    scripts: {
      dev: 'wrangler dev',
      deploy: 'wrangler deploy',
      build: 'wrangler build',
      typecheck: 'tsc --noEmit',
      test: 'node tests/run.js',
    },
    dependencies,
    devDependencies,
    engines: {
      node: '>=18.0.0',
    },
  };

  return packageJson;
}

/**
 * Generate package.json and validate it
 * Ensures the output is valid JSON before writing
 *
 * @param config - Configuration object with project name and feature flags
 * @returns Valid JSON string representation of package.json
 * @throws Error if JSON generation fails or is invalid
 */
export function generatePackageJsonString(config: PackageJsonConfig): string {
  const packageJson = generatePackageJson(config);

  // Validate JSON is valid by parsing it back
  try {
    const jsonString = JSON.stringify(packageJson, null, 2);
    // Verify it's valid JSON by parsing it back
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    throw new Error(
      `Failed to generate valid package.json: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
