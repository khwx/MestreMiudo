"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function updateStudentStreak(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 1. Get current streak record
    const { data: streak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!streak) {
      // First time activity: Create streak
      const { data: newStreak, error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          student_id: studentId,
          last_activity_date: todayStr,
          current_streak: 1,
          longest_streak: 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newStreak;
    }

    const lastActivityStr = streak.last_activity_date;
    if (lastActivityStr === todayStr) {
      // Already active today, just return the current streak
      return streak;
    }

    // Calculate difference in days
    const lastActivityDate = new Date(lastActivityStr);
    const diffTime = Math.abs(today.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newCurrentStreak = streak.current_streak;
    let newFreezes = streak.streak_freezes || 0;

    if (diffDays === 1) {
      // Active yesterday: Increment streak
      newCurrentStreak++;
    } else if (diffDays > 1) {
      // Missed one or more days: Use a freeze if available
      if (newFreezes > 0) {
        newFreezes--;
        newCurrentStreak++; // Keep streak going as if they played
      } else {
        // Streak broken: Reset to 1
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(streak.longest_streak || 0, newCurrentStreak);

    const { data: updatedStreak, error: updateError } = await supabase
      .from('user_streaks')
      .update({
        last_activity_date: todayStr,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        streak_freezes: newFreezes,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedStreak;
  } catch (error) {
    logger.error('Erro ao atualizar streak do estudante:', error);
    return null;
  }
}

export async function getStudentStreak(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('student_id', studentId)
    .single();
  if (error) return null;
  return data;
}