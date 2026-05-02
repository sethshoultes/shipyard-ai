#!/usr/bin/env node
'use strict';

const https = require('https');
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

/**
 * Load domains configuration from domains.json or PROOF_DOMAINS_PATH env var
 */
function loadDomains() {
  const domainsPath = process.env.PROOF_DOMAINS_PATH
    ? path.resolve(process.cwd(), process.env.PROOF_DOMAINS_PATH)
    : path.join(__dirname, '..', 'domains.json');

  if (!fs.existsSync(domainsPath)) {
    console.log('Configuration file not found: ' + domainsPath);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(domainsPath, 'utf8');
  } catch (err) {
    console.log('Failed to read configuration file: ' + err.message);
    process.exit(1);
  }

  let domains;
  try {
    domains = JSON.parse(content);
  } catch (err) {
    console.log('Invalid JSON in configuration file: ' + err.message);
    process.exit(1);
  }

  return domains;
}

/**
 * Resolve DNS CNAME or A record for a domain to get the origin
 */
async function resolveOrigin(domain) {
  try {
    // Try CNAME first
    const cname = await dns.resolveCname(domain);
    return cname;
  } catch (cnameErr) {
    try {
      // Fall back to A record for apex domains
      const addresses = await dns.resolve4(domain);
      if (addresses && addresses.length > 0) {
        return addresses[0];
      }
    } catch (aErr) {
      throw new Error('DNS resolution failed');
    }
  }
  throw new Error('Could not resolve origin');
}

/**
 * Check if the resolved origin matches the expected origin
 */
function validateOrigin(resolved, expected) {
  if (!resolved || !expected) {
    return false;
  }
  const resolvedLower = resolved.toLowerCase();
  const expectedLower = expected.toLowerCase();
  return resolvedLower.includes(expectedLower) || expectedLower.includes(resolvedLower);
}

/**
 * Perform HTTPS GET request to verify the domain responds
 */
function httpsGet(domain) {
  return new Promise((resolve, reject) => {
    const req = https.get('https://' + domain + '/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Shipyard-Proof/1.0'
      }
    }, (res) => {
      // Collect headers for Cloudflare validation
      const headers = res.headers;

      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }

      // Check for Cloudflare headers (CF-RAY or Server: cloudflare)
      const hasCfRay = !!headers['cf-ray'];
      const serverHeader = (headers['server'] || '').toLowerCase();
      const hasCloudflareServer = serverHeader.includes('cloudflare');

      if (!hasCfRay && !hasCloudflareServer) {
        reject(new Error('Missing Cloudflare headers'));
        return;
      }

      resolve({ statusCode: res.statusCode, headers: headers });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Verify a single domain - fail fast, no retry
 */
async function verifyDomain(domainConfig) {
  const { domain, expected_origin } = domainConfig;

  try {
    // Perform HTTPS request with Cloudflare header validation
    await httpsGet(domain);

    // Resolve DNS and validate origin
    const resolvedOrigin = await resolveOrigin(domain);

    if (!validateOrigin(resolvedOrigin, expected_origin)) {
      throw new Error('Origin mismatch');
    }

    // Success - print verification message with ISO8601 timestamp
    const timestamp = new Date().toISOString();
    console.log('Verified ' + domain + ' ' + timestamp);
    return { success: true, domain: domain };
  } catch (error) {
    // Fail fast - one plain-English sentence, no stack traces
    console.log('Failed to verify ' + domain + ': ' + error.message + '.');
    return { success: false, domain: domain, error: error.message };
  }
}

/**
 * Verify all domains in parallel using Promise.all
 */
async function verifyAllDomains() {
  const domains = loadDomains();

  if (!Array.isArray(domains) || domains.length === 0) {
    console.log('No domains to verify');
    process.exit(0);
  }

  // Run all verifications in parallel with Promise.all
  const results = await Promise.all(
    domains.map(function(config) {
      return verifyDomain(config);
    })
  );

  // Check results - fail fast on first failure
  for (let i = 0; i < results.length; i++) {
    if (!results[i].success) {
      console.log('Deploy verification failed');
      process.exit(1);
    }
  }

  console.log('All domains verified successfully');
  process.exit(0);
}

// Main entry point
verifyAllDomains().catch(function(error) {
  console.log('Verification failed: An unexpected error occurred.');
  process.exit(1);
});
