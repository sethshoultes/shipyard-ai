import { describe, it, expect } from 'vitest';
import {
  isSubprocessAgent,
  isHttpAgent,
  SCHEMA_VERSION,
  DEFAULT_TIMEOUT,
  EXIT_CODES,
} from './index.js';

describe('@agentbench/data', () => {
  describe('isSubprocessAgent', () => {
    it('returns true for subprocess config', () => {
      const config = { command: 'node agent.js' };
      expect(isSubprocessAgent(config)).toBe(true);
    });

    it('returns false for HTTP config', () => {
      const config = { endpoint: 'http://localhost:3000' };
      expect(isSubprocessAgent(config)).toBe(false);
    });
  });

  describe('isHttpAgent', () => {
    it('returns true for HTTP config', () => {
      const config = { endpoint: 'http://localhost:3000' };
      expect(isHttpAgent(config)).toBe(true);
    });

    it('returns false for subprocess config', () => {
      const config = { command: 'node agent.js' };
      expect(isHttpAgent(config)).toBe(false);
    });
  });

  describe('constants', () => {
    it('exports SCHEMA_VERSION as 1', () => {
      expect(SCHEMA_VERSION).toBe(1);
    });

    it('exports DEFAULT_TIMEOUT as 30000', () => {
      expect(DEFAULT_TIMEOUT).toBe(30000);
    });

    it('exports EXIT_CODES', () => {
      expect(EXIT_CODES.SUCCESS).toBe(0);
      expect(EXIT_CODES.TESTS_FAILED).toBe(1);
      expect(EXIT_CODES.CONFIG_ERROR).toBe(2);
    });
  });
});
