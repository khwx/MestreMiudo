import { describe, it, expect } from 'vitest';
import { curriculum, getTopicsByDisciplineAndYear, getAllTopicsForYear, getThemeForSubject } from '@/lib/curriculum';

describe('curriculum', () => {
  it('has Portuguese curriculum for grade 1', () => {
    const grade1 = curriculum['português']?.[1];
    expect(grade1).toBeDefined();
    expect(grade1.tema).toBe('Iniciação à Literacia');
    expect(grade1.topicos).toBeInstanceOf(Array);
    expect(grade1.topicos.length).toBeGreaterThan(0);
  });

  it('has Portuguese curriculum for grade 2', () => {
    const grade2 = curriculum['português']?.[2];
    expect(grade2).toBeDefined();
    expect(grade2.topicos).toBeInstanceOf(Array);
  });

  it('has Portuguese curriculum for grade 3', () => {
    const grade3 = curriculum['português']?.[3];
    expect(grade3).toBeDefined();
    expect(grade3.topicos).toBeInstanceOf(Array);
  });

  it('has Portuguese curriculum for grade 4', () => {
    const grade4 = curriculum['português']?.[4];
    expect(grade4).toBeDefined();
    expect(grade4.topicos).toBeInstanceOf(Array);
  });

  it('has Mathematics curriculum for grade 1', () => {
    const grade1 = curriculum['matemática']?.[1];
    expect(grade1).toBeDefined();
    expect(grade1.topicos).toBeInstanceOf(Array);
  });

  it('has Mathematics curriculum for grade 2', () => {
    const grade2 = curriculum['matemática']?.[2];
    expect(grade2).toBeDefined();
  });

  it('has Mathematics curriculum for grade 3', () => {
    const grade3 = curriculum['matemática']?.[3];
    expect(grade3).toBeDefined();
  });

  it('has Mathematics curriculum for grade 4', () => {
    const grade4 = curriculum['matemática']?.[4];
    expect(grade4).toBeDefined();
  });

  it('has Estudo do Meio curriculum for grade 1', () => {
    const grade1 = curriculum['estudo do meio']?.[1];
    expect(grade1).toBeDefined();
    expect(grade1.topicos).toBeInstanceOf(Array);
  });

  it('has Estudo do Meio curriculum for grade 2', () => {
    const grade2 = curriculum['estudo do meio']?.[2];
    expect(grade2).toBeDefined();
  });

  it('has Estudo do Meio curriculum for grade 3', () => {
    const grade3 = curriculum['estudo do meio']?.[3];
    expect(grade3).toBeDefined();
  });

  it('has Estudo do Meio curriculum for grade 4', () => {
    const grade4 = curriculum['estudo do meio']?.[4];
    expect(grade4).toBeDefined();
  });
});

describe('getTopicsByDisciplineAndYear', () => {
    it('returns topics for Portuguese grade 1', () => {
      const topics = getTopicsByDisciplineAndYear('português', 1);
      expect(topics).toBeInstanceOf(Array);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics).toContain('Rimas e aliterações');
    });

  it('returns topics for Portuguese grade 4', () => {
    const topics = getTopicsByDisciplineAndYear('português', 4);
    expect(topics).toBeInstanceOf(Array);
    expect(topics.length).toBeGreaterThan(0);
  });

  it('returns empty for non-existent grade', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topics = getTopicsByDisciplineAndYear('matemática', 5 as any);
    expect(topics).toEqual([]);
  });

  it('returns topics for all grades for Portuguese', () => {
    for (const grade of [1, 2, 3, 4] as const) {
      const topics = getTopicsByDisciplineAndYear('português', grade);
      expect(topics.length).toBeGreaterThan(0);
    }
  });
});

describe('getAllTopicsForYear', () => {
  it('returns all topics for Portuguese grade 1', () => {
    const topics = getAllTopicsForYear(1);
    expect(topics).toBeInstanceOf(Object);
    expect(topics.português).toBeInstanceOf(Array);
    expect(topics.português.length).toBeGreaterThan(0);
  });
});

describe('getThemeForSubject', () => {
  it('returns theme for Portuguese grade 1', () => {
    const theme = getThemeForSubject('português', 1);
    expect(theme).toBeDefined();
    expect(typeof theme).toBe('string');
  });

  it('returns theme for Portuguese grade 4', () => {
    const theme = getThemeForSubject('português', 4);
    expect(theme).toBeDefined();
  });

    it('returns empty string for non-existent subject', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getThemeForSubject('ciências' as any, 1)).toBe('');
    });

  it('returns different themes for different grades', () => {
    expect(getThemeForSubject('português', 1)).not.toBe(getThemeForSubject('português', 2));
  });
});