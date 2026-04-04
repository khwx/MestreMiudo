
"use server"

import { generateQuizDirect } from "@/lib/quiz-generator";
import { generateDiagnosticTest, calculateDiagnosticResults, shouldTakeDiagnosticTest } from "@/lib/diagnostic-test";
import { 
  calculateQuizPoints, 
  getCurrentTier, 
  getNextTierProgress, 
  checkBadges, 
  generateCelebrationMessage,
  getDailyBonus 
} from "@/lib/rewards";
import { generateStory } from "@/ai/flows/story-generator";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { ai } from "@/ai/genkit";
import { StoryGenerationInputSchema } from "@/app/shared-schemas";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
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

async function getCachedQuestionsFromFile(gradeLevel: number, subject: string | undefined, count: number, studentId?: string) {
  try {
    const history = await getQuizHistoryFromFile();
    if (history.length === 0) return null;

    // Get recently shown questions for this student (last 5 quizzes)
    let excludeQuestions: string[] = [];
    if (studentId) {
      const studentHistory = history
        .filter(entry => entry.studentId === studentId)
        .slice(0, 5);
      
      studentHistory.forEach(entry => {
        if (entry.quiz?.quizQuestions) {
          entry.quiz.quizQuestions.forEach((q: any) => {
            excludeQuestions.push(q.question);
          });
        }
      });
    }

    // Collect all unique questions, excluding recently shown ones
    const allQuestionsMap = new Map<string, any>();
    
    for (const entry of history) {
      if (entry.quiz?.quizQuestions) {
        for (const q of entry.quiz.quizQuestions) {
          if (!excludeQuestions.includes(q.question) && !allQuestionsMap.has(q.question)) {
            allQuestionsMap.set(q.question, q);
          }
        }
      }
    }

    let availableQuestions = Array.from(allQuestionsMap.values());
    
    if (availableQuestions.length === 0) {
      // If all questions were excluded, use all questions anyway
      for (const entry of history) {
        if (entry.quiz?.quizQuestions) {
          for (const q of entry.quiz.quizQuestions) {
            if (!allQuestionsMap.has(q.question)) {
              allQuestionsMap.set(q.question, q);
            }
          }
        }
      }
      availableQuestions = Array.from(allQuestionsMap.values());
    }

    if (availableQuestions.length === 0) return null;

    // Shuffle and pick
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    console.log(`[CACHE-FILE] Found ${selected.length} questions from file history (${availableQuestions.length} available)`);

    return {
      quizQuestions: selected.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        imageUrl: q.imageUrl || undefined,
      })),
    };
  } catch (error) {
    console.error('Failed to get cached questions from file:', error);
    return null;
  }
}

async function getCachedQuestions(gradeLevel: number, subject: string | undefined, count: number, studentId?: string) {
  // Try Supabase first
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('grade_level', gradeLevel);

      if (subject) {
        query = query.eq('subject', subject);
      }

      // Get more questions than needed to allow filtering
      const { data: allQuestions, error } = await query;
      
      if (error) throw error;
      if (allQuestions && allQuestions.length > 0) {
        // If studentId provided, exclude questions they've seen recently (last 5 quizzes)
        let excludeQuestions: string[] = [];
        if (studentId) {
          try {
            const { data: recentHistory } = await supabase
              .from('quiz_history')
              .select('quiz_data')
              .eq('student_id', studentId)
              .order('created_at', { ascending: false })
              .limit(5);
            
            if (recentHistory) {
              recentHistory.forEach((entry: any) => {
                if (entry.quiz_data?.quizQuestions) {
                  entry.quiz_data.quizQuestions.forEach((q: any) => {
                    excludeQuestions.push(q.question);
                  });
                }
              });
            }
          } catch (e) {
            console.warn('Could not fetch recent history:', e);
          }
        }

        // Filter out recently shown questions
        let availableQuestions = allQuestions.filter((q: any) => !excludeQuestions.includes(q.question));
        
        // If not enough remaining, use all questions
        if (availableQuestions.length < count) {
          availableQuestions = allQuestions;
        }

        // Shuffle and pick
        const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        if (selected.length < count) {
          console.log(`[CACHE] Only ${selected.length} questions available (need ${count})`);
        }

        return {
          quizQuestions: selected.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correct_answer,
            topic: q.topic,
            imageUrl: q.image_url || undefined,
          })),
        };
      }
    } catch (error) {
      console.error('Failed to get cached questions from Supabase:', error);
    }
  }

  // Fallback to file-based cache
  console.log('[CACHE] Supabase not available or no questions, trying file-based cache...');
  return getCachedQuestionsFromFile(gradeLevel, subject, count, studentId);
}

