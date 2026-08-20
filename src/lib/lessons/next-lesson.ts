/**
 * @fileOverview Cálculo da próxima lição concreta por completar.
 *
 * Funções puras e determinísticas para descobrir qual é a próxima lição
 * (por disciplina e ordem) que a criança ainda não concluiu.
 */

import type { Lesson } from '@/app/shared-schemas';

const SUBJECT_ORDER: Lesson['subject'][] = ['Português', 'Matemática', 'Estudo do Meio'];

export type NextLessonInfo = {
  id: string;
  title: string;
  subject: Lesson['subject'];
};

/**
 * Devolve a próxima lição por completar, ordenada por disciplina (Português →
 * Matemática → Estudo do Meio) e, dentro de cada disciplina, por `lesson_index`.
 * Retorna `null` quando não há lições ou quando todas já foram concluídas.
 */
export function getNextLesson(
  lessons: Pick<Lesson, 'id' | 'title' | 'subject' | 'lesson_index'>[],
  completedLessonIds: Set<string>,
): NextLessonInfo | null {
  if (!lessons || lessons.length === 0) return null;

  const subjectRank = (subject: Lesson['subject']) => {
    const index = SUBJECT_ORDER.indexOf(subject);
    return index === -1 ? SUBJECT_ORDER.length : index;
  };

  const sorted = [...lessons].sort((a, b) => {
    const bySubject = subjectRank(a.subject) - subjectRank(b.subject);
    if (bySubject !== 0) return bySubject;
    return a.lesson_index - b.lesson_index;
  });

  const next = sorted.find((lesson) => !completedLessonIds.has(lesson.id as string));
  if (!next) return null;

  return { id: next.id as string, title: next.title, subject: next.subject };
}

/**
 * Versão conveniente que devolve apenas o título da próxima lição, ou `null`.
 */
export function getNextLessonTitle(
  lessons: Pick<Lesson, 'id' | 'title' | 'subject' | 'lesson_index'>[],
  completedLessonIds: Set<string>,
): string | null {
  return getNextLesson(lessons, completedLessonIds)?.title ?? null;
}
