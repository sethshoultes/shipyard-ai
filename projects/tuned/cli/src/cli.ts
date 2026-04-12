#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { pushCommand } from './commands/push.js';
import { listCommand } from './commands/list.js';
import { rollbackCommand } from './commands/rollback.js';

const program = new Command();

program
  .name('tuned')
  .description('Prompt version control for AI applications')
  .version('1.0.0');

// Add commands
program.addCommand(initCommand);
program.addCommand(pushCommand);
program.addCommand(listCommand);
program.addCommand(rollbackCommand);

program.parse();
