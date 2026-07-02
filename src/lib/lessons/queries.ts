import { logger } from "../logger";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Lesson, LessonCompletion } from '@/app/shared-schemas';

export async function getLessons(
  subject: 'Português' | 'Matemática' | 'Estudo do Meio',
  gradeLevel: number
): Promise<Lesson[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject', subject)
      .eq('grade_level', gradeLevel)
      .order('lesson_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar lições:', error);
    return [];
  }
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const { data: challenges, error: challengesError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('challenge_index', { ascending: true });

    if (challengesError) throw challengesError;

    return {
      ...data,
      challenges: challenges || [],
    };
  } catch (error) {
    logger.error('Erro ao buscar lição:', error);
    return null;
  }
}

export async function getLessonProgress(
  studentId: string,
  lessonId: string
): Promise<LessonCompletion | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    logger.error('Erro ao buscar progresso da lição:', error);
    return null;
  }
}

export async function getCompletedLessons(
  studentId: string,
  subject: string
): Promise<LessonCompletion[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select(`
        *,
        lessons!inner(subject)
      `)
      .eq('student_id', studentId)
      .eq('lessons.subject', subject)
      .eq('completed', true)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar lições concluídas:', error);
    return [];
  }
}

export async function getLessonStats(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select('subject, completed, stars, coins_earned', {
        count: 'exact',
      })
      .eq('student_id', studentId)
      .eq('completed', true);

    if (error) throw error;

    const stats = {
      totalCompleted: data?.length || 0,
      totalCoins: data?.reduce((sum, lesson) => sum + (lesson.coins_earned || 0), 0) || 0,
      averageStars: data?.length
        ? (data.reduce((sum, lesson) => sum + (lesson.stars || 0), 0) / data.length).toFixed(2)
        : 0,
      bySubject: {
        'Português': 0,
        'Matemática': 0,
        'Estudo do Meio': 0,
      },
    };

    return stats;
  } catch (error) {
    logger.error('Erro ao buscar estatísticas da lição:', error);
    return null;
  }
}
