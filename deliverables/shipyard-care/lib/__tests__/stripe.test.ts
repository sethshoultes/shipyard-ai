/**
 * Unit Tests for Stripe Module
 * Requirement: REQ-001 - Unit tests for stripe.ts
 */

import {
  getStripeClient,
  resetStripeClient,
  generateIdempotencyKey,
  handleStripeError,
  SubscriptionStatus,
} from '../stripe';

// Mock Stripe
jest.mock('stripe', () => {
  const mockStripe = jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));

  // Mock Stripe error classes
  mockStripe.errors = {
    StripeCardError: class StripeCardError extends Error {
      code: string;
      constructor(message: string, code?: string) {
        super(message);
        this.code = code || 'card_error';
        this.name = 'StripeCardError';
      }
    },
    StripeInvalidRequestError: class StripeInvalidRequestError extends Error {
      code: string;
      constructor(message: string, code?: string) {
        super(message);
        this.code = code || 'invalid_request_error';
        this.name = 'StripeInvalidRequestError';
      }
    },
    StripeAPIError: class StripeAPIError extends Error {
      code: string;
      constructor(message: string, code?: string) {
        super(message);
        this.code = code || 'api_error';
        this.name = 'StripeAPIError';
      }
    },
  };

  return mockStripe;
});

describe('Stripe Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    resetStripeClient();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getStripeClient', () => {
    it('should throw error when STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => getStripeClient()).toThrow(
        'STRIPE_SECRET_KEY environment variable is not set'
      );
    });

    it('should initialize Stripe client with test key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const client = getStripeClient();

      expect(client).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Stripe] Initialized in test mode'
      );

      consoleSpy.mockRestore();
    });

    it('should initialize Stripe client with live key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_live_1234567890';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const client = getStripeClient();

      expect(client).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Stripe] Initialized in live mode'
      );

      consoleSpy.mockRestore();
    });

    it('should return singleton instance', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890';

      const client1 = getStripeClient();
      const client2 = getStripeClient();

      expect(client1).toBe(client2);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate a valid UUID', () => {
      const key = generateIdempotencyKey();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(key).toMatch(uuidRegex);
    });

    it('should generate unique keys', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        keys.add(generateIdempotencyKey());
      }

      expect(keys.size).toBe(1000);
    });
  });

  describe('handleStripeError', () => {
    it('should handle StripeCardError', () => {
      const Stripe = require('stripe');
      const error = new Stripe.errors.StripeCardError(
        'Card declined',
        'card_declined'
      );

      const result = handleStripeError(error);

      expect(result.type).toBe('card_error');
      expect(result.code).toBe('card_declined');
      expect(result.message).toBe('Card declined');
      expect(result.userMessage).toContain('card was declined');
    });

    it('should handle StripeInvalidRequestError', () => {
      const Stripe = require('stripe');
      const error = new Stripe.errors.StripeInvalidRequestError(
        'Invalid parameter',
        'parameter_invalid'
      );

      const result = handleStripeError(error);

      expect(result.type).toBe('validation_error');
      expect(result.code).toBe('parameter_invalid');
      expect(result.userMessage).toContain('issue with your request');
    });

    it('should handle StripeAPIError', () => {
      const Stripe = require('stripe');
      const error = new Stripe.errors.StripeAPIError(
        'API error',
        'api_connection_error'
      );

      const result = handleStripeError(error);

      expect(result.type).toBe('api_error');
      expect(result.code).toBe('api_connection_error');
      expect(result.userMessage).toContain('payment processing error');
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');

      const result = handleStripeError(error);

      expect(result.type).toBe('unknown_error');
      expect(result.code).toBe('unknown_error');
      expect(result.message).toBe('Something went wrong');
      expect(result.userMessage).toContain('unexpected error occurred');
    });

    it('should handle unknown error types', () => {
      const error = 'just a string';

      const result = handleStripeError(error);

      expect(result.type).toBe('unknown_error');
      expect(result.code).toBe('unknown_error');
      expect(result.message).toBe('Unknown error');
    });

    it('should handle null error', () => {
      const result = handleStripeError(null);

      expect(result.type).toBe('unknown_error');
      expect(result.code).toBe('unknown_error');
    });

    it('should handle undefined error', () => {
      const result = handleStripeError(undefined);

      expect(result.type).toBe('unknown_error');
      expect(result.code).toBe('unknown_error');
    });
  });

  describe('SubscriptionStatus enum', () => {
    it('should have all expected status values', () => {
      expect(SubscriptionStatus.TRIALING).toBe('trialing');
      expect(SubscriptionStatus.ACTIVE).toBe('active');
      expect(SubscriptionStatus.INCOMPLETE).toBe('incomplete');
      expect(SubscriptionStatus.INCOMPLETE_EXPIRED).toBe('incomplete_expired');
      expect(SubscriptionStatus.PAST_DUE).toBe('past_due');
      expect(SubscriptionStatus.CANCELED).toBe('canceled');
      expect(SubscriptionStatus.UNPAID).toBe('unpaid');
    });
  });
});
