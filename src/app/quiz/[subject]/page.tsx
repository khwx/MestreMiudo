"use client";

import { useSearchParams } from 'next/navigation';
import { Quiz } from '@/components/Quiz';
import { use } from 'react';

export default function QuizPage({ params: paramsPromise }: { params: Promise<{ subject: string }> }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  const grade = searchParams.get('grade');
  
  const params = use(paramsPromise);
  
  // Capitalize subject from URL for display and API call
  const subjectParam = decodeURIComponent(params.subject);
  const subjectTitle = subjectParam.charAt(0).toUpperCase() + subjectParam.slice(1);

  if (!grade) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-destructive text-lg">Erro: Ano de escolaridade não especificado. <br/>Por favor, volta ao início e preenche os teus dados.</p>
      </div>
    );
  }

  const validSubjects = ['Português', 'Matemática', 'Estudo do Meio'];
  if (!validSubjects.includes(subjectTitle)) {
      return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-destructive text-lg">Erro: Disciplina inválida.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Quiz
        studentId={name} // Using name as studentId for simplicity
        gradeLevel={parseInt(grade, 10)}
        subject={subjectTitle as 'Português' | 'Matemática' | 'Estudo do Meio'}
      />
    </div>
  );
}
