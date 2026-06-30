'use server';
import { logger } from "@/lib/logger";

/**
 * @fileOverview Quiz generation with fallback to Groq when Gemini fails.
 * 
 * This module implements a smart fallback mechanism:
 * 1. Try Gemini first (primary)
 * 2. If fails for ANY reason, try Groq (fallback)
 * 3. Return questions or throw error
 */

import { personalizedLearningPath } from './personalized-learning-paths';
import { generateQuizWithGroq } from './groq-fallback';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';

export async function generateQuizWithFallback(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  // Try Gemini first
  logger.log('[FALLBACK] Attempting to generate quiz with Gemini...');
  
  try {
    const result = await personalizedLearningPath(input);
    logger.log('[FALLBACK] Quiz generated successfully with Gemini');
    return result;
  } catch (geminiError: unknown) {
    const error = geminiError instanceof Error ? geminiError : new Error(String(geminiError));
    logger.warn('[FALLBACK] Gemini failed, error:', error.message || geminiError);
    
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      logger.error('[FALLBACK] GROQ_API_KEY not configured');
      throw new Error('API temporariamente indisponível. Por favor tenta novamente mais tarde.');
    }
    
    logger.log('[FALLBACK] Trying Groq as fallback...');
    
    try {
      const groqResult = await generateQuizWithGroq(input);
      logger.log('[FALLBACK] Quiz generated successfully with Groq');
      return groqResult;
    } catch (groqError: unknown) {
      logger.error('[FALLBACK] Groq also failed:', groqError);
      throw new Error('Serviço temporariamente indisponível. Por favor tenta novamente mais tarde.');
    }
  }
}
