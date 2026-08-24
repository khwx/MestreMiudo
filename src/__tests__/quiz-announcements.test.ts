import { describe, it, expect } from 'vitest';
import { buildQuizResultAnnouncement } from '@/lib/quiz-announcements';

describe('buildQuizResultAnnouncement', () => {
  it('anuncia pontuação, percentagem e estrelas para um quiz normal', () => {
    const msg = buildQuizResultAnnouncement({ score: 4, total: 5, subject: 'Matemática' });
    expect(msg).toContain('Quiz concluído');
    expect(msg).toContain('4 de 5 perguntas corretas');
    expect(msg).toContain('80%');
    expect(msg).toContain('duas estrelas');
    expect(msg).toContain('Matemática');
  });

  it('usa o prefixo de prática no modo treino livre', () => {
    const msg = buildQuizResultAnnouncement({ score: 3, total: 5, subject: 'Português', practiceMode: true });
    expect(msg).toContain('Prática concluída');
    expect(msg).not.toContain('Quiz concluído');
  });

  it('concede três estrelas numa pontuação perfeita', () => {
    const msg = buildQuizResultAnnouncement({ score: 5, total: 5 });
    expect(msg).toContain('100%');
    expect(msg).toContain('três estrelas');
  });

  it('concede zero estrelas numa pontuação muito baixa', () => {
    const msg = buildQuizResultAnnouncement({ score: 1, total: 10 });
    expect(msg).toContain('10%');
    expect(msg).toContain('sem estrelas');
  });

  it('trunca a pontuação ao máximo do total', () => {
    const msg = buildQuizResultAnnouncement({ score: 99, total: 8 });
    expect(msg).toContain('8 de 8 perguntas corretas');
  });

  it('não inclui disciplina quando omitida', () => {
    const msg = buildQuizResultAnnouncement({ score: 2, total: 4 });
    expect(msg).not.toContain('disciplina de');
  });

  it('lida com total zero de forma segura', () => {
    expect(buildQuizResultAnnouncement({ score: 0, total: 0 })).toBe('Quiz concluído!');
  });
});
