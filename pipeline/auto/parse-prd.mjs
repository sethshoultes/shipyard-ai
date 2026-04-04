#!/usr/bin/env node

/**
 * parse-prd.mjs — Calls the /parse endpoint on the PRD chat worker
 * Input: file path containing PRD text (or stdin)
 * Output: structured JSON to stdout
 */

import fs from 'fs';

const PARSE_ENDPOINT = 'https://shipyard-prd-chat.seth-a02.workers.dev/parse';

async function main() {
  // Read PRD text from file arg or stdin
  let prdText;
  if (process.argv[2]) {
    prdText = fs.readFileSync(process.argv[2], 'utf-8');
  } else {
    prdText = fs.readFileSync(0, 'utf-8');
  }

  if (!prdText.trim()) {
    console.error('Error: empty PRD input');
    process.exit(1);
  }

  console.error('Calling /parse endpoint...');
  
  const res = await fetch(PARSE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prd: prdText }),
  });

  if (!res.ok) {
    console.error(`Parse failed: HTTP ${res.status}`);
    // Fallback: extract basic info from the PRD text directly
    const fallback = extractBasicInfo(prdText);
    console.log(JSON.stringify(fallback, null, 2));
    process.exit(0);
  }

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

// Fallback parser if the Worker is down
function extractBasicInfo(text) {
  const lines = text.split('\n');
  const titleMatch = text.match(/(?:PRD:|Project:|Build|Site for)\s*(.+)/i);
  const businessName = titleMatch ? titleMatch[1].trim() : 'New Business';
  
  return {
    businessName,
    vertical: 'services',
    tagline: `Welcome to ${businessName}`,
    heroHeadline: businessName,
    heroSubheadline: lines.find(l => l.includes('Target') || l.includes('audience')) || `Professional services you can trust.`,
    features: [
      { title: 'Quality Service', description: 'Committed to excellence in everything we do.' },
      { title: 'Experienced Team', description: 'Years of expertise serving our community.' },
      { title: 'Customer First', description: 'Your satisfaction is our top priority.' },
    ],
    testimonials: [
      { quote: 'Outstanding service and attention to detail.', author: 'Happy Customer', role: 'Client' },
    ],
    faqItems: [
      { question: 'How do I get started?', answer: 'Contact us to schedule a consultation.' },
      { question: 'What are your hours?', answer: 'We are open Monday through Friday, 9am to 5pm.' },
    ],
  };
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
