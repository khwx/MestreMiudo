/**
 * @fileOverview Reward and achievement system for MestreMiudo
 * Uses emoji-based badges and milestones to motivate students
 * No external API needed - all local and fast
 */

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  milestone: number; // e.g., 10 for "10 quizzes"
  currentProgress: number;
  isComplete: boolean;
}

interface RewardTier {
  level: number;
  name: string;
  emoji: string;
  requiredPoints: number;
  title: string;
}

// All available badges
const BADGE_LIBRARY: Record<string, Badge> = {
  first_quiz: {
    id: 'first_quiz',
    name: 'Iniciante',
    emoji: '🌱',
    description: 'Fez o primeiro quiz!',
    unlocked: false,
  },
  streak_3: {
    id: 'streak_3',
    name: 'Em Forma',
    emoji: '🔥',
    description: '3 quizzes seguidos com bom resultado',
    unlocked: false,
  },
  perfect_10: {
    id: 'perfect_10',
    name: 'Perfeição',
    emoji: '⭐',
    description: '10 respostas corretas seguidas',
    unlocked: false,
  },
  master_100: {
    id: 'master_100',
    name: 'Mestre',
    emoji: '👑',
    description: '100 questões respondidas corretamente',
    unlocked: false,
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Rápido',
    emoji: '⚡',
    description: '5 quizzes em um único dia',
    unlocked: false,
  },
  consistency: {
    id: 'consistency',
    name: 'Consistência',
    emoji: '📚',
    description: 'Fez quiz 7 dias seguidos',
    unlocked: false,
  },
  portuguese_expert: {
    id: 'portuguese_expert',
    name: 'Mestre Português',
    emoji: '📖',
    description: 'Pontuação perfeita em Português',
    unlocked: false,
  },
  math_wizard: {
    id: 'math_wizard',
    name: 'Mágico da Matemática',
    emoji: '🧮',
    description: 'Pontuação perfeita em Matemática',
    unlocked: false,
  },
  nature_expert: {
    id: 'nature_expert',
    name: 'Perito da Natureza',
    emoji: '🌿',
    description: 'Pontuação perfeita em Estudo do Meio',
    unlocked: false,
  },
  allrounder: {
    id: 'allrounder',
    name: 'Polivalente',
    emoji: '🎯',
    description: 'Excelente em todas as disciplinas',
    unlocked: false,
  },
};

// Reward tiers (XP-based)
const REWARD_TIERS: RewardTier[] = [
  {
    level: 1,
    name: 'Aprendiz',
    emoji: '🌟',
    requiredPoints: 0,
    title: 'Iniciante',
  },
  {
    level: 2,
    name: 'Estudante',
    emoji: '📚',
    requiredPoints: 100,
    title: 'Estudante Dedicado',
  },
  {
    level: 3,
    name: 'Erudito',
    emoji: '🧠',
    requiredPoints: 300,
    title: 'Erudito',
  },
  {
    level: 4,
    name: 'Sábio',
    emoji: '🔮',
    requiredPoints: 600,
    title: 'Sábio Aprendiz',
  },
  {
    level: 5,
    name: 'Mestre',
    emoji: '👑',
    requiredPoints: 1000,
    title: 'Mestre do Conhecimento',
  },
];

/**
 * Calculate points earned from a quiz
 */
export function calculateQuizPoints(
  score: number,
  total: number,
  gradeLevel: number
): number {
  const percentage = (score / total) * 100;
  
  // Base points: 10 per question
  let basePoints = total * 10;
  
  // Bonus for correct answers: 5 extra points per correct
  let correctBonus = score * 5;
  
  // Grade multiplier (higher grades = more challenge)
  const gradeMultiplier = 1 + (gradeLevel - 1) * 0.1;
  
  // Percentage bonus (encourages high scores)
  let percentageBonus = 0;
  if (percentage >= 90) percentageBonus = basePoints * 0.2;
  else if (percentage >= 80) percentageBonus = basePoints * 0.1;
  else if (percentage >= 70) percentageBonus = basePoints * 0.05;
  
  const totalPoints = Math.floor(
    (basePoints + correctBonus + percentageBonus) * gradeMultiplier
  );
  
  return totalPoints;
}

/**
 * Get the current tier based on total points
 */
export function getCurrentTier(totalPoints: number): RewardTier {
  // Find the highest tier the user has reached
  let currentTier = REWARD_TIERS[0];
  
  for (const tier of REWARD_TIERS) {
    if (totalPoints >= tier.requiredPoints) {
      currentTier = tier;
    } else {
      break;
    }
  }
  
  return currentTier;
}

/**
 * Get progress to next tier
 */
