import { describe, it, expect } from 'vitest';
import { getCorrectAnswerText } from '@/lib/challenge-utils';
import type { LessonChallenge } from '@/app/shared-schemas';

describe('getCorrectAnswerText', () => {
  it('returns correct answer for multiple choice', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'multiple_choice',
      content: { correct_answer: 'B' },
      question: 'Test',
    };
    expect(getCorrectAnswerText(challenge)).toBe('B');
  });

  it('returns joined correct answers for fill blank', () => {
    const challenge: LessonChallenge = {
      id: '2',
      challenge_type: 'fill_blank',
      content: { correct_answers: ['coração', 'coracao'] },
      question: 'Test',
    };
    expect(getCorrectAnswerText(challenge)).toBe('coração ou coracao');
  });

  it('returns joined correct answers for fill blank with single answer', () => {
    const challenge: LessonChallenge = {
      id: '3',
      challenge_type: 'fill_blank',
      content: { correct_answer: 'coração' },
      question: 'Test',
    };
    expect(getCorrectAnswerText(challenge)).toBe('coração');
  });

  it('returns joined correct order for word order', () => {
    const challenge: LessonChallenge = {
      id: '4',
      challenge_type: 'word_order',
      content: { correct_order: ['A', 'B', 'C'] },
      question: 'Test',
    };
    expect(getCorrectAnswerText(challenge)).toBe('A B C');
  });

  it('returns joined correct matches for matching', () => {
    const challenge: LessonChallenge = {
      id: '5',
      challenge_type: 'matching',
      content: { correct_matches: { '1': 'A', '2': 'B' } },
      question: 'Test',
    };
    expect(getCorrectAnswerText(challenge)).toBe('1 -> A, 2 -> B');
  });

  it('returns default text for unknown challenge types', () => {
    const challenge = {
      id: '6',
      challenge_type: 'unknown',
      content: {},
      question: 'Test',
    } as unknown as LessonChallenge;
    expect(getCorrectAnswerText(challenge)).toBe('resposta correta');
  });
});
