#!/usr/bin/env node

/**
 * parse-prd.mjs — Parse PRD text into structured JSON for seed generation
 * Uses Workers AI /parse endpoint first, falls back to smart extraction
 */

import fs from 'fs';

const PARSE_ENDPOINT = 'https://shipyard-prd-chat.seth-a02.workers.dev/parse';

async function main() {
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

  // Try Workers AI first
  try {
    console.error('Calling /parse endpoint...');
    const res = await fetch(PARSE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prd: prdText }),
    });
    if (res.ok) {
      const data = await res.json();
      // Check if AI returned useful content (at least features)
      if (data.features && data.features.length > 0 && data.tagline) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }
    }
  } catch (e) {
    console.error('Workers AI unavailable, using smart extraction');
  }

  // Smart fallback — extract and GENERATE content from PRD text
  const result = smartParse(prdText);
  console.log(JSON.stringify(result, null, 2));
}

function smartParse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract business name
  const namePatterns = [
    /(?:site for|website for)\s+([A-Z][\w\s&']+?)(?:\s+in\s|\.|\,|$)/im,
    /(?:PRD:|Project:)\s*([A-Z][\w\s&']+?)(?:\s*[-—]|\.|\,|$)/im,
    /(?:Build|Create)\s+(?:an?\s+\w+\s+(?:site|website)\s+for\s+)?([A-Z][\w\s&']+?)(?:\s+in\s|\.|\,|$)/im,
  ];
  let businessName = 'New Business';
  for (const pat of namePatterns) {
    const m = text.match(pat);
    if (m) { businessName = m[1].trim(); break; }
  }

  // Extract location
  const locMatch = text.match(/in\s+([A-Z][\w\s]+,\s*[A-Z]{2})/i);
  const location = locMatch ? locMatch[1] : '';

  // Detect vertical
  const verticalMap = {
    restaurant: /restaurant|food|dining|menu|chef|kitchen/i,
    dental: /dental|dentist|teeth|smile|orthodont/i,
    salon: /salon|hair|beauty|spa|nail/i,
    yoga: /yoga|wellness|meditation|mindful/i,
    fitness: /fitness|gym|training|workout/i,
    portfolio: /portfolio|design|agency|creative/i,
  };
  let vertical = 'services';
  for (const [v, pat] of Object.entries(verticalMap)) {
    if (pat.test(text)) { vertical = v; break; }
  }

  // Extract pages
  const pageMatch = text.match(/pages?:\s*([^\n]+)/i);
  const pages = pageMatch 
    ? pageMatch[1].split(/[,&]/).map(p => p.trim().toLowerCase()).filter(Boolean)
    : ['home', 'pricing', 'contact'];

  // Extract design preferences
  const colorMatch = text.match(/(?:color|tone|palette|theme)[s]?[:\s]+([^\n.]+)/i);
  const designNote = colorMatch ? colorMatch[1].trim() : '';

  // Extract audience
  const audienceMatch = text.match(/(?:target|audience|for)[:\s]+([^\n.]+)/i);
  const audience = audienceMatch ? audienceMatch[1].trim() : 'local customers';

  // Generate content based on vertical
  const content = generateContent(businessName, vertical, location, audience, designNote);

  return {
    businessName,
    vertical,
    location,
    tagline: content.tagline,
    heroHeadline: content.heroHeadline,
    heroSubheadline: content.heroSubheadline,
    features: content.features,
    testimonials: content.testimonials,
    faqItems: content.faqItems,
    pages,
    primaryCta: { label: content.ctaLabel, url: '/contact' },
    secondaryCta: { label: 'Learn More', url: '/#features' },
  };
}

function generateContent(name, vertical, location, audience, designNote) {
  const templates = {
    yoga: {
      tagline: `Find your flow at ${name}`,
      heroHeadline: `Your practice starts here`,
      heroSubheadline: `${name}${location ? ' in ' + location : ''} offers yoga for every body. Whether you're a first-timer or an advanced practitioner, our classes meet you where you are. Come breathe, move, and grow with us.`,
      ctaLabel: 'Book a Class',
      features: [
        { title: 'Vinyasa Flow', description: 'Dynamic, breath-linked movement that builds strength and flexibility. All levels welcome.' },
        { title: 'Yin & Restorative', description: 'Slow, deep stretches held for minutes. Perfect for recovery, stress relief, and finding stillness.' },
        { title: 'Hot Yoga', description: 'Practice in a heated room to deepen stretches, detoxify, and build endurance. Bring water and a towel.' },
        { title: 'Community Classes', description: 'Weekly donation-based classes open to everyone. Yoga is for every body, every budget.' },
        { title: 'Private Sessions', description: 'One-on-one instruction tailored to your goals. Injury recovery, prenatal, or personal development.' },
        { title: 'Workshops & Retreats', description: 'Weekend workshops and seasonal retreats to deepen your practice and connect with community.' },
      ],
      testimonials: [
        { quote: `${name} changed my relationship with my body. The instructors are warm, knowledgeable, and never make you feel like you're not enough.`, author: 'Sarah M.', role: 'Member, 2 years' },
        { quote: 'I came for the hot yoga and stayed for the community. This studio feels like home.', author: 'David L.', role: 'Member, 1 year' },
        { quote: 'As a complete beginner, I was nervous. By the end of my first class, I was hooked. The vibe here is everything.', author: 'Priya K.', role: 'New Member' },
      ],
      faqItems: [
        { question: 'Do I need experience?', answer: 'Not at all. Every class offers modifications for all levels. Our instructors will help you find your edge without pushing past it.' },
        { question: 'What should I bring?', answer: 'Just yourself and a water bottle. We provide mats, blocks, straps, and blankets. For hot yoga, bring a towel.' },
        { question: 'How much does it cost?', answer: 'Drop-in classes are $20. Monthly unlimited is $99. We also offer a 10-class pack for $150. First class is always free.' },
        { question: 'Do you offer teacher training?', answer: 'Yes! We run 200-hour and 500-hour teacher training programs. Check our workshops page for upcoming dates.' },
      ],
    },
    restaurant: {
      tagline: `Taste what everyone's talking about`,
      heroHeadline: `Welcome to ${name}`,
      heroSubheadline: `${name}${location ? ' in ' + location : ''} — where every dish tells a story. Fresh ingredients, real technique, and the kind of care you can taste. Join us for lunch, dinner, or a night you'll remember.`,
      ctaLabel: 'Reserve a Table',
      features: [
        { title: 'Farm to Table', description: 'We source locally whenever possible. Our menu changes with the seasons because the best food follows nature.' },
        { title: 'Craft Cocktails', description: 'Our bar program is built on fresh ingredients, house-made syrups, and spirits worth sipping.' },
        { title: 'Private Dining', description: 'Host your next event in our private dining room. Custom menus, dedicated service, memorable nights.' },
        { title: 'Weekend Brunch', description: 'Saturday and Sunday, 10am to 2pm. The pancakes are worth waking up for.' },
      ],
      testimonials: [
        { quote: 'The best meal I\'ve had this year. Every course was a surprise.', author: 'James R.', role: 'Google Review' },
        { quote: 'We come here every anniversary. The food is incredible and the service makes you feel like family.', author: 'Maria & Tony', role: 'Regulars' },
      ],
      faqItems: [
        { question: 'Do you take reservations?', answer: 'Yes! Book online or call us. Walk-ins welcome on weeknights.' },
        { question: 'Do you accommodate dietary restrictions?', answer: 'Absolutely. Let your server know and we\'ll take care of you.' },
        { question: 'Is there parking?', answer: 'Street parking available. Valet on Friday and Saturday evenings.' },
      ],
    },
  };

  // Default template for any vertical not specifically handled
  const defaultTemplate = {
    tagline: `${name} — excellence in every detail`,
    heroHeadline: `Welcome to ${name}`,
    heroSubheadline: `${name}${location ? ' in ' + location : ''} is committed to providing outstanding service to ${audience}. We combine expertise with genuine care to deliver results that matter.`,
    ctaLabel: 'Get Started',
    features: [
      { title: 'Expert Team', description: 'Years of experience and a passion for what we do. Our team is here to serve you.' },
      { title: 'Quality First', description: 'We never cut corners. Every detail matters and every client deserves our best work.' },
      { title: 'Customer Focused', description: 'Your goals are our goals. We listen first, then deliver exactly what you need.' },
      { title: 'Proven Results', description: 'Hundreds of satisfied clients trust us. See what we can do for you.' },
      { title: 'Transparent Pricing', description: 'No hidden fees. No surprises. You know exactly what you\'re paying for.' },
      { title: 'Community Roots', description: `Proudly serving ${location || 'our community'}. We believe in building lasting relationships.` },
    ],
    testimonials: [
      { quote: `${name} exceeded every expectation. Professional, responsive, and genuinely great at what they do.`, author: 'Alex T.', role: 'Client' },
      { quote: 'I\'ve recommended them to everyone I know. The results speak for themselves.', author: 'Jessica M.', role: 'Client' },
      { quote: 'Finally, a team that actually listens. They understood what I needed before I could explain it.', author: 'Robert K.', role: 'Client' },
    ],
    faqItems: [
      { question: 'How do I get started?', answer: 'Just reach out through our contact form or give us a call. We\'ll schedule a free consultation to understand your needs.' },
      { question: 'What are your hours?', answer: 'We\'re open Monday through Friday, 9am to 6pm. Saturday by appointment.' },
      { question: 'Do you offer free consultations?', answer: 'Yes! Your first consultation is always free. No pressure, no obligation.' },
    ],
  };

  return templates[vertical] || defaultTemplate;
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
