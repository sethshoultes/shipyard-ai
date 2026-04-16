#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  promptText,
  promptBoolean,
  createReadlineInterface,
  closeReadlineInterface,
} from './prompts.js';
import { generateWranglerToml, validateWranglerToml } from './templates/wrangler-toml.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VERSION = '1.0.0';

interface ProjectOptions {
  name: string;
  auth: boolean;
  database: boolean;
  ai: boolean;
  payments: boolean;
}

interface ParsedArgs {
  projectName?: string;
  skipPrompts: boolean;
}

/**
 * Validate project name
 * Rules: lowercase alphanumeric + hyphens, max 50 chars, no special chars
 */
function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Project name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Project name must be 50 characters or less' };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      valid: false,
      error: 'Project name must contain only lowercase letters, numbers, and hyphens',
    };
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    return { valid: false, error: 'Project name cannot start or end with a hyphen' };
  }

  return { valid: true };
}

/**
 * Parse command line arguments
 * Supports: --version, --help, --skip-prompts, project-name
 */
function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const result: ParsedArgs = { skipPrompts: false };

  for (const arg of args) {
    if (arg === '--version' || arg === '-v') {
      console.log(`create-workerkit v${VERSION}`);
      process.exit(0);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--skip-prompts') {
      result.skipPrompts = true;
    } else if (!arg.startsWith('-')) {
      result.projectName = arg;
    }
  }

  return result;
}

/**
 * Print help message with minimal branding
 */
function printHelp(): void {
  console.log(`
create-workerkit - Zero-to-deployed business app in under 60 seconds

Usage:
  create-workerkit [project-name] [options]

Examples:
  create-workerkit my-app
  create-workerkit my-app --skip-prompts
  create-workerkit --version

Options:
  --version, -v      Show version number
  --help, -h         Show this help message
  --skip-prompts     Skip interactive prompts, use defaults
`);
}

/**
 * Collect answers from user prompts
 * Prompts for: project name, auth, database, AI, payments
 */
async function collectAnswers(
  projectName?: string
): Promise<ProjectOptions> {
  const rl = createReadlineInterface();

  try {
    // Project name with validation
    let name = projectName || '';
    while (!name) {
      name = await promptText(rl, 'Project name');
      const validation = validateProjectName(name);
      if (!validation.valid) {
        console.log(`Error: ${validation.error}`);
        name = '';
      }
    }

    // Service selections with sensible defaults
    const auth = await promptBoolean(rl, 'Include Clerk authentication?', true);
    const database = await promptBoolean(rl, 'Include D1 database?', true);
    const ai = await promptBoolean(rl, 'Include Workers AI?', true);
    const payments = await promptBoolean(rl, 'Include Stripe payments?', false);

    return { name, auth, database, ai, payments };
  } finally {
    closeReadlineInterface(rl);
  }
}

/**
 * Create project directory and files
 */
