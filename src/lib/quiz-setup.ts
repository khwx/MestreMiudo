export const QUIZ_LENGTH_OPTIONS = [5, 10, 15] as const;
export type QuizLength = (typeof QUIZ_LENGTH_OPTIONS)[number];

export function getQuizLengthOptions(): readonly QuizLength[] {
  return QUIZ_LENGTH_OPTIONS;
}

export function isValidQuizLength(value: number): value is QuizLength {
  return QUIZ_LENGTH_OPTIONS.includes(value as QuizLength);
}
