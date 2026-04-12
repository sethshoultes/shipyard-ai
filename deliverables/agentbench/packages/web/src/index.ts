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
export function createInitialState(): DashboardState {
  return {
    results: [],
    selectedResult: null,
    isLoading: false,
    error: null,
  };
}

/**
 * Dashboard action types
 */
export type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: TestRunResult[] }
  | { type: 'ADD_RESULT'; payload: TestRunResult }
  | { type: 'SELECT_RESULT'; payload: TestRunResult | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_RESULTS' };

/**
 * Dashboard state reducer
 */
export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, isLoading: false };
    case 'ADD_RESULT':
      return {
        ...state,
        results: [...state.results, action.payload],
        isLoading: false,
      };
    case 'SELECT_RESULT':
      return { ...state, selectedResult: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_RESULTS':
      return { ...state, results: [], selectedResult: null };
    default:
      return state;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Calculate pass rate as percentage
 */
export function calculatePassRate(result: TestRunResult): number {
  const total = result.tests.length;
  if (total === 0) {
    return 0;
  }
  return Math.round((result.passed / total) * 100);
}

/**
 * Get status color for a test result
 */
export function getStatusColor(passed: boolean): string {
  return passed ? '#22c55e' : '#ef4444';
}

/**
 * Get status text for a test result
 */
export function getStatusText(passed: boolean): string {
  return passed ? 'PASSED' : 'FAILED';
}

/**
 * Group test results by date
 */
export function groupResultsByDate(
  results: TestRunResult[]
): Map<string, TestRunResult[]> {
  const grouped = new Map<string, TestRunResult[]>();

  for (const result of results) {
    const dateKey = result.timestamp.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) ?? [];
    grouped.set(dateKey, [...existing, result]);
  }

  return grouped;
}

/**
 * Get summary statistics for multiple test runs
 */
export function getSummaryStats(results: TestRunResult[]): {
  totalRuns: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  averagePassRate: number;
  averageDuration: number;
} {
  const totalRuns = results.length;
  const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const averagePassRate =
    totalRuns > 0
      ? results.reduce((sum, r) => sum + calculatePassRate(r), 0) / totalRuns
      : 0;
  const averageDuration =
    totalRuns > 0
      ? results.reduce((sum, r) => sum + r.duration, 0) / totalRuns
      : 0;

  return {
    totalRuns,
    totalTests,
    totalPassed,
    totalFailed,
    averagePassRate: Math.round(averagePassRate),
    averageDuration: Math.round(averageDuration),
  };
}

// Re-export types from core
export type { TestConfig, TestRunResult } from '@agentbench/core';
