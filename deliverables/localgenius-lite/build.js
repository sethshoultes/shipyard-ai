/**
 * SPARK Build Script
 * Bundles and minifies the widget for CDN deployment
 */

import * as esbuild from 'esbuild';
import { gzipSync } from 'zlib';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIST_DIR = 'dist';
const WIDGET_ENTRY = 'spark/widget/spark.js';

async function build() {
  console.log('🔨 Building SPARK widget...\n');

  // Ensure dist directory exists
  mkdirSync(DIST_DIR, { recursive: true });

  try {
    // Build with esbuild
    const result = await esbuild.build({
      entryPoints: [WIDGET_ENTRY],
      bundle: true,
      minify: true,
      format: 'iife',
      target: 'es2020',
      outfile: join(DIST_DIR, 'spark.min.js'),
      write: true,
      metafile: true,
    });

    // Read the bundled file
    const bundled = readFileSync(join(DIST_DIR, 'spark.min.js'));

    // Gzip it
    const gzipped = gzipSync(bundled);
    writeFileSync(join(DIST_DIR, 'spark.min.js.gz'), gzipped);

    // Calculate sizes
    const originalSize = bundled.length;
    const gzippedSize = gzipped.length;

    console.log('✅ Build complete!\n');
    console.log(`📦 Bundle size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`📦 Gzipped size: ${(gzippedSize / 1024).toFixed(2)} KB`);

    if (gzippedSize > 10240) {
      console.warn(`\n⚠️  Warning: Gzipped bundle exceeds 10KB target (${(gzippedSize / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`\n✨ Bundle size within 10KB target!`);
    }

    // Output file locations
    console.log(`\n📁 Output files:`);
    console.log(`   - ${join(DIST_DIR, 'spark.min.js')}`);
    console.log(`   - ${join(DIST_DIR, 'spark.min.js.gz')}`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
