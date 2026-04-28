'use server';

import { supabase, isSupabaseConfigured } from './supabase';

export interface SpacedRepetitionItem {
  id: string;
  studentId: string;
  question: string;
  correctAnswer: string;
  topic: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
}

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export async function getItemsForReview(
  studentId: string,
  limit: number = 10
): Promise<SpacedRepetitionItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('student_id', studentId)
      .lte('next_review', now)
      .order('next_review', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[SPACED] Error fetching items for review:', error);
    return [];
  }
}

export async function recordReview(
  studentId: string,
  itemId: string,
  quality: number
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    const { data: item } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('id', itemId)
      .single();

    if (!item) return false;

    let { easeFactor, interval, repetitions } = item;
    
    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      interval = 1;
      repetitions = 0;
    }

    easeFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const { error } = await supabase
      .from('spaced_repetition')
      .update({
        ease_factor: easeFactor,
        interval: interval,
        repetitions: repetitions,
        next_review: nextReview.toISOString(),
        last_review: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SPACED] Error recording review:', error);
    return false;
  }
}

export async function addToSpacedRepetition(
  studentId: string,
  questions: Array<{ question: string; correctAnswer: string; topic: string }>
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    const rows = questions.map(q => ({
      student_id: studentId,
      question: q.question,
      correct_answer: q.correctAnswer,
      topic: q.topic,
      ease_factor: DEFAULT_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      next_review: new Date().toISOString(),
      last_review: null,
    }));

    const { error } = await supabase
      .from('spaced_repetition')
      .upsert(rows, { onConflict: 'student_id,question' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SPACED] Error adding items:', error);
    return false;
  }
}

export async function getStudentStats(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data: items } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('student_id', studentId);

    if (!items || items.length === 0) {
      return { total: 0, mastered: 0, learning: 0, due: 0 };
    }

    const now = new Date().toISOString();
    const mastered = items.filter(i => i.interval >= 21).length;
    const learning = items.filter(i => i.interval > 0 && i.interval < 21).length;
    const due = items.filter(i => i.next_review <= now).length;

    return { total: items.length, mastered, learning, due };
  } catch (error) {
    console.error('[SPACED] Error getting stats:', error);
    return null;
  }
}