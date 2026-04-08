/**
 * Download tarball with progress indicator
 */
/**
 * Download a file from URL and save to disk
 */
export declare function downloadFile(url: string, targetPath: string, onProgress?: (progress: number) => void): Promise<string>;
