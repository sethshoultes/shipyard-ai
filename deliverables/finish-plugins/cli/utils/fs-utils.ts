/**
 * File System Utilities
 * Backup, restore, and replace operations
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a timestamped backup of the src/ directory
 * Returns the backup path, or null if src/ doesn't exist
 */
export async function backupSrc(srcPath: string): Promise<string | null> {
  try {
    await fs.promises.access(srcPath);
  } catch {
    // src/ doesn't exist, nothing to backup
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${srcPath}.backup.${timestamp}`;

  await copyDirectory(srcPath, backupPath);

  return backupPath;
}

/**
 * Swaps the src/ directory with the new theme
 */
export async function swapSrc(srcPath: string, newThemePath: string): Promise<void> {
  // Find the src directory in the extracted theme
  const newSrcPath = await findSrcInPath(newThemePath);

  if (!newSrcPath) {
    throw new Error('Could not find src/ directory in theme');
  }

  // Remove existing src/ if it exists
  try {
    await fs.promises.rm(srcPath, { recursive: true, force: true });
  } catch {
    // Might not exist
  }

  // Copy new theme src/ to project
  await copyDirectory(newSrcPath, srcPath);
}

/**
 * Rolls back to the backup
 */
export async function rollback(srcPath: string, backupPath: string): Promise<void> {
  // Remove failed src/
  try {
    await fs.promises.rm(srcPath, { recursive: true, force: true });
  } catch {
    // Might not exist
  }

  // Restore backup
  await copyDirectory(backupPath, srcPath);
}

/**
 * Recursively copies a directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.promises.mkdir(dest, { recursive: true });

  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Finds the src/ directory in an extracted theme path
 */
async function findSrcInPath(basePath: string): Promise<string | null> {
  // Check direct src/
  const directSrc = path.join(basePath, 'src');
  try {
    const stat = await fs.promises.stat(directSrc);
    if (stat.isDirectory()) {
      return directSrc;
    }
  } catch {
    // Not found
  }

  // Check one level deep
  const entries = await fs.promises.readdir(basePath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nestedSrc = path.join(basePath, entry.name, 'src');
      try {
        const stat = await fs.promises.stat(nestedSrc);
        if (stat.isDirectory()) {
          return nestedSrc;
        }
      } catch {
        // Not found
      }
    }
  }

  return null;
}
