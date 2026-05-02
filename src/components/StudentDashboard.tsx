'use client';

import React from 'react';

interface PerformanceStats {
  subject: string;
  totalQuizzes: number;
  averageScore: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface StudentDashboardProps {
  stats: PerformanceStats[];
  totalPoints: number;
  currentTier: string;
  dayStreak: number;
  lastQuizDate?: string;
}

export function StudentDashboard({ 
  stats, 
  totalPoints, 
  currentTier, 
  dayStreak, 
  lastQuizDate 
}: StudentDashboardProps) {
  const totalQuizzes = stats.reduce((sum, s) => sum + s.totalQuizzes, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalAnswered = stats.reduce((sum, s) => sum + s.totalAnswers, 0);
  const overallAverage = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="📊"
          label="Quizzes Realizados"
          value={totalQuizzes.toString()}
          color="blue"
        />
        <StatCard
          icon="⭐"
          label="Média Geral"
          value={`${Math.round(overallAverage)}%`}
          color="purple"
        />
        <StatCard
          icon="🔥"
          label="Dia Streak"
          value={dayStreak.toString()}
          color="orange"
        />
        <StatCard
          icon="👑"
          label="Nível"
          value={currentTier}
          color="yellow"
        />
      </div>

      {/* Performance by Subject */}
      <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Desempenho por Disciplina</h3>

        <div className="space-y-4">
          {stats.map((stat) => {
            const percentage = stat.totalAnswers > 0 
              ? (stat.correctAnswers / stat.totalAnswers) * 100 
              : 0;

            return (
              <div key={stat.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{stat.subject}</p>
                    <p className="text-xs text-gray-600">
                      {stat.correctAnswers} / {stat.totalAnswers} corretas ({stat.totalQuizzes} quizzes)
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{Math.round(percentage)}%</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 90
                        ? 'bg-green-500'
                        : percentage >= 80
                        ? 'bg-blue-500'
                        : percentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsBox
          label="Respostas Corretas"
          value={totalCorrect.toString()}
          icon="✅"
        />
        <StatsBox
          label="Total de Respostas"
          value={totalAnswered.toString()}
          icon="📝"
        />
        <StatsBox
          label="Pontos Totais"
          value={totalPoints.toString()}
          icon="⭐"
        />
        {lastQuizDate && (
          <StatsBox
            label="Último Quiz"
            value={new Date(lastQuizDate).toLocaleDateString('pt-PT')}
            icon="📅"
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'orange' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  const textColor = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-4`}>
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor[color]}`}>{value}</p>
    </div>
  );
}

function StatsBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-xl font-bold text-blue-600 mt-1">{value}</p>
    </div>
  );
}
