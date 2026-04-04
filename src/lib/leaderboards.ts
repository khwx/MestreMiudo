'use server';

/**
 * @fileOverview Leaderboards system
 * Tracks global and weekly rankings
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  gradeLevel?: number;
  totalPoints: number;
  totalQuizzes: number;
  averageScore: number;
  rank: number;
}

/**
 * Update student's leaderboard position (called after quiz completion)
 */
export async function updateLeaderboardPosition(
  studentId: string,
  studentName: string,
  points: number,
  gradeLevel: number,
  averageScore: number
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[LEADERBOARD] Supabase not configured');
    return false;
  }

  try {
    // Try to update existing entry
    const { data: existing } = await supabase
      .from('leaderboards')
      .select('id, total_points, total_quizzes')
      .eq('student_id', studentId)
      .eq('rank_period', 'global')
      .single();

    const newPoints = existing ? existing.total_points + points : points;
    const newQuizzes = existing ? existing.total_quizzes + 1 : 1;

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('leaderboards')
        .update({
          total_points: newPoints,
          total_quizzes: newQuizzes,
          average_score: averageScore,
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('rank_period', 'global');

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase.from('leaderboards').insert({
        student_id: studentId,
        student_name: studentName,
        grade_level: gradeLevel,
        total_points: newPoints,
        total_quizzes: newQuizzes,
        average_score: averageScore,
        rank_period: 'global',
      });

      if (error) throw error;
    }

    // Update ranks for all students
    await updateAllRanks('global');

    console.log(`[LEADERBOARD] Updated position for ${studentId}`);
    return true;
  } catch (error) {
    console.error('[LEADERBOARD] Error updating position:', error);
    return false;
  }
}

/**
 * Update all ranks for a given period
 */
async function updateAllRanks(rankPeriod: 'global' | 'weekly' | 'monthly'): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    // Get all entries sorted by points (descending)
    const { data, error } = await supabase
      .from('leaderboards')
      .select('id, student_id')
      .eq('rank_period', rankPeriod)
      .order('total_points', { ascending: false });

    if (error) throw error;
    if (!data) return;

    // Update ranks in batches
    for (let i = 0; i < data.length; i++) {
      await supabase
        .from('leaderboards')
        .update({ rank: i + 1 })
        .eq('id', data[i].id);
    }

    console.log(`[LEADERBOARD] Updated ranks for ${rankPeriod}`);
  } catch (error) {
    console.error('[LEADERBOARD] Error updating ranks:', error);
  }
}

/**
 * Get global leaderboard (top 100)
 */
export async function getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[LEADERBOARD] Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(
        'student_id, student_name, grade_level, total_points, total_quizzes, average_score, rank'
      )
      .eq('rank_period', 'global')
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((entry) => ({
        studentId: entry.student_id,
        studentName: entry.student_name,
        gradeLevel: entry.grade_level,
        totalPoints: entry.total_points,
        totalQuizzes: entry.total_quizzes,
        averageScore: entry.average_score,
        rank: entry.rank,
      })) || []
    );
  } catch (error) {
    console.error('[LEADERBOARD] Error fetching global leaderboard:', error);
    return [];
  }
}

/**
 * Get student's rank and surrounding context
 */
export async function getStudentRankContext(
  studentId: string,
  contextSize: number = 2
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[LEADERBOARD] Supabase not configured');
    return [];
  }

  try {
    // First, get the student's rank
    const { data: studentData, error: studentError } = await supabase
      .from('leaderboards')
      .select('rank')
      .eq('student_id', studentId)
      .eq('rank_period', 'global')
      .single();

    if (studentError || !studentData) {
      console.warn('[LEADERBOARD] Student not found in leaderboard');
      return [];
    }

    const studentRank = studentData.rank;
    const minRank = Math.max(1, studentRank - contextSize);
    const maxRank = studentRank + contextSize;

    // Get students around this rank
    const { data, error } = await supabase
      .from('leaderboards')
      .select(
        'student_id, student_name, grade_level, total_points, total_quizzes, average_score, rank'
      )
      .eq('rank_period', 'global')
      .gte('rank', minRank)
      .lte('rank', maxRank)
      .order('rank', { ascending: true });

    if (error) throw error;

    return (
      data?.map((entry) => ({
        studentId: entry.student_id,
        studentName: entry.student_name,
        gradeLevel: entry.grade_level,
        totalPoints: entry.total_points,
        totalQuizzes: entry.total_quizzes,
        averageScore: entry.average_score,
        rank: entry.rank,
      })) || []
    );
  } catch (error) {
    console.error('[LEADERBOARD] Error fetching rank context:', error);
    return [];
  }
}

/**
 * Get leaderboard by grade level
 */
export async function getGradeLeaderboard(
  gradeLevel: number,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[LEADERBOARD] Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(
        'student_id, student_name, grade_level, total_points, total_quizzes, average_score, rank'
      )
      .eq('rank_period', 'global')
      .eq('grade_level', gradeLevel)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Re-rank within grade
    return (
      data?.map((entry, index) => ({
        studentId: entry.student_id,
        studentName: entry.student_name,
        gradeLevel: entry.grade_level,
        totalPoints: entry.total_points,
        totalQuizzes: entry.total_quizzes,
        averageScore: entry.average_score,
        rank: index + 1,
      })) || []
    );
  } catch (error) {
    console.error('[LEADERBOARD] Error fetching grade leaderboard:', error);
    return [];
  }
}
