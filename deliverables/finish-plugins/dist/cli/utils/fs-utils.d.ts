/**
 * File system utilities for install operations
 */
/**
 * Create a temporary directory for extraction
 */
export declare function createTempDir(): Promise<string>;
/**
 * Remove a temporary directory
 */
export declare function removeTempDir(tempPath: string): Promise<void>;
/**
 * Backup existing directory
 */
export declare function backupDirectory(sourcePath: string, backupPath: string): void;
/**
 * Restore backup directory
 */
export declare function restoreBackup(backupPath: string, targetPath: string): void;
/**
 * Replace directory with new content
 */
export declare function replaceDirectory(sourcePath: string, targetPath: string): void;
/**
 * Check if critical files exist
 */
export declare function checkCriticalFiles(srcPath: string): Promise<boolean>;
