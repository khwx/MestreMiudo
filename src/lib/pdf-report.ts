import { logger } from "./logger";

interface SubjectAverage {
  subject: string;
  average: number;
}

interface DailyScore {
  date: string;
  score: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  lastActivity: string | null;
  subjectAverages?: SubjectAverage[];
  weeklyProgress?: DailyScore[];
}

function reportFilename(): string {
  return `mestremiudo-relatorio-${new Date().toISOString().split('T')[0]}.pdf`;
}

async function buildReportDoc(students: StudentProgress[]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246);
  doc.text('MestreMiudo', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Relatorio de Progresso', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, pageWidth / 2, 38, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 42, pageWidth - 20, 42);

  let y = 52;

  students.forEach((student, index) => {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`${index + 1}. ${student.studentName}`, 20, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const stats = [
      `Quizzes completados: ${student.totalQuizzes}`,
      `Media de acertos: ${student.averageScore}%`,
      `Pontos totais: ${student.totalPoints}`,
      `Dias de streak: ${student.currentStreak}`,
      `Ultima atividade: ${student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('pt-PT') : 'N/A'}`,
    ];

    stats.forEach((stat) => {
      doc.text(`  ${stat}`, 25, y);
      y += 6;
    });

    y += 2;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(25, y, 140, 4, 2, 2, 'F');

    const barColor = student.averageScore >= 80 ? [34, 197, 94] : student.averageScore >= 60 ? [250, 204, 21] : [239, 68, 68];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(25, y, (140 * student.averageScore) / 100, 4, 2, 2, 'F');

    y += 12;

    if (student.subjectAverages && student.subjectAverages.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text('Desempenho por Disciplina:', 20, y);
      y += 7;

      doc.setFontSize(9);
      student.subjectAverages.forEach((sub) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(80, 80, 80);
        doc.text(`${sub.subject}: ${sub.average}%`, 25, y);

        y += 2;
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(25, y, 140, 3, 1.5, 1.5, 'F');

        const subBarColor = sub.average >= 80 ? [34, 197, 94] : sub.average >= 60 ? [250, 204, 21] : [239, 68, 68];
        doc.setFillColor(subBarColor[0], subBarColor[1], subBarColor[2]);
        doc.roundedRect(25, y, (140 * sub.average) / 100, 3, 1.5, 1.5, 'F');

        y += 6;
      });
      y += 4;
    }

    if (student.weeklyProgress && student.weeklyProgress.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text('Evolucao Semanal (ultimos 7 dias):', 20, y);
      y += 7;

      doc.setFontSize(8);
      const maxScore = Math.max(...student.weeklyProgress.map(d => d.score), 1);
      student.weeklyProgress.forEach((day) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        const dayName = new Date(day.date.split('/').reverse().join('-')).toLocaleDateString('pt-PT', { weekday: 'short' });
        doc.setTextColor(80, 80, 80);
        doc.text(`${dayName}: ${day.score}%`, 25, y);

        y += 1.5;
        doc.setFillColor(230, 230, 230);
        const barWidth = (140 * day.score) / maxScore;
        doc.roundedRect(25, y, 140, 2.5, 1, 1, 'F');

        const dayBarColor = day.score >= 80 ? [34, 197, 94] : day.score >= 60 ? [250, 204, 21] : day.score > 0 ? [239, 68, 68] : [200, 200, 200];
        doc.setFillColor(dayBarColor[0], dayBarColor[1], dayBarColor[2]);
        doc.roundedRect(25, y, Math.max(barWidth, 2), 2.5, 1, 1, 'F');

        y += 5;
      });
      y += 4;
    }
  });

  return doc;
}

export async function generatePdfReport(students: StudentProgress[]): Promise<void> {
  try {
    const doc = await buildReportDoc(students);
    doc.save(reportFilename());
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

export async function generatePdfReportBlob(students: StudentProgress[]): Promise<Blob> {
  const doc = await buildReportDoc(students);
  return doc.output('blob');
}

export function buildReportMailtoLink(students: StudentProgress[], recipient?: string): string {
  const subject = encodeURIComponent('Relatorio de Progresso - MestreMiudo');
  const lines = ['Relatorio de progresso do MestreMiudo:', ''];
  students.forEach((student, index) => {
    lines.push(`${index + 1}. ${student.studentName}`);
    lines.push(
      `   Quizzes: ${student.totalQuizzes} | Media: ${student.averageScore}% | Pontos: ${student.totalPoints} | Streak: ${student.currentStreak} dias`
    );
    lines.push(
      `   Ultima atividade: ${student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('pt-PT') : 'N/A'}`
    );
    lines.push('');
  });
  const body = encodeURIComponent(lines.join('\n'));
  const to = recipient ? encodeURIComponent(recipient) : '';
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export type ShareResult = 'shared' | 'downloaded' | 'mailto';

export async function sharePdfReport(students: StudentProgress[], recipient?: string): Promise<ShareResult> {
  const blob = await generatePdfReportBlob(students);
  const filename = reportFilename();
  const file = new File([blob], filename, { type: 'application/pdf' });
  const shareData = {
    title: 'Relatorio de Progresso - MestreMiudo',
    text: 'Relatorio de progresso do MestreMiudo em anexo.',
    files: [file],
  };

  if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    await navigator.share(shareData);
    return 'shared';
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({ title: shareData.title, text: shareData.text });
    return 'shared';
  }

  if (typeof window !== 'undefined') {
    window.location.href = buildReportMailtoLink(students, recipient);
  }

  return 'mailto';
}

export type { StudentProgress };
