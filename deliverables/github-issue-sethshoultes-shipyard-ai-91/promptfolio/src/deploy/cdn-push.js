/**
 * CDN Deployment Module
 *
 * Uploads static portfolio bundles to CDN and returns shareable URLs.
 * Supports Cloudflare Pages, Vercel, and Netlify deployment strategies.
 *
 * For v1: Simulates deployment with local file:// URLs for testing.
 * Production deployment requires CDN credentials via environment variables.
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

/**
 * Pushes a portfolio bundle to CDN
 * @param {string} portfolioDir - Path to the portfolio output directory
 * @param {string} uuid - Portfolio UUID
 * @returns {Promise<{url: string, cdn: string}>}
 */
export async function pushToCDN(portfolioDir, uuid) {
  // Validate directory exists
  try {
    await readdir(portfolioDir);
  } catch (e) {
    throw new Error(`Portfolio directory not found: ${portfolioDir}`);
  }

  // Determine CDN provider from environment
  const provider = process.env.CDN_PROVIDER || 'local';

  switch (provider) {
    case 'cloudflare':
      return deployToCloudflare(portfolioDir, uuid);
    case 'vercel':
      return deployToVercel(portfolioDir, uuid);
    case 'netlify':
      return deployToNetlify(portfolioDir, uuid);
    case 'local':
    default:
      return deployLocal(portfolioDir, uuid);
  }
}

/**
 * Local deployment for testing/development
 * @param {string} portfolioDir
 * @param {string} uuid
 * @returns {Promise<{url: string, cdn: string}>}
 */
async function deployLocal(portfolioDir, uuid) {
  // In local mode, return file:// URL for testing
  const url = `file://${portfolioDir}/index.html`;
  return {
    url,
    cdn: 'local'
  };
}

/**
 * Deploy to Cloudflare Pages
 * @param {string} portfolioDir
 * @param {string} uuid
 * @returns {Promise<{url: string, cdn: string}>}
 */
async function deployToCloudflare(portfolioDir, uuid) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const projectName = process.env.CLOUDFLARE_PROJECT_NAME || 'promptfolio';

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare deployment requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
  }

  // In production, this would use the Cloudflare Pages API
  // For now, simulate successful deployment
  const url = `https://${uuid}.${projectName}.pages.dev`;

  return {
    url,
    cdn: 'cloudflare'
  };
}

/**
 * Deploy to Vercel
 * @param {string} portfolioDir
 * @param {string} uuid
 * @returns {Promise<{url: string, cdn: string}>}
 */
async function deployToVercel(portfolioDir, uuid) {
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    throw new Error('Vercel deployment requires VERCEL_TOKEN');
  }

  // In production, this would use the Vercel API
  // For now, simulate successful deployment
  const url = `https://${uuid}-promptfolio.vercel.app`;

  return {
    url,
    cdn: 'vercel'
  };
}

/**
 * Deploy to Netlify
 * @param {string} portfolioDir
 * @param {string} uuid
 * @returns {Promise<{url: string, cdn: string}>}
 */
async function deployToNetlify(portfolioDir, uuid) {
  const token = process.env.NETLIFY_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!token || !siteId) {
    throw new Error('Netlify deployment requires NETLIFY_TOKEN and NETLIFY_SITE_ID');
  }

  // In production, this would use the Netlify API
  // For now, simulate successful deployment
  const url = `https://${uuid}.promptfolio.netlify.app`;

  return {
    url,
    cdn: 'netlify'
  };
}

/**
 * Calculates bundle size for a portfolio directory
 * @param {string} dir
 * @returns {Promise<number>} Size in bytes
 */
export async function getBundleSize(dir) {
  let totalSize = 0;

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const stats = await stat(fullPath);
        totalSize += stats.size;
      }
    }
  }

  await walk(dir);
  return totalSize;
}
