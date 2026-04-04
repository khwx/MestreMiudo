'use server';

/**
 * @fileOverview Shareable achievements system
 * Generates achievement cards and social sharing URLs
 */

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockDate: string;
}

export interface AchievementCard {
  achievementId: string;
  studentName: string;
  achievement: Achievement;
  shareUrl: string;
  imageUrl: string;
}

// Define all possible achievements
const ACHIEVEMENTS_CATALOG = {
  first_quiz: {
    title: 'Primeiro Passo',
    description: 'Completou o primeiro quiz',
    icon: '🚀',
    color: '#3b82f6',
  },
  five_quizzes: {
    title: 'Aprendiz',
    description: 'Completou 5 quizzes',
    icon: '📚',
    color: '#8b5cf6',
  },
  ten_quizzes: {
    title: 'Estudante Dedicado',
    description: 'Completou 10 quizzes',
    icon: '⭐',
    color: '#ec4899',
  },
  fifty_quizzes: {
    title: 'Mestre do Conhecimento',
    description: 'Completou 50 quizzes',
    icon: '👑',
    color: '#f59e0b',
  },
  perfect_score: {
    title: 'Perfeição!',
    description: 'Acertou um quiz com 100%',
    icon: '💯',
    color: '#10b981',
  },
  week_streak: {
    title: 'Uma Semana de Fogo',
    description: 'Manteve uma streak de 7 dias',
    icon: '🔥',
    color: '#ef4444',
  },
  month_streak: {
    title: 'Consistência é Chave',
    description: 'Manteve uma streak de 30 dias',
    icon: '💪',
    color: '#f97316',
  },
  best_in_class: {
    title: 'Melhor da Classe',
    description: 'Liderou o ranking da sua turma',
    icon: '🏆',
    color: '#fbbf24',
  },
  all_subjects_master: {
    title: 'Mestre Completo',
    description: 'Atingiu média de 90% em todas as disciplinas',
    icon: '🎓',
    color: '#6b7280',
  },
  daily_challenge_master: {
    title: 'Desafio Diário - Campeão',
    description: 'Completou 30 desafios diários com sucesso',
    icon: '🎯',
    color: '#8b5cf6',
  },
};

/**
 * Check if student has unlocked an achievement
 */
export async function checkAchievementUnlock(
  studentQuizzes: number,
  perfectScores: number,
  dayStreak: number,
  averageScore: number,
  isTopRanker: boolean,
  dailyChallengesCompleted: number
): Promise<string[]> {
  const unlockedIds: string[] = [];

  if (studentQuizzes >= 1) unlockedIds.push('first_quiz');
  if (studentQuizzes >= 5) unlockedIds.push('five_quizzes');
  if (studentQuizzes >= 10) unlockedIds.push('ten_quizzes');
  if (studentQuizzes >= 50) unlockedIds.push('fifty_quizzes');
  if (perfectScores >= 1) unlockedIds.push('perfect_score');
  if (dayStreak >= 7) unlockedIds.push('week_streak');
  if (dayStreak >= 30) unlockedIds.push('month_streak');
  if (isTopRanker) unlockedIds.push('best_in_class');
  if (averageScore >= 90) unlockedIds.push('all_subjects_master');
  if (dailyChallengesCompleted >= 30) unlockedIds.push('daily_challenge_master');

  return unlockedIds;
}

/**
 * Generate a shareable achievement card
 */
export function generateShareableAchievementCard(
  studentName: string,
  achievementId: string,
  unlockDate: string
): AchievementCard {
  const achievement = ACHIEVEMENTS_CATALOG[
    achievementId as keyof typeof ACHIEVEMENTS_CATALOG
  ] || {
    title: 'Conquista Desbloqueada',
    description: 'Conquista desconhecida',
    icon: '⭐',
    color: '#3b82f6',
  };

  // Generate a unique share URL (in real app, would generate a short code)
  const shareCode = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const shareUrl = `https://mestremiudo.com/achievements/${shareCode}`;

  return {
    achievementId,
    studentName,
    achievement: {
      id: achievementId,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      color: achievement.color,
      unlockDate,
    },
    shareUrl,
    imageUrl: `${shareUrl}/image.png`, // Would be generated via server-side rendering
  };
}

/**
 * Generate HTML for shareable achievement card
 */
export function generateAchievementHTML(card: AchievementCard): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .description {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .student-name {
            font-size: 24px;
            font-weight: 600;
            color: #667eea;
            margin-top: 20px;
          }
          .unlock-date {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 10px;
          }
          .powered-by {
            margin-top: 30px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${card.achievement.icon}</div>
          <div class="title">${card.achievement.title}</div>
          <div class="description">${card.achievement.description}</div>
          <div class="student-name">🎓 ${card.studentName}</div>
          <div class="unlock-date">Desbloqueado em ${new Date(card.achievement.unlockDate).toLocaleDateString('pt-PT')}</div>
          <div class="powered-by">Gerado por MestreMiudo • Plataforma Educativa</div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate social media share text
 */
export function generateShareText(
  studentName: string,
  achievementId: string,
  shareUrl: string
): string {
  const achievement = ACHIEVEMENTS_CATALOG[
    achievementId as keyof typeof ACHIEVEMENTS_CATALOG
  ];
  if (!achievement) return '';

  return `🎉 ${studentName} desbloqueou a conquista "${achievement.title}" no MestreMiudo! ${achievement.icon}\n\n"${achievement.description}"\n\nVê também a minha conquista: ${shareUrl}`;
}

/**
 * Get all available achievements
 */
export function getAllAchievements(): Array<Achievement & { id: string }> {
  return Object.entries(ACHIEVEMENTS_CATALOG).map(([id, achievement]) => ({
    id,
    ...achievement,
    unlockDate: new Date().toISOString(),
  }));
}
