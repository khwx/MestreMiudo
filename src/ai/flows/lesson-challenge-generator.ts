'use server';

import { ai } from '@/ai/genkit';
import { GenerateChallengesInputSchema, GenerateChallengesOutputSchema } from '@/app/shared-schemas';
import type { GenerateChallengesInput, GenerateChallengesOutput, LessonChallenge } from '@/app/shared-schemas';

const prompt = ai.definePrompt({
  name: 'lessonChallengeGeneratorPrompt',
  input: { schema: GenerateChallengesInputSchema },
  output: { schema: GenerateChallengesOutputSchema },
  prompt: `You are an expert elementary school teacher in Portugal creating engaging challenges for students (1º ao 4º ano).
IMPORTANT: All content MUST be in European Portuguese (Português de Portugal) and appropriate for kids.

You need to generate 4 interactive challenges based on the following lesson:
Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}º ano
Lesson Title: {{{title}}}
Learning Objective: {{{learningObjective}}}
Story Context: {{{storyContext}}}

Create 4 challenges that follow the story context and test the learning objective.
Vary the challenge types. Choose from:
1. "multiple_choice": 
   - content: { "options": ["A", "B", "C", "D"], "correct_answer": "A" }
2. "fill_blank": 
   - question should include a blank line like "_____"
   - content: { "correct_answers": ["answer1", "answer2"] } (acceptable variations)
3. "word_order":
   - content: { "correct_order": ["O", "gato", "bebe", "leite"] } (the UI will shuffle them automatically)
4. "matching":
   - content: { "correct_matches": { "Gato": "Miau", "Cão": "Au au" } }

Make sure the challenges are fun and use words related to the story context! Include an encouraging hint for each challenge.

Output ONLY a JSON object matching this schema:
{
  "challenges": [
    {
      "challenge_type": "multiple_choice",
      "question": "Question text",
      "content": { ... },
      "hint": "Hint text"
    }
  ]
}`
});

export const generateLessonChallengesFlow = ai.defineFlow(
  {
    name: 'generateLessonChallengesFlow',
    inputSchema: GenerateChallengesInputSchema,
    outputSchema: GenerateChallengesOutputSchema,
  },
  async (input) => {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        const { output } = await prompt(input);

        if (!output || !output.challenges || output.challenges.length === 0) {
          throw new Error('Invalid or empty challenge generation output');
        }

        // Add indices
        const formattedChallenges = output.challenges.map((c: any, index: number) => ({
          ...c,
          challenge_index: index,
        }));

        return { challenges: formattedChallenges };
      } catch (error) {
        console.error(`Challenge generation attempt failed (${retries} retries left):`, error);
        lastError = error;
        retries--;
        
        if (retries === 0) {
          throw new Error(`Failed to generate challenges after 3 attempts. Last error: ${lastError.message}`);
        }
      }
    }
    
    throw lastError;
  }
);

export async function generateLessonChallenges(input: GenerateChallengesInput): Promise<GenerateChallengesOutput> {
  return generateLessonChallengesFlow(input);
}
