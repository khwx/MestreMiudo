'use server';

/**
 * @fileOverview Question bank for MestreMiudo
 * Pre-seeded questions organized by subject, grade, and topic
 */

import { portuguesQuestions } from './portugues';
import { matematicaQuestions } from './matematica';
import { estudoDoMeioQuestions } from './estudo-do-meio';
import { matchingQuestions } from './matching';

export type Subject = 'Portugues' | 'Matematica' | 'Estudo do Meio';
export type GradeLevel = 1 | 2 | 3 | 4;
export type Difficulty = 'easy' | 'normal' | 'hard';
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching';

export interface Question {
  id: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export const questionBank: Question[] = [
  ...portuguesQuestions,
  ...matematicaQuestions,
  ...estudoDoMeioQuestions,
  ...matchingQuestions,
];

/**
 * Get all questions
 */
export function getAllQuestions(): Question[] {
  return questionBank;
}

/**
 * Get questions filtered by subject, grade, topic, and/or difficulty
 */
export function getFilteredQuestions(filters: {
  subject?: Subject;
  gradeLevel?: GradeLevel;
  topic?: string;
  difficulty?: Difficulty;
  type?: QuestionType;
}): Question[] {
  return questionBank.filter((q) => {
    if (filters.subject && q.subject !== filters.subject) return false;
    if (filters.gradeLevel && q.gradeLevel !== filters.gradeLevel) return false;
    if (filters.topic && q.topic !== filters.topic) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.type && q.type !== filters.type) return false;
    return true;
  });
}

/**
 * Get a random subset of questions
 */
export function getRandomQuestions(
  count: number,
  filters?: {
    subject?: Subject;
    gradeLevel?: GradeLevel;
    topic?: string;
    difficulty?: Difficulty;
  }
): Question[] {
  const filtered = filters ? getFilteredQuestions(filters) : questionBank;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get questions by subject and grade
 */
export function getQuestionsBySubjectAndGrade(
  subject: Subject,
  gradeLevel: GradeLevel
): Question[] {
  return getFilteredQuestions({ subject, gradeLevel });
}

/**
 * Get available topics for a subject and grade
 */
export function getTopicsForSubjectAndGrade(
  subject: Subject,
  gradeLevel: GradeLevel
): string[] {
  const questions = getQuestionsBySubjectAndGrade(subject, gradeLevel);
  const topics = new Set(questions.map((q) => q.topic));
  return Array.from(topics);
}

/**
 * Get question stats
 */
export function getQuestionStats(): {
  total: number;
  bySubject: Record<Subject, number>;
  byGrade: Record<GradeLevel, number>;
  byDifficulty: Record<Difficulty, number>;
  byType: Record<QuestionType, number>;
} {
  const stats = {
    total: questionBank.length,
    bySubject: {} as Record<Subject, number>,
    byGrade: {} as Record<GradeLevel, number>,
    byDifficulty: {} as Record<Difficulty, number>,
    byType: {} as Record<QuestionType, number>,
  };

  for (const q of questionBank) {
    stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
    stats.byGrade[q.gradeLevel] = (stats.byGrade[q.gradeLevel] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
  }

  return stats;
}

/**
 * Validate an answer against the correct answer
 */
export function validateAnswer(
  question: Question,
  userAnswer: string | string[]
): boolean {
  if (Array.isArray(question.correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    return (
      question.correctAnswer.length === userAnswer.length &&
      question.correctAnswer.every((a) => userAnswer.includes(a))
    );
  }
  return question.correctAnswer === userAnswer;
}
