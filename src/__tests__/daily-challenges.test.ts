import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

describe('daily-challenges', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getDailyChallenge returns null when Supabase not configured', async () => {
    const { getDailyChallenge } = await import('@/lib/daily-challenges');
    const result = await getDailyChallenge('student-1', 1);
    expect(result).toBeNull();
  });

  it('getDailyChallengeQuestion returns null when Supabase not configured', async () => {
    const { getDailyChallengeQuestion } = await import('@/lib/daily-challenges');
    const result = await getDailyChallengeQuestion('challenge-id-1');
    expect(result).toBeNull();
  });

  it('completeDailyChallenge returns false when Supabase not configured', async () => {
    const { completeDailyChallenge } = await import('@/lib/daily-challenges');
    const result = await completeDailyChallenge('student-1', true);
    expect(result).toBe(false);
  });

  it('getDailyChallengeStats returns null when Supabase not configured', async () => {
    const { getDailyChallengeStats } = await import('@/lib/daily-challenges');
    const result = await getDailyChallengeStats('student-1');
    expect(result).toBeNull();
  });
});
