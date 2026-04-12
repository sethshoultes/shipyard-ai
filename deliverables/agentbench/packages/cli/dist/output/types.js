/**
 * AgentBench CLI Output Types
 *
 * TypeScript type definitions for CLI benchmark results.
 * These types correspond to result.schema.json v1.0 (LOCKED)
 *
 * @version 1.0
 * @status LOCKED - Breaking changes require major version bump
 */
/**
 * Schema version constant - must match result.schema.json
 */
export const SCHEMA_VERSION = '1.0';
/**
 * Type guard to check if a value is a valid RunStatus
 */
export function isRunStatus(value) {
    return (typeof value === 'string' &&
        ['completed', 'failed', 'partial', 'timeout', 'cancelled'].includes(value));
}
/**
 * Type guard to check if a value matches the expected schema version
 */
export function isValidSchemaVersion(version) {
    return version === SCHEMA_VERSION;
}
/**
 * Creates a new OutputMeta object with current timestamp
 */
export function createOutputMeta(cliVersion) {
    return {
        schema_version: SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
        cli_version: cliVersion,
    };
}
/**
 * Creates an empty/initial ResultSummary
 */
export function createEmptySummary() {
    return {
        total: 0,
        passed: 0,
        failed: 0,
        score: 0,
    };
}
/**
 * Calculates summary from benchmark results
 */
export function calculateSummary(benchmarks) {
    const total = benchmarks.length;
    const passed = benchmarks.filter((b) => b.passed).length;
    const failed = total - passed;
    const score = total > 0
        ? benchmarks.reduce((sum, b) => sum + b.score, 0) / total
        : 0;
    return {
        total,
        passed,
        failed,
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
    };
}
//# sourceMappingURL=types.js.map