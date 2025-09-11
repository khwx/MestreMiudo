
"use client";

import { Quiz } from '@/components/Quiz';

type QuizClientPageProps = {
  studentId: string;
  gradeLevel: number;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';
  title: string;
};

export default function QuizClientPage({ studentId, gradeLevel, subject, title }: QuizClientPageProps) {
  return (
      <Quiz
        studentId={studentId}
        gradeLevel={gradeLevel}
        subject={subject}
        title={title}
      />
  );
}
