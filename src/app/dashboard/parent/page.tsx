'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, Users, BookOpen, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface StudentProgress {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  lastActivity: string | null;
}

export default function ParentDashboardPage() {
  const searchParams = useSearchParams();
  const accessCode = searchParams.get('code');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      if (!accessCode || !isSupabaseConfigured() || !supabase) return;
      setLoading(true);

      try {
        const { data: access } = await supabase
          .from('parent_dashboard_access')
          .select('allowed_students')
          .eq('access_code', accessCode)
          .single();

        if (!access?.allowed_students?.length) {
          setLoading(false);
          return;
        }

        const studentIds = access.allowed_students;
        const { data: rewards } = await supabase
          .from('student_rewards')
          .select('student_id, total_points, day_streak, last_quiz_date')
          .in('student_id', studentIds);

        const { data: quizData } = await supabase
          .from('quiz_history')
          .select('student_id, score, total_questions')
          .in('student_id', studentIds);

        const progressMap = new Map<string, StudentProgress>();
        studentIds.forEach(id => {
          progressMap.set(id, {
            studentId: id,
            studentName: id,
            totalQuizzes: 0,
            averageScore: 0,
            totalPoints: 0,
            currentStreak: 0,
            lastActivity: null,
          });
        });

        rewards?.forEach(r => {
          const s = progressMap.get(r.student_id);
          if (s) {
            s.totalPoints = r.total_points || 0;
            s.currentStreak = r.day_streak || 0;
            s.lastActivity = r.last_quiz_date;
          }
        });

        const quizByStudent = new Map<string, { total: number; correct: number }>();
        quizData?.forEach(q => {
          if (!quizByStudent.has(q.student_id)) {
            quizByStudent.set(q.student_id, { total: 0, correct: 0 });
          }
          const stats = quizByStudent.get(q.student_id)!;
          stats.total += q.total_questions;
          stats.correct += q.score;
        });

        quizByStudent.forEach((stats, id) => {
          const s = progressMap.get(id);
          if (s) {
            s.totalQuizzes = stats.total;
            s.averageScore = stats.total > 0 
              ? Math.round((stats.correct / stats.total) * 100) 
              : 0;
          }
        });

        setStudents(Array.from(progressMap.values()));
      } catch (error) {
        console.error('Error loading parent dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [accessCode]);

  const generatePdfReport = async () => {
    setGeneratingPdf(true);
    
    const reportContent = `
MestreMiúdo - Relatório de Progresso
================================
Data: ${new Date().toLocaleDateString('pt-PT')}

${students.map(s => `
${s.studentName}
- Quizzes completados: ${s.totalQuizzes}
- Média de acertos: ${s.averageScore}%
- Pontos totais: ${s.totalPoints}
- Dias de streak: ${s.currentStreak}
- Última atividade: ${s.lastActivity ? new Date(s.lastActivity).toLocaleDateString('pt-PT') : 'N/A'}
`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mestremiudo-relatorio-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setGeneratingPdf(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!accessCode) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground mt-2">
          Por favor, use o código de acesso fornecido pelo professor/encarregado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Users className="h-10 w-10" />
          Painel de Professores/Encarregados
        </h1>
        <p className="text-muted-foreground">
          Monitorize o progresso dos seus filhos/educandos
        </p>
      </div>

      {students.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Código de acesso inválido ou sem alunos associados.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map(student => (
              <Card key={student.studentId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {student.studentName}
                  </CardTitle>
                  <CardDescription>
                    Última atividade: {student.lastActivity 
                      ? new Date(student.lastActivity).toLocaleDateString('pt-PT')
                      : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Média de acertos</span>
                      <span className="font-bold">{student.averageScore}%</span>
                    </div>
                    <Progress value={student.averageScore} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                      <p className="text-lg font-bold">{student.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">Pontos</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{student.totalQuizzes}</p>
                      <p className="text-xs text-muted-foreground">Quizzes</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{student.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            onClick={generatePdfReport} 
            className="w-full"
            size="lg"
          >
            {generatingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar Relatório
          </Button>
        </>
      )}
    </div>
  );
}