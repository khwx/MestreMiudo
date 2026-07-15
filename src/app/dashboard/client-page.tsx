"use client"
import { logger } from "@/lib/logger";

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { getFullQuizHistory, getStudentLessonHistoryAction, getStudentRewards, getStudentStreak } from "@/app/actions"
import { getDailyChallenge, getDailyChallengeStats } from "@/lib/daily-challenges"
import { getStudentStats as getSpacedRepetitionStats } from "@/lib/spaced-repetition"
import type { QuizResultEntry } from "@/app/shared-schemas"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { LevelProgress } from "@/components/dashboard/LevelProgress"
import { FeatureGrid } from "@/components/dashboard/FeatureGrid"

interface LessonHistoryItem {
  lessonId: string;
  completedAt: string;
  score: number;
  subject: string;
  stars: number;
  coins_earned: number;
}

interface StudentStreak {
  current_streak: number;
  longest_streak: number;
}

interface DailyChallengeStats {
  completed: number;
  correctAnswers: number;
  streak: number;
}

const levelThresholds = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 300 },
  { level: 4, points: 600 },
  { level: 5, points: 1000 },
  { level: 6, points: 1500 },
]

const calculateLevel = (totalPoints: number) => {
  let currentLevel = 1
  let pointsForNextLevel = 100
  let pointsAtCurrentLevel = 0

  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i].points) {
      currentLevel = levelThresholds[i].level
      pointsAtCurrentLevel = levelThresholds[i].points
      if (i < levelThresholds.length - 1) {
        pointsForNextLevel = levelThresholds[i + 1].points
      } else {
        pointsForNextLevel = Infinity
      }
      break
    }
  }

  const pointsToNext = pointsForNextLevel - pointsAtCurrentLevel
  const progressInLevel = totalPoints - pointsAtCurrentLevel
  const progressPercentage = pointsToNext > 0 && pointsToNext !== Infinity ? (progressInLevel / pointsToNext) * 100 : 100

  return {
    level: currentLevel,
    nextLevel: currentLevel + 1,
    progressPercentage,
    pointsNeeded: pointsToNext === Infinity ? 0 : pointsToNext - progressInLevel,
  }
}

export default function DashboardClientPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "Amigo"
  const grade = searchParams.get("grade") || "1"

  const [history, setHistory] = useState<QuizResultEntry[]>([])
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([])
  const [rewards, setRewards] = useState<Record<string, unknown> | null>(null)
  const [streak, setStreak] = useState<StudentStreak | null>(null)
  const [dailyChallengeStats, setDailyChallengeStats] = useState<DailyChallengeStats | null>(null)
  const [spacedStats, setSpacedStats] = useState<{ total: number; mastered: number; learning: number; due: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (name) {
      const gradeLevel = parseInt(grade, 10) as 1 | 2 | 3 | 4

      Promise.all([
        getFullQuizHistory(name),
        getStudentLessonHistoryAction(name),
        getStudentRewards(name),
        getStudentStreak(name),
        getDailyChallenge(name, gradeLevel),
        getDailyChallengeStats(name),
      ])
        .then(([quizHistory, lessons, studentRewards, studentStreak, _challenge, stats]) => {
          setHistory(quizHistory || [])
          setLessonHistory(lessons || [])
          setRewards(studentRewards || null)
          setStreak(studentStreak || null)
          setDailyChallengeStats(stats)
        })
        .catch((err) => {
          logger.error("Erro ao carregar o painel:", err)
          setError("Não foi possível carregar o painel. Por favor tenta novamente.")
        })
        .finally(() => setLoading(false))

      getSpacedRepetitionStats(name).then((sr) => {
        if (sr) setSpacedStats(sr)
      })
    } else {
      setLoading(false)
    }
  }, [name, grade])

  const totalPoints = useMemo(() => {
    const quizPoints = history.reduce((acc, entry) => acc + entry.score * 10, 0)
    const lessonPoints = lessonHistory.reduce((acc, lesson) => acc + (lesson.coins_earned || 0), 0)
    const rewardPoints = (rewards?.total_points as number) || 0
    return Math.max(quizPoints + lessonPoints, rewardPoints)
  }, [history, lessonHistory, rewards])

  const levelInfo = useMemo(() => calculateLevel(totalPoints), [totalPoints])
  const { level, nextLevel, progressPercentage, pointsNeeded } = levelInfo

  const totalQuizzes = useMemo(() => history.length, [history])

  const averageScore = useMemo(() => {
    return totalQuizzes > 0
      ? Math.round(history.reduce((acc, h) => acc + (h.score / h.numberOfQuestions) * 100, 0) / totalQuizzes)
      : 0
  }, [history, totalQuizzes])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {error && (
        <div className="flex items-center justify-center min-h-[50vh] p-6">
          <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-2xl max-w-lg p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-black text-red-700 dark:text-red-300 mb-2">Erro ao carregar</h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-kid border-2 border-red-300 px-6 py-2 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
      {!error && (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Animado */}
        <div className="text-center space-y-4 py-6">
          <div className="text-6xl animate-bounce">🎮</div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Olá, {name}! 👋
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Pronto para uma nova aventura?
          </p>
        </div>

        <StatsCards
          totalPoints={totalPoints}
          averageScore={averageScore}
          totalQuizzes={totalQuizzes}
          streak={streak}
        />

        <LevelProgress
          level={level}
          progressPercentage={progressPercentage}
          pointsNeeded={pointsNeeded}
          nextLevel={nextLevel}
          loading={loading}
        />

        <FeatureGrid
          name={name}
          grade={grade}
          spacedStats={spacedStats}
          dailyChallengeStats={dailyChallengeStats}
        />
      </div>
      )}
    </div>
  )
}
