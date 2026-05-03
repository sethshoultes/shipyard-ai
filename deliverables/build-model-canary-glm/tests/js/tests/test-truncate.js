import { test, describe } from 'node:test';
import { truncate } from '../truncate.js';
import * as assert from 'node:assert';
describe('truncate', () => {
    test('truncates "hello world" with max 5 to "hello…"', () => {
        assert.strictEqual(truncate('hello world', 5), 'hello…');
    });
    test('truncates at word boundary when possible', () => {
        assert.strictEqual(truncate('this is a longer sentence', 12), 'this is a…');
    });
    test('cuts mid-word when no space available', () => {
        assert.strictEqual(truncate('supercalifragilistic', 8), 'supercal…');
    });
    test('returns original string when max longer than input', () => {
        assert.strictEqual(truncate('short', 10), 'short');
    });
    test('handles empty string', () => {
        assert.strictEqual(truncate('', 5), '');
    });
    test('handles max length of 0', () => {
        assert.strictEqual(truncate('anything', 0), '…');
    });
    test('handles max length of 1', () => {
        assert.strictEqual(truncate('anything', 1), '…');
    });
});
