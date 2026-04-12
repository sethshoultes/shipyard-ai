/**
 * Install command - download theme and swap src/ directory
 *
 * Per Elon: "Unzipping a src/ directory should take less than 3 seconds."
 * Per Steve: "The moment that must be perfect: Seeing YOUR content wearing a new theme."
 */

import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { fetchThemesRegistry } from '../utils/fetch-registry.js';
import { downloadFile, verifyFileSha256 } from '../utils/download.js';
import { extractTarball, createTempDir, removeTempDir } from '../utils/extract.js';
import {
  backupDirectory,
  restoreBackup,
  replaceDirectory,
  checkCriticalFiles,
} from '../utils/fs-utils.js';

const ANALYTICS_URL = 'https://wardrobe-analytics.emdash.workers.dev/track';

/**
 * Send anonymous telemetry for installs (fire-and-forget)
 */
async function sendTelemetry(theme: string): Promise<void> {
  // Check opt-out
  if (process.env.WARDROBE_TELEMETRY_DISABLED === '1' ||
      process.env.WARDROBE_TELEMETRY_DISABLED === 'true') {
    return;
  }

  try {
    // Fire-and-forget - don't await
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme,
        os: process.platform,
        timestamp: Date.now(),
        cliVersion: '1.0.0'
      })
    }).catch(() => {}); // Silently ignore errors
  } catch {
    // Silently ignore all errors
  }
}

interface InstallOptions {
  verbose?: boolean;
}

/**
 * Show progress bar
 */
function showProgress(percent: number, label: string = 'Downloading'): void {
  const width = 30;
  const filled = Math.round((width * percent) / 100);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(
    `\r${label}... [${bar}] ${Math.round(percent)}%`
  );
}

/**
 * Validate theme name against registry
 */
async function validateTheme(themeName: string): Promise<string> {
  const themes = await fetchThemesRegistry();
  const normalizedName = themeName.toLowerCase().trim();

  const theme = themes.find((t) => t.name.toLowerCase() === normalizedName);
  if (!theme) {
    throw new Error(
      `Theme "${themeName}" not found. Available themes: ${themes
        .map((t) => t.name)
        .join(', ')}`
    );
  }

  // Check if theme is coming soon
  if ((theme as any).comingSoon) {
    throw new Error(
      `Theme "${themeName}" is coming soon (${(theme as any).estimatedRelease}). Stay tuned for updates!`
    );
  }

  return theme.name;
}

/**
 * Get theme details from registry
 */
async function getThemeDetails(themeName: string) {
  const themes = await fetchThemesRegistry();
  const theme = themes.find(
    (t) => t.name.toLowerCase() === themeName.toLowerCase()
  );

  if (!theme || !theme.tarballUrl) {
    throw new Error(`Theme "${themeName}" has no tarball URL`);
  }

  return theme;
}

/**
 * Install a theme by name
 */
export async function installTheme(
  themeName: string,
  options: InstallOptions = {}
): Promise<void> {
  const startTime = Date.now();

  try {
    // Step 2-3: Validate theme name (case-insensitive)
    if (!themeName) {
      throw new Error('Please specify a theme name. Usage: wardrobe install [theme]');
    }

    if (options.verbose) {
      console.log(`\nValidating theme "${themeName}"...`);
    }

    const validThemeName = await validateTheme(themeName);
    const theme = await getThemeDetails(validThemeName);

    // Determine project root (where user runs command)
    const projectRoot = process.cwd();
    const srcPath = join(projectRoot, 'src');
    const backupPath = join(projectRoot, 'src.backup');

    if (options.verbose) {
      console.log(`Theme: ${validThemeName}`);
      console.log(`Project root: ${projectRoot}`);
      console.log(`Source directory: ${srcPath}`);
    }

    // Step 7: Backup existing src/ before swap
    if (options.verbose) {
      console.log('\nBacking up existing src/...');
    }
    backupDirectory(srcPath, backupPath);

    // Create temp directory for extraction
    const tempDir = await createTempDir();

    try {
      // Step 5: Download tarball
      if (options.verbose) {
        console.log(`Downloading ${validThemeName} theme...`);
      } else {
        process.stdout.write('\n');
      }

      const tarballPath = join(tempDir, 'theme.tar.gz');
      await downloadFile(theme.tarballUrl!, tarballPath, (progress) => {
        showProgress(progress, 'Downloading');
      });
      process.stdout.write('\n');

      // Step 8: Extract tarball to temp directory
      if (options.verbose) {
        console.log('Extracting theme...');
      }
      await extractTarball({
        tarballPath,
        targetDir: tempDir,
      });

      // Find the src/ directory in the extracted tarball
      // It might be nested, e.g., theme-name/src/ or just src/
      const extractedSrcPath = findExtractedSrc(tempDir);
      if (!extractedSrcPath) {
        throw new Error('Invalid theme tarball: no src/ directory found');
      }

      // Step 10: Verify critical files exist
      if (options.verbose) {
        console.log('Verifying theme integrity...');
      }
      const hasRequiredFiles = await checkCriticalFiles(extractedSrcPath);
      if (!hasRequiredFiles) {
        throw new Error(
          'Theme is missing required files: live.config.ts or pages/index.astro'
        );
      }

      // Step 9: Replace project src/ with theme src/
      if (options.verbose) {
        console.log('Installing theme...');
      }
      replaceDirectory(extractedSrcPath, srcPath);

      // Step 11: Success message (Steve's style)
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✓ Theme installed.\n`);
      console.log(`Your site is now wearing ${validThemeName}.\n`);
      console.log(`Try it on. If it doesn't fit, try another.\n`);
      console.log(`Installed in ${elapsed}s\n`);

      // Post-install reveal: dev server hint (per Board Condition Tier 1 #3)
      console.log(`Run \`npm run dev\` to see your transformed site.`);
      console.log(`Then open http://localhost:4321`);
      console.log(`Admin panel: http://localhost:4321/_emdash/admin\n`);

      // Send anonymous telemetry (fire-and-forget, non-blocking)
      sendTelemetry(validThemeName);
    } finally {
      // Cleanup temp directory
      await removeTempDir(tempDir);
    }
  } catch (error) {
    // Step 12: Handle errors - restore backup if install fails
    const projectRoot = process.cwd();
    const srcPath = join(projectRoot, 'src');
    const backupPath = join(projectRoot, 'src.backup');

    if (existsSync(backupPath)) {
      if (options.verbose) {
        console.log('\nRestoring backup...');
      }
      try {
        restoreBackup(backupPath, srcPath);
      } catch (restoreError) {
        console.error('Failed to restore backup:', restoreError);
      }
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nInstall failed: ${message}\n`);
    process.exit(1);
  }
}

/**
 * Find extracted src/ directory (handles nested structures)
 */
function findExtractedSrc(basePath: string): string | null {
  // Check if src/ is directly in basePath
  const directSrc = join(basePath, 'src');
  if (existsSync(directSrc)) {
    return directSrc;
  }

  // Check for nested structure (theme-name/src)
  try {
    const entries = require('fs').readdirSync(basePath, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const nestedSrc = join(basePath, entry.name, 'src');
        if (existsSync(nestedSrc)) {
          return nestedSrc;
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}
