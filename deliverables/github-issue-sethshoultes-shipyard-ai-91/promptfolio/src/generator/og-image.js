/**
 * OG Image Generator
 *
 * Generates pre-rendered PNG social cards for portfolios using Sharp.
 * Creates elegant, dark-mode social sharing images.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Generates an OG image for a portfolio
 * @param {Object} portfolio - Portfolio data
 * @param {string} outputPath - Path to write the PNG
 * @returns {Promise<string>} Path to generated image
 */
export async function generateOGImage(portfolio, outputPath) {
  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  await mkdir(outputDir, { recursive: true });

  // Create SVG content for the OG image
  const svg = createOGImageSVG(portfolio);

  // Convert SVG to PNG using Sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  await writeFile(outputPath, pngBuffer);

  return outputPath;
}

/**
 * Creates SVG markup for the OG image
 * @param {Object} portfolio
 * @returns {string} SVG markup
 */
function createOGImageSVG(portfolio) {
  const title = escapeXml(portfolio.title || 'Portfolio');
  const promptCount = portfolio.prompts?.length || 0;
  const date = new Date(portfolio.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#0a0a0f"/>

  <!-- Gradient overlay -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a24;stop-opacity:0.5"/>
      <stop offset="100%" style="stop-color:#0a0a0f;stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#grad)"/>

  <!-- Accent shape -->
  <circle cx="${OG_WIDTH - 150}" cy="150" r="100" fill="#6366f1" opacity="0.2"/>
  <circle cx="150" cy="${OG_HEIGHT - 100}" r="80" fill="#6366f1" opacity="0.15"/>

  <!-- Title -->
  <text x="80" y="280" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="700" fill="#f5f5f7" letter-spacing="-0.02em">
    ${title}
  </text>

  <!-- Subtitle -->
  <text x="80" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" fill="#a1a1aa">
    ${promptCount} prompts · ${date}
  </text>

  <!-- Branding -->
  <text x="80" y="${OG_HEIGHT - 60}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" fill="#71717a" letter-spacing="0.05em">
    PROMPTFOLIO
  </text>

  <!-- Decorative line -->
  <line x1="80" y1="400" x2="400" y2="400" stroke="#6366f1" stroke-width="3" opacity="0.6"/>
</svg>`;
}

/**
 * Escapes special XML characters
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
