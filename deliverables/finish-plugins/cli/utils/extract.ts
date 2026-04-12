/**
 * Extract Utility
 * Tarball extraction with security validation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { Extract } from 'tar';

const REQUIRED_FILES = [
  'live.config.ts',
  'pages/index.astro',
  'layouts/Base.astro',
];

export async function extractTarball(
  tarballPath: string,
  extractPath: string
): Promise<void> {
  // Create extraction directory
  await fs.promises.mkdir(extractPath, { recursive: true });

  // Extract tarball
  await pipeline(
    createReadStream(tarballPath),
    zlib.createGunzip(),
    Extract({
      cwd: extractPath,
      strict: true,
      // Security: prevent zip slip attacks
      filter: (filePath: string) => {
        const normalized = path.normalize(filePath);
        return !normalized.startsWith('..') && !path.isAbsolute(normalized);
      },
    })
  );
}

export async function validateTheme(extractPath: string): Promise<boolean> {
  // Find the src directory (might be nested)
  const srcPath = await findSrcDirectory(extractPath);

  if (!srcPath) {
    console.error('Theme is missing src/ directory');
    return false;
  }

  // Check for required files
  for (const requiredFile of REQUIRED_FILES) {
    const filePath = path.join(srcPath, requiredFile);
    try {
      await fs.promises.access(filePath);
    } catch {
      console.error(`Theme is missing required file: ${requiredFile}`);
      return false;
    }
  }

  return true;
}

async function findSrcDirectory(basePath: string): Promise<string | null> {
  // Check if src/ exists directly
  const directSrc = path.join(basePath, 'src');
  try {
    const stat = await fs.promises.stat(directSrc);
    if (stat.isDirectory()) {
      return directSrc;
    }
  } catch {
    // Not found at root
  }

  // Check one level deep (e.g., theme-name/src/)
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
