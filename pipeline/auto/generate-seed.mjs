#!/usr/bin/env node

/**
 * generate-seed.mjs — Takes parsed PRD JSON file, outputs seed.json to stdout
 * Input: file path to parsed JSON
 * Output: complete EmDash seed.json to stdout
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadBaseSeed() {
  const p = path.join(__dirname, '../../examples/bellas-bistro/seed/seed.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function generateSeed(d) {
  const base = loadBaseSeed();
  const name = d.businessName || 'New Business';
  const tagline = d.tagline || `Welcome to ${name}`;
  const icons = ['zap', 'shield', 'users', 'chart', 'code', 'globe'];

  base.meta.name = name;
  base.meta.description = `${name} — built by Shipyard AI`;
  base.settings.title = name;
  base.settings.tagline = tagline;

  // Home page
  const home = base.content.pages[0];
  home.data.content[0].headline = d.heroHeadline || name;
  home.data.content[0].subheadline = d.heroSubheadline || tagline;
  home.data.content[0].primaryCta = { label: 'Get Started', url: '/contact' };
  home.data.content[0].secondaryCta = { label: 'Learn More', url: '/#features' };

  // Features
  const features = (d.features || []).map((f, i) => ({
    icon: icons[i % icons.length],
    title: typeof f === 'string' ? f : f.title || f,
    description: typeof f === 'string' ? '' : f.description || '',
  }));
  if (features.length > 0) {
    home.data.content[1].headline = `Why choose ${name}`;
    home.data.content[1].features = features;
  }

  // Testimonials
  const testimonials = (d.testimonials || []).map(t => ({
    quote: typeof t === 'string' ? t : t.quote || t,
    author: t.author || 'Happy Customer',
    role: t.role || 'Client',
    company: t.company || '5 stars',
  }));
  if (testimonials.length > 0) {
    home.data.content[2].testimonials = testimonials;
  }

  // FAQ
  const faq = (d.faqItems || []).map(f => ({
    question: f.question || f.q || f,
    answer: f.answer || f.a || '',
  }));
  if (faq.length > 0) {
    home.data.content[3].items = faq;
  }

  // Menu nav
  base.menus[0].items = [
    { type: 'custom', label: 'About', url: '/#features' },
    { type: 'custom', label: 'Services', url: '/pricing' },
    { type: 'custom', label: 'Contact', url: '/contact' },
  ];

  return base;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node generate-seed.mjs <parsed-prd.json>');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const seed = generateSeed(parsed);
  console.log(JSON.stringify(seed, null, 2));
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
