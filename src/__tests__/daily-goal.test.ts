import { describe, it, expect } from 'vitest';
import {
  getDailyGoalProgress,
  countQuizzesOnDate,
  getTodayDateStr,
} from '@/lib/daily-goal';

describe('getDailyGoalProgress', () => {
  it('computes percentage, remaining and achieved correctly', () => {
    const p = getDailyGoalProgress(2, 5);
    expect(p.done).toBe(2);
    expect(p.target).toBe(5);
    expect(p.remaining).toBe(3);
    expect(p.achieved).toBe(false);
    expect(p.percentage).toBe(40);
  });

  it('marks achieved when done equals target', () => {
    const p = getDailyGoalProgress(5, 5);
    expect(p.achieved).toBe(true);
    expect(p.remaining).toBe(0);
    expect(p.percentage).toBe(100);
  });

  it('caps percentage at 100 when done exceeds target', () => {
    const p = getDailyGoalProgress(8, 5);
    expect(p.achieved).toBe(true);
    expect(p.percentage).toBe(100);
    expect(p.remaining).toBe(0);
  });

  it('handles a target of zero as no goal set', () => {
    const p = getDailyGoalProgress(3, 0);
    expect(p.target).toBe(0);
    expect(p.achieved).toBe(false);
    expect(p.percentage).toBe(0);
  });

  it('clamps negative done to zero', () => {
    const p = getDailyGoalProgress(-2, 4);
    expect(p.done).toBe(0);
    expect(p.remaining).toBe(4);
  });
});

describe('countQuizzesOnDate', () => {
  const history = [
    { timestamp: '2026-08-20T10:00:00.000Z' },
    { timestamp: '2026-08-20T14:30:00.000Z' },
    { timestamp: '2026-08-19T23:00:00.000Z' },
    { timestamp: '2026-08-21T00:00:00.000Z' },
  ];

  it('counts only entries matching the given date', () => {
    expect(countQuizzesOnDate(history, '2026-08-20')).toBe(2);
    expect(countQuizzesOnDate(history, '2026-08-19')).toBe(1);
    expect(countQuizzesOnDate(history, '2026-08-21')).toBe(1);
  });

  it('returns zero for an empty history', () => {
    expect(countQuizzesOnDate([], '2026-08-20')).toBe(0);
  });

  it('ignores entries with a missing timestamp', () => {
    const dirty = [...history, { timestamp: '' }];
    expect(countQuizzesOnDate(dirty, '2026-08-20')).toBe(2);
  });
});

describe('getTodayDateStr', () => {
  it('formats the date as YYYY-MM-DD', () => {
    expect(getTodayDateStr(new Date('2026-08-20T23:59:00'))).toBe('2026-08-20');
  });
});
