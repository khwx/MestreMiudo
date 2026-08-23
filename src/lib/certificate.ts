/**
 * @fileOverview Gerador de diplomas/certificados de conclusão de quiz.
 * Produz HTML autocontido e partilhável (imprimível / guardável em PDF) que
 * pode ser aberto numa nova janela a partir do ecrã de resultados do quiz.
 */

export interface CertificateData {
  studentName: string;
  subject: string;
  grade: number;
  score: number;
  total: number;
  stars: number;
  date?: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  Português: 'Português',
  Matemática: 'Matemática',
  'Estudo do Meio': 'Estudo do Meio',
  Misto: 'Misto',
};

export function subjectLabel(subject: string): string {
  return SUBJECT_LABELS[subject] ?? subject;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateCertificateHTML(data: CertificateData): string {
  const name = escapeHtml(data.studentName?.trim() || 'Aluno/a');
  const subject = escapeHtml(subjectLabel(data.subject));
  const dateText = data.date ?? new Date().toLocaleDateString('pt-PT');
  const percentage =
    data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
  const filledStars = '★'.repeat(Math.max(0, Math.min(3, data.stars)));
  const emptyStars = '☆'.repeat(Math.max(0, 3 - Math.max(0, Math.min(3, data.stars))));
  const stars = escapeHtml(filledStars + emptyStars);

  return `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diploma MestreMiúdo - ${name}</title>
    <style>
      @page { margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
        background: #e3f2fd;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .diploma {
        background: #ffffff;
        border: 8px solid #64b5f6;
        border-radius: 28px;
        padding: 48px 40px;
        max-width: 640px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        position: relative;
      }
      .diploma::before {
        content: "";
        position: absolute;
        inset: 14px;
        border: 2px dashed #ffeb3b;
        border-radius: 20px;
        pointer-events: none;
      }
      .brand { font-size: 16px; letter-spacing: 2px; color: #64b5f6; font-weight: 700; }
      .title { font-size: 38px; font-weight: 900; color: #1f2937; margin: 12px 0 4px; }
      .subtitle { font-size: 18px; color: #6b7280; margin-bottom: 24px; }
      .student { font-size: 32px; font-weight: 800; color: #2563eb; margin: 16px 0; }
      .stars { font-size: 44px; color: #f59e0b; letter-spacing: 6px; margin: 12px 0; }
      .detail {
        display: flex; justify-content: space-between; gap: 12px;
        max-width: 440px; margin: 18px auto; font-size: 18px; color: #374151;
      }
      .detail span:first-child { font-weight: 600; color: #6b7280; }
      .footer { margin-top: 28px; font-size: 14px; color: #9ca3af; }
    </style>
  </head>
  <body>
    <div class="diploma">
      <div class="brand">MestreMiúdo 🎓</div>
      <div class="title">Diploma de Conquista</div>
      <div class="subtitle">"Vamos aprender a brincar!"</div>
      <div class="student">${name}</div>
      <div class="stars">${stars}</div>
      <div class="detail"><span>Disciplina</span><span>${subject}</span></div>
      <div class="detail"><span>Ano / Grau</span><span>${data.grade}º ano</span></div>
      <div class="detail"><span>Pontuação</span><span>${data.score} em ${data.total} (${percentage}%)</span></div>
      <div class="footer">Concluído em ${escapeHtml(dateText)} • Gerado por MestreMiúdo</div>
    </div>
  </body>
</html>`;
}

export function buildCertificateShareText(data: CertificateData): string {
  const name = data.studentName?.trim() || 'O meu filho/a';
  const subject = subjectLabel(data.subject);
  const percentage =
    data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
  return `${name} conquistou um diploma no MestreMiúdo! 🏅\n${subject} • ${data.grade}º ano • ${percentage}% (${data.score}/${data.total})`;
}

export function openCertificate(data: CertificateData): boolean {
  if (typeof window === 'undefined') return false;
  const html = generateCertificateHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) return false;
  win.opener = null;
  return true;
}
