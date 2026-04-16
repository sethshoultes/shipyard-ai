/**
 * TypeScript configuration template for Cloudflare Workers
 * Generates tsconfig.json with strict mode and Workers type bindings
 */

export interface TsconfigOptions {
  strict?: boolean;
  target?: string;
  module?: string;
}

/**
 * Generate tsconfig.json content for Cloudflare Workers projects
 *
 * Configuration:
 * - Target: ES2022 (latest Workers runtime support)
 * - Module: ES2022 (modern JavaScript modules)
 * - Strict mode: enabled for type-safe compilation
 * - Module resolution: node (standard resolution strategy)
 * - Types: @cloudflare/workers-types (Cloudflare Workers bindings)
 */
export function generateTsConfig(options: TsconfigOptions = {}): string {
  const {
    strict = true,
    target = 'ES2022',
    module = 'ES2022',
  } = options;

  const tsconfigObject = {
    compilerOptions: {
      // Target and module configuration
      target,
      module,
      lib: ['ES2022'],

      // Strict mode for type-safe compilation
      strict,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,

      // Module resolution
      moduleResolution: 'node' as const,
      resolveJsonModule: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,

      // Output and declaration
      outDir: './dist',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,

      // Cloudflare Workers type bindings
      types: ['@cloudflare/workers-types'],
    },

    // File inclusion/exclusion
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '.wrangler'],
  };

  return JSON.stringify(tsconfigObject, null, 2);
}
