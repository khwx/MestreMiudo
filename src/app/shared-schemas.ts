
import { z } from 'zod';

export const QuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
  numberOfQuestions: z.number().min(5).max(20).default(5),
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

export const AnswerSchema = z.object({
  question: z.string(),
  selectedAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  topic: z.string(),
});
export type Answer = z.infer<typeof AnswerSchema>;

export const QuizResultSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.number(),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
  numberOfQuestions: z.number(),
  timestamp: z.string(),
  quiz: z.any(),
  answers: z.array(AnswerSchema),
  score: z.number(),
});
export type QuizResultEntry = z.infer<typeof QuizResultSchema>;

export const SaveQuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
  numberOfQuestions: z.number().min(5).max(20).default(5),
  answers: z.array(AnswerSchema),
  quiz: z.any(),
  score: z.number(),
});
export type SaveQuizInput = z.infer<typeof SaveQuizInputSchema>;

export const StoryGenerationInputSchema = z.object({
    keywords: z.string().describe('A comma-separated string of keywords provided by the user.'),
    gradeLevel: z.number().min(1).max(4).describe('The grade level of the student (1-4).'),
});
export type StoryGenerationInput = z.infer<typeof StoryGenerationInputSchema>;

export const SpeechMarkSchema = z.object({
  type: z.string(),
  value: z.string(),
  time: z.object({
    seconds: z.string(),
    nanos: z.number(),
  }),
});
export type SpeechMark = z.infer<typeof SpeechMarkSchema>;
