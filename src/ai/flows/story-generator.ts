
'use server';

/**
 * @fileOverview Story generator for kids.
 *
 * This file defines a Genkit flow that generates a short story
 * for children based on a few keywords they provide. It also
 * generates a title for the story.
 *
 * - generateStory - A function that generates a story.
 */

import { ai } from '@/ai/genkit';
import { StoryGenerationInputSchema, StoryGenerationOutputSchema, type StoryGenerationInput, type StoryGenerationOutput } from '@/ai/schemas';


export async function generateStory(input: StoryGenerationInput): Promise<StoryGenerationOutput> {
  return storyGeneratorFlow(input);
}


const prompt = ai.definePrompt({
  name: 'storyGeneratorPrompt',
  input: { schema: StoryGenerationInputSchema },
  output: { schema: StoryGenerationOutputSchema },
  prompt: `You are a master storyteller for children in Portugal.

The current year is 2024.

Write a short, creative, and engaging story for a child in grade {{{gradeLevel}}}. The story must be in Portuguese and appropriate for their age.

The story should be based on these keywords: {{{keywords}}}.

The story must have a clear beginning, middle, and end. It should be positive and have a simple, gentle moral or a happy resolution. Do not make it too complex.

Also, create a short, catchy title for the story.

The story should be around 150-200 words.

Example:
Input: { keywords: "gato, lua, estrelas", gradeLevel: 1 }
Output: {
  title: "O Gato que Queria Tocar na Lua",
  story: "Era uma vez um gatinho chamado Miko que adorava a noite. Ele passava horas a olhar para a lua e a sonhar em tocar-lhe. Uma noite, ele subiu ao telhado mais alto da sua casa e esticou a pata o mais que conseguiu. De repente, uma estrela cadente passou e deixou um rasto de poeira brilhante. A poeira caiu sobre Miko e ele começou a flutuar! Ele flutuou para perto da lua, disse-lhe 'olá' e depois voltou para casa, muito feliz por ter realizado o seu sonho."
}
`,
});

const storyGeneratorFlow = ai.defineFlow(
  {
    name: 'storyGeneratorFlow',
    inputSchema: StoryGenerationInputSchema,
    outputSchema: StoryGenerationOutputSchema,
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        const { output } = await prompt(input);
        
        if (output?.title && output.story) {
          return output;
        }

        lastError = new Error("Model returned invalid output (e.g., missing title or story).");
        retries--;
        
      } catch (e: any) {
        lastError = e;
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded')) {
          retries--;
          if (retries > 0) {
            console.log(`Story generation model is overloaded, retrying in 2 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // Non-retriable error
          throw e;
        }
      }
    }
    console.error("All retries failed to generate a story.");
    throw lastError;
  }
);
