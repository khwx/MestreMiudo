import { describe, it, expect } from 'vitest';
import { generatePdfReport } from '@/lib/pdf-report';

describe('generatePdfReport', () => {
  it('is a function', () => {
    expect(typeof generatePdfReport).toBe('function');
  });

  it('returns a promise', () => {
    const result = generatePdfReport([]);
    expect(result).toBeInstanceOf(Promise);
  });

  it('handles empty student list', async () => {
    await expect(generatePdfReport([])).resolves.toBeUndefined();
  });

  it('handles students with valid data', async () => {
    const students = [
      {
        studentId: '1',
        studentName: 'João',
        totalQuizzes: 10,
        averageScore: 85,
        totalPoints: 500,
        currentStreak: 5,
        lastActivity: '2024-01-15',
      },
      {
        studentId: '2',
        studentName: 'Maria',
        totalQuizzes: 8,
        averageScore: 92,
        totalPoints: 600,
        currentStreak: 3,
        lastActivity: null,
      },
    ];
    await expect(generatePdfReport(students)).resolves.toBeUndefined();
  });
});
