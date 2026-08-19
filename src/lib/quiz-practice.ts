/**
 * @fileOverview Helpers to support practicing the questions a student got
 * wrong at the end of a quiz, reinforcing learning before finishing.
 */

import type { QuizQuestion, Answer } from '@/app/shared-schemas';
import { getWeakTopics } from './adaptive-learning';

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
 * Build a topic -> correctness score map (0-1) from the recorded answers.
 * Used to feed the adaptive-learning `getWeakTopics` helper.
 */
export function buildTopicPerformance(answers: Answer[]): Record<string, number> {
  const totals: Record<string, { correct: number; total: number }> = {};

  for (const answer of answers) {
    const topic = answer.topic || 'Geral';
    if (!totals[topic]) {
      totals[topic] = { correct: 0, total: 0 };
    }
    totals[topic].total += 1;
    if (answer.isCorrect) {
      totals[topic].correct += 1;
    }
  }

  const metrics: Record<string, number> = {};
  for (const topic in totals) {
    const { correct, total } = totals[topic];
    metrics[topic] = total > 0 ? correct / total : 0;
  }
  return metrics;
}

/**
 * Derive the topics the student struggled with in a quiz, using the same
 * threshold logic as the adaptive-learning module (`getWeakTopics`).
 * A topic is considered weak when the correctness ratio falls below the
 * supplied threshold (defaults to 0.65, mirroring `getWeakTopics`).
 */
export function getWeakTopicsFromAnswers(
  answers: Answer[],
  threshold = 0.65
): string[] {
  const metrics = buildTopicPerformance(answers);
  return getWeakTopics(metrics, threshold);
}

/**
 * Filter a quiz question list down to those whose topic appears in
 * `weakTopics`. Original order is preserved. Returns an empty array when
 * there are no weak topics or none of the questions match them.
 */
export function getQuestionsForWeakTopics(
  quizQuestions: QuizQuestion[],
  weakTopics: string[]
): QuizQuestion[] {
  if (weakTopics.length === 0) return [];
  const weakSet = new Set(weakTopics);
  return quizQuestions.filter((q) => weakSet.has(q.topic || 'Geral'));
}

/**
 * Whether the student answered at least one question incorrectly.
 */
export function hasWrongAnswers(answers: Answer[]): boolean {
  return answers.some((a) => !a.isCorrect);
}
