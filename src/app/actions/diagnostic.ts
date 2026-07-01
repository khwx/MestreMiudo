"use server"

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateDiagnosticTest, calculateDiagnosticResults, shouldTakeDiagnosticTest } from "@/lib/diagnostic-test";

export async function generateDiagnostic(gradeLevel: 1 | 2 | 3 | 4) {
  logger.log('[DIAGNOSTIC] Generating diagnostic test...');
  return generateDiagnosticTest(gradeLevel);
}

export async function saveDiagnosticResults(
  studentId: string,
  gradeLevel: 1 | 2 | 3 | 4,
  answers: Array<{ questionIndex: number; selectedAnswer: string }>,
  correctAnswers: string[]
) {
  const results = calculateDiagnosticResults(answers, correctAnswers);
  
  logger.log('[DIAGNOSTIC] Results:', results);
  
  // Save to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('diagnostic_tests').insert({
        student_id: studentId,
        grade_level: gradeLevel,
        score: results.score,
        percentage: results.percentage,
        learning_level: results.learningLevel,
        recommendations: results.recommendations,
        created_at: new Date().toISOString(),
      });
      
      if (error) logger.error('Falha ao guardar resultados do diagnóstico:', error);
    } catch (error) {
      logger.error('Erro ao guardar resultados do diagnóstico:', error);
    }
  }
  
  return results;
}

export async function checkDiagnosticNeeded(lastDiagnosticDate?: string): Promise<boolean> {
  return shouldTakeDiagnosticTest(lastDiagnosticDate);
}