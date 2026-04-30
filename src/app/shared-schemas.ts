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
  studentId: z.string().describe('Unique identifier for the student.'),
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

// ============================================
// Lesson-related schemas
// ============================================

export const LessonChallengeSchema = z.object({
  id: z.string().uuid().optional(),
  challenge_type: z.enum(['multiple_choice', 'fill_blank', 'word_order', 'matching']),
  question: z.string(),
  content: z.record(z.any()),
  hint: z.string().optional(),
  challenge_index: z.number().optional(),
});
export type LessonChallenge = z.infer<typeof LessonChallengeSchema>;

export const LessonSchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio']),
  grade_level: z.number().min(1).max(4),
  title: z.string(),
  description: z.string().optional(),
  learning_objective: z.string().optional(),
  story_context: z.string().optional(),
  lesson_index: z.number(),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  challenges: z.array(LessonChallengeSchema).optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const LessonCompletionSchema = z.object({
  id: z.string().uuid().optional(),
  student_id: z.string(),
  lesson_id: z.string().uuid(),
  completed: z.boolean().default(false),
  stars: z.number().min(0).max(3).default(0),
  coins_earned: z.number().default(0),
  score: z.number().min(0).max(100).optional(),
  answers: z.record(z.any()).optional(),
  completed_at: z.string().datetime().optional(),
});
export type LessonCompletion = z.infer<typeof LessonCompletionSchema>;

// ============================================
// Shop & Avatar schemas
// ============================================

export const ShopItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  item_type: z.enum(['hat', 'pet', 'background', 'animation']),
  image_url: z.string().url().optional(),
  is_available: z.boolean().default(true),
});
export type ShopItem = z.infer<typeof ShopItemSchema>;

export const UserInventorySchema = z.object({
  id: z.string().uuid().optional(),
  student_id: z.string(),
  item_id: z.string().uuid(),
  equipped: z.boolean().default(false),
  acquired_at: z.string().datetime().optional(),
});
export type UserInventory = z.infer<typeof UserInventorySchema>;