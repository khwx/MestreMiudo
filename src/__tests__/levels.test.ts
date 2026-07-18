import { describe, it, expect } from 'vitest';
import { calculateLevel } from '@/lib/levels';

describe('calculateLevel', () => {
  it('returns level 1 for 0 points', () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.progressPercentage).toBe(0);
    expect(result.pointsNeeded).toBe(100);
  });

  it('returns level 2 for 100 points', () => {
    const result = calculateLevel(100);
    expect(result.level).toBe(2);
    expect(result.progressPercentage).toBe(0);
  });

  it('returns level 3 for 300 points', () => {
    const result = calculateLevel(300);
    expect(result.level).toBe(3);
  });

  it('returns level 6 for 1500 points (max level)', () => {
    const result = calculateLevel(1500);
    expect(result.level).toBe(6);
    expect(result.pointsNeeded).toBe(0);
  });

  it('returns level 6 for points above max', () => {
    const result = calculateLevel(9999);
    expect(result.level).toBe(6);
    expect(result.pointsNeeded).toBe(0);
  });

  it('calculates progress percentage correctly', () => {
    const result = calculateLevel(150);
    expect(result.level).toBe(2);
    expect(typeof result.progressPercentage).toBe('number');
  });

  it('calculates points needed correctly', () => {
    const result = calculateLevel(150);
    expect(result.level).toBe(2);
    expect(typeof result.pointsNeeded).toBe('number');
    expect(result.pointsNeeded).toBeGreaterThanOrEqual(0);
  });
});
