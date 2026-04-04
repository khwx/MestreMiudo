/**
 * Script to fix 2 incorrect questions in 3º Matemática
 * Run with: node fix-questions.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppvftnxrpxxafarttyim.supabase.co';
const supabaseAnonKey = 'sb_publishable_Srbzxo3Q9_K8j0yhs_ePLg_p8uPq9tU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAndFixQuestions() {
  console.log('🔍 Searching for incorrect questions in 3º Matemática...\n');

  try {
    // Get all 3º ano Matemática questions
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('grade_level', 3)
      .eq('subject', 'Matemática');

    if (error) {
      console.error('Error querying questions:', error);
      return;
    }

    if (!questions || questions.length === 0) {
      console.log('No questions found for 3º ano Matemática');
      return;
    }

    console.log(`Found ${questions.length} questions for 3º ano Matemática\n`);

    // Find problematic questions
    let prismaQuestion = null;
    let weightQuestion = null;

    for (const q of questions) {
      // Look for Prisma question (should have "9 arestas" as answer)
      if (q.question.toLowerCase().includes('prisma') && 
          q.correct_answer === '9 arestas' && 
          !q.options.includes('9 arestas')) {
        prismaQuestion = q;
      }

      // Look for weight question (should have "0,375 kg" as answer)
      if ((q.question.toLowerCase().includes('peso') || q.question.toLowerCase().includes('quilograma')) && 
          q.correct_answer === '0,375 kg' && 
          !q.options.includes('0,375 kg')) {
        weightQuestion = q;
      }
    }

    if (prismaQuestion) {
      console.log('❌ Found Issue 1 - Prisma question:');
      console.log(`   Question: ${prismaQuestion.question}`);
      console.log(`   Correct answer: ${prismaQuestion.correct_answer}`);
      console.log(`   Current options: ${JSON.stringify(prismaQuestion.options)}`);
      console.log(`   Missing from options: 9 arestas\n`);

      // Fix: Add correct answer to options, remove one incorrect option
      const fixedOptions = prismaQuestion.options.slice(0, 3); // Keep first 3
      fixedOptions.push('9 arestas'); // Add correct answer
      
      console.log(`   Fixed options: ${JSON.stringify(fixedOptions)}\n`);

      const { error: updateError } = await supabase
        .from('questions')
        .update({ options: fixedOptions })
        .eq('id', prismaQuestion.id);

      if (updateError) {
        console.error('   ❌ Failed to update:', updateError);
      } else {
        console.log('   ✅ Fixed!\n');
      }
    } else {
      console.log('ℹ️  Prisma question not found (may already be fixed)\n');
    }

    if (weightQuestion) {
      console.log('❌ Found Issue 2 - Weight question:');
      console.log(`   Question: ${weightQuestion.question}`);
      console.log(`   Correct answer: ${weightQuestion.correct_answer}`);
      console.log(`   Current options: ${JSON.stringify(weightQuestion.options)}`);
      console.log(`   Missing from options: 0,375 kg\n`);

      // Fix: Add correct answer to options, remove one incorrect option
      const fixedOptions = weightQuestion.options.slice(0, 3); // Keep first 3
      fixedOptions.push('0,375 kg'); // Add correct answer
      
      console.log(`   Fixed options: ${JSON.stringify(fixedOptions)}\n`);

      const { error: updateError } = await supabase
        .from('questions')
        .update({ options: fixedOptions })
        .eq('id', weightQuestion.id);

      if (updateError) {
        console.error('   ❌ Failed to update:', updateError);
      } else {
        console.log('   ✅ Fixed!\n');
      }
    } else {
      console.log('ℹ️  Weight question not found (may already be fixed)\n');
    }

    if (!prismaQuestion && !weightQuestion) {
      console.log('✅ Both questions are already fixed or no longer exist!\n');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
findAndFixQuestions();
