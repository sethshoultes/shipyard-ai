#!/usr/bin/env node

/**
 * Anvil CLI - Cloudflare Workers AI Project Scaffolder
 *
 * Usage: npx anvil create --llm --stream
 */

import { createCommand } from "./commands/create.js";

interface CliFlags {
  llm: boolean;
  stream: boolean;
  help: boolean;
}

function parseArgs(args: string[]): CliFlags {
  const flags: CliFlags = {
    llm: false,
    stream: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === "--llm") {
      flags.llm = true;
    } else if (arg === "--stream") {
      flags.stream = true;
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}. Use --help for available options.`);
      process.exit(1);
    }
  }

  return flags;
}

function showHelp(): void {
  console.log(`
Anvil - Cloudflare Workers AI Project Scaffolder

Usage:
  npx anvil create [options]

Options:
  --llm       Generate an LLM worker with streaming support
  --stream    Enable streaming mode (default for LLM)
  --help, -h  Show this help message

Examples:
  npx anvil create --llm --stream

Deploy your worker in 60 seconds.
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(3);
  const flags = parseArgs(args);

  if (flags.help) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];

  if (!command || command === "create") {
    if (!flags.llm) {
      console.error("Specify a project type: --llm");
      console.error("Example: npx anvil create --llm --stream");
      process.exit(1);
    }

    try {
      await createCommand(flags);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Build failed: ${message}`);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    console.error("Use 'npx anvil create --help' for available commands.");
    process.exit(1);
  }
}

main();
