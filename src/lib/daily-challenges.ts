'use server';

/**
 * @fileOverview Daily challenges system
 * Generates and tracks one daily challenge per student
 */

import { supabase, isSupabaseConfigured } from './supabase';

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

interface ChallengeQuestion {
  id: string;
  question: string;
  challenge_type: 'multiple_choice' | 'fill_blank' | 'word_order' | 'matching';
  content: Record<string, unknown>;
  hint: string | null;
}

const SUBJECTS = ['Português', 'Matemática', 'Estudo do Meio'];
const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil'];

/**
 * Get a random challenge question from lesson_challenges for the given subject and grade
 */
async function getRandomLessonChallenge(
  gradeLevel: 1 | 2 | 3 | 4,
  subject: string
): Promise<ChallengeQuestion | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    // Get lesson IDs for this subject and grade
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('subject', subject)
      .eq('grade_level', gradeLevel);

    if (lessonsError || !lessons || lessons.length === 0) {
      return null;
    }

    const lessonIds = lessons.map(l => l.id);

    // Get a random challenge from those lessons
    const { data: challenges, error: challengesError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .in('lesson_id', lessonIds)
      .order('challenge_index', { ascending: true });

    if (challengesError || !challenges || challenges.length === 0) {
      return null;
    }

    // Pick a random challenge
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  } catch (error) {
    console.error('[DAILY] Error fetching lesson challenge:', error);
    return null;
  }
}

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
      throw fetchError;
    }

    if (existing) {
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
    return createDailyChallenge(studentId, today, gradeLevel);
  } catch (error) {
    console.error('[DAILY] Error getting daily challenge:', error);
    return null;
  }
}

/**
 * Create a new daily challenge for a student using lesson_challenges
 */
async function createDailyChallenge(
  studentId: string,
  date: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<DailyChallenge | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    // Select random subject
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

    // Get a random challenge from lesson_challenges
    const challenge = await getRandomLessonChallenge(gradeLevel, subject);

    if (!challenge) {
      // Fallback: create a simple challenge
      return createFallbackChallenge(studentId, date, subject, difficulty);
    }

    // Save to database
    const { data: newChallenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        student_id: studentId,
        challenge_date: date,
        subject,
        difficulty,
        question_id: challenge.id,
        completed: false,
        bonus_points: 50,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newChallenge.id,
      studentId: newChallenge.student_id,
      challengeDate: newChallenge.challenge_date,
      subject: newChallenge.subject,
      difficulty: newChallenge.difficulty,
      questionId: newChallenge.question_id,
      completed: newChallenge.completed,
      correct: newChallenge.correct,
      bonusPoints: newChallenge.bonus_points,
    };
  } catch (error) {
    console.error('[DAILY] Error creating daily challenge:', error);
    return null;
  }
}

/**
 * Fallback challenge if no lesson_challenges available
 */
async function createFallbackChallenge(
  studentId: string,
  date: string,
  subject: string,
  difficulty: string
): Promise<DailyChallenge | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data: challenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        student_id: studentId,
        challenge_date: date,
        subject,
        difficulty,
        question_id: null,
        completed: false,
        bonus_points: 50,
      })
      .select()
      .single();

    if (error) throw error;

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
    console.error('[DAILY] Error creating fallback challenge:', error);
    return null;
  }
}

/**
 * Get the challenge question for a daily challenge
 */
export async function getDailyChallengeQuestion(
  challengeId: string
): Promise<ChallengeQuestion | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    // Get the challenge to find its question_id
    const { data: challenge, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('question_id, subject, difficulty')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge || !challenge.question_id) {
      return null;
    }

    // Get the actual question from lesson_challenges
    const { data: question, error: questionError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .eq('id', challenge.question_id)
      .single();

    if (questionError || !question) {
      return null;
    }

    return {
      id: question.id,
      question: question.question,
      challenge_type: question.challenge_type,
      content: question.content,
      hint: question.hint,
    };
  } catch (error) {
    console.error('[DAILY] Error getting challenge question:', error);
    return null;
  }
}

/**
 * Complete a daily challenge (record answer)
 */
export async function completeDailyChallenge(
  studentId: string,
  correct: boolean,
  _bonusPointsEarned: number = 50
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
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
    return null;
  }

  try {
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