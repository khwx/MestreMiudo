
import { z } from "zod";

/**
 * @fileOverview
 * This file contains the Zod schemas and TypeScript types
 * for the personalized learning path feature. It is separate
 * from the flow definition to avoid "use server" conflicts.
 */



// Schema for the Story Generator
export const StoryGenerationInputSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student.'),
  keywords: z.string().describe('A comma-separated string of keywords provided by the user.'),
  gradeLevel: z.number().min(1).max(4).describe('The grade level of the student (1-4).'),
});


export const StoryGenerationOutputSchema = z.object({
  title: z.string().describe('The generated title of the story.'),
  story: z.string().describe('The full text of the generated story.'),
  imagePrompts: z.array(z.string()).min(0).max(3).optional().describe('An array of 0-3 short, descriptive prompts for generating illustrations for the story.'),
});
export type StoryGenerationOutput = z.infer<typeof StoryGenerationOutputSchema>;

// Note: QuizInputSchema is now in shared-schemas.ts to be used by client and server.
