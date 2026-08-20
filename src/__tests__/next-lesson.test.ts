import { describe, it, expect } from 'vitest';
import { getNextLesson, getNextLessonTitle } from '@/lib/lessons/next-lesson';

type LessonSeed = {
  id: string;
  title: string;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio';
  lesson_index: number;
};

function makeLessons(): LessonSeed[] {
  return [
    { id: 'p1', title: 'Vogais', subject: 'Português', lesson_index: 1 },
    { id: 'p2', title: 'Consoantes', subject: 'Português', lesson_index: 2 },
    { id: 'm1', title: 'Números', subject: 'Matemática', lesson_index: 1 },
    { id: 'e1', title: 'Animais', subject: 'Estudo do Meio', lesson_index: 1 },
  ];
}

describe('getNextLesson', () => {
  it('returns the first lesson when nothing is completed', () => {
    const next = getNextLesson(makeLessons(), new Set());
    expect(next).toEqual({ id: 'p1', title: 'Vogais', subject: 'Português' });
  });

  it('respects subject order (Português before Matemática/Estudo do Meio)', () => {
    const lessons = makeLessons();
    const completed = new Set(['p1', 'p2', 'm1']);
    const next = getNextLesson(lessons, completed);
    expect(next?.subject).toBe('Estudo do Meio');
    expect(next?.title).toBe('Animais');
  });

  it('orders by lesson_index within a subject', () => {
    const completed = new Set(['p1']);
    const next = getNextLesson(makeLessons(), completed);
    expect(next?.title).toBe('Consoantes');
  });

  it('returns null when all lessons are completed', () => {
    const completed = new Set(['p1', 'p2', 'm1', 'e1']);
    expect(getNextLesson(makeLessons(), completed)).toBeNull();
  });

  it('returns null for an empty lesson list', () => {
    expect(getNextLesson([], new Set())).toBeNull();
  });
});

describe('getNextLessonTitle', () => {
  it('returns the title of the next lesson', () => {
    expect(getNextLessonTitle(makeLessons(), new Set())).toBe('Vogais');
  });

  it('returns null when there is no pending lesson', () => {
    const completed = new Set(['p1', 'p2', 'm1', 'e1']);
    expect(getNextLessonTitle(makeLessons(), completed)).toBeNull();
  });
});
