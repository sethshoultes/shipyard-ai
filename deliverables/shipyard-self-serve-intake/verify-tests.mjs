import fs from 'fs';

console.log("Verifying event-parser test coverage...\n");

const testCode = fs.readFileSync('./lib/intake/__tests__/event-parser.test.ts', 'utf-8');

const checks = [
  { name: "Valid payloads test suite", pattern: "describe.*Valid Payloads" },
  { name: "Parse payload with all fields", pattern: "should parse a valid payload with all fields" },
  { name: "Parse payload without body (undefined)", pattern: "should parse payload without body" },
  { name: "Parse payload with empty body", pattern: "should parse payload with empty body" },
  { name: "Extract multiple labels test", pattern: "should extract multiple labels" },
  { name: "Handle missing user field", pattern: "should handle missing user" },
  { name: "Edge cases test suite", pattern: "describe.*Edge Cases" },
  { name: "Emoji-only body test", pattern: "should handle emoji-only body" },
  { name: "Markdown links test", pattern: "should extract text from markdown links" },
  { name: "HTML links test", pattern: "should extract text from HTML links" },
  { name: "Validation errors test suite", pattern: "describe.*Validation Errors" },
  { name: "Missing title validation", pattern: "should throw ValidationError when.*title" },
  { name: "Empty title validation", pattern: "should throw ValidationError when title is empty" },
  { name: "Missing repo_name validation", pattern: "should throw ValidationError when repo_name" },
  { name: "ValidationError class tests", pattern: "describe.*ValidationError" },
  { name: "isValidWebhookPayload tests", pattern: "describe.*isValidWebhookPayload" },
  { name: "Integration tests", pattern: "describe.*Integration Tests" },
  { name: "Realistic payload test", pattern: "should handle a realistic GitHub issue payload" },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const regex = new RegExp(check.pattern, 'i');
  if (regex.test(testCode)) {
    console.log(`✓ ${check.name}`);
    passed++;
  } else {
    console.log(`✗ ${check.name}`);
    failed++;
  }
});

console.log(`\n=== Test Coverage Summary ===`);
console.log(`Checks passed: ${passed}/${checks.length}`);

if (failed === 0) {
  console.log("✓ All verification checks passed!");
} else {
  console.log(`✗ ${failed} checks failed`);
  process.exit(1);
}
