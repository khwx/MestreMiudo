#!/usr/bin/env node

/**
 * 🚀 Lesson Creator - Cria lições reais no Supabase baseado no currículo
 * 
 * Uso: node create-lessons.mjs [subject] [grade]
 * Exemplo: node create-lessons.mjs português 1
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Adicione a .env.local:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento de disciplinas
const subjects = {
  'português': 'Português',
  'portugues': 'Português',
  'matemática': 'Matemática',
  'matematica': 'Matemática',
  'estudo do meio': 'Estudo do Meio',
  'estudo-do-meio': 'Estudo do Meio',
};

// Templates de lições por disciplina
const lessonTemplates = {
  'Português': [
    {
      title: 'As Vogais - A, E, I, O, U',
      description: 'Aprenda a identificar as cinco vogais',
      learning_objective: 'Identificar e pronunciar todas as vogais',
      story_context: 'A Maria está a explorar o mundo das letras!',
      difficulty: 'easy',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual é a primeira vogal do alfabeto?',
          content: {
            options: ['A', 'B', 'C'],
            correct_answer: 'A',
          },
          hint: 'É a primeira letra que aprendemos',
        },
        {
          type: 'fill_blank',
          question: 'A palavra "___ vento" começa com uma vogal.',
          content: {
            correct_answers: ['o', 'O'],
          },
          hint: 'Uma preposição comum',
        },
        {
          type: 'matching',
          question: 'Liga cada vogal ao seu nome:',
          content: {
            pairs: [
              { left: 'A', options: ['á', 'A', 'Z'] },
              { left: 'E', options: ['Ê', 'E', 'W'] },
            ],
          },
        },
      ],
    },
    {
      title: 'Consoantes B, C, D',
      description: 'Conheça as primeiras consoantes',
      learning_objective: 'Aprender os sons das consoantes B, C, D',
      story_context: 'O João está descobrindo novos sons!',
      difficulty: 'easy',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual é a primeira consoante?',
          content: {
            options: ['B', 'D', 'C'],
            correct_answer: 'B',
          },
        },
        {
          type: 'fill_blank',
          question: '"___" é uma consoante que soa como "bé"',
          content: {
            correct_answers: ['b', 'B'],
          },
        },
      ],
    },
    {
      title: 'Palavras Simples',
      description: 'Ler e escrever palavras simples',
      learning_objective: 'Construir palavras com vogais e consoantes',
      story_context: 'Construindo o nosso primeiro vocabulário!',
      difficulty: 'normal',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual destas é uma palavra válida?',
          content: {
            options: ['gato', 'zxq', 'pqr'],
            correct_answer: 'gato',
          },
        },
      ],
    },
  ],
  'Matemática': [
    {
      title: 'Números de 1 a 5',
      description: 'Aprender a contar até 5',
      learning_objective: 'Contar e reconhecer números 1-5',
      story_context: 'O João está contando os seus dedos!',
      difficulty: 'easy',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Quantos dedos tem uma mão?',
          content: {
            options: ['3', '5', '10'],
            correct_answer: '5',
          },
        },
        {
          type: 'fill_blank',
          question: '2 + 1 = ?',
          content: {
            correct_answers: ['3', 'três'],
          },
        },
        {
          type: 'matching',
          question: 'Liga o número à quantidade:',
          content: {
            pairs: [
              { left: '1', options: ['Um', 'Dois', 'Três'] },
              { left: '3', options: ['Um', 'Dois', 'Três'] },
            ],
          },
        },
      ],
    },
    {
      title: 'Números de 6 a 10',
      description: 'Aprender a contar de 6 a 10',
      learning_objective: 'Contar e reconhecer números 6-10',
      story_context: 'Continuando a contar com o João!',
      difficulty: 'easy',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual número vem depois de 7?',
          content: {
            options: ['6', '8', '9'],
            correct_answer: '8',
          },
        },
        {
          type: 'fill_blank',
          question: '5 + 5 = ?',
          content: {
            correct_answers: ['10', 'dez'],
          },
        },
      ],
    },
    {
      title: 'Adição Simples',
      description: 'Somar números pequenos',
      learning_objective: 'Realizar adições simples até 10',
      story_context: 'Ajudando o João a somar maçãs!',
      difficulty: 'normal',
      challenges: [
        {
          type: 'multiple_choice',
          question: '2 + 3 = ?',
          content: {
            options: ['4', '5', '6'],
            correct_answer: '5',
          },
        },
        {
          type: 'fill_blank',
          question: '4 + 2 = ?',
          content: {
            correct_answers: ['6', 'seis'],
          },
        },
      ],
    },
  ],
  'Estudo do Meio': [
    {
      title: 'Os Animais Domésticos',
      description: 'Conhecer os animais que vivem com as pessoas',
      learning_objective: 'Identificar e nomear animais domésticos',
      story_context: 'A Maria tem um cão chamado Max!',
      difficulty: 'easy',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual é um animal doméstico?',
          content: {
            options: ['Leão', 'Gato', 'Tigre'],
            correct_answer: 'Gato',
          },
        },
        {
          type: 'matching',
          question: 'Liga o animal ao som que faz:',
          content: {
            pairs: [
              { left: 'Cão', options: ['Miau', 'Au au', 'Muuu'] },
              { left: 'Gato', options: ['Miau', 'Au au', 'Muuu'] },
            ],
          },
        },
      ],
    },
    {
      title: 'As Plantas',
      description: 'Aprenda sobre as plantas e as suas partes',
      learning_objective: 'Identificar partes da planta (raiz, caule, folha)',
      story_context: 'O João plantou uma flor no jardim!',
      difficulty: 'normal',
      challenges: [
        {
          type: 'multiple_choice',
          question: 'Qual é a parte da planta que absorve água?',
          content: {
            options: ['Folha', 'Flor', 'Raiz'],
            correct_answer: 'Raiz',
          },
        },
      ],
    },
  ],
};

async function createLessons(subject, grade) {
  const subjectName = subjects[subject.toLowerCase()];

  if (!subjectName) {
    console.error(`❌ Disciplina inválida: ${subject}`);
    console.log(`✅ Disciplinas disponíveis: ${Object.keys(subjects).join(', ')}`);
    process.exit(1);
  }

  if (grade < 1 || grade > 4) {
    console.error(`❌ Grade inválida: ${grade}. Deve ser 1-4`);
    process.exit(1);
  }

  console.log(`\n🚀 Criando lições para ${subjectName} - Grade ${grade}`);
  console.log(`📡 Conectando a Supabase...`);

  const templates = lessonTemplates[subjectName] || [];

  if (templates.length === 0) {
    console.error(`❌ Nenhum template encontrado para ${subjectName}`);
    process.exit(1);
  }

  let createdCount = 0;
  let errorCount = 0;

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];

    try {
      // Criar lição
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          subject: subjectName,
          grade_level: grade,
          title: template.title,
          description: template.description,
          learning_objective: template.learning_objective,
          story_context: template.story_context,
          difficulty: template.difficulty,
          lesson_index: i + 1,
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      console.log(`✅ Lição ${i + 1}: "${template.title}"`);

      // Criar desafios para esta lição
      for (let j = 0; j < template.challenges.length; j++) {
        const challenge = template.challenges[j];

        const { error: challengeError } = await supabase
          .from('lesson_challenges')
          .insert({
            lesson_id: lesson.id,
            challenge_index: j + 1,
            challenge_type: challenge.type,
            question: challenge.question,
            content: challenge.content,
            hint: challenge.hint || null,
          });

        if (challengeError) throw challengeError;

        console.log(`   └─ Desafio ${j + 1}: ${challenge.type}`);
      }

      createdCount++;
    } catch (error) {
      console.error(`❌ Erro ao criar lição "${template.title}":`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`  ✅ Lições criadas: ${createdCount}`);
  console.log(`  ❌ Erros: ${errorCount}`);
  console.log(`  📚 Total de desafios: ${templates.reduce((sum, t) => sum + t.challenges.length, 0)}`);
}

// Executar
const subject = process.argv[2];
const grade = parseInt(process.argv[3], 10);

if (!subject || !grade) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🎓 Lesson Creator - Cria Lições Reais          ║
╚═══════════════════════════════════════════════════════════╝

Uso:
  node create-lessons.mjs <disciplina> <grade>

Exemplos:
  node create-lessons.mjs português 1
  node create-lessons.mjs matemática 1
  node create-lessons.mjs "estudo do meio" 1

Disciplinas:
  - português (ou portugues)
  - matemática (ou matematica)
  - estudo do meio (ou estudo-do-meio)

Grades: 1, 2, 3, 4

Requisitos:
  1. Ter NEXT_PUBLIC_SUPABASE_URL em .env.local
  2. Ter SUPABASE_SERVICE_ROLE_KEY em .env.local
  3. Ter o database schema criado (supabase-setup.sql)
  `);
  process.exit(0);
}

createLessons(subject, grade).catch(console.error);
