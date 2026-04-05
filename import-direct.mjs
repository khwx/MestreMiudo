import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sampleData = JSON.parse(fs.readFileSync('./docs/sample-lessons.json', 'utf-8'));
const lessons = sampleData.lessons;

console.log(`📥 A importar ${lessons.length} lições...\n`);

for (const lesson of lessons) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select();

  if (error) {
    console.log(`❌ ${lesson.title}: ${error.message}`);
  } else {
    console.log(`✅ ${lesson.title} (id: ${data[0].id})`);
  }
}

console.log('\n✨ Verificação final:');
const { data: allLessons } = await supabase.from('lessons').select('id, subject, title');
console.log(`Total na base de dados: ${allLessons?.length || 0}`);
