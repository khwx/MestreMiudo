import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

describe('leaderboards', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('updateLeaderboardPosition returns false when Supabase not configured', async () => {
    const { updateLeaderboardPosition } = await import('@/lib/leaderboards');
    const result = await updateLeaderboardPosition('student-1', 'João', 100, 1, 85);
    expect(result).toBe(false);
  });

  it('getGlobalLeaderboard returns empty when Supabase not configured', async () => {
    const { getGlobalLeaderboard } = await import('@/lib/leaderboards');
    const result = await getGlobalLeaderboard();
    expect(result).toEqual([]);
  });

  it('getStudentRankContext returns empty/null when Supabase not configured', async () => {
    const { getStudentRankContext } = await import('@/lib/leaderboards');
    const result = await getStudentRankContext('student-1');
    expect(!result || result.length === 0).toBe(true);
  });

  it('getGradeLeaderboard returns empty when Supabase not configured', async () => {
    const { getGradeLeaderboard } = await import('@/lib/leaderboards');
    const result = await getGradeLeaderboard(1);
    expect(result).toEqual([]);
  });
});
