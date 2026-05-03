// parser.test.mjs — Real parser unit tests for Promptfolio
import { parseClaudeExport } from '../promptfolio/src/parser/claude.js';
import { validateClaudeExport } from '../promptfolio/src/parser/schema.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`FAIL: ${name} — ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// Test 1: Valid Claude JSON parsing
test('Valid Claude JSON parsing', () => {
  const json = JSON.stringify({
    conversation: {
      id: 'conv-1',
      title: 'Hello World',
      created_at: '2024-01-01T00:00:00Z',
      messages: [{ role: 'user', content: 'Hello' }]
    }
  });
  const result = parseClaudeExport(json);
  assert(result.title === 'Hello World', 'Expected title');
  assert(result.prompts.length === 1, 'Expected one prompt');
  assert(result.prompts[0].body === 'Hello', 'Expected body');
});

// Test 2: Markdown fence stripping
test('Markdown fence stripping', () => {
  const payload = JSON.stringify({ conversation: { messages: [] } });
  const fenced = '```json\n' + payload + '\n```';
  const result = parseClaudeExport(fenced);
  assert(Array.isArray(result.prompts), 'Expected prompts array');
});

// Test 3: Truncated JSON handling
test('Truncated JSON handling', () => {
  const truncated = '{"conversation": {"messages": [{"role":';
  const result = parseClaudeExport(truncated);
  assert(result.title === 'Raw Text Import', 'Expected raw text fallback title');
});

// Test 4: Empty file handling
test('Empty file handling', () => {
  let threw = false;
  try {
    parseClaudeExport('');
  } catch (e) {
    threw = true;
    assert(e.message.includes('Empty file'), 'Expected empty file error');
  }
  assert(threw, 'Expected an error to be thrown');
});

// Test 5: Missing prompts array
test('Missing prompts array', () => {
  const json = JSON.stringify({ conversation: { id: '1', title: 'No Messages' } });
  const result = parseClaudeExport(json);
  assert(result.title === 'Raw Text Import', 'Expected raw text fallback');
});

// Test 6: Base64 image extraction
test('Base64 image extraction', () => {
  const json = JSON.stringify({
    conversation: {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'iVBORw0KGgo=' } },
            { type: 'text', text: 'Here is an image' }
          ]
        }
      ]
    }
  });
  const result = parseClaudeExport(json);
  assert(result.images.length === 1, 'Expected one image');
  assert(result.images[0].mediaType === 'image/png', 'Expected image/png');
  assert(result.images[0].data === 'iVBORw0KGgo=', 'Expected base64 data');
});

// Test 7: Schema validation
test('Schema validation', () => {
  const valid = { conversation: { messages: [{ role: 'user', content: 'Hi' }] } };
  const invalid = { conversation: {} };
  const v1 = validateClaudeExport(valid);
  const v2 = validateClaudeExport(invalid);
  assert(v1.valid === true, 'Valid schema should be valid');
  assert(v2.valid === false, 'Invalid schema should be invalid');
});

// Test 8: Raw text fallback for unknown schema
test('Raw text fallback for unknown schema', () => {
  const text = 'This is just plain text without any JSON structure.';
  const result = parseClaudeExport(text);
  assert(result.title === 'Raw Text Import', 'Expected raw text fallback');
  assert(result.prompts.length > 0, 'Expected at least one prompt block');
});

// Test 9: 5 MB file size cap enforcement
test('5 MB file size cap enforcement', () => {
  const json = JSON.stringify({ conversation: { messages: [{ role: 'user', content: 'x' }] } });
  let threw = false;
  try {
    parseClaudeExport(json, 6 * 1024 * 1024);
  } catch (e) {
    threw = true;
    assert(e.message.includes('5 MB'), 'Expected 5 MB limit error');
  }
  assert(threw, 'Expected an error to be thrown');
});

// Test 10: Nested prompt structure
test('Nested prompt structure', () => {
  const json = JSON.stringify({
    nested: {
      deep: {
        conversation: {
          messages: [{ role: 'assistant', content: 'Nested message' }]
        }
      }
    }
  });
  const result = parseClaudeExport(json);
  assert(result.prompts.some(p => p.body === 'Nested message'), 'Expected nested message extraction');
});

console.log(`TOTAL_PASSED=${passed}`);
console.log(`TOTAL_FAILED=${failed}`);

if (failed > 0) {
  process.exit(1);
}
