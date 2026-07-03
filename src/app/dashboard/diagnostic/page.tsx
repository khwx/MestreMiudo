"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DiagnosticTest } from '@/components/DiagnosticTest';
import { logger } from '@/lib/logger';

interface DiagnosticResult {
  score: number;
  percentage: number;
  learningLevel: 'advanced' | 'proficient' | 'developing' | 'beginning';
  recommendations: string[];
  subjectScores: Record<string, { correct: number; total: number }>;
}

export default function DiagnosticPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';

  const gradeLevel = parseInt(grade, 10) as 1 | 2 | 3 | 4;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  const handleComplete = useCallback(async (result: DiagnosticResult) => {
    setCompleted(true);
    try {
      logger.log('[DIAGNOSTIC] Resultados guardados:', { name, gradeLevel, result });
    } catch (err) {
      logger.error('[DIAGNOSTIC] Erro ao guardar resultados:', err);
    }
  }, [name, gradeLevel]);

  const handleBack = useCallback(() => {
    setStarted(false);
    setCompleted(false);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-2xl mx-auto">
      {!started ? (
        <div className="space-y-8 animate-in fade-in-50">
          <div className="text-center space-y-4 py-4">
            <ClipboardCheck className="h-20 w-20 text-primary mx-auto" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Diagnostico
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Vamos descobrir o teu nivel de aprendizagem! Responde a algumas perguntas para sabermos por onde comecar.
            </p>
          </div>

          <div className="card-kid border-4 border-primary/30 shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">Como funciona?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span className="text-gray-700 dark:text-gray-300">Responde a 10 perguntas de diferentes materias</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span className="text-gray-700 dark:text-gray-300">Nao ha tempo limite, respira fundo e pensa bem</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span className="text-gray-700 dark:text-gray-300">Recebe o teu nivel e recomendacoes personalizadas</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href={`/dashboard?name=${name}&grade=${grade}`} className="flex-1">
              <Button variant="outline" className="w-full h-12 text-lg font-bold border-2">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
            </Link>
            <Button onClick={handleStart} className="flex-1 h-12 text-lg font-bold">
              Comecar Diagnostico
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard?name=${name}&grade=${grade}`}>
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-200">Diagnostico - {name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nivel {gradeLevel}</p>
            </div>
          </div>

          <DiagnosticTest
            studentName={name}
            gradeLevel={gradeLevel}
            onComplete={handleComplete}
            onBack={handleBack}
          />

          {completed && (
            <div className="text-center pt-4">
              <Link href={`/dashboard?name=${name}&grade=${grade}`}>
                <Button className="h-12 text-lg font-bold">
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