export function getNextTierProgress(totalPoints: number): {
  currentTier: RewardTier;
  nextTier: RewardTier | null;
  pointsInCurrentTier: number;
  pointsNeeded: number;
  percentage: number;
} {
  const currentTier = getCurrentTier(totalPoints);
  const currentTierIndex = REWARD_TIERS.findIndex(t => t.level === currentTier.level);
  const nextTier = currentTierIndex < REWARD_TIERS.length - 1 
    ? REWARD_TIERS[currentTierIndex + 1] 
    : null;
  
  const pointsInCurrentTier = totalPoints - currentTier.requiredPoints;
  const pointsNeeded = nextTier 
    ? nextTier.requiredPoints - totalPoints 
    : 0;
  
  const tierRange = nextTier
    ? nextTier.requiredPoints - currentTier.requiredPoints
    : 1;
  
  const percentage = nextTier
    ? Math.min(100, Math.max(0, ((totalPoints - currentTier.requiredPoints) / tierRange) * 100))
    : 100;
  
  return {
    currentTier,
    nextTier,
    pointsInCurrentTier,
    pointsNeeded,
    percentage,
  };
}

/**
 * Check and award badges based on performance
 */
export function checkBadges(
  studentStats: {
    totalQuizzes: number;
    totalCorrectAnswers: number;
    perfectScores: number;
    dailyQuizzes: number;
    dayStreak: number;
    subjectScores: Record<string, number>;
  }
): string[] {
  const earnedBadges: string[] = [];
  
  // First quiz
  if (studentStats.totalQuizzes >= 1) {
    earnedBadges.push('first_quiz');
  }
  
  // Streak badges
  if (studentStats.perfectScores >= 1 && studentStats.totalQuizzes >= 3) {
    earnedBadges.push('streak_3');
  }
  
  // Perfect 10
  if (studentStats.totalCorrectAnswers >= 10) {
    earnedBadges.push('perfect_10');
  }
  
  // Master 100
  if (studentStats.totalCorrectAnswers >= 100) {
    earnedBadges.push('master_100');
  }
  
  // Speed demon
  if (studentStats.dailyQuizzes >= 5) {
    earnedBadges.push('speed_demon');
  }
  
  // Consistency
  if (studentStats.dayStreak >= 7) {
    earnedBadges.push('consistency');
  }
  
  // Subject experts
  if (studentStats.subjectScores['Português'] >= 95) {
    earnedBadges.push('portuguese_expert');
  }
  if (studentStats.subjectScores['Matemática'] >= 95) {
    earnedBadges.push('math_wizard');
  }
  if (studentStats.subjectScores['Estudo do Meio'] >= 95) {
    earnedBadges.push('nature_expert');
  }
  
  // All-rounder
  if (
    studentStats.subjectScores['Português'] >= 85 &&
    studentStats.subjectScores['Matemática'] >= 85 &&
    studentStats.subjectScores['Estudo do Meio'] >= 85
  ) {
    earnedBadges.push('allrounder');
  }
  
  return earnedBadges;
}

/**
 * Generate celebration message based on score
 */
export function generateCelebrationMessage(
  score: number,
  total: number,
  points: number
): string {
  const percentage = (score / total) * 100;
  
  const messages = {
    perfect: [
      '🎉 Perfeito! Respondeu corretamente a TODAS as perguntas!',
      '⭐ Impecável! É um verdadeiro mestre!',
      '👑 Magnífico! Merecia uma coroa!',
    ],
    excellent: [
      '🌟 Excelente! Está a ir muito bem!',
      '🚀 Fantástico! Pode estar orgulhoso!',
      '✨ Brilhante! Continue assim!',
    ],
    good: [
      '👏 Muito bom! Continue a praticar!',
      '💪 Bom trabalho! Está no caminho certo!',
      '🎯 Muito bem feito!',
    ],
    okay: [
      '✅ Bom esforço! Continue a treinar!',
      '📚 Vai melhorando! Não desista!',
      '🌱 Continue a crescer!',
    ],
    needs_practice: [
      '💪 Não desista! Continue a treinar!',
      '🌱 Cada passo conta! Continue a praticar!',
      '📖 Estude mais um pouco e consegue!',
    ],
  };
  
  let category: keyof typeof messages;
  if (percentage === 100) category = 'perfect';
  else if (percentage >= 85) category = 'excellent';
  else if (percentage >= 70) category = 'good';
  else if (percentage >= 50) category = 'okay';
  else category = 'needs_practice';
  
  const randomMsg = messages[category][Math.floor(Math.random() * messages[category].length)];
  return `${randomMsg}\n+${points} pontos!`;
}

/**
 * Get daily bonus (extra points for consistency)
 */
export function getDailyBonus(dayStreak: number): number {
  // 10 extra points per day streak (capped at 100)
  return Math.min(100, dayStreak * 10);
}
