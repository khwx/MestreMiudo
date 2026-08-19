/**
 * @fileOverview Unified Badge Catalog - Single source of truth for all badges/achievements
 * This file synchronizes the three badge systems:
 * - src/lib/achievements.ts (ACHIEVEMENTS_CATALOG)
 * - src/lib/rewards.ts (_BADGE_LIBRARY)
 * - src/components/BadgePopup/index.tsx (BADGE_DEFINITIONS)
 */

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface BadgePopupDefinition {
  name: string;
  description: string;
  icon: string;
}

export interface RewardsBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

// Unified badge catalog - canonical definitions
export const UNIFIED_BADGES: Record<string, BadgeDefinition> = {
  // Quiz completion badges
  first_quiz: {
    id: 'first_quiz',
    name: 'Primeiro Passo',
    description: 'Completou o primeiro quiz',
    icon: '🚀',
    color: '#3b82f6',
  },
  five_quizzes: {
    id: 'five_quizzes',
    name: 'Aprendiz',
    description: 'Completou 5 quizzes',
    icon: '📚',
    color: '#8b5cf6',
  },
  ten_quizzes: {
    id: 'ten_quizzes',
    name: 'Estudante Dedicado',
    description: 'Completou 10 quizzes',
    icon: '⭐',
    color: '#ec4899',
  },
  fifty_quizzes: {
    id: 'fifty_quizzes',
    name: 'Mestre do Conhecimento',
    description: 'Completou 50 quizzes',
    icon: '👑',
    color: '#f59e0b',
  },
  legendary: {
    id: 'legendary',
    name: 'Lendário',
    description: 'Completou 100 quizzes no total',
    icon: '👑',
    color: '#f59e0b',
  },

  // Perfect score badges
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfeição!',
    description: 'Acertou um quiz com 100%',
    icon: '💯',
    color: '#10b981',
  },
  quiz_100_streak: {
    id: 'quiz_100_streak',
    name: 'Três Perfeições Seguidas',
    description: 'Acertou 100% em 3 quizzes consecutivos',
    icon: '💎',
    color: '#8b5cf6',
  },

  // Streak badges
  week_streak: {
    id: 'week_streak',
    name: 'Uma Semana de Fogo',
    description: 'Manteve uma streak de 7 dias',
    icon: '🔥',
    color: '#ef4444',
  },
  streak_14: {
    id: 'streak_14',
    name: 'Duas Semanas de Fogo',
    description: 'Manteve uma streak de 14 dias',
    icon: '🔥',
    color: '#dc2626',
  },
  streak_21: {
    id: 'streak_21',
    name: 'Três Semanas de Fogo',
    description: 'Streak de 21 dias consecutivos',
    icon: '💪',
    color: '#dc2626',
  },
  month_streak: {
    id: 'month_streak',
    name: 'Consistência é Chave',
    description: 'Manteve uma streak de 30 dias',
    icon: '💪',
    color: '#f97316',
  },
  streak_30: {
    id: 'streak_30',
    name: 'Trinta Dias de Fogo',
    description: 'Manteve uma streak de 30 dias',
    icon: '🏆',
    color: '#f59e0b',
  },

  // Daily challenge badges
  daily_7: {
    id: 'daily_7',
    name: 'Desafiante Semanal',
    description: 'Completou 7 desafios diários',
    icon: '📅',
    color: '#8b5cf6',
  },
  daily_14: {
    id: 'daily_14',
    name: 'Desafiante Quinzenal',
    description: 'Completou 14 desafios diários',
    icon: '🔥',
    color: '#ef4444',
  },
  daily_21: {
    id: 'daily_21',
    name: 'Desafiante Dedicado',
    description: '21 desafios diários completados',
    icon: '🔥',
    color: '#ef4444',
  },
  daily_30: {
    id: 'daily_30',
    name: 'Desafiante Mensal',
    description: 'Completou 30 desafios diários',
    icon: '🏆',
    color: '#f59e0b',
  },
  daily_challenge_master: {
    id: 'daily_challenge_master',
    name: 'Desafio Diário - Campeão',
    description: 'Completou 30 desafios diários com sucesso',
    icon: '🎯',
    color: '#8b5cf6',
  },

  // Subject mastery badges
  subject_master_portugues: {
    id: 'subject_master_portugues',
    name: 'Mestre de Português',
    description: 'Atingiu média de 90%+ em Português',
    icon: '📖',
    color: '#3b82f6',
  },
  subject_master_matematica: {
    id: 'subject_master_matematica',
    name: 'Mestre de Matemática',
    description: 'Atingiu média de 90%+ em Matemática',
    icon: '🔢',
    color: '#ef4444',
  },
  subject_master_estudo: {
    id: 'subject_master_estudo',
    name: 'Mestre de Estudo do Meio',
    description: 'Atingiu média de 90%+ em Estudo do Meio',
    icon: '🌍',
    color: '#22c55e',
  },
  portugues_master: {
    id: 'portugues_master',
    name: 'Mestre de Português',
    description: 'Completou 20 quizzes de Português com média de 80%+',
    icon: '📖',
    color: '#22c55e',
  },
  matematica_master: {
    id: 'matematica_master',
    name: 'Mestre de Matemática',
    description: 'Completou 20 quizzes de Matemática com média de 80%+',
    icon: '🔢',
    color: '#3b82f6',
  },
  ciencias_master: {
    id: 'ciencias_master',
    name: 'Mestre de Ciências',
    description: 'Completou 20 quizzes de Estudo do Meio com média de 80%+',
    icon: '🔬',
    color: '#f97316',
  },
  portugues_pro: {
    id: 'portugues_pro',
    name: 'Profissional de Português',
    description: '50 quizzes de Português completados',
    icon: '📖',
    color: '#22c55e',
  },
  matematica_pro: {
    id: 'matematica_pro',
    name: 'Profissional de Matemática',
    description: '50 quizzes de Matemática completados',
    icon: '🔢',
    color: '#3b82f6',
  },
  ciencias_pro: {
    id: 'ciencias_pro',
    name: 'Profissional de Ciências',
    description: '50 quizzes de Estudo do Meio completados',
    icon: '🌍',
    color: '#8b5cf6',
  },

  // General mastery
  all_subjects_master: {
    id: 'all_subjects_master',
    name: 'Mestre Completo',
    description: 'Atingiu média de 90% em todas as disciplinas',
    icon: '🎓',
    color: '#6b7280',
  },
  all_rounder: {
    id: 'all_rounder',
    name: 'Polivalente do Dia',
    description: 'Atingiu 80%+ em todas as 3 disciplinas no mesmo dia',
    icon: '🌟',
    color: '#ec4899',
  },
  best_in_class: {
    id: 'best_in_class',
    name: 'Melhor da Classe',
    description: 'Liderou o ranking da sua turma',
    icon: '🏆',
    color: '#fbbf24',
  },

  // Speed & time badges
  speed_demon: {
    id: 'speed_demon',
    name: 'Demónio da Velocidade',
    description: 'Completou um quiz em menos de 2 minutos',
    icon: '⚡',
    color: '#facc15',
  },
  night_owl: {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Completou um quiz depois das 20h',
    icon: '🦉',
    color: '#6366f1',
  },
  early_bird: {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completou um quiz antes das 8h',
    icon: '🌅',
    color: '#f97316',
  },
  quiz_marathon: {
    id: 'quiz_marathon',
    name: 'Maratona de Quizzes',
    description: 'Completou 3 quizzes num único dia',
    icon: '🏃',
    color: '#10b981',
  },
  perfect_week: {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: 'Manteve média de 80%+ durante 7 dias seguidos',
    icon: '⭐',
    color: '#fbbf24',
  },

  // Lesson & story badges
  first_lesson: {
    id: 'first_lesson',
    name: 'Primeira Lição',
    description: 'Completou a primeira lição',
    icon: '📚',
    color: '#3b82f6',
  },
  ten_lessons: {
    id: 'ten_lessons',
    name: 'Dez Lições',
    description: 'Completou 10 lições',
    icon: '📖',
    color: '#8b5cf6',
  },
  story_creator: {
    id: 'story_creator',
    name: 'Criador de Histórias',
    description: 'Criou a primeira história',
    icon: '📝',
    color: '#ec4899',
  },
  story_lover: {
    id: 'story_lover',
    name: 'Amante de Histórias',
    description: 'Criou 5 histórias',
    icon: '📝',
    color: '#ec4899',
  },

  // Game badges
  game_champion: {
    id: 'game_champion',
    name: 'Campeão de Jogos',
    description: 'Venceu 10 jogos',
    icon: '🎮',
    color: '#10b981',
  },
  all_games_master: {
    id: 'all_games_master',
    name: 'Mestre de Todos os Jogos',
    description: 'Venceu todos os 5 tipos de jogos',
    icon: '🎯',
    color: '#6366f1',
  },

  // Shop badges
  shopaholic: {
    id: 'shopaholic',
    name: 'Comprador Fiel',
    description: 'Comprou 5 itens na loja',
    icon: '🛍️',
    color: '#f97316',
  },
};

