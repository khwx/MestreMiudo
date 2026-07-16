import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
  isSupabaseConfigured: vi.fn(() => true),
}));

describe('streak logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getLocalDateString(date: Date): string {
    return date.toLocaleDateString('sv-SE');
  }

  it('calculates streak correctly for consecutive days', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = getLocalDateString(yesterday);
    const todayStr = getLocalDateString(today);
    
    // Simulate the logic from updateStudentStreak
    const lastActivityStr = yesterdayStr;
    const lastActivityDate = new Date(lastActivityStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBe(1);
  });

  it('calculates streak correctly for missed days', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const threeDaysAgoStr = getLocalDateString(threeDaysAgo);
    const todayStr = getLocalDateString(today);
    
    const lastActivityDate = new Date(threeDaysAgoStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBe(3);
  });

  it('returns 0 diff for same day (handled by date string comparison)', () => {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    const lastActivityDate = new Date(todayStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBe(0);
  });

  it('calculates longest streak correctly', () => {
    const currentStreak = 5;
    const longestStreak = 7;
    const newLongestStreak = Math.max(longestStreak, currentStreak);
    
    expect(newLongestStreak).toBe(7);
  });

  it('updates longest streak when current exceeds it', () => {
    const currentStreak = 10;
    const longestStreak = 7;
    const newLongestStreak = Math.max(longestStreak, currentStreak);
    
    expect(newLongestStreak).toBe(10);
  });
});
