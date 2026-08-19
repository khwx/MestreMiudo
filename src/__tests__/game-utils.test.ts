import { describe, it, expect } from 'vitest';
import { formatTime, shuffleArray, getGridNavigationIndex } from '@/lib/game-utils';

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

describe('getGridNavigationIndex', () => {
  it('returns null for non-navigation keys', () => {
    expect(getGridNavigationIndex(0, 'Enter', 3, 9)).toBeNull();
    expect(getGridNavigationIndex(0, 'a', 3, 9)).toBeNull();
  });

  it('moves right and left within a row (3x3)', () => {
    expect(getGridNavigationIndex(0, 'ArrowRight', 3, 9)).toBe(1);
    expect(getGridNavigationIndex(1, 'ArrowLeft', 3, 9)).toBe(0);
  });

  it('clamps at the left edge', () => {
    expect(getGridNavigationIndex(0, 'ArrowLeft', 3, 9)).toBe(0);
  });

  it('moves up and down between rows (3x3)', () => {
    expect(getGridNavigationIndex(1, 'ArrowDown', 3, 9)).toBe(4);
    expect(getGridNavigationIndex(4, 'ArrowUp', 3, 9)).toBe(1);
  });

  it('clamps at the top edge', () => {
    expect(getGridNavigationIndex(0, 'ArrowUp', 3, 9)).toBe(0);
  });

  it('clamps at the bottom edge', () => {
    expect(getGridNavigationIndex(8, 'ArrowDown', 3, 9)).toBe(8);
  });

  it('moves Home to the first column and End to the last', () => {
    expect(getGridNavigationIndex(4, 'Home', 3, 9)).toBe(3);
    expect(getGridNavigationIndex(3, 'End', 3, 9)).toBe(5);
  });

  it('supports a partially-filled final row (7 columns, 26 items)', () => {
    // index 20 is row 2, col 6; ArrowDown clamps into last valid index 25
    expect(getGridNavigationIndex(20, 'ArrowDown', 7, 26)).toBe(25);
    expect(getGridNavigationIndex(25, 'ArrowRight', 7, 26)).toBe(25);
  });

  it('returns null for empty grids', () => {
    expect(getGridNavigationIndex(0, 'ArrowDown', 4, 0)).toBeNull();
  });
});
