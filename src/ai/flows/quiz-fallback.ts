'use server';

/**
 * @fileOverview Quiz generation with fallback to Groq when Gemini fails.
 * 
 * This module implements a smart fallback mechanism:
 * 1. Try Gemini first (primary)
 * 2. If fails or rate limited, try Groq (fallback)
 * 3. Return questions or throw error
 */

import { personalizedLearningPath } from './personalized-learning-paths';
import { generateQuizWithGroq } from './groq-fallback';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';

export async function generateQuizWithFallback(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  try {
    // Try Gemini first
    console.log('Attempting to generate quiz with Gemini...');
    const result = await personalizedLearningPath(input);
    console.log('Quiz generated successfully with Gemini');
    return result;
  } catch (error: any) {
    // Check if it's a retriable error (rate limit, quota, etc.)
    const isRateLimitError = 
      error?.message?.includes('429') ||
      error?.message?.includes('rate limit') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('503') ||
      error?.message?.includes('overloaded') ||
      error?.message?.includes('Service Unavailable') ||
      error?.message?.includes('模型已超') ||
      error?.message?.includes('model is overloaded');

    if (isRateLimitError) {
      console.log('Gemini rate limited or unavailable, falling back to Groq...');
      
      // Check if Groq API key is available
      if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not configured, cannot fallback');
        throw new Error('API temporariamente indisponível. Por favor tenta novamente mais tarde.');
      }
      
      try {
        const groqResult = await generateQuizWithGroq(input);
        console.log('Quiz generated successfully with Groq fallback');
        return groqResult;
      } catch (groqError: any) {
        console.error('Groq also failed:', groqError);
        throw new Error('Serviço temporariamente indisponível. Por favor tenta novamente mais tarde.');
      }
    }

    // Non-retriable error, throw original
    console.error('Non-retriable error from Gemini:', error);
    throw error;
  }
}
