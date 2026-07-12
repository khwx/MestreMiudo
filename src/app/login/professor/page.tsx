"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      setIsSubmitting(true);
      router.push(`/dashboard/teacher?teacherName=${encodeURIComponent('Professor')}&classCode=${encodeURIComponent(accessCode.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-600/10 dark:bg-blue-500/10">
            <GraduationCap className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-slate-700 dark:from-blue-400 dark:via-blue-300 dark:to-slate-300 bg-clip-text text-transparent">
            Painel do Professor
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Gestão e acompanhamento da sua turma
          </p>
        </div>

        <div className="bg-card rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xl">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Acesso ao Painel
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Introduza o código de acesso da sua turma
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="accessCode" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Código de Acesso
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Código da turma (ex: TURMA-3A-2025)"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  className="text-lg h-14 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:border-blue-800 dark:focus:border-blue-500 dark:focus:ring-blue-800"
                />
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-14 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> A entrar...</>
                ) : (
                  <><GraduationCap className="mr-3 h-5 w-5" /> Entrar no Painel</>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login de aluno
          </Link>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border-2 border-blue-100 dark:border-gray-700">
          <p>O código de acesso é fornecido pela escola ou pelo administrador da plataforma.</p>
        </div>
      </div>
    </div>
  );
}