// Legacy ID mappings for backwards compatibility
export const LEGACY_ID_MAP: Record<string, string> = {
  // BadgePopup IDs -> Unified IDs
  'primeiro_quiz': 'first_quiz',
  'perfeicao': 'perfect_score',
  'streak_3': 'week_streak',
  'streak_7': 'week_streak',
  'streak_30': 'month_streak',
  'mestre_completo': 'all_subjects_master',
  'explorador': 'all_rounder',
  'colecionador': 'ten_lessons',
  'campeao': 'daily_challenge_master',
  'melhor_da_classe': 'best_in_class',

  // Rewards IDs -> Unified IDs
  'perfect_10': 'perfect_score',
  'master_100': 'fifty_quizzes',
  'consistency': 'week_streak',
  'portuguese_expert': 'subject_master_portugues',
  'math_wizard': 'subject_master_matematica',
  'nature_expert': 'subject_master_estudo',
  'allrounder': 'all_rounder',
};

/**
 * Get a badge definition by unified ID
 */
export function getBadge(id: string): BadgeDefinition | undefined {
  return UNIFIED_BADGES[id];
}

/**
 * Get a badge definition by any known ID (unified or legacy)
 */
export function getBadgeByAnyId(id: string): BadgeDefinition | undefined {
  const unifiedId = LEGACY_ID_MAP[id] || id;
  return UNIFIED_BADGES[unifiedId];
}

/**
 * Get all badge definitions
 */
export function getAllBadges(): BadgeDefinition[] {
  return Object.values(UNIFIED_BADGES);
}

/**
 * Get badge definitions formatted for BadgePopup component
 */
export function getBadgePopupDefinitions(): Record<string, BadgePopupDefinition> {
  const result: Record<string, BadgePopupDefinition> = {};
  for (const [id, badge] of Object.entries(UNIFIED_BADGES)) {
    result[id] = {
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
    };
  }
  return result;
}

/**
 * Get badge definitions formatted for rewards system
 */
export function getRewardsBadges(): Record<string, RewardsBadge> {
  const result: Record<string, RewardsBadge> = {};
  for (const [id, badge] of Object.entries(UNIFIED_BADGES)) {
    result[id] = {
      id: badge.id,
      name: badge.name,
      emoji: badge.icon,
      description: badge.description,
      unlocked: false,
    };
  }
  return result;
}

/**
 * Check if a legacy ID maps to a unified badge
 */
export function isLegacyId(id: string): boolean {
  return id in LEGACY_ID_MAP;
}

/**
 * Convert legacy ID to unified ID
 */
export function toUnifiedId(legacyId: string): string {
  return LEGACY_ID_MAP[legacyId] || legacyId;
}