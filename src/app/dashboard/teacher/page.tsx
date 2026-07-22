'use client';

import { logger } from "@/lib/logger";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, BookOpen, BarChart3, Loader2, TrendingUp, Trophy, Award, Book, UsersIcon, Star } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generatePdfReport } from '@/lib/pdf-report';

interface StudentProgress {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  lastActivity: string | null;
  recentQuizzes?: { score: number; total: number; date: string }[];
  subjectAverages?: { subject: string; average: number }[];
  recentAchievements?: { title: string; icon: string; date: string }[];
}

interface ClassSummary {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  totalQuizzes: number;
  totalPoints: number;
  averageStreak: number;
}

export default function TeacherDashboardPage() {
  const searchParams = useSearchParams();
  const teacherName = searchParams.get('teacherName') || 'Professor';
  const classCode = searchParams.get('classCode');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [classSummary, setClassSummary] = useState<ClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics' | 'reports'>('overview');

  useEffect(() => {
    async function loadClass() {
      if (!classCode || !isSupabaseConfigured() || !supabase) return;
      setLoading(true);

      try {
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('class_code', classCode)
          .single();

        if (!classData) {
          setError('Turma não encontrada. Verifica o código de acesso.');
          setLoading(false);
          return;
        }

        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classData.id);

        if (!studentsData?.length) {
          setStudents([]);
          setClassSummary({ totalStudents: 0, activeStudents: 0, averageScore: 0, totalQuizzes: 0, totalPoints: 0, averageStreak: 0 });
          setLoading(false);
          return;
        }

        const studentIds = studentsData.map(s => s.id);

        const { data: rewards } = await supabase
          .from('student_rewards')
          .select('student_id, total_points, day_streak, last_quiz_date')
          .in('student_id', studentIds);

        const { data: quizData } = await supabase
          .from('quiz_history')
          .select('student_id, score, total_questions, subject, created_at')
          .in('student_id', studentIds);

        const progressMap = new Map<string, StudentProgress>();
        studentsData.forEach((s: { id: string; name: string }) => {
          progressMap.set(s.id, {
            studentId: s.id,
            studentName: s.name,
            totalQuizzes: 0,
            averageScore: 0,
            totalPoints: 0,
            currentStreak: 0,
            lastActivity: null,
            recentQuizzes: [],
            subjectAverages: [],
            recentAchievements: [],
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

        const quizByStudent = new Map<string, { total: number; correct: number; bySubject: Record<string, { total: number; correct: number }>; dates: string[] }>();
        quizData?.forEach(q => {
          if (!quizByStudent.has(q.student_id)) {
            quizByStudent.set(q.student_id, { total: 0, correct: 0, bySubject: {}, dates: [] });
          }
          const stats = quizByStudent.get(q.student_id)!;
          stats.total += q.total_questions;
          stats.correct += q.score;
          stats.dates.push(q.created_at);
          if (!stats.bySubject[q.subject]) {
            stats.bySubject[q.subject] = { total: 0, correct: 0 };
          }
          stats.bySubject[q.subject].total += q.total_questions;
          stats.bySubject[q.subject].correct += q.score;
        });

        quizByStudent.forEach((stats, studentId) => {
          const s = progressMap.get(studentId);
          if (s) {
            s.totalQuizzes = stats.correct;
            s.averageScore = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            s.recentQuizzes = stats.dates.slice(-7).map(date => ({
              score: stats.bySubject[Object.keys(stats.bySubject)[0]]?.correct || 0,
              total: stats.bySubject[Object.keys(stats.bySubject)[0]]?.total || 0,
              date: date.split('T')[0],
            }));
            const subjectAverages: { subject: string; average: number }[] = [];
            Object.entries(stats.bySubject).forEach(([subject, data]) => {
              if (data.total > 0) {
                subjectAverages.push({ subject, average: Math.round((data.correct / data.total) * 100) });
              }
            });
            s.subjectAverages = subjectAverages;
          }
        });

        const studentList = Array.from(progressMap.values());
        setStudents(studentList);

        const activeStudents = studentList.filter(s => s.totalQuizzes > 0).length;
        const avgScore = studentList.length > 0 ? Math.round(studentList.reduce((sum, s) => sum + s.averageScore, 0) / studentList.length) : 0;
        const totalQuizzes = studentList.reduce((sum, s) => sum + s.totalQuizzes, 0);
        const totalPoints = studentList.reduce((sum, s) => sum + s.totalPoints, 0);
        const avgStreak = studentList.length > 0 ? Math.round(studentList.reduce((sum, s) => sum + s.currentStreak, 0) / studentList.length) : 0;

        setClassSummary({ totalStudents: studentList.length, activeStudents, averageScore: avgScore, totalQuizzes, totalPoints, averageStreak: avgStreak });
      } catch (err) {
        logger.error('Error loading class data:', err);
        setError('Erro ao carregar dados da turma.');
      } finally {
        setLoading(false);
      }
    }

    loadClass();
  }, [classCode]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-orange-600 dark:text-orange-400';
    if (streak >= 3) return 'text-blue-600 dark:text-blue-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-card border-4 border-red-300 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Erro ao Carregar</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link href="/login/professor">
            <Button className="bg-gradient-to-r from-red-500 to-red-600 text-white">Tentar Novamente</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="bg-card dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/login/professor">
                <Button variant="ghost" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-slate-700 dark:from-blue-400 dark:to-slate-300 bg-clip-text text-transparent">
                  Painel do Professor
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Turma: <span className="font-semibold text-blue-600 dark:text-blue-400">{classCode}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                Professor: {teacherName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {classSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-kid border-4 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/10 dark:bg-blue-500/20 rounded-xl">
                    <UsersIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total de Alunos</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{classSummary.totalStudents}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{classSummary.activeStudents} ativos esta semana</p>
              </div>
            </div>

            <div className="card-kid border-4 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600/10 dark:bg-green-500/20 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Média da Turma</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{classSummary.averageScore}%</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{classSummary.totalQuizzes} quizzes completados</p>
              </div>
            </div>

            <div className="card-kid border-4 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600/10 dark:bg-purple-500/20 rounded-xl">
                    <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pontos Totais</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{classSummary.totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Streak médio: {classSummary.averageStreak} dias</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {(['overview', 'students', 'analytics', 'reports'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              className="btn-kid"
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Visão Geral</span>}
              {tab === 'students' && <span className="flex items-center gap-2"><UsersIcon className="h-4 w-4" /> Alunos</span>}
              {tab === 'analytics' && <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Análises</span>}
              {tab === 'reports' && <span className="flex items-center gap-2"><Book className="h-4 w-4" /> Relatórios</span>}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="card-kid border-4 border-blue-300 dark:border-blue-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Resumo da Turma
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
                  <p>Esta turma tem <strong className="text-slate-800 dark:text-slate-200">{classSummary?.totalStudents}</strong> alunos inscritos.</p>
                  <p><strong className="text-slate-800 dark:text-slate-200">{classSummary?.activeStudents}</strong> alunos estiveram ativos esta semana.</p>
                  <p>A média de acertos da turma é de <strong className="text-slate-800 dark:text-slate-200">{classSummary?.averageScore}%</strong>.</p>
                  <p>Foram completados <strong className="text-slate-800 dark:text-slate-200">{classSummary?.totalQuizzes}</strong> quizzes no total.</p>
                  <p>Os alunos acumularam <strong className="text-slate-800 dark:text-slate-200">{classSummary?.totalPoints.toLocaleString()}</strong> pontos no total.</p>
                  <p>A streak média da turma é de <strong className="text-slate-800 dark:text-slate-200">{classSummary?.averageStreak}</strong> dias.</p>
                </div>
              </div>
            </div>

            <div className="card-kid border-4 border-green-300 dark:border-green-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top 5 Alunos da Semana
                </h2>
                <div className="space-y-2">
                  {students
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-yellow-500">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{student.studentName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{student.totalQuizzes} quizzes • {student.averageScore}% acertos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getScoreColor(student.averageScore)}`}>{student.averageScore}%</p>
                          <p className="text-sm" style={{ color: getStreakColor(student.currentStreak) }}>🔥 {student.currentStreak}d</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Conquistas Recentes da Turma
                </h2>
                <div className="flex flex-wrap gap-2">
                  {students.flatMap(s =>
                    s.recentAchievements?.slice(0, 2).map(ach => (
                      <div key={`${s.studentId}-${ach.title}`} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
                        {ach.icon} {ach.title} ({s.studentName})
                      </div>
                    )) || []
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="card-kid border-4 border-blue-300 dark:border-blue-700 shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-blue-500" />
                Lista de Alunos
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-gray-700">
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Aluno</th>
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Quizzes</th>
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Média</th>
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Pontos</th>
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Streak</th>
                      <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Última Atividade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.studentId} className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{student.studentName}</td>
                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">{student.totalQuizzes}</td>
                        <td className="py-3 text-center font-bold" style={{ color: getScoreColor(student.averageScore) }}>{student.averageScore}%</td>
                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">{student.totalPoints.toLocaleString()}</td>
                        <td className="py-3 text-center" style={{ color: getStreakColor(student.currentStreak) }}>🔥 {student.currentStreak}d</td>
                        <td className="py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                          {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('pt-PT') : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card-kid border-4 border-green-300 dark:border-green-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Evolução Semanal da Turma
                </h2>
                <div className="space-y-4">
                  {students.slice(0, 5).map(student => (
                    <div key={student.studentId} className="space-y-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{student.studentName}</h3>
                      <div className="flex items-end gap-2 h-32">
                        {(student.recentQuizzes || []).slice(0, 7).map((day, i) => (
                          <div key={i} className="flex-1 flex flex-col items-end gap-1">
                            <div
                              className="w-full bg-gradient-to-t from-green-500 to-green-300 dark:from-green-400 dark:to-green-600 rounded-t"
                              style={{ height: `${Math.max(10, (day.score / (day.total || 1)) * 100)}%` }}
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{day.date.split('-')[2]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-kid border-4 border-orange-300 dark:border-orange-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Tendência de Aprendizagem
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.slice(0, 4).map(student => (
                    <div key={student.studentId} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{student.studentName}</h3>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {student.averageScore >= 80 ? '📈' : student.averageScore >= 60 ? '➡️' : '📉'} {student.averageScore}%
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Média de acertos</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Áreas para Melhorar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.filter(s => s.averageScore < 70).slice(0, 4).map(student => (
                    <div key={student.studentId} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{student.studentName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Precisa de apoio em algumas áreas. Média: <strong className={getScoreColor(student.averageScore)}>{student.averageScore}%</strong></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="card-kid border-4 border-blue-300 dark:border-blue-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-500" />
                  Exportar Relatórios
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Button
                     onClick={async () => {
                       setGeneratingPdf(true);
                       try {
                         await generatePdfReport(students);
                       } catch (err) {
                         logger.error('PDF generation failed:', err);
                       } finally {
                         setGeneratingPdf(false);
                       }
                     }}
                     disabled={generatingPdf}
                     className="w-full btn-kid bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                   >
                    {generatingPdf ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        A gerar PDF...
                      </>
                    ) : (
                      <>
                        <Book className="mr-3 h-5 w-5" />
                        Exportar Relatório PDF
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      const csvHeader = 'Aluno,Quizzes,Média (%),Pontos,Streak,Última Atividade\n';
                      const csvRows = students.map(s =>
                        `${s.studentName},${s.totalQuizzes},${s.averageScore},${s.totalPoints},${s.currentStreak},${s.lastActivity ? new Date(s.lastActivity).toLocaleDateString('pt-PT') : 'Nunca'}`
                      ).join('\n');
                      const csv = csvHeader + csvRows;
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `relatorio-turma-${classCode}-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full btn-kid bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  >
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </div>

            <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Resumo Individual dos Alunos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map(student => (
                    <div key={student.studentId} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{student.studentName}</h3>
                      <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <li>Quizzes: <strong className="text-slate-800 dark:text-slate-200">{student.totalQuizzes}</strong></li>
                        <li>Média: <strong className={getScoreColor(student.averageScore)}>{student.averageScore}%</strong></li>
                        <li>Pontos: <strong className="text-slate-800 dark:text-slate-200">{student.totalPoints.toLocaleString()}</strong></li>
                        <li>Streak: <strong className="text-slate-800 dark:text-slate-200">🔥 {student.currentStreak}d</strong></li>
                        {student.subjectAverages?.map(sa => (
                          <li key={sa.subject}>{sa.subject}: <strong className={getScoreColor(sa.average)}>{sa.average}%</strong></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}