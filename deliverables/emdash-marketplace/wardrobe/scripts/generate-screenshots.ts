import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { demoContent } from './fixtures/demo-content';

interface ScreenshotOptions {
  url: string;
  themeName: string;
  outputDir: string;
}

const themes = ['bloom', 'drift', 'ember', 'forge', 'slate'];

// Desktop and mobile viewport sizes
const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 },
};

async function optimizeImage(inputPath: string, outputPath: string): Promise<void> {
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`  Original size: ${(metadata.size || 0) / 1024 | 0}KB`);

    // Compress to optimize for web, target < 100KB
    await sharp(inputPath)
      .resize(viewports.desktop.width, viewports.desktop.height, {
        fit: 'cover',
        withoutEnlargement: true,
      })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);

    const stat = require('fs').statSync(outputPath);
    const sizeKB = stat.size / 1024;
    console.log(`  Optimized size: ${sizeKB | 0}KB`);

    if (sizeKB > 100) {
      console.warn(`  Warning: Image is ${sizeKB | 0}KB (target < 100KB)`);
    }
  } catch (error) {
    console.error(`Failed to optimize image: ${error}`);
    throw error;
  }
}

async function takeScreenshot(options: ScreenshotOptions, viewport: string): Promise<string> {
  const browser = await chromium.launch();
  const context = await browser.createContext({
    viewport:
      viewport === 'desktop'
        ? { width: viewports.desktop.width, height: viewports.desktop.height }
        : { width: viewports.mobile.width, height: viewports.mobile.height },
  });

  try {
    const page = await context.newPage();

    // Inject demo content into the page
    await page.goto(options.url, { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Create screenshots directory if it doesn't exist
    if (!existsSync(options.outputDir)) {
      mkdirSync(options.outputDir, { recursive: true });
    }

    const filename = `${options.themeName}-${viewport}.png`;
    const outputPath = join(options.outputDir, filename);
    const tempPath = `${outputPath}.tmp`;

    // Take screenshot
    await page.screenshot({ path: tempPath, fullPage: true });

    // Optimize the image
    console.log(`Optimizing ${filename}...`);
    await optimizeImage(tempPath, outputPath);

    // Clean up temp file
    require('fs').unlinkSync(tempPath);

    return outputPath;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function generateScreenshots(): Promise<void> {
  const baseOutputDir = join(process.cwd(), 'showcase', 'screenshots');

  console.log('Starting screenshot generation...');
  console.log(`Output directory: ${baseOutputDir}`);

  // Ensure output directory exists
  if (!existsSync(baseOutputDir)) {
    mkdirSync(baseOutputDir, { recursive: true });
  }

  for (const theme of themes) {
    console.log(`\nGenerating screenshots for ${theme}...`);

    const serverUrl = `http://localhost:3000/${theme}`;

    try {
      // Generate desktop screenshot
      console.log(`  Taking desktop screenshot...`);
      await takeScreenshot(
        {
          url: serverUrl,
          themeName: theme,
          outputDir: baseOutputDir,
        },
        'desktop'
      );

      // Generate mobile screenshot
      console.log(`  Taking mobile screenshot...`);
      await takeScreenshot(
        {
          url: serverUrl,
          themeName: theme,
          outputDir: baseOutputDir,
        },
        'mobile'
      );

      console.log(`  ✓ Completed ${theme}`);
    } catch (error) {
      console.error(`  ✗ Failed to generate screenshots for ${theme}: ${error}`);
    }
  }

  console.log(`\n✓ Screenshot generation complete!`);
  console.log(`Screenshots saved to: ${baseOutputDir}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateScreenshots().catch(console.error);
}

export { generateScreenshots, takeScreenshot };
