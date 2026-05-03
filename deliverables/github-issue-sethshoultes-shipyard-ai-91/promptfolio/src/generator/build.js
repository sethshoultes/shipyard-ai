/**
 * Portfolio Build Generator
 *
 * Orchestrates HTML + CSS + image generation from parsed portfolio data.
 * Writes static bundle to output directory.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile, readFile, rm } from 'fs/promises';
import { generateOGImage } from './og-image.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, '..', 'template');

/**
 * Generates a complete portfolio bundle
 * @param {Object} portfolio - Parsed portfolio data
 * @param {string} outputDir - Base output directory
 * @returns {Promise<{uuid: string, url: string}>}
 */
export async function generatePortfolio(portfolio, outputDir = './output') {
  const uuid = generateUUID();
  const portfolioDir = join(outputDir, uuid);

  // Clean and create output directory
  await rm(portfolioDir, { recursive: true, force: true });
  await mkdir(join(portfolioDir, 'assets', 'images'), { recursive: true });

  // Generate OG image
  const ogImagePath = join(portfolioDir, 'og-image.png');
  await generateOGImage(portfolio, ogImagePath);

  // Copy/minify CSS
  const cssContent = await readFile(join(TEMPLATE_DIR, 'styles.css'), 'utf-8');
  const minifiedCss = minifyCSS(cssContent);
  await writeFile(join(portfolioDir, 'assets', 'styles.css'), minifiedCss);

  // Extract and write images
  const imageMap = {};
  for (const image of portfolio.images || []) {
    if (image.data) {
      const imageData = decodeBase64(image.data);
      const imagePath = join(portfolioDir, 'assets', 'images', image.filename);
      await writeFile(imagePath, imageData);
      imageMap[image.id] = `assets/images/${image.filename}`;
    }
  }

  // Generate HTML
  const htmlContent = generateHTML(portfolio, uuid, imageMap);
  await writeFile(join(portfolioDir, 'index.html'), htmlContent);

  return {
    uuid,
    url: `/${uuid}/index.html`
  };
}

/**
 * Generates the portfolio HTML from template and data
 * @param {Object} portfolio
 * @param {string} uuid
 * @param {Object} imageMap
 * @returns {string}
 */
function generateHTML(portfolio, uuid, imageMap) {
  const layoutTemplate = readTemplate('layout.html');
  const cardTemplate = readTemplate('prompt-card.html');

  // Generate prompt cards
  const promptCards = (portfolio.prompts || []).map(prompt => {
    const cardClass = prompt.role === 'user' ? 'user' : 'assistant';
    const imageHtml = generateImagesHTML(prompt, imageMap);

    return fillTemplate(cardTemplate, {
      cardClass,
      promptId: prompt.id,
      promptTitle: escapeHTML(prompt.title),
      promptBody: escapeHTML(prompt.body),
      promptImages: imageHtml
    });
  }).join('\n');

  const ogImageUrl = `/${uuid}/og-image.png`;
  const portfolioUrl = `https://promptfolio.example.com/${uuid}/`;

  return fillTemplate(layoutTemplate, {
    portfolioTitle: escapeHTML(portfolio.title),
    createdAt: formatDate(portfolio.createdAt),
    promptCards,
    ogImageUrl,
    portfolioUrl
  });
}

/**
 * Generates HTML for prompt images
 * @param {Object} prompt
 * @param {Object} imageMap
 * @returns {string}
 */
function generateImagesHTML(prompt, imageMap) {
  if (!prompt.imageIds || prompt.imageIds.length === 0) {
    return '';
  }

  const images = prompt.imageIds
    .filter(id => imageMap[id])
    .map(id => `<img src="${imageMap[id]}" alt="" class="prompt-image">`)
    .join('\n');

  if (images) {
    return `<div class="prompt-images">${images}</div>`;
  }
  return '';
}

/**
 * Reads a template file
 * @param {string} name
 * @returns {string}
 */
function readTemplate(name) {
  const templatePath = join(TEMPLATE_DIR, name);
  try {
    return readFile(templatePath, 'utf-8');
  } catch (e) {
    console.error(`Template not found: ${templatePath}`);
    return '';
  }
}

/**
 * Fills template placeholders with values
 * @param {string} template
 * @param {Object} data
 * @returns {string}
 */
function fillTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Simple CSS minification
 * @param {string} css
 * @returns {string}
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
    .replace(/\n/g, '') // Remove newlines
    .trim();
}

/**
 * Decodes base64 string to Buffer
 * @param {string} base64
 * @returns {Buffer}
 */
function decodeBase64(base64) {
  // Handle data URLs
  const match = base64.match(/^data:.*?;base64,(.+)$/);
  const data = match ? match[1] : base64;
  return Buffer.from(data, 'base64');
}

/**
 * Escapes HTML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a date string
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Generates a UUID v4
 * @returns {string}
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// CLI execution
if (process.argv[1] && process.argv[1].includes('build.js')) {
  console.log('Promptfolio Build Generator');
  console.log('Usage: node src/generator/build.js <input.json>');
  console.log('');
  console.log('This module is designed to be imported, not run directly.');
  console.log('Use the landing page or API to generate portfolios.');
}
