#!/usr/bin/env node
/**
 * Generate PNG screenshots for theme showcase
 * Creates 800x600 PNG images with theme color schemes
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '..', 'showcase', 'screenshots');

const themes = [
  {
    name: 'ember',
    bgColor: '#1a2332',
    accentColor: '#d97d4a',
    textColor: '#ffffff',
    title: 'Ember',
    subtitle: 'Bold. Editorial.',
    description: 'For people with something to say.'
  },
  {
    name: 'forge',
    bgColor: '#0d1117',
    accentColor: '#39d353',
    textColor: '#39d353',
    title: 'Forge',
    subtitle: 'Dark and technical.',
    description: 'Built for builders.'
  },
  {
    name: 'slate',
    bgColor: '#ffffff',
    accentColor: '#0066cc',
    textColor: '#2c3e50',
    title: 'Slate',
    subtitle: 'Professional. Trustworthy.',
    description: 'Clean. Steady. Trusted.'
  },
  {
    name: 'drift',
    bgColor: '#f8f8f8',
    accentColor: '#9cad7f',
    textColor: '#555555',
    title: 'Drift',
    subtitle: 'Minimal and airy.',
    description: 'Let your content breathe.'
  },
  {
    name: 'bloom',
    bgColor: '#f5eee4',
    accentColor: '#c97a5c',
    textColor: '#d4704f',
    title: 'Bloom',
    subtitle: 'Warm and inviting.',
    description: 'Where community feels at home.'
  }
];

async function generateScreenshot(theme) {
  const width = 800;
  const height = 600;

  // Create SVG content for the screenshot
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${theme.bgColor}"/>

  <!-- Accent bar at top -->
  <rect x="0" y="0" width="${width}" height="80" fill="${theme.accentColor}"/>

  <!-- Main content area -->
  <rect x="40" y="120" width="${width - 80}" height="${height - 160}" rx="8" fill="${theme.bgColor === '#ffffff' || theme.bgColor === '#f8f8f8' || theme.bgColor === '#f5eee4' ? '#ffffff' : '#161b22'}" stroke="${theme.accentColor}" stroke-width="2"/>

  <!-- Title -->
  <text x="${width / 2}" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${theme.textColor}" text-anchor="middle">
    ${theme.title}
  </text>

  <!-- Subtitle -->
  <text x="${width / 2}" y="260" font-family="Arial, sans-serif" font-size="24" fill="${theme.accentColor}" text-anchor="middle">
    ${theme.subtitle}
  </text>

  <!-- Decorative line -->
  <line x1="200" y1="300" x2="${width - 200}" y2="300" stroke="${theme.accentColor}" stroke-width="2"/>

  <!-- Description -->
  <text x="${width / 2}" y="360" font-family="Arial, sans-serif" font-size="20" fill="${theme.bgColor === '#ffffff' || theme.bgColor === '#f8f8f8' || theme.bgColor === '#f5eee4' ? '#666666' : '#aaaaaa'}" text-anchor="middle">
    ${theme.description}
  </text>

  <!-- Sample content blocks -->
  <rect x="80" y="400" width="280" height="120" rx="4" fill="${theme.accentColor}" opacity="0.2"/>
  <rect x="400" y="400" width="320" height="120" rx="4" fill="${theme.accentColor}" opacity="0.15"/>

  <!-- Theme badge -->
  <rect x="${width - 200}" y="${height - 60}" width="160" height="40" rx="20" fill="${theme.accentColor}"/>
  <text x="${width - 120}" y="${height - 32}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${theme.bgColor === '#0d1117' || theme.bgColor === '#1a2332' ? '#ffffff' : '#ffffff'}" text-anchor="middle">
    Wardrobe
  </text>
</svg>`;

  const outputPath = path.join(screenshotsDir, `${theme.name}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated ${theme.name}.png`);
}

async function main() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Generating PNG screenshots for themes...\n');

  for (const theme of themes) {
    await generateScreenshot(theme);
  }

  console.log('\n✓ All screenshots generated successfully!');
}

main().catch(err => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
