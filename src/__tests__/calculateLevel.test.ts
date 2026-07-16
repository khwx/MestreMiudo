import { describe, it, expect } from 'vitest';
import { calculateLevel } from '@/app/dashboard/client-page';

describe('calculateLevel', () => {
  it('returns level 1 for 0 points', () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.progressPercentage).toBe(0);
  });

  it('returns level 2 for 100 points', () => {
    const result = calculateLevel(100);
    expect(result.level).toBe(2);
    expect(result.progressPercentage).toBe(0);
  });

  it('returns level 3 for 300 points', () => {
    const result = calculateLevel(300);
    expect(result.level).toBe(3);
    expect(result.progressPercentage).toBe(0);
  });

  it('calculates progress percentage correctly', () => {
    const result = calculateLevel(150);
    expect(result.level).toBe(2);
    expect(result.progressPercentage).toBe(25);
    expect(result.pointsNeeded).toBe(150);
  });

  it('calculates points needed correctly', () => {
    const result = calculateLevel(150);
    expect(result.pointsNeeded).toBe(150);
  });

  it('returns level 6 for 1500 points', () => {
    const result = calculateLevel(1500);
    expect(result.level).toBe(6);
    expect(result.pointsNeeded).toBe(0);
  });

  it('returns level 6 for points beyond max', () => {
    const result = calculateLevel(9999);
    expect(result.level).toBe(6);
    expect(result.pointsNeeded).toBe(0);
  });

  it('handles fractional points', () => {
    const result = calculateLevel(50);
    expect(result.level).toBe(1);
    expect(result.progressPercentage).toBe(50);
    expect(result.pointsNeeded).toBe(50);
  });
});
