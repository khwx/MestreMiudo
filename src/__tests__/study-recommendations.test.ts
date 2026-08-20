import { describe, it, expect } from 'vitest';
import {
  buildRecommendations,
  getWeakTopicsFromContext,
  getRecommendationGreeting,
} from '@/lib/study-recommendations';
import type { Answer } from '@/app/shared-schemas';

function makeAnswer(question: string, isCorrect: boolean, topic = 'Geral'): Answer {
  return {
    question,
    selectedAnswer: 'x',
    correctAnswer: 'y',
    isCorrect,
    topic,
  };
}

describe('buildRecommendations', () => {
  it('returns an empty list when there is no context', () => {
    expect(buildRecommendations({ studentName: 'Ana' })).toEqual([]);
  });

  it('prioritises spaced-repetition reviews when due', () => {
    const recs = buildRecommendations({
      studentName: 'Ana',
      dueReviewCount: 3,
      dailyChallengeAvailable: true,
    });
    expect(recs[0].type).toBe('review');
    expect(recs[0].priority).toBeGreaterThan(recs[1].priority);
  });

  it('orders recommendations by descending priority', () => {
    const recs = buildRecommendations({
      studentName: 'Ana',
      dueReviewCount: 5,
      dailyChallengeAvailable: true,
      streak: 2,
    });
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].priority).toBeGreaterThanOrEqual(recs[i].priority);
    }
  });

  it('suggests weak topics from recent answers', () => {
    const answers: Answer[] = [
      makeAnswer('Q1', false, 'Frações'),
      makeAnswer('Q2', false, 'Frações'),
      makeAnswer('Q3', true, 'Animais'),
    ];
    const recs = buildRecommendations({ studentName: 'Ana', answers });
    const weak = recs.find((r) => r.type === 'weakTopic');
    expect(weak).toBeDefined();
    expect(weak?.title).toContain('Frações');
    expect(weak?.action).toBe('quiz');
  });

  it('limits weak topics to the top 3', () => {
    const topics = ['A', 'B', 'C', 'D', 'E'];
    const answers: Answer[] = topics.flatMap((t) => [
      makeAnswer(`q-${t}-1`, false, t),
      makeAnswer(`q-${t}-2`, false, t),
    ]);
    const recs = buildRecommendations({ studentName: 'Ana', answers });
    const weak = recs.filter((r) => r.type === 'weakTopic');
    expect(weak).toHaveLength(3);
  });

  it('includes a daily challenge recommendation when available', () => {
    const recs = buildRecommendations({
      studentName: 'Ana',
      dailyChallengeAvailable: true,
    });
    expect(recs.some((r) => r.type === 'dailyChallenge')).toBe(true);
  });

  it('includes the next lesson when provided', () => {
    const recs = buildRecommendations({
      studentName: 'Ana',
      nextLessonTitle: 'As Vogais',
    });
    const lesson = recs.find((r) => r.type === 'newLesson');
    expect(lesson?.title).toBe('Próxima lição');
    expect(lesson?.description).toContain('As Vogais');
    expect(lesson?.action).toBe('learn');
  });

  it('adds a streak nudge when the student has a streak', () => {
    const recs = buildRecommendations({ studentName: 'Ana', streak: 4 });
    const streak = recs.find((r) => r.type === 'streak');
    expect(streak).toBeDefined();
    expect(streak?.description).toContain('4');
    expect(streak?.priority).toBeGreaterThanOrEqual(44);
  });

  it('does not add a streak nudge when streak is zero', () => {
    const recs = buildRecommendations({ studentName: 'Ana', streak: 0 });
    expect(recs.some((r) => r.type === 'streak')).toBe(false);
  });
});

describe('getWeakTopicsFromContext', () => {
  it('returns an empty array with no answers', () => {
    expect(getWeakTopicsFromContext(undefined)).toEqual([]);
    expect(getWeakTopicsFromContext([])).toEqual([]);
  });

  it('flags topics below the 0.65 threshold', () => {
    const answers: Answer[] = [
      makeAnswer('Q1', true, 'Forte'),
      makeAnswer('Q2', true, 'Forte'),
      makeAnswer('Q3', false, 'Fraco'),
      makeAnswer('Q4', false, 'Fraco'),
    ];
    expect(getWeakTopicsFromContext(answers)).toEqual(['Fraco']);
  });
});

describe('getRecommendationGreeting', () => {
  it('greets warmly when no recommendations exist', () => {
    expect(getRecommendationGreeting({ studentName: 'Ana' })).toContain('Ana');
  });

  it('references the top recommendation when available', () => {
    const greeting = getRecommendationGreeting({
      studentName: 'Bruno',
      dueReviewCount: 2,
    });
    expect(greeting).toContain('Bruno');
    expect(greeting).toContain('Revisão espaçada');
  });
});
