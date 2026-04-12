/**
 * Install Command
 * Downloads theme tarball, backs up existing src/, swaps in new theme
 *
 * Success message: "Your site is now wearing [theme-name]."
 */

import { fetchRegistry } from '../utils/fetch-registry';
import { downloadTarball } from '../utils/download';
import { extractTarball, validateTheme } from '../utils/extract';
import { backupSrc, swapSrc, rollback } from '../utils/fs-utils';
import { sendTelemetry } from '../utils/telemetry';
import * as path from 'path';
import * as os from 'os';

export async function installCommand(args: string[]): Promise<void> {
  const themeName = args[0];

  if (!themeName) {
    console.error('Please specify a theme name.');
    console.log('Usage: npx wardrobe install <theme-name>');
    console.log('Run "npx wardrobe list" to see available themes.');
    process.exit(1);
  }

  const startTime = Date.now();

  console.log(`\nInstalling ${themeName}...\n`);

  // Fetch registry
  const registry = await fetchRegistry();
  const theme = registry.themes.find(
    t => t.slug.toLowerCase() === themeName.toLowerCase() && !t.comingSoon
  );

  if (!theme) {
    const comingSoon = registry.themes.find(
      t => t.slug.toLowerCase() === themeName.toLowerCase() && t.comingSoon
    );

    if (comingSoon) {
      console.log(`"${comingSoon.name}" is coming soon (${comingSoon.estimatedRelease || 'TBD'}).`);
      console.log('Sign up at https://wardrobe.shipyard.company to be notified.');
      process.exit(0);
    }

    console.error(`Theme "${themeName}" not found.`);
    console.log('Run "npx wardrobe list" to see available themes.');
    process.exit(1);
  }

  const cwd = process.cwd();
  const srcPath = path.join(cwd, 'src');
  let backupPath: string | null = null;

  try {
    // Step 1: Backup existing src/
    console.log('  Backing up your current theme...');
    backupPath = await backupSrc(srcPath);
    if (backupPath) {
      console.log(`  Backup created: ${path.basename(backupPath)}`);
    }

    // Step 2: Download tarball
    console.log('  Downloading theme...');
    const tarballPath = await downloadTarball(theme.tarballUrl, theme.sha256);

    // Step 3: Extract to temp directory
    console.log('  Extracting...');
    const extractPath = path.join(os.tmpdir(), `wardrobe-${theme.slug}-${Date.now()}`);
    await extractTarball(tarballPath, extractPath);

    // Step 4: Validate theme structure
    console.log('  Validating theme...');
    const isValid = await validateTheme(extractPath);
    if (!isValid) {
      throw new Error('Theme validation failed. Missing required files.');
    }

    // Step 5: Swap src/ directory
    console.log('  Installing theme...');
    await swapSrc(srcPath, extractPath);

    // Step 6: Send anonymous telemetry
    await sendTelemetry({
      theme: theme.slug,
      version: theme.version,
      os: process.platform,
      timestamp: new Date().toISOString(),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log(`Done. Your site is now wearing ${theme.name}.`);
    console.log(`Installed in ${elapsed}s`);
    console.log('');
    console.log('Run "npm run dev" to see your new look.');

  } catch (error) {
    console.error('\nInstallation failed.');

    // Attempt rollback
    if (backupPath) {
      console.log('Rolling back to your previous theme...');
      try {
        await rollback(srcPath, backupPath);
        console.log('Rollback successful. Your site is unchanged.');
      } catch (rollbackError) {
        console.error('Rollback failed. Your backup is at:', backupPath);
      }
    }

    throw error;
  }
}
