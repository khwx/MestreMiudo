import { describe, it, expect } from 'vitest';
import { calculateStars, calculateCoins } from '@/lib/lessons/progress';

describe('calculateStars', () => {
  it('returns 3 stars for 100% score', () => {
    expect(calculateStars(100)).toBe(3);
  });

  it('returns 2 stars for 80-99% score', () => {
    expect(calculateStars(80)).toBe(2);
    expect(calculateStars(95)).toBe(2);
    expect(calculateStars(99)).toBe(2);
  });

  it('returns 1 star for 60-79% score', () => {
    expect(calculateStars(60)).toBe(1);
    expect(calculateStars(70)).toBe(1);
    expect(calculateStars(79)).toBe(1);
  });

  it('returns 0 stars for below 60% score', () => {
    expect(calculateStars(0)).toBe(0);
    expect(calculateStars(59)).toBe(0);
    expect(calculateStars(30)).toBe(0);
  });
});

describe('calculateCoins', () => {
  it('returns 50 coins for 3 stars', () => {
    expect(calculateCoins(3)).toBe(50);
  });

  it('returns 25 coins for 2 stars', () => {
    expect(calculateCoins(2)).toBe(25);
  });

  it('returns 10 coins for 1 star', () => {
    expect(calculateCoins(1)).toBe(10);
  });

  it('returns 0 coins for 0 stars', () => {
    expect(calculateCoins(0)).toBe(0);
  });

  it('adds daily bonus when isDailyBonus is true', () => {
    expect(calculateCoins(3, true)).toBe(70);
    expect(calculateCoins(2, true)).toBe(45);
    expect(calculateCoins(1, true)).toBe(30);
    expect(calculateCoins(0, true)).toBe(20);
  });

  it('returns 0 for unknown star values', () => {
    expect(calculateCoins(4)).toBe(0);
    expect(calculateCoins(-1)).toBe(0);
  });
});
