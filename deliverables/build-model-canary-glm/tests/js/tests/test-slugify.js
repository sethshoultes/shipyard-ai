import { test, describe } from 'node:test';
import { slugify } from '../slugify.js';
import * as assert from 'node:assert';
describe('slugify', () => {
    test('converts "Hello World" to "hello-world"', () => {
        assert.strictEqual(slugify('Hello World'), 'hello-world');
    });
    test('converts "Foo  Bar!!!" to "foo-bar"', () => {
        assert.strictEqual(slugify('Foo  Bar!!!'), 'foo-bar');
    });
    test('converts "  trim me  " to "trim-me"', () => {
        assert.strictEqual(slugify('  trim me  '), 'trim-me');
    });
    test('converts "Multiple---Spaces" to "multiple-spaces"', () => {
        assert.strictEqual(slugify('Multiple---Spaces'), 'multiple-spaces');
    });
    test('handles empty string', () => {
        assert.strictEqual(slugify(''), '');
    });
    test('handles special characters', () => {
        assert.strictEqual(slugify('Special @#$% Characters'), 'special-characters');
    });
});