async function cacheQuestions(gradeLevel: number, subject: string | undefined, questions: any[]) {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    // Check which questions already exist to avoid duplicates
    const existingQuestions = questions.map(q => q.question);
    const { data: existing } = await supabase
      .from('questions')
      .select('question')
      .in('question', existingQuestions);

    const existingSet = new Set(existing?.map(e => e.question) || []);
    
    // Filter out duplicates
    const newQuestions = questions.filter(q => !existingSet.has(q.question));
    
    if (newQuestions.length === 0) {
      console.log('[CACHE] All questions already exist, skipping insert');
      return;
    }

    const rows = newQuestions.map(q => ({
      grade_level: gradeLevel,
      subject: subject || 'Misto',
      topic: q.topic,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      image_url: q.imageUrl || null,
    }));

    console.log(`[CACHE] Inserting ${rows.length} new questions (${questions.length - rows.length} duplicates skipped)`);
    const { error } = await supabase.from('questions').insert(rows);
    if (error) {
      console.error('Failed to cache questions:', error);
    }
  } catch (error) {
    console.error('Error caching questions:', error);
  }
}

// ============================================
// Quiz Generation (Groq first, then Genkit)
// ============================================

export async function generateQuiz(input: QuizInput) {
  const validatedInput = z.object({
      studentId: z.string(),
      gradeLevel: z.coerce.number().min(1).max(4),
      subject: z.enum(['Português', 'Matemática', 'Estudo do Meio', 'Misto']),
      numberOfQuestions: z.number().min(5).max(20).default(5),
    }).parse(input);
  
  const resolvedSubject = validatedInput.subject === 'Misto' ? undefined : validatedInput.subject;
  
  console.log(`[QUIZ] Generating quiz for grade ${validatedInput.gradeLevel}, subject: ${resolvedSubject || 'Misto'}`);

  // Try direct API calls (Groq first, then Gemini)
  try {
    const performanceData = await getPerformanceData(validatedInput.studentId, resolvedSubject);

    const aiInput = {
      studentId: validatedInput.studentId,
      gradeLevel: validatedInput.gradeLevel,
      subject: resolvedSubject,
      performanceData,
      numberOfQuestions: validatedInput.numberOfQuestions,
    };
    
    const quizOutput = await generateQuizDirect(aiInput);

    // Cache the generated questions for future use (non-blocking)
    if (quizOutput?.quizQuestions) {
      cacheQuestions(validatedInput.gradeLevel, resolvedSubject, quizOutput.quizQuestions)
        .catch(err => console.error('Background caching failed:', err));
    }
    
    console.log(`[QUIZ] Success! Generated ${quizOutput.quizQuestions.length} questions`);
    return quizOutput;
    
  } catch (aiError) {
    console.warn(`[QUIZ] AI failed, trying cache...`);
    
    // 2. If AI fails, try cache as fallback
    const cached = await getCachedQuestions(
      validatedInput.gradeLevel,
      resolvedSubject,
      validatedInput.numberOfQuestions,
      validatedInput.studentId
    );

    if (cached) {
      console.log(`[QUIZ] Cache fallback: ${cached.quizQuestions.length} questions`);
      return cached;
    }

    // 3. If no cache either, throw error
    console.error(`[QUIZ] All options failed`);
    throw new Error('Serviço temporariamente indisponível. Por favor tenta novamente mais tarde.');
  }
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
    try {
        console.log(`[IMAGE] Generating image with prompt: ${prompt.substring(0, 100)}...`);
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt,
            config: {
                aspectRatio: "1:1",
            }
        });
        const url = media?.url || '';
        if (url) {
            console.log(`[IMAGE] Successfully generated image`);
        } else {
            console.warn(`[IMAGE] No media URL returned`);
        }
        return url;
    } catch (error) {
        console.error(`[IMAGE] Failed to generate image:`, error);
        return ''; // Return empty string instead of failing
    }
}

