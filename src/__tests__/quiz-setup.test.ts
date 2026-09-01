import { describe, it, expect } from 'vitest';
import {
  getQuizLengthOptions,
  isValidQuizLength,
  QUIZ_LENGTH_OPTIONS,
} from '@/lib/quiz-setup';

describe('quiz-setup helpers', () => {
  it('offers a fixed set of valid question counts', () => {
    expect(getQuizLengthOptions()).toEqual([5, 10, 15]);
  });

  it('validates known quiz lengths', () => {
    expect(isValidQuizLength(5)).toBe(true);
    expect(isValidQuizLength(10)).toBe(true);
    expect(isValidQuizLength(15)).toBe(true);
  });

  it('rejects unknown or out-of-range lengths', () => {
    expect(isValidQuizLength(4)).toBe(false);
    expect(isValidQuizLength(6)).toBe(false);
    expect(isValidQuizLength(20)).toBe(false);
    expect(isValidQuizLength(0)).toBe(false);
  });

  it('exports the same options used by the component', () => {
    expect(QUIZ_LENGTH_OPTIONS).toBe(getQuizLengthOptions());
  });
});
