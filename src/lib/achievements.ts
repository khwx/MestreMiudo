/**
 * @fileOverview Shareable achievements system
 * Generates achievement cards and social sharing URLs
 */

import {
  getBadge,
  getAllBadges,
  BadgeDefinition,
} from '@/lib/badges';

export interface Achievement {
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

/**
 * Convert unified badge to achievement format
 */
function toAchievement(badge: BadgeDefinition): Omit<Achievement, 'id' | 'unlockDate'> {
  return {
    title: badge.name,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
  };
}

/**
 * Check if student has unlocked an achievement
 */
export async function checkAchievementUnlock(
  studentQuizzes: number,
  perfectScores: number,
  dayStreak: number,
  averageScore: number,
  isTopRanker: boolean,
  dailyChallengesCompleted: number,
  options?: {
    quizDurationSeconds?: number;
    completionHour?: number;
    quizzesToday?: number;
    portugueseAverage?: number;
    mathAverage?: number;
    estudoAverage?: number;
    portugueseQuizzes?: number;
    mathQuizzes?: number;
    estudoQuizzes?: number;
    consecutivePerfectScores?: number;
    allSubjectsQuizzedToday?: boolean;
    lessonsCompleted?: number;
    storiesCreated?: number;
    gamesWon?: number;
    gamesWonByType?: Set<string>;
    consecutiveDaysAverage80Plus?: number;
    shopItemsPurchased?: number;
  }
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

  // Speed and time achievements
  if (options?.quizDurationSeconds !== undefined && options.quizDurationSeconds < 120) {
    unlockedIds.push('speed_demon');
  }
  if (options?.completionHour !== undefined && options.completionHour >= 20) {
    unlockedIds.push('night_owl');
  }
  if (options?.completionHour !== undefined && options.completionHour < 8) {
    unlockedIds.push('early_bird');
  }
  if (options?.quizzesToday !== undefined && options.quizzesToday >= 3) {
    unlockedIds.push('quiz_marathon');
  }

  // Subject mastery achievements
  if (options?.portugueseAverage !== undefined && options.portugueseAverage >= 90) {
    unlockedIds.push('subject_master_portugues');
  }
  if (options?.mathAverage !== undefined && options.mathAverage >= 90) {
    unlockedIds.push('subject_master_matematica');
  }
  if (options?.estudoAverage !== undefined && options.estudoAverage >= 90) {
    unlockedIds.push('subject_master_estudo');
  }

  // Streak achievements
  if (dayStreak >= 14) unlockedIds.push('streak_14');
  if (dayStreak >= 30) unlockedIds.push('streak_30');

  // Daily challenge achievements
  if (dailyChallengesCompleted >= 7) unlockedIds.push('daily_7');
  if (dailyChallengesCompleted >= 14) unlockedIds.push('daily_14');
  if (dailyChallengesCompleted >= 30) unlockedIds.push('daily_30');

  // Curriculum mastery badges
  if (options?.portugueseQuizzes !== undefined && options.portugueseQuizzes >= 20 && options.portugueseAverage !== undefined && options.portugueseAverage >= 80) {
    unlockedIds.push('portugues_master');
  }
  if (options?.mathQuizzes !== undefined && options.mathQuizzes >= 20 && options.mathAverage !== undefined && options.mathAverage >= 80) {
    unlockedIds.push('matematica_master');
  }
  if (options?.estudoQuizzes !== undefined && options.estudoQuizzes >= 20 && options.estudoAverage !== undefined && options.estudoAverage >= 80) {
    unlockedIds.push('ciencias_master');
  }
  if (options?.consecutivePerfectScores !== undefined && options.consecutivePerfectScores >= 3) {
    unlockedIds.push('quiz_100_streak');
  }
  if (options?.portugueseAverage !== undefined && options.mathAverage !== undefined && options.estudoAverage !== undefined &&
      options.portugueseAverage >= 80 && options.mathAverage >= 80 && options.estudoAverage >= 80 &&
      options.allSubjectsQuizzedToday) {
    unlockedIds.push('all_rounder');
  }

  // New lesson and story achievements
  if (options?.lessonsCompleted !== undefined && options.lessonsCompleted >= 1) {
    unlockedIds.push('first_lesson');
  }
  if (options?.lessonsCompleted !== undefined && options.lessonsCompleted >= 10) {
    unlockedIds.push('ten_lessons');
  }
  if (options?.storiesCreated !== undefined && options.storiesCreated >= 5) {
    unlockedIds.push('story_lover');
  }

  // Game achievements
  if (options?.gamesWon !== undefined && options.gamesWon >= 10) {
    unlockedIds.push('game_champion');
  }
  if (options?.gamesWonByType !== undefined && options.gamesWonByType.size >= 5) {
    unlockedIds.push('all_games_master');
  }

  // Perfect week achievement
  if (options?.consecutiveDaysAverage80Plus !== undefined && options.consecutiveDaysAverage80Plus >= 7) {
    unlockedIds.push('perfect_week');
  }

  // Story achievements
  if (options?.storiesCreated !== undefined && options.storiesCreated >= 1) {
    unlockedIds.push('story_creator');
  }

  // Shop achievement
  if (options?.shopItemsPurchased !== undefined && options.shopItemsPurchased >= 5) {
    unlockedIds.push('shopaholic');
  }

  // Daily challenge milestones
  if (dailyChallengesCompleted >= 21) unlockedIds.push('daily_21');

  // Streak milestones
  if (dayStreak >= 21) unlockedIds.push('streak_21');

  // Subject pro achievements
  if (options?.portugueseQuizzes !== undefined && options.portugueseQuizzes >= 50) {
    unlockedIds.push('portugues_pro');
  }
  if (options?.mathQuizzes !== undefined && options.mathQuizzes >= 50) {
    unlockedIds.push('matematica_pro');
  }
  if (options?.estudoQuizzes !== undefined && options.estudoQuizzes >= 50) {
    unlockedIds.push('ciencias_pro');
  }

  // Legendary achievement
  if (studentQuizzes >= 100) unlockedIds.push('legendary');

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
  const badge = getBadge(achievementId);
  const achievement = badge ? toAchievement(badge) : {
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
      ...achievement,
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
            color: #6b6b80;
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
  const badge = getBadge(achievementId);
  if (!badge) return '';

  return `🎉 ${studentName} desbloqueou a conquista "${badge.name}" no MestreMiudo! ${badge.icon}\n\n"${badge.description}"\n\nVê também a minha conquista: ${shareUrl}`;
}

/**
 * Get all available achievements
 */
export function getAllAchievements(): Array<Achievement & { id: string }> {
  return getAllBadges().map((badge) => ({
    id: badge.id,
    ...toAchievement(badge),
    unlockDate: new Date().toISOString(),
  }));
}