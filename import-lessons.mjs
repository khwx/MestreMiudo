import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Ler o arquivo de lições de exemplo
const sampleLessonsRaw = fs.readFileSync('./docs/sample-lessons.json', 'utf-8');
const sampleData = JSON.parse(sampleLessonsRaw);

console.log("📚 Importar Lições de Exemplo - MestreMiudo\n");

// Processar lições
const lessons = sampleData.lessons;
const challenges = sampleData.challenges || [];

console.log(`Lições a importar: ${lessons.length}`);
console.log(`Desafios a importar: ${challenges.length}\n`);

// Tentar inserir lições
console.log("🔄 Inserindo lições...");
const { data: insertedLessons, error: lessonError } = await supabase
  .from('lessons')
  .insert(lessons);

if (lessonError) {
  console.error("❌ Erro ao inserir lições:", lessonError);
  console.error("\n💡 Solução: As tabelas 'lessons' não existem ainda.");
  console.error("Execute o SQL em supabase-setup.sql primeiro!\n");
  process.exit(1);
} else {
  console.log(`✅ ${lessons.length} lições inseridas com sucesso!`);
}

// Se temos desafios, inseri-los também
if (challenges.length > 0) {
  console.log("\n🔄 Inserindo desafios...");
  const { data: insertedChallenges, error: challengeError } = await supabase
    .from('lesson_challenges')
    .insert(challenges);

  if (challengeError) {
    console.error("❌ Erro ao inserir desafios:", challengeError);
  } else {
    console.log(`✅ ${challenges.length} desafios inseridos com sucesso!`);
  }
}

console.log("\n✨ Importação concluída!");

