export interface DailyGoalProgress {
  done: number
  target: number
  remaining: number
  achieved: boolean
  percentage: number
}

export interface QuizTimestampEntry {
  timestamp: string
}

export function getTodayDateStr(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function countQuizzesOnDate(
  history: QuizTimestampEntry[],
  dateStr: string
): number {
  return history.filter((entry) => {
    const entryDate = entry.timestamp?.slice(0, 10)
    return entryDate === dateStr
  }).length
}

export function getDailyGoalProgress(
  quizzesToday: number,
  target: number
): DailyGoalProgress {
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 0
  const done = Math.max(0, quizzesToday)
  const remaining = Math.max(0, safeTarget - done)
  const achieved = safeTarget > 0 && done >= safeTarget
  const percentage =
    safeTarget <= 0 ? 0 : Math.min(100, Math.round((done / safeTarget) * 100))

  return { done, target: safeTarget, remaining, achieved, percentage }
}
