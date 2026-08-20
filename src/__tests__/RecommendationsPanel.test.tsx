import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import type { StudyRecommendation } from '@/lib/study-recommendations';

const baseProps = { name: 'Joana', grade: '2' };

function makeRec(partial: Partial<StudyRecommendation> & Pick<StudyRecommendation, 'type' | 'title' | 'description' | 'priority' | 'action'>): StudyRecommendation {
  return partial;
}

describe('RecommendationsPanel', () => {
  it('returns null when there are no recommendations', () => {
    const { container } = render(<RecommendationsPanel {...baseProps} recommendations={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the panel heading', () => {
    render(
      <RecommendationsPanel
        {...baseProps}
        recommendations={[
          makeRec({ type: 'review', title: 'Revisão espaçada', description: 'Tens 2 perguntas pendentes.', priority: 102, action: 'review' }),
        ]}
      />
    );
    expect(screen.getByText('💡 Sugestões para ti')).toBeDefined();
  });

  it('renders one entry per recommendation', () => {
    const recommendations = [
      makeRec({ type: 'review', title: 'Revisão espaçada', description: 'Tens 2 perguntas pendentes.', priority: 102, action: 'review' }),
      makeRec({ type: 'weakTopic', title: 'Reforçar: Frações', description: 'Dificuldades com "Frações".', priority: 80, action: 'quiz' }),
      makeRec({ type: 'newLesson', title: 'Próxima lição', description: 'Continuar com "Adição".', priority: 60, action: 'learn' }),
    ];
    render(<RecommendationsPanel {...baseProps} recommendations={recommendations} />);

    expect(screen.getByText('Revisão espaçada')).toBeDefined();
    expect(screen.getByText('Reforçar: Frações')).toBeDefined();
    expect(screen.getByText('Próxima lição')).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('links each recommendation to the correct area using name and grade', () => {
    const recommendations = [
      makeRec({ type: 'review', title: 'Revisão espaçada', description: 'desc', priority: 102, action: 'review' }),
      makeRec({ type: 'newLesson', title: 'Próxima lição', description: 'desc', priority: 60, action: 'learn' }),
      makeRec({ type: 'weakTopic', title: 'Tema fraco', description: 'desc', priority: 80, action: 'quiz' }),
      makeRec({ type: 'dailyChallenge', title: 'Desafio diário', description: 'desc', priority: 70, action: 'challenge' }),
    ];
    render(<RecommendationsPanel {...baseProps} recommendations={recommendations} />);

    expect(screen.getByRole('link', { name: /Revisão espaçada/i }).getAttribute('href')).toBe('/dashboard/review?name=Joana&grade=2');
    expect(screen.getByRole('link', { name: /Próxima lição/i }).getAttribute('href')).toBe('/dashboard/learn?name=Joana&grade=2');
    expect(screen.getByRole('link', { name: /Tema fraco/i }).getAttribute('href')).toBe('/quiz/misto?name=Joana&grade=2');
    expect(screen.getByRole('link', { name: /Desafio diário/i }).getAttribute('href')).toBe('/dashboard/daily-challenge?name=Joana&grade=2');
  });

  it('renders the description text for each recommendation', () => {
    render(
      <RecommendationsPanel
        {...baseProps}
        recommendations={[
          makeRec({ type: 'streak', title: 'Continua a sequência! 🔥', description: 'Já vais com 5 dias seguidos.', priority: 45, action: 'challenge' }),
        ]}
      />
    );
    expect(screen.getByText('Já vais com 5 dias seguidos.')).toBeDefined();
  });
});
