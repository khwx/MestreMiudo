import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const missingData = JSON.parse(fs.readFileSync('./docs/missing-challenges.json', 'utf-8'));
const challengesGroups = missingData.challenges;

console.log(`📥 A importar desafios para ${challengesGroups.length} lições...\n`);

async function importChallenges() {
  // Buscar todas as lições
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title');

  if (lessonsError) {
    console.error('❌ Erro ao buscar lições:', lessonsError.message);
    return;
  }

  const lessonMap = {};
  lessons.forEach(l => {
    lessonMap[l.title] = l.id;
  });

  let totalInserted = 0;

  for (const group of challengesGroups) {
    const lessonTitle = group.lesson_title;
    const lessonId = lessonMap[lessonTitle];

    if (!lessonId) {
      console.log(`⚠️ Lição não encontrada: "${lessonTitle}"`);
      continue;
    }

    console.log(`📝 ${lessonTitle}:`);

    for (const challenge of group.challenges) {
      const { error } = await supabase
        .from('lesson_challenges')
        .insert({
          lesson_id: lessonId,
          challenge_index: challenge.challenge_index,
          challenge_type: challenge.challenge_type,
          question: challenge.question,
          content: challenge.content,
          hint: challenge.hint || ''
        });

      if (error) {
        console.error(`  ❌ Erro ${challenge.challenge_index}:`, error.message);
      } else {
        console.log(`  ✅ Desafio ${challenge.challenge_index}`);
        totalInserted++;
      }
    }
  }

  console.log(`\n✨ Total de desafios inseridos: ${totalInserted}`);
}

importChallenges();
