import { describe, it, expect } from 'vitest';
import { generateHint } from '@/lib/hint';
import type { QuizQuestion } from '@/app/shared-schemas';

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    question: 'Qual palavra rima com gato?',
    options: ['pato', 'mesa', 'livro', 'cadeira'],
    correctAnswer: 'pato',
    topic: 'Português',
    ...overrides,
  };
}

describe('generateHint', () => {
  it('returns the explicit hint when provided', () => {
    const q = makeQuestion({ hint: '  Pense em animais  ' });
    expect(generateHint(q)).toBe('Pense em animais');
  });

  it('derives a hint revealing the first letter and a wrong option', () => {
    const hint = generateHint(makeQuestion());
    expect(hint).toContain('P');
    expect(hint).toContain('não é');
    expect(hint).toContain('cadeira');
  });

  it('derives a hint when only one wrong option exists', () => {
    const q = makeQuestion({ options: ['pato', 'sapato'], correctAnswer: 'pato' });
    const hint = generateHint(q);
    expect(hint).toContain('não é');
    expect(hint).toContain('sapato');
  });

  it('falls back to first-letter hint when there are no options', () => {
    const hint = generateHint(makeQuestion({ options: [], correctAnswer: 'lisboa' }));
    expect(hint).toContain('L');
  });

  it('returns null when nothing can be derived', () => {
    expect(generateHint(makeQuestion({ options: [], correctAnswer: '' }))).toBeNull();
    expect(generateHint(null as unknown as QuizQuestion)).toBeNull();
  });
});
