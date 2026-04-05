import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('🔍 Verificando desafios ligados às lições corretas...\n');

  // Buscar todas as lições
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*');

  if (lessonsError) {
    console.error('❌ Erro:', lessonsError.message);
    return;
  }

  // Para cada lição, buscar os desafios
  for (const lesson of lessons) {
    const { data: challenges, error: challengesError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('challenge_index', { ascending: true });

    if (challengesError) {
      console.error(`❌ ${lesson.title}:`, challengesError.message);
      continue;
    }

    console.log(`✅ ${lesson.title}: ${challenges?.length || 0} desafios`);
    challenges?.forEach(ch => {
      console.log(`   - Desafio ${ch.challenge_index}: ${ch.question}`);
    });
  }
}

check();
