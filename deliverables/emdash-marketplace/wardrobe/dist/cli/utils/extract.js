/**
 * Extract tarball handling utilities
 */
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import * as tar from 'tar';
import { createTempDir, removeTempDir } from './fs-utils.js';
/**
 * Extract a tar.gz file to a target directory
 */
export async function extractTarball(options) {
    const { tarballPath, targetDir } = options;
    return new Promise((resolve, reject) => {
        const gunzip = createGunzip();
        const source = createReadStream(tarballPath);
        source
            .pipe(gunzip)
            .pipe(tar.extract({
            cwd: targetDir,
        }))
            .on('finish', () => {
            resolve();
        })
            .on('error', (error) => {
            reject(error);
        });
        source.on('error', (error) => {
            reject(error);
        });
        gunzip.on('error', (error) => {
            reject(error);
        });
    });
}
export { createTempDir, removeTempDir };
