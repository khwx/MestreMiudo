import { logger } from "./logger";

interface StudentProgress {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  lastActivity: string | null;
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
    if (y > 250) {
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

    y += 14;
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
