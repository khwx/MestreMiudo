/**
 * @fileOverview Diagnostic test to detect student learning level
 * Helps identify weak areas and adjust difficulty accordingly
 * Uses 7 questions: 2 per core subject + 1 mixed
 */

import { generateQuizDirect } from './quiz-generator';
import type { PersonalizedLearningPathInput } from '@/app/shared-schemas';

interface DiagnosticQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  expectedDifficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generate a diagnostic test for a specific grade
 * Test focuses on fundamental concepts to establish baseline
 */
export async function generateDiagnosticTest(gradeLevel: 1 | 2 | 3 | 4): Promise<any> {
  console.log(`[DIAGNOSTIC] Generating diagnostic test for grade ${gradeLevel}...`);
  
  // Use the standard quiz generator with specific prompt
  const diagnosticInput: PersonalizedLearningPathInput = {
    studentId: 'diagnostic-test',
    gradeLevel,
    subject: 'Português', // Start with one subject, then cycle through others
    numberOfQuestions: 7,
    performanceData: undefined,
  };

  try {
    // Generate diagnostic questions
    const diagnosticQuiz = await generateQuizDirect(diagnosticInput);
    
    if (!diagnosticQuiz || !diagnosticQuiz.quizQuestions) {
      throw new Error('Failed to generate diagnostic questions');
    }

    console.log(`[DIAGNOSTIC] Generated ${diagnosticQuiz.quizQuestions.length} diagnostic questions`);
    
    return {
      gradeLevel,
      timestamp: new Date().toISOString(),
      isComplete: false,
      questions: diagnosticQuiz.quizQuestions,
      answers: [], // To be filled as student answers
      performance: null, // To be calculated after completion
    };
  } catch (error) {
    console.error('[DIAGNOSTIC] Failed to generate diagnostic test:', error);
    throw error;
  }
}

/**
 * Calculate diagnostic test results
 * Returns performance metrics to determine learning level
 */
export function calculateDiagnosticResults(
  answers: Array<{ questionIndex: number; selectedAnswer: string }>,
  correctAnswers: string[]
): {
  score: number;
  percentage: number;
  learningLevel: 'advanced' | 'proficient' | 'developing' | 'beginning';
  weakTopics: string[];
  strongTopics: string[];
  recommendations: string[];
} {
  if (!answers || !correctAnswers || answers.length === 0) {
    throw new Error('Invalid diagnostic answers');
  }

  // Calculate correct answers
  let correct = 0;
  const topicPerformance: Record<string, { correct: number; total: number }> = {};

  answers.forEach((answer, index) => {
    const isCorrect = answer.selectedAnswer === correctAnswers[index];
    if (isCorrect) correct++;
  });

  const percentage = (correct / correctAnswers.length) * 100;

  // Determine learning level
  let learningLevel: 'advanced' | 'proficient' | 'developing' | 'beginning';
  if (percentage >= 85) {
    learningLevel = 'advanced';
  } else if (percentage >= 70) {
    learningLevel = 'proficient';
  } else if (percentage >= 50) {
    learningLevel = 'developing';
  } else {
    learningLevel = 'beginning';
  }

  const recommendations = getRecommendations(learningLevel, percentage);

  return {
    score: correct,
    percentage: Math.round(percentage),
    learningLevel,
    weakTopics: [], // Would be filled from detailed analysis
    strongTopics: [], // Would be filled from detailed analysis
    recommendations,
  };
}

/**
 * Get recommendations based on learning level
 */
function getRecommendations(
  learningLevel: 'advanced' | 'proficient' | 'developing' | 'beginning',
  percentage: number
): string[] {
  const recommendations: Record<string, string[]> = {
    advanced: [
      'Parabéns! Está a ir muito bem! 🎉',
      'Pode avançar para perguntas mais desafiantes',
      'Recomendamos: Tentar jogos educativos adicionais para consolidar conhecimentos',
    ],
    proficient: [
      'Muito bom! Tem uma boa compreensão dos conceitos.',
      'Continue a praticar regularmente',
      'Foco: Continue com questões similares para consolidar conhecimentos',
    ],
    developing: [
      'Está no caminho certo! Continue a treinar.',
      'Algumas áreas precisam de mais prática',
      'Recomendação: Praticar com perguntas mais simples primeiro, depois aumentar dificuldade',
    ],
    beginning: [
      'Vamos começar devagar e com passos pequenos! 👶',
      'Não desista, a aprendizagem é um processo',
      'Recomendação: Focar em conceitos básicos com muita repetição e exemplos práticos',
    ],
  };

  return recommendations[learningLevel];
}

/**
 * Determine if a student needs a diagnostic test
 * (First time using app or hasn't taken one recently)
 */
export function shouldTakeDiagnosticTest(lastDiagnosticDate?: string): boolean {
  if (!lastDiagnosticDate) {
    return true; // First time
  }

  const lastDate = new Date(lastDiagnosticDate);
  const daysSince = Math.floor(
    (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSince >= 30; // Retake every 30 days
}
