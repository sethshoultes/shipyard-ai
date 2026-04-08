/**
 * File system utilities for install operations
 */

import {
  promises as fs,
  existsSync,
  renameSync,
  rmSync,
  cpSync,
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

/**
 * Create a temporary directory for extraction
 */
export async function createTempDir(): Promise<string> {
  const tempName = `wardrobe-${randomBytes(8).toString('hex')}`;
  const tempPath = join(tmpdir(), tempName);
  await fs.mkdir(tempPath, { recursive: true });
  return tempPath;
}

/**
 * Remove a temporary directory
 */
export async function removeTempDir(tempPath: string): Promise<void> {
  try {
    rmSync(tempPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors when removing temp directory
  }
}

/**
 * Backup existing directory
 */
export function backupDirectory(
  sourcePath: string,
  backupPath: string
): void {
  if (existsSync(sourcePath)) {
    // Remove old backup if it exists
    if (existsSync(backupPath)) {
      rmSync(backupPath, { recursive: true, force: true });
    }
    cpSync(sourcePath, backupPath, { recursive: true });
  }
}

/**
 * Restore backup directory
 */
export function restoreBackup(backupPath: string, targetPath: string): void {
  if (existsSync(backupPath)) {
    // Remove failed install
    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }
    cpSync(backupPath, targetPath, { recursive: true });
  }
}

/**
 * Replace directory with new content
 */
export function replaceDirectory(
  sourcePath: string,
  targetPath: string
): void {
  // Remove target if it exists
  if (existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
  }
  // Move source to target
  renameSync(sourcePath, targetPath);
}

/**
 * Check if critical files exist
 */
export async function checkCriticalFiles(srcPath: string): Promise<boolean> {
  try {
    const liveConfigPath = join(srcPath, 'live.config.ts');
    const pagesIndexPath = join(srcPath, 'pages', 'index.astro');

    const liveConfigExists = existsSync(liveConfigPath);
    const pagesIndexExists = existsSync(pagesIndexPath);

    return liveConfigExists && pagesIndexExists;
  } catch {
    return false;
  }
}
