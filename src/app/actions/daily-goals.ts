"use server"

import { logger } from "@/lib/logger"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

const DEFAULT_TARGET = 3

export async function getDailyGoalAction(name: string): Promise<number | null> {
  if (!name) return null
  if (!isSupabaseConfigured() || !supabase) return null

  try {
    const { data, error } = await supabase
      .from("daily_goals")
      .select("target_quizzes")
      .eq("student_name", name)
      .maybeSingle()

    if (error) {
      logger.error("Erro ao obter objetivo diário:", error)
      return null
    }

    return data ? (data.target_quizzes as number) : DEFAULT_TARGET
  } catch (error) {
    logger.error("Erro ao obter objetivo diário:", error)
    return null
  }
}

export async function setDailyGoalAction(
  name: string,
  target: number
): Promise<number | null> {
  if (!name) return null
  const safeTarget = Math.max(1, Math.min(20, Math.round(target || DEFAULT_TARGET)))

  if (!isSupabaseConfigured() || !supabase) return safeTarget

  try {
    const { data, error } = await supabase
      .from("daily_goals")
      .upsert(
        { student_name: name, target_quizzes: safeTarget, updated_at: new Date().toISOString() },
        { onConflict: "student_name" }
      )
      .select("target_quizzes")
      .single()

    if (error) {
      logger.error("Erro ao definir objetivo diário:", error)
      return null
    }

    return data?.target_quizzes as number
  } catch (error) {
    logger.error("Erro ao definir objetivo diário:", error)
    return null
  }
}
