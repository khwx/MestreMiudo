
"use server"

import { personalizedLearningPath } from "@/ai/flows/personalized-learning-paths";
import { generateStory } from "@/ai/flows/story-generator";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { StoryGenerationInputSchema } from "@/ai/schemas";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { ai } from "@/ai/genkit";
import type { QuizInput, SaveQuizInput, QuizResultEntry, Answer, SpeechMark } from './shared-schemas';
import { QuizResultSchema, SaveQuizInputSchema } from "./shared-schemas";


const historyFilePath = path.join(process.cwd(), 'quiz-history.json');

async function getQuizHistory(): Promise<QuizResultEntry[]> {
  try {
    const data = await fs.readFile(historyFilePath, 'utf-8');
    const parsed = z.array(QuizResultSchema).safeParse(JSON.parse(data));
    if (!parsed.success) {
        console.warn('Invalid quiz history file format. Starting fresh.', parsed.error);
        return [];
    }
    return parsed.data;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty history
    }
    console.error('Error reading or parsing quiz history:', error);
    return [];
  }
}

export async function getPerformanceData(studentId: string, subject?: string): Promise<Record<string, number> | null> {
    const history = await getQuizHistory();
    const studentHistory = history.filter(entry => 
        entry.studentId === studentId && (subject ? entry.subject === subject : true)
    );

    if (studentHistory.length === 0) {
        return null;
    }

    const topicPerformance: Record<string, { correct: number; total: number }> = {};

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

export async function generateQuiz(input: QuizInput) {
  const validatedInput = z.object({
      studentId: z.string(),
      gradeLevel: z.coerce.number().min(1).max(4),
      subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
      numberOfQuestions: z.number().min(5).max(20).default(5),
    }).parse(input);
  
  const performanceData = await getPerformanceData(validatedInput.studentId, validatedInput.subject !== 'Misto' ? validatedInput.subject : undefined);

  const aiInput = {
    ...validatedInput,
    subject: validatedInput.subject === 'Misto' ? undefined : validatedInput.subject,
    performanceData,
  };
  
  const quizOutput = await personalizedLearningPath(aiInput);
    
  return quizOutput;
}

export async function saveQuizResults(input: SaveQuizInput) {
    const validatedInput = SaveQuizInputSchema.parse(input);
    await saveQuiz(validatedInput);
}

export async function getFullQuizHistory(studentId: string): Promise<QuizResultEntry[]> {
  const allHistory = await getQuizHistory();
  return allHistory.filter(entry => entry.studentId === studentId);
}


// New Story Action with Image and Audio generation
const GenerateStoryActionOutputSchema = z.object({
    title: z.string(),
    story: z.string(),
    audioDataUri: z.string().url().optional(),
    speechMarks: z.array(z.object({
      type: z.string(),
      value: z.string(),
      time: z.object({
        seconds: z.string(),
        nanos: z.number(),
      }),
    })).optional(),
    images: z.array(z.string().url()).optional(),
});


async function generateImage(prompt: string): Promise<string> {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt,
        config: {
            aspectRatio: "1:1",
        }
    });
    return media?.url || '';
}

export async function generateStoryAction(input: z.infer<typeof StoryGenerationInputSchema>): Promise<z.infer<typeof GenerateStoryActionOutputSchema>> {
    const validatedInput = StoryGenerationInputSchema.parse(input);
    
    // 1. Generate the story and image prompts
    const storyOutput = await generateStory(validatedInput);
    if (!storyOutput || !storyOutput.story) {
        throw new Error("Failed to generate story text.");
    }

    // 2. Generate audio and images in parallel
    const fullText = `${storyOutput.title}. ${storyOutput.story}`;

    const [ttsResult, imagesResult] = await Promise.allSettled([
        textToSpeech(fullText),
        storyOutput.imagePrompts ? Promise.all(storyOutput.imagePrompts.map(generateImage)) : Promise.resolve([])
    ]);

    const audioDataUri = ttsResult.status === 'fulfilled' ? ttsResult.value.audioDataUri : undefined;
    const speechMarks = ttsResult.status === 'fulfilled' ? ttsResult.value.speechMarks : undefined;
    const images = imagesResult.status === 'fulfilled' ? imagesResult.value.filter(url => url) : undefined;
    
    if (ttsResult.status === 'rejected') {
        console.error("Text-to-speech failed, returning story without audio.", ttsResult.reason);
    }
    if (imagesResult.status === 'rejected') {
        console.error("Image generation failed.", imagesResult.reason);
    }

    return {
        title: storyOutput.title,
        story: storyOutput.story,
        audioDataUri,
        speechMarks,
        images
    };
}
