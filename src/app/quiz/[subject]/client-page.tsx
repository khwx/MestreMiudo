"use client";

import { Quiz } from '@/components/Quiz';
import type { QuizChallenge } from '@/lib/challenge-share';

type QuizClientPageProps = {
  studentId: string;
  gradeLevel: number;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';
  title: string;
  challenge?: QuizChallenge | null;
  freePractice?: boolean;
};

export default function QuizClientPage({ studentId, gradeLevel, subject, title, challenge = null, freePractice = false }: QuizClientPageProps) {
  return (
      <Quiz
        studentId={studentId}
        gradeLevel={gradeLevel}
        subject={subject}
        title={title}
        challenge={challenge}
        freePractice={freePractice}
      />
  );
}
