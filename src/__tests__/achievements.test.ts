import { describe, it, expect } from 'vitest';
import {
  checkAchievementUnlock,
  generateShareableAchievementCard,
  generateAchievementHTML,
} from '@/lib/achievements';

describe('achievements', () => {
  describe('checkAchievementUnlock', () => {
    it('returns empty array for new student', async () => {
      const result = await checkAchievementUnlock(0, 0, 0, 0, false, 0);
      expect(result).toEqual([]);
    });

    it('unlocks first_quiz on first quiz', async () => {
      const result = await checkAchievementUnlock(1, 0, 0, 0, false, 0);
      expect(result).toContain('first_quiz');
    });

    it('unlocks five_quizzes at 5 quizzes', async () => {
      const result = await checkAchievementUnlock(5, 0, 0, 0, false, 0);
      expect(result).toContain('five_quizzes');
    });

    it('unlocks ten_quizzes at 10 quizzes', async () => {
      const result = await checkAchievementUnlock(10, 0, 0, 0, false, 0);
      expect(result).toContain('ten_quizzes');
    });

    it('unlocks fifty_quizzes at 50 quizzes', async () => {
      const result = await checkAchievementUnlock(50, 0, 0, 0, false, 0);
      expect(result).toContain('fifty_quizzes');
    });

    it('unlocks perfect_score for 100%', async () => {
      const result = await checkAchievementUnlock(1, 1, 0, 100, false, 0);
      expect(result).toContain('perfect_score');
    });

    it('unlocks week_streak at 7 days', async () => {
      const result = await checkAchievementUnlock(10, 0, 7, 50, false, 0);
      expect(result).toContain('week_streak');
    });

    it('unlocks month_streak at 30 days', async () => {
      const result = await checkAchievementUnlock(30, 0, 30, 50, false, 0);
      expect(result).toContain('month_streak');
    });

    it('unlocks best_in_class for top ranker', async () => {
      const result = await checkAchievementUnlock(10, 0, 0, 80, true, 0);
      expect(result).toContain('best_in_class');
    });

    it('unlocks all_subjects_master for 90%+ in all', async () => {
      const result = await checkAchievementUnlock(30, 0, 0, 90, false, 0, {
        portugueseAverage: 90,
        mathAverage: 90,
        estudoAverage: 90,
      });
      expect(result).toContain('all_subjects_master');
    });

    it('unlocks daily_challenge_master at 30 completed', async () => {
      const result = await checkAchievementUnlock(40, 0, 0, 50, false, 30);
      expect(result).toContain('daily_challenge_master');
    });

    it('unlocks daily_7 at 7 completed', async () => {
      const result = await checkAchievementUnlock(10, 0, 0, 50, false, 7);
      expect(result).toContain('daily_7');
    });

    it('unlocks speed_demon for quiz < 120s', async () => {
      const result = await checkAchievementUnlock(1, 0, 0, 80, false, 0, {
        quizDurationSeconds: 60,
      });
      expect(result).toContain('speed_demon');
    });

    it('unlocks night_owl for completion after 20h', async () => {
      const result = await checkAchievementUnlock(1, 0, 0, 80, false, 0, {
        completionHour: 22,
      });
      expect(result).toContain('night_owl');
    });

    it('unlocks early_bird for completion before 8h', async () => {
      const result = await checkAchievementUnlock(1, 0, 0, 80, false, 0, {
        completionHour: 6,
      });
      expect(result).toContain('early_bird');
    });

    it('unlocks quiz_marathon for 3+ quizzes today', async () => {
      const result = await checkAchievementUnlock(5, 0, 0, 80, false, 0, {
        quizzesToday: 3,
      });
      expect(result).toContain('quiz_marathon');
    });

    it('unlocks subject mastery achievements', async () => {
      const result = await checkAchievementUnlock(10, 0, 0, 90, false, 0, {
        portugueseAverage: 95,
        mathAverage: 70,
        estudoAverage: 60,
      });
      expect(result).toContain('subject_master_portugues');
      expect(result).not.toContain('subject_master_matematica');
    });

    it('unlocks streak_14 and streak_30', async () => {
      const result14 = await checkAchievementUnlock(20, 0, 14, 50, false, 0);
      expect(result14).toContain('streak_14');

      const result30 = await checkAchievementUnlock(40, 0, 30, 50, false, 0);
      expect(result30).toContain('streak_30');
    });

    it('unlocks daily challenge milestones', async () => {
      const result7 = await checkAchievementUnlock(10, 0, 0, 50, false, 7);
      expect(result7).toContain('daily_7');

      const result14 = await checkAchievementUnlock(20, 0, 0, 50, false, 14);
      expect(result14).toContain('daily_14');
    });

    it('unlocks subject pro achievements at 50 quizzes', async () => {
      const result = await checkAchievementUnlock(60, 0, 0, 80, false, 0, {
        portugueseQuizzes: 50,
        portugueseAverage: 85,
        mathQuizzes: 40,
        mathAverage: 85,
      });
      expect(result).toContain('portugues_pro');
      expect(result).not.toContain('matematica_pro');
    });

    it('unlocks legendary at 100 quizzes', async () => {
      const result = await checkAchievementUnlock(100, 0, 0, 50, false, 0);
      expect(result).toContain('legendary');
    });

    it('unlocks lesson achievements', async () => {
      const result1 = await checkAchievementUnlock(10, 0, 0, 50, false, 0, {
        lessonsCompleted: 1,
      });
      expect(result1).toContain('first_lesson');

      const result10 = await checkAchievementUnlock(10, 0, 0, 50, false, 0, {
        lessonsCompleted: 10,
      });
      expect(result10).toContain('ten_lessons');
    });

    it('unlocks story achievements', async () => {
      const result = await checkAchievementUnlock(10, 0, 0, 50, false, 0, {
        storiesCreated: 5,
      });
      expect(result).toContain('story_lover');
    });
  });

  describe('generateShareableAchievementCard', () => {
    it('creates card for known achievement', () => {
      const card = generateShareableAchievementCard('João', 'first_quiz', '2024-01-15');
      expect(card.achievementId).toBe('first_quiz');
      expect(card.studentName).toBe('João');
      expect(card.achievement.title).toBe('Primeiro Passo');
      expect(card.shareUrl).toContain('mestremiudo.com/achievements/');
      expect(card.imageUrl).toContain('/image.png');
    });

    it('creates fallback card for unknown achievement', () => {
      const card = generateShareableAchievementCard('Maria', 'unknown_achievement', '2024-01-15');
      expect(card.achievementId).toBe('unknown_achievement');
      expect(card.achievement.title).toBe('Conquista Desbloqueada');
      expect(card.achievement.icon).toBe('⭐');
    });
  });

  describe('generateAchievementHTML', () => {
    it('generates valid HTML string', () => {
      const card = generateShareableAchievementCard('João', 'first_quiz', '2024-01-15');
      const html = generateAchievementHTML(card);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('Primeiro Passo');
      expect(html).toContain('João');
      expect(html).toContain('🚀');
    });

    it('includes achievement description', () => {
      const card = generateShareableAchievementCard('Ana', 'perfect_score', '2024-01-15');
      const html = generateAchievementHTML(card);
      expect(html).toContain('Acertou um quiz com 100%');
    });
  });
});