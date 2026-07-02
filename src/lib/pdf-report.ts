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

export async function generatePdfReport(students: StudentProgress[]): Promise<void> {
  try {
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

    doc.save(`mestremiudo-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
