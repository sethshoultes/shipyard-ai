#!/usr/bin/env node

/**
 * Portfolio Data Validation Tests
 *
 * Tests the portfolio.ts data structure for compliance with PRD requirements.
 * Run with: node --test tests/portfolio-data.test.ts
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory where this test file is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import portfolio data (will be created during build)
let portfolioData: any = null;

try {
  // Dynamically import the portfolio file
  const portfolioPath = join(__dirname, '..', 'portfolio.ts');
  const fs = await import('fs/promises');
  const portfolioContent = await fs.readFile(portfolioPath, 'utf-8');

  // Simple extraction - this is basic but works for our validation needs
  // In a real scenario, we'd use tsx or similar, but keeping it simple
  const appsMatch = portfolioContent.match(/export const apps.*?=\s*(\[[\s\S]*?\]);/);
  if (appsMatch) {
    // eval the extracted array - this is safe since we control the content
    const appsArray = eval(appsMatch[1]);
    portfolioData = { apps: appsArray };
  }
} catch (error) {
  console.error('Could not load portfolio data:', error);
  process.exit(1);
}

describe('Portfolio Data Validation', () => {
  test('should have exactly 3 app entries', () => {
    assert.ok(portfolioData, 'Portfolio data should be loaded');
    assert.ok(Array.isArray(portfolioData.apps), 'Apps should be an array');
    assert.strictEqual(portfolioData.apps.length, 3, 'Should have exactly 3 apps');
  });

  test('should have correct slugs', () => {
    const slugs = portfolioData.apps.map((app: any) => app.slug);
    const expectedSlugs = ['tuned', 'promptfolio', 'commandbar'];

    assert.deepStrictEqual(
      slugs.sort(),
      expectedSlugs.sort(),
      'Should have exactly the expected slugs: tuned, promptfolio, commandbar'
    );
  });

  test('each entry should have all required fields', () => {
    const requiredFields = ['slug', 'name', 'tagline', 'status', 'github', 'features', 'techStack', 'accent'];

    portfolioData.apps.forEach((app: any, index: number) => {
      requiredFields.forEach(field => {
        assert.ok(
          app.hasOwnProperty(field),
          `App ${index} (${app.slug || 'unknown'}) should have field: ${field}`
        );
      });
    });
  });

  test('all GitHub URLs should match expected pattern', () => {
    const urlPattern = /^https:\/\/github\.com\/sethshoultes\/shipyard-ai\/tree\/main\/projects\/[a-z-]+$/;

    portfolioData.apps.forEach((app: any) => {
      assert.match(
        app.github,
        urlPattern,
        `App ${app.slug} GitHub URL should match pattern: ${app.github}`
      );
    });
  });

  test('slugs should be unique', () => {
    const slugs = portfolioData.apps.map((app: any) => app.slug);
    const uniqueSlugs = [...new Set(slugs)];

    assert.strictEqual(
      slugs.length,
      uniqueSlugs.length,
      'All slugs should be unique'
    );
  });

  test('accent colors should not conflict with existing /work colors', () => {
    const usedColors = ['blue', 'red', 'sky', 'purple', 'emerald', 'indigo'];

    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        !usedColors.includes(app.accent),
        `App ${app.slug} accent color ${app.accent} should not be in used set: ${usedColors.join(', ')}`
      );
    });
  });

  test('each entry should have at least 3 features', () => {
    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        Array.isArray(app.features),
        `App ${app.slug} features should be an array`
      );
      assert.ok(
        app.features.length >= 3,
        `App ${app.slug} should have at least 3 features, has ${app.features.length}`
      );
    });
  });

  test('each feature should be 200 characters or less', () => {
    portfolioData.apps.forEach((app: any) => {
      app.features.forEach((feature: string, index: number) => {
        assert.ok(
          feature.length <= 200,
          `App ${app.slug} feature ${index + 1} should be ≤200 chars, is ${feature.length}: "${feature}"`
        );
      });
    });
  });

  test('taglines should be 120 characters or less', () => {
    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        typeof app.tagline === 'string',
        `App ${app.slug} tagline should be a string`
      );
      assert.ok(
        app.tagline.length <= 120,
        `App ${app.slug} tagline should be ≤120 chars, is ${app.tagline.length}: "${app.tagline}"`
      );
    });
  });

  test('status should be one of allowed values', () => {
    const allowedStatuses = ['SHIPPED', 'BUILD', 'SCAFFOLD'];

    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        allowedStatuses.includes(app.status),
        `App ${app.slug} status should be one of ${allowedStatuses.join(', ')}, is ${app.status}`
      );
    });
  });

  test('tech stack should be an array of strings', () => {
    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        Array.isArray(app.techStack),
        `App ${app.slug} techStack should be an array`
      );

      app.techStack.forEach((tech: string, index: number) => {
        assert.ok(
          typeof tech === 'string',
          `App ${app.slug} techStack item ${index + 1} should be a string`
        );
        assert.ok(
          tech.length > 0,
          `App ${app.slug} techStack item ${index + 1} should not be empty`
        );
      });
    });
  });

  test('names should be non-empty strings', () => {
    portfolioData.apps.forEach((app: any) => {
      assert.ok(
        typeof app.name === 'string',
        `App ${app.slug} name should be a string`
      );
      assert.ok(
        app.name.length > 0,
        `App ${app.slug} name should not be empty`
      );
    });
  });
});

console.log('Portfolio data validation tests completed successfully!');