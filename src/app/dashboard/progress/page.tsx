"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Target } from "lucide-react"
import { getWeeklyProgress, getSubjectPerformance, getTopicAnalysis, getLearningTrend, generateStudyRecommendations } from "@/lib/analytics"
import { getFullQuizHistory } from "@/app/actions"
import { logger } from "@/lib/logger";

interface DailyScore {
  date: string
  score: number
  totalQuestions: number
}

interface SubjectPerf {
  subject: string
  averageScore: number
  totalQuizzes: number
}

interface TopicPerf {
  topic: string
  averageScore: number
  totalAttempts: number
  status: "strong" | "weak"
}

interface LearningTrend {
  trend: "improving" | "declining" | "stable"
  recentAverage: number
  olderAverage: number
  changePercent: number
}

interface StudyRecommendation {
  topic: string
  priority: "high" | "medium" | "low"
  suggestion: string
}

const subjectIcons: Record<string, string> = {
  Português: "📖",
  Matemática: "🧮",
  "Estudo do Meio": "🌍",
}

const subjectColors: Record<string, string> = {
  Português: "from-green-400 to-emerald-500",
  Matemática: "from-blue-400 to-indigo-500",
  "Estudo do Meio": "from-orange-400 to-amber-500",
}

const subjectBorderColors: Record<string, string> = {
  Português: "border-green-300 dark:border-green-700",
  Matemática: "border-blue-300 dark:border-blue-700",
  "Estudo do Meio": "border-orange-300 dark:border-orange-700",
}

const levelThresholds = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 300 },
  { level: 4, points: 600 },
  { level: 5, points: 1000 },
  { level: 6, points: 1500 },
]

function calculateLevel(totalPoints: number) {
  let currentLevel = 1
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i].points) {
      currentLevel = levelThresholds[i].level
      break
    }
  }
  return currentLevel
}

