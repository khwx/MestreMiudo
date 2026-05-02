'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface QuizHistoryEntry {
  date: string;
  subject: string;
  score: number;
  total: number;
  timestamp: string;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalQuizzes: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface AnalyticsDashboardProps {
  quizHistory: QuizHistoryEntry[];
  subjectPerformance: SubjectPerformance[];
  totalPoints: number;
  currentTier: string;
  dayStreak: number;
}

export function AnalyticsDashboard({
  quizHistory,
  subjectPerformance,
  totalPoints,
  currentTier,
  dayStreak,
}: AnalyticsDashboardProps) {
  // Prepare data for progress over time chart
  const progressData = quizHistory
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-30) // Last 30 quizzes
    .map((entry, index) => ({
      name: `Quiz ${index + 1}`,
      score: (entry.score / entry.total) * 100,
      date: new Date(entry.timestamp).toLocaleDateString('pt-PT'),
    }));

  // Prepare data for subject performance
  const subjectScores = subjectPerformance.map((subject) => ({
    name: subject.subject,
    value: Math.round((subject.correctAnswers / subject.totalAnswers) * 100),
    correctAnswers: subject.correctAnswers,
    totalAnswers: subject.totalAnswers,
    totalQuizzes: subject.totalQuizzes,
  }));

  // Prepare data for subject comparison (bar chart)
  const subjectComparison = subjectPerformance.map((subject) => ({
    name: subject.subject,
    'Acertos %': Math.round((subject.correctAnswers / subject.totalAnswers) * 100),
    'Quizzes': subject.totalQuizzes,
    'Média': Math.round(subject.averageScore),
  }));

  // Calculate statistics
  const totalQuizzes = quizHistory.length;
  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / totalQuizzes
        )
      : 0;

  const bestSubject =
    subjectPerformance.length > 0
      ? subjectPerformance.reduce((best, current) =>
          (current.correctAnswers / current.totalAnswers) * 100 >
          (best.correctAnswers / best.totalAnswers) * 100
            ? current
            : best
        )
      : null;

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="w-full space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuizzes}</div>
            <p className="text-xs text-gray-500">Completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore}%</div>
            <p className="text-xs text-gray-500">De todas as respostas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPoints}</div>
            <p className="text-xs text-gray-500">Acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">🔥 {dayStreak}</div>
            <p className="text-xs text-gray-500">Dias consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">👑</div>
            <p className="text-xs text-gray-500">{currentTier}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Over Time */}
      {progressData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso ao Longo do Tempo</CardTitle>
            <CardDescription>Tuas notas nos últimos quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => `${Math.round(Number(value))}%`}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject Comparison */}
      {subjectComparison.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>Taxa de acerto em cada disciplina</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="Acertos %" fill="#8b5cf6" />
                  <Bar dataKey="Média" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          {subjectScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Acertos</CardTitle>
                <CardDescription>Por disciplina</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectScores}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectScores.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Subject Details */}
      {subjectPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Disciplina</CardTitle>
            <CardDescription>Análise completa do teu desempenho</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject) => {
                const percentage = Math.round(
                  (subject.correctAnswers / subject.totalAnswers) * 100
                );
                const isBest = bestSubject && subject.subject === bestSubject.subject;

                return (
                  <div key={subject.subject} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{subject.subject}</h4>
                        {isBest && (
                          <Badge className="bg-green-500">Melhor Disciplina 🏆</Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Acertos</p>
                        <p className="font-semibold">
                          {subject.correctAnswers}/{subject.totalAnswers}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quizzes</p>
                        <p className="font-semibold">{subject.totalQuizzes}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Média</p>
                        <p className="font-semibold">{Math.round(subject.averageScore)}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 90
                            ? 'bg-green-500'
                            : percentage >= 80
                            ? 'bg-blue-500'
                            : percentage >= 70
                            ? 'bg-yellow-500'
                            : percentage >= 60
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Dicas para Melhorar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            ✨ Manter a tua <strong>streak</strong> ativa faz com que ganhas pontos bónus todos os
            dias!
          </p>
          <p>🎯 Tenta focar na disciplina com menor pontuação para equilibrares o teu desempenho.</p>
          <p>
            📈 Cada quiz completo te traz mais perto do próximo nível. Continua o bom trabalho!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
