import { getTopicsForSubjectAndGrade, getQuestionsBySubjectGradeTopic, type Subject } from '@/lib/questions';
import type { QuizQuestion } from '@/app/shared-schemas';

const SUBJECT_TO_BANK: Record<string, Subject> = {
  'Português': 'Portugues',
  'Matemática': 'Matematica',
  'Estudo do Meio': 'Estudo do Meio',
};

export function isTopicQuizEligible(subject: string): boolean {
  return subject in SUBJECT_TO_BANK;
}

export function toBankSubject(subject: string): Subject | null {
  return SUBJECT_TO_BANK[subject] ?? null;
}

export function getAvailableTopics(subject: string, gradeLevel: number): string[] {
  const bankSubject = toBankSubject(subject);
  if (!bankSubject) return [];
  return getTopicsForSubjectAndGrade(bankSubject, gradeLevel as 1 | 2 | 3 | 4);
}

export function buildTopicQuiz(
  subject: string,
  gradeLevel: number,
  topic: string,
  count: number
): QuizQuestion[] {
  const bankSubject = toBankSubject(subject);
  if (!bankSubject) return [];
  const matches = getQuestionsBySubjectGradeTopic(
    bankSubject,
    gradeLevel as 1 | 2 | 3 | 4,
    topic
  ).filter(
    (q) =>
      Array.isArray(q.options) &&
      q.options.length > 0 &&
      typeof q.correctAnswer === 'string'
  );
  const shuffled = [...matches].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q) => ({
    question: q.question,
    options: q.options as string[],
    correctAnswer: q.correctAnswer as string,
    topic: q.topic,
  }));
}
