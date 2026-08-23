import { describe, it, expect } from 'vitest';
import {
  generateCertificateHTML,
  buildCertificateShareText,
  subjectLabel,
  type CertificateData,
} from '@/lib/certificate';

const sample: CertificateData = {
  studentName: 'Ana',
  subject: 'Matemática',
  grade: 2,
  score: 4,
  total: 5,
  stars: 2,
};

describe('subjectLabel', () => {
  it('maps known subjects', () => {
    expect(subjectLabel('Português')).toBe('Português');
    expect(subjectLabel('Estudo do Meio')).toBe('Estudo do Meio');
    expect(subjectLabel('Misto')).toBe('Misto');
  });
  it('falls back to the original value for unknown subjects', () => {
    expect(subjectLabel('Ciências')).toBe('Ciências');
  });
});

describe('generateCertificateHTML', () => {
  it('includes the student name and subject', () => {
    const html = generateCertificateHTML(sample);
    expect(html).toContain('Ana');
    expect(html).toContain('Matemática');
    expect(html).toContain('2º ano');
    expect(html).toContain('Diploma de Conquista');
  });

  it('renders the correct percentage', () => {
    const html = generateCertificateHTML(sample);
    expect(html).toContain('80%');
    expect(html).toContain('4 em 5');
  });

  it('renders the star rating', () => {
    const html = generateCertificateHTML({ ...sample, stars: 3 });
    expect(html).toContain('★★★');
  });

  it('escapes HTML in the student name to prevent XSS', () => {
    const html = generateCertificateHTML({ ...sample, studentName: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('uses a fallback name when empty', () => {
    const html = generateCertificateHTML({ ...sample, studentName: '   ' });
    expect(html).toContain('Aluno/a');
  });

  it('handles a zero total safely', () => {
    const html = generateCertificateHTML({ ...sample, score: 0, total: 0 });
    expect(html).toContain('0%');
    expect(html).toContain('0 em 0');
  });
});

describe('buildCertificateShareText', () => {
  it('summarizes the achievement', () => {
    const text = buildCertificateShareText(sample);
    expect(text).toContain('Ana');
    expect(text).toContain('Matemática');
    expect(text).toContain('80%');
  });

  it('falls back to a generic name', () => {
    const text = buildCertificateShareText({ ...sample, studentName: '' });
    expect(text).toContain('O meu filho/a');
  });
});
