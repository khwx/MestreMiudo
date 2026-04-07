import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, subject, grade_level, title');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('📊 Status das Lições:\n');
  
  for (const lesson of lessons) {
    const { data: challenges, error: chError } = await supabase
      .from('lesson_challenges')
      .select('count')
      .eq('lesson_id', lesson.id);
    
    const count = challenges?.[0]?.count || 0;
    const status = count === 0 ? '❌ SEM DESAFIOS' : `✅ ${count} desafios`;
    console.log(`${status} - ${lesson.subject} G${lesson.grade_level}: ${lesson.title}`);
  }
}

check();
