import { describe, it, expect } from 'vitest';
import { evaluateExpectation } from './index.js';
import type { Expectation } from './index.js';

describe('@agentbench/core', () => {
  describe('evaluateExpectation', () => {
    describe('contains evaluator', () => {
      it('passes when output contains expected string', () => {
        const expectation: Expectation = {
          type: 'contains',
          value: 'refund',
        };
        const result = evaluateExpectation(expectation, 'Your refund has been processed.');
        expect(result.passed).toBe(true);
      });

      it('fails when output does not contain expected string', () => {
        const expectation: Expectation = {
          type: 'contains',
          value: 'refund',
        };
        const result = evaluateExpectation(expectation, 'Your order has been shipped.');
        expect(result.passed).toBe(false);
      });

      it('is case-insensitive', () => {
        const expectation: Expectation = {
          type: 'contains',
          value: 'REFUND',
        };
        const result = evaluateExpectation(expectation, 'Your refund has been processed.');
        expect(result.passed).toBe(true);
      });

      it('passes when any of multiple values match', () => {
        const expectation: Expectation = {
          type: 'contains',
          value: ['approved', 'confirmed', 'success'],
        };
        const result = evaluateExpectation(expectation, 'Your request has been confirmed.');
        expect(result.passed).toBe(true);
      });
    });

    describe('does_not_contain evaluator', () => {
      it('passes when output does not contain forbidden string', () => {
        const expectation: Expectation = {
          type: 'does_not_contain',
          value: 'error',
        };
        const result = evaluateExpectation(expectation, 'Request completed successfully.');
        expect(result.passed).toBe(true);
      });

      it('fails when output contains forbidden string', () => {
        const expectation: Expectation = {
          type: 'does_not_contain',
          value: 'error',
        };
        const result = evaluateExpectation(expectation, 'An error occurred during processing.');
        expect(result.passed).toBe(false);
      });

      it('fails when any of multiple forbidden values match', () => {
        const expectation: Expectation = {
          type: 'does_not_contain',
          value: ['error', 'failed', 'denied'],
        };
        const result = evaluateExpectation(expectation, 'Your request was denied.');
        expect(result.passed).toBe(false);
      });
    });

    describe('matches_intent evaluator', () => {
      it('returns skipped when ANTHROPIC_API_KEY is not set', () => {
        const originalKey = process.env.ANTHROPIC_API_KEY;
        delete process.env.ANTHROPIC_API_KEY;

        const expectation: Expectation = {
          type: 'matches_intent',
          intent: 'Response is helpful',
        };
        const result = evaluateExpectation(expectation, 'Thank you for your inquiry.');

        expect(result.skipped).toBe(true);
        expect(result.message).toContain('ANTHROPIC_API_KEY not set');

        if (originalKey) {
          process.env.ANTHROPIC_API_KEY = originalKey;
        }
      });
    });
  });
});
