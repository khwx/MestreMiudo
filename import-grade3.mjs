import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const data = JSON.parse(fs.readFileSync('./docs/grade3_content.json', 'utf-8'));
const lessons = data.lessons;
const challengesGroups = data.challenges;

async function importData() {
  console.log('📥 A importar conteúdo do 3º Ano...');

  // 1. Importar lições
  const { data: insertedLessons, error: lessonError } = await supabase
    .from('lessons')
    .insert(lessons)
    .select();

  if (lessonError) {
    console.error('❌ Erro ao inserir lições:', lessonError.message);
    return;
  }

  // Criar mapa title -> id para os desafios
  const lessonMap = {};
  insertedLessons.forEach(l => {
    lessonMap[l.title] = l.id;
  });

  // 2. Importar desafios
  let totalChallenges = 0;
  for (const group of challengesGroups) {
    const lessonId = lessonMap[group.lesson_title];
    if (!lessonId) continue;

    for (const challenge of group.challenges) {
      const { error: chError } = await supabase
        .from('lesson_challenges')
        .insert({
          lesson_id: lessonId,
          challenge_index: challenge.challenge_index,
          challenge_type: challenge.challenge_type,
          question: challenge.question,
          content: challenge.content,
          hint: challenge.hint || ''
        });

      if (!chError) totalChallenges++;
    }
  }

  console.log(`✅ Sucesso! ${lessons.length} lições e ${totalChallenges} desafios importados.`);
}

importData();
