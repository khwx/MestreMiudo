import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('🔍 Verificando lições na base de dados...\n');

  // Check all lessons
  const { data: allLessons, error: allError } = await supabase
    .from('lessons')
    .select('id, subject, grade_level, title');

  if (allError) {
    console.error('❌ Erro ao buscar lições:', allError.message);
    return;
  }

  console.log(`📋 Total de lições: ${allLessons?.length || 0}`);
  allLessons?.forEach(l => {
    console.log(`   - ${l.subject} (Grade ${l.grade_level}): ${l.title}`);
  });

  // Try to fetch lessons like the app does
  console.log('\n🔍 Testando query como a app (Português, Grade 1):');
  const { data: ptLessons, error: ptError } = await supabase
    .from('lessons')
    .select('*')
    .eq('subject', 'Português')
    .eq('grade_level', 1)
    .order('lesson_index', { ascending: true });

  if (ptError) {
    console.error('❌ Erro:', ptError.message);
  } else {
    console.log(`✅ Lições encontradas: ${ptLessons?.length || 0}`);
  }

  // Try with Matematica
  console.log('\n🔍 Testando query (Matemática, Grade 1):');
  const { data: mathLessons, error: mathError } = await supabase
    .from('lessons')
    .select('*')
    .eq('subject', 'Matemática')
    .eq('grade_level', 1)
    .order('lesson_index', { ascending: true });

  if (mathError) {
    console.error('❌ Erro:', mathError.message);
  } else {
    console.log(`✅ Lições encontradas: ${mathLessons?.length || 0}`);
  }
}

check();
