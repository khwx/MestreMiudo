#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          📚 MestreMiudo - Auto-Importar Lições                ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Passo 1: Verificar se as tabelas existem
console.log("🔍 Verificando estado das tabelas...\n");

async function checkAndImport() {
  // Tentar fazer uma query simples para verificar se a tabela existe
  const { error: tableError } = await supabase
    .from('lessons')
    .select('*')
    .limit(1);

  if (tableError && tableError.code === 'PGRST205') {
    console.log("❌ Tabelas ainda não foram criadas!\n");
    console.log("📋 PRÓXIMOS PASSOS:");
    console.log("─".repeat(60));
    console.log("1. Abra: https://supabase.com/dashboard");
    console.log("2. SQL Editor → New Query");
    console.log("3. Cole: supabase-setup.sql");
    console.log("4. Clique: Run");
    console.log("5. Execute novamente: node auto-import-lessons.mjs");
    console.log("─".repeat(60) + "\n");
    process.exit(1);
  }

  if (tableError) {
    console.error("❌ Erro desconhecido:", tableError);
    process.exit(1);
  }

  // Tabelas existem! Vamos importar
  console.log("✅ Tabelas criadas com sucesso!\n");
  console.log("📥 Importando lições de exemplo...\n");

  // Ler ficheiro de lições
  const sampleLessonsRaw = fs.readFileSync('./docs/sample-lessons.json', 'utf-8');
  const sampleData = JSON.parse(sampleLessonsRaw);

  const lessons = sampleData.lessons;
  const challenges = sampleData.challenges || [];

  // Inserir lições
  console.log(`  ▪ ${lessons.length} lições...`);
  const { error: lessonError, data: insertedLessons } = await supabase
    .from('lessons')
    .insert(lessons)
    .select();

  if (lessonError) {
    console.error("  ❌ Erro ao inserir lições:", lessonError.message);
    process.exit(1);
  }

  console.log(`  ✅ ${lessons.length} lições importadas!\n`);

  // Se temos desafios, inseri-los também
  if (challenges.length > 0) {
    console.log(`  ▪ ${challenges.length} desafios...`);
    const { error: challengeError } = await supabase
      .from('lesson_challenges')
      .insert(challenges);

    if (challengeError) {
      console.error("  ❌ Erro ao inserir desafios:", challengeError.message);
      process.exit(1);
    }

    console.log(`  ✅ ${challenges.length} desafios importados!\n`);
  }

  console.log("═".repeat(60));
  console.log("✨ Importação concluída com sucesso!\n");

  console.log("📍 Próximas Ações:");
  console.log("─".repeat(60));
  console.log("1. Iniciar servidor: npm run dev");
  console.log("2. Abrir: http://localhost:3000/dashboard/learn");
  console.log("3. Selecionar uma disciplina");
  console.log("4. Fazer uma lição!");
  console.log("─".repeat(60) + "\n");
}

checkAndImport().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});

