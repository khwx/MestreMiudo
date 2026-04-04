/**
 * @fileOverview Adaptive learning system - adjust difficulty based on student performance
 * Implements dynamic difficulty selection and topic focusing
 */

interface PerformanceMetrics {
  [topic: string]: number; // 0-1 score (correct/total)
}

interface AdaptiveParams {
  performanceMetrics: PerformanceMetrics | null;
  diagnosticScore?: number;
  recentQuizzes?: number;
}

/**
 * Determine if student should get easier or harder questions
 */
export function calculateAdaptiveDifficulty(
  performanceMetrics: PerformanceMetrics | null,
  diagnosticScore?: number
): 'beginner' | 'intermediate' | 'advanced' {
  // If no data, default to intermediate
  if (!performanceMetrics && !diagnosticScore) {
    return 'intermediate';
  }

  // Use diagnostic score if available (more reliable for new students)
  if (diagnosticScore !== undefined) {
    if (diagnosticScore >= 85) return 'advanced';
    if (diagnosticScore >= 70) return 'intermediate';
    return 'beginner';
  }

  // Calculate average from recent performance
  const scores = Object.values(performanceMetrics || {});
  if (scores.length === 0) return 'intermediate';

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (average >= 0.85) return 'advanced';
  if (average >= 0.70) return 'intermediate';
  return 'beginner';
}

/**
 * Identify which topics need more practice
 */
export function getWeakTopics(
  performanceMetrics: PerformanceMetrics | null,
  threshold = 0.65
): string[] {
  if (!performanceMetrics) return [];

  return Object.entries(performanceMetrics)
    .filter(([_, score]) => score < threshold)
    .map(([topic, _]) => topic)
    .sort()
    .slice(0, 3); // Focus on top 3 weak areas
}

/**
 * Get strong topics (areas of confidence)
 */
export function getStrongTopics(
  performanceMetrics: PerformanceMetrics | null,
  threshold = 0.80
): string[] {
  if (!performanceMetrics) return [];

  return Object.entries(performanceMetrics)
    .filter(([_, score]) => score >= threshold)
    .map(([topic, _]) => topic);
}

/**
 * Build adaptive prompt instructions based on performance
 */
export function buildAdaptivePromptInstructions(
  performanceMetrics: PerformanceMetrics | null,
  diagnosticScore?: number
): string {
  const difficulty = calculateAdaptiveDifficulty(performanceMetrics, diagnosticScore);
  const weakTopics = getWeakTopics(performanceMetrics);
  const strongTopics = getStrongTopics(performanceMetrics);

  let prompt = '';

  // Difficulty level guidance
  if (difficulty === 'beginner') {
    prompt += `\nADAPTIVE NOTE: Student is learning fundamentals. Keep questions very simple and encouraging.`;
  } else if (difficulty === 'intermediate') {
    prompt += `\nADAPTIVE NOTE: Student is progressing well. Gradually increase complexity.`;
  } else {
    prompt += `\nADAPTIVE NOTE: Student is advanced. Challenge them with complex scenarios and multi-step problems.`;
  }

  // Weak topics - need reinforcement
  if (weakTopics.length > 0) {
    prompt += `\n\nFOCUS AREAS (student needs more practice):`;
    weakTopics.forEach(topic => {
      prompt += `\n- ${topic}: Create questions that gradually build understanding`;
    });
  }

  // Strong topics - can leverage for context
  if (strongTopics.length > 0) {
    prompt += `\n\nSTRENGTHS (use these in context/connections):`;
    strongTopics.forEach(topic => {
      prompt += `\n- ${topic}: Student has mastered this`;
    });
  }

  return prompt;
}

/**
 * Determine recommended next subject based on performance
 */
export function getRecommendedSubject(
  recentQuizzes?: Array<{ subject: string; score: number; total: number }>
): string | undefined {
  if (!recentQuizzes || recentQuizzes.length === 0) {
    return undefined;
  }

  // Calculate average score per subject
  const subjectScores: Record<string, { totalScore: number; count: number }> = {};

  recentQuizzes.forEach(quiz => {
    if (!subjectScores[quiz.subject]) {
      subjectScores[quiz.subject] = { totalScore: 0, count: 0 };
    }
    subjectScores[quiz.subject].totalScore += quiz.score;
    subjectScores[quiz.subject].count += quiz.total;
  });

  // Find subject with lowest average score
  let weakestSubject = undefined;
  let lowestAverage = 1;

  Object.entries(subjectScores).forEach(([subject, scores]) => {
    const average = scores.totalScore / scores.count;
    if (average < lowestAverage) {
      lowestAverage = average;
      weakestSubject = subject;
    }
  });

  return weakestSubject;
}

/**
 * Generate adaptive feedback message
 */
export function generateAdaptiveFeedback(
  score: number,
  total: number,
  performanceMetrics: PerformanceMetrics | null
): string {
  const percentage = (score / total) * 100;

  if (percentage >= 90) {
    return '🌟 Excelente! Está a ir muito bem!';
  } else if (percentage >= 80) {
    return '👏 Muito bom! Continue assim!';
  } else if (percentage >= 70) {
    return '✅ Bom esforço! Continue a praticar!';
  } else if (percentage >= 50) {
    return '💪 Está no caminho certo! Mais um pouco!';
  } else {
    return '📚 Não desista! Continue a treinar!';
  }
}
