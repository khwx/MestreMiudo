'use server';

/**
 * @fileOverview Daily challenges system
 * Generates and tracks one daily challenge per student
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { PersonalizedLearningPathInput } from '@/app/shared-schemas';
import { generateQuizDirect } from './quiz-generator';

interface DailyChallenge {
  id: string;
  studentId: string;
  challengeDate: string;
  subject: string;
  difficulty: string;
  questionId?: string;
  completed: boolean;
  correct?: boolean;
  bonusPoints: number;
}

const SUBJECTS: Array<'Português' | 'Matemática' | 'Estudo do Meio'> = ['Português', 'Matemática', 'Estudo do Meio'];
const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil'];

/**
 * Get or create today's daily challenge for a student
 */
export async function getDailyChallenge(
  studentId: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<DailyChallenge | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[DAILY] Supabase not configured');
    return null;
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if challenge already exists for today
    const { data: existing, error: fetchError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('student_id', studentId)
      .eq('challenge_date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected)
      throw fetchError;
    }

    if (existing) {
      console.log(`[DAILY] Found existing challenge for ${studentId} on ${today}`);
      return {
        id: existing.id,
        studentId: existing.student_id,
        challengeDate: existing.challenge_date,
        subject: existing.subject,
        difficulty: existing.difficulty,
        questionId: existing.question_id,
        completed: existing.completed,
        correct: existing.correct,
        bonusPoints: existing.bonus_points,
      };
    }

    // Create a new challenge
    console.log(`[DAILY] Creating new challenge for ${studentId} on ${today}`);
    return createDailyChallenge(studentId, today, gradeLevel);
  } catch (error) {
    console.error('[DAILY] Error getting daily challenge:', error);
    return null;
  }
}

/**
 * Create a new daily challenge for a student
 */
async function createDailyChallenge(
  studentId: string,
  date: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<DailyChallenge | null> {
  try {
    // Select random subject and difficulty
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

    // Generate a question
    const input: PersonalizedLearningPathInput = {
      studentId,
      gradeLevel,
      subject,
      numberOfQuestions: 1,
      performanceData: undefined,
    };

    const result = await generateQuizDirect(input);

    if (!result || !result.quizQuestions || result.quizQuestions.length === 0) {
      throw new Error('Failed to generate question for daily challenge');
    }

    const question = result.quizQuestions[0];

    // Save to database
    const { data: challenge, error } = await supabase!
      .from('daily_challenges')
      .insert({
        student_id: studentId,
        challenge_date: date,
        subject,
        difficulty,
        question_id: null, // We store the full question in the response
        completed: false,
        bonus_points: 50,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[DAILY] Created challenge: ${subject} (${difficulty}) for ${studentId}`);

    return {
      id: challenge.id,
      studentId: challenge.student_id,
      challengeDate: challenge.challenge_date,
      subject: challenge.subject,
      difficulty: challenge.difficulty,
      questionId: challenge.question_id,
      completed: challenge.completed,
      correct: challenge.correct,
      bonusPoints: challenge.bonus_points,
    };
  } catch (error) {
    console.error('[DAILY] Error creating daily challenge:', error);
    return null;
  }
}

/**
 * Complete a daily challenge (record answer)
 */
export async function completeDailyChallenge(
  studentId: string,
  correct: boolean,
  bonusPointsEarned: number = 50
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[DAILY] Supabase not configured');
    return false;
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_challenges')
      .update({
        completed: true,
        correct,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('challenge_date', today);

    if (error) throw error;

    console.log(
      `[DAILY] Completed challenge for ${studentId}: ${correct ? 'CORRECT' : 'INCORRECT'}`
    );
    return true;
  } catch (error) {
    console.error('[DAILY] Error completing daily challenge:', error);
    return false;
  }
}

/**
 * Get daily challenge statistics for a student
 */
export async function getDailyChallengeStats(
  studentId: string
): Promise<{ completed: number; correctAnswers: number; streak: number } | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[DAILY] Supabase not configured');
    return null;
  }

  try {
    // Get last 30 days of challenges
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenges')
      .select('completed, correct, challenge_date')
      .eq('student_id', studentId)
      .gte('challenge_date', fromDate)
      .order('challenge_date', { ascending: true });

    if (error) throw error;

    const completed = data?.filter((d) => d.completed).length || 0;
    const correctAnswers = data?.filter((d) => d.completed && d.correct).length || 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const challenge = data?.find((d) => d.challenge_date === dateStr);
      if (challenge?.completed) {
        streak++;
      } else {
        break;
      }
    }

    return { completed, correctAnswers, streak };
  } catch (error) {
    console.error('[DAILY] Error getting challenge stats:', error);
    return null;
  }
}
