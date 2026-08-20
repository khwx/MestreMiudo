"use client"

import Link from "next/link"
import { Brain, Target, Flame, Lightbulb, BookOpen, RefreshCw } from "lucide-react"
import type { StudyRecommendation, RecommendationAction } from "@/lib/study-recommendations"

interface RecommendationsPanelProps {
  name: string
  grade: string
  recommendations: StudyRecommendation[]
}

const ICONS: Record<RecommendationTypeKey, React.ComponentType<{ className?: string }>> = {
  review: Brain,
  weakTopic: Target,
  newLesson: BookOpen,
  dailyChallenge: Flame,
  streak: Flame,
}

type RecommendationTypeKey = StudyRecommendation["type"]

const HREF: Record<RecommendationAction, (name: string, grade: string) => string> = {
  review: (n, g) => `/dashboard/review?name=${n}&grade=${g}`,
  learn: (n, g) => `/dashboard/learn?name=${n}&grade=${g}`,
  quiz: (n, g) => `/quiz/misto?name=${n}&grade=${g}`,
  challenge: (n, g) => `/dashboard/daily-challenge?name=${n}&grade=${g}`,
}

export function RecommendationsPanel({ name, grade, recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) return null

  return (
    <div className="card-kid border-4 border-violet-300 dark:border-violet-700 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-violet-200 dark:bg-violet-800/40">
            <Lightbulb className="h-7 w-7 text-violet-600 dark:text-violet-300" />
          </div>
          <h3 className="text-2xl font-black text-violet-700 dark:text-violet-300">
            💡 Sugestões para ti
          </h3>
        </div>

        <ul className="space-y-3">
          {recommendations.map((rec, index) => {
            const Icon = ICONS[rec.type]
            const href = HREF[rec.action](name, grade)
            return (
              <li key={`${rec.type}-${index}`}>
                <Link
                  href={href}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors border-2 border-transparent hover:border-violet-300 dark:hover:border-violet-600"
                >
                  <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/40 shrink-0">
                    <Icon className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-black text-violet-800 dark:text-violet-200">{rec.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{rec.description}</p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-violet-400 shrink-0" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
