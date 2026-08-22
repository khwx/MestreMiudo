export const REVIEW_REMINDER_COOLDOWN_MS = 1000 * 60 * 60 * 6
export const REVIEW_REMINDER_STORAGE_KEY = "mm_review_reminder_last"

export interface ReviewReminderInput {
  dueCount: number
  lastNotifiedAt: number | null
  now: number
  cooldownMs?: number
}

export function shouldShowReviewReminder({
  dueCount,
  lastNotifiedAt,
  now,
  cooldownMs = REVIEW_REMINDER_COOLDOWN_MS,
}: ReviewReminderInput): boolean {
  if (dueCount <= 0) return false
  if (lastNotifiedAt == null) return true
  return now - lastNotifiedAt >= cooldownMs
}

export interface ReviewReminderContent {
  title: string
  body: string
}

export function buildReviewReminder(dueCount: number): ReviewReminderContent {
  if (dueCount <= 0) {
    return { title: "", body: "" }
  }

  const label = dueCount === 1 ? "1 pergunta" : `${dueCount} perguntas`
  const plural = dueCount === 1 ? "" : "s"

  return {
    title: "📚 Hora de rever!",
    body: `Tens ${label} da revisão espaçada pendente${plural}. Passa no "Revisar" para não esqueceres!`,
  }
}
