
"use server"

import { generateQuizWithFallback } from "@/ai/flows/quiz-fallback";
import { generateStory } from "@/ai/flows/story-generator";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { StoryGenerationInputSchema } from "@/app/shared-schemas";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { ai } from "@/ai/genkit";
import type { QuizInput, SaveQuizInput, QuizResultEntry, Answer, SpeechMark, StoryGenerationInput } from './shared-schemas';
import { QuizResultSchema, SaveQuizInputSchema } from "./shared-schemas";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";


const historyFilePath = path.join(process.cwd(), 'quiz-history.json');

// ============================================
// Quiz History (Supabase with JSON fallback)
// ============================================

async function getQuizHistoryFromFile(): Promise<QuizResultEntry[]> {
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
      return [];
    }
    console.error('Error reading or parsing quiz history:', error);
    return [];
  }
}

async function getQuizHistory(): Promise<QuizResultEntry[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        timestamp: row.created_at,
        studentId: row.student_id,
        gradeLevel: row.grade_level,
        subject: row.subject,
        numberOfQuestions: row.total_questions,
        quiz: row.quiz_data,
        answers: row.answers,
        score: row.score,
      }));
    } catch (error) {
      console.error('Supabase quiz history fetch failed, falling back to file:', error);
      return getQuizHistoryFromFile();
    }
  }
  return getQuizHistoryFromFile();
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

async function saveQuizToFile(input: SaveQuizInput) {
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
    let history = await getQuizHistoryFromFile();
    history.push(newEntry);
    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving quiz to file:', error);
  }
}

async function saveQuiz(input: SaveQuizInput) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('quiz_history').insert({
        student_id: input.studentId,
        grade_level: input.gradeLevel,
        subject: input.subject,
        score: input.score,
        total_questions: input.numberOfQuestions,
        answers: input.answers,
        quiz_data: input.quiz,
      });
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Supabase save failed, falling back to file:', error);
    }
  }
  await saveQuizToFile(input);
}

// ============================================
// Question Caching (Supabase)
// ============================================

async function getCachedQuestions(gradeLevel: number, subject: string | undefined, count: number) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('grade_level', gradeLevel);

    if (subject) {
      query = query.eq('subject', subject);
    }

    // Get random questions by ordering randomly and limiting
    const { data, error } = await query
      .limit(count * 3); // Get more than needed to allow random selection

    if (error) throw error;
    if (!data || data.length < count) return null; // Not enough cached questions

    // Shuffle and pick the requested number
    const shuffled = data.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    return {
      quizQuestions: selected.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        topic: q.topic,
        imageUrl: q.image_url || undefined,
      })),
    };
  } catch (error) {
    console.error('Failed to get cached questions:', error);
    return null;
  }
}

async function cacheQuestions(gradeLevel: number, subject: string | undefined, questions: any[]) {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const rows = questions.map(q => ({
      grade_level: gradeLevel,
      subject: subject || 'Misto',
      topic: q.topic,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      image_url: q.imageUrl || null,
    }));

    const { error } = await supabase.from('questions').insert(rows);
    if (error) {
      console.error('Failed to cache questions:', error);
    }
  } catch (error) {
    console.error('Error caching questions:', error);
  }
}

// ============================================
// Quiz Generation (with caching)
// ============================================

export async function generateQuiz(input: QuizInput) {
  const validatedInput = z.object({
      studentId: z.string(),
      gradeLevel: z.coerce.number().min(1).max(4),
      subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
      numberOfQuestions: z.number().min(5).max(20).default(5),
    }).parse(input);
  
  const resolvedSubject = validatedInput.subject === 'Misto' ? undefined : validatedInput.subject;
  
  // Try to get questions from cache first
  const cached = await getCachedQuestions(
    validatedInput.gradeLevel,
    resolvedSubject,
    validatedInput.numberOfQuestions
  );

  if (cached) {
    console.log(`[Cache HIT] Serving ${validatedInput.numberOfQuestions} cached questions for grade ${validatedInput.gradeLevel}, subject: ${resolvedSubject || 'Misto'}`);
    return cached;
  }

  console.log(`[Cache MISS] Generating new questions via AI for grade ${validatedInput.gradeLevel}, subject: ${resolvedSubject || 'Misto'}`);

  const performanceData = await getPerformanceData(validatedInput.studentId, resolvedSubject);

  const aiInput = {
    ...validatedInput,
    subject: resolvedSubject,
    performanceData,
  };
  
  // Use fallback mechanism: tries Gemini first, then falls back to Groq if rate limited
  const quizOutput = await generateQuizWithFallback(aiInput);

  // Cache the generated questions for future use (non-blocking)
  if (quizOutput?.quizQuestions) {
    cacheQuestions(validatedInput.gradeLevel, resolvedSubject, quizOutput.quizQuestions)
      .catch(err => console.error('Background caching failed:', err));
  }
    
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


// ============================================
// Story Action with Image and Audio generation
// ============================================

const GenerateStoryActionOutputSchema = z.object({
    title: z.string(),
    story: z.string(),
    audioDataUri: z.string().optional(),
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

export async function generateStoryAction(input: StoryGenerationInput): Promise<z.infer<typeof GenerateStoryActionOutputSchema>> {
    const validatedInput = StoryGenerationInputSchema.parse(input);
    
    const storyOutput = await generateStory(validatedInput);
    if (!storyOutput || !storyOutput.story) {
        throw new Error("Failed to generate story text.");
    }

    const fullText = `${storyOutput.title}. ${storyOutput.story}`;

    const [ttsResult, imagesResult] = await Promise.allSettled([
        textToSpeech(fullText),
        storyOutput.imagePrompts ? Promise.all(storyOutput.imagePrompts.map(generateImage)) : Promise.resolve([])
    ]);

    const audioDataUri = ttsResult.status === 'fulfilled' ? ttsResult.value.audioDataUri : undefined;
    const speechMarks = ttsResult.status === 'fulfilled' ? ttsResult.value.speechMarks : undefined;
    const images = imagesResult.status === 'fulfilled' ? imagesResult.value.filter(url => url) : [];
    
    if (ttsResult.status === 'rejected') {
        console.error("Text-to-speech failed, returning story without audio.", ttsResult.reason);
    }
    if (imagesResult.status === 'rejected') {
        console.error("Image generation failed.", imagesResult.reason);
    }

    const result = {
        title: storyOutput.title,
        story: storyOutput.story,
        audioDataUri,
        speechMarks,
        images
    };

    return GenerateStoryActionOutputSchema.parse(result);
}
