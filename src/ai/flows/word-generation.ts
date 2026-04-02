
'use server';

/**
 * @fileOverview Word generation for games.
 *
 * This file defines a Genkit flow that generates words for games like Hangman,
 * complete with hints, based on specified categories and difficulty levels.
 * Includes Supabase caching to reduce API usage.
 *
 * - generateWord - A function that generates a word and a hint.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Schema for the input of the word generation flow
const WordGenerationInputSchema = z.object({
  category: z.string().describe('The category for the word (e.g., Animais, Frutas, Países).'),
  difficulty: z.enum(['Fácil', 'Médio', 'Difícil']).describe('The difficulty level, which influences word length and complexity.'),
});
export type WordGenerationInput = z.infer<typeof WordGenerationInputSchema>;


// Schema for the output of the word generation flow
const WordGenerationOutputSchema = z.object({
  word: z.string().describe('The generated word in Portuguese.'),
  hint: z.string().describe('A simple hint for the generated word.'),
});
export type WordGenerationOutput = z.infer<typeof WordGenerationOutputSchema>;


// Try to get a cached word from Supabase
async function getCachedWord(category: string, difficulty: string): Promise<WordGenerationOutput | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('words')
      .select('word, hint')
      .eq('category', category)
      .eq('difficulty', difficulty);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Pick a random word from cached options
    const randomIndex = Math.floor(Math.random() * data.length);
    return { word: data[randomIndex].word, hint: data[randomIndex].hint };
  } catch (error) {
    console.error('Failed to get cached word:', error);
    return null;
  }
}

// Cache a generated word in Supabase
async function cacheWord(category: string, difficulty: string, word: string, hint: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    // Check for duplicates first
    const { data: existing } = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .eq('category', category)
      .limit(1);

    if (existing && existing.length > 0) return; // Already cached

    const { error } = await supabase.from('words').insert({
      category,
      difficulty,
      word,
      hint,
    });

    if (error) console.error('Failed to cache word:', error);
  } catch (error) {
    console.error('Error caching word:', error);
  }
}


export async function generateWord(input: WordGenerationInput): Promise<WordGenerationOutput> {
  // Try cache first
  const cached = await getCachedWord(input.category, input.difficulty);
  if (cached) {
    console.log(`[Cache HIT] Word for category=${input.category}, difficulty=${input.difficulty}`);
    return cached;
  }

  console.log(`[Cache MISS] Generating word via AI for category=${input.category}, difficulty=${input.difficulty}`);
  const result = await generateWordFlow(input);

  // Cache the result (non-blocking)
  cacheWord(input.category, input.difficulty, result.word, result.hint)
    .catch(err => console.error('Background word caching failed:', err));

  return result;
}


const prompt = ai.definePrompt({
  name: 'wordGenerationPrompt',
  input: { schema: WordGenerationInputSchema },
  output: { schema: WordGenerationOutputSchema },
  prompt: `You are an AI that generates single words in Portuguese for a children's hangman game.

The current year is 2024.

Generate a single, appropriate word and a corresponding simple hint based on the following criteria:
- Category: {{{category}}}
- Difficulty: {{{difficulty}}}

The word must not contain numbers or special characters, other than Portuguese accents. It should be a single word.
The hint should be short and easy for a child to understand.

Example:
Input: { category: "Animais", difficulty: "Fácil" }
Output: { word: "GATO", hint: "É um animal que mia e gosta de caçar ratos." }

Input: { category: "Frutas", difficulty: "Fácil" }
Output: { word: "MAÇÃ", hint: "É uma fruta vermelha ou verde que a Branca de Neve comeu." }
`,
});

const generateWordFlow = ai.defineFlow(
  {
    name: 'generateWordFlow',
    inputSchema: WordGenerationInputSchema,
    outputSchema: WordGenerationOutputSchema,
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        
        if (output?.word && output.hint) {
          // Basic validation to ensure it's a single word without spaces
          if (output.word.trim().split(' ').length === 1) {
            return output;
          }
        }

        lastError = new Error("Model returned invalid output (e.g., multiple words).");
        retries--;
        
      } catch (e: any) {
        lastError = e;
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded')) {
          retries--;
          if (retries > 0) {
            console.log(`Word generation model is overloaded, retrying in 2 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // Non-retriable error
          throw e;
        }
      }
    }
    console.error("All retries failed to generate a word.");
    throw lastError;
  }
);
