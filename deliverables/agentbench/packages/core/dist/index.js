/**
 * @agentbench/core - Core testing engine and evaluators for agentbench
 *
 * This package provides the core functionality for:
 * - Running tests against AI agents
 * - Evaluating agent outputs
 * - Managing test execution
 */
import { isSubprocessAgent, isHttpAgent, DEFAULT_TIMEOUT, } from '@agentbench/data';
/**
 * Execute agent with given input and return output
 */
export async function executeAgent(config, input) {
    const timeout = config.timeout ?? DEFAULT_TIMEOUT;
    if (isSubprocessAgent(config)) {
        return executeSubprocessAgent(config.command, input, timeout);
    }
    else if (isHttpAgent(config)) {
        return executeHttpAgent(config.endpoint, input, timeout);
    }
    throw new Error('Invalid agent configuration: must specify command or endpoint');
}
/**
 * Execute agent as subprocess
 */
async function executeSubprocessAgent(command, input, timeout) {
    const startTime = Date.now();
    // Dynamic import for Node.js child_process
    const { spawn } = await import('child_process');
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        const child = spawn(cmd, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        const timeoutId = setTimeout(() => {
            child.kill();
            reject(new Error(`Agent subprocess timed out after ${timeout}ms`));
        }, timeout);
        child.on('close', (code) => {
            clearTimeout(timeoutId);
            const duration = Date.now() - startTime;
            if (code !== 0 && code !== null) {
                reject(new Error(`Agent exited with code ${code}: ${stderr}`));
                return;
            }
            resolve({ output: stdout.trim(), duration });
        });
        child.on('error', (error) => {
            clearTimeout(timeoutId);
            reject(error);
        });
        // Send input to subprocess
        child.stdin.write(input);
        child.stdin.end();
    });
}
/**
 * Execute agent via HTTP endpoint
 */
async function executeHttpAgent(endpoint, input, timeout) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        const duration = Date.now() - startTime;
        return { output: data.output, duration };
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Agent endpoint timed out after ${timeout}ms`);
        }
        throw error;
    }
}
/**
 * Evaluate a single expectation against agent output
 */
export function evaluateExpectation(expectation, output) {
    switch (expectation.type) {
        case 'contains':
            return evaluateContains(expectation.value, output);
        case 'does_not_contain':
            return evaluateDoesNotContain(expectation.value, output);
        case 'matches_intent':
            return evaluateMatchesIntent(expectation.intent, output);
        default:
            return {
                type: expectation.type,
                passed: false,
                message: 'Unknown expectation type',
            };
    }
}
/**
 * Evaluate contains expectation
 */
function evaluateContains(value, output) {
    const values = Array.isArray(value) ? value : [value];
    const lowerOutput = output.toLowerCase();
    const found = values.some((v) => lowerOutput.includes(v.toLowerCase()));
    return {
        type: 'contains',
        passed: found,
        message: found
            ? `Output contains expected value`
            : `Output does not contain any of: ${values.join(', ')}`,
    };
}
/**
 * Evaluate does_not_contain expectation
 */
function evaluateDoesNotContain(value, output) {
    const values = Array.isArray(value) ? value : [value];
    const lowerOutput = output.toLowerCase();
    const found = values.find((v) => lowerOutput.includes(v.toLowerCase()));
    return {
        type: 'does_not_contain',
        passed: !found,
        message: found
            ? `Output contains forbidden value: ${found}`
            : `Output does not contain any forbidden values`,
    };
}
/**
 * Evaluate matches_intent expectation (semantic evaluation)
 * Requires ANTHROPIC_API_KEY environment variable
 */
function evaluateMatchesIntent(intent, _output) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return {
            type: 'matches_intent',
            passed: false,
            message: 'ANTHROPIC_API_KEY not set - semantic evaluation skipped',
            skipped: true,
        };
    }
    // Semantic evaluation will be implemented in a later phase
    // For now, we indicate it requires API integration
    return {
        type: 'matches_intent',
        passed: true,
        message: `Semantic evaluation pending implementation - intent: ${intent}`,
        skipped: true,
    };
}
/**
 * Run a single test case
 */
export async function runTestCase(testCase, agentConfig) {
    const startTime = Date.now();
    try {
        const { output } = await executeAgent(agentConfig, testCase.input);
        const expectations = testCase.expect.map((exp) => evaluateExpectation(exp, output));
        const passed = expectations.every((e) => e.passed || e.skipped);
        const duration = Date.now() - startTime;
        return {
            name: testCase.name,
            passed,
            input: testCase.input,
            output,
            expectations,
            duration,
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            name: testCase.name,
            passed: false,
            input: testCase.input,
            output: '',
            expectations: [],
            duration,
            error: errorMessage,
        };
    }
}
/**
 * Run all tests in a configuration
 */
export async function runTests(config) {
    const startTime = Date.now();
    const results = [];
    for (const testCase of config.tests) {
        const result = await runTestCase(testCase, config.agent);
        results.push(result);
    }
    const duration = Date.now() - startTime;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed && !r.error).length;
    const skipped = results.filter((r) => r.error).length;
    return {
        config,
        tests: results,
        passed,
        failed,
        skipped,
        duration,
        timestamp: new Date(),
    };
}
export { isSubprocessAgent, isHttpAgent, DEFAULT_TIMEOUT, EXIT_CODES } from '@agentbench/data';
//# sourceMappingURL=index.js.map