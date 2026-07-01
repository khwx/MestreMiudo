"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  calculateQuizPoints,
  getCurrentTier,
  getNextTierProgress,
  generateCelebrationMessage,
  getDailyBonus
} from "@/lib/rewards";

export async function awardQuizPoints(
  studentId: string,
  score: number,
  total: number,
  gradeLevel: number
) {
  const points = calculateQuizPoints(score, total, gradeLevel);
  
  logger.log('[REWARDS] Awarding', points, 'points to', studentId);
  
  if (!isSupabaseConfigured() || !supabase) {
    logger.warn('[REWARDS] Base de dados não configurada, skipping reward save');
    return { points, message: generateCelebrationMessage(score, total, points) };
  }
  
  try {
    // Get or create student reward record
    const { data: existing } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!existing) {
      // Create new reward record
      await supabase.from('student_rewards').insert({
        student_id: studentId,
        total_points: points,
        current_tier: 1,
        badges: [],
        day_streak: 1,
        last_quiz_date: new Date().toISOString(),
      });
    } else {
      // Update existing record
      const dailyBonus = getDailyBonus(existing.day_streak || 0);
      const newTotal = (existing.total_points || 0) + points + dailyBonus;
      const newTier = getCurrentTier(newTotal).level;
      
      await supabase
        .from('student_rewards')
        .update({
          total_points: newTotal,
          current_tier: newTier,
          last_quiz_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId);
    }
    
    const tier = getCurrentTier(points);
    const nextProgress = getNextTierProgress(points);
    
    return {
      points,
      totalPoints: (existing?.total_points || 0) + points,
      tier: tier.name,
      message: generateCelebrationMessage(score, total, points),
      nextTier: nextProgress.nextTier?.name,
      progressPercentage: nextProgress.percentage,
    };
  } catch (error) {
    logger.error('[REWARDS] Falha ao atribuir pontos:', error);
    return {
      points,
      message: generateCelebrationMessage(score, total, points),
      error: true,
    };
  }
}

export async function getStudentRewards(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  
  try {
    const { data } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (data) {
      const tier = getCurrentTier(data.total_points || 0);
      const nextProgress = getNextTierProgress(data.total_points || 0);
      
      return {
        ...(data as Record<string, unknown>),
        tier,
        nextTier: nextProgress.nextTier,
        progressPercentage: nextProgress.percentage,
      };
    }
  } catch (error) {
    logger.error('[REWARDS] Falha ao obter recompensas do estudante:', error);
  }
  
  return null;
}

export async function updateStudentRewardsWithCoinsAction(
  studentId: string,
  coinsEarned: number
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Base de dados não configurada');
    }

    // Get current rewards
    const { data: currentRewards, error: fetchError } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!currentRewards) {
      // Create new reward record
      const { error: insertError } = await supabase
        .from('student_rewards')
        .insert({
          student_id: studentId,
          total_points: coinsEarned,
          current_tier: 1,
        });

      if (insertError) throw insertError;
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from('student_rewards')
        .update({
          total_points: (currentRewards.total_points || 0) + coinsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId);

      if (updateError) throw updateError;
    }

    return true;
  } catch (error) {
    logger.error('Erro ao atualizar recompensas do estudante:', error);
    return false;
  }
}

export async function getStudentLessonHistoryAction(studentId: string) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('lesson_completion')
      .select('*')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error && error.code !== 'PGRST116') throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar histórico de lições do estudante:', error);
    return [];
  }
}

export async function initializeStudent(studentId: string): Promise<{ success: boolean; welcomeBonus?: number }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false };
  }

  try {
    const WELCOME_BONUS = 100;

    const { data: existing } = await supabase
      .from('student_rewards')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (existing) {
      return { success: true };
    }

    const { error } = await supabase.from('student_rewards').insert({
      student_id: studentId,
      total_points: WELCOME_BONUS,
      current_tier: 1,
      badges: [],
      day_streak: 1,
      last_quiz_date: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true, welcomeBonus: WELCOME_BONUS };
  } catch (error) {
    logger.error('[INIT] Failed to initialize student:', error);
    return { success: false };
  }
}