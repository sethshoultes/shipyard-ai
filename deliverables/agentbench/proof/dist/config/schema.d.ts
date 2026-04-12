/**
 * TypeScript interfaces for test configuration schema
 */
export interface Expectation {
    type: 'contains' | 'does_not_contain' | 'json_schema' | 'sentiment' | 'matches_intent';
    value: string | string[] | object;
}
export interface Test {
    name: string;
    input: string;
    expect: Expectation[];
}
export interface Agent {
    command?: string;
    endpoint?: string;
}
export interface TestConfig {
    name: string;
    agent: Agent;
    tests: Test[];
}
export interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    expectations: ExpectationResult[];
}
export interface ExpectationResult {
    type: string;
    passed: boolean;
    expected: string | string[] | object;
    actual?: string;
    message?: string;
    confidence?: number;
}
export interface TestResults {
    tests: TestResult[];
    passed: number;
    failed: number;
    duration: number;
}
export interface RunOptions {
    llm: boolean;
}
//# sourceMappingURL=schema.d.ts.map