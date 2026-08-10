import { describe, it, expect } from 'vitest';
import { calculateDiagnosticResults, shouldTakeDiagnosticTest } from '@/lib/diagnostic-test';

describe('diagnostic-test (pure functions)', () => {
  describe('shouldTakeDiagnosticTest', () => {
    it('returns true for null last date', () => {
      expect(shouldTakeDiagnosticTest(undefined)).toBe(true);
    });

    it('returns false for recent date', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1);
      expect(shouldTakeDiagnosticTest(recentDate.toISOString())).toBe(false);
    });

    it('returns true for old date (more than 30 days)', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      expect(shouldTakeDiagnosticTest(oldDate.toISOString())).toBe(true);
    });

    it('returns true when lastDiagnosticDate is undefined', () => {
      expect(shouldTakeDiagnosticTest(undefined)).toBe(true);
    });

    it('returns true for null last date', () => {
      expect(shouldTakeDiagnosticTest(undefined)).toBe(true);
    });
  });

  describe('calculateDiagnosticResults', () => {
    it('returns correct score for all correct answers', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }, { questionIndex: 1, selectedAnswer: 'B' }],
        ['A', 'B']
      );
      expect(results.score).toBe(2);
      expect(results.percentage).toBe(100);
    });

    it('returns correct score for partial answers', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }, { questionIndex: 1, selectedAnswer: 'X' }],
        ['A', 'B']
      );
      expect(results.score).toBe(1);
      expect(results.percentage).toBe(50);
    });

    it('returns 0 score for no answers', () => {
      const results = calculateDiagnosticResults([], []);
      expect(results.score).toBe(0);
      expect(results.percentage).toBe(0);
    });

    it('returns percentage for 1 out of 4 correct', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }, { questionIndex: 1, selectedAnswer: 'A' }, { questionIndex: 2, selectedAnswer: 'A' }, { questionIndex: 3, selectedAnswer: 'X' }],
        ['A', 'B', 'C', 'D']
      );
      expect(results.score).toBe(1);
      expect(results.percentage).toBe(25);
    });

    it('returns a score between 0 and 100', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }, { questionIndex: 1, selectedAnswer: 'B' }],
        ['A', 'B', 'C', 'D']
      );
      expect(results.score).toBe(2);
      expect(results.percentage).toBe(50);
    });

    it('returns 100% when all questions are answered correctly', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }],
        ['A']
      );
      expect(results.score).toBe(1);
      expect(results.percentage).toBe(100);
    });

    it('returns correct percentage formula', () => {
      const results = calculateDiagnosticResults(
        [{ questionIndex: 0, selectedAnswer: 'A' }, { questionIndex: 1, selectedAnswer: 'B' }],
        ['A', 'B']
      );
      expect(results.percentage).toBe(100);
    });

    it('handles empty answers array', () => {
      const results = calculateDiagnosticResults([], []);
      expect(results.score).toBe(0);
      expect(results.percentage).toBe(0);
    });
  });
});