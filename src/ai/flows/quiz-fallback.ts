'use server';

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
  console.log('[FALLBACK] Attempting to generate quiz with Gemini...');
  
  try {
    const result = await personalizedLearningPath(input);
    console.log('[FALLBACK] Quiz generated successfully with Gemini');
    return result;
  } catch (geminiError: any) {
    console.warn('[FALLBACK] Gemini failed, error:', geminiError?.message || geminiError);
    
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('[FALLBACK] GROQ_API_KEY not configured');
      throw new Error('API temporariamente indisponível. Por favor tenta novamente mais tarde.');
    }
    
    console.log('[FALLBACK] Trying Groq as fallback...');
    
    try {
      const groqResult = await generateQuizWithGroq(input);
      console.log('[FALLBACK] Quiz generated successfully with Groq');
      return groqResult;
    } catch (groqError: any) {
      console.error('[FALLBACK] Groq also failed:', groqError);
      throw new Error('Serviço temporariamente indisponível. Por favor tenta novamente mais tarde.');
    }
  }
}
