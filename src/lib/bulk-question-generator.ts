'use server';

/**
 * @fileOverview Bulk question generation for pre-caching
 * Generates and stores questions for all grade/subject combinations
 */

import { generateQuizDirect } from './quiz-generator';
import type { PersonalizedLearningPathInput } from '@/app/shared-schemas';
import { supabase, isSupabaseConfigured } from './supabase';

interface GenerationConfig {
  gradeLevel: 1 | 2 | 3 | 4;
  subject: 'Português' | 'Matemática' | 'Estudo do Meio';
  questionsPerBatch: number;
  totalQuestions: number;
}

const GENERATION_CONFIGS: GenerationConfig[] = [
  // Grade 1
  { gradeLevel: 1, subject: 'Português', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 1, subject: 'Matemática', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 1, subject: 'Estudo do Meio', questionsPerBatch: 20, totalQuestions: 120 },
  // Grade 2
  { gradeLevel: 2, subject: 'Português', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 2, subject: 'Matemática', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 2, subject: 'Estudo do Meio', questionsPerBatch: 20, totalQuestions: 120 },
  // Grade 3
  { gradeLevel: 3, subject: 'Português', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 3, subject: 'Matemática', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 3, subject: 'Estudo do Meio', questionsPerBatch: 20, totalQuestions: 120 },
  // Grade 4
  { gradeLevel: 4, subject: 'Português', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 4, subject: 'Matemática', questionsPerBatch: 20, totalQuestions: 120 },
  { gradeLevel: 4, subject: 'Estudo do Meio', questionsPerBatch: 20, totalQuestions: 120 },
];

interface GenerationResult {
  grade: number;
  subject: string;
  generated: number;
  duplicate: number;
  failed: boolean;
  error?: string;
}

/**
 * Generate questions for a specific grade/subject combination
 */
async function generateQuestionsForGradeSubject(
  config: GenerationConfig
): Promise<GenerationResult> {
  console.log(
    `\n📚 Generating ${config.totalQuestions} questions for ${config.gradeLevel}º ano ${config.subject}...`
  );

  let totalGenerated = 0;
  let totalDuplicates = 0;

  try {
    const batches = Math.ceil(config.totalQuestions / config.questionsPerBatch);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(
        config.questionsPerBatch,
        config.totalQuestions - batch * config.questionsPerBatch
      );

      console.log(`  Batch ${batch + 1}/${batches}: Generating ${batchSize} questions...`);

      try {
        // Generate questions
        const input: PersonalizedLearningPathInput = {
          gradeLevel: config.gradeLevel,
          subject: config.subject,
          numberOfQuestions: Math.min(batchSize, 10), // API limit
          performanceData: undefined,
        };

        const result = await generateQuizDirect(input);

        if (!result || !result.quizQuestions) {
          throw new Error('Empty result from API');
        }

        // Check for duplicates and save to Supabase
        if (isSupabaseConfigured() && supabase) {
          const existingQuestions = result.quizQuestions.map((q) => q.question);
          const { data: existing } = await supabase
            .from('questions')
            .select('question')
            .in('question', existingQuestions);

          const existingSet = new Set(existing?.map((e) => e.question) || []);
          const newQuestions = result.quizQuestions.filter((q) => !existingSet.has(q.question));
          const duplicateCount = result.quizQuestions.length - newQuestions.length;

          if (newQuestions.length > 0) {
            const rows = newQuestions.map((q) => ({
              grade_level: config.gradeLevel,
              subject: config.subject,
              topic: q.topic || 'Geral',
              question: q.question,
              options: q.options,
              correct_answer: q.correctAnswer,
              image_url: q.imageUrl || null,
            }));

            const { error } = await supabase.from('questions').insert(rows);

            if (error) {
              console.error(`    ❌ Failed to insert questions: ${error.message}`);
            } else {
              console.log(
                `    ✅ Saved ${newQuestions.length} new questions (${duplicateCount} duplicates)`
              );
              totalGenerated += newQuestions.length;
              totalDuplicates += duplicateCount;
            }
          } else {
            console.log(`    ⚠️  All ${duplicateCount} were duplicates`);
            totalDuplicates += duplicateCount;
          }
        }
      } catch (batchError) {
        console.error(`    ❌ Batch error: ${batchError}`);
        continue; // Continue with next batch
      }

      // Rate limiting - add delay between batches
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return {
      grade: config.gradeLevel,
      subject: config.subject,
      generated: totalGenerated,
      duplicate: totalDuplicates,
      failed: false,
    };
  } catch (error) {
    console.error(`❌ Generation failed for ${config.gradeLevel}º ${config.subject}:`, error);
    return {
      grade: config.gradeLevel,
      subject: config.subject,
      generated: totalGenerated,
      duplicate: totalDuplicates,
      failed: true,
      error: String(error),
    };
  }
}

/**
 * Generate all questions in parallel batches
 */
export async function generateAllQuestions(
  gradeFilter?: number,
  subjectFilter?: string
): Promise<GenerationResult[]> {
  console.log('🚀 Starting bulk question generation...\n');

  const configsToGenerate = GENERATION_CONFIGS.filter((c) => {
    if (gradeFilter && c.gradeLevel !== gradeFilter) return false;
    if (subjectFilter && c.subject !== subjectFilter) return false;
    return true;
  });

  console.log(`📊 Will generate questions for ${configsToGenerate.length} grade/subject combinations\n`);

  const results: GenerationResult[] = [];

  // Generate in series to avoid API rate limits
  for (const config of configsToGenerate) {
    const result = await generateQuestionsForGradeSubject(config);
    results.push(result);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  let totalGenerated = 0;
  let totalDuplicates = 0;
  let successCount = 0;

  results.forEach((r) => {
    const status = r.failed ? '❌' : '✅';
    console.log(
      `${status} ${r.grade}º ${r.subject.padEnd(15)}: ${r.generated} new + ${r.duplicate} duplicates`
    );
    if (!r.failed) successCount++;
    totalGenerated += r.generated;
    totalDuplicates += r.duplicate;
  });

  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}/${results.length} grade/subject combinations`);
  console.log(`📝 Total new questions: ${totalGenerated}`);
  console.log(`♻️  Total duplicates: ${totalDuplicates}`);
  console.log('='.repeat(60) + '\n');

  return results;
}

/**
 * Get current question counts in database
 */
export async function getQuestionCounts(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('Supabase not configured');
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('grade_level, subject, id')
      .returns<Array<{ grade_level: number; subject: string; id: string }>>();

    if (error) throw error;

    const counts: Record<string, number> = {};
    data?.forEach((q) => {
      const key = `${q.grade_level}º ${q.subject}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Failed to get question counts:', error);
    return {};
  }
}
