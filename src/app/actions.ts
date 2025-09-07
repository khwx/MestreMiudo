"use server"

import { personalizedLearningPath, type PersonalizedLearningPathOutput } from "@/ai/flows/personalized-learning-paths";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';

const QuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio']),
  performanceData: z.record(z.string(), z.number()).optional(),
  numberOfQuestions: z.number().min(5).max(20).default(5),
});

type QuizInput = z.infer<typeof QuizInputSchema>;

async function saveQuiz(input: QuizInput, output: PersonalizedLearningPathOutput) {
  const filePath = path.join(process.cwd(), 'quiz-history.json');
  const newEntry = {
    timestamp: new Date().toISOString(),
    ...input,
    quiz: output,
  };

  try {
    let history = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      history = JSON.parse(data);
    } catch (error: any) {
      if (error.code !== 'ENOENT') { // Ignore "file not found" error
        console.error('Error reading quiz history:', error);
      }
    }
    history.push(newEntry);
    await fs.writeFile(filePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving quiz:', error);
  }
}

export async function generateQuiz(input: QuizInput): Promise<PersonalizedLearningPathOutput> {
  const validatedInput = QuizInputSchema.parse(input);
  const quizOutput = await personalizedLearningPath(validatedInput);
  
  if (quizOutput.quizQuestions.length > 0) {
    await saveQuiz(validatedInput, quizOutput);
  }
  
  return quizOutput;
}
