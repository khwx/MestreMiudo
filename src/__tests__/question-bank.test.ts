import { describe, it, expect } from 'vitest';
import * as questionBankModule from '@/lib/question-bank';
import type { Question, Subject, GradeLevel, QuestionType } from '@/lib/question-bank';

describe('lib/question-bank (re-export module)', () => {
  it('re-exports the full question bank', () => {
    expect(Array.isArray(questionBankModule.questionBank)).toBe(true);
    expect(questionBankModule.questionBank.length).toBeGreaterThan(0);
  });

  it('exposes all the query helper functions', () => {
    expect(typeof questionBankModule.getAllQuestions).toBe('function');
    expect(typeof questionBankModule.getFilteredQuestions).toBe('function');
    expect(typeof questionBankModule.getRandomQuestions).toBe('function');
    expect(typeof questionBankModule.getQuestionsBySubjectAndGrade).toBe('function');
    expect(typeof questionBankModule.getTopicsForSubjectAndGrade).toBe('function');
    expect(typeof questionBankModule.getQuestionStats).toBe('function');
    expect(typeof questionBankModule.validateAnswer).toBe('function');
  });

  it('returns the same array reference from getAllQuestions as the bank', () => {
    expect(questionBankModule.getAllQuestions()).toBe(questionBankModule.questionBank);
  });

  it('re-exported functions operate on the same bank (filtered matches)', () => {
    const all = questionBankModule.getAllQuestions();
    const filtered = questionBankModule.getFilteredQuestions({ subject: 'Matematica', gradeLevel: 4 });
    expect(filtered.length).toBeLessThanOrEqual(all.length);
    filtered.forEach((q) => {
      expect(q.subject).toBe('Matematica');
      expect(q.gradeLevel).toBe(4);
    });
  });

  it('getRandomQuestions respects the count cap', () => {
    const result = questionBankModule.getRandomQuestions(3);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getQuestionStats reports a total consistent with the bank length', () => {
    const stats = questionBankModule.getQuestionStats();
    expect(stats.total).toBe(questionBankModule.questionBank.length);
  });

  it('validateAnswer works for string and array correct answers', () => {
    const stringQ: Question = {
      id: 'q1',
      subject: 'Portugues',
      gradeLevel: 1,
      topic: 'Test',
      difficulty: 'easy',
      type: 'multiple_choice',
      question: '?',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'x',
    };
    expect(questionBankModule.validateAnswer(stringQ, 'A')).toBe(true);
    expect(questionBankModule.validateAnswer(stringQ, 'B')).toBe(false);
  });

  it('exports the type aliases used elsewhere', () => {
    const _subject: Subject = 'Matematica';
    const _grade: GradeLevel = 3;
    const _type: QuestionType = 'matching';
    expect(_subject).toBe('Matematica');
    expect(_grade).toBe(3);
    expect(_type).toBe('matching');
  });
});
