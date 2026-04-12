/**
 * @agentbench/cli - Command-line interface for agentbench
 *
 * This package provides the CLI for running agent tests.
 */
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
export declare function formatHumanOutput(result: TestRunResult): string;
/**
 * Format test results for JSON output
 */
export declare function formatJsonOutput(result: TestRunResult): string;
/**
 * Format test results based on output format
 */
export declare function formatOutput(result: TestRunResult, format: OutputFormat): string;
/**
 * Run CLI with given options
 */
export declare function runCli(config: TestConfig, options?: Partial<CliOptions>): Promise<{
    output: string;
    exitCode: number;
}>;
export type { TestConfig, TestRunResult } from '@agentbench/core';
//# sourceMappingURL=index.d.ts.map