/**
 * @agentbench/core - Core testing engine and evaluators for agentbench
 *
 * This package provides the core functionality for:
 * - Running tests against AI agents
 * - Evaluating agent outputs
 * - Managing test execution
 */
import type { TestConfig, TestCase, TestResult, TestRunResult, Expectation, ExpectationResult, AgentConfig } from '@agentbench/data';
/**
 * Execute agent with given input and return output
 */
export declare function executeAgent(config: AgentConfig, input: string): Promise<{
    output: string;
    duration: number;
}>;
/**
 * Evaluate a single expectation against agent output
 */
export declare function evaluateExpectation(expectation: Expectation, output: string): ExpectationResult;
/**
 * Run a single test case
 */
export declare function runTestCase(testCase: TestCase, agentConfig: AgentConfig): Promise<TestResult>;
/**
 * Run all tests in a configuration
 */
export declare function runTests(config: TestConfig): Promise<TestRunResult>;
export type { TestConfig, TestCase, TestResult, TestRunResult, Expectation, ExpectationResult, AgentConfig, } from '@agentbench/data';
export { isSubprocessAgent, isHttpAgent, DEFAULT_TIMEOUT, EXIT_CODES } from '@agentbench/data';
//# sourceMappingURL=index.d.ts.map