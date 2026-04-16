/**
 * Plugin Resolver Specification
 *
 * Convention-based plugin entrypoint resolution for Shipyard plugins.
 *
 * This module eliminates manual path configuration by following a predictable
 * convention: plugin names are automatically resolved to their entrypoint paths.
 *
 * CONVENTION:
 * - Plugin name: "membership" → "plugins/membership/src/sandbox-entry.ts"
 * - Plugin name: "payments" → "plugins/payments/src/sandbox-entry.ts"
 * - Plugin name: "analytics" → "plugins/analytics/src/sandbox-entry.ts"
 *
 * FALLBACK RESOLUTION ORDER:
 * 1. plugins/[name]/src/sandbox-entry.ts (TypeScript source)
 * 2. plugins/[name]/dist/sandbox-entry.js (Compiled output)
 * 3. plugins/[name]/src/sandbox.ts (Alternative TS filename)
 * 4. plugins/[name]/dist/sandbox.js (Alternative compiled filename)
 * 5. plugins/[name]/src/index.ts (Last resort TS)
 * 6. plugins/[name]/dist/index.js (Last resort compiled)
 *
 * EXAMPLES:
 *
 * Before (manual configuration, error-prone):
 * ```typescript
 * plugins: [{
 *   type: "standard",
 *   entrypoint: "./plugins/membership/dist/sandbox-entry.js",  // manual path
 *   workerLoader: "esm"
 * }]
 * ```
 *
 * After (convention-based, zero-config):
 * ```typescript
 * plugins: ["membership"]  // auto-resolves to plugins/membership/src/sandbox-entry.ts
 * ```
 *
 * USAGE:
 *
 * ```typescript
 * import { resolvePluginEntrypoint } from './plugin-resolver';
 *
 * // Returns absolute path to entrypoint
 * const entrypoint = resolvePluginEntrypoint('membership');
 * // => "/home/user/project/plugins/membership/src/sandbox-entry.ts"
 *
 * // Throws descriptive error if not found
 * const missing = resolvePluginEntrypoint('non-existent-plugin');
 * // => Error: PLUGIN_ENTRYPOINT_NOT_FOUND
 * //    Could not resolve plugin "non-existent-plugin"
 * //    Expected location: plugins/non-existent-plugin/src/sandbox-entry.ts
 * ```
 */

import { existsSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Configuration for fallback resolution order
 *
 * Each fallback is relative to the plugin root directory
 */
const FALLBACK_PATHS = [
  'src/sandbox-entry.ts',     // Primary: TypeScript source
  'dist/sandbox-entry.js',    // Secondary: Compiled JS
  'src/sandbox.ts',           // Tertiary: Alternative TS filename
  'dist/sandbox.js',          // Alternative compiled
  'src/index.ts',             // Last resort TS
  'dist/index.js',            // Last resort compiled
] as const;

/**
 * Resolves a plugin name to its absolute entrypoint path
 *
 * @param pluginName - The plugin name (e.g., "membership")
 * @param projectRoot - The project root directory (defaults to current working directory)
 * @returns Absolute path to the resolved entrypoint
 * @throws Error if no entrypoint could be resolved
 *
 * @example
 * ```typescript
 * // Returns: "/home/user/project/plugins/membership/src/sandbox-entry.ts"
 * const path = resolvePluginEntrypoint('membership');
 * ```
 */
export function resolvePluginEntrypoint(
  pluginName: string,
  projectRoot: string = process.cwd()
): string {
  // Validate plugin name
  if (!pluginName || typeof pluginName !== 'string') {
    throw new Error(
      `INVALID_PLUGIN_NAME: Plugin name must be a non-empty string, received: ${typeof pluginName}`
    );
  }

  // Construct the plugin root directory
  const pluginRoot = join(projectRoot, 'plugins', pluginName);

  // Try each fallback path in order
  for (const fallbackPath of FALLBACK_PATHS) {
    const candidatePath = join(pluginRoot, fallbackPath);
    if (existsSync(candidatePath)) {
      // Return absolute path
      return resolve(candidatePath);
    }
  }

  // No entrypoint found - provide actionable error
  throw new Error(
    `PLUGIN_ENTRYPOINT_NOT_FOUND: Could not resolve plugin "${pluginName}"\n` +
    `Expected location: plugins/${pluginName}/src/sandbox-entry.ts\n` +
    `Tried the following paths:\n` +
    FALLBACK_PATHS.map((p) => `  - plugins/${pluginName}/${p}`).join('\n') +
    `\n\nMake sure your plugin directory exists and contains one of the expected entrypoint files.`
  );
}

/**
 * Batch resolves multiple plugin names to their entrypoint paths
 *
 * @param pluginNames - Array of plugin names
 * @param projectRoot - The project root directory
 * @returns Object mapping plugin names to their resolved paths
 * @throws Error if ANY plugin cannot be resolved (fail-fast behavior)
 *
 * @example
 * ```typescript
 * const paths = resolvePluginEntrypoints(['membership', 'payments']);
 * // Returns: {
 * //   membership: "/home/user/project/plugins/membership/src/sandbox-entry.ts",
 * //   payments: "/home/user/project/plugins/payments/src/sandbox-entry.ts"
 * // }
 * ```
 */
export function resolvePluginEntrypoints(
  pluginNames: string[],
  projectRoot: string = process.cwd()
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const name of pluginNames) {
    // Will throw if not found (fail-fast)
    resolved[name] = resolvePluginEntrypoint(name, projectRoot);
  }

  return resolved;
}

/**
 * Non-throwing version of resolvePluginEntrypoint
 *
 * Useful for build validation where you want to collect all errors
 * before failing the build.
 *
 * @param pluginName - The plugin name
 * @param projectRoot - The project root directory
 * @returns Object with either `{ ok: true, path: string }` or `{ ok: false, error: string }`
 *
 * @example
 * ```typescript
 * const result = resolvePluginEntrypointSafe('membership');
 *
 * if (result.ok) {
 *   console.log('Resolved:', result.path);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export function resolvePluginEntrypointSafe(
  pluginName: string,
  projectRoot: string = process.cwd()
): { ok: true; path: string } | { ok: false; error: string } {
  try {
    const path = resolvePluginEntrypoint(pluginName, projectRoot);
    return { ok: true, path };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Gets the plugin root directory for a given plugin name
 *
 * Useful for accessing other files in the plugin directory
 * (package.json, descriptor.json, etc.)
 *
 * @param pluginName - The plugin name
 * @param projectRoot - The project root directory
 * @returns Absolute path to the plugin directory
 *
 * @example
 * ```typescript
 * const pluginDir = getPluginDirectory('membership');
 * // => "/home/user/project/plugins/membership"
 *
 * // Access descriptor.json
 * const descriptor = require(join(pluginDir, 'descriptor.json'));
 * ```
 */
export function getPluginDirectory(
  pluginName: string,
  projectRoot: string = process.cwd()
): string {
  return resolve(join(projectRoot, 'plugins', pluginName));
}

/**
 * Validates that all plugins can be resolved (used at build time)
 *
 * @param pluginNames - Array of plugin names to validate
 * @param projectRoot - The project root directory
 * @returns Object with validation results
 *
 * @example
 * ```typescript
 * const validation = validatePluginsExist(['membership', 'payments']);
 *
 * if (!validation.valid) {
 *   console.error('Build failed:', validation.errors.join('\n'));
 *   process.exit(1);
 * }
 * ```
 */
export function validatePluginsExist(
  pluginNames: string[],
  projectRoot: string = process.cwd()
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const name of pluginNames) {
    const result = resolvePluginEntrypointSafe(name, projectRoot);
    if (!result.ok) {
      errors.push(`Plugin "${name}": ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
