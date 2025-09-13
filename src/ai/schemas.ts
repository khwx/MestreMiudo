
import { z } from "zod";

/**
 * @fileOverview
 * This file contains the Zod schemas and TypeScript types
 * for the personalized learning path feature. It is separate
 * from the flow definition to avoid "use server" conflicts.
 */

export const PersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student.'),
  gradeLevel: z
    .number()
    .min(1)
    .max(4)
    .describe('The grade level of the student (1-4).'),
  subject: z
    .enum(['Português', 'Matemática', 'Estudo do Meio'])
    .optional()
    .describe('The subject for which to generate the learning path. If omitted, a mixed quiz will be generated.'),
  performanceData: z
    .record(z.number())
    .nullable()
    .optional()
    .describe(
      'Optional record of the student performance on previous quizzes, where keys are topics and values are the correctness rate (0-1).'
    ),
  numberOfQuestions: z
    .number()
    .min(5)
    .max(20)
    .default(10)
    .describe('The number of questions for which to generate the learning path.'),
});
export type PersonalizedLearningPathInput = z.infer<
  typeof PersonalizedLearningPathInputSchema
>;

export const PersonalizedLearningPathOutputSchema = z.object({
  quizQuestions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      topic: z.string().describe('The topic of the question'),
      imageUrl: z.string().url().optional().describe('An optional image URL for the question.'),
    })
  ).describe('An array of quiz questions tailored to the student.'),
});
export type PersonalizedLearningPathOutput = z.infer<
  typeof PersonalizedLearningPathOutputSchema
>;

export const QuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']).optional(),
  numberOfQuestions: z.number().min(5).max(20).default(5),
});


// Schema for the Story Generator
export const StoryGenerationInputSchema = z.object({
    keywords: z.string().describe('A comma-separated string of keywords provided by the user.'),
    gradeLevel: z.number().min(1).max(4).describe('The grade level of the student (1-4).'),
});
export type StoryGenerationInput = z.infer<typeof StoryGenerationInputSchema>;

export const StoryGenerationOutputSchema = z.object({
    title: z.string().describe('The generated title of the story.'),
    story: z.string().describe('The full text of the generated story.'),
    imagePrompts: z.array(z.string()).describe('An array of 3 short, descriptive prompts for generating illustrations for the story.'),
});
export type StoryGenerationOutput = z.infer<typeof StoryGenerationOutputSchema>;
