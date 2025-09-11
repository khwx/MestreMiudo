
'use server';

/**
 * @fileOverview Personalized learning path generator.
 *
 * This file defines a Genkit flow that tailors learning paths for children
 * based on their performance in the game. It dynamically creates quizzes
 * and challenges focused on areas where the child needs the most help.
 *
 * - personalizedLearningPath - A function that generates a personalized learning path.
 */

import {ai} from '@/ai/genkit';
import {searchImage} from '@/ai/tools/image-search';
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/ai/schemas';
import { PersonalizedLearningPathInputSchema, PersonalizedLearningPathOutputSchema } from '@/ai/schemas';


export async function personalizedLearningPath(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  tools: [searchImage],
  prompt: `You are an expert educator specializing in creating personalized quizzes for elementary school students in Portugal. The current year is 2024.

You will generate a quiz with {{{numberOfQuestions}}} questions tailored to the student's grade level ({{{gradeLevel}}}), subject ({{{subject}}}), and past performance (if available).

If performance data is available, focus on areas where the student has shown weakness (lower correctness rate). Adapt the questions to be challenging but not discouraging.

For 'Matemática' questions, you MAY use the searchImage tool to get an illustrative image, but the question MUST NOT require counting items in the photo. It should be a general knowledge question where the image provides context only (e.g., show a picture of a dog and ask "Quantas patas tem um cão?").

For other subjects that could benefit from a visual aid (like 'Estudo do Meio'), use the searchImage tool to find a suitable, clear, and simple photo-realistic image. Use one or two-word queries in Portuguese.

For sentence ordering questions ("Formação de Frases"), you MUST provide the words in the question in a jumbled, incorrect order for the student to rearrange.

Structure each question object as follows:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "The correct answer",
  "topic": "The topic of the question",
  "imageUrl": "(Optional) URL of an image from the tool"
}

Output an array of these question objects.

Here's the student's information:
- Grade Level: {{{gradeLevel}}}
- Subject: {{{subject}}}
{{#if performanceData}}
- Past Performance (topic: correctness ratio): {{{performanceData}}}
{{/if}}
`,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    outputSchema: PersonalizedLearningPathOutputSchema,
  },
  async (input, streamingCallback) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        const flowInput = {
            ...input,
            performanceData: input.performanceData ? JSON.stringify(input.performanceData, null, 2) : undefined,
        };
        const {output} = await prompt(flowInput);

        // Check if output is null or invalid, and retry if so.
        if (output) {
          return output;
        }

        // If output is null, treat it as a retriable error.
        lastError = new Error("Model returned null output.");
        retries--;
        console.log(`Model returned null output, retrying in 2 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (e: any) {
        lastError = e;
        // Also retry on overload/availability errors.
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded') || (e.cause && e.cause.message.includes('503'))) {
          retries--;
          if (retries > 0) {
            console.log(`Model is overloaded or unavailable, retrying in 2 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // It's a different, non-retriable error.
          throw e;
        }
      }
    }
    // If all retries fail, throw the last recorded error.
    console.error("All retries failed to generate quiz.");
    throw lastError;
  }
);
