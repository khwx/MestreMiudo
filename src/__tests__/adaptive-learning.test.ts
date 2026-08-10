import { describe, it, expect } from 'vitest';
import {
  calculateAdaptiveDifficulty,
  getWeakTopics,
  getStrongTopics,
  buildAdaptivePromptInstructions,
  getRecommendedSubject,
  generateAdaptiveFeedback,
} from '@/lib/adaptive-learning';

describe('adaptive-learning (pure functions)', () => {
  describe('calculateAdaptiveDifficulty', () => {
    it('defaults to intermediate when no data', () => {
      expect(calculateAdaptiveDifficulty(null, undefined)).toBe('intermediate');
      expect(calculateAdaptiveDifficulty(null, undefined)).toBe('intermediate');
    });

    it('uses diagnostic score when available', () => {
      expect(calculateAdaptiveDifficulty(null, 90)).toBe('advanced');
      expect(calculateAdaptiveDifficulty(null, 70)).toBe('intermediate');
      expect(calculateAdaptiveDifficulty(null, 40)).toBe('beginner');
    });

    it('uses performance metrics when diagnostic is absent', () => {
      expect(calculateAdaptiveDifficulty({ 'matemática': 0.9 }, undefined)).toBe('advanced');
      expect(calculateAdaptiveDifficulty({ 'matemática': 0.8 }, undefined)).toBe('intermediate');
      expect(calculateAdaptiveDifficulty({ 'matemática': 0.5 }, undefined)).toBe('beginner');
      expect(calculateAdaptiveDifficulty({ 'matemática': 0.2 }, undefined)).toBe('beginner');
    });

    it('calculates average correctly', () => {
      expect(calculateAdaptiveDifficulty({ 'a': 0.9, 'b': 0.7, 'c': 0.8 }, undefined)).toBe('intermediate');
    });
  });

  describe('getWeakTopics', () => {
    it('returns empty array for null metrics', () => {
      expect(getWeakTopics(null)).toEqual([]);
    });

    it('returns weak topics below threshold', () => {
      const metrics = {
        'a': 0.3,
        'b': 0.9,
        'c': 0.5,
        'd': 0.8,
      };
      const weak = getWeakTopics(metrics, 0.65);
      expect(weak).toEqual(['a', 'c']);
    });

    it('returns up to 3 topics', () => {
      const metrics = {
        'a': 0.3,
        'b': 0.4,
        'c': 0.5,
        'd': 0.6,
      };
      const weak = getWeakTopics(metrics, 0.65);
      expect(weak.length).toBeLessThanOrEqual(3);
      expect(weak).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });

    it('sorts topics alphabetically', () => {
      const metrics = {
        'z': 0.3,
        'a': 0.3,
        'm': 0.3,
      };
      const weak = getWeakTopics(metrics, 0.65);
      expect(weak).toEqual(['a', 'm', 'z']);
    });

    it('returns empty for all strong topics', () => {
      const metrics = {
        'a': 0.9,
        'b': 0.85,
        'c': 0.8,
      };
      expect(getWeakTopics(metrics, 0.65)).toEqual([]);
    });
  });

  describe('getStrongTopics', () => {
    it('returns strong topics above threshold', () => {
      const metrics = {
        'a': 0.9,
        'b': 0.8,
        'c': 0.5,
      };
      const strong = getStrongTopics(metrics, 0.8);
      expect(strong).toEqual(['a', 'b']);
    });

    it('returns empty for null metrics', () => {
      expect(getStrongTopics(null, 0.8)).toEqual([]);
    });
  });

  describe('buildAdaptivePromptInstructions', () => {
    it('returns beginner note when difficulty is beginner', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.3, 'b': 0.2, 'c': 0.1 },
        20
      );
      expect(prompt).toContain('ADAPTIVE NOTE: Student is learning fundamentals');
      expect(prompt).toContain('Keep questions very simple');
    });

    it('returns beginner note when difficulty is beginner', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.7, 'b': 0.75, 'c': 0.6 },
        30
      );
      expect(prompt).toContain('ADAPTIVE NOTE: Student is learning fundamentals');
    });

    it('returns advanced note when difficulty is advanced', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.95, 'b': 0.9, 'c': 0.85 },
        90
      );
      expect(prompt).toContain('ADAPTIVE NOTE: Student is advanced');
      expect(prompt).toContain('complex scenarios');
    });

    it('includes weak topics', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.3, 'b': 0.5, 'c': 0.7 },
        50
      );
      expect(prompt).toContain('FOCUS AREAS');
      expect(prompt).toContain('a');
      expect(prompt).toContain('b');
    });

    it('includes strong topics', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.95, 'b': 0.85, 'c': 0.7 },
        60
      );
      expect(prompt).toContain('STRENGTHS');
      expect(prompt).toContain('a');
    });

    it('returns only notes for relevant difficulty', () => {
      const prompt = buildAdaptivePromptInstructions(
        { 'a': 0.3, 'b': 0.2, 'c': 0.1 },
        15
      );
      const notes = prompt.split('\n');
      const relevant = notes.filter(n => n.includes('ADAPTIVE NOTE'));
      expect(relevant.length).toBe(1);
    });
  });

  describe('getRecommendedSubject', () => {
    it('returns undefined for empty quizzes', () => {
      expect(getRecommendedSubject([])).toBeUndefined();
    });

    it('returns subject with lowest average', () => {
      const quizzes = [
        { subject: 'matemática', score: 90, total: 10 },
        { subject: 'português', score: 70, total: 10 },
        { subject: 'estudo do meio', score: 80, total: 10 },
      ];
      const subject = getRecommendedSubject(quizzes);
      expect(subject).toBe('português');
    });

    it('returns the subject with lowest average score', () => {
      const quizzes = [
        { subject: 'matemática', score: 90, total: 10 },
        { subject: 'português', score: 80, total: 10 },
        { subject: 'estudo do meio', score: 50, total: 10 },
      ];
      const subject = getRecommendedSubject(quizzes);
      expect(subject).toBe('estudo do meio');
    });

    it('handles single quiz', () => {
      const quizzes = [{ subject: 'português', score: 95, total: 10 }];
      expect(getRecommendedSubject(quizzes)).toBe('português');
    });
  });

  describe('generateAdaptiveFeedback', () => {
    it('returns excellent for 90%+', () => {
      expect(generateAdaptiveFeedback(95, 100, null)).toBe('🌟 Excelente! Está a ir muito bem!');
    });

    it('returns very good for 80-89%', () => {
      expect(generateAdaptiveFeedback(85, 100, null)).toBe('👏 Muito bom! Continue assim!');
    });

    it('returns good for 70-79%', () => {
      expect(generateAdaptiveFeedback(75, 100, null)).toBe('✅ Bom esforço! Continue a praticar!');
    });

    it('returns OK for 50-69%', () => {
      expect(generateAdaptiveFeedback(60, 100, null)).toBe('💪 Está no caminho certo! Mais um pouco!');
    });

    it('returns low for below 50%', () => {
      expect(generateAdaptiveFeedback(30, 100, null)).toBe('📚 Não desista! Continue a treinar!');
    });

    it('returns only if total is 0', () => {
      expect(generateAdaptiveFeedback(0, 0, null)).toBe('📚 Não desista! Continue a treinar!');
    });
  });
});