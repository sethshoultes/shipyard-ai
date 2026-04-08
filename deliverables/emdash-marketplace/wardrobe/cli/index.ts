#!/usr/bin/env node
/**
 * CLI for Wardrobe theme marketplace.
 *
 * Usage:
 *   wardrobe list              # Display available themes
 *   wardrobe install [theme]   # Install a theme
 *   wardrobe preview [theme]   # Open theme preview in browser
 */

import { Command } from 'commander';
import { fetchThemesRegistry } from './utils/fetch-registry.js';
import { installTheme } from './commands/install.js';
import { previewCommand } from './commands/preview.js';

// ── CLI ────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('wardrobe')
  .description('Theme marketplace for Emdash — install themes instantly')
  .version('1.0.0');

// ── list ────────────────────────────────────────────────────────────────────

program
  .command('list')
  .description('List available themes')
  .action(async () => {
    try {
      const themes = await fetchThemesRegistry();

      if (!themes || themes.length === 0) {
        console.log('No themes available.');
        return;
      }

      console.log('\nAvailable themes:\n');

      for (const theme of themes) {
        console.log(`  ${theme.name.toUpperCase()}`);
        console.log(`    ${theme.description}`);
        console.log(`    npx wardrobe install ${theme.name}`);
        console.log();
      }

      console.log(`Total: ${themes.length} theme(s)\n`);
    } catch (error) {
      console.error(
        'Failed to fetch themes. Please check your internet connection and try again.'
      );
      process.exit(1);
    }
  });

// ── install ──────────────────────────────────────────────────────────────────

program
  .command('install <theme>')
  .option('-v, --verbose', 'Show detailed output')
  .description('Install a theme')
  .action(async (theme: string, options: { verbose?: boolean }) => {
    await installTheme(theme, options);
  });

// ── preview ──────────────────────────────────────────────────────────────────

program
  .command('preview <theme>')
  .description('Open theme preview in browser')
  .action(async (theme: string) => {
    await previewCommand(theme);
  });

// ── run ────────────────────────────────────────────────────────────────────

program.parse();
