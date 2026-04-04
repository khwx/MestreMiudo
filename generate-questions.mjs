#!/usr/bin/env node

/**
 * Script para gerar automaticamente 100-150 questões por ano/disciplina
 * Use: node generate-questions.mjs [grade] [subject]
 * 
 * Examples:
 *   node generate-questions.mjs          (gera todas)
 *   node generate-questions.mjs 1        (gera apenas 1º ano)
 *   node generate-questions.mjs 3 Português (gera 3º ano Português)
 */

import { generateAllQuestions, getQuestionCounts } from './src/lib/bulk-question-generator.ts';

async function main() {
  try {
    console.log('📚 MestreMiudo - Question Generator\n');

    // Parse arguments
    const gradeArg = process.argv[2];
    const subjectArg = process.argv[3];
    const grade = gradeArg ? parseInt(gradeArg) : undefined;
    const subject = subjectArg?.charAt(0).toUpperCase() + subjectArg?.slice(1).toLowerCase();

    // Show current counts
    console.log('📊 Current question counts in database:\n');
    const counts = await getQuestionCounts();
    
    if (Object.keys(counts).length === 0) {
      console.log('(No questions yet)');
    } else {
      Object.entries(counts)
        .sort()
        .forEach(([key, count]) => {
          console.log(`  ${key.padEnd(25)}: ${count} questions`);
        });
    }
    console.log();

    // Generate new questions
    const results = await generateAllQuestions(grade, subject);

    // Show new counts
    console.log('\n📊 Updated question counts:\n');
    const newCounts = await getQuestionCounts();
    Object.entries(newCounts)
      .sort()
      .forEach(([key, count]) => {
        console.log(`  ${key.padEnd(25)}: ${count} questions`);
      });

    console.log('\n✅ Generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
