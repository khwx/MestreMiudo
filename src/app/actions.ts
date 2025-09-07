"use server"

import { personalizedLearningPath, type PersonalizedLearningPathOutput } from "@/ai/flows/personalized-learning-paths";
import { z } from "zod";

const QuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio']),
  performanceData: z.record(z.string(), z.number()).optional(),
  numberOfQuestions: z.number().min(5).max(20).default(5),
});

export async function generateQuiz(input: z.infer<typeof QuizInputSchema>): Promise<PersonalizedLearningPathOutput> {
  const validatedInput = QuizInputSchema.parse(input);
  return await personalizedLearningPath(validatedInput);
}
