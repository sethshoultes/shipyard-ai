#!/usr/bin/env node

/**
 * parse-prd.mjs
 *
 * Takes a GitHub issue body and calls the Shipyard PRD parser Worker
 * to extract structured data: businessName, vertical, tagline, heroHeadline,
 * features[], testimonials[], faqItems[]
 */

import https from 'https';

const PARSER_ENDPOINT = 'https://shipyard-prd-chat.seth-a02.workers.dev/';

/**
 * Makes a POST request to the parser endpoint
 */
function parseWithWorker(issueBody) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      issueBody
    });

    const options = {
      hostname: 'shipyard-prd-chat.seth-a02.workers.dev',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse worker response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Main entry point
 */
async function main() {
  const issueBody = process.argv[2];

  if (!issueBody) {
    console.error('Usage: node parse-prd.mjs "<issue-body>"');
    process.exit(1);
  }

  try {
    console.error('Calling Shipyard PRD parser...');
    const parsed = await parseWithWorker(issueBody);

    // Output structured JSON to stdout
    console.log(JSON.stringify(parsed, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error parsing PRD:', err.message);
    process.exit(1);
  }
}

main();
