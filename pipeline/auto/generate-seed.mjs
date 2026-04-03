#!/usr/bin/env node

/**
 * generate-seed.mjs
 *
 * Takes parsed PRD JSON and generates a valid EmDash marketing seed.json
 * Uses the Bella's Bistro seed as a base template
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load the base seed template
 */
function loadBaseSeed() {
  const baseSeedPath = path.join(__dirname, '../../examples/bellas-bistro/seed/seed.json');
  const content = fs.readFileSync(baseSeedPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Generate features array from parsed data
 */
function generateFeatures(features = []) {
  const icons = ['zap', 'shield', 'users', 'chart', 'code', 'globe'];
  return features.map((feature, idx) => ({
    icon: icons[idx % icons.length],
    title: feature.title || feature,
    description: feature.description || ''
  }));
}

/**
 * Generate testimonials array from parsed data
 */
function generateTestimonials(testimonials = []) {
  return testimonials.map((testimonial) => ({
    quote: testimonial.quote || testimonial,
    author: testimonial.author || 'Anonymous',
    role: testimonial.role || 'Customer',
    company: testimonial.company || '5 stars'
  }));
}

/**
 * Generate FAQ items from parsed data
 */
function generateFaqItems(faqItems = []) {
  return faqItems.map((item) => ({
    question: item.question || item.q,
    answer: item.answer || item.a
  }));
}

/**
 * Generate menu sections from parsed features (as a placeholder)
 */
function generateMenuSections(businessName = 'Bella\'s') {
  return [
    {
      name: 'Featured Offerings',
      price: 'Varies',
      description: 'Our most popular items and signature specialties.',
      features: [
        'Signature dishes crafted with care',
        'Locally sourced ingredients',
        'Chef\'s specials that rotate seasonally',
        'Premium options available'
      ],
      cta: { label: 'Reserve a Table', url: '/contact' }
    }
  ];
}

/**
 * Generate the complete seed.json
 */
function generateSeed(parsedData) {
  const base = loadBaseSeed();

  const businessName = parsedData.businessName || 'New Business';
  const tagline = parsedData.tagline || 'Your destination for excellence';
  const heroHeadline = parsedData.heroHeadline || businessName;
  const vertical = parsedData.vertical || 'General';

  // Update metadata
  base.meta.name = businessName;
  base.meta.description = `${businessName} — built by Shipyard AI`;

  // Update settings
  base.settings.title = businessName;
  base.settings.tagline = tagline;

  // Update home page content
  const homePage = base.content.pages[0];
  const heroBlock = homePage.data.content[0];
  heroBlock.headline = heroHeadline;
  heroBlock.subheadline = parsedData.subheadline ||
    `Experience the best of ${vertical.toLowerCase()}. Quality, care, and excellence in every detail.`;

  // Update features
  const featuresBlock = homePage.data.content[1];
  featuresBlock.headline = 'Why Choose Us';
  featuresBlock.subheadline = `${businessName} stands out through our commitment to excellence and customer satisfaction.`;
  featuresBlock.features = generateFeatures(parsedData.features || []);

  // Update testimonials
  const testimonialsBlock = homePage.data.content[2];
  testimonialsBlock.headline = 'What Our Customers Say';
  testimonialsBlock.testimonials = generateTestimonials(parsedData.testimonials || []);

  // Update FAQ
  const faqBlock = homePage.data.content[3];
  faqBlock.headline = 'Frequently Asked Questions';
  faqBlock.items = generateFaqItems(parsedData.faqItems || []);

  // Update pricing (menu) page
  const pricingPage = base.content.pages[1];
  pricingPage.data.content[0].headline = 'Our Offerings';
  pricingPage.data.content[0].subheadline = `Explore what ${businessName} has to offer.`;
  pricingPage.data.content[1].plans = generateMenuSections(businessName);

  // Update primary nav to include business name
  base.menus[0].items[0].label = 'Features';

  return base;
}

/**
 * Main entry point
 */
async function main() {
  const inputJson = process.argv[2];
  const outputDir = process.argv[3] || '/tmp/emdash-seed';

  if (!inputJson) {
    console.error('Usage: node generate-seed.mjs "<parsed-json>" [outputDir]');
    process.exit(1);
  }

  try {
    // Parse input
    let parsedData;
    try {
      parsedData = JSON.parse(inputJson);
    } catch (err) {
      console.error('Invalid JSON input:', err.message);
      process.exit(1);
    }

    // Generate seed
    const seed = generateSeed(parsedData);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write seed file
    const seedPath = path.join(outputDir, 'seed.json');
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));

    // Output the path to stdout (for GitHub Actions to capture)
    console.log(seedPath);
    process.exit(0);
  } catch (err) {
    console.error('Error generating seed:', err.message);
    process.exit(1);
  }
}

main();
