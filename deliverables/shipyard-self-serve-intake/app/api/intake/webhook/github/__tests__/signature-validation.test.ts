import * as nodeCrypto from "crypto";

/**
 * Tests for webhook signature validation
 * Verifies HMAC-SHA256 validation against GitHub webhook signatures
 */

// Helper function that matches the implementation
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

  const computedSignature = nodeCrypto
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

// Run tests
console.log("Running webhook signature validation tests...\n");

const secret = "test-secret-key-12345";

const tests = [
  {
    name: "Valid signature with sha256= prefix",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      const signatureHeader = `sha256=${expectedSignature}`;
      return verifyWebhookSignature(body, signatureHeader, secret);
    },
    shouldPass: true,
  },
  {
    name: "Valid signature without prefix",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      return verifyWebhookSignature(body, expectedSignature, secret);
    },
    shouldPass: true,
  },
  {
    name: "Missing signature header",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      return verifyWebhookSignature(body, null, secret);
    },
    shouldPass: false,
  },
  {
    name: "Invalid signature",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const wrongSignature =
        "sha256=0000000000000000000000000000000000000000000000000000000000000000";
      return verifyWebhookSignature(body, wrongSignature, secret);
    },
    shouldPass: false,
  },
  {
    name: "Empty secret",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const signature =
        "sha256=0000000000000000000000000000000000000000000000000000000000000000";
      return verifyWebhookSignature(body, signature, "");
    },
    shouldPass: false,
  },
  {
    name: "Signature from different body",
    fn: () => {
      const body1 = Buffer.from(JSON.stringify({ action: "opened" }));
      const body2 = Buffer.from(JSON.stringify({ action: "closed" }));
      const signature = crypto
        .createHmac("sha256", secret)
        .update(body1)
        .digest("hex");
      return verifyWebhookSignature(body2, `sha256=${signature}`, secret);
    },
    shouldPass: false,
  },
  {
    name: "Signature with different secret",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const correctSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      const wrongSecret = "wrong-secret";
      return verifyWebhookSignature(
        body,
        `sha256=${correctSignature}`,
        wrongSecret
      );
    },
    shouldPass: false,
  },
  {
    name: "Signature with incorrect length",
    fn: () => {
      const body = Buffer.from(JSON.stringify({ action: "opened" }));
      const tooShortSignature = "sha256=00000000";
      return verifyWebhookSignature(body, tooShortSignature, secret);
    },
    shouldPass: false,
  },
  {
    name: "Empty request body with valid signature",
    fn: () => {
      const body = Buffer.from("");
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      return verifyWebhookSignature(body, `sha256=${expectedSignature}`, secret);
    },
    shouldPass: true,
  },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    const result = test.fn();
    const success = result === test.shouldPass;

    if (success) {
      console.log(`[PASS] ${test.name}`);
      passed++;
    } else {
      console.log(
        `[FAIL] ${test.name} - Expected ${test.shouldPass}, got ${result}`
      );
      failed++;
    }
  } catch (error) {
    console.log(`[ERROR] ${test.name} - ${error}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
