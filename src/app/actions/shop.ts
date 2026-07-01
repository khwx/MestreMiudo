"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateLessonChallenges } from "@/ai/flows/lesson-challenge-generator";
import type { GenerateChallengesInput } from '@/app/shared-schemas';

export async function buyShopItem(studentId: string, itemId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Base de dados não disponível' };
  }
  try {
    const item = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();
    if (!item.data) return { success: false, error: 'Item não encontrado' };

    const rewards = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (!rewards.data) return { success: false, error: 'Recompensas não encontradas' };

    if (rewards.data.total_points < item.data.price) {
      return { success: false, error: 'Moedas insuficientes' };
    }

    await supabase
      .from('student_rewards')
      .update({
        total_points: rewards.data.total_points - item.data.price,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId);

    await supabase.from('user_inventory').insert({
      student_id: studentId,
      item_id: itemId,
      equipped: false,
    });

    return { success: true };
  } catch (error) {
    logger.error('Erro ao comprar item na loja:', error);
    return { success: false, error: 'Erro ao comprar item' };
  }
}

export async function getUserInventory(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*, shop_items(*)')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar inventário:', error);
    return [];
  }
}

export async function equipInventoryItem(studentId: string, itemId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Base de dados não disponível' };
  }
  try {
    await supabase
      .from('user_inventory')
      .update({ equipped: false })
      .eq('student_id', studentId);
    await supabase
      .from('user_inventory')
      .update({ equipped: true })
      .eq('student_id', studentId)
      .eq('item_id', itemId);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao equipar item:', error);
    return { success: false, error: 'Erro ao equipar item' };
  }
}

export async function getShopItems() {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_available', true)
      .order('price', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar itens da loja:', error);
    return [];
  }
}

export async function generateLessonChallengesAction(input: GenerateChallengesInput) {
  try {
    const result = await generateLessonChallenges(input);
    
    // Save to database if configured
    if (isSupabaseConfigured() && supabase && result.challenges) {
      for (const challenge of result.challenges) {
        await supabase
          .from('lesson_challenges')
          .insert({
            lesson_id: input.lessonId,
            challenge_type: challenge.challenge_type,
            question: challenge.question,
            content: challenge.content,
            hint: challenge.hint,
            challenge_index: challenge.challenge_index,
          });
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Falha ao gerar desafios da lição:', error);
    throw error;
  }
}

export async function getStudentAchievements(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar conquistas do estudante:', error);
    return [];
  }
}

export async function unlockAchievement(studentId: string, achievementId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false };
  }
  try {
    const { error } = await supabase
      .from('student_achievements')
      .upsert({
        student_id: studentId,
        achievement_id: achievementId,
      }, { onConflict: 'student_id,achievement_id' });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Erro ao desbloquear conquista:', error);
    return { success: false };
  }
}