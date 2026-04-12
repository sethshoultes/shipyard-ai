/**
 * Download Utility
 * Downloads theme tarballs with integrity verification
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export async function downloadTarball(
  url: string,
  expectedHash?: string
): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const data = Buffer.from(buffer);

  // Verify integrity if hash provided
  if (expectedHash) {
    const actualHash = crypto.createHash('sha256').update(data).digest('hex');
    if (actualHash !== expectedHash) {
      throw new Error(
        'Download integrity check failed. The file may be corrupted or tampered with.'
      );
    }
  }

  // Write to temp file
  const tempDir = os.tmpdir();
  const filename = path.basename(new URL(url).pathname);
  const tarballPath = path.join(tempDir, `wardrobe-${Date.now()}-${filename}`);

  await fs.promises.writeFile(tarballPath, data);

  return tarballPath;
}
