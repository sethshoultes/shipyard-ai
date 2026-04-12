import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  dashboardReducer,
  formatDuration,
  calculatePassRate,
  getStatusColor,
  getStatusText,
  getSummaryStats,
} from './index.js';
import type { TestRunResult, DashboardAction } from './index.js';

describe('@agentbench/web', () => {
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
        expectations: [],
        duration: 100,
      },
      {
        name: 'Test 2',
        passed: false,
        input: 'Bad input',
        output: 'Error',
        expectations: [],
        duration: 150,
      },
    ],
    passed: 1,
    failed: 1,
    skipped: 0,
    duration: 250,
    timestamp: new Date('2024-01-01T00:00:00.000Z'),
  };

  describe('createInitialState', () => {
    it('returns empty state', () => {
      const state = createInitialState();
      expect(state.results).toEqual([]);
      expect(state.selectedResult).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('dashboardReducer', () => {
    it('handles SET_LOADING', () => {
      const state = createInitialState();
      const action: DashboardAction = { type: 'SET_LOADING', payload: true };
      const newState = dashboardReducer(state, action);
      expect(newState.isLoading).toBe(true);
    });

    it('handles SET_RESULTS', () => {
      const state = createInitialState();
      const action: DashboardAction = { type: 'SET_RESULTS', payload: [mockResult] };
      const newState = dashboardReducer(state, action);
      expect(newState.results).toEqual([mockResult]);
      expect(newState.isLoading).toBe(false);
    });

    it('handles ADD_RESULT', () => {
      const state = createInitialState();
      const action: DashboardAction = { type: 'ADD_RESULT', payload: mockResult };
      const newState = dashboardReducer(state, action);
      expect(newState.results).toHaveLength(1);
    });

    it('handles SELECT_RESULT', () => {
      const state = createInitialState();
      const action: DashboardAction = { type: 'SELECT_RESULT', payload: mockResult };
      const newState = dashboardReducer(state, action);
      expect(newState.selectedResult).toBe(mockResult);
    });

    it('handles SET_ERROR', () => {
      const state = createInitialState();
      const action: DashboardAction = { type: 'SET_ERROR', payload: 'Test error' };
      const newState = dashboardReducer(state, action);
      expect(newState.error).toBe('Test error');
    });

    it('handles CLEAR_RESULTS', () => {
      const state = { ...createInitialState(), results: [mockResult] };
      const action: DashboardAction = { type: 'CLEAR_RESULTS' };
      const newState = dashboardReducer(state, action);
      expect(newState.results).toEqual([]);
      expect(newState.selectedResult).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('formats milliseconds for short durations', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('formats seconds for longer durations', () => {
      expect(formatDuration(2500)).toBe('2.50s');
    });
  });

  describe('calculatePassRate', () => {
    it('calculates pass rate as percentage', () => {
      expect(calculatePassRate(mockResult)).toBe(50);
    });

    it('returns 0 for empty results', () => {
      const emptyResult = { ...mockResult, tests: [], passed: 0 };
      expect(calculatePassRate(emptyResult)).toBe(0);
    });
  });

  describe('getStatusColor', () => {
    it('returns green for passed', () => {
      expect(getStatusColor(true)).toBe('#22c55e');
    });

    it('returns red for failed', () => {
      expect(getStatusColor(false)).toBe('#ef4444');
    });
  });

  describe('getStatusText', () => {
    it('returns PASSED for passed', () => {
      expect(getStatusText(true)).toBe('PASSED');
    });

    it('returns FAILED for failed', () => {
      expect(getStatusText(false)).toBe('FAILED');
    });
  });

  describe('getSummaryStats', () => {
    it('calculates summary statistics', () => {
      const stats = getSummaryStats([mockResult, mockResult]);
      expect(stats.totalRuns).toBe(2);
      expect(stats.totalTests).toBe(4);
      expect(stats.totalPassed).toBe(2);
      expect(stats.totalFailed).toBe(2);
      expect(stats.averagePassRate).toBe(50);
    });

    it('handles empty results', () => {
      const stats = getSummaryStats([]);
      expect(stats.totalRuns).toBe(0);
      expect(stats.averagePassRate).toBe(0);
    });
  });
});
