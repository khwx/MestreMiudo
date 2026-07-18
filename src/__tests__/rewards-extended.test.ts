import { describe, it, expect } from 'vitest';
import { getCurrentTier, getNextTierProgress, getDailyBonus } from '@/lib/rewards';

describe('getCurrentTier', () => {
  it('returns first tier for 0 points', () => {
    const tier = getCurrentTier(0);
    expect(tier.level).toBe(1);
    expect(tier.name).toBe('Aprendiz');
  });

  it('returns second tier for 100 points', () => {
    const tier = getCurrentTier(100);
    expect(tier.level).toBe(2);
    expect(tier.name).toBe('Estudante');
  });

  it('returns highest tier for very high points', () => {
    const tier = getCurrentTier(999999);
    expect(tier.level).toBeGreaterThan(1);
  });
});

describe('getNextTierProgress', () => {
  it('returns null next tier at max level', () => {
    const result = getNextTierProgress(999999);
    expect(result.nextTier).toBeNull();
    expect(result.percentage).toBe(100);
  });

  it('calculates progress correctly', () => {
    const result = getNextTierProgress(50);
    expect(result.currentTier.level).toBe(1);
    expect(result.nextTier).not.toBeNull();
    expect(result.pointsNeeded).toBeGreaterThan(0);
  });
});

describe('getDailyBonus', () => {
  it('returns 0 for 0 streak', () => {
    expect(getDailyBonus(0)).toBe(0);
  });

  it('returns 10 for 1 day streak', () => {
    expect(getDailyBonus(1)).toBe(10);
  });

  it('returns 100 for 10 day streak (capped)', () => {
    expect(getDailyBonus(10)).toBe(100);
  });

  it('caps at 100 for streak above 10', () => {
    expect(getDailyBonus(15)).toBe(100);
    expect(getDailyBonus(100)).toBe(100);
  });
});
