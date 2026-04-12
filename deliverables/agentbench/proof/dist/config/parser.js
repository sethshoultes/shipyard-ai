/**
 * YAML config parser with validation
 *
 * Parses proof.yaml files and validates against expected schema.
 */
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { ConfigValidationError, ConfigNotFoundError } from '../errors.js';
/**
 * Parse a YAML config file and return validated TestConfig
 */
export async function parseConfig(filePath) {
    let content;
    try {
        content = await readFile(filePath, 'utf-8');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new ConfigNotFoundError(filePath);
        }
        throw error;
    }
    let parsed;
    try {
        parsed = yaml.load(content);
    }
    catch (error) {
        const yamlError = error;
        const line = yamlError.mark?.line ? yamlError.mark.line + 1 : 'unknown';
        throw new ConfigValidationError(`Invalid YAML syntax at line ${line}`, 'Check for proper indentation and syntax');
    }
    return validateConfig(parsed);
}
/**
 * Validate parsed YAML against TestConfig schema
 */
function validateConfig(data) {
    if (!data || typeof data !== 'object') {
        throw new ConfigValidationError('Config must be an object', 'Ensure your proof.yaml has valid YAML structure');
    }
    const config = data;
    // Validate name
    if (!config.name || typeof config.name !== 'string') {
        throw new ConfigValidationError('Missing or invalid "name" field', 'Add a name: "Your Test Suite Name" to your config');
    }
    // Validate agent
    if (!config.agent || typeof config.agent !== 'object') {
        throw new ConfigValidationError('Missing "agent" configuration', 'Add an agent section with either "command" or "endpoint"');
    }
    const agent = config.agent;
    if (!agent.command && !agent.endpoint) {
        throw new ConfigValidationError('Agent requires either "command" or "endpoint"', 'Add agent.command: "your-command" or agent.endpoint: "http://..."');
    }
    if (agent.command && agent.endpoint) {
        throw new ConfigValidationError('Agent cannot have both "command" and "endpoint"', 'Choose one: command for subprocess or endpoint for HTTP');
    }
    // Validate tests
    if (!config.tests || !Array.isArray(config.tests)) {
        throw new ConfigValidationError('Missing or invalid "tests" array', 'Add a tests: array with test definitions');
    }
    if (config.tests.length === 0) {
        throw new ConfigValidationError('Tests array cannot be empty', 'Add at least one test definition');
    }
    const validatedTests = config.tests.map((test, index) => validateTest(test, index));
    return {
        name: config.name,
        agent: {
            command: agent.command,
            endpoint: agent.endpoint,
        },
        tests: validatedTests,
    };
}
/**
 * Validate a single test definition
 */
function validateTest(test, index) {
    if (!test || typeof test !== 'object') {
        throw new ConfigValidationError(`Test at index ${index} must be an object`, 'Ensure each test has name, input, and expect fields');
    }
    const t = test;
    if (!t.name || typeof t.name !== 'string') {
        throw new ConfigValidationError(`Test at index ${index} missing "name"`, 'Add a name: "Test Name" to each test');
    }
    if (!t.input || typeof t.input !== 'string') {
        throw new ConfigValidationError(`Test "${t.name}" missing "input"`, 'Add an input: "your test input" to the test');
    }
    if (!t.expect) {
        throw new ConfigValidationError(`Test "${t.name}" missing "expect"`, 'Add expect: with at least one expectation');
    }
    const expectations = normalizeExpectations(t.expect, t.name);
    return {
        name: t.name,
        input: t.input,
        expect: expectations,
    };
}
/**
 * Normalize expectations to a consistent array format
 */
function normalizeExpectations(expect, testName) {
    // Handle single object expectation
    if (!Array.isArray(expect)) {
        if (typeof expect !== 'object' || expect === null) {
            throw new ConfigValidationError(`Test "${testName}" has invalid expect format`, 'expect should be an object or array of expectations');
        }
        return parseExpectationObject(expect, testName);
    }
    // Handle array of expectations
    const results = [];
    for (const item of expect) {
        if (typeof item !== 'object' || item === null) {
            throw new ConfigValidationError(`Test "${testName}" has invalid expectation`, 'Each expectation should be an object like { contains: "text" }');
        }
        results.push(...parseExpectationObject(item, testName));
    }
    return results;
}
/**
 * Parse an expectation object into Expectation array
 */
function parseExpectationObject(obj, testName) {
    const validTypes = ['contains', 'does_not_contain', 'json_schema', 'sentiment', 'matches_intent'];
    const results = [];
    for (const [key, value] of Object.entries(obj)) {
        if (!validTypes.includes(key)) {
            throw new ConfigValidationError(`Test "${testName}" has unknown evaluator "${key}"`, `Valid evaluators: ${validTypes.join(', ')}`);
        }
        results.push({
            type: key,
            value: value,
        });
    }
    if (results.length === 0) {
        throw new ConfigValidationError(`Test "${testName}" has empty expectation`, 'Add at least one evaluator like contains, sentiment, etc.');
    }
    return results;
}
//# sourceMappingURL=parser.js.map