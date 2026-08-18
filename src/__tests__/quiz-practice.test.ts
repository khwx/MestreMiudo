import { describe, it, expect } from 'vitest';
import { getWrongQuestions, hasWrongAnswers } from '@/lib/quiz-practice';
import type { QuizQuestion, Answer } from '@/app/shared-schemas';

function makeQuestion(question: string, correctAnswer: string): QuizQuestion {
  return {
    question,
    options: ['a', 'b', 'c', 'd'],
    correctAnswer,
    topic: 'Geral',
  };
}

function makeAnswer(question: string, isCorrect: boolean): Answer {
  return {
    question,
    selectedAnswer: 'x',
    correctAnswer: 'y',
    isCorrect,
    topic: 'Geral',
  };
}

describe('getWrongQuestions', () => {
  const qs = [
    makeQuestion('Q1', 'a'),
    makeQuestion('Q2', 'b'),
    makeQuestion('Q3', 'c'),
  ];

  it('returns only the questions answered incorrectly', () => {
    const answers = [
      makeAnswer('Q1', true),
      makeAnswer('Q2', false),
      makeAnswer('Q3', false),
    ];
    const wrong = getWrongQuestions(qs, answers);
    expect(wrong.map((q) => q.question)).toEqual(['Q2', 'Q3']);
  });

  it('returns an empty array when all answers are correct', () => {
    const answers = [makeAnswer('Q1', true), makeAnswer('Q2', true)];
    expect(getWrongQuestions(qs, answers)).toEqual([]);
  });

  it('preserves the original order of the questions', () => {
    const answers = [makeAnswer('Q3', false), makeAnswer('Q1', false)];
    expect(getWrongQuestions(qs, answers).map((q) => q.question)).toEqual(['Q1', 'Q3']);
  });
});

describe('hasWrongAnswers', () => {
  it('is true when at least one answer is wrong', () => {
    expect(hasWrongAnswers([makeAnswer('Q1', true), makeAnswer('Q2', false)])).toBe(true);
  });

  it('is false when every answer is correct', () => {
    expect(hasWrongAnswers([makeAnswer('Q1', true), makeAnswer('Q2', true)])).toBe(false);
  });

  it('is false for an empty answer list', () => {
    expect(hasWrongAnswers([])).toBe(false);
  });
});
