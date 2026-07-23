import { describe, it, expect } from 'vitest';
import {
  questionBank,
  getAllQuestions,
  getFilteredQuestions,
  getRandomQuestions,
  getQuestionsBySubjectAndGrade,
  getTopicsForSubjectAndGrade,
  getQuestionStats,
  validateAnswer,
} from '@/lib/questions';
import type { Question } from '@/lib/questions';

describe('questionBank', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(questionBank)).toBe(true);
    expect(questionBank.length).toBeGreaterThan(0);
  });

  it('all questions have required fields', () => {
    questionBank.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.subject).toBeTruthy();
      expect(q.gradeLevel).toBeGreaterThanOrEqual(1);
      expect(q.gradeLevel).toBeLessThanOrEqual(4);
      expect(q.topic).toBeTruthy();
      expect(['easy', 'normal', 'hard']).toContain(q.difficulty);
      expect(['multiple_choice', 'fill_blank', 'true_false', 'matching']).toContain(q.type);
      expect(q.question).toBeTruthy();
      expect(q.correctAnswer).toBeTruthy();
      expect(q.explanation).toBeTruthy();
    });
  });

  it('no duplicate IDs', () => {
    const ids = questionBank.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getAllQuestions', () => {
  it('returns the full question bank', () => {
    expect(getAllQuestions()).toBe(questionBank);
  });
});

describe('getFilteredQuestions', () => {
  it('filters by subject', () => {
    const result = getFilteredQuestions({ subject: 'Portugues' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => expect(q.subject).toBe('Portugues'));
  });

  it('filters by gradeLevel', () => {
    const result = getFilteredQuestions({ gradeLevel: 3 });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => expect(q.gradeLevel).toBe(3));
  });

  it('filters by subject and gradeLevel', () => {
    const result = getFilteredQuestions({ subject: 'Matematica', gradeLevel: 2 });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => {
      expect(q.subject).toBe('Matematica');
      expect(q.gradeLevel).toBe(2);
    });
  });

  it('filters by difficulty', () => {
    const result = getFilteredQuestions({ difficulty: 'hard' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => expect(q.difficulty).toBe('hard'));
  });

  it('filters by type', () => {
    const result = getFilteredQuestions({ type: 'true_false' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => expect(q.type).toBe('true_false'));
  });

  it('returns empty for impossible filter', () => {
    const result = getFilteredQuestions({ subject: 'Portugues', gradeLevel: 99 as 1 | 2 | 3 | 4 });
    expect(result.length).toBe(0);
  });
});

describe('getRandomQuestions', () => {
  it('returns requested count or less', () => {
    const result = getRandomQuestions(5);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('respects filters', () => {
    const result = getRandomQuestions(10, { subject: 'Estudo do Meio', gradeLevel: 1 });
    expect(result.length).toBeLessThanOrEqual(10);
    result.forEach((q) => {
      expect(q.subject).toBe('Estudo do Meio');
      expect(q.gradeLevel).toBe(1);
    });
  });

  it('returns unique questions', () => {
    const result = getRandomQuestions(20);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getQuestionsBySubjectAndGrade', () => {
  it('returns questions for a specific subject and grade', () => {
    const result = getQuestionsBySubjectAndGrade('Matematica', 4);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => {
      expect(q.subject).toBe('Matematica');
      expect(q.gradeLevel).toBe(4);
    });
  });
});

describe('getTopicsForSubjectAndGrade', () => {
  it('returns unique topic strings', () => {
    const topics = getTopicsForSubjectAndGrade('Portugues', 1);
    expect(topics.length).toBeGreaterThan(0);
    topics.forEach((t) => expect(typeof t).toBe('string'));
  });

  it('returns no duplicates', () => {
    const topics = getTopicsForSubjectAndGrade('Portugues', 1);
    expect(new Set(topics).size).toBe(topics.length);
  });
});

describe('getQuestionStats', () => {
  it('returns correct total', () => {
    const stats = getQuestionStats();
    expect(stats.total).toBe(questionBank.length);
  });

  it('has counts for each subject', () => {
    const stats = getQuestionStats();
    expect(stats.bySubject['Portugues']).toBeGreaterThan(0);
    expect(stats.bySubject['Matematica']).toBeGreaterThan(0);
    expect(stats.bySubject['Estudo do Meio']).toBeGreaterThan(0);
  });

  it('has counts for each grade', () => {
    const stats = getQuestionStats();
    expect(stats.byGrade[1]).toBeGreaterThan(0);
    expect(stats.byGrade[2]).toBeGreaterThan(0);
    expect(stats.byGrade[3]).toBeGreaterThan(0);
    expect(stats.byGrade[4]).toBeGreaterThan(0);
  });

  it('sums to total', () => {
    const stats = getQuestionStats();
    const subjectSum = Object.values(stats.bySubject).reduce((a, b) => a + b, 0);
    const gradeSum = Object.values(stats.byGrade).reduce((a, b) => a + b, 0);
    expect(subjectSum).toBe(stats.total);
    expect(gradeSum).toBe(stats.total);
  });
});

describe('validateAnswer', () => {
  it('validates correct string answer', () => {
    const q: Question = {
      id: 'test-1',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'multiple_choice',
      question: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Test',
    };
    expect(validateAnswer(q, 'A')).toBe(true);
  });

  it('rejects wrong string answer', () => {
    const q: Question = {
      id: 'test-2',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'multiple_choice',
      question: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Test',
    };
    expect(validateAnswer(q, 'B')).toBe(false);
  });

  it('validates correct array answer', () => {
    const q: Question = {
      id: 'test-3',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'matching',
      question: 'Match?',
      correctAnswer: ['A', 'B', 'C'],
      explanation: 'Test',
    };
    expect(validateAnswer(q, ['C', 'A', 'B'])).toBe(true);
  });

  it('rejects wrong array answer', () => {
    const q: Question = {
      id: 'test-4',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'matching',
      question: 'Match?',
      correctAnswer: ['A', 'B', 'C'],
      explanation: 'Test',
    };
    expect(validateAnswer(q, ['A', 'B'])).toBe(false);
  });

  it('rejects string when array expected', () => {
    const q: Question = {
      id: 'test-5',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'matching',
      question: 'Match?',
      correctAnswer: ['A', 'B'],
      explanation: 'Test',
    };
    expect(validateAnswer(q, 'A')).toBe(false);
  });
});
