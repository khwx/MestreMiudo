/**
 * @fileOverview Helpers to support practicing the questions a student got
 * wrong at the end of a quiz, reinforcing learning before finishing.
 */

import type { QuizQuestion, Answer } from '@/app/shared-schemas';

/**
 * Return only the quiz questions that the student answered incorrectly.
 * Matching is done by question text so it works even if the quiz object
 * and the recorded answers come from different sources.
 */
export function getWrongQuestions(
  quizQuestions: QuizQuestion[],
  answers: Answer[]
): QuizQuestion[] {
  const wrongQuestions = new Set(
    answers.filter((a) => !a.isCorrect).map((a) => a.question)
  );
  return quizQuestions.filter((q) => wrongQuestions.has(q.question));
}

/**
 * Whether the student answered at least one question incorrectly.
 */
export function hasWrongAnswers(answers: Answer[]): boolean {
  return answers.some((a) => !a.isCorrect);
}
