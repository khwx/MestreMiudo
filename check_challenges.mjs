import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('🔍 Verificando desafios da lição "As Vogais - A, E, I, O, U"...\n');

  // Buscar a lição
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('title', 'As Vogais - A, E, I, O, U')
    .single();

  if (lessonError) {
    console.error('❌ Erro:', lessonError.message);
    return;
  }

  console.log(`📋 Lição encontrada: ${lesson.title} (id: ${lesson.id})\n`);

  // Buscar os desafios
  const { data: challenges, error: challengesError } = await supabase
    .from('lesson_challenges')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('challenge_index', { ascending: true });

  if (challengesError) {
    console.error('❌ Erro:', challengesError.message);
    return;
  }

  console.log(`✅ Desafios encontrados: ${challenges?.length || 0}`);
  challenges?.forEach(ch => {
    console.log(`\n  🎯 Desafio ${ch.challenge_index}:`);
    console.log(`    Tipo: ${ch.challenge_type}`);
    console.log(`    Pergunta: ${ch.question}`);
    console.log(`    Conteúdo: ${JSON.stringify(ch.content)}`);
  });
}

check();
