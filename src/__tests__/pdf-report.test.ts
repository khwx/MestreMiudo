import { describe, it, expect } from 'vitest';
import { generatePdfReport, generatePdfReportBlob, buildReportMailtoLink } from '@/lib/pdf-report';

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

  it('generates a PDF blob', async () => {
    const blob = await generatePdfReportBlob([]);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('builds a mailto link with subject and body', () => {
    const link = buildReportMailtoLink(
      [
        {
          studentId: '1',
          studentName: 'João',
          totalQuizzes: 10,
          averageScore: 85,
          totalPoints: 500,
          currentStreak: 5,
          lastActivity: '2024-01-15',
        },
      ],
      'pai@exemplo.pt'
    );
    expect(link.startsWith('mailto:pai%40exemplo.pt?')).toBe(true);
    expect(link).toContain('subject=');
    expect(link).toContain('body=');
    expect(decodeURIComponent(link)).toContain('João');
  });

  it('builds a mailto link without recipient', () => {
    const link = buildReportMailtoLink([]);
    expect(link.startsWith('mailto:?')).toBe(true);
  });
});
