import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Lesson, LessonCompletion, LessonChallenge } from '@/app/shared-schemas';

// ============================================
// Lesson Management Functions
// ============================================

/**
 * Get all lessons for a subject and grade
 */
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
    console.error('Error fetching lessons:', error);
    return [];
  }
}

/**
 * Get a single lesson with its challenges
 */
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

    // Fetch challenges for this lesson
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
    console.error('Error fetching lesson:', error);
    return null;
  }
}

/**
 * Get student's progress on a lesson
 */
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

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return null;
  }
}

/**
 * Get all completed lessons for a student in a subject
 */
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
    console.error('Error fetching completed lessons:', error);
    return [];
  }
}

// ============================================
// Gamification Functions
// ============================================

/**
 * Calculate stars based on score
 * 1 star = 60-79%
 * 2 stars = 80-99%
 * 3 stars = 100%
 */
export function calculateStars(score: number): number {
  if (score === 100) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

/**
 * Calculate coins earned based on stars
 * 1 star = 10 coins
 * 2 stars = 25 coins
 * 3 stars = 50 coins
 * Plus 20 bonus coins for daily consistency
 */
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

/**
 * Save lesson completion
 */
export async function saveLessonCompletion(
  studentId: string,
  lessonId: string,
  answers: Record<string, any>,
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
    console.error('Error saving lesson completion:', error);
    return null;
  }
}

/**
 * Get lesson statistics for a student
 */
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

    // Calculate statistics
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

    // Group by subject - this would need proper implementation with the join
    return stats;
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    return null;
  }
}

/**
 * Initialize sample lessons for development/testing
 */
export async function initializeSampleLessons() {
  if (!isSupabaseConfigured() || !supabase) return;

  // This would be called once to seed initial lessons
  // Can be expanded with actual lesson data from textbooks
  const sampleLessons: Lesson[] = [
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Conhecer as Vogais',
      description: 'Aprenda as cinco vogais e como pronunciá-las.',
      learning_objective: 'Identificar e pronunciar todas as vogais',
      story_context: 'A Maria está a explorar o mundo das letras!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Números de 1 a 10',
      description: 'Aprender a contar e reconhecer números até 10.',
      learning_objective: 'Contar e reconhecer números 1-10',
      story_context: 'O João está contando os seus brinquedos!',
      lesson_index: 1,
      difficulty: 'easy',
    },
  ];

  // Insert lessons (if they don't exist)
  for (const lesson of sampleLessons) {
    try {
      await supabase
        .from('lessons')
        .insert(lesson)
        .select();
    } catch (error) {
      console.error('Error inserting sample lesson:', error);
    }
  }
}
