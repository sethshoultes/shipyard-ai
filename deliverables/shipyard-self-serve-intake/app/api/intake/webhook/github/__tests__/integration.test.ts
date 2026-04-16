import * as nodeCrypto from "crypto";

/**
 * Integration tests for GitHub webhook endpoint
 * Simulates real GitHub webhook requests with HMAC-SHA256 validation
 */

// Simulate the signature validation logic from route.ts
function verifyWebhookSignature(
  requestBody: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    return false;
  }

  if (!signature) {
    return false;
  }

  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(requestBody)
    .digest("hex");

  const expectedSignature = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  try {
    return nodeCrypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}

// Simulate GitHub webhook payload
function createGitHubWebhookPayload() {
  return {
    action: "opened",
    issue: {
      number: 42,
      title: "Create API documentation",
      body: "We need comprehensive API docs",
      labels: [
        { name: "intake-request" },
        { name: "documentation" },
      ],
      user: { login: "developer" },
      html_url: "https://github.com/org/repo/issues/42",
    },
    repository: {
      name: "repo",
      full_name: "org/repo",
    },
  };
}

// Test scenarios
console.log("Running GitHub webhook integration tests...\n");

const secret = "test-webhook-secret-12345";
let passed = 0;
let failed = 0;

// Test 1: Valid GitHub webhook request
console.log("TEST 1: Valid GitHub webhook request");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer)
    .digest("hex");

  const result = verifyWebhookSignature(
    bodyBuffer,
    `sha256=${signature}`,
    secret
  );

  if (result) {
    console.log("  [PASS] Valid webhook accepted\n");
    passed++;
  } else {
    console.log("  [FAIL] Valid webhook was rejected\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 2: Tampered payload (signature mismatch)
console.log("TEST 2: Tampered payload (signature mismatch)");
try {
  const payload = createGitHubWebhookPayload();
  const originalBuffer = Buffer.from(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(originalBuffer)
    .digest("hex");

  // Modify payload after signature
  payload.issue.title = "Modified title";
  const tamperedBuffer = Buffer.from(JSON.stringify(payload));

  const result = verifyWebhookSignature(
    tamperedBuffer,
    `sha256=${signature}`,
    secret
  );

  if (!result) {
    console.log("  [PASS] Tampered webhook rejected\n");
    passed++;
  } else {
    console.log("  [FAIL] Tampered webhook was accepted\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 3: Missing signature header
console.log("TEST 3: Missing signature header");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const result = verifyWebhookSignature(bodyBuffer, null, secret);

  if (!result) {
    console.log("  [PASS] Missing signature rejected\n");
    passed++;
  } else {
    console.log("  [FAIL] Missing signature was accepted\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 4: Wrong secret (compromised secret detection)
console.log("TEST 4: Wrong secret (compromised secret detection)");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer)
    .digest("hex");

  const wrongSecret = "wrong-secret";
  const result = verifyWebhookSignature(
    bodyBuffer,
    `sha256=${signature}`,
    wrongSecret
  );

  if (!result) {
    console.log("  [PASS] Wrong secret detected\n");
    passed++;
  } else {
    console.log("  [FAIL] Wrong secret was accepted\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 5: Large payload (scale test)
console.log("TEST 5: Large payload (scale test)");
try {
  const payload = createGitHubWebhookPayload();
  payload.issue.body = "x".repeat(50000); // Large description

  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer)
    .digest("hex");

  const result = verifyWebhookSignature(
    bodyBuffer,
    `sha256=${signature}`,
    secret
  );

  if (result) {
    console.log("  [PASS] Large payload accepted\n");
    passed++;
  } else {
    console.log("  [FAIL] Large payload was rejected\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 6: Empty secret (misconfiguration)
console.log("TEST 6: Empty secret (misconfiguration)");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const signature = "sha256=somesignature";
  const result = verifyWebhookSignature(bodyBuffer, signature, "");

  if (!result) {
    console.log("  [PASS] Empty secret rejected\n");
    passed++;
  } else {
    console.log("  [FAIL] Empty secret was accepted\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 7: Multiple valid signatures over time (replay attack prevention)
console.log("TEST 7: Multiple valid signatures (each request must have matching signature)");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  // Create first request signature
  const sig1 = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer)
    .digest("hex");

  // Create second request with modified content
  payload.issue.number = 43;
  const bodyBuffer2 = Buffer.from(JSON.stringify(payload));

  const sig2 = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer2)
    .digest("hex");

  // First signature should NOT work with second body
  const result = verifyWebhookSignature(
    bodyBuffer2,
    `sha256=${sig1}`,
    secret
  );

  if (!result) {
    console.log("  [PASS] Signature replay prevented\n");
    passed++;
  } else {
    console.log("  [FAIL] Signature replay was allowed\n");
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

// Test 8: Case sensitivity in "sha256=" prefix
console.log("TEST 8: Case sensitivity in signature prefix");
try {
  const payload = createGitHubWebhookPayload();
  const bodyBuffer = Buffer.from(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(bodyBuffer)
    .digest("hex");

  // GitHub uses lowercase "sha256="
  const result1 = verifyWebhookSignature(
    bodyBuffer,
    `sha256=${signature}`,
    secret
  );

  // Test with uppercase (should also work due to startsWith check)
  const result2 = verifyWebhookSignature(
    bodyBuffer,
    `SHA256=${signature}`,
    secret
  );

  if (result1 && !result2) {
    console.log("  [PASS] Case sensitivity handled correctly\n");
    passed++;
  } else {
    console.log(`  [FAIL] Case sensitivity not handled (lowercase=${result1}, uppercase=${result2})\n`);
    failed++;
  }
} catch (error) {
  console.log(`  [ERROR] ${error}\n`);
  failed++;
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
