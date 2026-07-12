'use client';
import { logger } from "@/lib/logger";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, BookOpen, Calendar, FileSpreadsheet, FileText, Lightbulb, Loader2, TrendingUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generatePdfReport } from '@/lib/pdf-report';
import {
  getWeeklyProgress,
  getTopicAnalysis,
  getLearningTrend,
  generateStudyRecommendations,
} from '@/lib/analytics';
import { checkAchievementUnlock, getAllAchievements } from '@/lib/achievements';

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

export default function ParentDashboardPage() {
  const searchParams = useSearchParams();
  const accessCode = searchParams.get('code');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [weeklyData, setWeeklyData] = useState<Record<string, { date: string; score: number }[]>>({});
  const [topicData, setTopicData] = useState<Record<string, { topic: string; averageScore: number; status: 'strong' | 'weak' }[]>>({});
  const [trendData, setTrendData] = useState<Record<string, { trend: string; changePercent: number }>>({});
  const [recommendations, setRecommendations] = useState<Record<string, { topic: string; priority: string; suggestion: string }[]>>({});

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
          .select('student_id, score, total_questions, subject, created_at')
          .in('student_id', studentIds);

        const progressMap = new Map<string, StudentProgress>();
        studentIds.forEach((id: string) => {
          progressMap.set(id, {
            studentId: id,
            studentName: id,
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

        const quizByStudent = new Map<string, { total: number; correct: number }>();
        quizData?.forEach(q => {
          if (!quizByStudent.has(q.student_id)) {
            quizByStudent.set(q.student_id, { total: 0, correct: 0 });
          }
          const stats = quizByStudent.get(q.student_id)!;
          stats.total += q.total_questions;
          stats.correct += q.score;

          const s = progressMap.get(q.student_id);
          if (s && q.created_at) {
            const quizDate = new Date(q.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            if (quizDate >= sevenDaysAgo) {
              s.recentQuizzes!.push({
                score: q.score,
                total: q.total_questions,
                date: q.created_at,
              });
            }
          }
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

        progressMap.forEach((s) => {
          const subjectMap = new Map<string, { total: number; correct: number }>();
          quizData?.forEach(q => {
            if (q.student_id === s.studentId && q.subject) {
              if (!subjectMap.has(q.subject)) {
                subjectMap.set(q.subject, { total: 0, correct: 0 });
              }
              const sub = subjectMap.get(q.subject)!;
              sub.total += q.total_questions;
              sub.correct += q.score;
            }
          });
          s.subjectAverages = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
            subject,
            average: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
          }));
        });

        const allAchievementDefs = getAllAchievements();

        for (const s of progressMap.values()) {
          const studentQuizData = quizData?.filter(q => q.student_id === s.studentId) || [];
          const totalQuizzes = studentQuizData.length;
          const perfectScores = studentQuizData.filter(q => q.total_questions > 0 && q.score === q.total_questions).length;
          const totalCorrect = studentQuizData.reduce((sum, q) => sum + q.score, 0);
          const totalQuestions = studentQuizData.reduce((sum, q) => sum + q.total_questions, 0);
          const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

          const subjectMap = new Map<string, { total: number; correct: number }>();
          studentQuizData.forEach(q => {
            if (!q.subject) return;
            if (!subjectMap.has(q.subject)) subjectMap.set(q.subject, { total: 0, correct: 0 });
            const sub = subjectMap.get(q.subject)!;
            sub.total += q.total_questions;
            sub.correct += q.score;
          });
          const subjectAverages: Record<string, number> = {};
          subjectMap.forEach((stats, subject) => {
            subjectAverages[subject] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          });

          const portugueseAverage = subjectAverages['portugues'] ?? subjectAverages['Português'];
          const mathAverage = subjectAverages['matematica'] ?? subjectAverages['Matemática'];
          const estudoAverage = subjectAverages['estudo do meio'] ?? subjectAverages['Estudo do Meio'];

          const unlockedIds = await checkAchievementUnlock(
            totalQuizzes,
            perfectScores,
            s.currentStreak,
            averageScore,
            false,
            0,
            {
              portugueseAverage,
              mathAverage,
              estudoAverage,
            }
          );

          s.recentAchievements = unlockedIds
            .slice(0, 3)
            .map(id => {
              const def = allAchievementDefs.find(a => a.id === id);
              return {
                title: def?.title ?? id,
                icon: def?.icon ?? '⭐',
                date: new Date().toISOString(),
              };
            });
        }

        setStudents(Array.from(progressMap.values()));

        const wMap: Record<string, { date: string; score: number }[]> = {};
        const tMap: Record<string, { topic: string; averageScore: number; status: 'strong' | 'weak' }[]> = {};
        const trMap: Record<string, { trend: string; changePercent: number }> = {};
        const rMap: Record<string, { topic: string; priority: string; suggestion: string }[]> = {};
        for (const id of studentIds) {
          const [w, t, tr, r] = await Promise.all([
            getWeeklyProgress(id),
            getTopicAnalysis(id),
            getLearningTrend(id),
            generateStudyRecommendations(id),
          ]);
          wMap[id] = w;
          tMap[id] = t;
          trMap[id] = { trend: tr.trend, changePercent: tr.changePercent };
          rMap[id] = r;
        }
        setWeeklyData(wMap);
        setTopicData(tMap);
        setTrendData(trMap);
        setRecommendations(rMap);
      } catch (error) {
        logger.error('Erro ao carregar painel de pais:', error);
        setError('Não foi possível carregar o painel de pais. Por favor tenta novamente.');
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [accessCode]);

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      await generatePdfReport(students);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Aluno', 'Média %', 'Total Quizzes', 'Pontos', 'Streak Dias'];
    const rows = students.map(s => [
      s.studentName,
      String(s.averageScore),
      String(s.totalQuizzes),
      String(s.totalPoints),
      String(s.currentStreak),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_mestremiudo_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getWeeklyData = (student: StudentProgress) => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const days: { day: string; score: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = dayNames[d.getDay()];
      const dayQuizzes = (student.recentQuizzes || []).filter(q => {
        const qDate = new Date(q.date);
        return qDate.toDateString() === d.toDateString();
      });
      const avg = dayQuizzes.length > 0
        ? Math.round(dayQuizzes.reduce((sum, q) => sum + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0) / dayQuizzes.length)
        : 0;
      days.push({ day: dayStr, score: avg });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 p-6">
        <div className="text-6xl">😕</div>
        <div className="bg-red-50 dark:bg-red-900/20 border-4 border-red-300 rounded-2xl p-8 max-w-lg">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-lg font-bold">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 btn-kid border-2">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!accessCode) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-2xl max-w-lg">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-3xl font-black text-red-600 dark:text-red-400">Acesso Restrito</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Usa o código de acesso fornecido pelo professor/encarregado.
            </p>
            <Button onClick={() => window.history.back()} variant="outline" className="btn-kid border-2 border-gray-300 dark:border-gray-700">
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
        <div className="card-kid border-4 border-gray-300 dark:border-gray-700 shadow-2xl max-w-lg mx-auto">
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
                className="card-kid border-4 border-teal-300 dark:border-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300"
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

          {/* Resumo Semanal */}
          <div className="card-kid border-4 border-blue-300 dark:border-blue-700 shadow-xl p-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              📊 Resumo Semanal
            </h2>
            <div className="space-y-4">
              {students.map(student => {
                const weeklyData = getWeeklyData(student);
                const maxScore = Math.max(...weeklyData.map(d => d.score), 1);
                return (
                  <div key={student.studentId} className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                    <div className="flex items-end gap-2 h-32">
                      {weeklyData.map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{data.score}%</span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${
                              data.score >= 80
                                ? 'bg-gradient-to-t from-green-400 to-emerald-500'
                                : data.score >= 60
                                ? 'bg-gradient-to-t from-yellow-400 to-amber-500'
                                : data.score > 0
                                ? 'bg-gradient-to-t from-red-400 to-rose-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ height: `${Math.max((data.score / maxScore) * 100, data.score > 0 ? 10 : 4)}%` }}
                          />
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{data.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disciplinas */}
          <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-xl p-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              📚 Média por Disciplina
            </h2>
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.studentId} className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                  {student.subjectAverages && student.subjectAverages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {student.subjectAverages.map(sub => (
                        <div
                          key={sub.subject}
                          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700"
                        >
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{sub.subject}</p>
                          <p className="text-3xl font-black text-purple-600">{sub.average}%</p>
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                sub.average >= 80
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                  : sub.average >= 60
                                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                  : 'bg-gradient-to-r from-red-400 to-rose-500'
                              }`}
                              style={{ width: `${sub.average}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados de disciplinas ainda.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas Recentes */}
          <div className="card-kid border-4 border-yellow-300 dark:border-yellow-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                🏆 Conquistas Recentes
              </h2>
            </div>
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.studentId} className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                  {student.recentAchievements && student.recentAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {student.recentAchievements.map((ach, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-700 text-center"
                        >
                          <div className="text-4xl mb-2">{ach.icon}</div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{ach.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(ach.date).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem conquistas registadas ainda.</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/dashboard/achievements?name=${students[0]?.studentName || 'Jogador'}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                Ver todas as conquistas →
              </Link>
            </div>
          </div>

          {/* Tendência de Aprendizagem - Weekly Progress Chart */}
          <div className="card-kid border-4 border-blue-300 dark:border-blue-700 shadow-xl p-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              Tendência de Aprendizagem
            </h2>
            <div className="space-y-6">
              {students.map(student => {
                const data = weeklyData[student.studentId] || [];
                if (!data.length) return null;
                const maxScore = Math.max(...data.map(d => d.score), 1);
                const trend = trendData[student.studentId];
                return (
                  <div key={student.studentId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                      {trend && (
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          trend.trend === 'improving' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          trend.trend === 'declining' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {trend.trend === 'improving' ? '📈 A melhorar' :
                           trend.trend === 'declining' ? '📉 A piorar' : '➡️ Estável'}
                          {trend.changePercent !== 0 && ` (${trend.changePercent > 0 ? '+' : ''}${trend.changePercent}%)`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-2 h-36 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      {data.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{day.score}%</span>
                          <div className="w-full rounded-t-md bg-gray-200 dark:bg-gray-700 relative" style={{ height: '100%' }}>
                            <div
                              className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                                day.score >= 80 ? 'bg-gradient-to-t from-green-400 to-emerald-500'
                                  : day.score >= 60 ? 'bg-gradient-to-t from-yellow-400 to-amber-500'
                                  : day.score > 0 ? 'bg-gradient-to-t from-red-400 to-rose-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              style={{ height: `${Math.max((day.score / maxScore) * 100, day.score > 0 ? 8 : 2)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                            {day.date.split('/')[0]}/{day.date.split('/')[1]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Áreas para Melhorar */}
          <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-xl p-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Áreas para Melhorar
            </h2>
            <div className="space-y-4">
              {students.map(student => {
                const topics = topicData[student.studentId] || [];
                const weak = topics.filter(t => t.status === 'weak');
                if (!weak.length) return (
                  <div key={student.studentId} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                    <p className="font-bold text-green-700 dark:text-green-400">✅ {student.studentName}: Sem áreas fracas identificadas!</p>
                  </div>
                );
                return (
                  <div key={student.studentId} className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {weak.sort((a, b) => a.averageScore - b.averageScore).map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{t.topic}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">{t.averageScore}% de acerto</p>
                          </div>
                          <div className="w-20 h-3 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${t.averageScore}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendações de Estudo */}
          <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-xl p-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-purple-500" />
              Recomendações de Estudo
            </h2>
            <div className="space-y-4">
              {students.map(student => {
                const recs = recommendations[student.studentId] || [];
                if (!recs.length) return (
                  <div key={student.studentId} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                    <p className="font-bold text-purple-700 dark:text-purple-400">🌟 {student.studentName}: Excelente desempenho! Sem recomendações especiais.</p>
                  </div>
                );
                return (
                  <div key={student.studentId} className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{student.studentName}</h3>
                    <div className="space-y-2">
                      {recs.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                          <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                            r.priority === 'high' ? 'bg-red-500' : r.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="space-y-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{r.topic}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{r.suggestion}</p>
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                              r.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              r.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              Prioridade {r.priority === 'high' ? 'Alta' : r.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="text-center pt-4 flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleGeneratePdf}
              className="btn-kid bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-lg h-12"
              size="lg"
            >
              {generatingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              Exportar PDF
            </Button>
            <Button
              onClick={handleExportCsv}
              className="btn-kid bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg h-12"
              size="lg"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Exportar CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
