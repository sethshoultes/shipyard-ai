/**
 * .gitignore template for Cloudflare Workers projects
 * Excludes dependency directories, build outputs, and environment files
 */

export interface GitignoreOptions {
  includeEnv?: boolean;
  includeLogs?: boolean;
  includeWrangler?: boolean;
}

/**
 * Generate .gitignore content for Cloudflare Workers projects
 *
 * Excludes:
 * - node_modules/       Dependencies directory
 * - dist/               TypeScript build output
 * - .wrangler/          Wrangler development cache
 * - .env                Environment variables (secrets)
 * - .dev.vars           Cloudflare development variables (secrets)
 * - *.log               Application and npm logs
 * - .DS_Store           macOS system files
 */
export function generateGitignore(options: GitignoreOptions = {}): string {
  const {
    includeEnv = true,
    includeLogs = true,
    includeWrangler = true,
  } = options;

  const lines: string[] = [
    '# Dependencies',
    'node_modules/',
    '',
    '# Build output',
    'dist/',
    '*.js',
    '*.d.ts',
    '*.map',
    '',
  ];

  if (includeWrangler) {
    lines.push(
      '# Cloudflare Wrangler',
      '.wrangler/',
      '.wrangler/state',
      '',
    );
  }

  if (includeEnv) {
    lines.push(
      '# Environment variables (sensitive)',
      '.env',
      '.env.local',
      '.env.*.local',
      '.dev.vars',
      '',
    );
  }

  if (includeLogs) {
    lines.push(
      '# Logs',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '',
    );
  }

  lines.push(
    '# OS files',
    '.DS_Store',
    'Thumbs.db',
    '',
  );

  return lines.join('\n');
}
