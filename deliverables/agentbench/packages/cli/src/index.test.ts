import { describe, it, expect } from 'vitest';
import {
  formatHumanOutput,
  formatJsonOutput,
  formatOutput,
} from './index.js';
import type { TestRunResult } from './index.js';

describe('@agentbench/cli', () => {
  const mockResult: TestRunResult = {
    config: {
      version: 1,
      name: 'Test Agent',
      agent: { command: 'node agent.js' },
      tests: [],
    },
    tests: [
      {
        name: 'Test 1',
        passed: true,
        input: 'Hello',
        output: 'Hi there!',
        expectations: [
          { type: 'contains', passed: true, message: 'Output contains expected value' },
        ],
        duration: 100,
      },
      {
        name: 'Test 2',
        passed: false,
        input: 'Bad input',
        output: 'Error occurred',
        expectations: [
          { type: 'does_not_contain', passed: false, message: 'Output contains forbidden value: error' },
        ],
        duration: 150,
      },
    ],
    passed: 1,
    failed: 1,
    skipped: 0,
    duration: 250,
    timestamp: new Date('2024-01-01T00:00:00.000Z'),
  };

  describe('formatHumanOutput', () => {
    it('formats passed tests with checkmark', () => {
      const output = formatHumanOutput(mockResult);
      expect(output).toContain('\u2713 Test 1');
    });

    it('formats failed tests with X', () => {
      const output = formatHumanOutput(mockResult);
      expect(output).toContain('\u2717 Test 2');
    });

    it('includes test count summary', () => {
      const output = formatHumanOutput(mockResult);
      expect(output).toContain('Tests passed: 1/2');
    });

    it('includes failure details', () => {
      const output = formatHumanOutput(mockResult);
      expect(output).toContain('Output contains forbidden value: error');
    });
  });

  describe('formatJsonOutput', () => {
    it('returns valid JSON', () => {
      const output = formatJsonOutput(mockResult);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('includes passed and failed counts', () => {
      const output = JSON.parse(formatJsonOutput(mockResult));
      expect(output.passed).toBe(1);
      expect(output.failed).toBe(1);
    });

    it('includes test details', () => {
      const output = JSON.parse(formatJsonOutput(mockResult));
      expect(output.tests).toHaveLength(2);
      expect(output.tests[0].name).toBe('Test 1');
    });
  });

  describe('formatOutput', () => {
    it('returns human format by default', () => {
      const output = formatOutput(mockResult, 'human');
      expect(output).toContain('\u2713');
    });

    it('returns JSON format when specified', () => {
      const output = formatOutput(mockResult, 'json');
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });
});
