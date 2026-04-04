
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import QuizClientPage from './client-page';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const subjectMap = {
  'portugues': 'Português',
  'matematica': 'Matemática',
  'estudo-do-meio': 'Estudo do Meio',
  'misto': 'Desafio Surpresa',
} as const;

type SubjectSlug = keyof typeof subjectMap;

export default async function QuizPage({ params, searchParams }: { params: Promise<{ subject: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const subjectSlug = decodeURIComponent(resolvedParams.subject) as SubjectSlug;
  const subjectTitle = subjectMap[subjectSlug];

  const name = resolvedSearchParams?.name as string || 'Jogador';
  const grade = resolvedSearchParams?.grade as string;

  if (!subjectTitle) {
    notFound();
  }

  if (!grade) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-destructive text-lg">Erro: Ano de escolaridade não especificado. <br/>Por favor, volta ao início e preenche os teus dados.</p>
      </div>
    );
  }
  
  const quizSubject = (subjectSlug === 'misto' ? 'Misto' : subjectTitle) as 'Português' | 'Matemática' | 'Estudo do Meio' | 'Misto';

  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    }>
       <div className="w-full max-w-4xl mx-auto">
         <QuizClientPage
            studentId={name}
            gradeLevel={parseInt(grade, 10)}
            subject={quizSubject}
            title={subjectTitle}
        />
       </div>
    </Suspense>
  );
}
