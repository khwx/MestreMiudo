
import { z } from 'zod';

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
    .default(5)
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
      imageUrl: z.string().url().nullish().describe('An optional image URL for the question.'),
    })
  ).describe('An array of quiz questions tailored to the student.'),
});
export type PersonalizedLearningPathOutput = z.infer<
  typeof PersonalizedLearningPathOutputSchema
>;


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
