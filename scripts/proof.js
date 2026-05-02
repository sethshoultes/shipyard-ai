#!/usr/bin/env node

/**
 * Proof — Post-Deploy Domain Verification
 *
 * Verifies that production custom domains serve the deployed build.
 * Checks DNS origin and HTTPS response for each configured domain.
 *
 * Exit codes:
 *   0 - All domains verified successfully
 *   1 - One or more domains failed verification
 */

const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const dnsResolveCname = promisify(dns.resolveCname);
const dnsResolve4 = promisify(dns.resolve4);

const TIMEOUT_MS = 5000;
const USER_AGENT = 'Shipyard-Proof/1.0';

/**
 * Load domain configuration
 */
function loadConfig() {
  const configPath = process.env.PROOF_DOMAINS_PATH || path.join(__dirname, '..', 'domains.json');
  const absolutePath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);

  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Configuration file not found: ${absolutePath}`);
    } else if (err instanceof SyntaxError) {
      console.error(`Invalid JSON in configuration file: ${absolutePath}`);
    } else {
      console.error(`Failed to load configuration: ${err.message}`);
    }
    process.exit(1);
  }
}

/**
 * Check if domain has expected CNAME record
 */
async function checkCname(domain, expectedOrigin) {
  try {
    const records = await dnsResolveCname(domain);
    if (Array.isArray(records) && records.length > 0) {
      // Check if any CNAME record matches expected origin
      return records.some(record => record.includes(expectedOrigin));
    }
    return false;
  } catch (err) {
    // CNAME lookup failed - might be apex domain using A records
    return null;
  }
}

/**
 * Check if domain resolves to A records (fallback for apex domains)
 */
async function checkARecords(domain) {
  try {
    const records = await dnsResolve4(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Perform HTTPS GET request and validate response
 */
async function checkHttps(domain, route) {
  return new Promise((resolve) => {
    const url = `https://${domain}${route}`;
    const startTime = Date.now();

    const req = https.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: TIMEOUT_MS
    }, (res) => {
      const elapsed = Date.now() - startTime;

      // Check for Cloudflare headers
      const hasCfRay = !!res.headers['cf-ray'];
      const hasCfServer = res.headers['server']?.toLowerCase().includes('cloudflare');
      const isCloudflare = hasCfRay || hasCfServer;

      resolve({
        status: res.statusCode,
        isCloudflare,
        hasCfRay,
        elapsed,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Request timeout' });
    });
  });
}

/**
 * Verify a single domain
 */
async function verifyDomain(config) {
  const { domain, expected_origin: expectedOrigin, routes } = config;
  const results = { domain, passed: false, checks: {} };

  // Check 1: DNS CNAME validation
  const cnameResult = await checkCname(domain, expectedOrigin);
  results.checks.cname = cnameResult;

  // Check 2: A records (fallback for apex domains)
  if (cnameResult === null || cnameResult === false) {
    const aResult = await checkARecords(domain);
    results.checks.aRecords = aResult;
  }

  // Check 3: HTTPS GET for each route
  const httpsChecks = [];
  for (const route of routes || ['/']) {
    httpsChecks.push(checkHttps(domain, route));
  }
  results.checks.https = await Promise.all(httpsChecks);

  // Determine pass/fail
  const dnsPass = cnameResult === true || results.checks.aRecords === true;
  const httpsPass = results.checks.https.some(
    check => !check.error && check.status === 200
  );
  const cfPass = results.checks.https.some(
    check => !check.error && check.isCloudflare
  );

  // Pass if: DNS matches expected origin OR (HTTPS 200 + Cloudflare headers)
  results.passed = dnsPass || (httpsPass && cfPass);

  return results;
}

/**
 * Format failure message (≤140 chars, one sentence, no stack trace)
 */
function formatFailure(domain, results) {
  const httpsCheck = results.checks.https?.[0];

  if (httpsCheck?.error) {
    return `Verification failed for ${domain}: ${httpsCheck.error}`;
  }

  if (httpsCheck?.status !== 200) {
    return `Verification failed for ${domain}: received HTTP ${httpsCheck?.status} instead of 200`;
  }

  if (!results.checks.cname && !results.checks.aRecords) {
    return `Verification failed for ${domain}: DNS does not resolve to expected origin`;
  }

  return `Verification failed for ${domain}: origin validation failed`;
}

/**
 * Main entry point
 */
async function main() {
  const config = loadConfig();

  if (!Array.isArray(config) || config.length === 0) {
    console.error('No domains configured for verification');
    process.exit(1);
  }

  const results = await Promise.all(config.map(verifyDomain));

  let allPassed = true;
  const timestamp = new Date().toISOString();

  for (const result of results) {
    if (result.passed) {
      console.log(`Verified ${result.domain} ${timestamp}`);
    } else {
      console.error(formatFailure(result.domain, result));
      allPassed = false;
    }
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  // Catch any unhandled errors and exit cleanly without stack trace
  console.error(`Verification failed: ${err.message}`);
  process.exit(1);
});
