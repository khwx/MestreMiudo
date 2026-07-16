import { describe, it, expect } from 'vitest';
import { normalizeText, validateAnswer } from '@/lib/challenge-utils';
import type { LessonChallenge } from '@/app/shared-schemas';

describe('normalizeText', () => {
  it('converts to lowercase', () => {
    expect(normalizeText('Hello')).toBe('hello');
  });

  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('removes accents', () => {
    expect(normalizeText('coração')).toBe('coracao');
    expect(normalizeText('áéíóú')).toBe('aeiou');
  });

  it('combines transformations', () => {
    expect(normalizeText('  Coração  ')).toBe('coracao');
  });
});

describe('validateAnswer', () => {
  const createChallenge = (type: LessonChallenge['challenge_type'], content: Record<string, unknown>): LessonChallenge => ({
    id: 'test',
    challenge_type: type,
    content,
    question: 'Test question',
  } as LessonChallenge);

  it('validates multiple choice answers', () => {
    const challenge = createChallenge('multiple_choice', { correct_answer: 'B' });
    expect(validateAnswer(challenge, 'B')).toBe(true);
    expect(validateAnswer(challenge, 'A')).toBe(false);
  });

  it('validates fill blank answers with accent normalization', () => {
    const challenge = createChallenge('fill_blank', { correct_answers: ['coração', 'coracao'] });
    expect(validateAnswer(challenge, 'coração')).toBe(true);
    expect(validateAnswer(challenge, 'coracao')).toBe(true);
    expect(validateAnswer(challenge, 'CORAÇÃO')).toBe(true);
    expect(validateAnswer(challenge, 'errado')).toBe(false);
  });

  it('validates word order answers', () => {
    const challenge = createChallenge('word_order', { correct_order: ['A', 'B', 'C'] });
    expect(validateAnswer(challenge, ['A', 'B', 'C'])).toBe(true);
    expect(validateAnswer(challenge, ['C', 'B', 'A'])).toBe(false);
  });

  it('validates matching answers', () => {
    const challenge = createChallenge('matching', { correct_matches: { '1': 'A', '2': 'B' } });
    expect(validateAnswer(challenge, { '1': 'A', '2': 'B' })).toBe(true);
    expect(validateAnswer(challenge, { '1': 'B', '2': 'A' })).toBe(false);
  });

  it('returns false for empty answers', () => {
    const challenge = createChallenge('multiple_choice', { correct_answer: 'B' });
    expect(validateAnswer(challenge, null)).toBe(false);
    expect(validateAnswer(challenge, undefined)).toBe(false);
    expect(validateAnswer(challenge, '')).toBe(false);
  });

  it('returns false for unknown challenge types', () => {
    const challenge = createChallenge('multiple_choice', { correct_answer: 'B' });
    challenge.challenge_type = 'unknown' as LessonChallenge['challenge_type'];
    expect(validateAnswer(challenge, 'B')).toBe(false);
  });
});
