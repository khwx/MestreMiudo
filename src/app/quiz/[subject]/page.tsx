
"use client";

import { useSearchParams } from 'next/navigation';
import { Quiz } from '@/components/Quiz';
import { use } from 'react';
import { notFound } from 'next/navigation';

const subjectMap = {
  'portugues': 'Português',
  'matematica': 'Matemática',
  'estudo-do-meio': 'Estudo do Meio',
  'misto': 'Desafio Surpresa',
} as const;

type SubjectSlug = keyof typeof subjectMap;

export default function QuizPage({ params: paramsPromise }: { params: Promise<{ subject: string }> }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  const grade = searchParams.get('grade');
  
  const params = use(paramsPromise);
  
  const subjectSlug = decodeURIComponent(params.subject) as SubjectSlug;
  const subjectTitle = subjectMap[subjectSlug];

  if (!grade) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-destructive text-lg">Erro: Ano de escolaridade não especificado. <br/>Por favor, volta ao início e preenche os teus dados.</p>
      </div>
    );
  }

  if (!subjectTitle) {
      // Instead of a full 404, show a user-friendly error.
      return (
        <div className="flex items-center justify-center h-full text-center">
          <p className="text-destructive text-lg">Erro: Disciplina inválida.</p>
        </div>
      );
  }
  
  // For the AI, we need to pass the specific subject, or 'Misto' for the surprise challenge.
  const quizSubject = subjectSlug === 'misto' ? 'Misto' : subjectTitle;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Quiz
        studentId={name} // Using name as studentId for simplicity
        gradeLevel={parseInt(grade, 10)}
        subject={quizSubject}
        title={subjectTitle}
      />
    </div>
  );
}
