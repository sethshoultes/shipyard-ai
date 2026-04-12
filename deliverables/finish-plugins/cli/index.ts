#!/usr/bin/env node
/**
 * Wardrobe CLI
 * Theme marketplace for Emdash CMS
 *
 * One command transforms your site into something beautiful.
 * Your content stays, only the skin changes.
 */

import { listCommand } from './commands/list';
import { installCommand } from './commands/install';
import { previewCommand } from './commands/preview';

const VERSION = '1.0.0';
const PRODUCT_NAME = 'Wardrobe';

interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[]) => Promise<void>;
}

const commands: Record<string, Command> = {
  list: {
    name: 'list',
    description: 'List all available themes',
    usage: 'npx wardrobe list',
    execute: listCommand,
  },
  install: {
    name: 'install',
    description: 'Install a theme',
    usage: 'npx wardrobe install <theme-name>',
    execute: installCommand,
  },
  preview: {
    name: 'preview',
    description: 'Preview a theme in your browser',
    usage: 'npx wardrobe preview <theme-name>',
    execute: previewCommand,
  },
};

function showHelp(): void {
  console.log(`
${PRODUCT_NAME} v${VERSION}
One command. Your content stays. Only the skin changes.

Usage:
  npx wardrobe <command> [options]

Commands:
  list              List all available themes
  install <theme>   Install a theme (backs up your current src/)
  preview <theme>   Open theme preview in browser

Examples:
  npx wardrobe list
  npx wardrobe install ember
  npx wardrobe preview forge

Options:
  --help, -h        Show this help message
  --version, -v     Show version number

Learn more: https://wardrobe.shipyard.company
`);
}

function showVersion(): void {
  console.log(`${PRODUCT_NAME} v${VERSION}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  const commandName = args[0];
  const commandArgs = args.slice(1);

  const command = commands[commandName];

  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    console.log('Run "npx wardrobe --help" to see available commands.');
    process.exit(1);
  }

  try {
    await command.execute(commandArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nOops. Something went wrong: ${error.message}`);
    } else {
      console.error('\nOops. Something unexpected happened.');
    }
    process.exit(1);
  }
}

main();
