import { describe, it, expect } from 'vitest';
import {
  getWeeklyProgress,
  getSubjectPerformance,
  getTopicAnalysis,
  getLearningTrend,
  generateStudyRecommendations,
} from '@/lib/analytics';

describe('analytics (without Supabase)', () => {
  it('getWeeklyProgress returns empty array when Supabase not configured', async () => {
    const result = await getWeeklyProgress('test-student');
    expect(result).toEqual([]);
  });

  it('getSubjectPerformance returns empty array when Supabase not configured', async () => {
    const result = await getSubjectPerformance('test-student');
    expect(result).toEqual([]);
  });

  it('getTopicAnalysis returns empty array when Supabase not configured', async () => {
    const result = await getTopicAnalysis('test-student');
    expect(result).toEqual([]);
  });

  it('getLearningTrend returns stable trend when Supabase not configured', async () => {
    const result = await getLearningTrend('test-student');
    expect(result.trend).toBe('stable');
    expect(result.recentAverage).toBe(0);
    expect(result.olderAverage).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it('generateStudyRecommendations returns empty array when Supabase not configured', async () => {
    const result = await generateStudyRecommendations('test-student');
    expect(result).toEqual([]);
  });
});
