"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Divide, Leaf, Loader2, Shuffle, Gamepad2, BookHeart, Lightbulb, Flame, ShoppingBag } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { getFullQuizHistory, getStudentLessonHistoryAction, getStudentRewards, getStudentStreak } from "@/app/actions"
import { getDailyChallenge, getDailyChallengeStats } from "@/lib/daily-challenges"
import { getItemsForReview, getStudentStats as getSpacedRepetitionStats } from "@/lib/spaced-repetition"
import type { QuizResultEntry } from "@/app/shared-schemas"
import { Trophy, Target, Zap, Calendar, TrendingUp, Medal, Brain, RefreshCw } from "lucide-react"

const subjects = [
  { name: "Português", icon: Book, color: "text-green-600", slug: "portugues" },
  { name: "Matemática", icon: Divide, color: "text-blue-600", slug: "matematica" },
  { name: "Estudo do Meio", icon: Leaf, color: "text-orange-600", slug: "estudo-do-meio" },
]

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
  const [lessonHistory, setLessonHistory] = useState<any[]>([])
  const [rewards, setRewards] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)
  const [dailyChallengeStats, setDailyChallengeStats] = useState<any>(null)
  const [spacedStats, setSpacedStats] = useState<{ total: number; mastered: number; learning: number; due: number } | null>(null)
  const [loading, setLoading] = useState(true)

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
        .then(([quizHistory, lessons, studentRewards, studentStreak, challenge, stats]) => {
          setHistory(quizHistory || [])
          setLessonHistory(lessons || [])
          setRewards(studentRewards || null)
          setStreak(studentStreak || null)
          setDailyChallengeStats(stats)
        })
        .catch((err) => {
          console.error("Error loading dashboard:", err)
          setHistory([])
          setLessonHistory([])
          setRewards(null)
          setStreak(null)
          setDailyChallengeStats(null)
        })
        .finally(() => setLoading(false))

      getSpacedRepetitionStats(name).then((sr) => {
        if (sr) setSpacedStats(sr)
      })
    } else {
      setLoading(false)
    }
  }, [name, grade])

  const quizPoints = history.reduce((acc, entry) => acc + entry.score * 10, 0)
  const lessonPoints = lessonHistory.reduce((acc, lesson) => acc + (lesson.coins_earned || 0), 0)
  const rewardPoints = rewards?.total_points || 0
  const totalPoints = Math.max(quizPoints + lessonPoints, rewardPoints)
  const { level, nextLevel, progressPercentage, pointsNeeded } = calculateLevel(totalPoints)

  const totalQuizzes = history.length
  const averageScore = totalQuizzes > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.score / h.numberOfQuestions) * 100, 0) / totalQuizzes)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

        {/* Stats Cards - Design Novo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-4 border-yellow-300 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center relative z-10">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-yellow-600 animate-pulse" />
              <p className="text-4xl font-black text-yellow-700 dark:text-yellow-300">{totalPoints}</p>
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mt-1">💰 Pontos</p>
            </CardContent>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 border-4 border-green-300 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center relative z-10">
              <Target className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <p className="text-4xl font-black text-green-700 dark:text-green-300">{averageScore}%</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">🎯 Média</p>
            </CardContent>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30 border-4 border-purple-300 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center relative z-10">
              <Zap className="h-10 w-10 mx-auto mb-3 text-purple-600" />
              <p className="text-4xl font-black text-purple-700 dark:text-purple-300">{totalQuizzes}</p>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">⚡ Quizzes</p>
            </CardContent>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30 border-4 border-orange-300 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center relative z-10">
              <Flame className="h-10 w-10 mx-auto mb-3 text-orange-600 fill-orange-500" />
              <p className="text-4xl font-black text-orange-700 dark:text-orange-300">{streak?.current_streak || 0}</p>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">🔥 Streak</p>
            </CardContent>
          </div>
        </div>

        {/* Level Progress Card */}
        <div className="max-w-2xl mx-auto border-4 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Medal className="h-8 w-8 text-yellow-500 animate-pulse" />
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nível {level}
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              🚀 Continua a jogar para subir de nível!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="progress-kid">
                  <div 
                    className="progress-kid-bar" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {pointsNeeded > 0 
                    ? `🎯 Faltam ${pointsNeeded} pontos para o nível ${nextLevel}!` 
                    : "🎉 Parabéns! Alcançaste o nível máximo!"}
                </p>
              </>
            )}
          </CardContent>
        </div>

        {/* Navegação Principal - Novos Cards */}
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎮 Escolhe a tua próxima missão!
          </h3>
          
          {/* Linha 1: Lições + Quizzes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aprender a Brincar */}
            <Link href={`/dashboard/learn?name=${name}&grade=${grade}`}>
              <div className="card-kid card-kid-success hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-green-300">
                <div className="p-6 flex flex-row items-center justify-between pb-2">
                  <h4 className="text-2xl font-black text-green-700 dark:text-green-200">📚 Aprender a Brincar</h4>
                  <div className="p-4 rounded-full bg-green-200 dark:bg-green-800/40 animate-float">
                    <Lightbulb className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="p-6 pt-0 flex-grow">
                  <p className="text-green-700 dark:text-green-300 text-lg">Segue lições estruturadas com histórias!</p>
                </div>
                <div className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold">Lições Interativas</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Quizzes por Disciplina */}
            {subjects.map((subject) => (
              <Link key={subject.name} href={`/quiz/${subject.slug}?name=${name}&grade=${grade}`}>
                <div className={`card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 ${
                  subject.name === 'Português' ? 'border-green-300' :
                  subject.name === 'Matemática' ? 'border-blue-300' :
                  'border-orange-300'
                }`}>
                  <div className="p-6 flex flex-row items-center justify-between pb-2">
                    <h4 className="text-2xl font-black">{subject.name}</h4>
                    <div className={`p-4 rounded-full ${
                      subject.name === 'Português' ? 'bg-green-100' :
                      subject.name === 'Matemática' ? 'bg-blue-100' :
                      'bg-orange-100'
                    }`}>
                      <subject.icon className={`h-10 w-10 ${
                        subject.name === 'Português' ? 'text-green-600' :
                        subject.name === 'Matemática' ? 'text-blue-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex-grow">
                    <p className="text-gray-600">Desafios de {subject.name} esperam por ti!</p>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-xl">🎯</span>
                      <span className="font-semibold">Quiz Challenge</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Desafio Surpresa */}
            <Link href={`/quiz/misto?name=${name}&grade=${grade}`}>
              <div className="card-kid card-kid-accent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 border-yellow-300">
                <div className="p-6 flex flex-row items-center justify-between pb-2">
                  <h4 className="text-2xl font-black text-yellow-700">🎲 Desafio Surpresa</h4>
                  <div className="p-4 rounded-full bg-yellow-100">
                    <Shuffle className="h-10 w-10 text-yellow-600" />
                  </div>
                </div>
                <div className="p-6 pt-0 flex-grow">
                  <p className="text-gray-600">Testa os teus conhecimentos em todas as áreas!</p>
                </div>
                <div className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <span className="text-xl">🎁</span>
                    <span className="font-semibold">Misto</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Linha 2: Funcionalidades */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Loja */}
            <Link href={`/dashboard/shop?name=${name}&grade=${grade}`}>
              <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 border-yellow-300">
                <div className="p-6 text-center flex-grow">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                  <h4 className="text-xl font-black text-yellow-700">🛍️ Loja</h4>
                  <p className="text-yellow-600 mt-2">Gasta as tuas moedas!</p>
                </div>
              </div>
            </Link>

            {/* Oficina de Histórias */}
            <Link href={`/dashboard/story-creator?name=${name}&grade=${grade}`}>
              <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 border-purple-300">
                <div className="p-6 text-center flex-grow">
                  <BookHeart className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h4 className="text-xl font-black text-purple-700">📖 Histórias</h4>
                  <p className="text-purple-600 mt-2">Cria histórias únicas!</p>
                </div>
              </div>
            </Link>

            {/* Salão de Jogos */}
            <Link href={`/dashboard/games?name=${name}&grade=${grade}`}>
              <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 border-blue-300">
                <div className="p-6 text-center flex-grow">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <h4 className="text-xl font-black text-blue-700">🎮 Jogos</h4>
                  <p className="text-blue-600 mt-2">Diverte-te a jogar!</p>
                </div>
              </div>
            </Link>

            {/* Conquistas */}
            <Link href={`/dashboard/achievements?name=${name}&grade=${grade}`}>
              <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col bg-white border-4 border-amber-300">
                <div className="p-6 text-center flex-grow">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-600" />
                  <h4 className="text-xl font-black text-amber-700">🏆 Conquistas</h4>
                  <p className="text-amber-600 mt-2">Desbloqueia prémios!</p>
                </div>
              </div>
            </Link>
          </div>

      {/* Linha 3: Revisão + Desafio Diário + Rankings + Histórico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Revisão Espaçada */}
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-indigo-300 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-indigo-500" />
              <h4 className="text-xl font-black text-indigo-700 dark:text-indigo-300">🧠 Revisão</h4>
            </div>
            {spacedStats && spacedStats.due > 0 ? (
              <>
                <p className="text-indigo-700 dark:text-indigo-300 mb-2 font-bold">
                  {spacedStats.due} itens para rever!
                </p>
                <div className="bg-indigo-200 dark:bg-indigo-800/40 rounded-full px-4 py-2 inline-block">
                  <p className="text-indigo-700 dark:text-indigo-300 font-bold">
                    <RefreshCw className="h-4 w-4 inline mr-1" />
                    Rever agora
                  </p>
                </div>
              </>
            ) : spacedStats && spacedStats.total > 0 ? (
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                ✅ Tudo em dia! {spacedStats.mastered} dominados
              </p>
            ) : (
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Faz lições para criar revisões!
              </p>
            )}
          </div>
        </div>

        {/* Desafio Diário */}
        <Link href={`/dashboard/daily-challenge?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-orange-300 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 h-full">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
              <h4 className="text-xl font-black text-orange-700 dark:text-orange-300">🔥 Desafio Diário</h4>
            </div>
            <p className="text-orange-700 dark:text-orange-300 mb-3">Ganha pontos todos os dias!</p>
            {dailyChallengeStats?.streak ? (
              <div className="bg-orange-200 dark:bg-orange-800/40 rounded-full px-4 py-2 inline-block">
                <p className="text-orange-700 dark:text-orange-300 font-bold">
                  🎯 {dailyChallengeStats.streak} dias
                </p>
              </div>
            ) : (
              <p className="text-orange-600 dark:text-orange-400 font-semibold">
                Começa hoje!
              </p>
            )}
          </div>
        </div>
        </Link>

        {/* Rankings */}
        <Link href={`/dashboard/leaderboard?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 h-full">
          <div className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-purple-600" />
            <h4 className="text-xl font-black text-purple-700 dark:text-purple-300">📊 Rankings</h4>
            <p className="text-purple-600 dark:text-purple-400 mt-2">Compara-te com outros!</p>
          </div>
        </div>
        </Link>

        {/* Histórico */}
        <Link href={`/dashboard/history?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 h-full">
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <h4 className="text-xl font-black text-blue-700 dark:text-blue-300">📋 Histórico</h4>
            <p className="text-blue-600 dark:text-blue-400 mt-2">Vê o que já fizeste!</p>
          </div>
        </div>
        </Link>
      </div>
        </div>
      </div>
    </div>
  )
}
