import { describe, it } from 'node:test';
import assert from 'node:assert';
import { slugify } from './slugify.js';
describe('slugify', () => {
    it('converts "Hello World" to "hello-world"', () => {
        assert.strictEqual(slugify('Hello World'), 'hello-world');
    });
    it('converts "Foo  Bar!!!" to "foo-bar"', () => {
        assert.strictEqual(slugify('Foo  Bar!!!'), 'foo-bar');
    });
    it('trims whitespace and converts "  trim me  " to "trim-me"', () => {
        assert.strictEqual(slugify('  trim me  '), 'trim-me');
    });
});
