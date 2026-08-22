import { describe, it, expect } from "vitest"
import {
  REVIEW_REMINDER_COOLDOWN_MS,
  buildReviewReminder,
  shouldShowReviewReminder,
} from "@/lib/review-reminder"

describe("shouldShowReviewReminder", () => {
  it("não mostra quando não há revisões pendentes", () => {
    expect(shouldShowReviewReminder({ dueCount: 0, lastNotifiedAt: null, now: 1000 })).toBe(false)
  })

  it("mostra imediatamente na primeira vez (sem lastNotifiedAt)", () => {
    expect(shouldShowReviewReminder({ dueCount: 3, lastNotifiedAt: null, now: 1000 })).toBe(true)
  })

  it("não mostra dentro do período de cooldown", () => {
    const last = 1000
    const now = last + REVIEW_REMINDER_COOLDOWN_MS - 1
    expect(shouldShowReviewReminder({ dueCount: 3, lastNotifiedAt: last, now })).toBe(false)
  })

  it("mostra exatamente no fim do cooldown", () => {
    const last = 1000
    const now = last + REVIEW_REMINDER_COOLDOWN_MS
    expect(shouldShowReviewReminder({ dueCount: 3, lastNotifiedAt: last, now })).toBe(true)
  })

  it("respeita um cooldown personalizado", () => {
    const last = 1000
    const cooldownMs = 5000
    expect(shouldShowReviewReminder({ dueCount: 2, lastNotifiedAt: last, now: last + 4999, cooldownMs })).toBe(false)
    expect(shouldShowReviewReminder({ dueCount: 2, lastNotifiedAt: last, now: last + 5000, cooldownMs })).toBe(true)
  })
})

describe("buildReviewReminder", () => {
  it("devolve conteúdo vazio quando não há revisões", () => {
    expect(buildReviewReminder(0)).toEqual({ title: "", body: "" })
  })

  it("usa forma singular para 1 pergunta", () => {
    const content = buildReviewReminder(1)
    expect(content.title).toContain("rever")
    expect(content.body).toContain("1 pergunta")
    expect(content.body).not.toContain("s.")
  })

  it("usa forma plural para múltiplas perguntas", () => {
    const content = buildReviewReminder(5)
    expect(content.body).toContain("5 perguntas")
    expect(content.body).toContain("pendentes.")
  })
})
