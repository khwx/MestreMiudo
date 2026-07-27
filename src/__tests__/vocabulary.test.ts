import { describe, it, expect } from 'vitest';
import type { Subject } from '@/lib/vocabulary';
import {
  getVocabularyForSubject,
  getVocabularyByCategory,
  getVocabularyByDifficulty,
  getCategoriesForSubject,
  getRandomVocabularyPairs,
} from '@/lib/vocabulary';

describe('vocabulary', () => {
  describe('getVocabularyForSubject', () => {
    it('returns words for português', () => {
      const words = getVocabularyForSubject('português');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.word).toBeTruthy());
    });

    it('returns words for matemática', () => {
      const words = getVocabularyForSubject('matemática');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.word).toBeTruthy());
    });

    it('returns words for estudo do meio', () => {
      const words = getVocabularyForSubject('estudo do meio');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.word).toBeTruthy());
    });

    it('returns empty array for unknown subject', () => {
      const words = getVocabularyForSubject('física' as Subject);
      expect(words).toEqual([]);
    });
  });

  describe('getVocabularyByCategory', () => {
    it('filters words by category for português', () => {
      const words = getVocabularyByCategory('português', 'Animais');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.category).toBe('Animais'));
    });

    it('filters words by category for matemática', () => {
      const words = getVocabularyByCategory('matemática', 'Formas');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.category).toBe('Formas'));
    });

    it('returns empty array for non-existent category', () => {
      const words = getVocabularyByCategory('português', 'Inexistente');
      expect(words).toEqual([]);
    });
  });

  describe('getVocabularyByDifficulty', () => {
    it('filters words by easy difficulty', () => {
      const words = getVocabularyByDifficulty('português', 'easy');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.difficulty).toBe('easy'));
    });

    it('filters words by normal difficulty', () => {
      const words = getVocabularyByDifficulty('matemática', 'normal');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.difficulty).toBe('normal'));
    });

    it('filters words by hard difficulty', () => {
      const words = getVocabularyByDifficulty('estudo do meio', 'hard');
      expect(words.length).toBeGreaterThan(0);
      words.forEach((w) => expect(w.difficulty).toBe('hard'));
    });
  });

  describe('getCategoriesForSubject', () => {
    it('returns unique categories for português', () => {
      const categories = getCategoriesForSubject('português');
      expect(categories.length).toBeGreaterThan(0);
      expect(new Set(categories).size).toBe(categories.length); // unique
      expect(categories).toContain('Animais');
    });

    it('returns unique categories for matemática', () => {
      const categories = getCategoriesForSubject('matemática');
      expect(categories.length).toBeGreaterThan(0);
      expect(new Set(categories).size).toBe(categories.length);
      expect(categories).toContain('Formas');
    });

    it('returns unique categories for estudo do meio', () => {
      const categories = getCategoriesForSubject('estudo do meio');
      expect(categories.length).toBeGreaterThan(0);
      expect(new Set(categories).size).toBe(categories.length);
      expect(categories).toContain('Natureza');
    });
  });

  describe('getRandomVocabularyPairs', () => {
    it('returns requested count or less', () => {
      const words = getRandomVocabularyPairs('português', 5);
      expect(words.length).toBeLessThanOrEqual(5);
    });

    it('returns unique words', () => {
      const words = getRandomVocabularyPairs('português', 20);
      const wordTexts = words.map((w) => w.word);
      expect(new Set(wordTexts).size).toBe(wordTexts.length);
    });

    it('returns words from correct subject', () => {
      const words = getRandomVocabularyPairs('matemática', 10);
      words.forEach((w) => {
        const allMathWords = getVocabularyForSubject('matemática').map((x) => x.word);
        expect(allMathWords).toContain(w.word);
      });
    });

    it('does not exceed available words', () => {
      const allWords = getVocabularyForSubject('português');
      const words = getRandomVocabularyPairs('português', allWords.length + 10);
      expect(words.length).toBeLessThanOrEqual(allWords.length);
    });
  });

  describe('vocabulary structure', () => {
    const subjects: Subject[] = ['português', 'matemática', 'estudo do meio'];

    it('all words have required fields', () => {
      subjects.forEach((subject) => {
        const words = getVocabularyForSubject(subject);
        words.forEach((w) => {
          expect(w.word).toBeTruthy();
          expect(w.category).toBeTruthy();
          expect(['easy', 'normal', 'hard']).toContain(w.difficulty);
        });
      });
    });

    it('has sufficient words for games (>= 8 per subject)', () => {
      subjects.forEach((subject) => {
        const words = getVocabularyForSubject(subject);
        expect(words.length).toBeGreaterThanOrEqual(8);
      });
    });
  });
});