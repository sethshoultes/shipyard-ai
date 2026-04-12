/**
 * Download tarball with progress indicator
 */
/**
 * Download a file from URL and save to disk
 */
export declare function downloadFile(url: string, targetPath: string, onProgress?: (progress: number) => void): Promise<string>;
/**
 * Verify file integrity using sha256 hash
 */
export declare function verifyFileSha256(filePath: string, expectedSha256: string): Promise<boolean>;
