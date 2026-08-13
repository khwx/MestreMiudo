import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

vi.mock('@/lib/pixabay', () => ({
  fetchImageForTopic: vi.fn().mockResolvedValue(null),
}));

describe('quiz-generator', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('generateQuizDirect throws when no API key and no Supabase', async () => {
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    const { generateQuizDirect } = await import('@/lib/quiz-generator');
    await expect(
      generateQuizDirect({
        studentId: 'student-1',
        subject: 'Matemática',
        gradeLevel: 1,
        numberOfQuestions: 5,
      })
    ).rejects.toThrow();

    process.env.OPENROUTER_API_KEY = originalKey;
  });
});
