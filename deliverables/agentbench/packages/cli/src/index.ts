/**
 * @agentbench/cli - Command-line interface for agentbench
 *
 * This package provides the CLI for running agent tests.
 */

import { runTests } from '@agentbench/core';
import type { TestConfig, TestRunResult } from '@agentbench/core';

/**
 * Output format for CLI
 */
export type OutputFormat = 'human' | 'json';

/**
 * CLI options
 */
export interface CliOptions {
  configPath: string;
  format: OutputFormat;
}

/**
 * Format test results for human-readable output
 */
export function formatHumanOutput(result: TestRunResult): string {
  const lines: string[] = [];

  for (const test of result.tests) {
    const status = test.passed ? '\u2713' : '\u2717';
    lines.push(`${status} ${test.name}`);

    if (!test.passed) {
      if (test.error) {
        lines.push(`  Error: ${test.error}`);
      } else {
        for (const exp of test.expectations) {
          if (!exp.passed && !exp.skipped) {
            lines.push(`  - ${exp.message}`);
          }
        }
      }
    }
  }

  lines.push('');
  lines.push(`Tests passed: ${result.passed}/${result.tests.length}`);

  if (result.failed > 0) {
    lines.push(`Tests failed: ${result.failed}`);
  }

  return lines.join('\n');
}

/**
 * Format test results for JSON output
 */
export function formatJsonOutput(result: TestRunResult): string {
  const output = {
    passed: result.passed,
    failed: result.failed,
    duration: result.duration,
    tests: result.tests.map((test) => ({
      name: test.name,
      passed: test.passed,
      duration: test.duration,
      expectations: test.expectations.map((exp) => ({
        type: exp.type,
        passed: exp.passed,
        message: exp.message,
        skipped: exp.skipped,
      })),
      error: test.error,
    })),
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Format test results based on output format
 */
export function formatOutput(
  result: TestRunResult,
  format: OutputFormat
): string {
  switch (format) {
    case 'json':
      return formatJsonOutput(result);
    case 'human':
    default:
      return formatHumanOutput(result);
  }
}

/**
 * Run CLI with given options
 */
export async function runCli(
  config: TestConfig,
  options: Partial<CliOptions> = {}
): Promise<{ output: string; exitCode: number }> {
  const format = options.format ?? 'human';

  const result = await runTests(config);
  const output = formatOutput(result, format);

  const exitCode = result.failed > 0 ? 1 : 0;

  return { output, exitCode };
}

// Re-export types from core
export type { TestConfig, TestRunResult } from '@agentbench/core';
