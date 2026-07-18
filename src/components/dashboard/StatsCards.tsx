"use client"

import { CardContent } from "@/components/ui/card"
import { Trophy, Target, Zap, Flame } from "lucide-react"

interface StudentStreak {
  current_streak: number;
  longest_streak: number;
}

interface StatsCardsProps {
  totalPoints: number;
  averageScore: number;
  totalQuizzes: number;
  streak: StudentStreak | null;
}

export function StatsCards({ totalPoints, averageScore, totalQuizzes, streak }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="stat-card bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-4 border-yellow-300 transition-all duration-300">
        <CardContent className="p-6 text-center relative z-10">
          <Trophy className="h-10 w-10 mx-auto mb-3 text-yellow-600 animate-pulse" />
          <p className="text-4xl font-black text-yellow-700 dark:text-yellow-300">{totalPoints}</p>
          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mt-1">💰 Pontos</p>
        </CardContent>
      </div>

      <div className="stat-card bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 border-4 border-green-300 transition-all duration-300">
        <CardContent className="p-6 text-center relative z-10">
          <Target className="h-10 w-10 mx-auto mb-3 text-green-600" />
          <p className="text-4xl font-black text-green-700 dark:text-green-300">{averageScore}%</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">🎯 Média</p>
        </CardContent>
      </div>

      <div className="stat-card bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30 border-4 border-purple-300 transition-all duration-300">
        <CardContent className="p-6 text-center relative z-10">
          <Zap className="h-10 w-10 mx-auto mb-3 text-purple-600" />
          <p className="text-4xl font-black text-purple-700 dark:text-purple-300">{totalQuizzes}</p>
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">⚡ Quizzes</p>
        </CardContent>
      </div>

      <div className="stat-card bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30 border-4 border-orange-300 transition-all duration-300">
        <CardContent className="p-6 text-center relative z-10">
          <Flame className="h-10 w-10 mx-auto mb-3 text-orange-600 fill-orange-500" />
          <p className="text-4xl font-black text-orange-700 dark:text-orange-300">{streak?.current_streak || 0}</p>
          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">🔥 Streak</p>
        </CardContent>
      </div>
    </div>
  )
}
