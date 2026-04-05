#!/usr/bin/env node

/**
 * Curriculum Content Parser & Lesson Generator
 * Extrai conteúdo dos ficheiros de currículo e cria lições estruturadas
 * 
 * Uso: node extract-curriculum.mjs [subject] [grade]
 * Exemplo: node extract-curriculum.mjs português 1
 */

import fs from 'fs';
import path from 'path';

const CURRICULUM_DIR = './curriculum_pdfs';
const OUTPUT_DIR = './docs/curriculum-analysis';

// Mapeamento de disciplinas
const subjects = {
  'português': 'Português',
  'portugues': 'Português',
  'matemática': 'Matemática',
  'matematica': 'Matemática',
  'estudo do meio': 'Estudo do Meio',
  'estudo-do-meio': 'Estudo do Meio',
};

// Padrões de secções para cada disciplina
const sectionPatterns = {
  'Português': [
    { name: 'ORALIDADE', keywords: ['compreensão oral', 'expressão oral', 'escutar'] },
    { name: 'LEITURA-ESCRITA', keywords: ['leitura', 'escrita', 'grafemas'] },
    { name: 'EDUCAÇÃO LITERÁRIA', keywords: ['literatura', 'textos literários'] },
    { name: 'CONHECIMENTO EXPLÍCITO', keywords: ['gramática', 'estrutura', 'funcionamento'] },
  ],
  'Matemática': [
    { name: 'NÚMEROS', keywords: ['números', 'contagem', 'quantidade'] },
    { name: 'ÁLGEBRA', keywords: ['álgebra', 'padrões', 'sequências'] },
    { name: 'GEOMETRIA E MEDIDA', keywords: ['forma', 'medida', 'espaço'] },
    { name: 'DADOS E PROBABILIDADES', keywords: ['dados', 'probabilidade', 'frequência'] },
  ],
  'Estudo do Meio': [
    { name: 'NATUREZA', keywords: ['natureza', 'seres vivos', 'plantas', 'animais'] },
    { name: 'AMBIENTE', keywords: ['ambiente', 'recursos', 'sustentabilidade'] },
    { name: 'HISTÓRIA', keywords: ['história', 'passado', 'eventos'] },
    { name: 'GEOGRAFIA', keywords: ['geografia', 'espaço', 'comunidade'] },
  ],
};

async function extractCurriculum(subject, grade) {
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

  // Determinar nome do ficheiro
  const filename = subjectName.toLowerCase().replace(/[ ]/g, '_') + `_grade_${grade}.txt`;
  const filepath = path.join(CURRICULUM_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`❌ Ficheiro não encontrado: ${filename}`);
    process.exit(1);
  }

  console.log(`📚 Analisando: ${subjectName} - Grade ${grade}`);
  console.log(`📄 Ficheiro: ${filepath}`);

  // Ler conteúdo
  const content = fs.readFileSync(filepath, 'utf-8');

  // Extrair secções principais
  const sections = sectionPatterns[subjectName] || [];
  const extractedSections = {};

  for (const section of sections) {
    extractedSections[section.name] = extractSection(content, section);
  }

  // Criar análise estruturada
  const analysis = {
    subject: subjectName,
    grade,
    timestamp: new Date().toISOString(),
    sections: extractedSections,
    summary: generateLessonIdeas(subjectName, grade, extractedSections),
  };

  // Salvar análise
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputFile = path.join(OUTPUT_DIR, `${subjectName.toLowerCase()}_${grade}_analysis.json`);
  fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

  // Exibir resultado
  console.log('\n✅ Análise Completa!\n');
  displayAnalysis(analysis);

  // Gerar ficheiro de lições propostas
  const lessonsFile = path.join(OUTPUT_DIR, `${subjectName.toLowerCase()}_${grade}_lessons.md`);
  fs.writeFileSync(lessonsFile, generateLessonsMarkdown(analysis));

  console.log(`\n📝 Ficheiros gerados:`);
  console.log(`  - ${outputFile}`);
  console.log(`  - ${lessonsFile}`);
}

function extractSection(content, section) {
  const lines = content.split('\n');
  const extracted = {
    name: section.name,
    content: [],
    topics: [],
    learningPoints: [],
  };

  let inSection = false;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início de secção
    if (line.includes(section.name)) {
      inSection = true;
      continue;
    }

    // Detectar fim de secção (quando encontra outra em caps)
    if (inSection && line.match(/^[A-Z]{2,}/)) {
      break;
    }

    if (inSection && line.trim()) {
      sectionContent.push(line.trim());
    }
  }

  // Processar conteúdo extraído
  extracted.content = sectionContent.slice(0, 100); // Primeiras 100 linhas
  
  // Extrair pontos de aprendizado (linhas com bullet points ou estrutura)
  extracted.learningPoints = sectionContent
    .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('■'))
    .slice(0, 10);

  return extracted;
}

