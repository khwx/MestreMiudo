import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sampleData = JSON.parse(fs.readFileSync('./docs/sample-lessons.json', 'utf-8'));
const challengesData = sampleData.challenges || [];

console.log('🔍 A mapear lições para desafios...\n');

// 1. Buscar todas as lições para saber os IDs
const { data: lessons, error: lessonsError } = await supabase
  .from('lessons')
  .select('id, title');

if (lessonsError) {
  console.error('❌ Erro ao buscar lições:', lessonsError.message);
  process.exit(1);
}

// Criar mapa title -> id
const lessonMap = {};
lessons.forEach(l => {
  lessonMap[l.title] = l.id;
});

let totalInserted = 0;

// 2. Inserir desafios
for (const group of challengesData) {
  const lessonTitle = group.lesson_title;
  const lessonId = lessonMap[lessonTitle];

  if (!lessonId) {
    console.log(`⚠️ Lição não encontrada para desafios: "${lessonTitle}"`);
    continue;
  }

  console.log(`📝 A inserir desafios para: ${lessonTitle}`);

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
      console.error(`  ❌ Erro ao inserir desafio ${challenge.challenge_index}:`, error.message);
    } else {
      console.log(`  ✅ Desafio ${challenge.challenge_index} inserido`);
      totalInserted++;
    }
  }
}

console.log(`\n✨ Total de desafios inseridos: ${totalInserted}`);
