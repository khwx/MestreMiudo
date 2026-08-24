import { calculateStars } from '@/lib/lessons/progress';

export interface QuizResultAnnouncementInput {
  score: number;
  total: number;
  subject?: string;
  practiceMode?: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
  Português: 'Português',
  Matemática: 'Matemática',
  'Estudo do Meio': 'Estudo do Meio',
  Misto: 'Misto',
};

function starText(stars: number): string {
  if (stars <= 0) return 'sem estrelas';
  if (stars === 1) return 'uma estrela';
  if (stars === 2) return 'duas estrelas';
  return 'três estrelas';
}

export function buildQuizResultAnnouncement(input: QuizResultAnnouncementInput): string {
  const { score, total, subject, practiceMode = false } = input;
  if (total <= 0) {
    return 'Quiz concluído!';
  }

  const correct = Math.max(0, Math.min(score, total));
  const percentage = Math.round((correct / total) * 100);
  const stars = calculateStars(percentage);
  const subjectLabel = subject ? SUBJECT_LABELS[subject] ?? subject : undefined;

  const prefix = practiceMode ? 'Prática concluída' : 'Quiz concluído';
  const base = `${prefix}! Obtiveste ${correct} de ${total} perguntas corretas, ${percentage}%, com ${starText(stars)}`;

  return subjectLabel ? `${base}, na disciplina de ${subjectLabel}.` : `${base}.`;
}
