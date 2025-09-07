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

export type QuizEntry = QuizInput & {
  timestamp: string;
  quiz: PersonalizedLearningPathOutput;
}

const historyFilePath = path.join(process.cwd(), 'quiz-history.json');

async function getQuizHistory(): Promise<QuizEntry[]> {
  try {
    const data = await fs.readFile(historyFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty history
    }
    console.error('Error reading quiz history:', error);
    throw new Error('Could not read quiz history.');
  }
}

export async function getPerformanceData(studentId: string, subject: string): Promise<Record<string, number>> {
    const history = await getQuizHistory();
    const studentHistory = history.filter(entry => entry.studentId === studentId && entry.subject === subject);

    const topicPerformance: Record<string, { correct: number, total: number }> = {};

    for (const entry of studentHistory) {
        // The quiz answers are not stored, so we can't calculate performance.
        // For now, we will return an empty object.
        // In a real application, we would store the user's answers and calculate the performance here.
    }

    // For demonstration, returning mock data.
    // In a real implementation, you would calculate this based on saved answers.
    const mockPerformance: Record<string, number> = {};
    const topics: string[] = [];
    studentHistory.forEach(h => h.quiz.quizQuestions.forEach(q => {
        if (!topics.includes(q.topic)) {
            topics.push(q.topic);
        }
    }));

    topics.forEach(topic => {
        mockPerformance[topic] = Math.random(); // Random score between 0 and 1
    });

    return mockPerformance;
}


async function saveQuiz(input: QuizInput, output: PersonalizedLearningPathOutput) {
  const newEntry = {
    timestamp: new Date().toISOString(),
    ...input,
    quiz: output,
  };

  try {
    let history = await getQuizHistory();
    history.push(newEntry);
    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving quiz:', error);
  }
}

export async function generateQuiz(input: QuizInput): Promise<PersonalizedLearningPathOutput> {
  const validatedInput = QuizInputSchema.parse(input);
  
  // Get performance data to personalize the quiz
  const performanceData = await getPerformanceData(validatedInput.studentId, validatedInput.subject);
  validatedInput.performanceData = performanceData;
  
  const quizOutput = await personalizedLearningPath(validatedInput);
  
  if (quizOutput.quizQuestions.length > 0) {
    await saveQuiz(validatedInput, quizOutput);
  }
  
  return quizOutput;
}

export async function getFullQuizHistory(studentId: string): Promise<QuizEntry[]> {
  const allHistory = await getQuizHistory();
  return allHistory.filter(entry => entry.studentId === studentId);
}
