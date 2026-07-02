import { logger } from "../logger";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { LessonCompletion } from '@/app/shared-schemas';

export function calculateStars(score: number): number {
  if (score === 100) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

export function calculateCoins(stars: number, isDailyBonus: boolean = false): number {
  const baseCoins = {
    0: 0,
    1: 10,
    2: 25,
    3: 50,
  };

  const coins = baseCoins[stars as keyof typeof baseCoins] || 0;
  return isDailyBonus ? coins + 20 : coins;
}

export async function saveLessonCompletion(
  studentId: string,
  lessonId: string,
  answers: Record<string, unknown>,
  score: number
): Promise<LessonCompletion | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const stars = calculateStars(score);
  const coins = calculateCoins(stars);

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        completed: true,
        stars,
        coins_earned: coins,
        score,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao guardar conclusão da lição:', error);
    return null;
  }
}
