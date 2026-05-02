#!/usr/bin/env node
'use strict';

const https = require('https');
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

const MAX_BACKOFF_MS = 60000; // 60 seconds max
const INITIAL_DELAY_MS = 1000;
const BACKOFF_MULTIPLIER = 2;

/**
 * Load domains configuration from domains.json
 */
function loadDomains() {
  const domainsPath = path.join(__dirname, '..', 'domains.json');
  const content = fs.readFileSync(domainsPath, 'utf8');
  return JSON.parse(content);
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
      // Fall back to A record
      const addresses = await dns.resolve4(domain);
      if (addresses && addresses.length > 0) {
        return addresses[0];
      }
    } catch (aErr) {
      throw new Error(`DNS resolution failed for ${domain}`);
    }
  }
  throw new Error(`Could not resolve origin for ${domain}`);
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
    const req = https.get(`https://${domain}/`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'shipyard-ai-proof/1.0'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Verify a single domain with exponential backoff retry logic
 */
async function verifyDomainWithRetry(domainConfig, attempt = 1, delay = INITIAL_DELAY_MS) {
  const { domain, expected_origin } = domainConfig;

  try {
    // Perform HTTPS request
    const httpResult = await httpsGet(domain);

    // Resolve DNS and validate origin
    const resolvedOrigin = await resolveOrigin(domain);

    if (!validateOrigin(resolvedOrigin, expected_origin)) {
      throw new Error(`Origin mismatch: got ${resolvedOrigin}, expected ${expected_origin}`);
    }

    // Success
    const timestamp = new Date().toISOString();
    console.log(`Verified ${domain} at ${timestamp}`);
    return { success: true, domain };
  } catch (error) {
    // Check if we should retry (within 60 second max backoff)
    if (delay < MAX_BACKOFF_MS) {
      const nextDelay = Math.min(delay * BACKOFF_MULTIPLIER, MAX_BACKOFF_MS);
      console.log(`Attempt ${attempt} failed for ${domain}: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return verifyDomainWithRetry(domainConfig, attempt + 1, nextDelay);
    }

    // Max retries exceeded - output plain English failure message
    console.log(`Failed to verify ${domain}: Your DNS points to the wrong place or the server is not responding.`);
    return { success: false, domain, error: error.message };
  }
}

/**
 * Verify all domains in parallel
 */
async function verifyAllDomains() {
  const domains = loadDomains();

  if (domains.length === 0) {
    console.log('No domains to verify');
    process.exit(0);
  }

  // Run all verifications in parallel
  const results = await Promise.allSettled(
    domains.map(config => verifyDomainWithRetry(config))
  );

  // Check results
  let allSuccess = true;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (!result.value.success) {
        allSuccess = false;
      }
    } else {
      // Promise rejected
      allSuccess = false;
      console.log(`Verification failed: ${result.reason?.message || 'Unknown error'}`);
    }
  }

  if (allSuccess) {
    console.log('All domains verified successfully');
    process.exit(0);
  } else {
    console.log('One or more domains failed verification');
    process.exit(1);
  }
}

// Main entry point
verifyAllDomains().catch((error) => {
  console.log('Verification failed: An unexpected error occurred');
  process.exit(1);
});
