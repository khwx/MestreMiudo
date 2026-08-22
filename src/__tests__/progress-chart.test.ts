import { describe, it, expect } from 'vitest';
import {
  normalizeSubjectName,
  getDateKeys,
  buildSubjectTimeSeries,
  getSeriesSubjects,
  type SubjectSeriesPoint,
} from '@/lib/progress-chart';

describe('normalizeSubjectName', () => {
  it('normalizes known aliases', () => {
    expect(normalizeSubjectName('portugues')).toBe('Português');
    expect(normalizeSubjectName('Matemática')).toBe('Matemática');
    expect(normalizeSubjectName('estudo do meio')).toBe('Estudo do Meio');
  });

  it('returns Geral for empty values', () => {
    expect(normalizeSubjectName(null)).toBe('Geral');
    expect(normalizeSubjectName(undefined)).toBe('Geral');
    expect(normalizeSubjectName('  ')).toBe('Geral');
  });

  it('keeps unknown subjects trimmed', () => {
    expect(normalizeSubjectName(' História ')).toBe('História');
  });
});

describe('getDateKeys', () => {
  it('returns the requested number of days ending today', () => {
    const now = new Date('2026-08-22T12:00:00Z');
    const keys = getDateKeys(7, now);
    expect(keys).toHaveLength(7);
    expect(keys[6].iso).toBe('2026-08-22');
    expect(keys[0].iso).toBe('2026-08-16');
  });

  it('produces unique iso dates', () => {
    const keys = getDateKeys(7, new Date('2026-08-22T12:00:00Z'));
    const isos = keys.map((k) => k.iso);
    expect(new Set(isos).size).toBe(isos.length);
  });
});

describe('buildSubjectTimeSeries', () => {
  const now = new Date('2026-08-22T12:00:00Z');

  it('returns empty subjects when no rows', () => {
    const data = buildSubjectTimeSeries([], { now });
    expect(getSeriesSubjects(data)).toHaveLength(0);
    expect(data).toHaveLength(7);
  });

  it('computes daily percentage per subject', () => {
    const rows = [
      { subject: 'Português', score: 8, totalQuestions: 10, createdAt: '2026-08-22T10:00:00Z' },
      { subject: 'portugues', score: 2, totalQuestions: 10, createdAt: '2026-08-22T11:00:00Z' },
      { subject: 'Matemática', score: 5, totalQuestions: 5, createdAt: '2026-08-22T09:00:00Z' },
    ];
    const data = buildSubjectTimeSeries(rows, { now });
    const last = data[data.length - 1];
    expect(last['Português']).toBe(50);
    expect(last['Matemática']).toBe(100);
  });

  it('uses provided subjects for stable series even with no data', () => {
    const data = buildSubjectTimeSeries([], { subjects: ['Português', 'Matemática'], now });
    const subjects = getSeriesSubjects(data);
    expect(subjects).toEqual(['Português', 'Matemática']);
    data.forEach((d) => {
      expect(d['Português']).toBeNull();
      expect(d['Matemática']).toBeNull();
    });
  });

  it('puts zero-score days as 0 not null', () => {
    const rows = [
      { subject: 'Português', score: 0, totalQuestions: 10, createdAt: '2026-08-21T10:00:00Z' },
    ];
    const data = buildSubjectTimeSeries(rows, { now });
    const point = data.find((d) => (d['Português'] as number) !== null);
    expect(point!['Português']).toBe(0);
  });

  it('ignores rows outside the window', () => {
    const rows = [
      { subject: 'Português', score: 9, totalQuestions: 10, createdAt: '2026-08-01T10:00:00Z' },
    ];
    const data = buildSubjectTimeSeries(rows, { now });
    expect(getSeriesSubjects(data)).toHaveLength(0);
  });

  it('honors a custom number of days', () => {
    const data = buildSubjectTimeSeries([], { days: 14, now });
    expect(data).toHaveLength(14);
    expect(data[0].date).toBe(new Date('2026-08-09T12:00:00Z').toLocaleDateString('pt-PT'));
  });
});

describe('getSeriesSubjects', () => {
  it('excludes the date key', () => {
    const point = { date: 'x', Português: 10, Matemática: null } as unknown as SubjectSeriesPoint;
    expect(getSeriesSubjects([point])).toEqual(['Português', 'Matemática']);
  });

  it('returns empty for empty array', () => {
    expect(getSeriesSubjects([])).toEqual([]);
  });
});
