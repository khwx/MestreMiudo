'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, Users, BookOpen, Trophy, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import jsPDF from 'jspdf';

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

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246);
      doc.text('MestreMiudo', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Relatorio de Progresso', pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, pageWidth / 2, 38, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(20, 42, pageWidth - 20, 42);

      let y = 52;

      students.forEach((student, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text(`${index + 1}. ${student.studentName}`, 20, y);

        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        const stats = [
          `Quizzes completados: ${student.totalQuizzes}`,
          `Media de acertos: ${student.averageScore}%`,
          `Pontos totais: ${student.totalPoints}`,
          `Dias de streak: ${student.currentStreak}`,
          `Ultima atividade: ${student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('pt-PT') : 'N/A'}`,
        ];

        stats.forEach((stat) => {
          doc.text(`  ${stat}`, 25, y);
          y += 6;
        });

        // Performance bar
        y += 2;
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(25, y, 140, 4, 2, 2, 'F');

        const barColor = student.averageScore >= 80 ? [34, 197, 94] : student.averageScore >= 60 ? [250, 204, 21] : [239, 68, 68];
        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        doc.roundedRect(25, y, (140 * student.averageScore) / 100, 4, 2, 2, 'F');

        y += 14;
      });

      doc.save(`mestremiudo-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!accessCode) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="card-kid border-4 border-red-300 bg-white dark:bg-gray-800 shadow-2xl max-w-lg">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-3xl font-black text-red-600">Acesso Restrito</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Usa o código de acesso fornecido pelo professor/encarregado.
            </p>
            <Button onClick={() => window.history.back()} variant="outline" className="btn-kid border-2 border-gray-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <div className="text-6xl animate-bounce">👨‍👩‍👧‍👦</div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Painel de Encarregados
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Monitoriza o progresso dos seus educandos 📊
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card-kid border-4 border-gray-300 bg-white dark:bg-gray-800 shadow-2xl max-w-lg mx-auto">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">😕</div>
              <p className="text-xl text-gray-600 dark:text-gray-300">
               Código de acesso inválido ou sem alunos associados.
             </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map(student => (
              <div
                key={student.studentId}
                className="card-kid border-4 border-teal-300 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6 space-y-4">
                  {/* Student Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-teal-100 to-blue-100">
                        <Users className="h-6 w-6 text-teal-600" />
                      </div>
                       <h3 className="text-2xl font-black text-gray-800 dark:text-gray-200">{student.studentName}</h3>
                    </div>
                    {student.averageScore >= 80 && (
                      <div className="text-3xl">🌟</div>
                    )}
                  </div>

                  {/* Last Activity */}
                   <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Última atividade: {student.lastActivity
                        ? new Date(student.lastActivity).toLocaleDateString('pt-PT')
                        : 'N/A'}
                    </span>
                  </div>

                  {/* Score Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Média de acertos</span>
                      <span className="text-lg font-black text-teal-600">{student.averageScore}%</span>
                    </div>
                    <div className="progress-kid">
                      <div
                        className={`progress-kid-bar ${
                          student.averageScore >= 80
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : student.averageScore >= 60
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            : 'bg-gradient-to-r from-red-400 to-rose-500'
                        }`}
                        style={{ width: `${student.averageScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-3 text-center border-2 border-yellow-200">
                      <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                      <p className="text-xl font-black text-yellow-700">{student.totalPoints}</p>
                      <p className="text-xs font-semibold text-yellow-600">Pontos</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 text-center border-2 border-blue-200">
                      <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xl font-black text-blue-700">{student.totalQuizzes}</p>
                      <p className="text-xs font-semibold text-blue-600">Quizzes</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 text-center border-2 border-orange-200">
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                      <p className="text-xl font-black text-orange-700">{student.currentStreak}</p>
                      <p className="text-xs font-semibold text-orange-600">Dias</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Export Button */}
          <div className="text-center pt-4">
            <Button
              onClick={generatePdfReport}
              className="btn-kid bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xl h-14"
              size="lg"
            >
              {generatingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              Exportar Relatório 📄
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
