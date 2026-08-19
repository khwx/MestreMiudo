import { describe, it, expect } from 'vitest';
import {
  getWrongQuestions,
  hasWrongAnswers,
  buildTopicPerformance,
  getWeakTopicsFromAnswers,
  getQuestionsForWeakTopics,
} from '@/lib/quiz-practice';
import type { QuizQuestion, Answer } from '@/app/shared-schemas';

function makeQuestion(question: string, correctAnswer: string, topic = 'Geral'): QuizQuestion {
  return {
    question,
    options: ['a', 'b', 'c', 'd'],
    correctAnswer,
    topic,
  };
}

function makeAnswer(question: string, isCorrect: boolean, topic = 'Geral'): Answer {
  return {
    question,
    selectedAnswer: 'x',
    correctAnswer: 'y',
    isCorrect,
    topic,
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

describe('buildTopicPerformance', () => {
  it('returns empty object for no answers', () => {
    expect(buildTopicPerformance([])).toEqual({});
  });

  it('computes a 0-1 ratio per topic', () => {
    const answers = [
      makeAnswer('q1', true, 'Números'),
      makeAnswer('q2', false, 'Números'),
      makeAnswer('q3', true, 'Vogais'),
    ];
    const result = buildTopicPerformance(answers);
    expect(result['Números']).toBe(0.5);
    expect(result['Vogais']).toBe(1);
  });

  it('defaults missing topic to Geral', () => {
    const answers = [
      { question: 'q', selectedAnswer: 'x', correctAnswer: 'y', isCorrect: false, topic: '' },
    ];
    expect(buildTopicPerformance(answers)).toEqual({ Geral: 0 });
  });
});

describe('getWeakTopicsFromAnswers', () => {
  it('returns empty array when no answers', () => {
    expect(getWeakTopicsFromAnswers([])).toEqual([]);
  });

  it('returns topics with correctness below the threshold', () => {
    const answers = [
      makeAnswer('q1', false, 'Números'),
      makeAnswer('q2', false, 'Números'),
      makeAnswer('q3', true, 'Vogais'),
      makeAnswer('q4', true, 'Vogais'),
    ];
    const weak = getWeakTopicsFromAnswers(answers, 0.65);
    expect(weak).toEqual(expect.arrayContaining(['Números']));
    expect(weak).not.toContain('Vogais');
  });

  it('respects a custom threshold', () => {
    const answers: Answer[] = [
      makeAnswer('q1', true, 'Geo'),
      makeAnswer('q2', false, 'Geo'),
    ];
    // 0.5 ratio
    expect(getWeakTopicsFromAnswers(answers, 0.6)).toEqual(['Geo']);
    expect(getWeakTopicsFromAnswers(answers, 0.4)).toEqual([]);
  });

  it('caps the number of weak topics to 3 (inherited from getWeakTopics)', () => {
    const answers: Answer[] = [];
    for (const topic of ['a', 'b', 'c', 'd']) {
      answers.push(makeAnswer('q', false, topic));
    }
    expect(getWeakTopicsFromAnswers(answers).length).toBeLessThanOrEqual(3);
  });
});

describe('getQuestionsForWeakTopics', () => {
  const qs: QuizQuestion[] = [
    makeQuestion('Q1', 'a', 'Números'),
    makeQuestion('Q2', 'b', 'Vogais'),
    makeQuestion('Q3', 'c', 'Números'),
  ];

  it('returns only questions whose topic is weak', () => {
    const result = getQuestionsForWeakTopics(qs, ['Números']);
    expect(result.map((q) => q.question)).toEqual(['Q1', 'Q3']);
  });

  it('preserves original order', () => {
    const reordered = [qs[2], qs[1], qs[0]];
    const result = getQuestionsForWeakTopics(reordered, ['Números']);
    expect(result.map((q) => q.question)).toEqual(['Q3', 'Q1']);
  });

  it('returns empty array when there are no weak topics', () => {
    expect(getQuestionsForWeakTopics(qs, [])).toEqual([]);
  });

  it('returns empty array when no question matches the weak topics', () => {
    expect(getQuestionsForWeakTopics(qs, ['Outro'])).toEqual([]);
  });
});
