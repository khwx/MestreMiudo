import { describe, it, expect } from 'vitest';
import {
  starsForScore,
  encodeChallenge,
  decodeChallenge,
  buildChallengeShareText,
  buildChallengeLink,
  compareChallenge,
  subjectToSlug,
  type QuizChallenge,
} from '@/lib/challenge-share';

const sample: QuizChallenge = {
  from: 'Ana',
  subject: 'Matemática',
  grade: 2,
  score: 4,
  total: 5,
  stars: 2,
};

describe('starsForScore', () => {
  it('gives 3 stars for a perfect score', () => {
    expect(starsForScore(5, 5)).toBe(3);
  });
  it('gives 2 stars at or above 60%', () => {
    expect(starsForScore(3, 5)).toBe(2);
  });
  it('gives 1 star below 60%', () => {
    expect(starsForScore(1, 5)).toBe(1);
  });
  it('handles zero total safely', () => {
    expect(starsForScore(0, 0)).toBe(0);
  });
});

describe('subjectToSlug', () => {
  it('maps subjects to slugs', () => {
    expect(subjectToSlug('Português')).toBe('portugues');
    expect(subjectToSlug('Estudo do Meio')).toBe('estudo-do-meio');
    expect(subjectToSlug('Misto')).toBe('misto');
  });
});

describe('encodeChallenge / decodeChallenge', () => {
  it('round-trips a challenge', () => {
    const encoded = encodeChallenge(sample);
    expect(decodeChallenge(encoded)).toEqual(sample);
  });

  it('produces a URL-safe string', () => {
    const encoded = encodeChallenge(sample);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('handles accents and emoji in names', () => {
    const withAccent: QuizChallenge = { ...sample, from: 'João 🚀' };
    expect(decodeChallenge(encodeChallenge(withAccent))).toEqual(withAccent);
  });

  it('returns null for invalid input', () => {
    expect(decodeChallenge('')).toBeNull();
    expect(decodeChallenge(null)).toBeNull();
    expect(decodeChallenge('not-valid-base64!!!')).toBeNull();
    expect(decodeChallenge(undefined)).toBeNull();
  });

  it('returns null for tampered JSON', () => {
    const encoded = encodeChallenge(sample);
    const tampered = encoded.slice(0, -2);
    expect(decodeChallenge(tampered)).toBeNull();
  });
});

describe('buildChallengeShareText', () => {
  it('includes the challenger name, score and subject', () => {
    const text = buildChallengeShareText(sample);
    expect(text).toContain('Ana');
    expect(text).toContain('4/5');
    expect(text).toContain('Matemática');
    expect(text).toContain('⭐⭐');
  });
});

describe('buildChallengeLink', () => {
  it('builds a link to the quiz subject with the challenge param', () => {
    const link = buildChallengeLink(sample, 'https://exemplo.pt');
    expect(link).toBe(
      `https://exemplo.pt/quiz/matematica?challenge=${encodeChallenge(sample)}&grade=2`
    );
  });
});

describe('compareChallenge', () => {
  it('reports a win when beating the score', () => {
    const result = compareChallenge(sample, 5);
    expect(result.beat).toBe(true);
    expect(result.message).toContain('5');
  });
  it('reports a tie', () => {
    const result = compareChallenge(sample, 4);
    expect(result.beat).toBe(false);
    expect(result.message).toContain('Empataste');
  });
  it('reports a loss', () => {
    const result = compareChallenge(sample, 2);
    expect(result.beat).toBe(false);
    expect(result.message).toContain('ganhou');
  });
});
