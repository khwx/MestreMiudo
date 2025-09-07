
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

For questions that could benefit from a visual aid (like in 'Estudo do Meio', 'Matemática' counting, or vocabulary questions), use the searchImage tool to find a suitable photo-realistic image. Use simple, one or two-word queries in Portuguese.
When creating a question based on an image, especially for counting, you MUST carefully analyze the image content to ensure the correct answer and options are accurate.

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
- Performance Data: {{{performanceData}}}
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
        return output!;
      } catch (e: any) {
        lastError = e;
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded') || (e.cause && e.cause.message.includes('503'))) {
          retries--;
          if (retries > 0) {
            console.log(`Model is overloaded or unavailable, retrying in 2 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // It's a different error, so we don't retry.
          throw e;
        }
      }
    }
    // If all retries fail, throw the last error.
    console.error("All retries failed to generate quiz.");
    throw lastError;
  }
);
