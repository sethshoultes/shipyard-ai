/**
 * Simple test script to verify event parser functionality
 */

import {
  parseGitHubWebhook,
  ValidationError,
  isValidWebhookPayload,
} from "./lib/intake/event-parser";

function runTests() {
  let passed = 0;
  let failed = 0;

  // Helper function to create a valid payload
  function createValidPayload(overrides: any = {}): any {
    return {
      action: "opened",
      issue: {
        number: 123,
        title: "Test Issue",
        body: "This is a test issue",
        labels: [{ name: "intake-request" }],
        user: { login: "test-user" },
        html_url: "https://github.com/test/repo/issues/123",
        ...overrides?.issue,
      },
      repository: {
        name: "repo",
        full_name: "test/repo",
        ...overrides?.repository,
      },
      ...overrides,
    };
  }

  function test(name: string, fn: () => boolean | void) {
    try {
      const result = fn();
      if (result === false) {
        console.log(`❌ FAIL: ${name}`);
        failed++;
      } else {
        console.log(`✓ PASS: ${name}`);
        passed++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${(error as Error).message}`);
      failed++;
    }
  }

  console.log("\n=== Testing GitHub Webhook Event Parser ===\n");

  // Test 1: Parse valid payload
  test("Parse valid payload with all fields", () => {
    const payload = createValidPayload();
    const result = parseGitHubWebhook(payload);
    return (
      result.issue_id === 123 &&
      result.title === "Test Issue" &&
      result.body === "This is a test issue" &&
      result.labels.includes("intake-request") &&
      result.created_by === "test-user" &&
      result.repo_name === "test/repo"
    );
  });

  // Test 2: Handle empty body
  test("Handle empty body gracefully", () => {
    const payload = createValidPayload({ issue: { body: "" } });
    const result = parseGitHubWebhook(payload);
    return result.body === "";
  });

  // Test 3: Handle undefined body
  test("Handle undefined body as empty string", () => {
    const payload = createValidPayload({ issue: { body: undefined } });
    const result = parseGitHubWebhook(payload);
    return result.body === "";
  });

  // Test 4: Extract markdown links
  test("Extract text from markdown links", () => {
    const payload = createValidPayload({
      issue: {
        body: "Check out [documentation](https://example.com/docs) for details",
      },
    });
    const result = parseGitHubWebhook(payload);
    return result.body === "Check out documentation for details";
  });

  // Test 5: Extract multiple labels
  test("Extract multiple labels", () => {
    const payload = createValidPayload({
      issue: {
        labels: [
          { name: "intake-request" },
          { name: "bug" },
          { name: "p0" },
        ],
      },
    });
    const result = parseGitHubWebhook(payload);
    return (
      result.labels.length === 3 &&
      result.labels.includes("intake-request") &&
      result.labels.includes("bug") &&
      result.labels.includes("p0")
    );
  });

  // Test 6: Handle missing user
  test("Handle missing user field (default to unknown)", () => {
    const payload = createValidPayload({ issue: { user: undefined } });
    const result = parseGitHubWebhook(payload);
    return result.created_by === "unknown";
  });

  // Test 7: Validate required fields - missing title
  test("Throw ValidationError when title is missing", () => {
    const payload = createValidPayload({ issue: { title: undefined } });
    try {
      parseGitHubWebhook(payload);
      return false;
    } catch (error) {
      return error instanceof ValidationError;
    }
  });

  // Test 8: Validate required fields - empty title
  test("Throw ValidationError when title is empty", () => {
    const payload = createValidPayload({ issue: { title: "" } });
    try {
      parseGitHubWebhook(payload);
      return false;
    } catch (error) {
      return error instanceof ValidationError;
    }
  });

  // Test 9: Validate required fields - missing repo_name
  test("Throw ValidationError when repo_name is missing", () => {
    const payload = createValidPayload({ repository: { full_name: "" } });
    try {
      parseGitHubWebhook(payload);
      return false;
    } catch (error) {
      return error instanceof ValidationError;
    }
  });

  // Test 10: Store raw content
  test("Store raw_content unchanged for audit trail", () => {
    const payload = createValidPayload();
    const result = parseGitHubWebhook(payload);
    return result.raw_content === JSON.stringify(payload.issue);
  });

  // Test 11: Validate payload structure
  test("isValidWebhookPayload returns true for valid payload", () => {
    const payload = createValidPayload();
    return isValidWebhookPayload(payload) === true;
  });

  // Test 12: Reject invalid payload structure
  test("isValidWebhookPayload returns false for invalid payload", () => {
    const payload = { invalid: "data" };
    return isValidWebhookPayload(payload) === false;
  });

  // Test 13: Handle empty labels array
  test("Handle empty labels array", () => {
    const payload = createValidPayload({ issue: { labels: [] } });
    const result = parseGitHubWebhook(payload);
    return result.labels.length === 0;
  });

  // Test 14: Handle missing labels
  test("Handle missing labels (undefined)", () => {
    const payload = createValidPayload({ issue: { labels: undefined } });
    const result = parseGitHubWebhook(payload);
    return result.labels.length === 0;
  });

  // Test 15: Handle HTML links
  test("Extract text from HTML links", () => {
    const payload = createValidPayload({
      issue: {
        body: 'See <a href="https://example.com">the guide</a> for info',
      },
    });
    const result = parseGitHubWebhook(payload);
    return result.body === "See the guide for info";
  });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
