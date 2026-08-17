/**
 * @fileOverview Hint generator for quiz questions.
 * Derives a child-friendly hint from the question data when an explicit
 * hint is not provided by the content source.
 */

import type { QuizQuestion } from '@/app/shared-schemas';

/**
 * Generate a helpful hint for a quiz question.
 * Returns an explicit hint if provided, otherwise derives one from the
 * question, options and correct answer.
 */
export function generateHint(question: QuizQuestion): string | null {
  if (question?.hint && question.hint.trim()) {
    return question.hint.trim();
  }
  return deriveHint(question);
}

function deriveHint(question: QuizQuestion): string | null {
  if (!question) return null;

  const { correctAnswer, options } = question;
  const hasChoices = Array.isArray(options) && options.length > 0;

  if (hasChoices && correctAnswer) {
    const wrong = options!.filter((o) => o !== correctAnswer);
    if (wrong.length > 1) {
      const eliminate = wrong[wrong.length - 1];
      const firstLetter = firstLetterOf(correctAnswer);
      if (firstLetter) {
        return `Dica: a resposta começa pela letra "${firstLetter}" e não é "${eliminate}".`;
      }
      return `Dica: a resposta não é "${eliminate}".`;
    }
    if (wrong.length === 1) {
      return `Dica: a resposta não é "${wrong[0]}".`;
    }
  }

  const firstLetter = correctAnswer ? firstLetterOf(correctAnswer) : null;
  if (firstLetter) {
    return `Dica: a resposta começa pela letra "${firstLetter}".`;
  }

  return null;
}

function firstLetterOf(value: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.charAt(0).toUpperCase();
}
