/**
 * Curriculum Alignment Validator
 * 
 * Garante que todas as questões geradas estão alinhadas com o currículo português
 * para o 1º Ciclo (Grades 1-4)
 */

import curriculumData from './curriculum-topics.json';

// Tópicos PROIBIDOS para Grade 1-2 (fora do currículo)
const FORBIDDEN_TOPICS_GRADE_1_2 = [
  'percentagem',
  'percentag',
  'população',
  'taxa de crescimento',
  'variação percentual',
  'análise de dados complexa',
  'estatística',
  'probabilidade',
  'bactéria',
  'vírus',
  'célula',
  'biologia molecular',
  'genética',
  'evolução',
  'fotossíntese',
  'ecossistema complexo',
  'cadeia alimentar avançada',
  'física quântica',
  'relatividade',
  'equações diferenciais',
  'cálculo',
  'álgebra simbólica',
  'trigonometria',
  'logaritmos',
  'exponenciação avançada',
];

// Tópicos PERMITIDOS apenas em Grade 3-4
const GRADE_3_4_ONLY_TOPICS = [
  'fração',
  'metade',
  'quarto',
  'dobro',
  'triplo',
  'multiplicação',
  'divisão',
  'geometria básica',
  'triângulo',
  'quadrado',
  'círculo',
];

// Tópicos PERMITIDOS apenas em Grade 5+
const GRADE_5_PLUS_ONLY_TOPICS = [
  'percentagem',
  'desconto',
  'aumento',
  'proporção',
  'razão',
  'média',
  'moda',
  'mediana',
];

interface ValidationResult {
  isValid: boolean;
  grade: number;
  issues: string[];
  warnings: string[];
}

/**
 * Valida se uma questão está alinhada com o currículo
 */
export function validateQuestionForCurriculum(
  question: string,
  grade: number,
  subject: string,
): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Verificar Grade 1-2
  if (grade === 1 || grade === 2) {
    for (const forbiddenTopic of FORBIDDEN_TOPICS_GRADE_1_2) {
      if (question.toLowerCase().includes(forbiddenTopic)) {
        issues.push(
          `❌ Tópico proibido para Grade ${grade}: "${forbiddenTopic}" está FORA do currículo português para esta idade.`,
        );
        isValid = false;
      }
    }
  }

  // Verificar Grade 3-4
  if (grade === 3 || grade === 4) {
    for (const forbiddenTopic of FORBIDDEN_TOPICS_GRADE_1_2) {
      // Exceção: frações e conceitos básicos são OK em Grade 3-4
      if (
        !GRADE_3_4_ONLY_TOPICS.some((t) => forbiddenTopic.includes(t)) &&
        question.toLowerCase().includes(forbiddenTopic)
      ) {
        issues.push(
          `❌ Tópico avançado para Grade ${grade}: "${forbiddenTopic}" deve ser Grade 5+.`,
        );
        isValid = false;
      }
    }
  }

  // Verificar Grade 5+ apenas para percentagens complexas
  if (grade >= 5) {
    // Grade 5+ pode ter percentagens simples
    if (
      question.toLowerCase().includes('variação percentual composta') ||
      question.toLowerCase().includes('percentagem de percentagem')
    ) {
      warnings.push(
        'Variações percentuais compostas são melhor abordadas em Grade 7+',
      );
    }
  }

  // Verificar complexidade geral
  const wordCount = question.split(' ').length;
  const maxWordsGrade: Record<number, number> = {
    1: 10,
    2: 12,
    3: 15,
    4: 20,
  };

  const max = maxWordsGrade[Math.min(grade, 4)];
  if (wordCount > max) {
    warnings.push(
      `Questão pode ser muito longa para Grade ${grade} (${wordCount} palavras, máximo sugerido: ${max})`,
    );
  }

  return {
    isValid,
    grade,
    issues,
    warnings,
  };
}

/**
 * Valida um conjunto de questões
 */
export function validateQuestionsForCurriculum(
  questions: Array<{
    question: string;
    grade: number;
    subject: string;
  }>,
): {
  valid: number;
  invalid: number;
  issues: Array<{ question: string; errors: string[] }>;
  summary: string;
} {
  let valid = 0;
  let invalid = 0;
  const issues: Array<{ question: string; errors: string[] }> = [];

  for (const q of questions) {
    const result = validateQuestionForCurriculum(q.question, q.grade, q.subject);
    if (result.isValid) {
      valid++;
    } else {
      invalid++;
      issues.push({
        question: q.question,
        errors: result.issues,
      });
    }
  }

  return {
    valid,
    invalid,
    issues,
    summary:
      invalid === 0
        ? `✅ Todas as ${valid} questões estão alinhadas com o currículo`
        : `⚠️  ${invalid}/${valid + invalid} questões estão fora do currículo português`,
  };
}

/**
 * Obter tópicos recomendados para uma grade/disciplina
 */
export function getRecommendedTopicsForGrade(
  grade: number,
  subject: string,
): string[] {
  const typedCurriculumData = curriculumData as Record<string, any>;
  if (!typedCurriculumData[subject] || !typedCurriculumData[subject][grade]) {
    return [];
  }

  const domains = typedCurriculumData[subject][grade].domains || [];
  const topics: string[] = [];

  for (const domain of domains) {
    topics.push(domain.name);
    if (domain.descriptors) {
      // Extrair palavras-chave dos descritores
      domain.descriptors.forEach((desc: string) => {
        const keywords = desc
          .split(/[,;]/)
          .map((k) => k.trim())
          .filter((k) => k.length > 3)
          .slice(0, 3);
        topics.push(...keywords);
      });
    }
  }

  return [...new Set(topics)];
}

export default {
  validateQuestionForCurriculum,
  validateQuestionsForCurriculum,
  getRecommendedTopicsForGrade,
  FORBIDDEN_TOPICS_GRADE_1_2,
  GRADE_3_4_ONLY_TOPICS,
  GRADE_5_PLUS_ONLY_TOPICS,
};
