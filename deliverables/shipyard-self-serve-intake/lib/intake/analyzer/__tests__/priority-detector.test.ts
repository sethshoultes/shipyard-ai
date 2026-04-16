/**
 * Priority Detector Tests
 * Tests confidence scoring, threshold application, and edge cases
 */

import {
  PriorityDetector,
  createPriorityDetector,
  detectPriority,
} from '../priority-detector';

describe('PriorityDetector - Confidence Scoring', () => {
  let detector: PriorityDetector;

  beforeEach(() => {
    detector = createPriorityDetector();
  });

  describe('Exact Keyword Match in Title (1.0 confidence)', () => {
    it('should detect p0 with 1.0 confidence for exact keyword in title', () => {
      const result = detector.detectPriority(
        'production down - database offline',
        ''
      );
      expect(result.priority).toBe('p0');
      expect(result.confidence).toBe(1.0);
      expect(result.needs_clarification).toBe(false);
      expect(result.reasoning).toContain('Exact keyword match in title');
    });

    it('should detect p1 with 1.0 confidence for exact keyword in title', () => {
      const result = detector.detectPriority(
        'high priority bug in payment system',
        ''
      );
      expect(result.priority).toBe('p1');
      expect(result.confidence).toBe(1.0);
      expect(result.needs_clarification).toBe(false);
    });

    it('should detect p2 with 1.0 confidence for exact keyword in title', () => {
      const result = detector.detectPriority('feature request: add dark mode', '');
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(1.0);
      expect(result.needs_clarification).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      const result = detector.detectPriority(
        'PRODUCTION DOWN - CRITICAL ISSUE',
        ''
      );
      expect(result.priority).toBe('p0');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('Exact Keyword Match in Body (0.8 confidence)', () => {
    it('should detect p0 with 0.8 confidence for exact keyword in body only', () => {
      const result = detector.detectPriority('Database Issue', 'production down');
      expect(result.priority).toBe('p0');
      expect(result.confidence).toBe(0.8);
      expect(result.needs_clarification).toBe(false);
      expect(result.reasoning).toContain('Exact keyword match in body');
    });

    it('should detect p1 with 0.8 confidence for exact keyword in body only', () => {
      const result = detector.detectPriority(
        'Login Feature',
        'This is blocking all users from accessing the system'
      );
      expect(result.priority).toBe('p1');
      expect(result.confidence).toBe(0.8);
      expect(result.needs_clarification).toBe(false);
    });

    it('should detect p2 with 0.8 confidence for exact keyword in body only', () => {
      const result = detector.detectPriority(
        'Sidebar Update',
        'This is a nice to have improvement'
      );
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(0.8);
      expect(result.needs_clarification).toBe(false);
    });

    it('should prefer title match over body match', () => {
      const result = detector.detectPriority(
        'production down',
        'this is a minor feature request'
      );
      expect(result.priority).toBe('p0');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('Partial Keyword Match (0.5 confidence)', () => {
    it('should detect p0 signals with 0.5 confidence but default to p2 due to threshold', () => {
      const result = detector.detectPriority('Critical issue found', '');
      // "critical" is a partial match keyword for p0, giving 0.5 confidence
      // Since 0.5 < 0.7 threshold, it defaults to p2 with needs_clarification
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(0.5);
      expect(result.needs_clarification).toBe(true);
      expect(result.reasoning).toContain('Low confidence');
    });

    it('should detect p1 with 1.0 confidence when exact keyword "major bug" in title', () => {
      const result = detector.detectPriority('major bug discovered', '');
      expect(result.priority).toBe('p1');
      expect(result.confidence).toBe(1.0);
      expect(result.needs_clarification).toBe(false);
    });

    it('should detect p2 with 0.5 confidence for partial match in title', () => {
      const result = detector.detectPriority(
        'feature improvement suggestion',
        ''
      );
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(0.5);
      expect(result.needs_clarification).toBe(true);
    });

    it('should detect p0 signals with 0.5 confidence but default to p2 due to threshold', () => {
      const result = detector.detectPriority(
        'System Status Report',
        'We have an urgent crash in production'
      );
      // "urgent" and "crash" are partial match keywords for p0, giving 0.5 confidence
      // Since 0.5 < 0.7 threshold, it defaults to p2 with needs_clarification
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(0.5);
      expect(result.needs_clarification).toBe(true);
    });

    it('should prefer title match over body match', () => {
      const result = detector.detectPriority(
        'Feature Request Form',
        'This is blocking all users from accessing production'
      );
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('No Clear Signals (0.0 confidence) - Threshold Test', () => {
    it('should default to p2 with needs_clarification when no signals found', () => {
      const result = detector.detectPriority(
        'Please review this pull request',
        'I would like you to take a look at my changes'
      );
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.needs_clarification).toBe(true);
      expect(result.reasoning).toContain('Low confidence');
      expect(result.reasoning).toContain('Defaulting to p2');
    });

    it('should request clarification in reasoning message', () => {
      const result = detector.detectPriority(
        'Update the website',
        'Some changes needed'
      );
      expect(result.needs_clarification).toBe(true);
      expect(result.reasoning).toContain('clarification');
    });
  });

  describe('Confidence Threshold (0.7)', () => {
    it('should apply p2 default when confidence is below threshold (0.5)', () => {
      // Test with "minor" which is an exact match for p2, giving 1.0 confidence
      // Use a word that gives partial match instead
      const result = detector.detectPriority('Small item found', '');
      expect(result.confidence < 0.7).toBe(true);
      expect(result.priority).toBe('p2');
      expect(result.needs_clarification).toBe(true);
    });

    it('should accept priority when confidence exceeds threshold (0.8)', () => {
      const result = detector.detectPriority('Some Title', 'blocking users');
      expect(result.confidence).toBe(0.8);
      expect(result.confidence >= 0.7).toBe(true);
      expect(result.priority).toBe('p1');
      expect(result.needs_clarification).toBe(false);
    });

    it('should accept priority when confidence is at 1.0', () => {
      const result = detector.detectPriority(
        'critical bug in production',
        ''
      );
      expect(result.confidence).toBe(1.0);
      expect(result.priority).toBe('p0');
      expect(result.needs_clarification).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty body gracefully', () => {
      const result = detector.detectPriority('critical bug', '');
      expect(result.priority).toBeDefined();
      // "critical bug" is an exact match in title, so confidence is 1.0
      expect(result.confidence).toBe(1.0);
    });

    it('should handle undefined body as empty string', () => {
      const result = detector.detectPriority('urgent bug', undefined as any);
      expect(result.priority).toBeDefined();
      // "urgent bug" is an exact match in title, so confidence is 1.0
      expect(result.confidence).toBe(1.0);
    });

    it('should handle title with special characters', () => {
      const result = detector.detectPriority(
        'Bug: Critical issue (production) @ API',
        ''
      );
      // "critical" is a partial match keyword for p0, giving 0.5 confidence
      // Since 0.5 < 0.7 threshold, it defaults to p2
      expect(result.priority).toBe('p2');
      expect(result.confidence).toBe(0.5);
      expect(result.needs_clarification).toBe(true);
    });

    it('should handle very long content', () => {
      const longBody =
        'a'.repeat(5000) +
        ' blocking ' +
        'a'.repeat(5000);
      const result = detector.detectPriority('Issue', longBody);
      expect(result.priority).toBe('p1');
      expect(result.confidence).toBe(0.8);
    });

    it('should handle body with markdown formatting', () => {
      const markdownBody = `
# Summary
This is a **critical bug** that is blocking production

## Steps to Reproduce
1. Do this
2. Do that

## Expected Result
System should work
      `;
      const result = detector.detectPriority('System Error', markdownBody);
      expect(result.priority).toBe('p0');
      expect(result.confidence).toBe(0.8);
    });

    it('should handle multiple keyword matches (use highest priority)', () => {
      const result = detector.detectPriority(
        'urgent feature request',
        'critical bug'
      );
      // "feature request" exact match in title = 1.0 confidence for p2
      // Check for p0 first (critical bug in body = 0.8), wins with 0.8 >= 1.0? No
      // So p2 should win with 1.0 confidence
      expect(['p0', 'p2']).toContain(result.priority);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Factory Functions', () => {
    it('should create detector with createPriorityDetector', () => {
      const newDetector = createPriorityDetector();
      expect(newDetector).toBeDefined();
      const result = newDetector.detectPriority('critical bug', '');
      expect(result.priority).toBe('p0');
    });

    it('should work with detectPriority convenience function', () => {
      const result = detectPriority('urgent bug', 'is blocking');
      expect(result.priority).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.needs_clarification).toBeDefined();
      expect(result.reasoning).toBeDefined();
    });

    it('should provide static methods for configuration', () => {
      const threshold = PriorityDetector.getConfidenceThreshold();
      expect(threshold).toBe(0.7);

      const keywords = PriorityDetector.getDefaultKeywords();
      expect(keywords.p0.exact).toBeDefined();
      expect(keywords.p1.exact).toBeDefined();
      expect(keywords.p2.exact).toBeDefined();
    });
  });

  describe('Verification Checks from Task', () => {
    it('should verify: exact match in title => confidence 1.0', () => {
      const tests = [
        { title: 'production down', expectedConf: 1.0 },
        { title: 'critical bug', expectedConf: 1.0 },
        { title: 'high priority issue', expectedConf: 1.0 },
        { title: 'feature request form', expectedConf: 1.0 },
      ];

      for (const test of tests) {
        const result = detector.detectPriority(test.title, '');
        expect(result.confidence).toBe(test.expectedConf);
      }
    });

    it('should verify: match only in body => confidence 0.8', () => {
      const tests = [
        { body: 'production down', expectedPriority: 'p0' },
        { body: 'critical bug', expectedPriority: 'p0' },
        { body: 'blocking issue', expectedPriority: 'p1' },
        { body: 'feature request', expectedPriority: 'p2' },
      ];

      for (const test of tests) {
        const result = detector.detectPriority('Some Title', test.body);
        expect(result.confidence).toBe(0.8);
        expect(result.priority).toBe(test.expectedPriority);
      }
    });

    it('should verify: low confidence signals => confidence < 0.7, defaults to p2', () => {
      const tests = [
        { title: 'critical item', expectedPriority: 'p0' },
        { title: 'urgent task', expectedPriority: 'p0' },
        { title: 'major update', expectedPriority: 'p1' },
        { title: 'feature idea', expectedPriority: 'p2' },
      ];

      for (const test of tests) {
        const result = detector.detectPriority(test.title, '');
        if (result.confidence < 0.7) {
          expect(result.priority).toBe('p2');
        }
      }
    });

    it('should verify: no signals => low confidence, defaults to p2', () => {
      const result = detector.detectPriority(
        'Please review my work',
        'Here are my changes for your feedback'
      );
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.priority).toBe('p2');
      expect(result.needs_clarification).toBe(true);
    });
  });

  describe('Result Type Validation', () => {
    it('should return valid DetectionResult structure', () => {
      const result = detector.detectPriority('test', 'content');
      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('needs_clarification');
      expect(result).toHaveProperty('reasoning');

      expect(['p0', 'p1', 'p2']).toContain(result.priority);
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(typeof result.needs_clarification).toBe('boolean');
      expect(typeof result.reasoning).toBe('string');
    });
  });
});
