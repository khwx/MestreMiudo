import { describe, it, expect } from 'vitest';
import { validateQuestionForCurriculum, validateQuestionsForCurriculum, getRecommendedTopicsForGrade } from '@/lib/curriculum-validator';

describe('curriculum-validator', () => {
  describe('validateQuestionForCurriculum', () => {
    it('returns valid for a question with allowed topic for grade 1', () => {
      const question = 'Silabas';
      const result = validateQuestionForCurriculum(question, 1, "português");
      expect(result.isValid).toBe(true);
    });

    it('returns false for a topic in the FORBIDDEN list for grade 1', () => {
      const question = 'percentagem';
      const result = validateQuestionForCurriculum(question, 1, "português");
      expect(result.isValid).toBe(false);
    });

    it('returns true for a question with topic not in the forbidden list', () => {
      const question = 'Leitura';
      const result = validateQuestionForCurriculum(question, 1, "português");
      expect(result.isValid).toBe(true);
    });

    it('returns true for a question in GRADE_3_4_ONLY list for grade 2', () => {
      const question = 'fração';
      const result = validateQuestionForCurriculum(question, 2, "português");
      expect(result.isValid).toBe(true);
    });

    it('returns true for a question in GRADE_3_4_ONLY list for grade 3', () => {
      const question = 'fração';
      const result = validateQuestionForCurriculum(question, 3, "português");
      expect(result.isValid).toBe(true);
    });

    it('returns false for a topic in GRADE_5_PLUS_ONLY list for grade 4', () => {
      const question = 'percentagem';
      const result = validateQuestionForCurriculum(question, 4, "português");
      expect(result.isValid).toBe(false);
    });
  });

  describe('getRecommendedTopicsForGrade', () => {
    it('returns topics for grade 1', () => {
      const topics = getRecommendedTopicsForGrade(1, 'português');
      expect(topics).toBeInstanceOf(Array);
      expect(topics.length).toBeGreaterThan(0);
    });

    it('returns topics for grade 4', () => {
      const topics = getRecommendedTopicsForGrade(4, 'português');
      expect(topics).toBeInstanceOf(Array);
    });

    it('returns empty for grade not in curriculum', () => {
      const topics = getRecommendedTopicsForGrade(5, 'português');
      expect(topics).toEqual([]);
    });

    it('returns different topics for different grades', () => {
      const topics1 = getRecommendedTopicsForGrade(1, 'português');
      const topics2 = getRecommendedTopicsForGrade(2, 'português');
      // They should have different topics
      expect(topics1.length).toBeGreaterThan(0);
      expect(topics2.length).toBeGreaterThan(0);
    });
  });

  describe('validateQuestionsForCurriculum', () => {
    it('returns valid for array of valid questions', () => {
      const questions = [
        { question: 'Silabas', grade: 1, subject: 'Silabas' },
        { question: 'Vogais', grade: 1, subject: 'Vogais' },
      ];
      const result = validateQuestionsForCurriculum(questions);
      expect(result).toBeInstanceOf(Object);
      expect(result.valid).toBe(2);
      expect(result.invalid).toBe(0);
      expect(result.issues).toEqual([]);
    });

    it('returns false for array with a forbidden topic', () => {
      const questions = [
        { question: 'Silabas', grade: 1, subject: 'Silabas' },
        { question: 'percentagem', grade: 1, subject: 'percentagem' },
      ];
      const result = validateQuestionsForCurriculum(questions);
      expect(result.invalid).toBe(1);
      expect(result.valid).toBe(1);
    });

    it('returns array of valid results', () => {
      const questions = [
        { question: 'Silabas', grade: 1, subject: 'Silabas' },
        { question: 'Leitura', grade: 1, subject: 'Leitura' },
      ];
      const result = validateQuestionsForCurriculum(questions);
      expect(result.valid).toBe(2);
      expect(result.invalid).toBe(0);
    });
  });
});