export default function ProgressPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "Amigo"
  const grade = searchParams.get("grade") || "1"

  const [weeklyProgress, setWeeklyProgress] = useState<DailyScore[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerf[]>([])
  const [topicAnalysis, setTopicAnalysis] = useState<TopicPerf[]>([])
  const [learningTrend, setLearningTrend] = useState<LearningTrend>({ trend: "stable", recentAverage: 0, olderAverage: 0, changePercent: 0 })
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([])
  const [totalQuizzes, setTotalQuizzes] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!name) return

    const loadData = async () => {
      try {
        const history = await getFullQuizHistory(name)
        const quizHistory = history || []

        const pts = quizHistory.reduce((acc, h) => acc + h.score * 10, 0)
        setTotalPoints(pts)

        const avg = quizHistory.length > 0
          ? Math.round(quizHistory.reduce((acc, h) => acc + (h.score / h.numberOfQuestions) * 100, 0) / quizHistory.length)
          : 0
        setTotalQuizzes(quizHistory.length)
        setAverageScore(avg)

        const studentId = name
        const [weekly, subjects, topics, trend, recs] = await Promise.all([
          getWeeklyProgress(studentId),
          getSubjectPerformance(studentId),
          getTopicAnalysis(studentId),
          getLearningTrend(studentId),
          generateStudyRecommendations(studentId),
        ])

        setWeeklyProgress(weekly)
        setSubjectPerformance(subjects)
        setTopicAnalysis(topics)
        setLearningTrend(trend)
        setRecommendations(recs)

        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = d.toLocaleDateString("pt-PT")
          const hasQuiz = quizHistory.some((h) => new Date(h.timestamp).toLocaleDateString("pt-PT") === dateStr)
          if (hasQuiz) streak++
          else break
        }
        setCurrentStreak(streak)
      } catch (err) {
        logger.error("Erro ao carregar progresso:", err);
        setError("Não foi possível carregar os teus dados de progresso.");
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [name])

  const level = useMemo(() => calculateLevel(totalPoints), [totalPoints])

  const maxBarScore = useMemo(() => {
    const max = Math.max(...weeklyProgress.map((d) => d.score), 1)
    return max
  }, [weeklyProgress])

  const strongTopics = useMemo(() => topicAnalysis.filter((t) => t.status === "strong").sort((a, b) => b.averageScore - a.averageScore).slice(0, 5), [topicAnalysis])
  const weakTopics = useMemo(() => topicAnalysis.filter((t) => t.status === "weak").sort((a, b) => a.averageScore - b.averageScore).slice(0, 5), [topicAnalysis])

  const trendIcon = learningTrend.trend === "improving" ? <TrendingUp className="h-5 w-5 text-green-500" /> : learningTrend.trend === "declining" ? <TrendingDown className="h-5 w-5 text-red-500" /> : <Minus className="h-5 w-5 text-gray-400" />
  const trendLabel = learningTrend.trend === "improving" ? "A melhorar" : learningTrend.trend === "declining" ? "A piorar" : "Estável"
  const trendColor = learningTrend.trend === "improving" ? "text-green-600 dark:text-green-400" : learningTrend.trend === "declining" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"

  const nextObjectives = useMemo(() => {
    const objectives: { label: string; done: boolean; current: number; target: number }[] = []
    objectives.push({ label: "Fazer 10 quizzes no total", done: totalQuizzes >= 10, current: totalQuizzes, target: 10 })
    objectives.push({ label: "Completar 3 quizzes de Português", done: (subjectPerformance.find((s) => s.subject === "Português")?.totalQuizzes || 0) >= 3, current: subjectPerformance.find((s) => s.subject === "Português")?.totalQuizzes || 0, target: 3 })
    objectives.push({ label: "Completar 3 quizzes de Matemática", done: (subjectPerformance.find((s) => s.subject === "Matemática")?.totalQuizzes || 0) >= 3, current: subjectPerformance.find((s) => s.subject === "Matemática")?.totalQuizzes || 0, target: 3 })
    objectives.push({ label: "Completar 3 quizzes de Estudo do Meio", done: (subjectPerformance.find((s) => s.subject === "Estudo do Meio")?.totalQuizzes || 0) >= 3, current: subjectPerformance.find((s) => s.subject === "Estudo do Meio")?.totalQuizzes || 0, target: 3 })
    objectives.push({ label: "Atingir média geral de 80%", done: averageScore >= 80, current: averageScore, target: 80 })
    objectives.push({ label: "Streak de 7 dias", done: currentStreak >= 7, current: currentStreak, target: 7 })
    return objectives
  }, [totalQuizzes, subjectPerformance, averageScore, currentStreak])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-white/50 dark:bg-gray-700/50 w-10 h-10"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card-kid border-4 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-kid border-4 border-purple-300 dark:border-purple-700 animate-pulse">
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Erro ao carregar dados</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">{error}</p>
          <Link href={`/dashboard?name=${name}&grade=${grade}`}>
            <div className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors">
              Voltar ao Dashboard
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard?name=${name}&grade=${grade}`}>
            <div className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </Link>
          <div className="text-center flex-1">
            <div className="text-5xl animate-bounce">📊</div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
              Progresso de {name}
            </h1>
          </div>
        </div>

        {/* Desempenho Geral */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total de Quizzes", value: totalQuizzes, icon: "📝", color: "from-blue-400 to-blue-600" },
            { label: "Média Geral", value: `${averageScore}%`, icon: "🎯", color: "from-green-400 to-emerald-500" },
            { label: "Pontos Totais", value: totalPoints, icon: "⭐", color: "from-yellow-400 to-amber-500" },
            { label: "Streak Atual", value: `${currentStreak} dias`, icon: "🔥", color: "from-orange-400 to-red-500" },
            { label: "Nível", value: level, icon: "🏆", color: "from-purple-400 to-pink-500" },
          ].map((stat) => (
            <div key={stat.label} className="card-kid border-4 border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`bg-gradient-to-r ${stat.color} p-3`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Evolução Semanal */}
        <div className="card-kid border-4 border-purple-300 dark:border-purple-700">
          <div className="p-6">
            <h2 className="text-2xl font-black text-purple-700 dark:text-purple-300 mb-6 flex items-center gap-2">
              📈 Evolução Semanal
            </h2>
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyProgress.map((day, i) => {
                const dayName = new Date(day.date.split("/").reverse().join("-")).toLocaleDateString("pt-PT", { weekday: "short" })
                const barHeight = maxBarScore > 0 ? (day.score / maxBarScore) * 100 : 0
                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{day.score}%</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.score >= 80 ? "bg-gradient-to-t from-green-400 to-emerald-500" :
                        day.score >= 60 ? "bg-gradient-to-t from-yellow-400 to-amber-500" :
                        day.score > 0 ? "bg-gradient-to-t from-red-400 to-pink-500" :
                        "bg-gray-200 dark:bg-gray-700"
                      }`}
                      style={{ height: `${Math.max(barHeight, 4)}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">{dayName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desempenho por Disciplina */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📚 Desempenho por Disciplina
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {subjectPerformance.map((sub) => (
              <div key={sub.subject} className={`card-kid border-4 ${subjectBorderColors[sub.subject] || "border-gray-300 dark:border-gray-600"}`}>
                <div className={`bg-gradient-to-r ${subjectColors[sub.subject] || "from-gray-400 to-gray-500"} p-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{sub.subject}</h3>
                    <span className="text-4xl">{subjectIcons[sub.subject] || "📚"}</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold">Média:</span>
                    <span className={`text-2xl font-black ${sub.averageScore >= 80 ? "text-green-600 dark:text-green-400" : sub.averageScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                      {sub.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold">Quizzes feitos:</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{sub.totalQuizzes}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        sub.averageScore >= 80 ? "bg-green-500" : sub.averageScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${sub.averageScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {subjectPerformance.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-semibold">Ainda não fizeste quizzes. Começa agora!</p>
              </div>
            )}
          </div>
        </div>

        {/* Tendência de Aprendizagem */}
        <div className="card-kid border-4 border-indigo-300 dark:border-indigo-700">
          <div className="p-6">
            <h2 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
              📉 Tendência de Aprendizagem
            </h2>
            <div className="flex items-center gap-4">
              {trendIcon}
              <div>
                <p className={`text-xl font-bold ${trendColor}`}>{trendLabel}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Média recente: <span className="font-bold">{learningTrend.recentAverage}%</span>
                  {learningTrend.olderAverage > 0 && (
                    <span className="ml-2">
                      (anterior: {learningTrend.olderAverage}%, variação: {learningTrend.changePercent > 0 ? "+" : ""}{learningTrend.changePercent}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tópicos Fortes e Fracos */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-kid border-4 border-green-300 dark:border-green-700">
            <div className="p-6">
              <h2 className="text-xl font-black text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                💪 Tópicos Fortes
              </h2>
              {strongTopics.length > 0 ? (
                <ul className="space-y-3">
                  {strongTopics.map((t) => (
                    <li key={t.topic} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <span className="font-semibold text-gray-800 dark:text-white">{t.topic}</span>
                      <span className="text-green-600 dark:text-green-400 font-black">{t.averageScore}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Ainda não há dados suficientes.</p>
              )}
            </div>
          </div>

          <div className="card-kid border-4 border-red-300 dark:border-red-700">
            <div className="p-6">
              <h2 className="text-xl font-black text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                ⚠️ Tópicos Fracos
              </h2>
              {weakTopics.length > 0 ? (
                <ul className="space-y-3">
                  {weakTopics.map((t) => (
                    <li key={t.topic} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                      <span className="font-semibold text-gray-800 dark:text-white">{t.topic}</span>
                      <span className="text-red-600 dark:text-red-400 font-black">{t.averageScore}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 dark:text-green-400 text-center py-4 font-semibold">Excelente! Nenhum tópico fraco encontrado. 🎉</p>
              )}
            </div>
          </div>
        </div>

        {/* Próximos Objetivos */}
        <div className="card-kid border-4 border-amber-300 dark:border-amber-700">
          <div className="p-6">
            <h2 className="text-2xl font-black text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
              🎯 Próximos Objetivos
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {nextObjectives.map((obj) => (
                <div key={obj.label} className={`flex items-center gap-3 p-3 rounded-xl ${obj.done ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                  <span className="text-2xl">{obj.done ? "✅" : "⬜"}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${obj.done ? "text-green-700 dark:text-green-300 line-through" : "text-gray-800 dark:text-white"}`}>{obj.label}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${obj.done ? "bg-green-500" : "bg-amber-500"}`}
                        style={{ width: `${Math.min(100, (obj.current / obj.target) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{obj.current}/{obj.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="card-kid border-4 border-cyan-300 dark:border-cyan-700">
          <div className="p-6">
            <h2 className="text-2xl font-black text-cyan-700 dark:text-cyan-300 mb-4 flex items-center gap-2">
              💡 Recomendações de Estudo
            </h2>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.topic} className={`p-4 rounded-xl border-l-4 ${
                    rec.priority === "high" ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
                    rec.priority === "medium" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" :
                    "border-green-500 bg-green-50 dark:bg-green-900/20"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="font-bold text-gray-800 dark:text-white">{rec.topic}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rec.priority === "high" ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200" :
                        rec.priority === "medium" ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" :
                        "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                      }`}>
                        {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4 font-semibold">
                🎉 Nenhuma recomendação no momento. Continua assim!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
