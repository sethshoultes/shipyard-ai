/**
 * @agentbench/web - Web dashboard for agentbench
 *
 * This package provides a web interface for viewing test results
 * and managing test configurations.
 */
import type { TestRunResult } from '@agentbench/core';
/**
 * Dashboard state
 */
export interface DashboardState {
    results: TestRunResult[];
    selectedResult: TestRunResult | null;
    isLoading: boolean;
    error: string | null;
}
/**
 * Create initial dashboard state
 */
export declare function createInitialState(): DashboardState;
/**
 * Dashboard action types
 */
export type DashboardAction = {
    type: 'SET_LOADING';
    payload: boolean;
} | {
    type: 'SET_RESULTS';
    payload: TestRunResult[];
} | {
    type: 'ADD_RESULT';
    payload: TestRunResult;
} | {
    type: 'SELECT_RESULT';
    payload: TestRunResult | null;
} | {
    type: 'SET_ERROR';
    payload: string | null;
} | {
    type: 'CLEAR_RESULTS';
};
/**
 * Dashboard state reducer
 */
export declare function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState;
/**
 * Format duration for display
 */
export declare function formatDuration(ms: number): string;
/**
 * Calculate pass rate as percentage
 */
export declare function calculatePassRate(result: TestRunResult): number;
/**
 * Get status color for a test result
 */
export declare function getStatusColor(passed: boolean): string;
/**
 * Get status text for a test result
 */
export declare function getStatusText(passed: boolean): string;
/**
 * Group test results by date
 */
export declare function groupResultsByDate(results: TestRunResult[]): Map<string, TestRunResult[]>;
/**
 * Get summary statistics for multiple test runs
 */
export declare function getSummaryStats(results: TestRunResult[]): {
    totalRuns: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    averagePassRate: number;
    averageDuration: number;
};
export type { TestConfig, TestRunResult } from '@agentbench/core';
//# sourceMappingURL=index.d.ts.map