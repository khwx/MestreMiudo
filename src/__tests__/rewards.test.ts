import { describe, it, expect } from 'vitest';
import { calculateQuizPoints, getCurrentTier, getNextTierProgress, checkBadges, getDailyBonus, generateCelebrationMessage } from '@/lib/rewards';

describe('calculateQuizPoints', () => {
  it('calculates base points correctly', () => {
    const points = calculateQuizPoints(5, 5, 1);
    expect(points).toBeGreaterThan(0);
  });

  it('gives bonus for perfect score', () => {
    const perfectPoints = calculateQuizPoints(5, 5, 1);
    const partialPoints = calculateQuizPoints(3, 5, 1);
    expect(perfectPoints).toBeGreaterThan(partialPoints);
  });

  it('applies grade multiplier', () => {
    const grade1Points = calculateQuizPoints(5, 5, 1);
    const grade4Points = calculateQuizPoints(5, 5, 4);
    expect(grade4Points).toBeGreaterThan(grade1Points);
  });

  it('handles zero score', () => {
    const points = calculateQuizPoints(0, 5, 1);
    expect(points).toBeGreaterThanOrEqual(0);
  });
});

describe('getCurrentTier', () => {
  it('returns tier 1 for 0 points', () => {
    const tier = getCurrentTier(0);
    expect(tier.level).toBe(1);
    expect(tier.name).toBe('Aprendiz');
  });

  it('returns tier 2 for 100 points', () => {
    const tier = getCurrentTier(100);
    expect(tier.level).toBe(2);
    expect(tier.name).toBe('Estudante');
  });

  it('returns tier 5 for 1000 points', () => {
    const tier = getCurrentTier(1000);
    expect(tier.level).toBe(5);
    expect(tier.name).toBe('Mestre');
  });

  it('returns tier 5 for points beyond max', () => {
    const tier = getCurrentTier(9999);
    expect(tier.level).toBe(5);
  });
});

describe('getNextTierProgress', () => {
  it('returns correct progress for mid-tier points', () => {
    const progress = getNextTierProgress(200);
    expect(progress.currentTier.level).toBe(2);
    expect(progress.nextTier?.level).toBe(3);
    expect(progress.pointsNeeded).toBe(100);
  });

  it('returns 100% for max tier', () => {
    const progress = getNextTierProgress(1000);
    expect(progress.percentage).toBe(100);
    expect(progress.nextTier).toBeNull();
  });

  it('calculates percentage correctly', () => {
    const progress = getNextTierProgress(150);
    expect(progress.currentTier.level).toBe(2);
    expect(progress.pointsInCurrentTier).toBe(50);
    expect(progress.pointsNeeded).toBe(150);
  });
});

describe('checkBadges', () => {
  it('returns first_quiz badge for 1 quiz', () => {
    const badges = checkBadges({
      totalQuizzes: 1,
      totalCorrectAnswers: 5,
      perfectScores: 0,
      dailyQuizzes: 1,
      dayStreak: 1,
      subjectScores: {},
    });
    expect(badges).toContain('first_quiz');
  });

  it('returns perfect_10 badge for 10 correct answers', () => {
    const badges = checkBadges({
      totalQuizzes: 2,
      totalCorrectAnswers: 10,
      perfectScores: 0,
      dailyQuizzes: 1,
      dayStreak: 1,
      subjectScores: {},
    });
    expect(badges).toContain('perfect_10');
  });

  it('returns consistency badge for 7 day streak', () => {
    const badges = checkBadges({
      totalQuizzes: 7,
      totalCorrectAnswers: 20,
      perfectScores: 1,
      dailyQuizzes: 1,
      dayStreak: 7,
      subjectScores: {},
    });
    expect(badges).toContain('consistency');
  });

  it('returns subject expert badges for high scores', () => {
    const badges = checkBadges({
      totalQuizzes: 1,
      totalCorrectAnswers: 10,
      perfectScores: 1,
      dailyQuizzes: 1,
      dayStreak: 1,
      subjectScores: {
        'Português': 100,
        'Matemática': 100,
        'Estudo do Meio': 100,
      },
    });
    expect(badges).toContain('portuguese_expert');
    expect(badges).toContain('math_wizard');
    expect(badges).toContain('nature_expert');
  });

  it('returns allrounder badge for high scores in all subjects', () => {
    const badges = checkBadges({
      totalQuizzes: 3,
      totalCorrectAnswers: 20,
      perfectScores: 1,
      dailyQuizzes: 1,
      dayStreak: 1,
      subjectScores: {
        'Português': 90,
        'Matemática': 90,
        'Estudo do Meio': 90,
      },
    });
    expect(badges).toContain('allrounder');
  });
});

describe('getDailyBonus', () => {
  it('returns 0 for 0 streak', () => {
    expect(getDailyBonus(0)).toBe(0);
  });

  it('returns 10 for 1 day streak', () => {
    expect(getDailyBonus(1)).toBe(10);
  });

  it('caps at 100', () => {
    expect(getDailyBonus(20)).toBe(100);
  });

  it('returns correct value for 5 day streak', () => {
    expect(getDailyBonus(5)).toBe(50);
  });
});

describe('generateCelebrationMessage', () => {
  it('returns a message with points', () => {
    const message = generateCelebrationMessage(5, 5, 50);
    expect(message).toContain('+50');
  });

  it('returns perfect message for 100%', () => {
    const message = generateCelebrationMessage(5, 5, 50);
    expect(message.length).toBeGreaterThan(0);
  });

  it('returns practice message for low scores', () => {
    const message = generateCelebrationMessage(1, 5, 10);
    expect(message.length).toBeGreaterThan(0);
  });
});
