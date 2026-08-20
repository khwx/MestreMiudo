"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { updateStudentRewardsWithCoinsAction } from './rewards';
import { updateStudentStreak } from './streaks';
import { getNextLesson, type NextLessonInfo } from '@/lib/lessons/next-lesson';

export async function getLessonDataAction(lessonId: string) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Base de dados não configurada');
    }

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;

    // Get challenges for this lesson
    const { data: challenges, error: challengesError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('challenge_index', { ascending: true });

    if (challengesError) throw challengesError;

    return {
      ...lesson,
      challenges: challenges || [],
    };
  } catch (error) {
    logger.error('Erro ao buscar lição:', error);
    return null;
  }
}

export async function getLessonsForSubjectAction(
  subject: string,
  gradeLevel: number
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Base de dados não configurada');
    }

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

export async function getStudentLessonProgressAction(
  studentId: string,
  lessonId: string
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Base de dados não configurada');
    }

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

export async function getNextLessonAction(
  studentId: string,
  gradeLevel: number
): Promise<NextLessonInfo | null> {
  try {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, subject, lesson_index')
      .eq('grade_level', gradeLevel);

    if (lessonsError) throw lessonsError;
    if (!lessons || lessons.length === 0) return null;

    const { data: completions, error: completionsError } = await supabase
      .from('lesson_completion')
      .select('lesson_id')
      .eq('student_id', studentId)
      .eq('completed', true);

    if (completionsError) throw completionsError;

    const completedIds = new Set(
      (completions || []).map((c) => c.lesson_id as string)
    );

    return getNextLesson(lessons, completedIds);
  } catch (error) {
    logger.error('Erro ao calcular próxima lição:', error);
    return null;
  }
}

export async function saveLessonCompletionAction(
  studentId: string,
  lessonId: string,
  answers: Record<string, unknown>,
  score: number
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Base de dados não configurada');
    }

    // Calculate stars and coins
    let stars = 0;
    if (score === 100) stars = 3;
    else if (score >= 80) stars = 2;
    else if (score >= 60) stars = 1;

    const baseCoins = [0, 10, 25, 50];
    const coins = baseCoins[stars] || 0;

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
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update student rewards
    await updateStudentRewardsWithCoinsAction(studentId, coins);
    
    // Update streak
    updateStudentStreak(studentId).catch((err) => {
      logger.error('[LESSONS] Failed to update streak:', err);
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error('Erro ao guardar conclusão da lição:', error);
    return {
      success: false,
      error: String(error),
    };
  }
}