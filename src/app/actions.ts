"use server"

import { personalizedLearningPath, type PersonalizedLearningPathOutput } from "@/ai/flows/personalized-learning-paths";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';

const QuizInputSchema = z.object({
  studentId: z.string(),
  gradeLevel: z.coerce.number().min(1).max(4),
  subject: z.enum(['Português', 'Matemática', 'Estudo do Meio']),
  numberOfQuestions: z.number().min(5).max(20).default(5),
});

type QuizInput = z.infer<typeof QuizInputSchema>;

// This will be the structure for saving the results of a quiz
const QuizResultSchema = QuizInputSchema.extend({
  timestamp: z.string(),
  quiz: PersonalizedLearningPathOutput,
  answers: z.array(z.object({
    question: z.string(),
    selectedAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    topic: z.string(),
  })),
  score: z.number(),
});

export type QuizResultEntry = z.infer<typeof QuizResultSchema>;

const historyFilePath = path.join(process.cwd(), 'quiz-history.json');

async function getQuizHistory(): Promise<QuizResultEntry[]> {
  try {
    const data = await fs.readFile(historyFilePath, 'utf-8');
    // We can use Zod to safely parse the history file
    return z.array(QuizResultSchema).parse(JSON.parse(data));
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty history
    }
    console.error('Error reading or parsing quiz history:', error);
    // If parsing fails, it's safer to start fresh
    return [];
  }
}

export async function getPerformanceData(studentId: string, subject: string): Promise<Record<string, number>> {
    const history = await getQuizHistory();
    const studentHistory = history.filter(entry => entry.studentId === studentId && entry.subject === subject);

    const topicPerformance: Record<string, { correct: number; total: number }> = {};

    // Iterate over all answers in the student's history for the given subject
    for (const entry of studentHistory) {
      for (const answer of entry.answers) {
          if (!topicPerformance[answer.topic]) {
              topicPerformance[answer.topic] = { correct: 0, total: 0 };
          }
          topicPerformance[answer.topic].total++;
          if (answer.isCorrect) {
              topicPerformance[answer.topic].correct++;
          }
      }
    }

    const performanceScores: Record<string, number> = {};
    for (const topic in topicPerformance) {
        const { correct, total } = topicPerformance[topic];
        performanceScores[topic] = total > 0 ? correct / total : 0;
    }

    return performanceScores;
}

const SaveQuizInputSchema = QuizInputSchema.extend({
  answers: z.array(z.object({
    question: z.string(),
    selectedAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    topic: z.string(),
  })),
  quiz: PersonalizedLearningPathOutput,
  score: z.number(),
});

type SaveQuizInput = z.infer<typeof SaveQuizInputSchema>;

async function saveQuiz(input: SaveQuizInput) {
  const newEntry: QuizResultEntry = {
    timestamp: new Date().toISOString(),
    studentId: input.studentId,
    gradeLevel: input.gradeLevel,
    subject: input.subject,
    numberOfQuestions: input.numberOfQuestions,
    quiz: input.quiz,
    answers: input.answers,
    score: input.score,
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
  
  const quizOutput = await personalizedLearningPath({ ...validatedInput, performanceData });
  
  // Quiz is now saved after it's completed, not when it's generated.
  
  return quizOutput;
}

export async function saveQuizResults(input: SaveQuizInput): Promise<void> {
    const validatedInput = SaveQuizInputSchema.parse(input);
    await saveQuiz(validatedInput);
}


export async function getFullQuizHistory(studentId: string): Promise<QuizResultEntry[]> {
  const allHistory = await getQuizHistory();
  return allHistory.filter(entry => entry.studentId === studentId);
}
