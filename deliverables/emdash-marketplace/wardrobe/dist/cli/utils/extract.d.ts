/**
 * Extract tarball handling utilities
 */
import { createTempDir, removeTempDir } from './fs-utils.js';
export interface ExtractOptions {
    tarballPath: string;
    targetDir: string;
}
/**
 * Extract a tar.gz file to a target directory
 */
export declare function extractTarball(options: ExtractOptions): Promise<void>;
export { createTempDir, removeTempDir };
