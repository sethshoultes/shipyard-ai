/**
 * CLI implementation using Commander.js
 *
 * Per locked decision #1: command is `npx proof`
 */

import { Command } from 'commander';
import { parseConfig } from '../config/parser.js';
import { runTests } from '../runner/executor.js';
import { formatConsole } from '../output/console.js';
import { formatJson } from '../output/json.js';
import { ProofError } from '../errors.js';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { resolve } from 'path';

const VERSION = '1.0.0';

export async function main(): Promise<void> {
  const program = new Command();

  program
    .name('proof')
    .description('Test your AI agents with confidence')
    .version(VERSION)
    .argument('[config]', 'Path to test config file', 'proof.yaml')
    .option('--llm', 'Enable LLM-based semantic evaluation', false)
    .option(
      '--output <format>',
      'Output format: console or json',
      'console'
    )
    .action(async (configPath: string, options: { llm: boolean; output: string }) => {
      try {
        const resolvedPath = resolve(process.cwd(), configPath);

        if (!existsSync(resolvedPath)) {
          console.error(chalk.red(`[ERROR] Config not found: ${configPath}`));
          console.error(chalk.yellow(`[HINT] Create a proof.yaml file or specify the path to your test config`));
          process.exit(2);
        }

        const config = await parseConfig(resolvedPath);
        const results = await runTests(config, { llm: options.llm });

        if (options.output === 'json') {
          console.log(formatJson(results, config.name, configPath));
        } else {
          console.log(formatConsole(results, config.name, configPath));
        }

        const exitCode = results.failed > 0 ? 1 : 0;
        process.exit(exitCode);
      } catch (error) {
        if (error instanceof ProofError) {
          console.error(chalk.red(`[ERROR] ${error.message}`));
          if (error.hint) {
            console.error(chalk.yellow(`[HINT] ${error.hint}`));
          }
          process.exit(error.exitCode);
        }
        throw error;
      }
    });

  await program.parseAsync(process.argv);
}
