import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('🔍 Verificando todas as lições na base de dados...\n');

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*');

  if (lessonsError) {
    console.error('❌ Erro:', lessonsError.message);
    return;
  }

  console.log(`📋 Total de lições: ${lessons?.length || 0}\n`);
  lessons?.forEach(l => {
    console.log(`   - ${l.subject} (Grade ${l.grade_level}): ${l.title} (id: ${l.id})`);
  });
}

check();