function generateLessonIdeas(subject, grade, sections) {
  const ideas = {
    subject,
    grade,
    suggestedLessonCount: 8 + (grade - 1) * 2, // 8, 10, 12, 14 lições por grade
    suggestedLessonTopics: [],
  };

  for (const [sectionName, data] of Object.entries(sections)) {
    if (data.learningPoints && data.learningPoints.length > 0) {
      // Criar ideias de lições baseadas nos learning points
      const topics = data.learningPoints.slice(0, 3).map((point) => ({
        section: sectionName,
        title: cleanText(point),
        difficulty: calculateDifficulty(grade, point),
        challengeTypes: suggestChallengeTypes(subject, sectionName),
      }));

      ideas.suggestedLessonTopics.push(...topics);
    }
  }

  return ideas;
}

function cleanText(text) {
  return text.replace(/^[•\-■]\s*/, '').trim().slice(0, 80);
}

function calculateDifficulty(grade, text) {
  if (grade === 1) return 'easy';
  if (grade === 2) return 'normal';
  if (grade === 3) return 'normal';
  return 'hard';
}

function suggestChallengeTypes(subject, section) {
  const suggestions = {
    'Português': ['multiple_choice', 'fill_blank', 'word_order', 'matching'],
    'Matemática': ['multiple_choice', 'fill_blank', 'matching'],
    'Estudo do Meio': ['multiple_choice', 'matching'],
  };

  return suggestions[subject] || ['multiple_choice', 'fill_blank'];
}

function displayAnalysis(analysis) {
  console.log(`📚 ${analysis.subject} - Grade ${analysis.grade}`);
  console.log(`\n📋 Secções Encontradas:`);

  for (const [sectionName, data] of Object.entries(analysis.sections)) {
    if (data.learningPoints && data.learningPoints.length > 0) {
      console.log(`\n  ▶ ${data.name}`);
      data.learningPoints.slice(0, 3).forEach((point, i) => {
        console.log(`    ${i + 1}. ${cleanText(point)}`);
      });
    }
  }

  console.log(`\n✨ Ideias de Lições Propostas (${analysis.summary.suggestedLessonCount}):`);
  analysis.summary.suggestedLessonTopics.slice(0, 5).forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic.title}`);
    console.log(`     Secção: ${topic.section} | Dificuldade: ${topic.difficulty}`);
    console.log(`     Desafios: ${topic.challengeTypes.join(', ')}`);
  });
}

function generateLessonsMarkdown(analysis) {
  let md = `# Plano de Lições - ${analysis.subject} (Grade ${analysis.grade})

## 📊 Sumário
- **Disciplina:** ${analysis.subject}
- **Ano:** ${analysis.grade}º
- **Lições Sugeridas:** ${analysis.summary.suggestedLessonCount}
- **Gerado em:** ${new Date(analysis.timestamp).toLocaleDateString('pt-PT')}

## 📚 Secções do Currículo

`;

  for (const [sectionName, data] of Object.entries(analysis.sections)) {
    if (data.learningPoints && data.learningPoints.length > 0) {
      md += `\n### ${data.name}\n\n**Pontos de Aprendizado:**\n`;
      data.learningPoints.slice(0, 5).forEach((point) => {
        md += `- ${cleanText(point)}\n`;
      });
    }
  }

  md += `\n## 💡 Ideias de Lições\n\n`;

  analysis.summary.suggestedLessonTopics.slice(0, 8).forEach((topic, i) => {
    md += `### Lição ${i + 1}: ${topic.title}

- **Secção:** ${topic.section}
- **Dificuldade:** ${topic.difficulty}
- **Tipos de Desafio:** ${topic.challengeTypes.join(', ')}
- **Objetivo de Aprendizado:** [Definir objetivo baseado no conteúdo]
- **Contexto da História:** [Criar contexto envolvente]

**Desafios Propostos:**
1. ${topic.challengeTypes[0] ? `Desafio ${topic.challengeTypes[0].replace(/_/g, ' ')}` : 'Multiple choice'}
2. ${topic.challengeTypes[1] ? `Desafio ${topic.challengeTypes[1].replace(/_/g, ' ')}` : 'Fill blank'}

---

`;
  });

  return md;
}

// Executar
const subject = process.argv[2];
const grade = parseInt(process.argv[3], 10);

if (!subject || !grade) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Curriculum Content Parser & Lesson Generator           ║
╚═══════════════════════════════════════════════════════════╝

Uso:
  node extract-curriculum.mjs <disciplina> <grade>

Exemplos:
  node extract-curriculum.mjs português 1
  node extract-curriculum.mjs matemática 2
  node extract-curriculum.mjs "estudo do meio" 3

Disciplinas disponíveis:
  - português (ou portugues)
  - matemática (ou matematica)
  - estudo do meio (ou estudo-do-meio)

Grades: 1, 2, 3, 4
  `);
  process.exit(0);
}

extractCurriculum(subject, grade).catch(console.error);