async function createProject(options: ProjectOptions): Promise<number> {
  const startTime = Date.now();
  const projectDir = path.join(process.cwd(), options.name);

  console.log(`Creating ${options.name}...`);

  // Create directories
  const dirs = [
    projectDir,
    path.join(projectDir, 'src'),
    path.join(projectDir, 'src', 'routes'),
    path.join(projectDir, 'src', 'types'),
    path.join(projectDir, 'migrations'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Create package.json for generated project
  const packageJson = {
    name: options.name,
    version: '1.0.0',
    description: 'Built with WorkerKit',
    type: 'module',
    main: 'src/index.ts',
    scripts: {
      dev: 'wrangler dev',
      deploy: 'wrangler deploy',
      build: 'tsc',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'hono': '^4.0.0',
      'wrangler': '^3.0.0',
      'typescript': '^5.0.0',
    },
  };

  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ES2020',
      lib: ['ES2020'],
      moduleResolution: 'node',
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  };

  await fs.writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );

  // Generate wrangler.toml with comprehensive inline documentation
  const wranglerToml = generateWranglerToml({
    projectName: options.name,
    includeDatabase: options.database,
    includeAI: options.ai,
    includeKV: false,
  });

  // Validate the generated TOML structure
  const tomlValidation = validateWranglerToml(wranglerToml);
  if (!tomlValidation.isValid) {
    throw new Error(
      `Generated wrangler.toml failed validation:\n${tomlValidation.errors.map((err) => `  - ${err}`).join('\n')}`
    );
  }

  await fs.writeFile(
    path.join(projectDir, 'wrangler.toml'),
    wranglerToml
  );

  // Create .gitignore
  const gitignore = `node_modules/
dist/
.env
.env.local
.env.*.local
.wrangler/
.DS_Store
*.log
`;

  await fs.writeFile(
    path.join(projectDir, '.gitignore'),
    gitignore
  );

  // Create .env.example
  let envExample = `# Cloudflare Configuration
ACCOUNT_ID=your_account_id

`;

  if (options.auth) {
    envExample += `# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

`;
  }

  if (options.ai) {
    envExample += `# AI Configuration (optional for Claude fallback)
ANTHROPIC_API_KEY=your_anthropic_api_key

`;
  }

  if (options.payments) {
    envExample += `# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

`;
  }

  await fs.writeFile(
    path.join(projectDir, '.env.example'),
    envExample
  );

  // Create main index.ts
  const indexTs = `import { Hono } from 'hono';

type Bindings = {
  ${options.database ? 'DB: D1Database;' : ''}
  ${options.ai ? 'AI: Ai;' : ''}
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Hello world endpoint
app.get('/', (c) => {
  return c.json({ message: 'Hello from WorkerKit!' });
});

export default app;
`;

  await fs.writeFile(
    path.join(projectDir, 'src', 'index.ts'),
    indexTs
  );

  // Create env.d.ts for types
  const envDts = `declare global {
  interface CloudflareEnv {
    ${options.database ? 'DB: D1Database;' : ''}
    ${options.ai ? 'AI: Ai;' : ''}
  }
}

export {};
`;

  await fs.writeFile(
    path.join(projectDir, 'src', 'types', 'env.d.ts'),
    envDts
  );

  // Create migration file if database enabled
  if (options.database) {
    const migration = `-- 0001_create_users.sql
-- Initial database schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

    await fs.writeFile(
      path.join(projectDir, 'migrations', '0001_create_users.sql'),
      migration
    );
  }

  // Create README.md
  const readmeMd = `# ${options.name}

Built with [WorkerKit](https://github.com/shipyard-ai/create-workerkit) - Zero-to-deployed business app in under 60 seconds.

## Quick Start

1. \`\`\`bash
   npm install
   \`\`\`

2. \`\`\`bash
   cp .env.example .env
   # Edit .env and add your configuration
   \`\`\`

3. \`\`\`bash
   npm run dev
   \`\`\`

4. Visit [http://localhost:8787](http://localhost:8787)

## Deploying

\`\`\`bash
npm run deploy
\`\`\`

## Project Structure

\`\`\`
${options.name}/
├── src/
│   ├── index.ts           # Main Hono application
│   ├── routes/            # API routes
│   └── types/             # TypeScript type definitions
${options.database ? '├── migrations/        # D1 database migrations\n' : ''}├── wrangler.toml        # Cloudflare Workers configuration
├── package.json
└── tsconfig.json
\`\`\`

## Documentation

- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers](https://workers.cloudflare.com)
${options.database ? '- [D1 Database](https://developers.cloudflare.com/d1/)' : ''}
${options.auth ? '- [Clerk Authentication](https://clerk.com)' : ''}
${options.ai ? '- [Workers AI](https://developers.cloudflare.com/workers-ai/)' : ''}
${options.payments ? '- [Stripe Integration](https://stripe.com)' : ''}

## License

MIT
`;

  await fs.writeFile(
    path.join(projectDir, 'README.md'),
    readmeMd
  );

  const elapsed = Date.now() - startTime;
  const seconds = (elapsed / 1000).toFixed(2);

  console.log(`Done. Ready to build.`);
  console.log(`\nNext:`);
  console.log(`  cd ${options.name}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
  console.log(`\nGenerated in ${seconds}s`);

  return elapsed;
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  try {
    const args = parseArgs();

    let options: ProjectOptions;

    if (args.skipPrompts) {
      // Fast path: use defaults
      if (!args.projectName) {
        console.error('Error: Project name required with --skip-prompts');
        process.exit(1);
      }

      const validation = validateProjectName(args.projectName);
      if (!validation.valid) {
        console.error(`Error: ${validation.error}`);
        process.exit(1);
      }

      options = {
        name: args.projectName,
        auth: true,
        database: true,
        ai: true,
        payments: false,
      };
    } else if (args.projectName) {
      // Project name provided, validate it and prompt for services
      const validation = validateProjectName(args.projectName);
      if (!validation.valid) {
        console.error(`Error: ${validation.error}`);
        process.exit(1);
      }

      options = await collectAnswers(args.projectName);
    } else {
      // Full interactive setup
      options = await collectAnswers();
    }

    await createProject(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
