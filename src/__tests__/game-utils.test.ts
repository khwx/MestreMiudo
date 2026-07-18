import { describe, it, expect } from 'vitest';
import { formatTime, shuffleArray } from '@/lib/game-utils';

describe('formatTime', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats exact minutes', () => {
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(120)).toBe('2:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(599)).toBe('9:59');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(5)).toBe('0:05');
  });
});

describe('shuffleArray', () => {
  it('returns a new array with same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(original.length);
  });

  it('does not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    expect(original).toEqual(originalCopy);
  });

  it('contains all original elements', () => {
    const original = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleArray(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('handles single element array', () => {
    expect(shuffleArray([1])).toEqual([1]);
  });
});
