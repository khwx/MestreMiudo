import type { LessonChallenge } from '@/app/shared-schemas';

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function validateAnswer(challenge: LessonChallenge, answer: unknown): boolean {
  if (!answer || (typeof answer === 'object' && Object.keys(answer).length === 0)) return false;

  const content = challenge.content as Record<string, unknown>;

  if (challenge.challenge_type === 'multiple_choice') {
    return answer === content.correct_answer;
  }

  if (challenge.challenge_type === 'fill_blank') {
    const correctAnswers = (content.correct_answers as string[]) || [content.correct_answer as string];
    const normalizedAnswer = normalizeText(answer as string);
    return correctAnswers.some((ca: string) => normalizeText(ca) === normalizedAnswer);
  }

  if (challenge.challenge_type === 'word_order') {
    const correctOrder = content.correct_order;
    return JSON.stringify(answer) === JSON.stringify(correctOrder);
  }

  if (challenge.challenge_type === 'matching') {
    const correctMatches = content.correct_matches;
    return JSON.stringify(answer) === JSON.stringify(correctMatches);
  }

  return false;
}

export function getCorrectAnswerText(challenge: LessonChallenge): string {
  if (challenge.challenge_type === 'multiple_choice') {
    return challenge.content.correct_answer;
  }

  if (challenge.challenge_type === 'fill_blank') {
    const correctAnswers = challenge.content.correct_answers || [challenge.content.correct_answer];
    return correctAnswers.join(' ou ');
  }

  if (challenge.challenge_type === 'word_order') {
    const correctOrder = challenge.content.correct_order;
    return correctOrder ? correctOrder.join(' ') : 'ordem correta';
  }

  if (challenge.challenge_type === 'matching') {
    const correctMatches = challenge.content.correct_matches;
    return Object.entries(correctMatches || {}).map(([key, value]) => `${key} -> ${value}`).join(', ');
  }

  return 'resposta correta';
}
