import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

describe('spaced-repetition', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getItemsForReview returns empty when Supabase not configured', async () => {
    const { getItemsForReview } = await import('@/lib/spaced-repetition');
    const result = await getItemsForReview('student-1');
    expect(result).toEqual([]);
  });

  it('recordReview returns false when Supabase not configured', async () => {
    const { recordReview } = await import('@/lib/spaced-repetition');
    const result = await recordReview('student-1', 'item-1', 4);
    expect(result).toBe(false);
  });

  it('addToSpacedRepetition returns false when Supabase not configured', async () => {
    const { addToSpacedRepetition } = await import('@/lib/spaced-repetition');
    const result = await addToSpacedRepetition('student-1', [
      { question: '2+2?', correctAnswer: '4', topic: 'Aritmetica' },
    ]);
    expect(result).toBe(false);
  });

  it('getStudentStats returns null when Supabase not configured', async () => {
    const { getStudentStats } = await import('@/lib/spaced-repetition');
    const result = await getStudentStats('student-1');
    expect(result).toBeNull();
  });
});
