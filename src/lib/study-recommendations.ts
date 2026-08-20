/**
 * @fileOverview Estudo recomendado - sugere a próxima atividade da criança
 * combinando revisão espaçada, temas fracos, desafio diário e progresso.
 *
 * Funções puras e determinísticas (sem aleatoriedade) para facilitar testes.
 */

import type { Answer } from '@/app/shared-schemas';
import { getWeakTopics } from './adaptive-learning';
import { buildTopicPerformance } from './quiz-practice';

export type RecommendationAction = 'review' | 'learn' | 'quiz' | 'challenge';

export type RecommendationType =
  | 'review'
  | 'weakTopic'
  | 'newLesson'
  | 'dailyChallenge'
  | 'streak';

export interface StudyRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  /** Maior = mais prioritário. */
  priority: number;
  action: RecommendationAction;
}

export interface RecommendationContext {
  studentName: string;
  /** Respostas recentes para análise de temas fracos. */
  answers?: Answer[];
  /** Número de revisões espaçadas em falta (de `spaced_repetition`). */
  dueReviewCount?: number;
  /** Sequência atual de dias de prática. */
  streak?: number;
  /** Título da próxima lição por completar (ou null se não houver). */
  nextLessonTitle?: string | null;
  /** Se há um desafio diário disponível para hoje. */
  dailyChallengeAvailable?: boolean;
}

const MAX_WEAK_TOPICS = 3;

/**
 * Constrói a lista de recomendações de estudo ordenada por prioridade.
 * Devolve um array vazio quando não há contexto suficiente.
 */
export function buildRecommendations(
  ctx: RecommendationContext
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];

  const dueReviews = ctx.dueReviewCount ?? 0;
  if (dueReviews > 0) {
    recommendations.push({
      type: 'review',
      title: 'Revisão espaçada',
      description: `Tens ${dueReviews} ${dueReviews === 1 ? 'pergunta pendente' : 'perguntas pendentes'} para revisar e fixar na memória.`,
      priority: 100 + dueReviews,
      action: 'review',
    });
  }

  const weakTopics = getWeakTopicsFromContext(ctx.answers);
  weakTopics.forEach((topic, index) => {
    recommendations.push({
      type: 'weakTopic',
      title: `Reforçar: ${topic}`,
      description: `Estiveste a ter dificuldades com "${topic}". Vamos praticar um pouco mais?`,
      priority: 80 - index,
      action: 'quiz',
    });
  });

  if (ctx.dailyChallengeAvailable) {
    recommendations.push({
      type: 'dailyChallenge',
      title: 'Desafio diário',
      description: 'Completa o desafio de hoje para manter a tua sequência e ganhar moedas!',
      priority: 70,
      action: 'challenge',
    });
  }

  if (ctx.nextLessonTitle) {
    recommendations.push({
      type: 'newLesson',
      title: 'Próxima lição',
      description: `Que tal continuar com "${ctx.nextLessonTitle}"?`,
      priority: 60,
      action: 'learn',
    });
  }

  const streak = ctx.streak ?? 0;
  if (streak > 0) {
    recommendations.push({
      type: 'streak',
      title: `Continua a sequência! 🔥`,
      description: `Já vais com ${streak} ${streak === 1 ? 'dia' : 'dias'} seguidos. Não pares agora!`,
      priority: 40 + Math.min(streak, 10),
      action: 'challenge',
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Extrai os temas fracos a partir das respostas recentes, usando a mesma
 * lógica de `getWeakTopics` (limiar 0.65).
 */
export function getWeakTopicsFromContext(answers?: Answer[]): string[] {
  if (!answers || answers.length === 0) return [];
  const metrics = buildTopicPerformance(answers);
  return getWeakTopics(metrics).slice(0, MAX_WEAK_TOPICS);
}

/**
 * Gera uma saudação motivacional curta baseada no estado do estudante.
 */
export function getRecommendationGreeting(ctx: RecommendationContext): string {
  const recs = buildRecommendations(ctx);
  if (recs.length === 0) {
    return `Olá, ${ctx.studentName}! Que tal experimentar um novo jogo ou lição?`;
  }
  const top = recs[0];
  return `Sugestão para ${ctx.studentName}: ${top.title}.`;
}
