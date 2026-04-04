/**
 * @fileOverview Quiz feedback system - provides hints and encouraging messages
 * Helps students learn through constructive feedback
 */

interface FeedbackContext {
  question: string;
  correctAnswer: string;
  topic: string;
  studentAnswer: string;
}

interface HintContext {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  attemptNumber: number;
}

/**
 * Generate encouraging feedback messages
 */
export const FEEDBACK_MESSAGES = {
  correct: {
    immediate: [
      '✅ Correto! Muito bem!',
      '🎯 Excelente resposta!',
      '⭐ Parabéns! Acertou!',
      '🌟 Muito bem feito!',
      '💪 Resposta perfeita!',
    ],
    streak: {
      3: '🔥 3 em linha! Está a ir bem!',
      5: '🔥 5 em linha! Impressionante!',
      10: '👑 10 em linha! É um mestre!',
    },
  },
  incorrect: {
    encouraging: [
      '💡 Tente de novo, tem capacidade!',
      '🤔 Boa tentativa, mas não é isso...',
      '📚 Erros nos ajudam a aprender!',
      '🌱 Continue a tentar, vai conseguir!',
      '💪 Próxima vez acerta!',
    ],
    hint_available: '💡 Quer uma dica? Clique em "Dica"',
  },
};

/**
 * Generate progressive hints for a question
 */
export function generateHint(context: HintContext): string {
  const { question, correctAnswer, topic, attemptNumber, options } = context;

  // First hint: generic guidance
  if (attemptNumber === 1) {
    const hints: Record<string, string> = {
      'Números': 'Pense no valor numérico...',
      'Cores': 'Visualize a cor na sua mente...',
      'Animais': 'Pense nas características deste animal...',
      'Formas': 'Conte os lados ou vértices...',
      'Operações': 'Faça a conta passo a passo...',
      'Leitura': 'Leia novamente com cuidado...',
      'Geografia': 'Pense na localização...',
      'Ciência': 'Lembre-se do conceito...',
    };
    return hints[topic] || 'Pense no significado da pergunta...';
  }

  // Second hint: eliminate wrong answers
  if (attemptNumber === 2) {
    const wrongOption = options.find(o => o !== correctAnswer);
    if (wrongOption) {
      return `Não é "${wrongOption}"... Tente outra opção.`;
    }
    return 'Procure por padrões nas opções...';
  }

  // Third hint: more direct
  if (attemptNumber === 3) {
    return `A resposta começa com "${correctAnswer.charAt(0)}"...`;
  }

  // Final hint: almost the answer
  if (attemptNumber >= 4) {
    return `A resposta é: "${correctAnswer}"`;
  }

  return 'Tente novamente...';
}

/**
 * Generate contextual feedback based on answer correctness
 */
export function generateFeedback(context: FeedbackContext & { isCorrect: boolean; streak?: number }): string {
  if (context.isCorrect) {
    const messages = FEEDBACK_MESSAGES.correct.immediate;
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Add streak bonus message
    if (context.streak && context.streak in FEEDBACK_MESSAGES.correct.streak) {
      return `${message}\n${FEEDBACK_MESSAGES.correct.streak[context.streak as keyof typeof FEEDBACK_MESSAGES.correct.streak]}`;
    }

    return message;
  } else {
    const messages = FEEDBACK_MESSAGES.incorrect.encouraging;
    const message = messages[Math.floor(Math.random() * messages.length)];
    return `${message}\n\n${FEEDBACK_MESSAGES.incorrect.hint_available}`;
  }
}

/**
 * Generate explanation of why answer is correct/incorrect
 */
export function generateExplanation(context: FeedbackContext): string {
  const explanations: Record<string, (q: string, a: string) => string> = {
    'Números': () => `A resposta correta é ${context.correctAnswer}.`,
    'Operações': () => `Quando você realiza esta operação, o resultado é ${context.correctAnswer}.`,
    'Formas': () => `Uma ${context.topic.toLowerCase()} tem as características de ${context.correctAnswer}.`,
    'Cores': () => `${context.correctAnswer} é a cor certa para esta situação.`,
    'Animais': () => `O ${context.correctAnswer} é o animal certo para esta descrição.`,
  };

  // Default explanation
  const explanation = `A resposta correta é: **${context.correctAnswer}**

Você respondeu: **${context.studentAnswer}**

${context.studentAnswer !== context.correctAnswer ? 'Boa tentativa! Tente aprender a diferença entre as opções.' : 'Excelente! Mantém a concentração assim!'}`;

  return explanation;
}

/**
 * Generate encouragement based on performance
 */
export function generatePerformanceMessage(
  score: number,
  total: number,
  topic: string
): string {
  const percentage = (score / total) * 100;

  const messages = {
    excellent: [
      `🌟 Excelente em ${topic}! Continua assim!`,
      `👑 É um especialista em ${topic}!`,
      `🏆 Parabéns! Domina ${topic} muito bem!`,
    ],
    good: [
      `✅ Bom desempenho em ${topic}!`,
      `💪 Vai melhorando em ${topic}!`,
      `📚 Continua a estudar ${topic}!`,
    ],
    okay: [
      `🌱 ${topic} precisa de mais prática...`,
      `📖 Dedique mais tempo a ${topic}...`,
      `💡 Estude mais sobre ${topic}...`,
    ],
    needsHelp: [
      `❓ ${topic} é um desafio. Vamos recomeçar!`,
      `🤝 Precisa de ajuda em ${topic}...`,
      `📚 ${topic} requer mais dedicação...`,
    ],
  };

  let category: keyof typeof messages;
  if (percentage >= 85) category = 'excellent';
  else if (percentage >= 70) category = 'good';
  else if (percentage >= 50) category = 'okay';
  else category = 'needsHelp';

  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

/**
 * Get motivational message for daily practice
 */
export function getDailyMotivation(): string {
  const messages = [
    '🌅 Bom dia! Vamos aprender algo novo hoje?',
    '💫 Cada pergunta respondida é um passo para o sucesso!',
    '🎯 Hoje é um bom dia para praticar!',
    '🚀 Vamos começar? Você consegue!',
    '✨ A aprendizagem é uma aventura. Vamos começar!',
    '🌟 Quanto mais praticar, melhor fica!',
    '💪 Você tem tudo para conseguir!',
    '📚 Vamos expandir o seu conhecimento hoje!',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get milestone message
 */
export function getMilestoneMessage(quizzesCompleted: number): string | null {
  const milestones: Record<number, string> = {
    1: '🎉 Parabéns! Realizou o primeiro quiz!',
    5: '🔥 5 quizzes! Está a pegar no jeito!',
    10: '👏 10 quizzes! Que dedicação!',
    25: '⭐ 25 quizzes! É um estudante excepcional!',
    50: '👑 50 quizzes! Merecia uma coroa!',
    100: '🏆 100 quizzes! É um verdadeiro campeão!',
  };

  return milestones[quizzesCompleted] || null;
}
