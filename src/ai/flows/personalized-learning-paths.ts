
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
import type { PersonalizedLearningPathInput, PersonalizedLearningPathOutput } from '@/app/shared-schemas';
import { PersonalizedLearningPathInputSchema, PersonalizedLearningPathOutputSchema } from '@/app/shared-schemas';


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

IMPORTANT: All questions and answers must be in European Portuguese (Português de Portugal). Do not use Brazilian Portuguese terms. For example, use "põe ovos" instead of "bota ovos".

You will generate a quiz with {{{numberOfQuestions}}} questions tailored to the student's grade level ({{{gradeLevel}}}).

{{#if subject}}
The quiz will be for the subject: {{{subject}}}.
{{else}}
This is a "Surprise Quiz", so you should generate questions from a mix of all available subjects: 'Português', 'Matemática', and 'Estudo do Meio'. Ensure a good variety between the subjects.
{{/if}}


If performance data is available, focus on areas where the student has shown weakness (lower correctness rate). Adapt the questions to be challenging but not discouraging.

For 'Matemática' questions, you MAY use the searchImage tool to get an illustrative image, but the question MUST NOT require counting items in the photo. It should be a general knowledge question where the image provides context only (e.g., show a picture of a dog and ask "Quantas patas tem um cão?").

For other subjects that could benefit from a visual aid (like 'Estudo do Meio'), use the searchImage tool to find a suitable, clear, and simple photo-realistic image. Use one or two-word queries in Portuguese. The image must be appropriate for a child.

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
{{#if performanceData}}
- Past Performance (topic: correctness ratio): {{{performanceData}}}
{{/if}}
`,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    // The output schema is now validated manually inside the flow
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
            // Handle case where performanceData might come back as stringified JSON
            let parsedPerformanceData = input.performanceData;
            if (typeof input.performanceData === 'string') {
              try {
                parsedPerformanceData = JSON.parse(input.performanceData);
              } catch (e) {
                console.warn('Failed to parse performanceData as JSON:', e);
                parsedPerformanceData = null; // fallback to null on parse error
              }
            }
            
            const flowInput = {
              studentId: input.studentId,
              gradeLevel: input.gradeLevel,
              numberOfQuestions: input.numberOfQuestions,
              subject: input.subject,
              performanceData: parsedPerformanceData,
            };
        
        // Get raw output without immediate validation
        const {output} = await prompt(flowInput);

        // Manually validate and check if output is null or invalid, and retry if so.
        if (output && output.quizQuestions && output.quizQuestions.length > 0) {
          const validatedOutput = PersonalizedLearningPathOutputSchema.parse(output);
          return validatedOutput;
        }

        // If output is null, treat it as a retriable error.
        lastError = new Error("Model returned null or empty output.");
        retries--;
        if (retries > 0) {
          console.log(`Model returned null output, retrying in 2 seconds... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (e: any) {
        lastError = e;
        // Also retry on overload/availability errors.
        if (e.message.includes('503 Service Unavailable') || e.message.includes('overloaded') || (e.cause && e.cause.message.includes('503')) || e.name === 'ZodError') {
          retries--;
          if (retries > 0) {
            console.log(`Model error or validation failed, retrying in 2 seconds... (${retries} attempts left)`, e);
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