export async function generateStoryAction(input: StoryGenerationInput): Promise<z.infer<typeof GenerateStoryActionOutputSchema>> {
    const validatedInput = StoryGenerationInputSchema.parse(input);
    
    try {
        console.log(`[STORY_ACTION] Starting story generation for grade ${input.gradeLevel}`);
        const storyOutput = await generateStory(validatedInput);
        if (!storyOutput || !storyOutput.story) {
            throw new Error("Failed to generate story text - empty response from Genkit flow.");
        }

        console.log(`[STORY_ACTION] Story generated: "${storyOutput.title}"`);
        const fullText = `${storyOutput.title}. ${storyOutput.story}`;

        const [ttsResult, imagesResult] = await Promise.allSettled([
            textToSpeech(fullText),
            storyOutput.imagePrompts ? Promise.all(storyOutput.imagePrompts.map(generateImage)) : Promise.resolve([])
        ]);

        const audioDataUri = ttsResult.status === 'fulfilled' ? ttsResult.value.audioDataUri : undefined;
        const speechMarks = ttsResult.status === 'fulfilled' ? ttsResult.value.speechMarks : undefined;
        const images = imagesResult.status === 'fulfilled' ? imagesResult.value.filter((url: string) => url) : [];
        
        if (ttsResult.status === 'rejected') {
            console.error("[STORY_ACTION] Text-to-speech failed, returning story without audio.", ttsResult.reason);
        }
        if (imagesResult.status === 'rejected') {
            console.error("[STORY_ACTION] Image generation failed.", imagesResult.reason);
        }

        const result = {
            title: storyOutput.title,
            story: storyOutput.story,
            audioDataUri,
            speechMarks,
            images
        };

        console.log(`[STORY_ACTION] Story action complete: audio=${!!audioDataUri}, images=${images.length}`);
        return GenerateStoryActionOutputSchema.parse(result);
    } catch (error: any) {
        console.error("[STORY_ACTION] Failed to generate story:", error.message || error);
        throw error;
    }
}

// ============================================
// Diagnostic Test (Learning Level Detection)
// ============================================

export async function generateDiagnostic(gradeLevel: 1 | 2 | 3 | 4) {
  console.log('[DIAGNOSTIC] Generating diagnostic test...');
  return generateDiagnosticTest(gradeLevel);
}

export async function saveDiagnosticResults(
  studentId: string,
  gradeLevel: 1 | 2 | 3 | 4,
  answers: Array<{ questionIndex: number; selectedAnswer: string }>,
  correctAnswers: string[]
) {
  const results = calculateDiagnosticResults(answers, correctAnswers);
  
  console.log('[DIAGNOSTIC] Results:', results);
  
  // Save to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('diagnostic_tests').insert({
        student_id: studentId,
        grade_level: gradeLevel,
        score: results.score,
        percentage: results.percentage,
        learning_level: results.learningLevel,
        recommendations: results.recommendations,
        created_at: new Date().toISOString(),
      });
      
      if (error) console.error('Failed to save diagnostic results:', error);
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
    }
  }
  
  return results;
}

export async function checkDiagnosticNeeded(lastDiagnosticDate?: string): Promise<boolean> {
  return shouldTakeDiagnosticTest(lastDiagnosticDate);
}

// ============================================
// Student Rewards System
// ============================================

export async function awardQuizPoints(
  studentId: string,
  score: number,
  total: number,
  gradeLevel: number
) {
  const points = calculateQuizPoints(score, total, gradeLevel);
  
  console.log('[REWARDS] Awarding', points, 'points to', studentId);
  
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[REWARDS] Supabase not configured, skipping reward save');
    return { points, message: generateCelebrationMessage(score, total, points) };
  }
  
  try {
    // Get or create student reward record
    const { data: existing } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!existing) {
      // Create new reward record
      await supabase.from('student_rewards').insert({
        student_id: studentId,
        total_points: points,
        current_tier: 1,
        badges: [],
        day_streak: 1,
        last_quiz_date: new Date().toISOString(),
      });
    } else {
      // Update existing record
      const dailyBonus = getDailyBonus(existing.day_streak || 0);
      const newTotal = (existing.total_points || 0) + points + dailyBonus;
      const newTier = getCurrentTier(newTotal).level;
      
      await supabase
        .from('student_rewards')
        .update({
          total_points: newTotal,
          current_tier: newTier,
          last_quiz_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId);
    }
    
    const tier = getCurrentTier(points);
    const nextProgress = getNextTierProgress(points);
    
    return {
      points,
      totalPoints: (existing?.total_points || 0) + points,
      tier: tier.name,
      message: generateCelebrationMessage(score, total, points),
      nextTier: nextProgress.nextTier?.name,
      progressPercentage: nextProgress.percentage,
    };
  } catch (error) {
    console.error('[REWARDS] Failed to award points:', error);
    return {
      points,
      message: generateCelebrationMessage(score, total, points),
      error: true,
    };
  }
}

export async function getStudentRewards(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  
  try {
    const { data } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (data) {
      const tier = getCurrentTier(data.total_points || 0);
      const nextProgress = getNextTierProgress(data.total_points || 0);
      
      return {
        ...data,
        tier,
        nextTier: nextProgress.nextTier,
        progressPercentage: nextProgress.percentage,
      };
    }
  } catch (error) {
    console.error('[REWARDS] Failed to get student rewards:', error);
  }
  
  return null;
}
