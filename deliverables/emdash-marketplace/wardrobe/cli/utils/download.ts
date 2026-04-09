/**
 * Download tarball with progress indicator
 */

import { createWriteStream, readFileSync } from 'fs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Download a file from URL and save to disk
 */
export async function downloadFile(
  url: string,
  targetPath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
  let downloadedSize = 0;

  // Ensure directory exists
  const dir = targetPath.substring(0, targetPath.lastIndexOf('/'));
  await fs.mkdir(dir, { recursive: true });

  const fileStream = createWriteStream(targetPath);

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is empty');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    downloadedSize += value.length;
    if (onProgress && totalSize > 0) {
      onProgress((downloadedSize / totalSize) * 100);
    }

    fileStream.write(value);
  }

  return new Promise((resolve, reject) => {
    fileStream.on('finish', () => resolve(targetPath));
    fileStream.on('error', (error) => reject(error));
    fileStream.end();
  });
}

/**
 * Verify file integrity using sha256 hash
 */
export async function verifyFileSha256(
  filePath: string,
  expectedSha256: string
): Promise<boolean> {
  const fileContent = readFileSync(filePath);
  const hash = createHash('sha256');
  hash.update(fileContent);
  const computedSha256 = hash.digest('hex');

  return computedSha256 === expectedSha256;
}
