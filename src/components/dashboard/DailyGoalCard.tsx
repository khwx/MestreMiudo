"use client"

import { useState, useMemo, useTransition } from "react"
import { Target, CheckCircle2, Pencil, Save, X } from "lucide-react"
import { setDailyGoalAction } from "@/app/actions"
import { getDailyGoalProgress } from "@/lib/daily-goal"

interface DailyGoalCardProps {
  name: string
  target: number
  quizzesToday: number
}

export function DailyGoalCard({ name, target, quizzesToday }: DailyGoalCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(target || 3))
  const [currentTarget, setCurrentTarget] = useState(target)
  const [isPending, startTransition] = useTransition()

  const progress = useMemo(
    () => getDailyGoalProgress(quizzesToday, currentTarget),
    [quizzesToday, currentTarget]
  )

  function handleSave() {
    const next = Number.parseInt(draft, 10)
    if (!Number.isFinite(next) || next < 1) return
    startTransition(async () => {
      const saved = await setDailyGoalAction(name, next)
      if (saved != null) setCurrentTarget(saved)
      setEditing(false)
    })
  }

  return (
    <div className="card-kid border-4 border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-amber-200 dark:bg-amber-800/40">
              {progress.achieved ? (
                <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-300" />
              ) : (
                <Target className="h-7 w-7 text-amber-600 dark:text-amber-300" />
              )}
            </div>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300">
              🎯 Objetivo de hoje
            </h3>
          </div>
          {!editing && (
            <button
              type="button"
              aria-label="Definir objetivo diário"
              onClick={() => {
                setDraft(String(currentTarget || 3))
                setEditing(true)
              }}
              className="p-2 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
            >
              <Pencil className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Quizzes por dia:
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-20 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 px-3 py-1 text-center font-black text-amber-800 dark:text-amber-200"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="btn-kid flex items-center gap-1 border-2 border-amber-300 px-3 py-1 rounded-xl font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Save className="h-4 w-4" /> Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-2 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
            >
              <X className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-3xl font-black text-amber-800 dark:text-amber-200 mb-2">
              {progress.done}/{progress.target}{" "}
              <span className="text-base font-bold text-gray-500 dark:text-gray-400">
                quizzes
              </span>
            </p>
            <div className="progress-kid">
              <div
                className="progress-kid-bar bg-amber-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              {progress.achieved
                ? "🎉 Consegues! Objetivo cumprido por hoje!"
                : `Faltam ${progress.remaining} quiz${progress.remaining === 1 ? "" : "zes"} para o objetivo.`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
