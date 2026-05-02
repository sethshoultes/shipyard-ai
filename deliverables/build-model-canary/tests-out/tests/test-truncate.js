import { describe, it } from 'node:test';
import assert from 'node:assert';
import { truncate } from './truncate.js';
describe('truncate', () => {
    it('truncates "hello world" at maxLength 5 to "hello…" (word boundary)', () => {
        assert.strictEqual(truncate('hello world', 5), 'hello…');
    });
    it('truncates "hello world" at maxLength 4 to "hell…" (hard cut)', () => {
        assert.strictEqual(truncate('hello world', 4), 'hell…');
    });
    it('returns "short" unchanged when maxLength is 10', () => {
        assert.strictEqual(truncate('short', 10), 'short');
    });
    it('returns empty string unchanged', () => {
        assert.strictEqual(truncate('', 5), '');
    });
    it('truncates "supercalifragilisticexpialidocious" at maxLength 5 to "super…" (hard cut)', () => {
        assert.strictEqual(truncate('supercalifragilisticexpialidocious', 5), 'super…');
    });
    it('returns "…" when maxLength is 0', () => {
        assert.strictEqual(truncate('hello world', 0), '…');
    });
    it('returns "…" when maxLength is negative', () => {
        assert.strictEqual(truncate('hello world', -1), '…');
    });
});
