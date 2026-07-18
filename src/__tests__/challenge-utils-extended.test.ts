import { describe, it, expect } from 'vitest';
import { normalizeText, validateAnswer, getCorrectAnswerText } from '@/lib/challenge-utils';
import type { LessonChallenge } from '@/app/shared-schemas';

describe('normalizeText', () => {
  it('converts to lowercase', () => {
    expect(normalizeText('HELLO')).toBe('hello');
  });

  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('removes accents', () => {
    expect(normalizeText('coração')).toBe('coracao');
    expect(normalizeText('áéíóú')).toBe('aeiou');
  });

  it('combines transformations', () => {
    expect(normalizeText('  CORAÇÃO  ')).toBe('coracao');
  });
});

describe('validateAnswer', () => {
  it('returns false for empty answer', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'multiple_choice',
      question: 'test',
      content: { correct_answer: 'A' },
    };
    expect(validateAnswer(challenge, '')).toBe(false);
    expect(validateAnswer(challenge, null)).toBe(false);
    expect(validateAnswer(challenge, undefined)).toBe(false);
  });

  it('validates multiple choice answers', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'multiple_choice',
      question: 'test',
      content: { correct_answer: 'A' },
    };
    expect(validateAnswer(challenge, 'A')).toBe(true);
    expect(validateAnswer(challenge, 'B')).toBe(false);
  });

  it('validates fill_blank answers with accent insensitivity', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'fill_blank',
      question: 'test',
      content: { correct_answers: ['coração', 'coracao'] },
    };
    expect(validateAnswer(challenge, 'coração')).toBe(true);
    expect(validateAnswer(challenge, 'coracao')).toBe(true);
    expect(validateAnswer(challenge, 'CORAÇÃO')).toBe(true);
    expect(validateAnswer(challenge, 'errado')).toBe(false);
  });

  it('validates word_order answers', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'word_order',
      question: 'test',
      content: { correct_order: ['A', 'B', 'C'] },
    };
    expect(validateAnswer(challenge, ['A', 'B', 'C'])).toBe(true);
    expect(validateAnswer(challenge, ['C', 'B', 'A'])).toBe(false);
  });

  it('validates matching answers', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'matching',
      question: 'test',
      content: { correct_matches: { '1': 'A', '2': 'B' } },
    };
    expect(validateAnswer(challenge, { '1': 'A', '2': 'B' })).toBe(true);
    expect(validateAnswer(challenge, { '1': 'B', '2': 'A' })).toBe(false);
  });
});

describe('getCorrectAnswerText', () => {
  it('returns correct answer for multiple choice', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'multiple_choice',
      question: 'test',
      content: { correct_answer: 'A' },
    };
    expect(getCorrectAnswerText(challenge)).toBe('A');
  });

  it('returns joined answers for fill_blank', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'fill_blank',
      question: 'test',
      content: { correct_answers: ['coração', 'coracao'] },
    };
    expect(getCorrectAnswerText(challenge)).toBe('coração ou coracao');
  });

  it('returns joined order for word_order', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'word_order',
      question: 'test',
      content: { correct_order: ['A', 'B', 'C'] },
    };
    expect(getCorrectAnswerText(challenge)).toBe('A B C');
  });

  it('returns formatted matches for matching', () => {
    const challenge: LessonChallenge = {
      id: '1',
      challenge_type: 'matching',
      question: 'test',
      content: { correct_matches: { '1': 'A', '2': 'B' } },
    };
    expect(getCorrectAnswerText(challenge)).toBe('1 -> A, 2 -> B');
  });
});
